import {
  ANTICIPACION_MAX,
  CATEGORIAS,
  CLAVE_CONFIGURACION,
  CONFIGURACION_POR_DEFECTO,
} from "@/lib/constants";
import { formatearFecha, formatearNumero } from "@/lib/eventos";
import type {
  CategoriaEvento,
  ConfiguracionAlertas,
  EventoEnriquecido,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Persistencia
// ---------------------------------------------------------------------------

/**
 * La configuración vive en `localStorage`, no en un servidor: es una decisión
 * de alcance de la maqueta, y la vista lo dice de forma explícita para que
 * nadie asuma que las reglas quedaron publicadas para todo el equipo.
 */
export function cargarConfiguracion(): ConfiguracionAlertas {
  if (typeof window === "undefined") return CONFIGURACION_POR_DEFECTO;

  try {
    const guardado = window.localStorage.getItem(CLAVE_CONFIGURACION);
    if (!guardado) return CONFIGURACION_POR_DEFECTO;
    const parseado = JSON.parse(guardado) as Partial<ConfiguracionAlertas>;
    // Se fusiona con los valores por defecto: una versión anterior del objeto
    // guardado no debe dejar campos nuevos en `undefined`.
    return { ...CONFIGURACION_POR_DEFECTO, ...parseado };
  } catch {
    return CONFIGURACION_POR_DEFECTO;
  }
}

export function guardarConfiguracion(
  configuracion: ConfiguracionAlertas,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CLAVE_CONFIGURACION,
    JSON.stringify(configuracion),
  );
}

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

/** Problemas que impiden guardar. Vacío = configuración coherente. */
export function validarConfiguracion(
  configuracion: ConfiguracionAlertas,
): string[] {
  const problemas: string[] = [];

  if (configuracion.recordatorioDias >= configuracion.avisoPrincipalDias) {
    problemas.push(
      "El recordatorio debe caer después del aviso principal, es decir con menos días de anticipación.",
    );
  }
  if (configuracion.avisoPrincipalDias > ANTICIPACION_MAX) {
    problemas.push(
      `El aviso principal no puede superar los ${ANTICIPACION_MAX} días.`,
    );
  }
  if (configuracion.categorias.length === 0) {
    problemas.push("Sin categorías vigiladas no se dispararía ninguna alerta.");
  }
  if (configuracion.canales.length === 0) {
    problemas.push("Hay que dejar al menos un canal de notificación.");
  }
  if (!configuracion.plantillaWhatsApp.trim()) {
    problemas.push("La plantilla de WhatsApp está vacía.");
  }
  if (!configuracion.plantillaCorreo.trim()) {
    problemas.push("La plantilla de correo está vacía.");
  }

  return problemas;
}

// ---------------------------------------------------------------------------
// Simulación de impacto
// ---------------------------------------------------------------------------

export interface ImpactoConfiguracion {
  /** Eventos que aún no ocurren. Denominador de todo lo demás. */
  vigentes: number;
  /** Pasan el filtro de categoría y de aforo. */
  notificables: EventoEnriquecido[];
  descartadosPorAforo: number;
  descartadosPorCategoria: number;
  /** Notificables dentro de la ventana del aviso principal. */
  enVentanaAviso: EventoEnriquecido[];
  /** Notificables dentro de la ventana del recordatorio. */
  enRecordatorio: EventoEnriquecido[];
  /** Los que caen justo hoy en un umbral: son los que se despacharían. */
  disparosHoy: Array<{
    evento: EventoEnriquecido;
    motivo: "aviso" | "recordatorio";
  }>;
}

export function pasaFiltros(
  evento: EventoEnriquecido,
  configuracion: ConfiguracionAlertas,
): boolean {
  return (
    configuracion.categorias.includes(evento.categoria) &&
    evento.estimadoAsistentes >= configuracion.aforoMinimo
  );
}

