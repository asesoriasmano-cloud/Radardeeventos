"use client";

import {
  Building2,
  CalendarDays,
  Download,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";

import {
  BadgeCategoria,
  BadgeEstado,
  BadgeUrgencia,
} from "@/components/eventos/badges";
import { PanelContacto } from "@/components/eventos/panel-contacto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TIPOS_ORGANIZADOR, TIPOS_SEDE } from "@/lib/constants";
import { formatearNumero, formatearRango } from "@/lib/eventos";
import type { EventoEnriquecido } from "@/lib/types";

interface DialogoDetalleProps {
  evento: EventoEnriquecido | null;
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
  onExportar: (evento: EventoEnriquecido) => void;
}

function Dato({
  icono: Icono,
  etiqueta,
  children,
}: {
  icono: typeof MapPin;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icono className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{etiqueta}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

export function DialogoDetalle({
  evento,
  abierto,
  onOpenChange,
  onExportar,
}: DialogoDetalleProps) {
  if (!evento) return null;

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <BadgeCategoria categoria={evento.categoria} />
            <BadgeUrgencia
              nivel={evento.alerta.nivelUrgencia}
              diasRestantes={evento.alerta.diasRestantes}
            />
            <BadgeEstado estado={evento.estado} />
          </div>
          <DialogTitle className="text-left text-lg">
            {evento.titulo}
          </DialogTitle>
          {evento.descripcion && (
            <DialogDescription className="text-left">
              {evento.descripcion}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Dato icono={CalendarDays} etiqueta="Fechas">
            {formatearRango(evento.fechaInicio, evento.fechaFin)}
          </Dato>

          <Dato icono={Users} etiqueta="Aforo estimado">
            <span className="tabular-nums">
              {formatearNumero(evento.estimadoAsistentes)} asistentes
            </span>
          </Dato>

          <Dato icono={MapPin} etiqueta="Sede">
            <p>{evento.sede.nombre}</p>
            <p className="text-muted-foreground text-xs">
              {TIPOS_SEDE[evento.sede.tipo].etiqueta} · {evento.sede.direccion},{" "}
              {evento.sede.ciudad}
            </p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {evento.sede.coordenadas.lat.toFixed(4)},{" "}
              {evento.sede.coordenadas.lng.toFixed(4)}
            </p>
          </Dato>

          <Dato icono={Building2} etiqueta="Organizador">
            <p>{evento.organizador.nombre}</p>
            <p className="text-muted-foreground text-xs">
              {TIPOS_ORGANIZADOR[evento.organizador.tipo].etiqueta}
              {evento.organizador.rubro && ` · ${evento.organizador.rubro}`}
            </p>
          </Dato>
        </div>

        {evento.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {evento.etiquetas.map((etiqueta) => (
              <span
                key={etiqueta}
                className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
              >
                {etiqueta}
              </span>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium">
            Contactos clave
            <span className="text-muted-foreground ml-1.5 tabular-nums">
              ({evento.contactos.length})
            </span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {evento.contactos.map((contacto) => (
              <div
                key={contacto.id}
                className="bg-muted/30 rounded-lg border p-3"
              >
                <PanelContacto contacto={contacto} evento={evento} />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {evento.urlOficial ? (
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a
                href={evento.urlOficial}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Sitio oficial
              </a>
            </Button>
          ) : (
            <span />
          )}
          <Button
            size="sm"
            className="gap-2"
            onClick={() => onExportar(evento)}
          >
            <Download className="size-4" />
            Exportar CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
