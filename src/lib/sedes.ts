import { NIVELES_ACTIVIDAD, TIPOS_SEDE } from "@/lib/constants";
import { aFecha, aMedianoche } from "@/lib/eventos";
import type {
  EventoEnriquecido,
  FamiliaSede,
  NivelActividad,
  Sede,
} from "@/lib/types";

/** Horizonte del calendario de ocupación de cada sede. */
export const HORIZONTE_OCUPACION = 60;

export interface SedeEnriquecida {
  sede: Sede;
  familia: FamiliaSede;

  /** Todo lo detectado en el recinto, del más reciente al más antiguo. */
  eventos: EventoEnriquecido[];
  /** Confirmados dentro de los próximos 60 días, del más cercano al más lejano. */
  ocupacionProxima: EventoEnriquecido[];
  /** Ediciones ya realizadas. */
  historicos: EventoEnriquecido[];
  /** Eventos que ocurren dentro del mes calendario en curso. */
  eventosDelMes: EventoEnriquecido[];

  asistentesHistoricos: number;
  asistentesProximos: number;
  /** Jornadas ocupadas dentro del horizonte, contando eventos de varios días. */
  diasOcupados: number;

  actividad: NivelActividad;
  /** 0–100. Posición relativa dentro del conjunto evaluado. */
  puntajeActividad: number;
}

/**
 * El semáforo compara cada sede contra el resto del conjunto, no contra
 * umbrales absolutos: "alta concentración" significa alta *para este radar*,
 * y así el indicador sigue siendo útil aunque cambie la escala de los datos.
 */
function nivelPorPuntaje(puntaje: number): NivelActividad {
  if (puntaje >= 66) return "alta";
  if (puntaje >= 33) return "media";
  return "baja";
}

function ocurreEnElMes(evento: EventoEnriquecido, hoy: Date): boolean {
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return (
    aFecha(evento.fechaFin) >= inicioMes && aFecha(evento.fechaInicio) <= finMes
  );
}

