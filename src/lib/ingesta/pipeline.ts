/**
 * Pipeline de Ingesta: Orquesta todo el flujo.
 * 1. Fetch contenido → 2. Extrae eventos (Claude) → 3. Mapea a modelo → 4. Valida
 */

import type { DiarioConfig } from "./config";
import { obtenerContenidoDiario, validarContenido } from "./fetcher";
import { extraerEventosDelTexto } from "./event-extractor";
import { mapearEventoExtraido, validarEventoMapeado } from "./mapper";
import type { ResultadoExtraccion, RegistroIngesta } from "./tipos";

export interface ResultadoPipeline {
  diarioId: string;
  diarioNombre: string;
  exitoso: boolean;
  eventosDetectados: number;
  eventosValidos: number;
  errores: string[];
  tiempoMs: number;
}

/**
 * Procesa un diario: obtiene contenido → extrae eventos → valida.
 * No persiste en BD (eso se hace en el endpoint).
 */
export async function procesarDiario(
  diarioConfig: DiarioConfig,
  fuenteId?: string
): Promise<{
  resultado: ResultadoPipeline;
  extraccion: ResultadoExtraccion | null;
  eventosValidos: any[];
}> {
  const inicio = Date.now();
  const errores: string[] = [];
  const eventosValidos: any[] = [];

  try {
    // 1. FETCH
    console.log(`[${diarioConfig.nombre}] Obteniendo contenido...`);
    const contenido = await obtenerContenidoDiario(diarioConfig);

    if (!validarContenido(contenido)) {
      throw new Error("Contenido obtenido insuficiente (<500 caracteres)");
    }

    // 2. EXTRACT
    console.log(`[${diarioConfig.nombre}] Extrayendo eventos con Claude...`);
    const extraccion = await extraerEventosDelTexto(contenido, diarioConfig);

    // 3. MAP & VALIDATE
    console.log(
      `[${diarioConfig.nombre}] Mapeando ${extraccion.eventos.length} eventos...`
    );

    for (const eventoExtraido of extraccion.eventos) {
      try {
        const { evento, sede, organizador, contacto } = mapearEventoExtraido(
          eventoExtraido,
          fuenteId || diarioConfig.id,
          extraccion.diarioNombre
        );

        const validacion = validarEventoMapeado(evento);
        if (!validacion.valido) {
          errores.push(
            `[${evento.titulo}] ${validacion.errores.join("; ")}`
          );
          continue;
        }

        eventosValidos.push({
          evento,
          sede,
          organizador,
          contacto,
          diarioId: diarioConfig.id,
          diarioNombre: diarioConfig.nombre,
        });
      } catch (error) {
        errores.push(
          `Error mapeando evento: ${error instanceof Error ? error.message : "desconocido"}`
        );
      }
    }

    const tiempoMs = Date.now() - inicio;

    return {
      resultado: {
        diarioId: diarioConfig.id,
        diarioNombre: diarioConfig.nombre,
        exitoso: errores.length === 0,
        eventosDetectados: extraccion.eventos.length,
        eventosValidos: eventosValidos.length,
        errores,
        tiempoMs,
      },
      extraccion,
      eventosValidos,
    };
  } catch (error) {
    const tiempoMs = Date.now() - inicio;
    const mensajeError =
      error instanceof Error ? error.message : "Error desconocido";

    return {
      resultado: {
        diarioId: diarioConfig.id,
        diarioNombre: diarioConfig.nombre,
        exitoso: false,
        eventosDetectados: 0,
        eventosValidos: 0,
        errores: [mensajeError],
        tiempoMs,
      },
      extraccion: null,
      eventosValidos: [],
    };
  }
}

/**
 * Procesa múltiples diarios en paralelo (con límite de concurrencia).
 */
export async function procesarMultiplesDiarios(
  diarios: DiarioConfig[],
  fuenteId?: string,
  concurrenciaMax: number = 3
): Promise<{
  resultados: ResultadoPipeline[];
  eventosValidos: any[];
  resumen: {
    diariosProcessados: number;
    diariosExitosos: number;
    eventosExtraidos: number;
    tiempoTotalMs: number;
  };
}> {
  const inicio = Date.now();
  const resultados: ResultadoPipeline[] = [];
  const eventosValidos: any[] = [];

  // Procesar con límite de concurrencia
  for (let i = 0; i < diarios.length; i += concurrenciaMax) {
    const batch = diarios.slice(i, i + concurrenciaMax);
    const promesas = batch.map((d) => procesarDiario(d, fuenteId));

    const resultadosBatch = await Promise.all(promesas);

    for (const { resultado, eventosValidos: eventos } of resultadosBatch) {
      resultados.push(resultado);
      eventosValidos.push(...eventos);
    }
  }

  const tiempoTotalMs = Date.now() - inicio;
  const diariosExitosos = resultados.filter((r) => r.exitoso).length;

  return {
    resultados,
    eventosValidos,
    resumen: {
      diariosProcessados: diarios.length,
      diariosExitosos,
      eventosExtraidos: eventosValidos.length,
      tiempoTotalMs,
    },
  };
}
