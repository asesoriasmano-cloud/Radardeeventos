import {
  Building2,
  CalendarCheck2,
  SmartphoneNfc,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TIPOS_ORGANIZADOR } from "@/lib/constants";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import type { EstadisticasDirectorio } from "@/lib/directorio";
import { cn } from "@/lib/utils";

function Bloque({
  icono: Icono,
  etiqueta,
  valor,
  unidad,
  acento,
  children,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: string;
  unidad?: string;
  acento: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md",
              acento,
            )}
          >
            <Icono className="size-4" />
          </div>
          <p className="text-muted-foreground text-xs font-medium">
            {etiqueta}
          </p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl leading-none font-semibold tabular-nums">
            {valor}
          </span>
          {unidad && (
            <span className="text-muted-foreground text-sm">{unidad}</span>
          )}
        </div>

        {children}
      </CardContent>
    </Card>
  );
}

export function EstadisticasDirectorioPanel({
  estadisticas,
}: {
  estadisticas: EstadisticasDirectorio;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Bloque
        icono={Building2}
        etiqueta="Entidades registradas"
        valor={formatearNumero(estadisticas.totalEntidades)}
        unidad="organizadores"
        acento="bg-cat-exposicion-soft text-cat-exposicion"
      >
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {estadisticas.porTipo.map(({ tipo, total }) => {
            const config = TIPOS_ORGANIZADOR[tipo];
            return (
              <span
                key={tipo}
                className="text-muted-foreground flex items-center gap-1.5 text-xs"
              >
                <span
                  className={cn("size-1.5 rounded-full", config.punto)}
                  aria-hidden
                />
                {config.etiquetaCorta}
                <span className="text-foreground font-medium tabular-nums">
                  {total}
                </span>
              </span>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs">
          {pluralizar(estadisticas.totalProductoras, "productora")} de eventos
          en la base
        </p>
      </Bloque>

      <Bloque
        icono={SmartphoneNfc}
        etiqueta="Móvil directo validado"
        valor={`${estadisticas.porcentajeMovilValidado}%`}
        acento="bg-cat-charla-soft text-cat-charla"
      >
        <Progress
          value={estadisticas.porcentajeMovilValidado}
          className="h-1.5"
        />
        <p className="text-muted-foreground text-xs">
          {estadisticas.movilesValidados} de {estadisticas.totalContactos}{" "}
          contactos tienen celular confirmado con el organizador
          {estadisticas.entidadesSinContacto > 0 &&
            ` · ${pluralizar(estadisticas.entidadesSinContacto, "entidad", "entidades")} sin contacto`}
        </p>
      </Bloque>

      <Bloque
        icono={CalendarCheck2}
        etiqueta="Historial de eventos asociados"
        valor={formatearNumero(estadisticas.eventosRegistrados)}
        unidad="eventos"
        acento="bg-planificacion-soft text-planificacion"
      >
        <p className="text-muted-foreground text-xs">
          Promedio de{" "}
          <span className="text-foreground font-medium tabular-nums">
            {estadisticas.promedioEventosPorEntidad}
          </span>{" "}
          eventos por entidad
          {estadisticas.entidadMasActiva && (
            <>
              {" · "}más activa:{" "}
              <span className="text-foreground">
                {estadisticas.entidadMasActiva.nombre}
              </span>{" "}
              ({estadisticas.entidadMasActiva.eventos})
            </>
          )}
        </p>
      </Bloque>
    </div>
  );
}
