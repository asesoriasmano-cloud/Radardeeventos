"use client";

import { es } from "date-fns/locale";
import {
  CalendarRange,
  ChevronDown,
  MapPinned,
  Search,
  Tags,
  X,
} from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  AFORO_MAX,
  AFORO_MIN,
  AFORO_PASO,
  CATEGORIAS,
  CATEGORIAS_EVENTO,
  CIUDADES,
} from "@/lib/constants";
import { formatearFecha, formatearNumero } from "@/lib/eventos";
import type { CategoriaEvento, FiltrosEventos } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BarraFiltrosProps {
  filtros: FiltrosEventos;
  onCambiar: (parcial: Partial<FiltrosEventos>) => void;
  onLimpiar: () => void;
  hayFiltrosActivos: boolean;
  resultados: number;
  total: number;
}

export function BarraFiltros({
  filtros,
  onCambiar,
  onLimpiar,
  hayFiltrosActivos,
  resultados,
  total,
}: BarraFiltrosProps) {
  const rango: DateRange | undefined = filtros.desde
    ? { from: filtros.desde, to: filtros.hasta }
    : undefined;

  function alternarCategoria(categoria: CategoriaEvento) {
    const seleccionadas = filtros.categorias.includes(categoria)
      ? filtros.categorias.filter((c) => c !== categoria)
      : [...filtros.categorias, categoria];
    onCambiar({ categorias: seleccionadas });
  }

  const etiquetaRango = filtros.desde
    ? `${formatearFecha(filtros.desde)}${filtros.hasta ? ` — ${formatearFecha(filtros.hasta)}` : ""}`
    : "Rango de fechas";

  const [aforoMin, aforoMax] = filtros.aforo;
  const aforoModificado = aforoMin !== AFORO_MIN || aforoMax !== AFORO_MAX;

  return (
    <div className="bg-card/40 space-y-3 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Buscador */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={filtros.busqueda}
            onChange={(evento) => onCambiar({ busqueda: evento.target.value })}
            placeholder="Buscar por evento, sede, organizador o contacto…"
            className="pl-9"
            aria-label="Buscar eventos"
          />
        </div>

        {/* Categorías (selección múltiple) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Tags className="text-muted-foreground size-4" />
              Categorías
              {filtros.categorias.length > 0 && (
                <Badge variant="secondary" className="px-1.5 tabular-nums">
                  {filtros.categorias.length}
                </Badge>
              )}
              <ChevronDown className="text-muted-foreground size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-2">
            <div className="space-y-0.5">
              {CATEGORIAS.map((categoria) => {
                const config = CATEGORIAS_EVENTO[categoria];
                const marcada = filtros.categorias.includes(categoria);

                return (
                  <Label
                    key={categoria}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm font-normal"
                  >
                    <Checkbox
                      checked={marcada}
                      onCheckedChange={() => alternarCategoria(categoria)}
                    />
                    <span
                      className={cn("size-2 rounded-full", config.punto)}
                      aria-hidden
                    />
                    <span className="flex-1">{config.etiqueta}</span>
                  </Label>
                );
              })}
            </div>
            {filtros.categorias.length > 0 && (
              <>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onCambiar({ categorias: [] })}
                >
                  Quitar selección
                </Button>
              </>
            )}
          </PopoverContent>
        </Popover>

        {/* Rango de fechas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("gap-2", !filtros.desde && "text-muted-foreground")}
            >
              <CalendarRange className="size-4" />
              <span className="max-w-[220px] truncate">{etiquetaRango}</span>
              <ChevronDown className="text-muted-foreground size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              locale={es}
              numberOfMonths={2}
              defaultMonth={filtros.desde}
              selected={rango}
              onSelect={(seleccion) =>
                onCambiar({ desde: seleccion?.from, hasta: seleccion?.to })
              }
            />
            <div className="flex justify-end border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onCambiar({ desde: undefined, hasta: undefined })
                }
              >
                Quitar fechas
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Ciudad — refleja el selector global del header */}
        <Select
          value={filtros.ciudad}
          onValueChange={(ciudad) => onCambiar({ ciudad })}
        >
          <SelectTrigger className="w-[180px]" aria-label="Ciudad">
            <MapPinned className="text-muted-foreground size-4" />
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ciudad / Región</SelectLabel>
              {CIUDADES.map((ciudad) => (
                <SelectItem key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Aforo estimado */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "gap-2",
                !aforoModificado && "text-muted-foreground",
              )}
            >
              Aforo
              <span className="tabular-nums">
                {formatearNumero(aforoMin)}–{formatearNumero(aforoMax)}
              </span>
              <ChevronDown className="text-muted-foreground size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Aforo estimado</p>
              <p className="text-muted-foreground text-xs">
                Asistentes proyectados por el organizador.
              </p>
            </div>
            <Slider
              value={filtros.aforo}
              min={AFORO_MIN}
              max={AFORO_MAX}
              step={AFORO_PASO}
              thumbLabels={["Aforo mínimo", "Aforo máximo"]}
              onValueChange={(valor) =>
                onCambiar({ aforo: [valor[0], valor[1]] as [number, number] })
              }
            />
            <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
              <span>{formatearNumero(aforoMin)}</span>
              <span>
                {formatearNumero(aforoMax)}
                {aforoMax === AFORO_MAX && "+"}
              </span>
            </div>
            {aforoModificado && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onCambiar({ aforo: [AFORO_MIN, AFORO_MAX] })}
              >
                Restablecer aforo
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-medium tabular-nums">
            {formatearNumero(resultados)}
          </span>{" "}
          de {formatearNumero(total)} eventos en la ventana seleccionada
        </p>

        {hayFiltrosActivos && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 gap-1.5 text-xs"
            onClick={onLimpiar}
          >
            <X className="size-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
