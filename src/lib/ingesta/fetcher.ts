/**
 * Fetcher: obtiene el texto de una fuente para dárselo al extractor.
 *
 * El costo de la ingesta lo domina el tamaño del texto que se envía al modelo,
 * no el modelo mismo: una portada cruda son ~15.000 caracteres de los cuales la
 * enorme mayoría es navegación, publicidad y pie de página. Por eso el trabajo
 * de este módulo es tirar boilerplate antes de que nada llegue a la API.
 */

import * as cheerio from "cheerio";
import type { DiarioConfig } from "./config";

/** Corte de espera por fuente. Con 3 en paralelo, acota la corrida completa. */
const TIMEOUT_MS = 10_000;

/** Tope de caracteres que se le manda al modelo. */
const MAX_CARACTERES = 15_000;

/**
 * Piso para dar por bueno un recorte. Coincide con `validarContenido()`: por
 * debajo de esto la fuente se descarta igual, así que no tiene sentido quedarse
 * con un recorte específico que no llega.
 */
const MINIMO_UTIL = 500;

/**
 * Elementos que nunca contienen el anuncio de un evento.
 *
 * Se eliminan del árbol antes de extraer texto. Es una limpieza genérica a
 * propósito: mantener un selector por cada una de las 60 y tantas fuentes sería
 * imposible de sostener, y estos contenedores son estructura común de la web.
 */
const RUIDO = [
  "script",
  "style",
  "noscript",
  "nav",
  "header",
  "footer",
  "aside",
  "iframe",
  "svg",
  // Controles de formulario, no el `<form>` que los contiene: los sitios hechos
  // en ASP.NET WebForms —EMOL entre ellos— envuelven la página completa en un
  // único formulario, y quitarlo se llevaba el diario entero por delante.
  "input",
  "textarea",
  "button",
  "select",
  "[role=navigation]",
  "[role=banner]",
  "[role=contentinfo]",
  "[aria-hidden=true]",
].join(", ");

/**
 * Convierte HTML en texto limpio.
 *
 * Prueba varios recortes, del más específico al más amplio, y se queda con el
 * primero que traiga material suficiente. Evalúa **el texto que produce cada
 * candidato**, no si el elemento existe: hay sitios que traen un `<main>` vacío
 * que se rellena con JavaScript, y confiar en su presencia dejaría esa fuente
 * en blanco sin que nadie se entere.
 */
function extraerTexto(html: string, selector?: string): string {
  const $ = cheerio.load(html);
  $(RUIDO).remove();

  const normalizar = (t: string) =>
    t
      .replace(/ /g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim();

  const candidatos = [selector, "main, article", "body"].filter(
    (c): c is string => Boolean(c)
  );

  let mejor = "";

  for (const candidato of candidatos) {
    const texto = normalizar($(candidato).text());
    if (texto.length > mejor.length) mejor = texto;

    // Un recorte específico que ya trae material suficiente se prefiere por
    // sobre el body completo, aunque el body tuviera más caracteres: casi todo
    // ese excedente sería boilerplate que sobrevivió a la limpieza.
    if (texto.length >= MINIMO_UTIL) return texto.substring(0, MAX_CARACTERES);
  }

  return mejor.substring(0, MAX_CARACTERES);
}

/** Obtiene el contenido de texto de una fuente. */
export async function obtenerContenidoDiario(
  config: DiarioConfig
): Promise<string> {
  try {
    const respuesta = await fetch(config.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      // `fetch` no admite `timeout`; el corte va por señal de aborto.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} en ${config.url}`);
    }

    return extraerTexto(await respuesta.text(), config.selector);
  } catch (error) {
    console.error(`Error fetching ${config.nombre}:`, error);
    throw error;
  }
}

/**
 * Obtiene contenido vía RSS. Es la vía preferible cuando la fuente la ofrece:
 * el feed ya viene sin navegación ni publicidad, así que cuesta bastante menos
 * que raspar la portada.
 */
export async function obtenerContenidoRSS(feedUrl: string): Promise<string> {
  try {
    const respuesta = await fetch(feedUrl, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} en RSS feed`);
    }

    const xml = await respuesta.text();

    const titulos = [...xml.matchAll(/<title>([^<]+)<\/title>/g)].map(
      (m) => m[1]
    );
    const descripciones = [
      ...xml.matchAll(/<description>([^<]+)<\/description>/g),
    ].map((m) => m[1]);

    return [...titulos, ...descripciones]
      .join("\n")
      .substring(0, MAX_CARACTERES);
  } catch (error) {
    console.error("Error fetching RSS:", error);
    throw error;
  }
}

/** Valida que el contenido obtenido sea mínimamente aceptable. */
export function validarContenido(contenido: string): boolean {
  return contenido.length >= MINIMO_UTIL;
}
