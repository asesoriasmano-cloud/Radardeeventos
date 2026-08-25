/**
 * Persistencia de eventos en Supabase.
 * Guarda eventos, sedes, organizadores y contactos extraídos desde fuentes.
 */

import { supabase } from "@/lib/supabase/client";
import type { ContactoClave, Organizador, Sede } from "@/lib/types";
import type { EventoParaGuardar } from "./tipos";

/**
 * Obtiene o crea una sede en la BD.
 * Deduplica por nombre + ciudad, que es lo que identifica un recinto en la
 * práctica: dos hoteles distintos no comparten nombre dentro de una ciudad.
 */
export async function obtenerOCrearSede(sede: Sede): Promise<string> {
  const { data: existente } = await supabase
    .from("sedes")
    .select("id")
    .eq("nombre", sede.nombre)
    .eq("ciudad", sede.ciudad)
    .maybeSingle();

  if (existente) return existente.id;

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

/** Obtiene o crea un organizador en la BD. Deduplica por nombre. */
export async function obtenerOCrearOrganizador(
  organizador: Organizador
): Promise<string> {
  const { data: existente } = await supabase
    .from("organizadores")
    .select("id")
    .eq("nombre", organizador.nombre)
    .maybeSingle();

  if (existente) return existente.id;

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

  if (error) throw new Error(`Error guardando organizador: ${error.message}`);
  return nuevo.id;
}

/**
 * Obtiene o crea un contacto en la BD.
 *
 * Deduplica por correo cuando existe y por nombre cuando no: la ingesta muchas
 * veces identifica al responsable sin su dato directo, y buscar por `email = ""`
 * no encontraría nunca a esos contactos, duplicándolos en cada corrida.
 */
export async function obtenerOCrearContacto(
  contacto: ContactoClave,
  organizadorId: string
): Promise<string> {
  const consulta = supabase
    .from("contactos_clave")
    .select("id")
    .eq("organizador_id", organizadorId);

  const { data: existente } = await (contacto.email
    ? consulta.eq("email", contacto.email)
    : consulta.eq("nombre_responsable", contacto.nombreResponsable)
  ).maybeSingle();

  if (existente) return existente.id;

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
 * Verifica que la fuente exista antes de referenciarla.
 *
 * `eventos.fuente_id` es una FK contra `fuentes`, tabla que hoy está vacía: si
 * se insertara el id sin comprobarlo, cada evento fallaría por violación de
 * clave foránea. Hasta que se siembre `fuentes` desde `config.ts`, la
 * atribución queda en `null` en vez de tumbar la ingesta completa.
 */
async function resolverFuenteId(fuenteId?: string): Promise<string | null> {
  if (!fuenteId) return null;

  const { data } = await supabase
    .from("fuentes")
    .select("id")
    .eq("id", fuenteId)
    .maybeSingle();

  return data ? data.id : null;
}

/**
 * Guarda un evento con sus relaciones y devuelve su id definitivo.
 *
 * Las referencias del evento se reescriben con los ids que resolvió la BD: los
 * que traía el mapper son provisionales y apuntarían a filas que no existen
 * cuando la sede o el organizador ya estaban cargados.
 */
export async function guardarEvento(item: EventoParaGuardar): Promise<string> {
  const { evento, sede, organizador, contacto } = item;

  if (!sede) {
    throw new Error(`"${evento.titulo}": sin sede, no se puede ubicar`);
  }
  if (!organizador) {
    // `eventos.organizador_id` es NOT NULL, y un evento sin quién lo convoca no
    // sirve para prospectar: se descarta con un motivo legible.
    throw new Error(`"${evento.titulo}": sin organizador identificado`);
  }

  const sedeId = await obtenerOCrearSede(sede);
  const organizadorId = await obtenerOCrearOrganizador(organizador);

  const contactoIds: string[] = [];
  if (contacto) {
    contactoIds.push(await obtenerOCrearContacto(contacto, organizadorId));
  }

  // Deduplicación del evento: mismo título, misma fecha y mismo recinto.
  const { data: existente } = await supabase
    .from("eventos")
    .select("id")
    .eq("titulo", evento.titulo)
    .eq("fecha_inicio", evento.fechaInicio)
    .eq("sede_id", sedeId)
    .maybeSingle();

  if (existente) return existente.id;

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
        fuente_id: await resolverFuenteId(evento.fuenteId),
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
 * Un evento que falla no detiene al resto: se acumula su motivo y se sigue.
 */
export async function guardarEventos(items: EventoParaGuardar[]): Promise<{
  exitosos: number;
  fallidos: number;
  errores: Array<{ eventoId: string; error: string }>;
}> {
  const errores: Array<{ eventoId: string; error: string }> = [];
  let exitosos = 0;

  for (const item of items) {
    try {
      await guardarEvento(item);
      exitosos++;
    } catch (error) {
      errores.push({
        eventoId: item.evento.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { exitosos, fallidos: errores.length, errores };
}
