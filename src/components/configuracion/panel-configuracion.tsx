"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { FiltrosDisparo } from "@/components/configuracion/filtros-disparo";
import { ImpactoConfiguracionPanel } from "@/components/configuracion/impacto-configuracion";
import { PlantillasProspeccion } from "@/components/configuracion/plantillas-prospeccion";
import { UmbralesAnticipacion } from "@/components/configuracion/umbrales-anticipacion";
import { Button } from "@/components/ui/button";
import { CONFIGURACION_POR_DEFECTO } from "@/lib/constants";
import {
  cargarConfiguracion,
  eventoDeMuestra,
  guardarConfiguracion,
  simularImpacto,
  validarConfiguracion,
} from "@/lib/configuracion";
import type { ConfiguracionAlertas, EventoEnriquecido } from "@/lib/types";

interface PanelConfiguracionProps {
  eventos: EventoEnriquecido[];
}

export function PanelConfiguracion({ eventos }: PanelConfiguracionProps) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionAlertas>(
    CONFIGURACION_POR_DEFECTO,
  );
  const [guardada, setGuardada] = useState<ConfiguracionAlertas>(
    CONFIGURACION_POR_DEFECTO,
  );

  // `localStorage` no existe en el servidor: se lee tras el montaje para que el
  // HTML del servidor y el del cliente coincidan.
  useEffect(() => {
    const almacenada = cargarConfiguracion();
    setConfiguracion(almacenada);
    setGuardada(almacenada);
  }, []);

  const problemas = useMemo(
    () => validarConfiguracion(configuracion),
    [configuracion],
  );

  const impacto = useMemo(
    () => simularImpacto(eventos, configuracion),
    [eventos, configuracion],
  );

  const muestra = useMemo(
    () => eventoDeMuestra(eventos, configuracion),
    [eventos, configuracion],
  );

  const sucia = useMemo(
    () => JSON.stringify(configuracion) !== JSON.stringify(guardada),
    [configuracion, guardada],
  );

  function cambiar(parcial: Partial<ConfiguracionAlertas>) {
    setConfiguracion((estado) => ({ ...estado, ...parcial }));
  }

  function guardar() {
    if (problemas.length > 0) {
      toast.error("Corrige los problemas antes de guardar.");
      return;
    }
    guardarConfiguracion(configuracion);
    setGuardada(configuracion);
    toast.success("Reglas de alerta guardadas en este navegador.");
  }

  function restablecer() {
    setConfiguracion(CONFIGURACION_POR_DEFECTO);
    // Si lo guardado ya era el valor por defecto no queda nada por guardar:
    // anunciar "falta guardar" con el botón deshabilitado sería contradictorio.
    const cambia =
      JSON.stringify(guardada) !== JSON.stringify(CONFIGURACION_POR_DEFECTO);
    toast.info(
      cambia
        ? "Valores por defecto cargados. Falta guardar."
        : "Ya estabas en los valores por defecto.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card/40 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
        <p className="text-muted-foreground text-xs">
          Las reglas se guardan en este navegador, no en un servidor: sirven
          para probar umbrales, no para publicarlos al equipo.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {sucia && (
            <span className="text-proximo text-xs">Cambios sin guardar</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-2"
            onClick={restablecer}
          >
            <RotateCcw className="size-4" />
            Restablecer
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={guardar}
            disabled={!sucia || problemas.length > 0}
          >
            <Save className="size-4" />
            Guardar reglas
          </Button>
        </div>
      </div>

      {problemas.length > 0 && (
        <div className="text-urgente bg-urgente-soft border-urgente/40 space-y-1 rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <TriangleAlert className="size-4" />
            Configuración incoherente
          </p>
          <ul className="ml-6 list-disc space-y-0.5 text-xs">
            {problemas.map((problema) => (
              <li key={problema}>{problema}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <UmbralesAnticipacion
          configuracion={configuracion}
          onCambio={cambiar}
        />
        <FiltrosDisparo configuracion={configuracion} onCambio={cambiar} />
      </div>

      <ImpactoConfiguracionPanel
        impacto={impacto}
        configuracion={configuracion}
      />

      <PlantillasProspeccion
        configuracion={configuracion}
        onCambio={cambiar}
        muestra={muestra}
      />
    </div>
  );
}
