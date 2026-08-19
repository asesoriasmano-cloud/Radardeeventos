import { AlertTriangle, Antenna, RefreshCw, UserCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatearNumero, pluralizar } from "@/lib/eventos";
import { tiempoRelativo, type EstadisticasFuentes } from "@/lib/fuentes";
import { cn } from "@/lib/utils";

interface EstadoIngestaProps {
  estadisticas: EstadisticasFuentes;
}

/** Cuatro lecturas de salud de la ingesta, arriba de todo. */
export function EstadoIngesta({ estadisticas }: EstadoIngestaProps) {
  const problemas = estadisticas.porEstado.con_error + estadisticas.atrasadas;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="gap-0 py-0">
        <CardContent className="space-y-1 p-4">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Antenna className="size-3.5" />
            Fuentes en monitoreo
          </p>
          <p className="text-2xl leading-none font-semibold tabular-nums">
            {formatearNumero(estadisticas.total)}
          </p>
          <p className="text-muted-foreground text-xs">
            {pluralizar(estadisticas.porEstado.activa, "activa", "activas")} ·{" "}
            {pluralizar(estadisticas.porEstado.pausada, "pausada", "pausadas")}
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "gap-0 py-0",
          problemas > 0 && "border-urgente/50 bg-urgente-soft",
        )}
      >
        <CardContent className="space-y-1 p-4">
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              problemas > 0 ? "text-urgente" : "text-muted-foreground",
            )}
          >
            <AlertTriangle className="size-3.5" />
            Rastreos con problema
          </p>
          <p className="text-2xl leading-none font-semibold tabular-nums">
            {formatearNumero(problemas)}
          </p>
          <p className="text-muted-foreground text-xs">
            {estadisticas.porEstado.con_error} con error ·{" "}
            {estadisticas.atrasadas} fuera de cadencia
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-1 p-4">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <RefreshCw className="size-3.5" />
            Última sincronización
          </p>
          <p className="text-lg leading-tight font-semibold">
            {tiempoRelativo(estadisticas.minutosUltimaSync)}
          </p>
          <p className="text-muted-foreground text-xs">
            Corrida más reciente entre todas las fuentes
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardContent className="space-y-1.5 p-4">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <UserCheck className="size-3.5" />
            Extracción de contactos
          </p>
          <p className="text-2xl leading-none font-semibold tabular-nums">
            {estadisticas.tasaGlobal}%
          </p>
          <Progress value={estadisticas.tasaGlobal} className="h-1.5" />
          <p className="text-muted-foreground text-xs">
            {pluralizar(estadisticas.eventosConContacto, "evento")} con teléfono
            o correo, de {formatearNumero(estadisticas.eventosDetectados)}{" "}
            detectados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
