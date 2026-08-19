/**
 * Catastro completo de diarios nacionales y regionales de Chile.
 * Fuentes validadas por ANP (Asociación Nacional de la Prensa).
 */

export type MecanismoIngesta = "web_scraping" | "rss" | "pdf" | "manual";
export type PrioridadDiario = "alta" | "media" | "baja";
export type CategoriaDiario = "general" | "financiero" | "politica" | "especializado";

export interface DiarioConfig {
  id: string;
  nombre: string;
  region?: string; // solo para regionales
  mecanismo: MecanismoIngesta;
  url: string;
  selector?: string; // CSS selector para web scraping
  feedUrl?: string; // URL del RSS si existe
  cadenciaHoras: number;
  prioridad: PrioridadDiario;
  categoria: CategoriaDiario;
  notas?: string;
  eventosEsperados?: string[]; // tipos de eventos prioritarios
}

// ============================================================================
// DIARIOS NACIONALES
// ============================================================================

export const DIARIOS_NACIONALES: DiarioConfig[] = [
  // --- Impresos + Digitales (Alta circulación) ---
  {
    id: "diario-mercurio",
    nombre: "El Mercurio",
    mecanismo: "web_scraping",
    url: "https://www.elmercurio.com",
    cadenciaHoras: 2,
    prioridad: "alta",
    categoria: "general",
    notas: "Diario más antiguo. Múltiples secciones regionales.",
    eventosEsperados: ["seminario_congreso", "feria_industrial", "charla_capacitacion"],
  },
  {
    id: "diario-tercera",
    nombre: "La Tercera",
    mecanismo: "web_scraping",
    url: "https://www.latercera.com",
    cadenciaHoras: 2,
    prioridad: "alta",
    categoria: "general",
    eventosEsperados: ["seminario_congreso", "feria_industrial", "exposicion_comercial"],
  },
  {
    id: "emol",
    nombre: "EMOL",
    mecanismo: "web_scraping",
    url: "https://www.emol.com",
    cadenciaHoras: 2,
    prioridad: "alta",
    categoria: "general",
    notas: "Portal digital de El Mercurio. Altamente actualizado.",
  },
  {
    id: "biobiochile",
    nombre: "BioBioChile",
    mecanismo: "web_scraping",
    url: "https://www.biobiochile.cl",
    cadenciaHoras: 2,
    prioridad: "alta",
    categoria: "general",
    notas: "Red de radios con portal digital popular.",
  },
  {
    id: "diario-lun",
    nombre: "Las Últimas Noticias (LUN)",
    mecanismo: "web_scraping",
    url: "https://www.lun.com",
    cadenciaHoras: 3,
    prioridad: "media",
    categoria: "general",
    notas: "Enfocado en espectáculos, pero cubre eventos.",
  },

  // --- Diarios Especializados ---
  {
    id: "diario-financiero",
    nombre: "Diario Financiero",
    mecanismo: "web_scraping",
    url: "https://www.df.cl",
    cadenciaHoras: 4,
    prioridad: "media",
    categoria: "financiero",
    eventosEsperados: ["seminario_congreso", "charla_capacitacion"],
    notas: "Eventos corporativos y de negocios.",
  },
  {
    id: "diario-estrategia",
    nombre: "Estrategia",
    mecanismo: "web_scraping",
    url: "https://www.estrategia.cl",
    cadenciaHoras: 4,
    prioridad: "media",
    categoria: "financiero",
  },

  // --- Diarios Políticos (Menos eventos masivos) ---
  {
    id: "el-mostrador",
    nombre: "El Mostrador",
    mecanismo: "web_scraping",
    url: "https://www.elmostrador.cl",
    cadenciaHoras: 6,
    prioridad: "baja",
    categoria: "politica",
    notas: "Primer diario 100% digital. Menos eventos.",
  },
];

// ============================================================================
// DIARIOS REGIONALES (Por región)
// ============================================================================

