"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import { DialogoReporte } from "@/components/alertas/dialogo-reporte";
import { KpiBanners } from "@/components/alertas/kpi-banners";
import { SeccionBanda } from "@/components/alertas/seccion-banda";
import { Timeline } from "@/components/alertas/timeline";
import { useRadar } from "@/components/providers/radar-provider";
import { Button } from "@/components/ui/button";
import { CIUDADES } from "@/lib/constants";
import {
  ORDEN_BANDAS,
  agruparPorBanda,
  calcularKpis,
  construirTimeline,
  generarReporte,
} from "@/lib/metricas";
import type { EventoEnriquecido } from "@/lib/types";

/** Horizonte del reporte semanal: una semana laboral más el fin de semana. */
const HORIZONTE_REPORTE = 7;

export function PanelAlertas({ eventos }: { eventos: EventoEnriquecido[] }) {
  const { ciudad, ventana } = useRadar();
  const [reporteAbierto, setReporteAbierto] = useState(false);

  const nombreCiudad =
    CIUDADES.find((c) => c.id === ciudad)?.nombre ?? "Todas las ciudades";

  /**
   * El panel respeta la ciudad global pero no la ventana: sus tres bandas
   * cubren el horizonte completo por definición. La ventana sí gobierna el
   * timeline, que es donde una escala más corta o más larga cambia la lectura.
   */
  const delAmbito = useMemo(
    () =>
      ciudad === "todas"
        ? eventos
        : eventos.filter((evento) => evento.sede.ciudad === ciudad),
    [eventos, ciudad],
  );

  const futuros = useMemo(
    () => delAmbito.filter((evento) => evento.alerta.diasRestantes >= 0),
    [delAmbito],
  );

  const kpis = useMemo(() => calcularKpis(delAmbito), [delAmbito]);
  const grupos = useMemo(() => agruparPorBanda(futuros), [futuros]);
  const dias = useMemo(
    () => construirTimeline(futuros, ventana),
    [futuros, ventana],
  );

  const reporte = useMemo(
    () => generarReporte(futuros, HORIZONTE_REPORTE, nombreCiudad),
    [futuros, nombreCiudad],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            Ámbito:{" "}
            <span className="text-foreground font-medium">{nombreCiudad}</span>{" "}
            · {futuros.length} eventos futuros en seguimiento
          </p>
        </div>

        <Button className="gap-2" onClick={() => setReporteAbierto(true)}>
          <FileText className="size-4" />
          Generar reporte de alertas semanal
        </Button>
      </div>

      <KpiBanners kpis={kpis} />

      <Timeline dias={dias} horizonte={ventana} />

      <div className="space-y-4">
        {ORDEN_BANDAS.map((banda) => (
          <SeccionBanda key={banda} banda={banda} eventos={grupos[banda]} />
        ))}
      </div>

      <DialogoReporte
        reporte={reporte}
        abierto={reporteAbierto}
        onOpenChange={setReporteAbierto}
      />
    </div>
  );
}
