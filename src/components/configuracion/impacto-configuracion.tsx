"use client";

import { Activity, BellRing, Flag } from "lucide-react";

import { BadgeCategoria } from "@/components/eventos/badges";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatearFecha, formatearNumero, pluralizar } from "@/lib/eventos";
import type { ImpactoConfiguracion } from "@/lib/configuracion";
import type { ConfiguracionAlertas } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImpactoConfiguracionProps {
  impacto: ImpactoConfiguracion;
  configuracion: ConfiguracionAlertas;
}

/**
 * Simulación contra los datos reales del radar. Es la única forma de saber si
 * un umbral es razonable: un aforo mínimo alto puede dejar la vista en cero.
 */
export function ImpactoConfiguracionPanel({
  impacto,
  configuracion,
}: ImpactoConfiguracionProps) {
  const descartados =
    impacto.descartadosPorAforo + impacto.descartadosPorCategoria;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="text-muted-foreground size-4" />
          Efecto de estas reglas, hoy
        </CardTitle>
        <CardDescription className="text-xs">
          Calculado contra los {formatearNumero(impacto.vigentes)} eventos que
          aún no ocurren en el radar.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {formatearNumero(impacto.notificables.length)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              eventos notificables
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {formatearNumero(impacto.enVentanaAviso.length)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              ya dentro de los {configuracion.avisoPrincipalDias} días del aviso
            </p>
          </div>
          <div
            className={cn(
              "rounded-md border p-3",
              descartados > 0 && "border-dashed",
            )}
          >
            <p className="text-muted-foreground text-2xl leading-none font-semibold tabular-nums">
              {formatearNumero(descartados)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              quedan fuera: {impacto.descartadosPorAforo} por aforo,{" "}
              {impacto.descartadosPorCategoria} por categoría
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium">
            Se despacharían hoy
            <span className="text-muted-foreground ml-1.5 tabular-nums">
              ({impacto.disparosHoy.length})
            </span>
          </h3>

          {impacto.disparosHoy.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
              Ningún evento cae exactamente en T−
              {configuracion.avisoPrincipalDias} ni en T−
              {configuracion.recordatorioDias} hoy. Es lo normal: los umbrales
              disparan en días puntuales, no de forma continua.
            </p>
          ) : (
            <ul className="space-y-2">
              {impacto.disparosHoy.map(({ evento, motivo }) => (
                <li
                  key={`${evento.id}-${motivo}`}
                  className="flex flex-wrap items-center gap-2 rounded-md border p-2.5"
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
                      motivo === "aviso"
                        ? "text-planificacion border-planificacion/40 bg-planificacion-soft"
                        : "text-proximo border-proximo/40 bg-proximo-soft",
                    )}
                  >
                    {motivo === "aviso" ? (
                      <BellRing className="size-3" />
                    ) : (
                      <Flag className="size-3" />
                    )}
                    {motivo === "aviso" ? "Aviso" : "Recordatorio"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {evento.titulo}
                  </span>
                  <BadgeCategoria categoria={evento.categoria} corta />
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatearFecha(evento.fechaInicio)} ·{" "}
                    {formatearNumero(evento.estimadoAsistentes)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          Con el recordatorio en T−{configuracion.recordatorioDias} hay{" "}
          {pluralizar(impacto.enRecordatorio.length, "evento")} que ya lo
          cruzaron o lo cruzarán antes de ocurrir.
        </p>
      </CardContent>
    </Card>
  );
}
