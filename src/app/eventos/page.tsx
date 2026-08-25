import type { Metadata } from "next";

import { ExploradorEventos } from "@/components/eventos/explorador-eventos";
import { obtenerEventosDeBD } from "@/lib/eventos-db";
import { NAVEGACION } from "@/lib/navegacion";
import type { EventoEnriquecido } from "@/lib/types";

const vista = NAVEGACION[1];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export const dynamic = "force-dynamic";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let eventos: EventoEnriquecido[] = [];

  try {
    eventos = await obtenerEventosDeBD();
  } catch (error) {
    // La vista se degrada a vacía en vez de tumbar la ruta: la caída de
    // Supabase no debe dejar la aplicación sin navegación.
    console.error("Error cargando eventos de BD:", error);
  }

  return <ExploradorEventos eventos={eventos} busquedaInicial={q ?? ""} />;
}
