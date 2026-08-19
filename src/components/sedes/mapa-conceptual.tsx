"use client";

import { useMemo } from "react";
import { Compass } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NIVELES_ACTIVIDAD, TIPOS_SEDE } from "@/lib/constants";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import type { SedeEnriquecida } from "@/lib/sedes";
import { cn } from "@/lib/utils";

const ANCHO = 100;
const ALTO = 58;
const MARGEN = 9;

interface MapaConceptualProps {
  sedes: SedeEnriquecida[];
  seleccionada?: string;
  onSeleccionar: (sedeId: string) => void;
  ambito: string;
}

/**
 * Mapa **conceptual**: proyección lineal de lat/lng sobre un lienzo, sin
 * cartografía ni escala real. Sirve para leer dispersión y concentración
 * relativa entre recintos, no para navegar.
 */
export function MapaConceptual({
  sedes,
  seleccionada,
  onSeleccionar,
  ambito,
}: MapaConceptualProps) {
  const puntos = useMemo(() => {
    if (sedes.length === 0) return [];

    const lats = sedes.map((f) => f.sede.coordenadas.lat);
    const lngs = sedes.map((f) => f.sede.coordenadas.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const rangoLat = maxLat - minLat;
    const rangoLng = maxLng - minLng;
    const util = { x: ANCHO - MARGEN * 2, y: ALTO - MARGEN * 2 };

    // Con una sola sede (o varias alineadas en un eje) el rango es 0: en vez de
    // dividir por cero y mandarlo todo al borde, se centra ese eje.
    const proporcion = (valor: number, minimo: number, rango: number) =>
      rango === 0 ? 0.5 : (valor - minimo) / rango;

    const maxProximos = Math.max(
      1,
      ...sedes.map((f) => f.ocupacionProxima.length),
    );

    return sedes.map((ficha) => {
      const { lat, lng } = ficha.sede.coordenadas;
      return {
        ficha,
        // La latitud crece hacia el norte; el eje Y del SVG, hacia abajo.
        x: MARGEN + proporcion(lng, minLng, rangoLng) * util.x,
        y: MARGEN + proporcion(maxLat - lat, 0, rangoLat) * util.y,
        radio: 1.6 + (ficha.ocupacionProxima.length / maxProximos) * 3.4,
      };
    });
  }, [sedes]);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Compass className="text-muted-foreground size-4" />
            Distribución de recintos — {ambito}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            {(["alta", "media", "baja"] as const).map((nivel) => (
              <span
                key={nivel}
                className="text-muted-foreground flex items-center gap-1.5 text-xs"
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    NIVELES_ACTIVIDAD[nivel].punto,
                  )}
                  aria-hidden
                />
                {NIVELES_ACTIVIDAD[nivel].etiqueta}
              </span>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Esquema de posiciones relativas, no un mapa a escala. El tamaño del
          punto indica cuántos eventos tiene agendados el recinto; el color, su
          nivel de concentración histórica.
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {puntos.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
            Sin recintos para el ámbito seleccionado.
          </p>
        ) : (
          <div className="bg-muted/20 rounded-lg border p-2">
            <svg
              viewBox={`0 0 ${ANCHO} ${ALTO}`}
              className="h-auto w-full"
              role="img"
              aria-label={`Distribución esquemática de ${pluralizar(puntos.length, "recinto")} en ${ambito}`}
            >
              {/* Retícula de referencia, puramente visual. */}
              <defs>
                <pattern
                  id="reticula"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.15"
                    className="text-border"
                  />
                </pattern>
              </defs>
              <rect width={ANCHO} height={ALTO} fill="url(#reticula)" />

              {puntos.map(({ ficha, x, y, radio }) => {
                const activo = seleccionada === ficha.sede.id;
                const config = NIVELES_ACTIVIDAD[ficha.actividad];

                return (
                  <Tooltip key={ficha.sede.id}>
                    <TooltipTrigger asChild>
                      <g
                        role="button"
                        tabIndex={0}
                        aria-label={`${ficha.sede.nombre}, ${ficha.sede.comuna}`}
                        className="cursor-pointer outline-none"
                        onClick={() => onSeleccionar(ficha.sede.id)}
                        onKeyDown={(evento) => {
                          if (evento.key === "Enter" || evento.key === " ") {
                            evento.preventDefault();
                            onSeleccionar(ficha.sede.id);
                          }
                        }}
                      >
                        {activo && (
                          <circle
                            cx={x}
                            cy={y}
                            r={radio + 2.2}
                            className="fill-none stroke-primary"
                            strokeWidth="0.6"
                          />
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={radio}
                          className={cn(
                            config.punto.replace("bg-", "fill-"),
                            "transition-opacity",
                            activo
                              ? "opacity-100"
                              : "opacity-75 hover:opacity-100",
                          )}
                        />
                      </g>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{ficha.sede.nombre}</p>
                      <p className="text-muted-foreground">
                        {TIPOS_SEDE[ficha.sede.tipo].etiqueta} ·{" "}
                        {ficha.sede.comuna}
                      </p>
                      <p className="text-muted-foreground tabular-nums">
                        {pluralizar(ficha.ocupacionProxima.length, "evento")}{" "}
                        agendado
                        {ficha.ocupacionProxima.length === 1 ? "" : "s"} ·{" "}
                        {formatearNumero(ficha.asistentesProximos)} asistentes
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
