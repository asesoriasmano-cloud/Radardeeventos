"use client";

import { useState } from "react";
import { Building2, ChevronDown, Download, MapPin, Users } from "lucide-react";

import {
  BadgeCategoria,
  BadgeEstado,
  BadgeUrgencia,
} from "@/components/eventos/badges";
import { PanelContacto } from "@/components/eventos/panel-contacto";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { NIVELES_URGENCIA, TIPOS_ORGANIZADOR } from "@/lib/constants";
import {
  formatearNumero,
  formatearRango,
  partesFecha,
  textoCuentaRegresiva,
} from "@/lib/eventos";
import type { EventoEnriquecido } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TarjetaEventoProps {
  evento: EventoEnriquecido;
  onVerDetalles: (evento: EventoEnriquecido) => void;
  onExportar: (evento: EventoEnriquecido) => void;
}

export function TarjetaEvento({
  evento,
  onVerDetalles,
  onExportar,
}: TarjetaEventoProps) {
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const urgencia = NIVELES_URGENCIA[evento.alerta.nivelUrgencia];
  const fecha = partesFecha(evento.fechaInicio);

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden py-0">
      {/* Franja superior: el color codifica la urgencia. */}
      <div className={cn("h-1 w-full", urgencia.punto)} aria-hidden />

      <CardHeader className="gap-3 px-4 pt-4">
        <div className="flex items-start gap-3">
          {/* Fecha destacada */}
          <div
            className={cn(
              "flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border",
              urgencia.fondo,
              urgencia.borde,
            )}
          >
            <span className="text-lg leading-none font-semibold tabular-nums">
              {fecha.dia}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium tracking-wide",
                urgencia.texto,
              )}
            >
              {fecha.mes}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <BadgeCategoria categoria={evento.categoria} />
            <h3 className="line-clamp-2 text-sm leading-snug font-semibold">
              {evento.titulo}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <BadgeUrgencia
            nivel={evento.alerta.nivelUrgencia}
            diasRestantes={evento.alerta.diasRestantes}
          />
          <BadgeEstado estado={evento.estado} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 px-4 py-4">
        <p className="text-muted-foreground text-xs">
          {formatearRango(evento.fechaInicio, evento.fechaFin)}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="truncate">{evento.sede.nombre}</p>
              <p className="text-muted-foreground truncate text-xs">
                {evento.sede.ciudad} · {evento.sede.direccion}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="truncate">{evento.organizador.nombre}</p>
              <p className="text-muted-foreground truncate text-xs">
                {TIPOS_ORGANIZADOR[evento.organizador.tipo].etiqueta}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground size-4 shrink-0" />
            <p className="tabular-nums">
              {formatearNumero(evento.estimadoAsistentes)}
              <span className="text-muted-foreground">
                {" "}
                asistentes estimados
              </span>
            </p>
          </div>
        </div>

        {evento.contactos.length > 0 && (
          <Collapsible open={contactoAbierto} onOpenChange={setContactoAbierto}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
              >
                <span>
                  {contactoAbierto
                    ? "Ocultar contacto"
                    : "Ver datos de contacto"}
                  <span className="text-muted-foreground ml-1.5 tabular-nums">
                    ({evento.contactos.length})
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    contactoAbierto && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
                {evento.contactos.map((contacto, indice) => (
                  <div key={contacto.id}>
                    {indice > 0 && <Separator className="mb-3" />}
                    <PanelContacto contacto={contacto} evento={evento} />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-t px-4 py-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onVerDetalles(evento)}
        >
          Ver detalles
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onExportar(evento)}
          aria-label={`Exportar ${evento.titulo}`}
          title="Exportar a CSV"
        >
          <Download className="size-4" />
        </Button>
      </CardFooter>

      <span className="sr-only">
        {textoCuentaRegresiva(evento.alerta.diasRestantes)}
      </span>
    </Card>
  );
}
