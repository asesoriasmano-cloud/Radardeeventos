import { CATEGORIAS_EVENTO, NIVELES_URGENCIA } from "@/lib/constants";
import {
  aFecha,
  aMedianoche,
  brechasDeContacto,
  diasHasta,
  formatearFecha,
  formatearNumero,
  formatearRango,
  pluralizar,
} from "@/lib/eventos";
import type { BandaAlerta, EventoEnriquecido } from "@/lib/types";

// ---------------------------------------------------------------------------
// Bandas operativas del panel de alertas
// ---------------------------------------------------------------------------

/**
 * Las bandas agrupan la agenda en tres decisiones distintas. Son una capa de
 * presentación más gruesa que `NivelUrgencia` (que sigue mandando el color de
 * los badges): un evento a 25 días es "planificación" por urgencia y cae en la
 * "ventana de oportunidad" por banda.
 */
export const BANDAS: Record<
  BandaAlerta,
  {
    titulo: string;
    descripcion: string;
    rango: string;
    min: number;
    max: number;
    texto: string;
    fondo: string;
    borde: string;
    punto: string;
  }
> = {
  critica: {
    titulo: "Alertas Críticas",
    descripcion:
      "La ventana de contacto se cierra. Si falta el dato del organizador, es lo primero que hay que resolver hoy.",
    rango: "menos de 7 días",
    min: 0,
    max: 6,
    texto: "text-urgente",
    fondo: "bg-urgente-soft",
    borde: "border-urgente/50",
    punto: "bg-urgente",
  },
  oportunidad: {
    titulo: "Ventana de Oportunidad",
    descripcion:
      "Plazo realista para coordinar permisos, stands, presencia de marca o una ronda de prospección.",
    rango: "8 a 30 días",
    min: 7,
    max: 30,
    texto: "text-proximo",
    fondo: "bg-proximo-soft",
    borde: "border-proximo/50",
    punto: "bg-proximo",
  },
  mediano: {
    titulo: "Radar a Mediano Plazo",
    descripcion:
      "Congresos anuales, ferias macro y cumbres. Se siguen en segundo plano y se preparan con antelación.",
    rango: "más de 30 días",
    min: 31,
    max: Number.POSITIVE_INFINITY,
    texto: "text-planificacion",
    fondo: "bg-planificacion-soft",
    borde: "border-planificacion/50",
    punto: "bg-planificacion",
  },
};

export const ORDEN_BANDAS: BandaAlerta[] = [
  "critica",
  "oportunidad",
  "mediano",
];

export function bandaPorDias(dias: number): BandaAlerta {
  if (dias <= BANDAS.critica.max) return "critica";
  if (dias <= BANDAS.oportunidad.max) return "oportunidad";
  return "mediano";
}

