"use client";

import { useMemo, useState } from "react";
import { CalendarRange, TriangleAlert } from "lucide-react";

import { BadgeCategoria } from "@/components/eventos/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import { NIVELES_URGENCIA } from "@/lib/constants";
import { bandaPorDias, diasSaturados, type DiaTimeline } from "@/lib/metricas";
import { cn } from "@/lib/utils";

const FORMATO_DIA_SEMANA = new Intl.DateTimeFormat("es-CL", {
  weekday: "short",
});
const FORMATO_DIA_LARGO = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const FORMATO_MES_CORTO = new Intl.DateTimeFormat("es-CL", { month: "short" });

function acentoDeDia(dia: DiaTimeline): string {
  if (dia.eventos.length === 0) return "bg-muted";
  const minimo = Math.min(...dia.eventos.map((e) => e.alerta.diasRestantes));
  const banda = bandaPorDias(minimo);
  return banda === "critica"
    ? "bg-urgente"
    : banda === "oportunidad"
      ? "bg-proximo"
      : "bg-planificacion";
}

export function Timeline({
  dias,
  horizonte,
}: {
  dias: DiaTimeline[];
  horizonte: number;
}) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const maxEventos = useMemo(
    () => Math.max(1, ...dias.map((d) => d.eventos.length)),
    [dias],
  );

  const saturados = useMemo(() => diasSaturados(dias), [dias]);
  const finesDeSemanaCargados = useMemo(
    () => dias.filter((d) => d.esFinDeSemana && d.eventos.length > 0),
    [dias],
  );

  const conEventos = useMemo(
    () => dias.filter((d) => d.eventos.length > 0),
    [dias],
  );

  const detalle = seleccionado
    ? (dias.find((d) => d.iso === seleccionado) ?? null)
    : null;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarRange className="text-muted-foreground size-4" />
            Densidad de agenda — próximos {horizonte} días
          </CardTitle>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
            <span className="tabular-nums">
              {pluralizar(conEventos.length, "jornada")} con actividad
            </span>
            {saturados.length > 0 && (
              <span className="text-proximo flex items-center gap-1.5">
                <TriangleAlert className="size-3.5" />
                {saturados.length} con eventos simultáneos
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Cada columna es un día. La altura indica cuántos eventos coinciden; el
          color, la banda más apremiante de esa jornada. Los fines de semana van
          sombreados.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0">
        {/* Tira de densidad. Se desplaza horizontalmente en pantallas chicas. */}
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-end gap-[3px]">
            {dias.map((dia) => {
              const altura =
                dia.eventos.length === 0
                  ? 4
                  : 12 + (dia.eventos.length / maxEventos) * 52;
              const activo = seleccionado === dia.iso;

              return (
                <Tooltip key={dia.iso}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSeleccionado(activo ? null : dia.iso)}
                      aria-label={`${FORMATO_DIA_LARGO.format(dia.fecha)}: ${pluralizar(dia.eventos.length, "evento")}`}
                      aria-pressed={activo}
                      className={cn(
                        "group flex w-[14px] shrink-0 flex-col items-center justify-end gap-1 rounded-sm pt-1 transition-colors",
                        dia.esFinDeSemana && "bg-muted/40",
                        activo && "bg-accent",
                      )}
                    >
                      <span
                        className={cn(
                          "w-full rounded-sm transition-all",
                          acentoDeDia(dia),
                          dia.eventos.length === 0 && "opacity-40",
                          activo && "ring-ring ring-2",
                        )}
                        style={{ height: `${altura}px` }}
                      />
                      <span
                        className={cn(
                          "text-[9px] leading-none tabular-nums",
                          dia.esHoy
                            ? "text-primary font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        {dia.fecha.getDate()}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium capitalize">
                      {FORMATO_DIA_LARGO.format(dia.fecha)}
                    </p>
                    <p className="text-muted-foreground">
                      {dia.eventos.length === 0
                        ? "Sin actividad"
                        : `${dia.eventos.length} evento${dia.eventos.length > 1 ? "s" : ""} · ${formatearNumero(dia.asistentes)} asistentes`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {finesDeSemanaCargados.length > 0 && (
          <p className="text-muted-foreground text-xs">
            Fines de semana con afluencia:{" "}
            <span className="text-foreground">
              {finesDeSemanaCargados
                .map(
                  (d) =>
                    `${FORMATO_DIA_SEMANA.format(d.fecha).replace(".", "")} ${d.fecha.getDate()}`,
                )
                .join(", ")}
            </span>
          </p>
        )}

        <Separator />

        {/* Lista vertical: la agenda leída como cronología. */}
        <div className="space-y-0">
          {conEventos.length === 0 ? (
            <p className="text-muted-foreground py-4 text-sm">
              No hay eventos en el horizonte seleccionado.
            </p>
          ) : (
            (detalle ? [detalle] : conEventos).map((dia) => (
              <div
                key={dia.iso}
                className={cn(
                  "flex gap-3 border-l-2 py-2.5 pl-4",
                  dia.esHoy ? "border-l-primary" : "border-l-border",
                  dia.esFinDeSemana && "bg-muted/20",
                )}
              >
                <div className="w-16 shrink-0">
                  <p
                    className={cn(
                      "text-sm leading-none font-semibold tabular-nums",
                      dia.esHoy && "text-primary",
                    )}
                  >
                    {dia.fecha.getDate()}{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      {FORMATO_MES_CORTO.format(dia.fecha).replace(".", "")}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs capitalize",
                      dia.esFinDeSemana
                        ? "text-proximo"
                        : "text-muted-foreground",
                    )}
                  >
                    {FORMATO_DIA_SEMANA.format(dia.fecha).replace(".", "")}
                    {dia.esHoy && " · hoy"}
                  </p>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  {dia.eventos.map((evento) => {
                    const urgencia =
                      NIVELES_URGENCIA[evento.alerta.nivelUrgencia];
                    return (
                      <div
                        key={evento.id}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            urgencia.punto,
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 truncate text-sm">
                          {evento.titulo}
                        </span>
                        <BadgeCategoria categoria={evento.categoria} corta />
                        <span className="text-muted-foreground text-xs">
                          {evento.sede.ciudad} ·{" "}
                          <span className="tabular-nums">
                            {formatearNumero(evento.estimadoAsistentes)}
                          </span>
                        </span>
                      </div>
                    );
                  })}

                  {dia.eventos.length > 1 && (
                    <p className="text-proximo flex items-center gap-1.5 text-xs">
                      <TriangleAlert className="size-3" />
                      {dia.eventos.length} eventos en paralelo — revisar
                      solapamiento de equipo
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {detalle && (
          <button
            type="button"
            onClick={() => setSeleccionado(null)}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
          >
            Ver la cronología completa
          </button>
        )}
      </CardContent>
    </Card>
  );
}
