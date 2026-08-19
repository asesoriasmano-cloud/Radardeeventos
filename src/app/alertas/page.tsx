import type { Metadata } from "next";

import { PanelAlertas } from "@/components/alertas/panel-alertas";
import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[0];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export default function AlertasPage() {
  const eventos = obtenerEventosEnriquecidos();

  return <PanelAlertas eventos={eventos} />;
}
