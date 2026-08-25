/**
 * Lectura de eventos desde Supabase.
 *
 * Devuelve `EventoEnriquecido`, que es el tipo que consumen las tarjetas y las
 * tablas: sede, organizador y contactos ya resueltos, más la alerta calculada.
 * `alerta` es derivada y nunca se persiste —se calcula aquí contra la fecha
 * actual—, igual que en `obtenerEventosEnriquecidos()` de `src/data/eventos.ts`.
 */

import { supabase } from "@/lib/supabase/client";
import { calcularAlerta } from "@/lib/eventos";
import type {
  ContactoClave,
  EventoEnriquecido,
  Organizador,
  Sede,
} from "@/lib/types";

/** Fila cruda de `contactos_clave`, en snake_case como la entrega Postgres. */
interface FilaContacto {
  id: string;
  organizador_id: string;
  nombre_responsable: string;
  cargo: string | null;
  telefono_celular: string | null;
  email: string | null;
  red_social_tipo: string | null;
  red_social_url: string | null;
  verificado: boolean | null;
}

function aContacto(fila: FilaContacto): ContactoClave {
  return {
    id: fila.id,
    organizadorId: fila.organizador_id,
    nombreResponsable: fila.nombre_responsable,
    cargo: fila.cargo ?? "",
    telefonoCelular: fila.telefono_celular ?? undefined,
    email: fila.email ?? undefined,
    redSocial:
      fila.red_social_tipo && fila.red_social_url
        ? {
            tipo: fila.red_social_tipo as "linkedin" | "instagram",
            url: fila.red_social_url,
          }
        : undefined,
    verificado: fila.verificado ?? false,
  };
}

/**
 * Obtiene todos los eventos de la BD con sus relaciones resueltas.
 *
 * Un evento cuya sede u organizador no se pueda resolver se descarta en vez de
 * emitirse a medias: `EventoEnriquecido` promete ambas entidades, y devolver un
 * objeto incompleto haría fallar a las tarjetas al leer `evento.sede.ciudad`.
 */
export async function obtenerEventosDeBD(): Promise<EventoEnriquecido[]> {
  const { data: eventosData, error: eventoError } = await supabase
    .from("eventos")
    .select(
      `
      id, titulo, descripcion, categoria, estado,
      fecha_inicio, fecha_fin, estimado_asistentes,
      sede_id, organizador_id, fuente_id,
      es_pago, url_oficial, etiquetas, detectado_en
    `
    )
    .order("fecha_inicio", { ascending: false });

  if (eventoError) throw eventoError;
  if (!eventosData || eventosData.length === 0) return [];

  const sedeIds = [...new Set(eventosData.map((e) => e.sede_id))];
  const orgIds = [...new Set(eventosData.map((e) => e.organizador_id))];
  const eventoIds = eventosData.map((e) => e.id);

  const [{ data: sedesData }, { data: orgsData }, { data: contactosData }] =
    await Promise.all([
      supabase.from("sedes").select("*").in("id", sedeIds),
      supabase.from("organizadores").select("*").in("id", orgIds),
      supabase.from("contactos_clave").select("*").in("organizador_id", orgIds),
    ]);

  const { data: eventoContactosData } = await supabase
    .from("evento_contactos")
    .select("evento_id, contacto_id")
    .in("evento_id", eventoIds);

  const sedesMap = new Map<string, Sede>(
    (sedesData ?? []).map((s) => [
      s.id,
      {
        id: s.id,
        nombre: s.nombre,
        tipo: s.tipo,
        ciudad: s.ciudad,
        comuna: s.comuna ?? s.ciudad,
        region: s.region ?? "",
        direccion: s.direccion ?? "",
        // `coordenadas` es obligatorio en el modelo. El mapper de ingesta aún no
        // geocodifica, así que (0,0) marca "sin ubicar" y el mapa conceptual de
        // /sedes las agrupa en el origen en vez de romperse.
        coordenadas: { lat: s.lat ?? 0, lng: s.lng ?? 0 },
        capacidadMaxima: s.capacidad_maxima ?? undefined,
        telefonoEventos: s.telefono_eventos ?? undefined,
        emailEventos: s.email_eventos ?? undefined,
        sitioWeb: s.sitio_web ?? undefined,
      },
    ])
  );

  const contactosPorId = new Map<string, ContactoClave>();
  const contactosPorOrg = new Map<string, ContactoClave[]>();

  for (const fila of (contactosData ?? []) as FilaContacto[]) {
    const contacto = aContacto(fila);
    contactosPorId.set(contacto.id, contacto);
    const delOrg = contactosPorOrg.get(contacto.organizadorId) ?? [];
    delOrg.push(contacto);
    contactosPorOrg.set(contacto.organizadorId, delOrg);
  }

  const orgsMap = new Map<string, Organizador>(
    (orgsData ?? []).map((o) => [
      o.id,
      {
        id: o.id,
        nombre: o.nombre,
        tipo: o.tipo,
        rubro: o.rubro ?? undefined,
        sitioWeb: o.sitio_web ?? undefined,
        notasInternas: o.notas_internas ?? undefined,
        contactoIds: (contactosPorOrg.get(o.id) ?? []).map((c) => c.id),
      },
    ])
  );

  const contactosPorEvento = new Map<string, string[]>();
  for (const ec of eventoContactosData ?? []) {
    const ids = contactosPorEvento.get(ec.evento_id) ?? [];
    ids.push(ec.contacto_id);
    contactosPorEvento.set(ec.evento_id, ids);
  }

  const enriquecidos: EventoEnriquecido[] = [];

  for (const e of eventosData) {
    const sede = sedesMap.get(e.sede_id);
    const organizador = orgsMap.get(e.organizador_id);

    if (!sede || !organizador) {
      console.warn(
        `Evento ${e.id} ("${e.titulo}") descartado: falta ${!sede ? "sede" : "organizador"}`
      );
      continue;
    }

    const contactoIds = contactosPorEvento.get(e.id) ?? [];
    const contactos = contactoIds
      .map((cId) => contactosPorId.get(cId))
      .filter((c): c is ContactoClave => c !== undefined);

    const evento = {
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion ?? "",
      categoria: e.categoria,
      estado: e.estado,
      fechaInicio: e.fecha_inicio,
      fechaFin: e.fecha_fin,
      estimadoAsistentes: e.estimado_asistentes ?? 0,
      sedeId: e.sede_id,
      organizadorId: e.organizador_id,
      contactoIds,
      urlOficial: e.url_oficial ?? undefined,
      esPago: e.es_pago ?? false,
      etiquetas: e.etiquetas ? e.etiquetas.split(",") : [],
      fuenteId: e.fuente_id ?? "",
      detectadoEn: e.detectado_en,
    };

    enriquecidos.push({
      ...evento,
      sede,
      organizador,
      contactos,
      // El principal es el primero del organizador, no el primero vinculado al
      // evento: es el criterio que usa el resto de la app para la tabla densa.
      contactoPrincipal: (contactosPorOrg.get(organizador.id) ?? [])[0],
      alerta: calcularAlerta(evento),
    });
  }

  return enriquecidos;
}
