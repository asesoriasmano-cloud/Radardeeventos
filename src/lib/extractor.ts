import { normalizar } from "@/lib/eventos";
import type { Sede } from "@/lib/types";

/**
 * Extractor heurístico local para el ingreso rápido de /fuentes.
 *
 * **No hay ningún modelo de lenguaje detrás.** Son expresiones regulares y
 * coincidencia contra el catálogo de sedes, ejecutadas en el navegador. Acierta
 * en avisos bien redactados y falla en los ambiguos; por eso todo lo que
 * devuelve cae en un formulario editable y nunca se guarda solo.
 */

export interface CamposExtraidos {
  titulo?: string;
  urlFuente?: string;
  sede?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estimadoAsistentes?: number;
  contactoNombre?: string;
  contactoCargo?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
}

export type CampoExtraido = keyof CamposExtraidos;

export interface ResultadoExtraccion {
  campos: CamposExtraidos;
  /** Campos que la heurística logró completar, para poder resaltarlos. */
  detectados: CampoExtraido[];
}

const MESES: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const NOMBRES_MES = Object.keys(MESES).join("|");

const CARGOS = [
  "gerente comercial",
  "gerente general",
  "gerente",
  "subgerente",
  "directora ejecutiva",
  "director ejecutivo",
  "directora",
  "director",
  "coordinadora de eventos",
  "coordinador de eventos",
  "coordinadora",
  "coordinador",
  "jefa de eventos",
  "jefe de eventos",
  "jefa",
  "jefe",
  "encargada de eventos",
  "encargado de eventos",
  "encargada",
  "encargado",
  "productora general",
  "productor general",
  "productora",
  "productor",
  "presidenta",
  "presidente",
  "secretaria ejecutiva",
  "secretario ejecutivo",
  "administradora",
  "administrador",
];

function aISO(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/**
 * Cuando el aviso omite el año, se asume el próximo cumplimiento de esa fecha:
 * un evento se anuncia antes de ocurrir, no después.
 */
function anioProbable(mes: number, dia: number, hoy: Date): number {
  const candidata = new Date(hoy.getFullYear(), mes - 1, dia);
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  return candidata < ayer ? hoy.getFullYear() + 1 : hoy.getFullYear();
}

function fechasDelTexto(texto: string, hoy: Date): string[] {
  const encontradas: string[] = [];
  const plano = normalizar(texto);

  // 12/03/2026, 12-03-2026, 12/03
  const numericas = /\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/g;
  for (const coincidencia of plano.matchAll(numericas)) {
    const dia = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]);
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12) continue;
    let anio = coincidencia[3] ? Number(coincidencia[3]) : undefined;
    if (anio !== undefined && anio < 100) anio += 2000;
    encontradas.push(aISO(anio ?? anioProbable(mes, dia, hoy), mes, dia));
  }

  // "del 12 al 14 de marzo de 2026", "12 y 13 de marzo"
  const rango = new RegExp(
    `\\b(\\d{1,2})\\s*(?:al|y|a|-)\\s*(\\d{1,2})\\s+de\\s+(${NOMBRES_MES})(?:\\s+(?:de|del)\\s+(\\d{4}))?`,
    "g",
  );
  const cubiertos = new Set<string>();
  for (const coincidencia of plano.matchAll(rango)) {
    const mes = MESES[coincidencia[3]];
    const inicio = Number(coincidencia[1]);
    const fin = Number(coincidencia[2]);
    const anio = coincidencia[4]
      ? Number(coincidencia[4])
      : anioProbable(mes, inicio, hoy);
    encontradas.push(aISO(anio, mes, inicio), aISO(anio, mes, fin));
    cubiertos.add(coincidencia[0]);
  }

  // "14 de marzo de 2026"
  const simple = new RegExp(
    `\\b(\\d{1,2})\\s+de\\s+(${NOMBRES_MES})(?:\\s+(?:de|del)\\s+(\\d{4}))?`,
    "g",
  );
  for (const coincidencia of plano.matchAll(simple)) {
    if ([...cubiertos].some((r) => r.includes(coincidencia[0]))) continue;
    const mes = MESES[coincidencia[2]];
    const dia = Number(coincidencia[1]);
    const anio = coincidencia[3]
      ? Number(coincidencia[3])
      : anioProbable(mes, dia, hoy);
    encontradas.push(aISO(anio, mes, dia));
  }

  return [...new Set(encontradas)].sort();
}