/** Qué haría el sistema hoy con estas reglas, contra los datos reales. */
export function simularImpacto(
  eventos: EventoEnriquecido[],
  configuracion: ConfiguracionAlertas,
): ImpactoConfiguracion {
  const vigentes = eventos.filter((evento) => evento.alerta.diasRestantes >= 0);

  const porCategoria = vigentes.filter((evento) =>
    configuracion.categorias.includes(evento.categoria),
  );
  const notificables = porCategoria.filter(
    (evento) => evento.estimadoAsistentes >= configuracion.aforoMinimo,
  );

  const disparosHoy: ImpactoConfiguracion["disparosHoy"] = [];
  for (const evento of notificables) {
    if (evento.alerta.diasRestantes === configuracion.avisoPrincipalDias) {
      disparosHoy.push({ evento, motivo: "aviso" });
    } else if (evento.alerta.diasRestantes === configuracion.recordatorioDias) {
      disparosHoy.push({ evento, motivo: "recordatorio" });
    }
  }

  return {
    vigentes: vigentes.length,
    notificables,
    descartadosPorCategoria: vigentes.length - porCategoria.length,
    descartadosPorAforo: porCategoria.length - notificables.length,
    enVentanaAviso: notificables.filter(
      (evento) =>
        evento.alerta.diasRestantes <= configuracion.avisoPrincipalDias,
    ),
    enRecordatorio: notificables.filter(
      (evento) => evento.alerta.diasRestantes <= configuracion.recordatorioDias,
    ),
    disparosHoy: disparosHoy.sort(
      (a, b) => a.evento.alerta.diasRestantes - b.evento.alerta.diasRestantes,
    ),
  };
}

/**
 * Evento con el que se previsualiza la plantilla: el más cercano que además
 * tenga contacto utilizable, para que la vista previa muestre un caso real.
 */
export function eventoDeMuestra(
  eventos: EventoEnriquecido[],
  configuracion: ConfiguracionAlertas,
): EventoEnriquecido | undefined {
  const candidatos = eventos
    .filter((evento) => evento.alerta.diasRestantes >= 0)
    .sort((a, b) => a.alerta.diasRestantes - b.alerta.diasRestantes);

  return (
    candidatos.find(
      (evento) =>
        pasaFiltros(evento, configuracion) && evento.contactoPrincipal,
    ) ??
    candidatos.find((evento) => evento.contactoPrincipal) ??
    candidatos[0]
  );
}

// ---------------------------------------------------------------------------
// Plantillas
// ---------------------------------------------------------------------------

/** Sustituye las variables `{...}` de una plantilla contra un evento real. */
export function renderizarPlantilla(
  plantilla: string,
  evento: EventoEnriquecido,
): string {
  const contacto = evento.contactoPrincipal;
  const valores: Record<string, string> = {
    "{contacto}":
      contacto?.nombreResponsable.split(" ")[0] ?? "equipo organizador",
    "{organizacion}": evento.organizador.nombre,
    "{evento}": evento.titulo,
    "{fecha}": formatearFecha(evento.fechaInicio),
    "{dias}": String(Math.max(0, evento.alerta.diasRestantes)),
    "{sede}": evento.sede.nombre,
    "{ciudad}": evento.sede.ciudad,
    "{aforo}": formatearNumero(evento.estimadoAsistentes),
  };

  return Object.entries(valores).reduce(
    (texto, [clave, valor]) => texto.split(clave).join(valor),
    plantilla,
  );
}

/** Variables escritas en la plantilla que no existen: casi siempre un typo. */
export function variablesDesconocidas(plantilla: string): string[] {
  const conocidas = new Set([
    "{contacto}",
    "{organizacion}",
    "{evento}",
    "{fecha}",
    "{dias}",
    "{sede}",
    "{ciudad}",
    "{aforo}",
  ]);
  const usadas = plantilla.match(/\{[^{}\s]{1,30}\}/g) ?? [];
  return [...new Set(usadas.filter((variable) => !conocidas.has(variable)))];
}

export const TODAS_LAS_CATEGORIAS: CategoriaEvento[] = CATEGORIAS;
