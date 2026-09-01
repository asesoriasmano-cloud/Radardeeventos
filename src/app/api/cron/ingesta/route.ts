/**
 * GET /api/cron/ingesta
 *
 * Corrida automática de ingesta. La dispara el cron de Vercel declarado en
 * `vercel.json`.
 *
 * Tres restricciones del plan Hobby moldean este endpoint, y conviene tenerlas
 * presentes antes de tocarlo:
 *
 * 1. **El cron invoca por GET**, no por POST. Por eso este handler existe
 *    separado de `/api/ingesta/procesar`, que es POST y queda para disparos
 *    manuales.
 * 2. **Una sola ejecución diaria.** No se puede repartir la carga en varias
 *    corridas del día, así que cada corrida toma una tajada distinta de las
 *    fuentes y la cobertura completa se logra a lo largo de la semana.
 * 3. **60 segundos de límite por función.** Cada diario son un fetch más una
 *    llamada a Claude —10 a 30 segundos—, de modo que entran tres por corrida
 *    y no más. Subir `DIARIOS_POR_CORRIDA` hace que la función muera a la
 *    mitad y se pierda el lote entero.
 */

import { NextRequest, NextResponse } from "next/server";
import { obtenerDiariossPorPrioridad } from "@/lib/ingesta/config";
import { procesarMultiplesDiarios } from "@/lib/ingesta/pipeline";
import { guardarEventos } from "@/lib/ingesta/storage";

/** Tope de Hobby. Ver nota 3 de la cabecera. */
export const maxDuration = 60;

/** Cuántas fuentes procesa cada corrida diaria. Ver nota 3. */
const DIARIOS_POR_CORRIDA = 3;

/** Día del año, base de la rotación de fuentes. */
function diaDelAno(fecha: Date): number {
  const inicioDeAno = Date.UTC(fecha.getUTCFullYear(), 0, 1);
  const hoy = Date.UTC(
    fecha.getUTCFullYear(),
    fecha.getUTCMonth(),
    fecha.getUTCDate()
  );
  return Math.floor((hoy - inicioDeAno) / 86_400_000);
}

/**
 * Elige qué fuentes tocan hoy.
 *
 * Con una sola corrida diaria no alcanza para recorrer todas las fuentes de
 * prioridad alta, así que se avanza por la lista en tajadas y se vuelve al
 * principio al llegar al final. Un día de cada siete se dedica a las de
 * prioridad media, que cambian menos seguido y toleran esa cadencia.
 */
function seleccionarDiarios(fecha: Date) {
  const dia = diaDelAno(fecha);
  const prioridad = dia % 7 === 0 ? "media" : "alta";
  const lista = obtenerDiariossPorPrioridad(prioridad);

  if (lista.length === 0) return { prioridad, diarios: [] };

  const inicio = (dia * DIARIOS_POR_CORRIDA) % lista.length;
  // Se duplica la lista para que una tajada que cruza el final no quede corta.
  const diarios = [...lista, ...lista].slice(
    inicio,
    inicio + DIARIOS_POR_CORRIDA
  );

  return { prioridad, diarios };
}

export async function GET(request: NextRequest) {
  // Vercel firma la invocación del cron con CRON_SECRET. Si la variable no está
  // definida se rechaza todo: un endpoint de ingesta abierto dejaría que
  // cualquiera queme créditos de la API de Claude.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const inicio = Date.now();

  try {
    const { prioridad, diarios } = seleccionarDiarios(new Date());

    if (diarios.length === 0) {
      return NextResponse.json({
        success: true,
        mensaje: `Sin fuentes de prioridad ${prioridad} configuradas`,
      });
    }

    console.log(
      `[Cron] Procesando ${diarios.length} fuentes (prioridad ${prioridad}): ` +
        diarios.map((d) => d.nombre).join(", ")
    );

    const { resultados, eventosValidos, resumen } =
      await procesarMultiplesDiarios(diarios, undefined, DIARIOS_POR_CORRIDA);

    const guardado =
      eventosValidos.length > 0
        ? await guardarEventos(eventosValidos)
        : { exitosos: 0, fallidos: 0, errores: [] };

    console.log(
      `[Cron] ${resumen.eventosExtraidos} eventos extraídos, ` +
        `${guardado.exitosos} guardados, ${guardado.fallidos} fallidos`
    );

    return NextResponse.json({
      success: true,
      prioridad,
      fuentes: diarios.map((d) => d.nombre),
      eventosExtraidos: resumen.eventosExtraidos,
      eventosGuardados: guardado.exitosos,
      eventosFallidos: guardado.fallidos,
      erroresGuardado: guardado.errores,
      detallePorFuente: resultados.map((r) => ({
        fuente: r.diarioNombre,
        exitoso: r.exitoso,
        detectados: r.eventosDetectados,
        validos: r.eventosValidos,
        errores: r.errores,
        tiempoMs: r.tiempoMs,
      })),
      tiempoTotalMs: Date.now() - inicio,
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        tiempoTotalMs: Date.now() - inicio,
      },
      { status: 500 }
    );
  }
}
