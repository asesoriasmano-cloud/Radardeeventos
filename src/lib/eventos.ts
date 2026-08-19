import {
  CATEGORIAS_EVENTO,
  ESTADOS_EVENTO,
  NIVELES_URGENCIA,
  TIPOS_ORGANIZADOR,
} from "@/lib/constants";
import type {
  AlertaInfo,
  ContactoClave,
  Evento,
  EventoEnriquecido,
  FiltrosEventos,
  NivelUrgencia,
  Orden,
  Organizador,
  Sede,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Fechas y urgencia
// ---------------------------------------------------------------------------

/**
 * Convierte a `Date` respetando el huso local.
 *
 * `new Date("2026-11-12")` se interpreta como medianoche **UTC** según la
 * norma: en Chile (UTC−3/−4) eso cae la tarde del día anterior y toda la
 * aplicación mostraba las fechas corridas un día. Las cadenas `YYYY-MM-DD` se
 * arman aquí componente a componente para que la fecha civil sea la misma.
 */
export function aFecha(valor: string | Date): Date {
  if (valor instanceof Date) return new Date(valor);

  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!soloFecha) return new Date(valor);

  return new Date(
    Number(soloFecha[1]),
    Number(soloFecha[2]) - 1,
    Number(soloFecha[3]),
  );
}

