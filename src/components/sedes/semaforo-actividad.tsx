import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NIVELES_ACTIVIDAD } from "@/lib/constants";
import type { NivelActividad } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Semáforo de concentración histórica. Tres barras crecientes en vez de tres
 * luces de color: la altura comunica el nivel aunque el color no se distinga.
 */
export function SemaforoActividad({
  nivel,
  puntaje,
  conEtiqueta = false,
  className,
}: {
  nivel: NivelActividad;
  puntaje?: number;
  conEtiqueta?: boolean;
  className?: string;
}) {
  const config = NIVELES_ACTIVIDAD[nivel];
  const alturas = ["h-1.5", "h-2.5", "h-3.5"];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("inline-flex items-center gap-1.5", className)}
          aria-label={`${config.etiqueta}${puntaje !== undefined ? ` (${puntaje} de 100)` : ""}`}
        >
          <span className="flex items-end gap-0.5" aria-hidden>
            {alturas.map((altura, indice) => (
              <span
                key={altura}
                className={cn(
                  "w-1 rounded-sm",
                  altura,
                  indice < config.barras ? config.punto : "bg-border",
                )}
              />
            ))}
          </span>
          {conEtiqueta && (
            <span className={cn("text-xs font-medium", config.texto)}>
              {config.etiqueta}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.etiqueta}</p>
        <p className="text-muted-foreground">{config.descripcion}</p>
        {puntaje !== undefined && (
          <p className="text-muted-foreground tabular-nums">
            Índice de concentración: {puntaje}/100
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
