/**
 * Persistencia de eventos en Supabase.
 * Guarda eventos, sedes, organizadores y contactos extraídos desde fuentes.
 */

import { supabase } from "@/lib/supabase/client";
import type {
  ContactoClave,
  Evento,
  Organizador,
  Sede,
} from "@/lib/types";

/**
 * Obtiene o crea una sede en la BD.
 * Retorna el ID de la sede (existente o nuevo).
 */
export async function obtenerOCrearSede(sede: Sede): Promise<string> {
  const { data: existente } = await supabase
    .from("sedes")
    .select("id")
    .eq("nombre", sede.nombre)
    .eq("ciudad", sede.ciudad)
    .single();

  if (existente) {
    return existente.id;
  }

  const { data: nuevo, error } = await supabase
    .from("sedes")
    .insert([
      {
        id: sede.id,
        nombre: sede.nombre,
        tipo: sede.tipo,
        ciudad: sede.ciudad,
        comuna: sede.comuna,
        region: sede.region,
        direccion: sede.direccion,
        lat: sede.coordenadas?.lat,
        lng: sede.coordenadas?.lng,
        capacidad_maxima: sede.capacidadMaxima,
        telefono_eventos: sede.telefonoEventos,
        email_eventos: sede.emailEventos,
        sitio_web: sede.sitioWeb,
      },
    ])
    .select("id")
    .single();

  if (error) throw new Error(`Error guardando sede: ${error.message}`);
  return nuevo.id;
}

/**
 * Obtiene o crea un organizador en la BD.
 */
export async function obtenerOCrearOrganizador(
  organizador: Organizador
): Promise<string> {
  const { data: existente } = await supabase
    .from("organizadores")
    .select("id")
    .eq("nombre", organizador.nombre)
    .single();

  if (existente) {
    return existente.id;
  }

  const { data: nuevo, error } = await supabase
    .from("organizadores")
    .insert([
      {
        id: organizador.id,
        nombre: organizador.nombre,
        rubro: organizador.rubro,
        tipo: organizador.tipo,
        sitio_web: organizador.sitioWeb,
        notas_internas: organizador.notasInternas,
      },
    ])
    .select("id")
    .single();

  if (error)
    throw new Error(`Error guardando organizador: ${error.message}`);
  return nuevo.id;
}

/**
 * Obtiene o crea un contacto en la BD.
 */
export async function obtenerOCrearContacto(
  contacto: ContactoClave,
  organizadorId: string
): Promise<string> {
  const { data: existente } = await supabase
    .from("contactos_clave")
    .select("id")
    .eq("organizador_id", organizadorId)
    .eq("email", contacto.email || "")
    .single();

  if (existente) {
    return existente.id;
  }

  const { data: nuevo, error } = await supabase
    .from("contactos_clave")
    .insert([
      {
        id: contacto.id,
        organizador_id: organizadorId,
        nombre_responsable: contacto.nombreResponsable,
        cargo: contacto.cargo,
        telefono_celular: contacto.telefonoCelular,
        email: contacto.email,
        red_social_tipo: contacto.redSocial?.tipo,
        red_social_url: contacto.redSocial?.url,
        verificado: contacto.verificado,
      },
    ])
    .select("id")
    .single();

  if (error) throw new Error(`Error guardando contacto: ${error.message}`);
  return nuevo.id;
}

/**
 * Guarda un evento y vincula sus contactos.
 */
export async function guardarEvento(evento: Evento): Promise<string> {
  // 1. Obtener/crear sede
  const sedeId = await obtenerOCrearSede(evento.sede);

  // 2. Obtener/crear organizador
  const organizadorId = await obtenerOCrearOrganizador(evento.organizador);

  // 3. Obtener/crear contactos
  const contactoIds: string[] = [];
  for (const contacto of evento.contactos) {
    const cId = await obtenerOCrearContacto(contacto, organizadorId);
    contactoIds.push(cId);
  }

  // 4. Verificar si el evento ya existe (por título + fecha + ciudad)
  const { data: existente } = await supabase
    .from("eventos")
    .select("id")
    .eq("titulo", evento.titulo)
    .eq("fecha_inicio", evento.fechaInicio)
    .eq("sede_id", sedeId)
    .single();

  if (existente) {
    return existente.id;
  }

  // 5. Insertar evento
  const { data: nuevoEvento, error: eventoError } = await supabase
    .from("eventos")
    .insert([
      {
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        categoria: evento.categoria,
        estado: evento.estado,
        fecha_inicio: evento.fechaInicio,
        fecha_fin: evento.fechaFin,
        estimado_asistentes: evento.estimadoAsistentes,
        sede_id: sedeId,
        organizador_id: organizadorId,
        fuente_id: evento.fuenteId,
        es_pago: evento.esPago,
        url_oficial: evento.urlOficial,
        etiquetas: evento.etiquetas?.join(","),
        detectado_en: evento.detectadoEn,
      },
    ])
    .select("id")
    .single();

  if (eventoError)
    throw new Error(`Error guardando evento: ${eventoError.message}`);

  // 6. Vincular contactos al evento
  if (contactoIds.length > 0) {
    const { error: vinculoError } = await supabase
      .from("evento_contactos")
      .insert(
        contactoIds.map((cId) => ({
          evento_id: nuevoEvento.id,
          contacto_id: cId,
        }))
      );

    if (vinculoError)
      throw new Error(`Error vinculando contactos: ${vinculoError.message}`);
  }

  return nuevoEvento.id;
}

/**
 * Guarda múltiples eventos en lote.
 */
export async function guardarEventos(eventos: Evento[]): Promise<{
  exitosos: number;
  fallidos: number;
  errores: Array<{ eventoId: string; error: string }>;
}> {
  const errores: Array<{ eventoId: string; error: string }> = [];
  let exitosos = 0;

  for (const evento of eventos) {
    try {
      await guardarEvento(evento);
      exitosos++;
    } catch (error) {
      fallidos++;
      errores.push({
        eventoId: evento.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    exitosos,
    fallidos: errores.length,
    errores,
  };
}
