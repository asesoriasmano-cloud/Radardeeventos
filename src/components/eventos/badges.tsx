import {
  CATEGORIAS_EVENTO,
  ESTADOS_EVENTO,
  NIVELES_URGENCIA,
} from "@/lib/constants";
import { textoCuentaRegresiva } from "@/lib/eventos";
import type { CategoriaEvento, EstadoEvento, NivelUrgencia } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BadgeCategoria({
  categoria,
  corta = false,
  className,
}: {
  categoria: CategoriaEvento;
  corta?: boolean;
  className?: string;
}) {
  const config = CATEGORIAS_EVENTO[categoria];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        config.fondo,
        config.borde,
        config.texto,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.punto)} aria-hidden />
      {corta ? config.etiquetaCorta : config.etiqueta}
    </span>
  );
}

export function BadgeUrgencia({
  nivel,
  diasRestantes,
  className,
}: {
  nivel: NivelUrgencia;
  diasRestantes: number;
  className?: string;
}) {
  const config = NIVELES_URGENCIA[nivel];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        config.fondo,
        config.borde,
        config.texto,
        className,
      )}
      title={config.descripcion}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          config.punto,
          nivel === "urgente" && "animate-radar-pulse",
        )}
        aria-hidden
      />
      {config.etiqueta}
      <span className="text-muted-foreground tabular-nums">
        · {textoCuentaRegresiva(diasRestantes)}
      </span>
    </span>
  );
}

export function BadgeEstado({
  estado,
  className,
}: {
  estado: EstadoEvento;
  className?: string;
}) {
  const config = ESTADOS_EVENTO[estado];

  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1.5 text-xs whitespace-nowrap",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.punto)} aria-hidden />
      {config.etiqueta}
    </span>
  );
}
