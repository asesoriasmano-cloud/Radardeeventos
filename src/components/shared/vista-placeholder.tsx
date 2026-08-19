import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VistaPlaceholderProps {
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  /** Bloques funcionales que esta vista alojará. */
  pendientes: string[];
}

export function VistaPlaceholder({
  titulo,
  descripcion,
  icono: Icono,
  pendientes,
}: VistaPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Icono className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{titulo}</h2>
            <Badge variant="outline" className="text-muted-foreground">
              En construcción
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            {descripcion}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pendientes.map((pendiente) => (
          <Card key={pendiente} className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">{pendiente}</CardTitle>
              <CardDescription className="text-xs">
                Marcador de posición
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/40 h-24 rounded-md border border-dashed" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
