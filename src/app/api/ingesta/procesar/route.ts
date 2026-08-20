/**
 * POST /api/ingesta/procesar
 *
 * Endpoint para trigger manual o cron del proceso de ingesta.
 * Procesa los diarios especificados y retorna resultados.
 *
 * Query params:
 *   - prioridad: "alta" | "media" | "baja" (default: "alta")
 *   - region: nombre de región (opcional, solo regionales)
 *   - limite: número máximo de diarios a procesar
 */

import { NextRequest, NextResponse } from "next/server";
import type { DiarioConfig } from "@/lib/ingesta/config";
import {
  DIARIOS_NACIONALES,
  DIARIOS_REGIONALES,
  MUNICIPIOS_FUENTES,
  obtenerDiariossPorPrioridad,
  obtenerDiariossPorRegion,
  estadisticasFuentes,
} from "@/lib/ingesta/config";
import { procesarMultiplesDiarios } from "@/lib/ingesta/pipeline";
import { guardarEventos } from "@/lib/ingesta/storage";

interface RespuestaFuentes {
  titulo: string;
  total: number;
  diarios: DiarioConfig[];
  estadisticas?: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    // Validar autenticación (en producción, verificar token)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const params = request.nextUrl.searchParams;
    const prioridad = (params.get("prioridad") || "alta") as "alta" | "media" | "baja";
    const region = params.get("region");
    const limite = parseInt(params.get("limite") || "5", 10);

    // Seleccionar diarios según criterios
    let diariosAProcesar = obtenerDiariossPorPrioridad(prioridad);

    if (region) {
      diariosAProcesar = obtenerDiariossPorRegion(region);
    }

    diariosAProcesar = diariosAProcesar.slice(0, limite);

    if (diariosAProcesar.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron diarios con los criterios especificados" },
        { status: 404 }
      );
    }

    console.log(`[Ingesta] Procesando ${diariosAProcesar.length} diarios (prioridad: ${prioridad})`);

    // Procesar diarios
    const { resultados, eventosValidos, resumen } = await procesarMultiplesDiarios(
      diariosAProcesar,
      "fue-manual",
      3
    );

    // Guardar eventos en Supabase
    const resultadoGuardado: {
      exitosos: number;
      fallidos: number;
      errores: Array<{ eventoId: string; error: string }>;
    } = { exitosos: 0, fallidos: 0, errores: [] };

    if (eventosValidos.length > 0) {
      Object.assign(resultadoGuardado, await guardarEventos(eventosValidos));
      console.log(
        `[Ingesta] Guardado: ${resultadoGuardado.exitosos} exitosos, ${resultadoGuardado.fallidos} fallidos`
      );
    }

    return NextResponse.json(
      {
        success: true,
        resumen: {
          ...resumen,
          eventosGuardados: resultadoGuardado.exitosos,
          eventosErrorGuardado: resultadoGuardado.fallidos,
        },
        resultados: resultados.map((r) => ({
          diarioId: r.diarioId,
          diarioNombre: r.diarioNombre,
          exitoso: r.exitoso,
          eventosDetectados: r.eventosDetectados,
          eventosValidos: r.eventosValidos,
          tiempoMs: r.tiempoMs,
          errores: r.errores,
        })),
        eventosExtraidos: eventosValidos.length,
        ejemploEvento: eventosValidos[0] || null,
        guardado: resultadoGuardado,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Ingesta] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingesta/procesar
 * Retorna información sobre fuentes disponibles (debug + estadísticas).
 *
 * Query params:
 *   - show: "nacionales" | "regionales" | "municipios" | "todos" (default: "nacionales")
 *   - stats: "true" para ver estadísticas generales
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mostrar = params.get("show") || "nacionales";
  const stats = params.get("stats") === "true";

  let diarios: DiarioConfig[] = [];
  let titulo = "";

  if (mostrar === "nacionales") {
    diarios = DIARIOS_NACIONALES;
    titulo = "Diarios Nacionales";
  } else if (mostrar === "regionales") {
    diarios = DIARIOS_REGIONALES;
    titulo = "Diarios Regionales";
  } else if (mostrar === "municipios") {
    diarios = MUNICIPIOS_FUENTES;
    titulo = "Fuentes de Municipios (Web + Redes Sociales)";
  } else if (mostrar === "todos") {
    diarios = [...DIARIOS_NACIONALES, ...DIARIOS_REGIONALES, ...MUNICIPIOS_FUENTES];
    titulo = "Todas las Fuentes";
  }

  const respuesta: RespuestaFuentes = {
    titulo,
    total: diarios.length,
    diarios: diarios.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      region: d.region,
      cadenciaHoras: d.cadenciaHoras,
      prioridad: d.prioridad,
      categoria: d.categoria,
      mecanismo: d.mecanismo,
    })),
  };

  if (stats) {
    respuesta.estadisticas = estadisticasFuentes();
  }

  return NextResponse.json(respuesta);
}
