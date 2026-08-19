"use client";

import { Fragment, useState } from "react";
import { AlertTriangle, ExternalLink, ListTree, Timer } from "lucide-react";

import { DeteccionesFuente } from "@/components/fuentes/detecciones-fuente";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ESTADOS_FUENTE,
  FAMILIAS_FUENTE,
  MECANISMOS_FUENTE,
  ORDEN_FAMILIAS_FUENTE,
} from "@/lib/constants";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import {
  agruparFuentesPorFamilia,
  cadenciaLegible,
  coberturaLegible,
  tiempoRelativo,
  type FuenteEnriquecida,
} from "@/lib/fuentes";
import { cn } from "@/lib/utils";

interface TablaFuentesProps {
  fuentes: FuenteEnriquecida[];
}

function BadgeEstadoFuente({
  estado,
}: {
  estado: FuenteEnriquecida["fuente"]["estado"];
}) {
  const config = ESTADOS_FUENTE[estado];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            config.texto,
            config.fondo,
            config.borde,
          )}
        >
          <span
            className={cn("size-1.5 rounded-full", config.punto)}
            aria-hidden
          />
          {config.etiqueta}
        </span>
      </TooltipTrigger>
      <TooltipContent>{config.descripcion}</TooltipContent>
    </Tooltip>
  );
}

/** Barra de éxito en extracción de contactos. Sin eventos no hay tasa. */
function TasaExtraccion({ ficha }: { ficha: FuenteEnriquecida }) {
  if (ficha.tasaExtraccion === undefined) {
    return (
      <span className="text-muted-foreground text-xs italic">Sin base aún</span>
    );
  }

  return (
    <div className="min-w-[104px] space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium tabular-nums">
          {ficha.tasaExtraccion}%
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {ficha.conContacto}/{ficha.eventos.length}
        </span>
      </div>
      <Progress value={ficha.tasaExtraccion} className="h-1.5" />
    </div>
  );
}

export function TablaFuentes({ fuentes }: TablaFuentesProps) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const porFamilia = agruparFuentesPorFamilia(fuentes);
  const seleccionada =
    abierta !== null
      ? (fuentes.find((f) => f.fuente.id === abierta) ?? null)
      : null;

  if (fuentes.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        Ninguna fuente coincide con el filtro.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {ORDEN_FAMILIAS_FUENTE.map((familia) => {
        const lista = porFamilia.get(familia);
        if (!lista || lista.length === 0) return null;
        const config = FAMILIAS_FUENTE[familia];

        return (
          <section key={familia} className="space-y-3">
            <div className="border-b pb-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span
                  className={cn("size-2 rounded-full", config.punto)}
                  aria-hidden
                />
                {config.etiqueta}
                <span className="text-muted-foreground text-xs tabular-nums">
                  ({lista.length})
                </span>
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {config.descripcion}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[220px]">Fuente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última sincronización</TableHead>
                    <TableHead className="text-right">Eventos</TableHead>
                    <TableHead>Extracción de contactos</TableHead>
                    <TableHead className="text-right">
                      Anticipación media
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((ficha) => {
                    const { fuente } = ficha;
                    const aviso =
                      fuente.ultimoError ??
                      (ficha.atrasada
                        ? `Lleva más del doble de su cadencia sin correr (${cadenciaLegible(fuente.cadenciaMinutos).toLowerCase()}): puede estar dejando eventos fuera.`
                        : undefined);

                    return (
                      <Fragment key={fuente.id}>
                        <TableRow className={cn(aviso && "border-b-0")}>
                          <TableCell className="align-top">
                            <p className="font-medium">{fuente.nombre}</p>
                            <p className="text-muted-foreground text-xs">
                              {MECANISMOS_FUENTE[fuente.mecanismo]} ·{" "}
                              {coberturaLegible(fuente.cobertura)}
                            </p>
                            {fuente.notas && (
                              <p className="text-muted-foreground mt-1 max-w-md text-xs italic">
                                {fuente.notas}
                              </p>
                            )}
                          </TableCell>

                          <TableCell className="align-top">
                            <BadgeEstadoFuente estado={fuente.estado} />
                          </TableCell>

                          <TableCell className="align-top">
                            <p
                              className={cn(
                                "text-sm whitespace-nowrap",
                                ficha.atrasada && "text-urgente",
                              )}
                            >
                              {tiempoRelativo(ficha.minutosDesdeSync)}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1 text-xs">
                              <Timer className="size-3" />
                              {cadenciaLegible(fuente.cadenciaMinutos)}
                            </p>
                          </TableCell>

                          <TableCell className="align-top text-right">
                            <p className="text-sm font-medium tabular-nums">
                              {formatearNumero(ficha.eventos.length)}
                            </p>
                            <p className="text-muted-foreground text-xs tabular-nums">
                              {pluralizar(
                                ficha.vigentes.length,
                                "vigente",
                                "vigentes",
                              )}
                            </p>
                          </TableCell>

                          <TableCell className="align-top">
                            <TasaExtraccion ficha={ficha} />
                          </TableCell>

                          <TableCell className="align-top text-right">
                            {ficha.anticipacionMedia === undefined ? (
                              <span className="text-muted-foreground text-xs">
                                —
                              </span>
                            ) : (
                              <>
                                <p className="text-sm tabular-nums">
                                  {pluralizar(ficha.anticipacionMedia, "día")}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  antes del evento
                                </p>
                              </>
                            )}
                          </TableCell>

                          <TableCell className="align-top">
                            <div className="flex items-center justify-end gap-1">
                              {fuente.url && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                    >
                                      <a
                                        href={fuente.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Abrir ${fuente.nombre}`}
                                      >
                                        <ExternalLink className="size-4" />
                                      </a>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Abrir el origen
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {ficha.eventos.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      onClick={() => setAbierta(fuente.id)}
                                      aria-label={`Ver detecciones de ${fuente.nombre}`}
                                    >
                                      <ListTree className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Ver qué eventos aportó
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {aviso && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={7} className="pt-0">
                              <p className="text-urgente bg-urgente-soft border-urgente/40 flex items-start gap-2 rounded-md border px-3 py-2 text-xs">
                                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                                {aviso}
                              </p>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
        );
      })}

      <DeteccionesFuente
        ficha={seleccionada}
        abierta={abierta !== null}
        onOpenChange={(valor) => !valor && setAbierta(null)}
      />
    </div>
  );
}