/** Jornadas distintas que el recinto tiene ocupadas dentro del horizonte. */
function contarDiasOcupados(
  eventos: EventoEnriquecido[],
  horizonte: number,
  hoy: Date,
): number {
  const base = aMedianoche(hoy);
  const limite = new Date(base);
  limite.setDate(base.getDate() + horizonte);

  const jornadas = new Set<string>();
  for (const evento of eventos) {
    const cursor = aMedianoche(aFecha(evento.fechaInicio));
    const fin = aMedianoche(aFecha(evento.fechaFin));
    while (cursor <= fin) {
      if (cursor >= base && cursor <= limite) {
        jornadas.add(cursor.toISOString().slice(0, 10));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return jornadas.size;
}

export function enriquecerSedes(
  sedes: Sede[],
  eventos: EventoEnriquecido[],
  hoy = new Date(),
): SedeEnriquecida[] {
  const porSede = new Map<string, EventoEnriquecido[]>();
  for (const evento of eventos) {
    const lista = porSede.get(evento.sedeId) ?? [];
    lista.push(evento);
    porSede.set(evento.sedeId, lista);
  }

  const parciales = sedes.map((sede) => {
    const propios = (porSede.get(sede.id) ?? [])
      .slice()
      .sort(
        (a, b) =>
          aFecha(b.fechaInicio).getTime() - aFecha(a.fechaInicio).getTime(),
      );

    const historicos = propios.filter((e) => e.alerta.diasRestantes < 0);
    const ocupacionProxima = propios
      // Se incluyen también los "en planificación": para efectos de ocupación
      // del recinto una fecha tentativa ya compromete el calendario. El estado
      // queda visible en cada fila para que la diferencia no se pierda.
      .filter(
        (e) =>
          e.alerta.diasRestantes >= 0 &&
          e.alerta.diasRestantes <= HORIZONTE_OCUPACION,
      )
      .sort((a, b) => a.alerta.diasRestantes - b.alerta.diasRestantes);

    return {
      sede,
      familia: TIPOS_SEDE[sede.tipo].familia,
      eventos: propios,
      ocupacionProxima,
      historicos,
      eventosDelMes: propios.filter((e) => ocurreEnElMes(e, hoy)),
      asistentesHistoricos: historicos.reduce(
        (suma, e) => suma + e.estimadoAsistentes,
        0,
      ),
      asistentesProximos: ocupacionProxima.reduce(
        (suma, e) => suma + e.estimadoAsistentes,
        0,
      ),
      diasOcupados: contarDiasOcupados(
        ocupacionProxima,
        HORIZONTE_OCUPACION,
        hoy,
      ),
    };
  });

  // El puntaje mezcla volumen de eventos y de público: un recinto con pocas
  // ferias masivas concentra tanto o más que uno con muchos seminarios chicos.
  const maxEventos = Math.max(1, ...parciales.map((p) => p.eventos.length));
  const maxAsistentes = Math.max(
    1,
    ...parciales.map((p) => p.asistentesHistoricos + p.asistentesProximos),
  );

  return parciales.map((parcial) => {
    const publico = parcial.asistentesHistoricos + parcial.asistentesProximos;
    const puntaje = Math.round(
      ((parcial.eventos.length / maxEventos) * 0.5 +
        (publico / maxAsistentes) * 0.5) *
        100,
    );

    return {
      ...parcial,
      puntajeActividad: puntaje,
      actividad: nivelPorPuntaje(puntaje),
    };
  });
}

// ---------------------------------------------------------------------------
// Agrupación
// ---------------------------------------------------------------------------

export interface GrupoCiudad {
  ciudad: string;
  region: string;
  sedes: SedeEnriquecida[];
  eventosDelMes: number;
  eventosProximos: number;
  comunas: string[];
}

/** Agrupa por ciudad y ordena por actividad del mes: primero donde pasan cosas. */
export function agruparPorCiudad(sedes: SedeEnriquecida[]): GrupoCiudad[] {
  const grupos = new Map<string, SedeEnriquecida[]>();
  for (const ficha of sedes) {
    const lista = grupos.get(ficha.sede.ciudad) ?? [];
    lista.push(ficha);
    grupos.set(ficha.sede.ciudad, lista);
  }

  return [...grupos.entries()]
    .map(([ciudad, lista]) => ({
      ciudad,
      region: lista[0].sede.region,
      sedes: lista.sort(
        (a, b) =>
          b.eventosDelMes.length - a.eventosDelMes.length ||
          b.puntajeActividad - a.puntajeActividad,
      ),
      eventosDelMes: lista.reduce(
        (suma, f) => suma + f.eventosDelMes.length,
        0,
      ),
      eventosProximos: lista.reduce(
        (suma, f) => suma + f.ocupacionProxima.length,
        0,
      ),
      comunas: [...new Set(lista.map((f) => f.sede.comuna))].sort(),
    }))
    .sort(
      (a, b) =>
        b.eventosDelMes - a.eventosDelMes ||
        b.eventosProximos - a.eventosProximos ||
        a.ciudad.localeCompare(b.ciudad, "es-CL"),
    );
}

export function agruparPorFamilia(
  sedes: SedeEnriquecida[],
): Map<FamiliaSede, SedeEnriquecida[]> {
  const grupos = new Map<FamiliaSede, SedeEnriquecida[]>();
  for (const ficha of sedes) {
    const lista = grupos.get(ficha.familia) ?? [];
    lista.push(ficha);
    grupos.set(ficha.familia, lista);
  }
  return grupos;
}

// ---------------------------------------------------------------------------
// Estadísticas y utilidades de presentación
// ---------------------------------------------------------------------------

export interface EstadisticasSedes {
  totalSedes: number;
  ciudades: number;
  sedesActivasEsteMes: number;
  eventosEsteMes: number;
  sedeLider?: SedeEnriquecida;
  aforoTotal: number;
}

export function calcularEstadisticasSedes(
  sedes: SedeEnriquecida[],
): EstadisticasSedes {
  const activas = sedes.filter((f) => f.eventosDelMes.length > 0);
  const lider = [...sedes].sort(
    (a, b) =>
      b.eventosDelMes.length - a.eventosDelMes.length ||
      b.puntajeActividad - a.puntajeActividad,
  )[0];

  return {
    totalSedes: sedes.length,
    ciudades: new Set(sedes.map((f) => f.sede.ciudad)).size,
    sedesActivasEsteMes: activas.length,
    eventosEsteMes: sedes.reduce((suma, f) => suma + f.eventosDelMes.length, 0),
    sedeLider: lider && lider.eventosDelMes.length > 0 ? lider : undefined,
    aforoTotal: sedes.reduce(
      (suma, f) => suma + (f.sede.capacidadMaxima ?? 0),
      0,
    ),
  };
}

/** "Región Metropolitana" no lleva "de"; el resto de las regiones sí. */
export function nombreRegion(region: string): string {
  return region === "Metropolitana"
    ? "Región Metropolitana"
    : `Región de ${region}`;
}

/** Etiqueta del rango de salones: "6 salones · 40 a 900 personas". */
export function descripcionSalones(sede: Sede): string | undefined {
  if (!sede.salones) return undefined;
  const { cantidad, capacidadMenor, capacidadMayor } = sede.salones;
  const menor = capacidadMenor.toLocaleString("es-CL");
  const mayor = capacidadMayor.toLocaleString("es-CL");
  return `${cantidad} ${cantidad === 1 ? "salón" : "salones"} · ${menor} a ${mayor} personas`;
}

export { NIVELES_ACTIVIDAD };
