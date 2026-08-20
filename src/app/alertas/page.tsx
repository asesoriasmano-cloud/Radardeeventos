import type { Metadata } from "next";

import { PanelAlertas } from "@/components/alertas/panel-alertas";
import { obtenerEventosDeBD } from "@/lib/eventos-db";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[0];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  let eventos = [];

  try {
    eventos = await obtenerEventosDeBD();
  } catch (error) {
    console.error("Error cargando eventos de BD:", error);
    eventos = [];
  }

  return <PanelAlertas eventos={eventos} />;
}