/** Medianoche local de la fecha dada. Evita que la hora contamine los restos. */
export function aMedianoche(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

const MS_POR_DIA = 86_400_000;

/** Días calendario entre hoy y la fecha dada. Negativo si ya pasó. */
export function diasHasta(fecha: string | Date, hoy = new Date()): number {
  const objetivo = aMedianoche(aFecha(fecha));
  return Math.round(
    (objetivo.getTime() - aMedianoche(hoy).getTime()) / MS_POR_DIA,
  );
}

/**
 * Deriva el nivel de urgencia a partir de los días restantes.
 * Fuente única de verdad de los umbrales: no reimplementar en componentes.
 */
export function nivelPorDias(dias: number): NivelUrgencia {
  if (dias < NIVELES_URGENCIA.urgente.maxDias) return "urgente";
  if (dias <= NIVELES_URGENCIA.proximo.maxDias) return "proximo";
  return "planificacion";
}

export function calcularAlerta(evento: Evento, hoy = new Date()): AlertaInfo {
  const diasRestantes = diasHasta(evento.fechaInicio, hoy);
  return { diasRestantes, nivelUrgencia: nivelPorDias(diasRestantes) };
}

/** Texto del contador regresivo. */
export function textoCuentaRegresiva(dias: number): string {
  if (dias < 0) return `Hace ${Math.abs(dias)} d`;
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  return `En ${dias} días`;
}

// ---------------------------------------------------------------------------
// Formateo
// ---------------------------------------------------------------------------

const FORMATO_FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const FORMATO_DIA = new Intl.DateTimeFormat("es-CL", { day: "2-digit" });
const FORMATO_MES = new Intl.DateTimeFormat("es-CL", { month: "short" });
const FORMATO_NUMERO = new Intl.NumberFormat("es-CL");

export function formatearFecha(fecha: string | Date): string {
  return FORMATO_FECHA.format(aFecha(fecha));
}

export function partesFecha(fecha: string | Date) {
  const valor = aFecha(fecha);
  return {
    dia: FORMATO_DIA.format(valor),
    mes: FORMATO_MES.format(valor).replace(".", "").toUpperCase(),
    anio: String(valor.getFullYear()),
  };
}

/** Rango legible: colapsa el mes cuando inicio y fin caen en el mismo. */
export function formatearRango(inicio: string, fin: string): string {
  const a = aFecha(inicio);
  const b = aFecha(fin);
  if (a.toDateString() === b.toDateString()) return formatearFecha(a);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${FORMATO_DIA.format(a)} al ${formatearFecha(b)}`;
  }
  return `${formatearFecha(a)} — ${formatearFecha(b)}`;
}

export function formatearNumero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}

/** Concuerda un sustantivo con su cantidad: `pluralizar(1, "evento")`. */
export function pluralizar(
  cantidad: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${FORMATO_NUMERO.format(cantidad)} ${cantidad === 1 ? singular : plural}`;
}

/** Normaliza para búsquedas: minúsculas y sin tildes. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

// ---------------------------------------------------------------------------
// Contacto
// ---------------------------------------------------------------------------

/** Deja el número en formato E.164 sin signos, apto para wa.me. */
export function numeroWhatsApp(telefono: string): string {
  return telefono.replace(/[^\d]/g, "");
}

export function enlaceWhatsApp(
  contacto: ContactoClave,
  evento: Evento,
): string {
  const mensaje = `Hola ${contacto.nombreResponsable.split(" ")[0]}, escribo por "${evento.titulo}".`;
  return `https://wa.me/${numeroWhatsApp(contacto.telefonoCelular ?? "")}?text=${encodeURIComponent(mensaje)}`;
}

/** Un contacto es accionable si permite llamar/escribir sin más investigación. */
export function contactoAccionable(contacto: ContactoClave): boolean {
  return Boolean(contacto.telefonoCelular || contacto.email);
}

/** Qué le falta a un evento para poder gestionarlo. Vacío = listo para contactar. */
export function brechasDeContacto(evento: EventoEnriquecido): string[] {
  if (evento.contactos.length === 0) return ["Sin contacto identificado"];

  const brechas: string[] = [];
  if (!evento.contactos.some((c) => c.telefonoCelular))
    brechas.push("Sin celular");
  if (!evento.contactos.some((c) => c.email))
    brechas.push("Sin correo directo");
  if (!evento.contactos.some((c) => c.verificado))
    brechas.push("Sin verificar");
  return brechas;
}

// ---------------------------------------------------------------------------
// Enriquecimiento, filtrado y orden
// ---------------------------------------------------------------------------

export function enriquecerEvento(
  evento: Evento,
  sedes: Map<string, Sede>,
  organizadores: Map<string, Organizador>,
  contactos: Map<string, ContactoClave>,
  hoy = new Date(),
): EventoEnriquecido {
  const sede = sedes.get(evento.sedeId);
  const organizador = organizadores.get(evento.organizadorId);

  if (!sede) throw new Error(`Sede no encontrada: ${evento.sedeId}`);
  if (!organizador) {
    throw new Error(`Organizador no encontrado: ${evento.organizadorId}`);
  }

  const relacionados = evento.contactoIds
    .map((id) => contactos.get(id))
    .filter((c): c is ContactoClave => Boolean(c));

  return {
    ...evento,
    sede,
    organizador,
    contactos: relacionados,
    contactoPrincipal: relacionados[0],
    alerta: calcularAlerta(evento, hoy),
  };
}

export function filtrarEventos(
  eventos: EventoEnriquecido[],
  filtros: FiltrosEventos,
): EventoEnriquecido[] {
  const busqueda = normalizar(filtros.busqueda.trim());

  return eventos.filter((evento) => {
    if (
      filtros.categorias.length > 0 &&
      !filtros.categorias.includes(evento.categoria)
    ) {
      return false;
    }

    if (filtros.ciudad !== "todas" && evento.sede.ciudad !== filtros.ciudad) {
      return false;
    }

    const [aforoMin, aforoMax] = filtros.aforo;
    if (
      evento.estimadoAsistentes < aforoMin ||
      evento.estimadoAsistentes > aforoMax
    ) {
      return false;
    }

    // El evento debe solaparse con el rango pedido, no estar contenido en él.
    if (filtros.desde && aFecha(evento.fechaFin) < aMedianoche(filtros.desde)) {
      return false;
    }
    if (
      filtros.hasta &&
      aFecha(evento.fechaInicio) > aMedianoche(filtros.hasta)
    ) {
      return false;
    }

    if (busqueda) {
      const indice = normalizar(
        [
          evento.titulo,
          evento.descripcion ?? "",
          evento.sede.nombre,
          evento.sede.ciudad,
          evento.organizador.nombre,
          evento.contactos.map((c) => c.nombreResponsable).join(" "),
          evento.etiquetas.join(" "),
        ].join(" "),
      );
      if (!indice.includes(busqueda)) return false;
    }

    return true;
  });
}

export function ordenarEventos(
  eventos: EventoEnriquecido[],
  orden: Orden,
): EventoEnriquecido[] {
  const factor = orden.direccion === "asc" ? 1 : -1;
  const colator = new Intl.Collator("es-CL", { sensitivity: "base" });

  return [...eventos].sort((a, b) => {
    switch (orden.columna) {
      case "fechaInicio":
        return (
          factor *
          (aFecha(a.fechaInicio).getTime() - aFecha(b.fechaInicio).getTime())
        );
      case "estimadoAsistentes":
        return factor * (a.estimadoAsistentes - b.estimadoAsistentes);
      case "titulo":
        return factor * colator.compare(a.titulo, b.titulo);
      case "ciudad":
        return factor * colator.compare(a.sede.ciudad, b.sede.ciudad);
      case "organizador":
        return (
          factor * colator.compare(a.organizador.nombre, b.organizador.nombre)
        );
      default:
        return 0;
    }
  });
}

// ---------------------------------------------------------------------------
// Exportación
// ---------------------------------------------------------------------------

const COLUMNAS_CSV = [
  "Fecha inicio",
  "Fecha fin",
  "Evento",
  "Categoría",
  "Estado",
  "Ciudad",
  "Sede",
  "Dirección",
  "Aforo estimado",
  "Organizador",
  "Tipo organizador",
  "Contacto",
  "Cargo",
  "Celular",
  "Email",
  "Red social",
  "Contacto verificado",
  "Días restantes",
  "Urgencia",
];

function celda(valor: string | number): string {
  const texto = String(valor ?? "");
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** CSV con separador `;`, que es lo que Excel en es-CL espera. */
export function eventosACsv(eventos: EventoEnriquecido[]): string {
  const filas = eventos.map((e) =>
    [
      e.fechaInicio,
      e.fechaFin,
      e.titulo,
      CATEGORIAS_EVENTO[e.categoria].etiqueta,
      ESTADOS_EVENTO[e.estado].etiqueta,
      e.sede.ciudad,
      e.sede.nombre,
      e.sede.direccion,
      e.estimadoAsistentes,
      e.organizador.nombre,
      TIPOS_ORGANIZADOR[e.organizador.tipo].etiqueta,
      e.contactoPrincipal?.nombreResponsable ?? "",
      e.contactoPrincipal?.cargo ?? "",
      e.contactoPrincipal?.telefonoCelular ?? "",
      e.contactoPrincipal?.email ?? "",
      e.contactoPrincipal?.redSocial?.url ?? "",
      e.contactoPrincipal ? (e.contactoPrincipal.verificado ? "Sí" : "No") : "",
      e.alerta.diasRestantes,
      NIVELES_URGENCIA[e.alerta.nivelUrgencia].etiqueta,
    ]
      .map(celda)
      .join(";"),
  );

  return [COLUMNAS_CSV.join(";"), ...filas].join("\r\n");
}

export function descargarCsv(nombreArchivo: string, contenido: string) {
  // BOM para que Excel reconozca UTF-8 y no rompa las tildes.
  const blob = new Blob([`﻿${contenido}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
