import type {
  EstadoFuente,
  FamiliaFuente,
  Fuente,
  ID,
  MecanismoFuente,
} from "@/lib/types";

/**
 * Semilla de fuentes. Igual que con los eventos, los instantes se declaran de
 * forma relativa (minutos desde la última corrida) para que el panel muestre
 * siempre sincronizaciones creíbles, sin importar cuándo se ejecute la demo.
 */
interface SemillaFuente {
  id: ID;
  nombre: string;
  familia: FamiliaFuente;
  mecanismo: MecanismoFuente;
  url?: string;
  estado: EstadoFuente;
  /** Minutos desde la última corrida. Sin valor = todavía no ha corrido. */
  haceMinutos?: number;
  cadenciaMinutos: number;
  cobertura: string[];
  anticipacionTipica: number;
  ultimoError?: string;
  notas?: string;
}

const SEMILLAS: SemillaFuente[] = [
  // --- Ticketeras ----------------------------------------------------------
  {
    id: "fue-puntoticket",
    nombre: "Puntoticket — Cartelera nacional",
    familia: "ticketera",
    mecanismo: "api",
    url: "https://www.puntoticket.com",
    estado: "activa",
    haceMinutos: 24,
    cadenciaMinutos: 60,
    cobertura: ["todas"],
    anticipacionTipica: 45,
    notas:
      "Entrega fecha y aforo con precisión, pero casi nunca nombra al organizador.",
  },
  {
    id: "fue-passline",
    nombre: "Passline — Eventos profesionales",
    familia: "ticketera",
    mecanismo: "sitio_web",
    url: "https://www.passline.com",
    estado: "activa",
    haceMinutos: 96,
    cadenciaMinutos: 180,
    cobertura: ["todas"],
    anticipacionTipica: 30,
  },
  {
    id: "fue-ticketplus",
    nombre: "Ticketplus — Listado regional",
    familia: "ticketera",
    mecanismo: "sitio_web",
    url: "https://ticketplus.cl",
    estado: "con_error",
    haceMinutos: 1_735,
    cadenciaMinutos: 180,
    cobertura: ["todas"],
    anticipacionTipica: 35,
    ultimoError:
      "HTTP 403 en el listado regional: el sitio incorporó verificación anti-bot.",
  },

  // --- Carteleras de hoteles ----------------------------------------------
  {
    id: "fue-enjoy-agenda",
    nombre: "Enjoy — Agenda de salones y convenciones",
    familia: "cartelera_hotel",
    mecanismo: "sitio_web",
    url: "https://www.enjoy.cl/convenciones",
    estado: "activa",
    haceMinutos: 310,
    cadenciaMinutos: 720,
    cobertura: ["Antofagasta", "Viña del Mar", "Santiago"],
    anticipacionTipica: 25,
    notas:
      "Mejor origen de seminarios corporativos que no se anuncian en prensa.",
  },
  {
    id: "fue-cadena-hoteles",
    nombre: "Sheraton, Crowne y Diego de Almagro — Carteleras",
    familia: "cartelera_hotel",
    mecanismo: "sitio_web",
    estado: "activa",
    haceMinutos: 430,
    cadenciaMinutos: 720,
    cobertura: ["Santiago", "Viña del Mar", "Calama", "Rancagua"],
    anticipacionTipica: 20,
  },
  {
    id: "fue-dreams-cumbres",
    nombre: "Dreams y Cumbres — Salones del sur",
    familia: "cartelera_hotel",
    mecanismo: "sitio_web",
    estado: "pausada",
    haceMinutos: 14_400,
    cadenciaMinutos: 1_440,
    cobertura: ["Temuco", "Puerto Montt"],
    anticipacionTipica: 22,
    notas:
      "Pausada a propósito: el calendario dejó de publicar al organizador y venía generando fichas sin responsable.",
  },

  // --- Diarios locales y boletines regionales ------------------------------
  {
    id: "fue-prensa-norte",
    nombre: "El Mercurio de Antofagasta y El Nortero",
    familia: "prensa_local",
    mecanismo: "rss",
    estado: "activa",
    haceMinutos: 52,
    cadenciaMinutos: 240,
    cobertura: ["Antofagasta", "Calama", "La Serena"],
    anticipacionTipica: 12,
  },
  {
    id: "fue-prensa-centro-sur",
    nombre: "Diario Concepción, El Centro y Austral Temuco",
    familia: "prensa_local",
    mecanismo: "rss",
    estado: "activa",
    haceMinutos: 118,
    cadenciaMinutos: 240,
    cobertura: ["Concepción", "Talca", "Temuco", "Puerto Montt"],
    anticipacionTipica: 14,
  },
  {
    id: "fue-boletines-municipales",
    nombre: "Boletines municipales y de gobiernos regionales",
    familia: "prensa_local",
    mecanismo: "boletin_municipal",
    estado: "activa",
    haceMinutos: 640,
    cadenciaMinutos: 1_440,
    cobertura: ["todas"],
    anticipacionTipica: 18,
    notas:
      "Única vía para los eventos públicos comunales; el texto llega sin estructura.",
  },

  // --- Cámaras de comercio y gremios --------------------------------------
  {
    id: "fue-gremios-industriales",
    nombre: "AIA, SOFOFA, SOFO y CChC — Agendas gremiales",
    familia: "gremial",
    mecanismo: "sitio_web",
    estado: "activa",
    haceMinutos: 78,
    cadenciaMinutos: 360,
    cobertura: ["todas"],
    anticipacionTipica: 55,
    notas:
      "Pocos eventos y muy documentados: casi siempre traen responsable con cargo.",
  },
  {
    id: "fue-camaras-comercio",
    nombre: "Cámaras de Comercio regionales",
    familia: "gremial",
    mecanismo: "rss",
    estado: "con_error",
    haceMinutos: 2_920,
    cadenciaMinutos: 720,
    cobertura: ["Concepción", "Talca", "Puerto Montt"],
    anticipacionTipica: 40,
    ultimoError:
      "El feed de la Cámara de Comercio de Talca devuelve XML malformado.",
  },

  // --- Portales de ferias --------------------------------------------------
  {
    id: "fue-portales-feriales",
    nombre: "Espacio Riesco, FISA y Sur Activo — Calendarios",
    familia: "portal_ferias",
    mecanismo: "sitio_web",
    estado: "activa",
    haceMinutos: 205,
    cadenciaMinutos: 720,
    cobertura: ["Santiago", "Concepción"],
    anticipacionTipica: 70,
  },
  {
    id: "fue-productoras",
    nombre: "Productoras y organizadores en redes",
    familia: "portal_ferias",
    mecanismo: "redes_sociales",
    estado: "activa",
    haceMinutos: 36,
    cadenciaMinutos: 120,
    cobertura: ["todas"],
    anticipacionTipica: 20,
    notas:
      "Alta frecuencia y alto ruido: exige revisión humana antes de alertar.",
  },

  // --- Carga manual --------------------------------------------------------
  {
    id: "fue-manual",
    nombre: "Ingreso manual del equipo",
    familia: "manual",
    mecanismo: "carga_manual",
    estado: "activa",
    cadenciaMinutos: 0,
    cobertura: ["todas"],
    anticipacionTipica: 10,
    notas:
      "Recibe lo que carga el formulario de ingreso rápido y los avisos de terreno.",
  },
];

