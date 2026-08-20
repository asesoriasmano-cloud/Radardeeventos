/**
 * Lectura de eventos desde Supabase.
 * Resuelve todas las relaciones (sede, organizador, contactos).
 */

import { supabase } from "@/lib/supabase/client";
import type { ContactoClave, Evento, Organizador, Sede } from "@/lib/types";

/**
 * Obtiene todos los eventos de la BD con sus relaciones resueltas.
 */
export async function obtenerEventosDeBD(): Promise<Evento[]> {
  // 1. Obtener eventos
  const { data: eventosData, error: eventoError } = await supabase
    .from("eventos")
    .select(
      `
      id, titulo, descripcion, categoria, estado,
      fecha_inicio, fecha_fin, estimado_asistentes,
      sede_id, organizador_id, fuente_id,
      es_pago, url_oficial, etiquetas, detectado_en,
      created_at, updated_at
    `
    )
    .order("fecha_inicio", { ascending: false });

  if (eventoError) throw eventoError;
  if (!eventosData || eventosData.length === 0) return [];

  // 2. Obtener todas las sedes en un query
  const sedeIds = [...new Set(eventosData.map((e) => e.sede_id))];
  const { data: sedesData } = await supabase
    .from("sedes")
    .select("*")
    .in("id", sedeIds);

  const sedesMap = new Map(
    (sedesData || []).map((s) => [
      s.id,
      {
        id: s.id,
        nombre: s.nombre,
        tipo: s.tipo,
        ciudad: s.ciudad,
        comuna: s.comuna,
        region: s.region,
        direccion: s.direccion,
        coordenadas: s.lat && s.lng ? { lat: s.lat, lng: s.lng } : undefined,
        capacidadMaxima: s.capacidad_maxima,
        salones: undefined,
        telefonoEventos: s.telefono_eventos,
        emailEventos: s.email_eventos,
        sitioWeb: s.sitio_web,
      } as Sede,
    ])
  );

  // 3. Obtener todos los organizadores
  const orgIds = [...new Set(eventosData.map((e) => e.organizador_id))];
  const { data: orgsData } = await supabase
    .from("organizadores")
    .select("*")
    .in("id", orgIds);

  const { data: contactosData } = await supabase
    .from("contactos_clave")
    .select("*")
    .in("organizador_id", orgIds);

  const contactosPorOrg = new Map<string, ContactoClave[]>();
  (contactosData || []).forEach((c) => {
    if (!contactosPorOrg.has(c.organizador_id)) {
      contactosPorOrg.set(c.organizador_id, []);
    }
    contactosPorOrg.get(c.organizador_id)!.push({
      id: c.id,
      nombreResponsable: c.nombre_responsable,
      cargo: c.cargo,
      telefonoCelular: c.telefono_celular,
      email: c.email,
      redSocial: c.red_social_tipo
        ? {
            tipo: c.red_social_tipo as "linkedin" | "instagram",
            url: c.red_social_url,
          }
        : undefined,
      verificado: c.verificado,
    });
  });

  const orgsMap = new Map(
    (orgsData || []).map((o) => [
      o.id,
      {
        id: o.id,
        nombre: o.nombre,
        rubro: o.rubro,
        tipo: o.tipo,
        sitioWeb: o.sitio_web,
        notasInternas: o.notas_internas,
        contactoIds: (contactosPorOrg.get(o.id) || []).map((c) => c.id),
      } as Organizador,
    ])
  );

  // 4. Obtener evento_contactos
  const { data: eventoContactosData } = await supabase
    .from("evento_contactos")
    .select("evento_id, contacto_id")
    .in(
      "evento_id",
      eventosData.map((e) => e.id)
    );

  const contactosPorEvento = new Map<string, string[]>();
  (eventoContactosData || []).forEach((ec) => {
    if (!contactosPorEvento.has(ec.evento_id)) {
      contactosPorEvento.set(ec.evento_id, []);
    }
    contactosPorEvento.get(ec.evento_id)!.push(ec.contacto_id);
  });

  // 5. Armar eventos con relaciones resueltas
  return eventosData.map((e) => {
    const sede = sedesMap.get(e.sede_id)!;
    const organizador = orgsMap.get(e.organizador_id)!;
    const contactoIds = contactosPorEvento.get(e.id) || [];
    const contactos = contactoIds
      .map((cId) => (contactosData || []).find((c) => c.id === cId))
      .filter(Boolean)
      .map((c) => ({
        id: c!.id,
        nombreResponsable: c!.nombre_responsable,
        cargo: c!.cargo,
        telefonoCelular: c!.telefono_celular,
        email: c!.email,
        redSocial: c!.red_social_tipo
          ? {
              tipo: c!.red_social_tipo as "linkedin" | "instagram",
              url: c!.red_social_url,
            }
          : undefined,
        verificado: c!.verificado,
      })) as ContactoClave[];

    return {
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      categoria: e.categoria,
      estado: e.estado,
      fechaInicio: e.fecha_inicio,
      fechaFin: e.fecha_fin,
      estimadoAsistentes: e.estimado_asistentes,
      sedeId: e.sede_id,
      organizadorId: e.organizador_id,
      fuenteId: e.fuente_id,
      esPago: e.es_pago,
      urlOficial: e.url_oficial,
      etiquetas: e.etiquetas ? e.etiquetas.split(",") : [],
      detectadoEn: e.detectado_en,
      sede,
      organizador,
      contactoIds,
      contactos,
    } as Evento;
  });
}
