"use client";

import { CircleAlert, CircleCheck } from "lucide-react";

import { BadgeCategoria } from "@/components/eventos/badges";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ESTADOS_FUENTE, MECANISMOS_FUENTE } from "@/lib/constants";
import {
  contactoAccionable,
  formatearNumero,
  formatearRango,
  pluralizar,
} from "@/lib/eventos";
import { coberturaLegible, type FuenteEnriquecida } from "@/lib/fuentes";
import { cn } from "@/lib/utils";

interface DeteccionesFuenteProps {
  ficha: FuenteEnriquecida | null;
  abierta: boolean;
  onOpenChange: (abierta: boolean) => void;
}

/**
 * Detalle de lo que aportó una fuente. Es la explicación de su tasa: cada fila
 * dice si la extracción dejó o no un contacto utilizable.
 */
export function DeteccionesFuente({
  ficha,
  abierta,
  onOpenChange,
}: DeteccionesFuenteProps) {
  if (!ficha) return null;

  const { fuente } = ficha;
  const estado = ESTADOS_FUENTE[fuente.estado];

  return (
    <Dialog open={abierta} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                estado.texto,
                estado.fondo,
                estado.borde,
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", estado.punto)}
                aria-hidden
              />
              {estado.etiqueta}
            </span>
            <span className="text-muted-foreground text-xs">
              {MECANISMOS_FUENTE[fuente.mecanismo]} ·{" "}
              {coberturaLegible(fuente.cobertura)}
            </span>
          </div>

          <DialogTitle className="text-left text-lg">
            {fuente.nombre}
          </DialogTitle>

          <DialogDescription className="text-left">
            {pluralizar(ficha.eventos.length, "evento")} en el radar ·{" "}
            {ficha.conContacto} con contacto utilizable
            {ficha.anticipacionMedia !== undefined &&
              ` · ${pluralizar(ficha.anticipacionMedia, "día")} de anticipación observada`}
          </DialogDescription>
        </DialogHeader>

        {ficha.tasaExtraccion !== undefined && (
          <div className="space-y-1.5 rounded-md border p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">
                Éxito en extracción de contactos
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {ficha.tasaExtraccion}%
              </p>
            </div>
            <Progress value={ficha.tasaExtraccion} className="h-2" />
            <p className="text-muted-foreground text-xs">
              Se cuenta un acierto cuando el organizador quedó con teléfono o
              correo directo, no solo con nombre.
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {ficha.eventos.map((evento) => {
            const utilizable = evento.contactos.some(contactoAccionable);

            return (
              <li
                key={evento.id}
                className="flex flex-wrap items-center gap-2 rounded-md border p-2.5"
              >
                {utilizable ? (
                  <CircleCheck className="text-cat-charla size-4 shrink-0" />
                ) : (
                  <CircleAlert className="text-urgente size-4 shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm">
                  {evento.titulo}
                </span>
                <BadgeCategoria categoria={evento.categoria} corta />
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatearRango(evento.fechaInicio, evento.fechaFin)} ·{" "}
                  {formatearNumero(evento.estimadoAsistentes)}
                </span>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