/**
 * De qué origen provino cada evento del radar. Vive aquí y no dentro de cada
 * semilla de evento para poder auditar la procedencia completa de un vistazo.
 */
export const ORIGEN_POR_EVENTO: Record<string, ID> = {
  "evt-001": "fue-gremios-industriales",
  "evt-002": "fue-gremios-industriales",
  "evt-003": "fue-cadena-hoteles",
  "evt-004": "fue-prensa-centro-sur",
  "evt-005": "fue-portales-feriales",
  "evt-006": "fue-gremios-industriales",
  "evt-007": "fue-dreams-cumbres",
  "evt-008": "fue-camaras-comercio",
  "evt-009": "fue-boletines-municipales",
  "evt-010": "fue-enjoy-agenda",
  "evt-011": "fue-camaras-comercio",
  "evt-012": "fue-gremios-industriales",
  "evt-013": "fue-portales-feriales",
  "evt-014": "fue-portales-feriales",
  "evt-015": "fue-prensa-norte",
  "evt-016": "fue-prensa-centro-sur",
  "evt-017": "fue-cadena-hoteles",
  "evt-018": "fue-boletines-municipales",
  "evt-019": "fue-cadena-hoteles",
  "evt-020": "fue-portales-feriales",
  "evt-021": "fue-prensa-centro-sur",
  "evt-022": "fue-cadena-hoteles",
  "evt-023": "fue-puntoticket",
  "evt-024": "fue-portales-feriales",
  "evt-025": "fue-gremios-industriales",
  "evt-026": "fue-enjoy-agenda",
  "evt-027": "fue-prensa-centro-sur",
  "evt-028": "fue-enjoy-agenda",
  "evt-029": "fue-boletines-municipales",
  "evt-030": "fue-prensa-centro-sur",
  "evt-031": "fue-passline",
  "evt-032": "fue-dreams-cumbres",
  "evt-033": "fue-enjoy-agenda",
  "evt-034": "fue-productoras",
  "evt-035": "fue-portales-feriales",
  "evt-036": "fue-gremios-industriales",
  "evt-037": "fue-gremios-industriales",
  "evt-038": "fue-portales-feriales",
  "evt-039": "fue-boletines-municipales",
  "evt-040": "fue-enjoy-agenda",
  "evt-041": "fue-prensa-centro-sur",
  "evt-042": "fue-productoras",
  "evt-043": "fue-boletines-municipales",
  "evt-044": "fue-ticketplus",
  "evt-045": "fue-boletines-municipales",
  "evt-046": "fue-boletines-municipales",
  "evt-047": "fue-boletines-municipales",
};

const MS_POR_MINUTO = 60_000;

/** Fuentes con la última sincronización resuelta contra la hora actual. */
export function obtenerFuentes(hoy = new Date()): Fuente[] {
  return SEMILLAS.map((semilla) => {
    const { haceMinutos, ...resto } = semilla;
    return {
      ...resto,
      ultimaEjecucion:
        haceMinutos === undefined
          ? undefined
          : new Date(hoy.getTime() - haceMinutos * MS_POR_MINUTO).toISOString(),
    } satisfies Fuente;
  });
}

/** Anticipación declarada de cada origen, usada para fechar la detección. */
export const ANTICIPACION_POR_FUENTE: Record<string, number> =
  Object.fromEntries(SEMILLAS.map((s) => [s.id, s.anticipacionTipica]));
