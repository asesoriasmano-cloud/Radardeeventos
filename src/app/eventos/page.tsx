import type { Metadata } from "next";

import { ExploradorEventos } from "@/components/eventos/explorador-eventos";
import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[1];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

// La urgencia se calcula contra la fecha de hoy: renderizar por petición evita
// servir un HTML prerenderizado con días restantes obsoletos.
export const dynamic = "force-dynamic";

export default async function EventosPage({
  searchParams,
}: {
  // `?q=` permite llegar aquí con el buscador precargado, por ejemplo desde
  // una sede en /sedes para ver de un clic todos sus eventos.
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const eventos = obtenerEventosEnriquecidos();

  return <ExploradorEventos eventos={eventos} busquedaInicial={q ?? ""} />;
}
