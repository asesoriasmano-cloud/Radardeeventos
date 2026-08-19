import type {
  CanalNotificacion,
  CategoriaEvento,
  ConfiguracionAlertas,
  EstadoEvento,
  EstadoFuente,
  FamiliaFuente,
  FamiliaSede,
  MecanismoFuente,
  NivelActividad,
  NivelUrgencia,
  TipoOrganizador,
  TipoSede,
  VentanaTiempo,
} from "@/lib/types";

/** Ciudades y regiones cubiertas por el radar. */
export const CIUDADES = [
  { id: "todas", nombre: "Todas las ciudades", region: "—" },
  { id: "Santiago", nombre: "Santiago", region: "Metropolitana" },
  { id: "Valparaíso", nombre: "Valparaíso", region: "Valparaíso" },
  { id: "Viña del Mar", nombre: "Viña del Mar", region: "Valparaíso" },
  { id: "Concepción", nombre: "Concepción", region: "Biobío" },
  { id: "Antofagasta", nombre: "Antofagasta", region: "Antofagasta" },
  { id: "Calama", nombre: "Calama", region: "Antofagasta" },
  { id: "La Serena", nombre: "La Serena", region: "Coquimbo" },
  { id: "Rancagua", nombre: "Rancagua", region: "O'Higgins" },
  { id: "Talca", nombre: "Talca", region: "Maule" },
  { id: "Temuco", nombre: "Temuco", region: "La Araucanía" },
  { id: "Puerto Montt", nombre: "Puerto Montt", region: "Los Lagos" },
] as const;

export const CIUDAD_POR_DEFECTO = "todas";

/** Ventanas de anticipación disponibles en el header. */
export const VENTANAS_TIEMPO: Array<{
  valor: VentanaTiempo;
  etiqueta: string;
}> = [
  { valor: 7, etiqueta: "Próximos 7 días" },
  { valor: 15, etiqueta: "Próximos 15 días" },
  { valor: 30, etiqueta: "Próximos 30 días" },
  { valor: 60, etiqueta: "Próximos 60 días" },
];

export const VENTANA_POR_DEFECTO: VentanaTiempo = 60;

/**
 * Niveles de urgencia según días restantes.
 * Las clases apuntan a los tokens definidos en `globals.css`.
 */
export const NIVELES_URGENCIA: Record<
  NivelUrgencia,
  {
    etiqueta: string;
    descripcion: string;
    maxDias: number;
    texto: string;
    fondo: string;
    borde: string;
    punto: string;
  }
> = {
  urgente: {
    etiqueta: "Urgente",
    descripcion: "Menos de 7 días — la ventana de contacto está por cerrarse",
    maxDias: 7,
    texto: "text-urgente",
    fondo: "bg-urgente-soft",
    borde: "border-urgente/40",
    punto: "bg-urgente",
  },
  proximo: {
    etiqueta: "Próximo",
    descripcion: "8 a 20 días — momento óptimo para agendar",
    maxDias: 20,
    texto: "text-proximo",
    fondo: "bg-proximo-soft",
    borde: "border-proximo/40",
    punto: "bg-proximo",
  },
  planificacion: {
    etiqueta: "Planificación",
    descripcion: "21 a 60 días — preparar material y ruta de terreno",
    maxDias: 60,
    texto: "text-planificacion",
    fondo: "bg-planificacion-soft",
    borde: "border-planificacion/40",
    punto: "bg-planificacion",
  },
};

/** Orden de presentación de los niveles, del más apremiante al menos. */
export const ORDEN_URGENCIA: NivelUrgencia[] = [
  "urgente",
  "proximo",
  "planificacion",
];

/** Categorías de evento con su acento de color y etiqueta legible. */
export const CATEGORIAS_EVENTO: Record<
  CategoriaEvento,
  {
    etiqueta: string;
    etiquetaCorta: string;
    texto: string;
    fondo: string;
    borde: string;
    punto: string;
  }
