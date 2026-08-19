import {
  aFecha,
  contactoAccionable,
  diasHasta,
  pluralizar,
} from "@/lib/eventos";
import type {
  EventoEnriquecido,
  FamiliaFuente,
  Fuente,
  EstadoFuente,
} from "@/lib/types";

/**
 * Una fuente activa se considera atrasada cuando lleva más de este múltiplo de
 * su propia cadencia sin correr. Un solo ciclo perdido puede ser normal; dos,
 * ya es señal de que el rastreo se está quedando ciego.
 */
export const FACTOR_ATRASO = 2;

export interface FuenteEnriquecida {
  fuente: Fuente;
  /** Eventos del radar atribuidos a esta fuente. */
  eventos: EventoEnriquecido[];
  /** Los que aún no ocurren. */
  vigentes: EventoEnriquecido[];
  /** Eventos cuyo organizador quedó con teléfono o correo utilizable. */
  conContacto: number;
  /**
   * Éxito en extracción de contactos, 0–100. `undefined` cuando la fuente
   * todavía no ha aportado eventos: sin denominador no hay tasa, y mostrar
   * "0 %" ahí sería mentir sobre su desempeño.
   */
  tasaExtraccion?: number;
  /**
   * Anticipación observada, en días, entre la detección y el inicio. Puede
   * superar la anticipación declarada del origen: un evento anunciado con
   * mucha antelación se detecta en cuanto se publica, no antes.
   */
  anticipacionMedia?: number;
  /** Minutos desde la última corrida. `undefined` si nunca corrió. */
  minutosDesdeSync?: number;
  /** Activa pero fuera de cadencia. */
  atrasada: boolean;
}

function promedio(valores: number[]): number | undefined {
  if (valores.length === 0) return undefined;
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
}

export function enriquecerFuentes(
  fuentes: Fuente[],
  eventos: EventoEnriquecido[],
  hoy = new Date(),
): FuenteEnriquecida[] {
  const porFuente = new Map<string, EventoEnriquecido[]>();
  for (const evento of eventos) {
    if (!evento.fuenteId) continue;
    const lista = porFuente.get(evento.fuenteId) ?? [];
    lista.push(evento);
    porFuente.set(evento.fuenteId, lista);
  }

  return fuentes.map((fuente) => {
    const propios = (porFuente.get(fuente.id) ?? [])
      .slice()
      .sort((a, b) => a.alerta.diasRestantes - b.alerta.diasRestantes);

    const conContacto = propios.filter((evento) =>
      evento.contactos.some(contactoAccionable),
    ).length;

    const anticipaciones = propios
      .filter((evento) => evento.detectadoEn)
      .map((evento) =>
        Math.max(
          0,
          diasHasta(evento.fechaInicio, aFecha(evento.detectadoEn as string)),
        ),
      );

    const minutosDesdeSync = fuente.ultimaEjecucion
      ? Math.max(
          0,
          Math.round(
            (hoy.getTime() - new Date(fuente.ultimaEjecucion).getTime()) /
              60_000,
          ),
        )
      : undefined;

    return {
      fuente,
      eventos: propios,
      vigentes: propios.filter((evento) => evento.alerta.diasRestantes >= 0),
      conContacto,
      tasaExtraccion:
        propios.length === 0
          ? undefined
          : Math.round((conContacto / propios.length) * 100),
      anticipacionMedia: promedio(anticipaciones),
      minutosDesdeSync,
      atrasada:
        fuente.estado === "activa" &&
        fuente.cadenciaMinutos > 0 &&
        minutosDesdeSync !== undefined &&
        minutosDesdeSync > fuente.cadenciaMinutos * FACTOR_ATRASO,
    };
  });
}

// ---------------------------------------------------------------------------
// Agrupación y estadísticas
// ---------------------------------------------------------------------------

export function agruparFuentesPorFamilia(
  fuentes: FuenteEnriquecida[],
): Map<FamiliaFuente, FuenteEnriquecida[]> {
  const grupos = new Map<FamiliaFuente, FuenteEnriquecida[]>();
  for (const ficha of fuentes) {
    const lista = grupos.get(ficha.fuente.familia) ?? [];
    lista.push(ficha);
    grupos.set(ficha.fuente.familia, lista);
  }
  return grupos;
}

export interface EstadisticasFuentes {
  total: number;
  porEstado: Record<EstadoFuente, number>;
  atrasadas: number;
  eventosDetectados: number;
  eventosConContacto: number;
  /** Tasa global de extracción de contactos, 0–100. */
  tasaGlobal: number;
  /** Minutos desde la sincronización más reciente de todo el sistema. */
  minutosUltimaSync?: number;
  /** Fuente que más eventos aportó al radar. */
  lider?: FuenteEnriquecida;
}

export function calcularEstadisticasFuentes(
  fuentes: FuenteEnriquecida[],
): EstadisticasFuentes {
  const eventosDetectados = fuentes.reduce((s, f) => s + f.eventos.length, 0);
  const eventosConContacto = fuentes.reduce((s, f) => s + f.conContacto, 0);

  const sincronizadas = fuentes
    .map((f) => f.minutosDesdeSync)
    .filter((m): m is number => m !== undefined);

  const lider = [...fuentes].sort(
    (a, b) => b.eventos.length - a.eventos.length,
  )[0];

  return {
    total: fuentes.length,
    porEstado: {
      activa: fuentes.filter((f) => f.fuente.estado === "activa").length,
      pausada: fuentes.filter((f) => f.fuente.estado === "pausada").length,
      con_error: fuentes.filter((f) => f.fuente.estado === "con_error").length,
    },
    atrasadas: fuentes.filter((f) => f.atrasada).length,
    eventosDetectados,
    eventosConContacto,
    tasaGlobal:
      eventosDetectados === 0
        ? 0
        : Math.round((eventosConContacto / eventosDetectados) * 100),
    minutosUltimaSync:
      sincronizadas.length > 0 ? Math.min(...sincronizadas) : undefined,
    lider: lider && lider.eventos.length > 0 ? lider : undefined,
  };
}

// ---------------------------------------------------------------------------
// Presentación
// ---------------------------------------------------------------------------

/** "hace 24 min", "hace 5 h", "hace 3 días". */
export function tiempoRelativo(minutos?: number): string {
  if (minutos === undefined) return "Sin corridas registradas";
  if (minutos < 1) return "Hace instantes";
  if (minutos < 60) return `Hace ${pluralizar(minutos, "minuto")}`;
  const horas = Math.round(minutos / 60);
  if (horas < 48) return `Hace ${pluralizar(horas, "hora")}`;
  return `Hace ${pluralizar(Math.round(horas / 24), "día")}`;
}

/** "Cada 60 min", "Cada 12 h", "A demanda". */
export function cadenciaLegible(minutos: number): string {
  if (minutos === 0) return "A demanda";
  if (minutos < 60) return `Cada ${minutos} min`;

  const horas = minutos / 60;
  if (horas === 1) return "Cada hora";
  if (horas < 24) return `Cada ${horas} h`;

  const dias = horas / 24;
  return dias === 1 ? "Cada día" : `Cada ${dias} días`;
}

export function coberturaLegible(cobertura: string[]): string {
  if (cobertura.includes("todas")) return "Cobertura nacional";
  return cobertura.join(" · ");
}
