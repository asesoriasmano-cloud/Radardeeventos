"use client";

import { useMemo, useState } from "react";
import { Antenna, FilePlus2 } from "lucide-react";

import { EstadoIngesta } from "@/components/fuentes/estado-ingesta";
import { IngresoRapido } from "@/components/fuentes/ingreso-rapido";
import { TablaFuentes } from "@/components/fuentes/tabla-fuentes";
import { useRadar } from "@/components/providers/radar-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESTADOS_FUENTE } from "@/lib/constants";
import { pluralizar } from "@/lib/eventos";
import { calcularEstadisticasFuentes, enriquecerFuentes } from "@/lib/fuentes";
import type {
  EstadoFuente,
  EventoEnriquecido,
  Fuente,
  Sede,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface PanelFuentesProps {
  fuentes: Fuente[];
  eventos: EventoEnriquecido[];
  sedes: Sede[];
}

type FiltroEstado = EstadoFuente | "todas";

const FILTROS: FiltroEstado[] = ["todas", "activa", "con_error", "pausada"];

export function PanelFuentes({ fuentes, eventos, sedes }: PanelFuentesProps) {
  const { ciudad } = useRadar();
  const [filtro, setFiltro] = useState<FiltroEstado>("todas");

  const fichas = useMemo(
    () => enriquecerFuentes(fuentes, eventos),
    [fuentes, eventos],
  );

  /**
   * El selector global de ciudad acota qué fuentes son pertinentes: una
   * cartelera que solo cubre Temuco no aporta nada mirando Antofagasta. Las de
   * cobertura nacional se muestran siempre.
   */
  const delAmbito = useMemo(
    () =>
      ciudad === "todas"
        ? fichas
        : fichas.filter(
            (ficha) =>
              ficha.fuente.cobertura.includes("todas") ||
              ficha.fuente.cobertura.includes(ciudad),
          ),
    [fichas, ciudad],
  );

  const visibles = useMemo(
    () =>
      filtro === "todas"
        ? delAmbito
        : delAmbito.filter((ficha) => ficha.fuente.estado === filtro),
    [delAmbito, filtro],
  );

  const estadisticas = useMemo(
    () => calcularEstadisticasFuentes(delAmbito),
    [delAmbito],
  );

  return (
    <div className="space-y-6">
      <EstadoIngesta estadisticas={estadisticas} />

      <Tabs defaultValue="monitoreo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoreo" className="gap-1.5">
            <Antenna className="size-4" />
            Fuentes monitoreadas
          </TabsTrigger>
          <TabsTrigger value="ingreso" className="gap-1.5">
            <FilePlus2 className="size-4" />
            Ingreso rápido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoreo" className="space-y-4">
          <div className="bg-card/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
            <div className="flex flex-wrap gap-1.5">
              {FILTROS.map((valor) => {
                const activo = filtro === valor;
                const etiqueta =
                  valor === "todas" ? "Todas" : ESTADOS_FUENTE[valor].etiqueta;
                const cantidad =
                  valor === "todas"
                    ? delAmbito.length
                    : delAmbito.filter((f) => f.fuente.estado === valor).length;

                return (
                  <Button
                    key={valor}
                    variant={activo ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 gap-1.5 text-xs",
                      !activo && "text-muted-foreground",
                    )}
                    onClick={() => setFiltro(valor)}
                    aria-pressed={activo}
                  >
                    {valor !== "todas" && (
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          ESTADOS_FUENTE[valor].punto,
                        )}
                        aria-hidden
                      />
                    )}
                    {etiqueta}
                    <span className="tabular-nums opacity-70">{cantidad}</span>
                  </Button>
                );
              })}
            </div>

            <p className="text-muted-foreground text-xs">
              {pluralizar(estadisticas.eventosDetectados, "evento")} del radar
              provienen de estas fuentes
              {estadisticas.lider &&
                ` · la más productiva es ${estadisticas.lider.fuente.nombre}`}
            </p>
          </div>

          <TablaFuentes fuentes={visibles} />
        </TabsContent>

        <TabsContent value="ingreso">
          <IngresoRapido sedes={sedes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