> = {
  feria_industrial: {
    etiqueta: "Feria Industrial",
    etiquetaCorta: "Feria Ind.",
    texto: "text-cat-feria",
    fondo: "bg-cat-feria-soft",
    borde: "border-cat-feria/40",
    punto: "bg-cat-feria",
  },
  seminario_congreso: {
    etiqueta: "Seminario / Congreso Hotel",
    etiquetaCorta: "Seminario",
    texto: "text-cat-seminario",
    fondo: "bg-cat-seminario-soft",
    borde: "border-cat-seminario/40",
    punto: "bg-cat-seminario",
  },
  exposicion_comercial: {
    etiqueta: "Exposición Comercial",
    etiquetaCorta: "Expo",
    texto: "text-cat-exposicion",
    fondo: "bg-cat-exposicion-soft",
    borde: "border-cat-exposicion/40",
    punto: "bg-cat-exposicion",
  },
  charla_capacitacion: {
    etiqueta: "Charla / Capacitación",
    etiquetaCorta: "Charla",
    texto: "text-cat-charla",
    fondo: "bg-cat-charla-soft",
    borde: "border-cat-charla/40",
    punto: "bg-cat-charla",
  },
  evento_publico: {
    etiqueta: "Evento Público",
    etiquetaCorta: "Público",
    texto: "text-cat-publico",
    fondo: "bg-cat-publico-soft",
    borde: "border-cat-publico/40",
    punto: "bg-cat-publico",
  },
};

export const CATEGORIAS = Object.keys(CATEGORIAS_EVENTO) as CategoriaEvento[];

export const ESTADOS_EVENTO: Record<
  EstadoEvento,
  { etiqueta: string; texto: string; punto: string }
> = {
  confirmado: {
    etiqueta: "Confirmado",
    texto: "text-foreground",
    punto: "bg-cat-charla",
  },
  en_planificacion: {
    etiqueta: "En planificación",
    texto: "text-muted-foreground",
    punto: "bg-proximo",
  },
  finalizado: {
    etiqueta: "Finalizado",
    texto: "text-muted-foreground",
    punto: "bg-muted-foreground",
  },
};

export const TIPOS_ORGANIZADOR: Record<
  TipoOrganizador,
  { etiqueta: string; etiquetaCorta: string; punto: string; texto: string }
> = {
  productora: {
    etiqueta: "Productora de Eventos",
    etiquetaCorta: "Productora",
    punto: "bg-cat-exposicion",
    texto: "text-cat-exposicion",
  },
  gremial: {
    etiqueta: "Asociación Gremial",
    etiquetaCorta: "Gremial",
    punto: "bg-cat-seminario",
    texto: "text-cat-seminario",
  },
  hotel_centro_eventos: {
    etiqueta: "Hotel / Centro de Eventos",
    etiquetaCorta: "Hotel / Centro",
    punto: "bg-cat-feria",
    texto: "text-cat-feria",
  },
  universidad_instituto: {
    etiqueta: "Universidad / Instituto",
    etiquetaCorta: "Universidad",
    punto: "bg-cat-charla",
    texto: "text-cat-charla",
  },
  organismo_publico: {
    etiqueta: "Organismo Público",
    etiquetaCorta: "Público",
    punto: "bg-cat-publico",
    texto: "text-cat-publico",
  },
  empresa_privada: {
    etiqueta: "Empresa Privada",
    etiquetaCorta: "Privada",
    punto: "bg-muted-foreground",
    texto: "text-muted-foreground",
  },
};

export const TIPOS_ENTIDAD = Object.keys(
  TIPOS_ORGANIZADOR,
) as TipoOrganizador[];

export const TIPOS_SEDE: Record<
  TipoSede,
  { etiqueta: string; familia: FamiliaSede; punto: string; texto: string }
> = {
  hotel: {
    etiqueta: "Hotel con salones",
    familia: "hoteleria",
    punto: "bg-cat-feria",
    texto: "text-cat-feria",
  },
  centro_convenciones: {
    etiqueta: "Centro de Convenciones",
    familia: "ferial",
    punto: "bg-cat-exposicion",
    texto: "text-cat-exposicion",
  },
  recinto_ferial: {
    etiqueta: "Recinto Ferial",
    familia: "ferial",
    punto: "bg-cat-exposicion",
    texto: "text-cat-exposicion",
  },
  espacio_deportivo: {
    etiqueta: "Espacio Deportivo",
    familia: "publico",
    punto: "bg-cat-publico",
    texto: "text-cat-publico",
  },
  municipal: {
    etiqueta: "Explanada / Recinto Municipal",
    familia: "publico",
    punto: "bg-cat-publico",
    texto: "text-cat-publico",
  },
  universidad: {
    etiqueta: "Universidad / Instituto",
    familia: "academico",
    punto: "bg-cat-charla",
    texto: "text-cat-charla",
  },
  otro: {
    etiqueta: "Otro recinto",
    familia: "academico",
    punto: "bg-muted-foreground",
    texto: "text-muted-foreground",
  },
};

/** Las tres familias del directorio, más una para lo que no encaja. */
export const FAMILIAS_SEDE: Record<
  FamiliaSede,
  { etiqueta: string; descripcion: string }
