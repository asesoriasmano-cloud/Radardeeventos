"use client";

import Link from "next/link";
import { CalendarDays, ListFilter, MapPin, Phone, Users } from "lucide-react";

import { SemaforoActividad } from "@/components/sedes/semaforo-actividad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TIPOS_SEDE } from "@/lib/constants";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import { descripcionSalones, type SedeEnriquecida } from "@/lib/sedes";
import { cn } from "@/lib/utils";

interface TarjetaSedeProps {
  ficha: SedeEnriquecida;
  destacada?: boolean;
  onVerFicha: (sedeId: string) => void;
}

export function TarjetaSede({
  ficha,
  destacada,
  onVerFicha,
}: TarjetaSedeProps) {
  const { sede } = ficha;
  const tipo = TIPOS_SEDE[sede.tipo];
  const salones = descripcionSalones(sede);
  const proximo = ficha.ocupacionProxima[0];

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-0 py-0 transition-colors",
        destacada && "ring-primary/50 ring-2",
      )}
    >
      <CardContent className="flex-1 space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium",
                tipo.texto,
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", tipo.punto)}
                aria-hidden
              />
              {tipo.etiqueta}
            </span>
            <h3 className="mt-1 text-sm leading-snug font-semibold">
              {sede.nombre}
            </h3>
          </div>
          <SemaforoActividad
            nivel={ficha.actividad}
            puntaje={ficha.puntajeActividad}
            className="mt-0.5 shrink-0"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="text-muted-foreground flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0">
              {sede.direccion}
              <span className="block">
                {sede.comuna}
                {sede.comuna !== sede.ciudad && `, ${sede.ciudad}`}
              </span>
            </span>
          </p>

          {sede.telefonoEventos && (
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 shrink-0" />
              <a
                href={`tel:${sede.telefonoEventos.replace(/\s/g, "")}`}
                className="hover:text-primary tabular-nums transition-colors"
              >
                {sede.telefonoEventos}
              </a>
            </p>
          )}

          <p className="text-muted-foreground flex items-start gap-1.5">
            <Users className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0">
              {salones ?? "Sin salones registrados"}
              {sede.capacidadMaxima && (
                <span className="block tabular-nums">
                  Aforo máximo: {formatearNumero(sede.capacidadMaxima)}
                </span>
              )}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="text-muted-foreground size-3.5" />
            <span className="font-medium tabular-nums">
              {ficha.ocupacionProxima.length}
            </span>
            <span className="text-muted-foreground">
              agendado{ficha.ocupacionProxima.length === 1 ? "" : "s"}
            </span>
          </span>
          <span className="text-muted-foreground tabular-nums">
            {ficha.eventosDelMes.length} este mes
          </span>
          <span className="text-muted-foreground tabular-nums">
            {pluralizar(ficha.historicos.length, "edición", "ediciones")} previa
            {ficha.historicos.length === 1 ? "" : "s"}
          </span>
        </div>

        {proximo && (
          <p className="text-muted-foreground truncate text-xs">
            Próximo: <span className="text-foreground">{proximo.titulo}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-t px-4 py-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onVerFicha(sede.id)}
        >
          Ver ficha
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5"
          title={`Filtrar eventos de ${sede.nombre}`}
        >
          <Link href={`/eventos?q=${encodeURIComponent(sede.nombre)}`}>
            <ListFilter className="size-4" />
            Eventos
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
