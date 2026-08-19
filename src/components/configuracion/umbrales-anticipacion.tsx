"use client";

import { BellRing, CalendarClock, Flag } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ANTICIPACION_MAX } from "@/lib/constants";
import { pluralizar } from "@/lib/eventos";
import type { ConfiguracionAlertas } from "@/lib/types";

interface UmbralesAnticipacionProps {
  configuracion: ConfiguracionAlertas;
  onCambio: (parcial: Partial<ConfiguracionAlertas>) => void;
}

/**
 * Los dos umbrales se dibujan sobre una misma línea de tiempo porque su
 * relación es lo que importa: el recordatorio siempre va después del aviso.
 */
export function UmbralesAnticipacion({
  configuracion,
  onCambio,
}: UmbralesAnticipacionProps) {
  const { avisoPrincipalDias, recordatorioDias } = configuracion;
  const invertido = recordatorioDias >= avisoPrincipalDias;

  // La línea va del aviso principal (izquierda) al día del evento (derecha).
  const posicionRecordatorio = Math.min(
    100,
    Math.max(
      0,
      ((avisoPrincipalDias - recordatorioDias) /
        Math.max(1, avisoPrincipalDias)) *
        100,
    ),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CalendarClock className="text-muted-foreground size-4" />
          Umbrales de anticipación
        </CardTitle>
        <CardDescription className="text-xs">
          Cuándo avisar por primera vez y cuándo insistir. Ambos se miden en
          días antes del inicio del evento.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="flex items-center gap-1.5 text-xs">
              <BellRing className="size-3.5" />
              Aviso principal
            </Label>
            <span className="text-sm font-semibold tabular-nums">
              {pluralizar(avisoPrincipalDias, "día")} antes
            </span>
          </div>
          <Slider
            value={[avisoPrincipalDias]}
            min={1}
            max={ANTICIPACION_MAX}
            step={1}
            onValueChange={([valor]) => onCambio({ avisoPrincipalDias: valor })}
            thumbLabels={["Días de anticipación del aviso principal"]}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="flex items-center gap-1.5 text-xs">
              <Flag className="size-3.5" />
              Recordatorio
            </Label>
            <span className="text-sm font-semibold tabular-nums">
              {pluralizar(recordatorioDias, "día")} antes
            </span>
          </div>
          <Slider
            value={[recordatorioDias]}
            min={1}
            max={ANTICIPACION_MAX}
            step={1}
            onValueChange={([valor]) => onCambio({ recordatorioDias: valor })}
            thumbLabels={["Días de anticipación del recordatorio"]}
          />
        </div>

        {invertido ? (
          <p className="text-urgente bg-urgente-soft border-urgente/40 rounded-md border px-3 py-2 text-xs">
            El recordatorio no puede tener tanta o más anticipación que el aviso
            principal: quedaría antes del primer contacto.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="bg-muted relative h-1.5 rounded-full">
              <div className="bg-proximo/30 absolute inset-0 rounded-full" />
              <span
                className="bg-planificacion absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: "0%" }}
                aria-hidden
              />
              <span
                className="bg-proximo absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: `${posicionRecordatorio}%` }}
                aria-hidden
              />
              <span
                className="bg-urgente absolute top-1/2 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full"
                aria-hidden
              />
            </div>
            {/* La etiqueta del recordatorio sigue al marcador, no al centro. */}
            <div className="text-muted-foreground relative h-8 text-xs">
              <span className="absolute left-0">T−{avisoPrincipalDias}</span>
              <span
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${posicionRecordatorio}%` }}
              >
                T−{recordatorioDias}
              </span>
              <span className="absolute right-0">Evento</span>
              <span className="absolute top-4 left-0">aviso</span>
              <span className="absolute top-4 right-0">día 0</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
