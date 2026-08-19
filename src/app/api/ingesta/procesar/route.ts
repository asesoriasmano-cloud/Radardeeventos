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
import { DIARIOS_NACIONALES, DIARIOS_REGIONALES, obtenerDiariossPorPrioridad, obtenerDiariossPorRegion } from "@/lib/ingesta/config";
import { procesarMultiplesDiarios } from "@/lib/ingesta/pipeline";

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
      "fue-manual", // Fuente: ingesta automática
      3 // Max 3 diarios en paralelo
    );

    // En esta fase MVP, solo devolvemos resultados
    // En fase 2, aquí guardaríamos en BD (Supabase)

    return NextResponse.json(
      {
        success: true,
        resumen,
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
 * Retorna información sobre diarios disponibles (para debugging).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mostrar = params.get("show") || "nacionales"; // "nacionales", "regionales", "todos"

  let diarios = mostrar === "regionales" ? DIARIOS_REGIONALES : DIARIOS_NACIONALES;
  if (mostrar === "todos") {
    diarios = [...DIARIOS_NACIONALES, ...DIARIOS_REGIONALES];
  }

  return NextResponse.json({
    total: diarios.length,
    diarios: diarios.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      region: d.region,
      cadenciaHoras: d.cadenciaHoras,
      prioridad: d.prioridad,
      categoria: d.categoria,
    })),
  });
}
