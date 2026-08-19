import type { Metadata } from "next";

import { DirectorioContactos } from "@/components/contactos/directorio-contactos";
import { obtenerEventosEnriquecidos } from "@/data/eventos";
import { CONTACTOS, ORGANIZADORES } from "@/data/organizadores";
import { NAVEGACION } from "@/lib/navegacion";

const vista = NAVEGACION[2];

export const metadata: Metadata = {
  title: vista.titulo,
  description: vista.descripcion,
};

export default function ContactosPage() {
  const eventos = obtenerEventosEnriquecidos();

  return (
    <DirectorioContactos
      organizadores={ORGANIZADORES}
      contactos={CONTACTOS}
      eventos={eventos}
    />
  );
}
