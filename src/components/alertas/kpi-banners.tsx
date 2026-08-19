import {
  CalendarClock,
  MapPinned,
  TrendingUp,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import type { Kpis } from "@/lib/metricas";
import { cn } from "@/lib/utils";

function Kpi({
  icono: Icono,
  etiqueta,
  valor,
  unidad,
  detalle,
  acento,
  children,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: string;
  unidad?: string;
  detalle: string;
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

        <p className="text-muted-foreground text-xs">{detalle}</p>
      </CardContent>
    </Card>
  );
}

export function KpiBanners({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        icono={CalendarClock}
        etiqueta="Próximos 15 días"
        valor={formatearNumero(kpis.eventosProximos15)}
        unidad={kpis.eventosProximos15 === 1 ? "evento" : "eventos"}
        detalle={`${formatearNumero(kpis.asistentesProximos15)} asistentes proyectados en esa ventana`}
        acento="bg-urgente-soft text-urgente"
      />

      <Kpi
        icono={TrendingUp}
        etiqueta={`Público congregado — ${kpis.etiquetaMes}`}
        valor={formatearNumero(kpis.publicoDelMes)}
        unidad="personas"
        detalle={`Suma de aforo estimado de ${kpis.eventosDelMes} eventos del mes`}
        acento="bg-cat-seminario-soft text-cat-seminario"
      />

      <Kpi
        icono={UserRoundCheck}
        etiqueta="Contactos accionables"
        valor={`${kpis.porcentajeAccionable}%`}
        detalle={
          kpis.eventosSinContacto > 0
            ? `${kpis.contactosAccionables} de ${kpis.contactosTotales} contactos con celular o correo · ${pluralizar(kpis.eventosSinContacto, "evento")} sin responsable identificado`
            : `${kpis.contactosAccionables} de ${kpis.contactosTotales} contactos con celular o correo directo`
        }
        acento="bg-cat-charla-soft text-cat-charla"
      >
        <Progress value={kpis.porcentajeAccionable} className="h-1.5" />
      </Kpi>

      <Kpi
        icono={MapPinned}
        etiqueta={`Mayor concentración — ${kpis.etiquetaMes}`}
        valor={kpis.ciudadLider?.ciudad ?? "—"}
        detalle={
          kpis.ciudadLider
            ? `${pluralizar(kpis.ciudadLider.eventos, "evento")} (${kpis.ciudadLider.participacion}% del mes) · ${formatearNumero(kpis.ciudadLider.asistentes)} asistentes`
            : "Sin eventos en el mes para el ámbito seleccionado"
        }
        acento="bg-planificacion-soft text-planificacion"
      />
    </div>
  );
}
