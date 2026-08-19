import type { Metadata } from "next";

import { PanelFuentes } from "@/components/fuentes/panel-fuentes";
import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { obtenerFuentes } from "@/data/fuentes";
import { SEDES } from "@/data/sedes";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[4];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export default function FuentesPage() {
  return (
    <PanelFuentes
      fuentes={obtenerFuentes()}
      eventos={obtenerEventosEnriquecidos()}
      sedes={SEDES}
    />
  );
}
