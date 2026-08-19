import {
  Bell,
  CalendarSearch,
  Contact,
  MapPin,
  Radio,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export interface ItemNavegacion {
  href: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
}

export const NAVEGACION: ItemNavegacion[] = [
  {
    href: "/alertas",
    titulo: "Alertas y Timeline",
    descripcion: "Qué exige atención hoy, ordenado por anticipación",
    icono: Bell,
  },
  {
    href: "/eventos",
    titulo: "Eventos por Ciudad",
    descripcion: "Explorador de actividades detectadas y filtradas",
    icono: CalendarSearch,
  },
  {
    href: "/contactos",
    titulo: "Organizadores y Contactos",
    descripcion: "Directorio de responsables con teléfono y correo",
    icono: Contact,
  },
  {
    href: "/sedes",
    titulo: "Mapa y Sedes Frecuentes",
    descripcion: "Recintos recurrentes y concentración geográfica",
    icono: MapPin,
  },
  {
    href: "/fuentes",
    titulo: "Ingesta & Fuentes",
    descripcion: "Estado del monitoreo y salud de cada origen",
    icono: Radio,
  },
  {
    href: "/configuracion",
    titulo: "Configuración de Alertas",
    descripcion: "Reglas de anticipación, canales y umbrales",
    icono: Settings2,
  },
];