export const DIARIOS_REGIONALES: DiarioConfig[] = [
  // Arica y Parinacota
  {
    id: "diario-estrella-arica",
    nombre: "La Estrella de Arica",
    region: "Arica y Parinacota",
    mecanismo: "web_scraping",
    url: "https://www.laestrellaarica.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },

  // Tarapacá
  {
    id: "diario-estrella-iquique",
    nombre: "La Estrella de Iquique",
    region: "Tarapacá",
    mecanismo: "web_scraping",
    url: "https://www.laestrellaiquique.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
  {
    id: "diario-longino",
    nombre: "El Longino",
    region: "Tarapacá",
    mecanismo: "web_scraping",
    url: "https://www.ellongino.cl",
    cadenciaHoras: 8,
    prioridad: "baja",
    categoria: "general",
  },

  // Antofagasta
  {
    id: "diario-mercurio-antofagasta",
    nombre: "El Mercurio de Antofagasta",
    region: "Antofagasta",
    mecanismo: "web_scraping",
    url: "https://www.mercurioantofagasta.cl",
    cadenciaHoras: 4,
    prioridad: "alta",
    categoria: "general",
  },
  {
    id: "diario-estrella-antofagasta",
    nombre: "La Estrella de Antofagasta",
    region: "Antofagasta",
    mecanismo: "web_scraping",
    url: "https://www.estrellaantofagasta.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
  {
    id: "diario-mercurio-calama",
    nombre: "El Mercurio de Calama",
    region: "Antofagasta",
    mecanismo: "web_scraping",
    url: "https://www.mercuriocalama.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
  {
    id: "diario-estrella-loa",
    nombre: "La Estrella del Loa (Calama)",
    region: "Antofagasta",
    mecanismo: "web_scraping",
    url: "https://www.estrellaloa.cl",
    cadenciaHoras: 8,
    prioridad: "baja",
    categoria: "general",
  },
  {
    id: "diario-nortero",
    nombre: "El Nortero (Digital)",
    region: "Antofagasta",
    mecanismo: "web_scraping",
    url: "https://www.elnortero.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },

  // Valparaíso
  {
    id: "diario-mercurio-valparaiso",
    nombre: "El Mercurio de Valparaíso",
    region: "Valparaíso",
    mecanismo: "web_scraping",
    url: "https://www.mercuriovalparaiso.cl",
    cadenciaHoras: 4,
    prioridad: "alta",
    categoria: "general",
  },
  {
    id: "diario-estrella-valparaiso",
    nombre: "La Estrella de Valparaíso",
    region: "Valparaíso",
    mecanismo: "web_scraping",
    url: "https://www.estrellavalparaiso.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },

  // Biobío
  {
    id: "diario-sur-concepcion",
    nombre: "El Sur (Concepción)",
    region: "Biobío",
    mecanismo: "web_scraping",
    url: "https://www.elsur.cl",
    cadenciaHoras: 4,
    prioridad: "alta",
    categoria: "general",
  },
  {
    id: "diario-concepcion",
    nombre: "Diario Concepción",
    region: "Biobío",
    mecanismo: "web_scraping",
    url: "https://www.diarioconcepcion.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },

  // Otras regiones (simplificadas para MVP)
  {
    id: "diario-mercurio-coquimbo",
    nombre: "Diario El Día (La Serena)",
    region: "Coquimbo",
    mecanismo: "web_scraping",
    url: "https://www.diarioeldia.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
  {
    id: "diario-el-centro",
    nombre: "Diario El Centro (Talca)",
    region: "Maule",
    mecanismo: "web_scraping",
    url: "https://www.diarioelcentro.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
  {
    id: "diario-austral-temuco",
    nombre: "El Austral de Temuco",
    region: "Araucanía",
    mecanismo: "web_scraping",
    url: "https://www.australtemuco.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
  {
    id: "diario-llanquihue",
    nombre: "El Llanquihue (Puerto Montt)",
    region: "Los Lagos",
    mecanismo: "web_scraping",
    url: "https://www.llanquihue.cl",
    cadenciaHoras: 6,
    prioridad: "media",
    categoria: "general",
  },
];

// ============================================================================
// EXPORTAR TODO
// ============================================================================

export const TODAS_LAS_FUENTES = [...DIARIOS_NACIONALES, ...DIARIOS_REGIONALES];

// Filtrar por prioridad
export const obtenerDiariossPorPrioridad = (prioridad: PrioridadDiario) =>
  TODAS_LAS_FUENTES.filter((d) => d.prioridad === prioridad);

// Filtrar por región (solo regionales)
export const obtenerDiariossPorRegion = (region: string) =>
  DIARIOS_REGIONALES.filter((d) => d.region === region);
