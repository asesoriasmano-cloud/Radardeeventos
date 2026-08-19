"use client";

import { usePathname } from "next/navigation";
import { Bell, CalendarRange, MapPinned } from "lucide-react";

import { useRadar } from "@/components/providers/radar-provider";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CIUDADES, VENTANAS_TIEMPO } from "@/lib/constants";
import { NAVEGACION } from "@/lib/navegacion";
import type { VentanaTiempo } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { ciudad, setCiudad, ventana, setVentana, alertasActivas } = useRadar();

  const vista = NAVEGACION.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="bg-background/80 sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-md md:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">
          {vista?.titulo ?? "Radar de Eventos"}
        </h1>
        <p className="text-muted-foreground truncate text-xs">
          {vista?.descripcion ?? "Sistema de rastreo de congregaciones"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={ciudad} onValueChange={setCiudad}>
          <SelectTrigger
            className="w-[150px] md:w-[190px]"
            aria-label="Ciudad o región"
          >
            <MapPinned className="text-muted-foreground size-4" />
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ciudad / Región</SelectLabel>
              {CIUDADES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                  {c.region !== "—" && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      · {c.region}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={String(ventana)}
          onValueChange={(valor) => setVentana(Number(valor) as VentanaTiempo)}
        >
          <SelectTrigger
            className="w-[150px] md:w-[180px]"
            aria-label="Ventana de tiempo"
          >
            <CalendarRange className="text-muted-foreground size-4" />
            <SelectValue placeholder="Ventana" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ventana de anticipación</SelectLabel>
              {VENTANAS_TIEMPO.map((v) => (
                <SelectItem key={v.valor} value={String(v.valor)}>
                  {v.etiqueta}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`${alertasActivas} alertas activas`}
              className="hover:bg-accent focus-visible:ring-ring relative flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Bell
                className={cn(
                  "size-4",
                  alertasActivas > 0
                    ? "text-alerta-critica animate-radar-pulse"
                    : "text-muted-foreground",
                )}
              />
              <Badge
                variant={alertasActivas > 0 ? "destructive" : "secondary"}
                className="px-1.5 tabular-nums"
              >
                {alertasActivas}
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Alertas activas en la ventana seleccionada
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