> = {
  hoteleria: {
    etiqueta: "Hoteles con salones de eventos",
    descripcion:
      "Salones arrendables para seminarios, capacitaciones y congresos medianos.",
  },
  ferial: {
    etiqueta: "Recintos feriales y centros de convenciones",
    descripcion:
      "Grandes superficies para ferias industriales y exposiciones comerciales.",
  },
  publico: {
    etiqueta: "Espacios deportivos y explanadas municipales",
    descripcion:
      "Recintos abiertos de alta afluencia, normalmente con eventos gratuitos.",
  },
  academico: {
    etiqueta: "Universidades y otros recintos",
    descripcion: "Auditorios y espacios institucionales de uso mixto.",
  },
};

export const ORDEN_FAMILIAS: FamiliaSede[] = [
  "hoteleria",
  "ferial",
  "publico",
  "academico",
];

/**
 * Semáforo de concentración histórica de público.
 *
 * Deliberadamente NO usa el rojo/ámbar/verde clásico: en esta aplicación el
 * rojo significa "alerta crítica" y el ámbar "próximo". Una sede muy activa no
 * es una emergencia, así que la rampa va de gris (baja) a naranja (alta).
 */
export const NIVELES_ACTIVIDAD: Record<
  NivelActividad,
  {
    etiqueta: string;
    descripcion: string;
    texto: string;
    fondo: string;
    borde: string;
    punto: string;
    barras: number;
  }
> = {
  alta: {
    etiqueta: "Alta concentración",
    descripcion:
      "Recinto de uso intensivo: conviene monitorearlo de forma fija",
    texto: "text-cat-feria",
    fondo: "bg-cat-feria-soft",
    borde: "border-cat-feria/40",
    punto: "bg-cat-feria",
    barras: 3,
  },
  media: {
    etiqueta: "Actividad media",
    descripcion: "Uso regular a lo largo del año",
    texto: "text-planificacion",
    fondo: "bg-planificacion-soft",
    borde: "border-planificacion/40",
    punto: "bg-planificacion",
    barras: 2,
  },
  baja: {
    etiqueta: "Actividad baja",
    descripcion: "Uso ocasional o recinto recién incorporado al radar",
    texto: "text-muted-foreground",
    fondo: "bg-muted",
    borde: "border-border",
    punto: "bg-muted-foreground",
    barras: 1,
  },
};

/** Límites del filtro de aforo estimado, en asistentes. */
export const AFORO_MIN = 0;
export const AFORO_MAX = 20000;
export const AFORO_PASO = 250;

// ---------------------------------------------------------------------------
// Ingesta y fuentes
// ---------------------------------------------------------------------------

/** Las cinco familias de origen que vigila el radar, más la carga a mano. */
export const FAMILIAS_FUENTE: Record<
  FamiliaFuente,
  { etiqueta: string; descripcion: string; punto: string; texto: string }
> = {
  ticketera: {
    etiqueta: "Ticketeras",
    descripcion:
      "Venta de entradas: dan fecha y aforo con precisión, pero rara vez el organizador.",
    punto: "bg-cat-exposicion",
    texto: "text-cat-exposicion",
  },
  cartelera_hotel: {
    etiqueta: "Carteleras de hoteles",
    descripcion:
      "Agendas de salones. Buen origen de seminarios corporativos poco publicitados.",
    punto: "bg-cat-feria",
    texto: "text-cat-feria",
  },
  prensa_local: {
    etiqueta: "Diarios locales y boletines regionales",
    descripcion:
      "Cobertura amplia y desordenada: mucho ruido, pero detecta lo municipal.",
    punto: "bg-cat-seminario",
    texto: "text-cat-seminario",
  },
  gremial: {
    etiqueta: "Cámaras de comercio y gremios",
    descripcion:
      "Pocos eventos, muy bien documentados y casi siempre con responsable nombrado.",
    punto: "bg-cat-charla",
    texto: "text-cat-charla",
  },
  portal_ferias: {
    etiqueta: "Portales de ferias",
    descripcion:
      "Calendarios de recintos feriales y productoras. Alta anticipación.",
    punto: "bg-cat-publico",
    texto: "text-cat-publico",
  },
  manual: {
    etiqueta: "Carga manual",
    descripcion:
      "Lo que entra por el formulario de ingreso rápido o por aviso de terreno.",
    punto: "bg-muted-foreground",
    texto: "text-muted-foreground",
  },
};

