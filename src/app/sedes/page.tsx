import type { Metadata } from "next";

import { PanelSedes } from "@/components/sedes/panel-sedes";
import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { SEDES } from "@/data/sedes";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[3];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export default function SedesPage() {
  const eventos = obtenerEventosEnriquecidos();

  return <PanelSedes sedes={SEDES} eventos={eventos} />;
}
