import type { Metadata } from "next";

import { PanelConfiguracion } from "@/components/configuracion/panel-configuracion";
import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[5];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export default function ConfiguracionPage() {
  return <PanelConfiguracion eventos={obtenerEventosEnriquecidos()} />;
}
