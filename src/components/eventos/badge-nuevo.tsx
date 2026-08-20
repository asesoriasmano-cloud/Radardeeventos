/**
 * BadgeNuevo: Indica que el evento fue detectado en las últimas 24 horas.
 * Desaparece automáticamente después de 24h (por re-render, no por eliminación del evento).
 */

import { esEventoReciente } from "@/lib/eventos";
import type { Evento } from "@/lib/types";

interface BadgeNuevoProps {
  evento: Evento;
  ahora?: Date;
}

export function BadgeNuevo({ evento, ahora = new Date() }: BadgeNuevoProps) {
  if (!esEventoReciente(evento, ahora)) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-600 border border-green-500/30 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Nuevo
    </span>
  );
}