function tituloProbable(texto: string): string | undefined {
  const lineas = texto
    .split("\n")
    .map((linea) => linea.replace(/^[\s*•\-–—#>]+/, "").trim())
    .filter(Boolean);

  const candidata = lineas.find(
    (linea) => !/^https?:\/\//i.test(linea) && linea.length >= 8,
  );
  if (!candidata) return undefined;

  // Un párrafo entero no es un título: se corta en la primera frase.
  const corte = candidata.split(/(?<=[.;])\s/)[0];
  return (corte.length > 110 ? corte.slice(0, 110).trim() : corte).replace(
    /[.;]$/,
    "",
  );
}

function sedeProbable(texto: string, sedes: Sede[]): string | undefined {
  const plano = normalizar(texto);

  // Gana la coincidencia más larga: "Hotel Enjoy Antofagasta" antes que "Enjoy".
  const coincidencias = sedes
    .filter((sede) => plano.includes(normalizar(sede.nombre)))
    .sort((a, b) => b.nombre.length - a.nombre.length);
  if (coincidencias.length > 0) return coincidencias[0].nombre;

  const suelta = texto.match(
    /\b(?:en|sede|recinto|lugar)[:\s]+((?:Hotel|Centro|Casa|Parque|Espacio|Gimnasio|Estadio|Club|Medialuna|Explanada)[^.,;\n]{3,60})/i,
  );
  return suelta?.[1]?.trim();
}

function aforoProbable(texto: string): number | undefined {
  const patrones = [
    /(?:aforo|capacidad|asistencia|convocatoria)[^\d]{0,20}([\d.,]{2,9})/i,
    /([\d.,]{2,9})\s*(?:personas|asistentes|participantes|visitantes|cupos|inscritos)/i,
  ];

  for (const patron of patrones) {
    const coincidencia = texto.match(patron);
    if (!coincidencia) continue;
    // En es-CL el punto es separador de miles: "2.600" son dos mil seiscientos.
    const valor = Number(coincidencia[1].replace(/[.,\s]/g, ""));
    if (Number.isFinite(valor) && valor > 0) return valor;
  }
  return undefined;
}

function contactoProbable(texto: string): {
  nombre?: string;
  cargo?: string;
} {
  // La etiqueta ("Contacto:") puede venir capitalizada, pero el nombre en sí
  // se reconoce por sus mayúsculas: por eso el patrón no lleva la bandera `i`
  // y en cambio admite ambas grafías solo en la primera letra de la etiqueta.
  const nombre = texto.match(
    /(?:[Cc]ontacto|[Rr]esponsable|[Cc]oordinador(?:a)?|[Ee]ncargad[oa]|[Cc]onsultas? (?:a|con))[:\s]+((?:[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÜÑáéíóúüñ'-]+\s+){1,3}[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÜÑáéíóúüñ'-]+)/,
  )?.[1];

  const plano = normalizar(texto);
  const cargo = CARGOS.find((posible) => plano.includes(posible));

  return {
    nombre: nombre?.trim(),
    cargo: cargo ? cargo.charAt(0).toUpperCase() + cargo.slice(1) : undefined,
  };
}

/** Lee un texto o enlace pegado y propone valores para el formulario. */
export function extraerCampos(
  texto: string,
  sedes: Sede[],
  hoy = new Date(),
): ResultadoExtraccion {
  const campos: CamposExtraidos = {};

  campos.urlFuente = texto.match(/https?:\/\/[^\s<>"')]+/i)?.[0];
  campos.contactoEmail = texto.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];

  const telefono = texto.match(
    /(?:\+?56[\s.-]?)?(?:\(?\d{1,2}\)?[\s.-]?)?\d{4}[\s.-]?\d{4}\b/,
  )?.[0];
  campos.contactoTelefono = telefono?.trim();

  const fechas = fechasDelTexto(texto, hoy);
  if (fechas.length > 0) {
    campos.fechaInicio = fechas[0];
    if (fechas.length > 1) campos.fechaFin = fechas[fechas.length - 1];
  }

  campos.titulo = tituloProbable(texto);
  campos.sede = sedeProbable(texto, sedes);
  campos.estimadoAsistentes = aforoProbable(texto);

  const contacto = contactoProbable(texto);
  campos.contactoNombre = contacto.nombre;
  campos.contactoCargo = contacto.cargo;

  const detectados = (Object.keys(campos) as CampoExtraido[]).filter(
    (clave) => campos[clave] !== undefined && campos[clave] !== "",
  );

  return { campos, detectados };
}
