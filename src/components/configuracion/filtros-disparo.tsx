"use client";

import { Filter, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  AFORO_UMBRAL_MAX,
  AFORO_UMBRAL_PASO,
  CANALES_NOTIFICACION,
  CATEGORIAS,
  CATEGORIAS_EVENTO,
} from "@/lib/constants";
import { formatearNumero } from "@/lib/eventos";
import type {
  CanalNotificacion,
  CategoriaEvento,
  ConfiguracionAlertas,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface FiltrosDisparoProps {
  configuracion: ConfiguracionAlertas;
  onCambio: (parcial: Partial<ConfiguracionAlertas>) => void;
}

const CANALES = Object.keys(CANALES_NOTIFICACION) as CanalNotificacion[];

export function FiltrosDisparo({
  configuracion,
  onCambio,
}: FiltrosDisparoProps) {
  function alternarCategoria(categoria: CategoriaEvento) {
    const activas = configuracion.categorias.includes(categoria)
      ? configuracion.categorias.filter((c) => c !== categoria)
      : [...configuracion.categorias, categoria];
    onCambio({ categorias: activas });
  }

  function alternarCanal(canal: CanalNotificacion) {
    const activos = configuracion.canales.includes(canal)
      ? configuracion.canales.filter((c) => c !== canal)
      : [...configuracion.canales, canal];
    onCambio({ canales: activos });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Filter className="text-muted-foreground size-4" />
          Qué merece una alerta
        </CardTitle>
        <CardDescription className="text-xs">
          Un evento tiene que pasar los dos filtros —aforo y categoría— para
          disparar cualquier notificación.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="flex items-center gap-1.5 text-xs">
              <Users className="size-3.5" />
              Aforo mínimo
            </Label>
            <span className="text-sm font-semibold tabular-nums">
              {configuracion.aforoMinimo === 0
                ? "Sin mínimo"
                : `${formatearNumero(configuracion.aforoMinimo)} personas`}
            </span>
          </div>
          <Slider
            value={[configuracion.aforoMinimo]}
            min={0}
            max={AFORO_UMBRAL_MAX}
            step={AFORO_UMBRAL_PASO}
            onValueChange={([valor]) => onCambio({ aforoMinimo: valor })}
            thumbLabels={["Aforo mínimo para disparar una alerta"]}
          />
          <p className="text-muted-foreground text-xs">
            Solo se notifican eventos con al menos esa asistencia estimada. Los
            aforos del radar son estimaciones de la ingesta, no cifras
            oficiales.
          </p>
        </div>

        <Separator />

        <fieldset className="space-y-3">
          <legend className="text-xs font-medium">Categorías vigiladas</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIAS.map((categoria) => {
              const config = CATEGORIAS_EVENTO[categoria];
              const activa = configuracion.categorias.includes(categoria);

              return (
                <label
                  key={categoria}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-sm transition-colors",
                    activa ? config.borde : "border-border",
                    activa && config.fondo,
                  )}
                >
                  {/* El <label> envolvente no nombra a un <button>: Radix
                      renderiza el checkbox como botón, así que el nombre
                      accesible tiene que ir explícito. */}
                  <Checkbox
                    checked={activa}
                    onCheckedChange={() => alternarCategoria(categoria)}
                    aria-label={config.etiqueta}
                  />
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      config.punto,
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 truncate">{config.etiqueta}</span>
                </label>
              );
            })}
          </div>
          {configuracion.categorias.length === 0 && (
            <p className="text-urgente text-xs">
              Sin categorías vigiladas el sistema queda mudo.
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 text-xs"
            onClick={() =>
              onCambio({
                categorias:
                  configuracion.categorias.length === CATEGORIAS.length
                    ? []
                    : CATEGORIAS,
              })
            }
          >
            {configuracion.categorias.length === CATEGORIAS.length
              ? "Desmarcar todas"
              : "Marcar todas"}
          </Button>
        </fieldset>

        <Separator />

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium">
            Canales de notificación
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {CANALES.map((canal) => {
              const config = CANALES_NOTIFICACION[canal];
              const activo = configuracion.canales.includes(canal);

              return (
                <label
                  key={canal}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5"
                >
                  <Checkbox
                    checked={activo}
                    onCheckedChange={() => alternarCanal(canal)}
                    className="mt-0.5"
                    aria-label={config.etiqueta}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm">{config.etiqueta}</span>
                    <span className="text-muted-foreground block text-xs">
                      {config.descripcion}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
