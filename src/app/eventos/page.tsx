import type { Metadata } from "next";

import { ExploradorEventos } from "@/components/eventos/explorador-eventos";
import { obtenerEventosDeBD } from "@/lib/eventos-db";
import { NAVEGACION } from "@/lib/navegacion";

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
  let eventos = [];

  try {
    eventos = await obtenerEventosDeBD();
  } catch (error) {
    console.error("Error cargando eventos de BD:", error);
    // Fallback a datos vacíos si falla Supabase
    eventos = [];
  }

  return <ExploradorEventos eventos={eventos} busquedaInicial={q ?? ""} />;
}
