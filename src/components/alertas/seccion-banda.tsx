"use client";

import { useState } from "react";
import { ChevronDown, Inbox } from "lucide-react";

import { TarjetaAlerta } from "@/components/alertas/tarjeta-alerta";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { brechasDeContacto, formatearNumero } from "@/lib/eventos";
import { BANDAS } from "@/lib/metricas";
import type { BandaAlerta, EventoEnriquecido } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeccionBandaProps {
  banda: BandaAlerta;
  eventos: EventoEnriquecido[];
  /** Cuántas tarjetas se muestran antes de pedir "ver todas". */
  visiblesPorDefecto?: number;
}

export function SeccionBanda({
  banda,
  eventos,
  visiblesPorDefecto = 6,
}: SeccionBandaProps) {
  const [expandida, setExpandida] = useState(true);
  const [verTodas, setVerTodas] = useState(false);

  const config = BANDAS[banda];
  const conBrechas = eventos.filter(
    (e) => brechasDeContacto(e).length > 0,
  ).length;
  const asistentes = eventos.reduce(
    (suma, e) => suma + e.estimadoAsistentes,
    0,
  );

  const mostrados = verTodas ? eventos : eventos.slice(0, visiblesPorDefecto);
  const ocultos = eventos.length - mostrados.length;

  return (
    <Collapsible open={expandida} onOpenChange={setExpandida} asChild>
      <section
        className={cn("rounded-lg border", config.borde)}
        aria-label={config.titulo}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-start gap-3 rounded-t-lg p-4 text-left transition-colors",
              config.fondo,
              !expandida && "rounded-b-lg",
            )}
          >
            <span
              className={cn(
                "mt-1.5 size-2 shrink-0 rounded-full",
                config.punto,
                banda === "critica" &&
                  eventos.length > 0 &&
                  "animate-radar-pulse",
              )}
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className={cn("text-sm font-semibold", config.texto)}>
                  {config.titulo}
                </h2>
                <span className="text-muted-foreground text-xs">
                  ({config.rango})
                </span>
                <span className="text-xs font-medium tabular-nums">
                  {eventos.length}
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {config.descripcion}
              </p>
              {eventos.length > 0 && (
                <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">
                  {formatearNumero(asistentes)} asistentes acumulados
                  {conBrechas > 0 && (
                    <span className={config.texto}>
                      {" "}
                      · {conBrechas} con datos de contacto incompletos
                    </span>
                  )}
                </p>
              )}
            </div>

            <ChevronDown
              className={cn(
                "text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform",
                !expandida && "-rotate-90",
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0">
            {eventos.length === 0 ? (
              <div className="text-muted-foreground flex items-center gap-2 rounded-md border border-dashed p-4 text-sm">
                <Inbox className="size-4 shrink-0" />
                Sin eventos en esta banda para el ámbito seleccionado.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {mostrados.map((evento) => (
                    <TarjetaAlerta
                      key={evento.id}
                      evento={evento}
                      banda={banda}
                    />
                  ))}
                </div>

                {ocultos > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground mt-3 w-full"
                    onClick={() => setVerTodas(true)}
                  >
                    Ver {ocultos} evento{ocultos > 1 ? "s" : ""} más
                  </Button>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
