/**
 * Mapper: Convierte EventoExtraido al modelo Evento del Radar.
 * Maneja la creación/reutilización de Sede, Organizador, ContactoClave.
 */

import type {
  Evento,
  Sede,
  Organizador,
  ContactoClave,
  CategoriaEvento,
  TipoSede,
} from "@/lib/types";
import type { EventoExtraido } from "./tipos";

/**
 * Genera un ID opaco único.
 * En producción, esto vendría de una base de datos.
 */
export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mapea EventoExtraido → Evento del modelo Radar.
 * También retorna Sede y Organizador para que se creen si no existen.
 */
export function mapearEventoExtraido(
  eventoExtraido: EventoExtraido,
  fuenteId: string,
  ciudad: string
): {
  evento: Evento;
  sede: Sede | null;
  organizador: Organizador | null;
  contacto: ContactoClave | null;
} {
  const sedeId = generarId();
  const organizadorId = generarId();
  const contactoId = generarId();

  // Mapear categoría (validar que sea una de las 5 válidas)
  const categoriaMapeada: CategoriaEvento = mapearCategoria(
    eventoExtraido.categoria
  );

  // Crear Sede
  const sede: Sede | null = eventoExtraido.sede
    ? {
        id: sedeId,
        nombre: eventoExtraido.sede,
        tipo: inferirTipoSede(eventoExtraido.sede),
        ciudad: eventoExtraido.ciudad || ciudad,
        comuna: eventoExtraido.comuna || eventoExtraido.ciudad || "",
        region: inferirRegion(ciudad),
        direccion: eventoExtraido.ubicacion || "",
        coordenadas: { lat: 0, lng: 0 }, // placeholder
      }
    : null;

  // Crear Organizador
  const organizador: Organizador | null = eventoExtraido.organizador
    ? {
        id: organizadorId,
        nombre: eventoExtraido.organizador,
        tipo: "empresa_privada", // default
        contactoIds: eventoExtraido.contacto ? [contactoId] : [],
      }
    : null;

  // Crear Contacto
  const contacto: ContactoClave | null = eventoExtraido.contacto
    ? {
        id: contactoId,
        organizadorId: organizadorId,
        nombreResponsable: eventoExtraido.contacto.nombreResponsable || "",
        cargo: eventoExtraido.contacto.cargo || "",
        telefonoCelular: eventoExtraido.contacto.telefonoCelular,
        email: eventoExtraido.contacto.email,
        verificado: false,
      }
    : null;

  // Crear Evento
  const evento: Evento = {
    id: generarId(),
    titulo: eventoExtraido.titulo,
    descripcion: eventoExtraido.descripcion,
    categoria: categoriaMapeada,
    estado: "confirmado",
    fechaInicio: eventoExtraido.fechaInicio,
    fechaFin: eventoExtraido.fechaFin || eventoExtraido.fechaInicio,
    estimadoAsistentes: eventoExtraido.estimadoAsistentes || 0,
    sedeId: sede?.id || "",
    organizadorId: organizador?.id || "",
    contactoIds: contacto ? [contacto.id] : [],
    urlOficial: eventoExtraido.urlOriginal,
    esPago: false,
    etiquetas: [],
    fuenteId,
    detectadoEn: new Date().toISOString(),
  };

  return { evento, sede, organizador, contacto };
}

/**
 * Mapea la categoría de evento extraída a las 5 válidas del sistema.
 */
function mapearCategoria(categoria: string): CategoriaEvento {
  const categoria_limpia = categoria.toLowerCase().trim();

  if (categoria_limpia.includes("feria")) return "feria_industrial";
  if (
    categoria_limpia.includes("seminario") ||
    categoria_limpia.includes("congreso") ||
    categoria_limpia.includes("conferencia")
  )
    return "seminario_congreso";
  if (
    categoria_limpia.includes("exposicion") ||
    categoria_limpia.includes("expo") ||
    categoria_limpia.includes("muestra")
  )
    return "exposicion_comercial";
  if (
    categoria_limpia.includes("charla") ||
    categoria_limpia.includes("capacitacion") ||
    categoria_limpia.includes("taller")
  )
    return "charla_capacitacion";

  return "evento_publico"; // default
}

/**
 * Infiere el tipo de sede basándose en su nombre.
 * Heurísticas simples.
 */
function inferirTipoSede(nombreSede: string): TipoSede {
  const nombre = nombreSede.toLowerCase();

  if (nombre.includes("hotel")) return "hotel";
  if (nombre.includes("centro de convenciones") || nombre.includes("centro convenciones"))
    return "centro_convenciones";
  if (nombre.includes("recinto ferial") || nombre.includes("feria"))
    return "recinto_ferial";
  if (nombre.includes("estadio") || nombre.includes("espacio deportivo"))
    return "espacio_deportivo";
  if (nombre.includes("municipalidad") || nombre.includes("municipal"))
    return "municipal";
  if (nombre.includes("universidad") || nombre.includes("instituto"))
    return "universidad";

  return "otro";
}

/**
 * Infiere la región chilena basándose en la ciudad.
 * Mapeo simplificado (en producción, usar base de datos).
 */
function inferirRegion(ciudad: string): string {
  const ciudad_lower = ciudad.toLowerCase();

  const mapeo: Record<string, string> = {
    arica: "Arica y Parinacota",
    iquique: "Tarapacá",
    antofagasta: "Antofagasta",
    calama: "Antofagasta",
    "la serena": "Coquimbo",
    coquimbo: "Coquimbo",
    valparaiso: "Valparaíso",
    "viña del mar": "Valparaíso",
    "san antonio": "Valparaíso",
    santiago: "Metropolitana",
    rancagua: "O'Higgins",
    talca: "Maule",
    curicó: "Maule",
    chillan: "Ñuble",
    concepcion: "Biobío",
    "los angeles": "Biobío",
    temuco: "Araucanía",
    valdivia: "Los Ríos",
    "puerto montt": "Los Lagos",
    osorno: "Los Lagos",
    coyhaique: "Aysén",
    "punta arenas": "Magallanes",
  };

  for (const [clave, region] of Object.entries(mapeo)) {
    if (ciudad_lower.includes(clave)) {
      return region;
    }
  }

  return "Metropolitana"; // default
}

/**
 * Validaciones básicas antes de guardar.
 */
export function validarEventoMapeado(evento: Evento): {
  valido: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (!evento.titulo || evento.titulo.trim().length === 0) {
    errores.push("Título vacío");
  }

  if (!evento.fechaInicio || evento.fechaInicio.trim().length === 0) {
    errores.push("Fecha inicio vacía");
  }

  if (!evento.sedeId) {
    errores.push("Falta sede");
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