export function agruparPorBanda(
  eventos: EventoEnriquecido[],
): Record<BandaAlerta, EventoEnriquecido[]> {
  const grupos: Record<BandaAlerta, EventoEnriquecido[]> = {
    critica: [],
    oportunidad: [],
    mediano: [],
  };

  for (const evento of eventos) {
    grupos[bandaPorDias(evento.alerta.diasRestantes)].push(evento);
  }

  for (const banda of ORDEN_BANDAS) {
    grupos[banda].sort(
      (a, b) => a.alerta.diasRestantes - b.alerta.diasRestantes,
    );
  }

  return grupos;
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export interface Kpis {
  /** Eventos que comienzan dentro de los próximos 15 días. */
  eventosProximos15: number;
  asistentesProximos15: number;

  /** Público estimado que se congrega durante el mes calendario en curso. */
  publicoDelMes: number;
  eventosDelMes: number;
  etiquetaMes: string;

  /** Cobertura de datos accionables sobre los eventos del alcance. */
  contactosTotales: number;
  contactosAccionables: number;
  porcentajeAccionable: number;
  eventosSinContacto: number;

  /** Ciudad con más eventos en el mes en curso. */
  ciudadLider?: {
    ciudad: string;
    eventos: number;
    asistentes: number;
    /** Participación sobre el total de eventos del mes. */
    participacion: number;
  };
}

const FORMATO_MES = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

/** Un evento cuenta en el mes si alguno de sus días cae dentro de él. */
function ocurreEnElMes(evento: EventoEnriquecido, hoy: Date): boolean {
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  return (
    aFecha(evento.fechaFin) >= inicioMes && aFecha(evento.fechaInicio) <= finMes
  );
}

export function calcularKpis(
  eventos: EventoEnriquecido[],
  hoy = new Date(),
): Kpis {
  const futuros = eventos.filter((e) => e.alerta.diasRestantes >= 0);

  const proximos15 = futuros.filter((e) => e.alerta.diasRestantes <= 15);
  const delMes = futuros.filter((e) => ocurreEnElMes(e, hoy));

  const contactos = eventos.flatMap((e) => e.contactos);
  const accionables = contactos.filter((c) => c.telefonoCelular || c.email);

  const porCiudad = new Map<string, { eventos: number; asistentes: number }>();
  for (const evento of delMes) {
    const actual = porCiudad.get(evento.sede.ciudad) ?? {
      eventos: 0,
      asistentes: 0,
    };
    actual.eventos += 1;
    actual.asistentes += evento.estimadoAsistentes;
    porCiudad.set(evento.sede.ciudad, actual);
  }

  const [ciudadLider] = [...porCiudad.entries()].sort(
    (a, b) => b[1].eventos - a[1].eventos || b[1].asistentes - a[1].asistentes,
  );

  return {
    eventosProximos15: proximos15.length,
    asistentesProximos15: proximos15.reduce(
      (suma, e) => suma + e.estimadoAsistentes,
      0,
    ),

    publicoDelMes: delMes.reduce((suma, e) => suma + e.estimadoAsistentes, 0),
    eventosDelMes: delMes.length,
    etiquetaMes: FORMATO_MES.format(hoy),

    contactosTotales: contactos.length,
    contactosAccionables: accionables.length,
    porcentajeAccionable:
      contactos.length === 0
        ? 0
        : Math.round((accionables.length / contactos.length) * 100),
    eventosSinContacto: eventos.filter((e) => e.contactos.length === 0).length,

    ciudadLider: ciudadLider
      ? {
          ciudad: ciudadLider[0],
          eventos: ciudadLider[1].eventos,
          asistentes: ciudadLider[1].asistentes,
          participacion:
            delMes.length === 0
              ? 0
              : Math.round((ciudadLider[1].eventos / delMes.length) * 100),
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Timeline: densidad día por día
// ---------------------------------------------------------------------------

export interface DiaTimeline {
  fecha: Date;
  iso: string;
  diasRestantes: number;
  esFinDeSemana: boolean;
  esHoy: boolean;
  /** Eventos que están en curso ese día (no solo los que comienzan). */
  eventos: EventoEnriquecido[];
  asistentes: number;
}

/**
 * Construye un día por cada jornada del horizonte, incluyendo los vacíos: la
 * ausencia de eventos es información —dice dónde hay espacio libre de agenda.
 */
export function construirTimeline(
  eventos: EventoEnriquecido[],
  horizonteDias: number,
  hoy = new Date(),
): DiaTimeline[] {
  const base = aMedianoche(hoy);
  const dias: DiaTimeline[] = [];

  for (let offset = 0; offset <= horizonteDias; offset++) {
    const fecha = new Date(base);
    fecha.setDate(base.getDate() + offset);
    const finDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;

    const delDia = eventos.filter((evento) => {
      const inicio = aMedianoche(aFecha(evento.fechaInicio));
      const fin = aMedianoche(aFecha(evento.fechaFin));
      return fecha >= inicio && fecha <= fin;
    });

    dias.push({
      fecha,
      iso: fecha.toISOString().slice(0, 10),
      diasRestantes: offset,
      esFinDeSemana: finDeSemana,
      esHoy: offset === 0,
      eventos: delDia,
      asistentes: delDia.reduce((suma, e) => suma + e.estimadoAsistentes, 0),
    });
  }

  return dias;
}

/** Jornadas con varios eventos simultáneos: riesgo de solapamiento de equipo. */
export function diasSaturados(dias: DiaTimeline[], minimo = 2): DiaTimeline[] {
  return dias.filter((dia) => dia.eventos.length >= minimo);
}

// ---------------------------------------------------------------------------
// Reporte semanal
// ---------------------------------------------------------------------------

export interface Reporte {
  titulo: string;
  generadoEn: string;
  texto: string;
  csv: string;
  eventos: EventoEnriquecido[];
}

const COLUMNAS_REPORTE = [
  "Banda",
  "Días restantes",
  "Urgencia",
  "Fecha",
  "Evento",
  "Categoría",
  "Ciudad",
  "Sede",
  "Aforo estimado",
  "Organizador",
  "Contacto",
  "Celular",
  "Email",
  "Brechas de contacto",
];

function celda(valor: string | number): string {
  const texto = String(valor ?? "");
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/**
 * Resumen accionable de los próximos `horizonteDias`, pensado para pegar en un
 * correo o en el canal del equipo comercial.
 */
export function generarReporte(
  eventos: EventoEnriquecido[],
  horizonteDias: number,
  ambito: string,
  hoy = new Date(),
): Reporte {
  const enRango = eventos
    .filter(
      (e) =>
        e.alerta.diasRestantes >= 0 && e.alerta.diasRestantes <= horizonteDias,
    )
    .sort((a, b) => a.alerta.diasRestantes - b.alerta.diasRestantes);

  const grupos = agruparPorBanda(enRango);
  const kpis = calcularKpis(enRango, hoy);
  const sinContacto = enRango.filter((e) => e.contactos.length === 0);

  const lineas: string[] = [];
  lineas.push(`RADAR DE EVENTOS — REPORTE DE ALERTAS`);
  lineas.push(`Ámbito: ${ambito} · Horizonte: próximos ${horizonteDias} días`);
  lineas.push(`Generado: ${formatearFecha(hoy)}`);
  lineas.push("");
  lineas.push("RESUMEN");
  lineas.push(`- Eventos en el horizonte: ${enRango.length}`);
  lineas.push(
    `- Público estimado acumulado: ${formatearNumero(
      enRango.reduce((s, e) => s + e.estimadoAsistentes, 0),
    )} asistentes`,
  );
  lineas.push(
    `- Contactos accionables: ${kpis.contactosAccionables} de ${kpis.contactosTotales} (${kpis.porcentajeAccionable}%)`,
  );
  if (sinContacto.length > 0) {
    lineas.push(
      `- Sin contacto identificado: ${pluralizar(sinContacto.length, "evento")} — requiere${
        sinContacto.length === 1 ? "" : "n"
      } investigación`,
    );
  }
  if (kpis.ciudadLider) {
    lineas.push(
      `- Ciudad más activa del mes: ${kpis.ciudadLider.ciudad} (${pluralizar(kpis.ciudadLider.eventos, "evento")})`,
    );
  }

  for (const banda of ORDEN_BANDAS) {
    const lista = grupos[banda];
    if (lista.length === 0) continue;

    lineas.push("");
    lineas.push(
      `${BANDAS[banda].titulo.toUpperCase()} (${BANDAS[banda].rango}) — ${lista.length}`,
    );

    for (const evento of lista) {
      const contacto = evento.contactoPrincipal;
      const brechas = brechasDeContacto(evento);

      lineas.push(
        `  · [${evento.alerta.diasRestantes}d] ${evento.titulo} — ${evento.sede.ciudad}, ${evento.sede.nombre}`,
      );
      lineas.push(
        `      ${formatearRango(evento.fechaInicio, evento.fechaFin)} · ${
          CATEGORIAS_EVENTO[evento.categoria].etiqueta
        } · ${formatearNumero(evento.estimadoAsistentes)} asistentes`,
      );
      lineas.push(`      Organiza: ${evento.organizador.nombre}`);
      lineas.push(
        contacto
          ? `      Contacto: ${contacto.nombreResponsable} (${contacto.cargo}) · ${
              contacto.telefonoCelular ?? "sin celular"
            } · ${contacto.email ?? "sin correo"}`
          : `      Contacto: NO IDENTIFICADO`,
      );
      if (brechas.length > 0) {
        lineas.push(`      Pendiente: ${brechas.join(", ")}`);
      }
    }
  }

  const filas = enRango.map((e) =>
    [
      BANDAS[bandaPorDias(e.alerta.diasRestantes)].titulo,
      e.alerta.diasRestantes,
      NIVELES_URGENCIA[e.alerta.nivelUrgencia].etiqueta,
      formatearRango(e.fechaInicio, e.fechaFin),
      e.titulo,
      CATEGORIAS_EVENTO[e.categoria].etiqueta,
      e.sede.ciudad,
      e.sede.nombre,
      e.estimadoAsistentes,
      e.organizador.nombre,
      e.contactoPrincipal?.nombreResponsable ?? "",
      e.contactoPrincipal?.telefonoCelular ?? "",
      e.contactoPrincipal?.email ?? "",
      brechasDeContacto(e).join(" / "),
    ]
      .map(celda)
      .join(";"),
  );

  return {
    titulo: `Reporte de alertas — ${ambito}`,
    generadoEn: formatearFecha(hoy),
    texto: lineas.join("\n"),
    csv: [COLUMNAS_REPORTE.join(";"), ...filas].join("\r\n"),
    eventos: enRango,
  };
}

/** Reexportado por comodidad: el timeline y el reporte comparten este helper. */
export { diasHasta };