export const ORDEN_FAMILIAS_FUENTE: FamiliaFuente[] = [
  "ticketera",
  "cartelera_hotel",
  "prensa_local",
  "gremial",
  "portal_ferias",
  "manual",
];

export const ESTADOS_FUENTE: Record<
  EstadoFuente,
  {
    etiqueta: string;
    descripcion: string;
    texto: string;
    fondo: string;
    borde: string;
    punto: string;
  }
> = {
  activa: {
    etiqueta: "Activa",
    descripcion: "Rastreo corriendo según su cadencia",
    texto: "text-cat-charla",
    fondo: "bg-cat-charla-soft",
    borde: "border-cat-charla/40",
    punto: "bg-cat-charla",
  },
  pausada: {
    etiqueta: "Pausada",
    descripcion: "Detenida a propósito: no aporta datos nuevos",
    texto: "text-muted-foreground",
    fondo: "bg-muted",
    borde: "border-border",
    punto: "bg-muted-foreground",
  },
  con_error: {
    etiqueta: "Con error",
    descripcion: "La última corrida falló: el origen está quedando ciego",
    texto: "text-urgente",
    fondo: "bg-urgente-soft",
    borde: "border-urgente/50",
    punto: "bg-urgente",
  },
};

export const MECANISMOS_FUENTE: Record<MecanismoFuente, string> = {
  sitio_web: "Raspado de sitio",
  rss: "RSS",
  api: "API",
  redes_sociales: "Redes sociales",
  boletin_municipal: "Boletín municipal",
  carga_manual: "Carga manual",
};

// ---------------------------------------------------------------------------
// Configuración de alertas
// ---------------------------------------------------------------------------

export const CANALES_NOTIFICACION: Record<
  CanalNotificacion,
  { etiqueta: string; descripcion: string }
> = {
  panel: {
    etiqueta: "Panel de alertas",
    descripcion: "Siempre disponible dentro del radar",
  },
  correo: {
    etiqueta: "Correo",
    descripcion: "Resumen despachado al responsable de la ciudad",
  },
  whatsapp: {
    etiqueta: "WhatsApp",
    descripcion: "Aviso corto al equipo de terreno",
  },
};

/** Rango del control de aforo mínimo para disparar alertas. */
export const AFORO_UMBRAL_MAX = 3000;
export const AFORO_UMBRAL_PASO = 25;

/** Anticipación máxima configurable: coincide con la ventana más larga. */
export const ANTICIPACION_MAX = 90;

/**
 * Variables admitidas en las plantillas de prospección. Se sustituyen contra
 * un evento real en la vista previa.
 */
export const VARIABLES_PLANTILLA: Array<{
  clave: string;
  descripcion: string;
}> = [
  { clave: "{contacto}", descripcion: "Nombre de pila del responsable" },
  { clave: "{organizacion}", descripcion: "Entidad que organiza" },
  { clave: "{evento}", descripcion: "Título del evento" },
  { clave: "{fecha}", descripcion: "Fecha de inicio" },
  { clave: "{dias}", descripcion: "Días que faltan" },
  { clave: "{sede}", descripcion: "Recinto" },
  { clave: "{ciudad}", descripcion: "Ciudad" },
  { clave: "{aforo}", descripcion: "Asistentes estimados" },
];

export const CONFIGURACION_POR_DEFECTO: ConfiguracionAlertas = {
  avisoPrincipalDias: 30,
  recordatorioDias: 7,
  aforoMinimo: 100,
  categorias: CATEGORIAS,
  canales: ["panel", "correo"],
  plantillaWhatsApp:
    'Hola {contacto}, le escribo de parte del equipo comercial. Vimos que {organizacion} realiza "{evento}" el {fecha} en {sede}, {ciudad}. Trabajamos con eventos de ese tamaño ({aforo} asistentes estimados) y quería consultarle si ya tienen resuelto el apoyo para esa jornada. ¿Le acomoda que lo llame esta semana?',
  asuntoCorreo: "{evento} — {fecha} en {sede}",
  plantillaCorreo:
    'Estimado/a {contacto}:\n\nEscribo por "{evento}", que {organizacion} realizará el {fecha} en {sede} ({ciudad}), con cerca de {aforo} asistentes estimados.\n\nFaltan {dias} días para la jornada y quisiera saber si ya está definido el apoyo para esa fecha. Puedo enviarle una propuesta breve o coordinar una llamada de quince minutos, lo que le resulte más cómodo.\n\nQuedo atento/a a su respuesta.',
};

/** Clave de localStorage donde vive la configuración editada por el usuario. */
export const CLAVE_CONFIGURACION = "radar-eventos:configuracion-alertas";
