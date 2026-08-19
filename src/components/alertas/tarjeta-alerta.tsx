"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  MapPin,
  TriangleAlert,
  UserRoundSearch,
  Users,
} from "lucide-react";

import { BadgeCategoria, BadgeUrgencia } from "@/components/eventos/badges";
import { PanelContacto } from "@/components/eventos/panel-contacto";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  brechasDeContacto,
  formatearNumero,
  formatearRango,
} from "@/lib/eventos";
import { BANDAS } from "@/lib/metricas";
import type { BandaAlerta, EventoEnriquecido } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TarjetaAlertaProps {
  evento: EventoEnriquecido;
  banda: BandaAlerta;
}

export function TarjetaAlerta({ evento, banda }: TarjetaAlertaProps) {
  const [abierto, setAbierto] = useState(false);
  const config = BANDAS[banda];
  const brechas = brechasDeContacto(evento);
  const sinContacto = evento.contactos.length === 0;

  return (
    <Card
      className={cn(
        "gap-0 border-l-4 py-0 transition-colors",
        config.borde,
        banda === "critica" && "border-l-urgente",
        banda === "oportunidad" && "border-l-proximo",
        banda === "mediano" && "border-l-planificacion",
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <BadgeUrgencia
            nivel={evento.alerta.nivelUrgencia}
            diasRestantes={evento.alerta.diasRestantes}
          />
          <BadgeCategoria categoria={evento.categoria} corta />
        </div>

        <div>
          <h3 className="text-sm leading-snug font-semibold">
            {evento.titulo}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {formatearRango(evento.fechaInicio, evento.fechaFin)}
          </p>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
            <p className="min-w-0 truncate">
              {evento.sede.ciudad}
              <span className="text-muted-foreground">
                {" "}
                · {evento.sede.nombre}
              </span>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Building2 className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
            <p className="text-muted-foreground min-w-0 truncate">
              {evento.organizador.nombre}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground size-3.5 shrink-0" />
            <p className="text-muted-foreground tabular-nums">
              {formatearNumero(evento.estimadoAsistentes)} asistentes estimados
            </p>
          </div>
        </div>

        {/* Lo que bloquea la gestión se muestra antes que el botón de acción. */}
        {brechas.length > 0 && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs",
              sinContacto
                ? "border-urgente/40 bg-urgente-soft text-urgente"
                : "border-proximo/40 bg-proximo-soft text-proximo",
            )}
          >
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            <p>
              {sinContacto
                ? "Sin responsable identificado — hay que investigar antes de contactar."
                : `Datos incompletos: ${brechas.join(" · ").toLowerCase()}.`}
            </p>
          </div>
        )}

        {sinContacto ? (
          // Sin responsable no hay a quién escribir, pero sí a dónde mirar: el
          // sitio del organizador si se conoce, o una búsqueda web si no.
          <Button asChild variant="outline" size="sm" className="w-full gap-2">
            <a
              href={
                evento.organizador.sitioWeb ??
                `https://www.google.com/search?q=${encodeURIComponent(
                  `"${evento.organizador.nombre}" contacto eventos`,
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <UserRoundSearch className="size-4" />
              {evento.organizador.sitioWeb
                ? "Buscar en el sitio del organizador"
                : "Buscar responsable en la web"}
            </a>
          </Button>
        ) : (
          <Collapsible open={abierto} onOpenChange={setAbierto}>
            <CollapsibleTrigger asChild>
              <Button
                size="sm"
                variant={banda === "critica" ? "default" : "secondary"}
                className="w-full justify-between"
              >
                <span>
                  {abierto ? "Ocultar contacto" : "Contactar organizador"}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    abierto && "rotate-180",
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
    </Card>
  );
}
