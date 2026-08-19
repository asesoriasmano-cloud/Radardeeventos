"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";

import { BadgeCategoria, BadgeEstado } from "@/components/eventos/badges";
import { PanelContacto } from "@/components/eventos/panel-contacto";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NIVELES_URGENCIA, TIPOS_ORGANIZADOR } from "@/lib/constants";
import {
  formatearNumero,
  formatearRango,
  textoCuentaRegresiva,
} from "@/lib/eventos";
import type { ColumnaOrdenable, EventoEnriquecido, Orden } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VistaTablaProps {
  eventos: EventoEnriquecido[];
  orden: Orden;
  onOrdenar: (columna: ColumnaOrdenable) => void;
  onVerDetalles: (evento: EventoEnriquecido) => void;
  onExportar: (evento: EventoEnriquecido) => void;
}

function CabeceraOrdenable({
  columna,
  orden,
  onOrdenar,
  className,
  children,
}: {
  columna: ColumnaOrdenable;
  orden: Orden;
  onOrdenar: (columna: ColumnaOrdenable) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const activa = orden.columna === columna;
  const Icono = !activa
    ? ArrowUpDown
    : orden.direccion === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <TableHead
      className={className}
      // aria-sort pertenece a la celda de cabecera, no al botón que hay dentro.
      aria-sort={
        activa
          ? orden.direccion === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onOrdenar(columna)}
        className={cn(
          "hover:text-foreground -mx-1 flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors",
          activa ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {children}
        <Icono
          className={cn("size-3", activa ? "opacity-100" : "opacity-40")}
        />
      </button>
    </TableHead>
  );
}

function CeldaContacto({ evento }: { evento: EventoEnriquecido }) {
  const [abierto, setAbierto] = useState(false);
  const contacto = evento.contactoPrincipal;

  if (!contacto) {
    return <span className="text-muted-foreground text-xs">Sin contacto</span>;
  }

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 h-7 gap-1.5 px-2 text-xs"
        >
          {abierto ? (
            <EyeOff className="size-3.5" />
          ) : (
            <Eye className="size-3.5" />
          )}
          <span className="max-w-[130px] truncate">
            {abierto ? "Ocultar" : contacto.nombreResponsable}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <PanelContacto contacto={contacto} evento={evento} />
      </PopoverContent>
    </Popover>
  );
}

export function VistaTabla({
  eventos,
  orden,
  onOrdenar,
  onVerDetalles,
  onExportar,
}: VistaTablaProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <CabeceraOrdenable
              columna="fechaInicio"
              orden={orden}
              onOrdenar={onOrdenar}
              className="w-[150px]"
            >
              Fecha
            </CabeceraOrdenable>
            <CabeceraOrdenable
              columna="titulo"
              orden={orden}
              onOrdenar={onOrdenar}
              className="min-w-[240px]"
            >
              Evento
            </CabeceraOrdenable>
            <CabeceraOrdenable
              columna="ciudad"
              orden={orden}
              onOrdenar={onOrdenar}
              className="min-w-[180px]"
            >
              Ciudad / Sede
            </CabeceraOrdenable>
            <CabeceraOrdenable
              columna="estimadoAsistentes"
              orden={orden}
              onOrdenar={onOrdenar}
              className="w-[120px] text-right"
            >
              Aforo
            </CabeceraOrdenable>
            <CabeceraOrdenable
              columna="organizador"
              orden={orden}
              onOrdenar={onOrdenar}
              className="min-w-[200px]"
            >
              Organizador
            </CabeceraOrdenable>
            <TableHead className="min-w-[170px]">Contacto principal</TableHead>
            <TableHead className="w-[110px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {eventos.map((evento) => {
            const urgencia = NIVELES_URGENCIA[evento.alerta.nivelUrgencia];

            return (
              <TableRow key={evento.id} className="align-top">
                <TableCell className="py-2.5">
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        urgencia.punto,
                        evento.alerta.nivelUrgencia === "urgente" &&
                          "animate-radar-pulse",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-xs whitespace-nowrap tabular-nums">
                        {formatearRango(evento.fechaInicio, evento.fechaFin)}
                      </p>
                      <p
                        className={cn(
                          "text-xs whitespace-nowrap tabular-nums",
                          urgencia.texto,
                        )}
                      >
                        {textoCuentaRegresiva(evento.alerta.diasRestantes)}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-2.5">
                  <p className="line-clamp-2 font-medium">{evento.titulo}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <BadgeCategoria categoria={evento.categoria} corta />
                    <BadgeEstado estado={evento.estado} />
                  </div>
                </TableCell>

                <TableCell className="py-2.5">
                  <p className="truncate">{evento.sede.ciudad}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {evento.sede.nombre}
                  </p>
                </TableCell>

                <TableCell className="py-2.5 text-right tabular-nums">
                  {formatearNumero(evento.estimadoAsistentes)}
                </TableCell>

                <TableCell className="py-2.5">
                  <p className="line-clamp-2">{evento.organizador.nombre}</p>
                  <p className="text-muted-foreground text-xs">
                    {TIPOS_ORGANIZADOR[evento.organizador.tipo].etiqueta}
                  </p>
                </TableCell>

                <TableCell className="py-2.5">
                  <CeldaContacto evento={evento} />
                </TableCell>

                <TableCell className="py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => onVerDetalles(evento)}
                        >
                          Ver
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles del evento</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => onExportar(evento)}
                          aria-label={`Exportar ${evento.titulo}`}
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Exportar a CSV</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
