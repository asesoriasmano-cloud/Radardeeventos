"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { CIUDAD_POR_DEFECTO, VENTANA_POR_DEFECTO } from "@/lib/constants";
import type { VentanaTiempo } from "@/lib/types";

interface RadarContextValue {
  ciudad: string;
  setCiudad: (ciudad: string) => void;
  ventana: VentanaTiempo;
  setVentana: (ventana: VentanaTiempo) => void;
  /** Eventos urgentes o próximos dentro de la ventana y ciudad seleccionadas. */
  alertasActivas: number;
  sidebarColapsado: boolean;
  alternarSidebar: () => void;
}

const RadarContext = createContext<RadarContextValue | null>(null);

export function RadarProvider({ children }: { children: React.ReactNode }) {
  const [ciudad, setCiudad] = useState<string>(CIUDAD_POR_DEFECTO);
  const [ventana, setVentana] = useState<VentanaTiempo>(VENTANA_POR_DEFECTO);
  const [sidebarColapsado, setSidebarColapsado] = useState(false);

  const alertasActivas = useMemo(
    () =>
      obtenerEventosEnriquecidos().filter((evento) => {
        if (ciudad !== "todas" && evento.sede.ciudad !== ciudad) return false;
        const { diasRestantes, nivelUrgencia } = evento.alerta;
        if (diasRestantes < 0 || diasRestantes > ventana) return false;
        return nivelUrgencia === "urgente" || nivelUrgencia === "proximo";
      }).length,
    [ciudad, ventana],
  );

  const valor = useMemo<RadarContextValue>(
    () => ({
      ciudad,
      setCiudad,
      ventana,
      setVentana,
      alertasActivas,
      sidebarColapsado,
      alternarSidebar: () => setSidebarColapsado((estado) => !estado),
    }),
    [ciudad, ventana, alertasActivas, sidebarColapsado],
  );

  return (
    <RadarContext.Provider value={valor}>{children}</RadarContext.Provider>
  );
}

export function useRadar() {
  const contexto = useContext(RadarContext);
  if (!contexto) {
    throw new Error("useRadar debe usarse dentro de <RadarProvider>");
  }
  return contexto;
}
