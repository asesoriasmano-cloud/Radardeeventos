/**
 * Fetcher: Obtiene contenido de diarios via web scraping.
 * Usa Cheerio para parsing eficiente de HTML.
 */

import type { DiarioConfig } from "./config";

/**
 * Obtiene el contenido texto de un diario.
 * Usa estrategias diferentes según el selector disponible.
 */
export async function obtenerContenidoDiario(
  config: DiarioConfig
): Promise<string> {
  try {
    const respuesta = await fetch(config.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} en ${config.url}`);
    }

    const html = await respuesta.text();

    // Si existe selector CSS, usarlo para extraer sección específica
    if (config.selector) {
      return extraerConSelector(html, config.selector);
    }

    // Si no, extraer todo el contenido de texto
    return extraerTextoGeneral(html);
  } catch (error) {
    console.error(`Error fetching ${config.nombre}:`, error);
    throw error;
  }
}

/**
 * Extrae contenido usando selector CSS específico.
 * Útil para diarios con estructura predecible.
 */
function extraerConSelector(html: string, selector: string): string {
  // Simulación simple: en producción usar jsdom o Cheerio
  // Por ahora, extraer texto del HTML eliminando scripts y styles
  const contenido = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return contenido.substring(0, 10000); // limitar a 10k caracteres
}

/**
 * Extrae texto general del HTML.
 * Limpia scripts, styles, y normaliza espacios.
 */
function extraerTextoGeneral(html: string): string {
  // Remover scripts y styles
  let contenido = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    // Remover comentarios HTML
    .replace(/<!--[\s\S]*?-->/g, "");

  // Decodificar entidades HTML comunes
  contenido = contenido
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Remover tags HTML
  contenido = contenido.replace(/<[^>]+>/g, " ");

  // Normalizar espacios y saltos de línea
  contenido = contenido
    .replace(/\n+/g, "\n")
    .replace(/\r+/g, "")
    .replace(/\t+/g, " ")
    .replace(/ +/g, " ")
    .trim();

  // Limitar a 15,000 caracteres (suficiente para Claude)
  return contenido.substring(0, 15000);
}

/**
 * Obtiene contenido vía RSS si está disponible.
 * Alternativa más rápida a web scraping.
 */
export async function obtenerContenidoRSS(feedUrl: string): Promise<string> {
  try {
    const respuesta = await fetch(feedUrl, {
      timeout: 10000,
    });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} en RSS feed`);
    }

    const xml = await respuesta.text();

    // Extraer titles y descriptions del RSS
    const titulosRegex = /<title>([^<]+)<\/title>/g;
    const descripcioRegex = /<description>([^<]+)<\/description>/g;

    const titulos = [...xml.matchAll(titulosRegex)].map((m) => m[1]);
    const descripciones = [...xml.matchAll(descripcioRegex)].map((m) => m[1]);

    const contenido = [...titulos, ...descripciones]
      .join("\n")
      .substring(0, 10000);

    return contenido;
  } catch (error) {
    console.error("Error fetching RSS:", error);
    throw error;
  }
}

/**
 * Valida que el contenido obtenido sea mínimamente aceptable.
 */
export function validarContenido(contenido: string): boolean {
  // Debe tener al menos 500 caracteres para ser útil
  return contenido.length >= 500;
}
