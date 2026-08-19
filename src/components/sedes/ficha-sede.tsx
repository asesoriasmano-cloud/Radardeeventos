"use client";

import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  ListFilter,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

import {
  BadgeCategoria,
  BadgeEstado,
  BadgeUrgencia,
} from "@/components/eventos/badges";
import { SemaforoActividad } from "@/components/sedes/semaforo-actividad";
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
import { NIVELES_ACTIVIDAD, TIPOS_SEDE } from "@/lib/constants";
import { formatearNumero, formatearRango, pluralizar } from "@/lib/eventos";
import {
  HORIZONTE_OCUPACION,
  descripcionSalones,
  nombreRegion,
  type SedeEnriquecida,
} from "@/lib/sedes";
import { cn } from "@/lib/utils";

interface FichaSedeProps {
  ficha: SedeEnriquecida | null;
  abierta: boolean;
  onOpenChange: (abierta: boolean) => void;
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

export function FichaSede({ ficha, abierta, onOpenChange }: FichaSedeProps) {
  if (!ficha) return null;

  const { sede } = ficha;
  const tipo = TIPOS_SEDE[sede.tipo];
  const actividad = NIVELES_ACTIVIDAD[ficha.actividad];
  const salones = descripcionSalones(sede);

  return (
    <Dialog open={abierta} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
                tipo.texto,
              )}
            >
              <span
                className={cn("size-1.5 rounded-full", tipo.punto)}
                aria-hidden
              />
              {tipo.etiqueta}
            </span>
            <SemaforoActividad
              nivel={ficha.actividad}
              puntaje={ficha.puntajeActividad}
              conEtiqueta
            />
          </div>

          <DialogTitle className="text-left text-lg">{sede.nombre}</DialogTitle>

          <DialogDescription className="text-left">
            {pluralizar(ficha.eventos.length, "evento")} detectado
            {ficha.eventos.length === 1 ? "" : "s"} en el radar ·{" "}
            {formatearNumero(
              ficha.asistentesHistoricos + ficha.asistentesProximos,
            )}{" "}
            asistentes acumulados
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Dato icono={MapPin} etiqueta="Dirección">
            <p>{sede.direccion}</p>
            <p className="text-muted-foreground text-xs">
              {sede.comuna}
              {sede.comuna !== sede.ciudad && `, ${sede.ciudad}`} ·{" "}
              {nombreRegion(sede.region)}
            </p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {sede.coordenadas.lat.toFixed(4)},{" "}
              {sede.coordenadas.lng.toFixed(4)}
            </p>
          </Dato>

          <Dato icono={Users} etiqueta="Capacidad">
            <p>{salones ?? "Sin salones registrados"}</p>
            {sede.capacidadMaxima && (
              <p className="text-muted-foreground text-xs tabular-nums">
                Aforo máximo del recinto:{" "}
                {formatearNumero(sede.capacidadMaxima)} personas
              </p>
            )}
          </Dato>

          <Dato icono={Phone} etiqueta="Administración de eventos">
            {sede.telefonoEventos ? (
              <a
                href={`tel:${sede.telefonoEventos.replace(/\s/g, "")}`}
                className="hover:text-primary tabular-nums transition-colors"
              >
                {sede.telefonoEventos}
              </a>
            ) : (
              <span className="text-muted-foreground text-xs italic">
                Teléfono no detectado
              </span>
            )}
          </Dato>

          <Dato icono={Mail} etiqueta="Correo de eventos">
            {sede.emailEventos ? (
              <a
                href={`mailto:${sede.emailEventos}?subject=${encodeURIComponent(
                  `Consulta de disponibilidad — ${sede.nombre}`,
                )}`}
                className="hover:text-primary truncate transition-colors"
              >
                {sede.emailEventos}
              </a>
            ) : (
              <span className="text-muted-foreground text-xs italic">
                Correo no detectado
              </span>
            )}
          </Dato>
        </div>

        <div
          className={cn(
            "rounded-md border px-3 py-2 text-xs",
            actividad.fondo,
            actividad.borde,
          )}
        >
          <p className={cn("font-medium", actividad.texto)}>
            {actividad.etiqueta} · índice {ficha.puntajeActividad}/100
          </p>
          <p className="text-muted-foreground mt-0.5">
            {actividad.descripcion}. Calculado sobre volumen de eventos y de
            público, en relación con el resto de los recintos del radar.
          </p>
        </div>

        <Separator />

        <section className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="text-muted-foreground size-4" />
              Ocupación detectada — próximos {HORIZONTE_OCUPACION} días
              <span className="text-muted-foreground tabular-nums">
                ({ficha.ocupacionProxima.length})
              </span>
            </h3>
            {ficha.diasOcupados > 0 && (
              <span className="text-muted-foreground text-xs tabular-nums">
                {pluralizar(ficha.diasOcupados, "jornada")} ocupada
                {ficha.diasOcupados === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {ficha.ocupacionProxima.length === 0 ? (
            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
              Sin eventos detectados en el horizonte. Buen momento para
              consultar disponibilidad.
            </p>
          ) : (
            <ul className="space-y-2">
              {ficha.ocupacionProxima.map((evento) => (
                <li
                  key={evento.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border p-2.5"
                >
                  <BadgeUrgencia
                    nivel={evento.alerta.nivelUrgencia}
                    diasRestantes={evento.alerta.diasRestantes}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {evento.titulo}
                  </span>
                  <BadgeEstado estado={evento.estado} />
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatearRango(evento.fechaInicio, evento.fechaFin)} ·{" "}
                    {formatearNumero(evento.estimadoAsistentes)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {ficha.historicos.length > 0 && (
          <>
            <Separator />
            <section className="space-y-2">
              <h3 className="text-sm font-medium">
                Historial en el recinto
                <span className="text-muted-foreground ml-1.5 tabular-nums">
                  ({ficha.historicos.length})
                </span>
              </h3>
              <ul className="space-y-2">
                {ficha.historicos.map((evento) => (
                  <li
                    key={evento.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border p-2.5"
                  >
                    <BadgeCategoria categoria={evento.categoria} corta />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {evento.titulo}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {formatearRango(evento.fechaInicio, evento.fechaFin)} ·{" "}
                      {formatearNumero(evento.estimadoAsistentes)} asistentes
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {sede.sitioWeb ? (
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href={sede.sitioWeb} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Sitio del recinto
              </a>
            </Button>
          ) : (
            <span />
          )}
          <Button asChild size="sm" className="gap-2">
            <Link href={`/eventos?q=${encodeURIComponent(sede.nombre)}`}>
              <ListFilter className="size-4" />
              Ver todos sus eventos
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
