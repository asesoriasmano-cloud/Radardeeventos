import { ANTICIPACION_POR_FUENTE, ORIGEN_POR_EVENTO } from "@/data/fuentes";
import { CONTACTOS, ORGANIZADORES } from "@/data/organizadores";
import { SEDES } from "@/data/sedes";
import { aMedianoche, enriquecerEvento } from "@/lib/eventos";
import type {
  CategoriaEvento,
  ContactoClave,
  Evento,
  EventoEnriquecido,
  EstadoEvento,
  Organizador,
  Sede,
} from "@/lib/types";

/**
 * Semilla de eventos. Las fechas se declaran como desplazamiento en días
 * respecto de hoy para que el conjunto de demostración siempre tenga eventos
 * urgentes, próximos y en planificación, sin importar cuándo se ejecute.
 */
interface SemillaEvento {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaEvento;
  estado: EstadoEvento;
  /** Días desde hoy hasta el inicio. Negativo = ya ocurrió. */
  offsetInicio: number;
  /** Duración en días. 1 = evento de una jornada. */
  duracion: number;
  estimadoAsistentes: number;
  sedeId: string;
  organizadorId: string;
  contactoIds: string[];
  urlOficial?: string;
  esPago?: boolean;
  etiquetas: string[];
}

const SEMILLAS: SemillaEvento[] = [
  // --- Urgentes (menos de 7 días) -----------------------------------------
  {
    id: "evt-001",
    titulo: "Seminario de Mantenimiento Predictivo en Minería",
    descripcion:
      "Jornada técnica sobre monitoreo de condición y analítica de fallas en plantas concentradoras. Cupos limitados para proveedores.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 2,
    duracion: 1,
    estimadoAsistentes: 320,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-aia",
    contactoIds: ["con-aia-1", "con-aia-2"],
    urlOficial: "https://aia.cl/seminario-mantenimiento",
    esPago: true,
    etiquetas: ["minería", "mantenimiento", "proveedores"],
  },
  {
    id: "evt-002",
    titulo: "Rueda de Negocios Proveedores Mineros El Loa",
    descripcion:
      "Encuentro de matchmaking entre pequeñas empresas locales y áreas de abastecimiento de la gran minería.",
    categoria: "exposicion_comercial",
    estado: "confirmado",
    offsetInicio: 4,
    duracion: 2,
    estimadoAsistentes: 480,
    sedeId: "sede-diego-calama",
    organizadorId: "org-codelco-prov",
    contactoIds: ["con-loa-1"],
    etiquetas: ["minería", "rueda de negocios", "pymes"],
  },
  {
    id: "evt-003",
    titulo: "Capacitación en Prevención de Riesgos para Obras Civiles",
    descripcion:
      "Curso presencial de actualización normativa en seguridad para supervisores de faena.",
    categoria: "charla_capacitacion",
    estado: "confirmado",
    offsetInicio: 5,
    duracion: 1,
    estimadoAsistentes: 140,
    sedeId: "sede-diego-rancagua",
    organizadorId: "org-mutual",
    contactoIds: ["con-mutual-1"],
    esPago: false,
    etiquetas: ["construcción", "seguridad", "capacitación"],
  },
  {
    id: "evt-004",
    titulo: "Expo Vino Maule — Muestra de Productores",
    descripcion:
      "Exposición comercial de viñas del valle del Maule con degustación abierta y ronda de compradores.",
    categoria: "exposicion_comercial",
    estado: "confirmado",
    offsetInicio: 6,
    duracion: 3,
    estimadoAsistentes: 5200,
    sedeId: "sede-talca-costanera",
    organizadorId: "org-vinos-chile",
    contactoIds: ["con-vinos-1"],
    urlOficial: "https://vinosdechile.cl/expo-maule",
    esPago: true,
    etiquetas: ["vitivinícola", "exportación", "degustación"],
  },

  {
    // Sin contactos: la ingesta detectó el evento pero no al responsable.
    id: "evt-028",
    titulo: "Expo Novios y Eventos Sociales Viña 2026",
    descripcion:
      "Exposición comercial de proveedores de eventos. Detectada por el calendario del hotel; falta identificar al responsable.",
    categoria: "exposicion_comercial",
    estado: "confirmado",
    offsetInicio: 3,
    duracion: 2,
    estimadoAsistentes: 2600,
    sedeId: "sede-enjoy-vina",
    organizadorId: "org-nexo-eventos",
    contactoIds: [],
    etiquetas: ["eventos sociales", "proveedores", "sin contacto"],
  },
  {
    // Contacto incompleto: sin celular ni correo directo.
    id: "evt-029",
    titulo: "Mesa Técnica de Transición Energética Regional",
    descripcion:
      "Jornada cerrada con generadoras, distribuidoras y seremi de Energía.",
    categoria: "charla_capacitacion",
    estado: "confirmado",
    offsetInicio: 6,
    duracion: 1,
    estimadoAsistentes: 95,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-acera",
    contactoIds: ["con-acera-1"],
    etiquetas: ["energía", "regulación", "mesa técnica"],
  },

  // --- Próximos (8 a 20 días) ---------------------------------------------
  {
    id: "evt-005",
    titulo: "Simposio Regional de Cardiología del Sur",
    descripcion:
      "Actualización clínica en insuficiencia cardíaca y arritmias, con invitados internacionales.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 9,
    duracion: 2,
    estimadoAsistentes: 410,
    sedeId: "sede-sur-activo",
    organizadorId: "org-soc-cardio",
    contactoIds: ["con-cardio-1"],
    urlOficial: "https://sochicar.cl/simposio-sur",
    esPago: true,
    etiquetas: ["salud", "cardiología", "médicos"],
  },
  {
    id: "evt-006",
    titulo: "Feria Agrícola y Ganadera SOFO Invierno",
    descripcion:
      "Muestra de maquinaria agrícola, genética bovina y servicios para el agro de La Araucanía.",
    categoria: "feria_industrial",
    estado: "confirmado",
    offsetInicio: 11,
    duracion: 4,
    estimadoAsistentes: 11000,
    sedeId: "sede-sofo",
    organizadorId: "org-sofo",
    contactoIds: ["con-sofo-1"],
    urlOficial: "https://sofo.cl/feria-invierno",
    esPago: true,
    etiquetas: ["agro", "maquinaria", "ganadería"],
  },
  {
    id: "evt-007",
    titulo: "Congreso de Acuicultura y Salmonicultura Sustentable",
    descripcion:
      "Tres jornadas sobre sanidad, alimentación y certificaciones de exportación del salmón chileno.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 13,
    duracion: 3,
    estimadoAsistentes: 480,
    sedeId: "sede-cumbres-puerto-montt",
    organizadorId: "org-salmonchile",
    contactoIds: ["con-salmon-1"],
    urlOficial: "https://salmonchile.cl/congreso",
    esPago: true,
    etiquetas: ["acuicultura", "exportación", "sustentabilidad"],
  },
  {
    id: "evt-008",
    titulo: "Encuentro Empresarial Biobío 2026",
    descripcion:
      "Panel de proyecciones económicas regionales con autoridades y gerentes generales de la zona.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 15,
    duracion: 1,
    estimadoAsistentes: 620,
    sedeId: "sede-sur-activo",
    organizadorId: "org-camara-conce",
    contactoIds: ["con-cpcc-1"],
    esPago: true,
    etiquetas: ["economía", "networking", "gerencia"],
  },
  {
    id: "evt-009",
    titulo: "Fiesta Costumbrista de Barrio Puerto",
    descripcion:
      "Actividad municipal abierta con gastronomía típica, artesanía local y escenario en vivo.",
    categoria: "evento_publico",
    estado: "confirmado",
    offsetInicio: 17,
    duracion: 2,
    estimadoAsistentes: 7500,
    sedeId: "sede-parque-italia",
    organizadorId: "org-muni-valpo",
    contactoIds: ["con-valpo-1"],
    esPago: false,
    etiquetas: ["municipal", "gastronomía", "público general"],
  },
  {
    id: "evt-010",
    titulo: "Expo Energías Renovables Norte Grande",
    descripcion:
      "Exposición comercial de tecnología solar, almacenamiento y transmisión para el norte de Chile.",
    categoria: "exposicion_comercial",
    estado: "confirmado",
    offsetInicio: 19,
    duracion: 3,
    estimadoAsistentes: 3400,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-acera",
    contactoIds: ["con-acera-1"],
    urlOficial: "https://acera.cl/expo-norte",
    esPago: true,
    etiquetas: ["energía", "solar", "almacenamiento"],
  },
  {
    id: "evt-011",
    titulo: "Taller de Digitalización para Pymes del Maule",
    descripcion:
      "Capacitación práctica en facturación electrónica, comercio digital y postulación a fondos Corfo.",
    categoria: "charla_capacitacion",
    estado: "en_planificacion",
    offsetInicio: 20,
    duracion: 1,
    estimadoAsistentes: 180,
    sedeId: "sede-talca-costanera",
    organizadorId: "org-corfo-maule",
    contactoIds: ["con-corfo-1"],
    esPago: false,
    etiquetas: ["pymes", "digitalización", "fondos públicos"],
  },

  // --- Planificación (21 a 60 días) ---------------------------------------
  {
    id: "evt-012",
    titulo: "EXPONOR — Feria Internacional de la Industria Minera",
    descripcion:
      "El mayor encuentro ferial minero del norte: 1.200 expositores y delegaciones internacionales.",
    categoria: "feria_industrial",
    estado: "confirmado",
    offsetInicio: 24,
    duracion: 4,
    estimadoAsistentes: 18000,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-aia",
    contactoIds: ["con-aia-1"],
    urlOficial: "https://exponor.cl",
    esPago: true,
    etiquetas: ["minería", "internacional", "expositores"],
  },
  {
    id: "evt-013",
    titulo: "Congreso Nacional de Medicina Interna",
    descripcion:
      "Cuatro jornadas con simposios satélite patrocinados por la industria farmacéutica.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 27,
    duracion: 4,
    estimadoAsistentes: 1400,
    sedeId: "sede-casapiedra",
    organizadorId: "org-colmed",
    contactoIds: ["con-colmed-1", "con-colmed-2"],
    urlOficial: "https://colegiomedico.cl/congreso-interna",
    esPago: true,
    etiquetas: ["salud", "farmacéutica", "simposios"],
  },
  {
    id: "evt-014",
    titulo: "Feria Internacional del Aire y del Espacio — Zona Comercial",
    descripcion:
      "Pabellón de proveedores industriales y aeronáuticos dentro del recinto ferial.",
    categoria: "feria_industrial",
    estado: "en_planificacion",
    offsetInicio: 31,
    duracion: 5,
    estimadoAsistentes: 16500,
    sedeId: "sede-espacio-riesco",
    organizadorId: "org-fisa",
    contactoIds: ["con-fisa-1", "con-fisa-2"],
    esPago: true,
    etiquetas: ["aeronáutica", "industrial", "internacional"],
  },
  {
    id: "evt-015",
    titulo: "Seminario de Riego Tecnificado y Escasez Hídrica",
    descripcion:
      "Casos de implementación de riego por goteo y telemetría en cultivos frutales de exportación.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 33,
    duracion: 1,
    estimadoAsistentes: 260,
    sedeId: "sede-club-la-serena",
    organizadorId: "org-sna",
    contactoIds: ["con-sna-1"],
    esPago: true,
    etiquetas: ["agro", "riego", "sequía"],
  },
  {
    id: "evt-016",
    titulo: "Expo Turismo Patagonia Verde",
    descripcion:
      "Rueda de negocios entre operadores turísticos, hoteles y agencias mayoristas.",
    categoria: "exposicion_comercial",
    estado: "confirmado",
    offsetInicio: 36,
    duracion: 2,
    estimadoAsistentes: 1900,
    sedeId: "sede-cumbres-puerto-montt",
    organizadorId: "org-camara-turismo-lg",
    contactoIds: ["con-turismo-1"],
    esPago: true,
    etiquetas: ["turismo", "hotelería", "rueda de negocios"],
  },
  {
    id: "evt-017",
    titulo: "Congreso de Innovación Minera y Automatización",
    descripcion:
      "Foro técnico sobre operación remota, flota autónoma e integración de datos en faena.",
    categoria: "seminario_congreso",
    estado: "confirmado",
    offsetInicio: 39,
    duracion: 2,
    estimadoAsistentes: 540,
    sedeId: "sede-diego-calama",
    organizadorId: "org-editec",
    contactoIds: ["con-editec-1"],
    urlOficial: "https://editec.cl/congreso-innovacion",
    esPago: true,
    etiquetas: ["minería", "automatización", "innovación"],
  },
  {
    id: "evt-018",
    titulo: "Feria Laboral y de Emprendimiento de Temuco",
    descripcion:
      "Actividad municipal con stands de empresas, OMIL y programas de capacitación.",
    categoria: "evento_publico",
    estado: "confirmado",
    offsetInicio: 42,
    duracion: 2,
    estimadoAsistentes: 6800,
    sedeId: "sede-sofo",
    organizadorId: "org-muni-temuco",
    contactoIds: ["con-temuco-1"],
    esPago: false,
    etiquetas: ["municipal", "empleo", "emprendimiento"],
  },
  {
    id: "evt-019",
    titulo: "Encuentro Anual de Retail y Logística",
    descripcion:
      "Seminario en hotel sobre última milla, automatización de bodegas y omnicanalidad.",
    categoria: "seminario_congreso",
    estado: "en_planificacion",
    offsetInicio: 45,
    duracion: 1,
    estimadoAsistentes: 380,
    sedeId: "sede-crowne-santiago",
    organizadorId: "org-nexo-eventos",
    contactoIds: ["con-nexo-1", "con-nexo-2"],
    esPago: true,
    etiquetas: ["retail", "logística", "última milla"],
  },
  {
    id: "evt-020",
    titulo: "Expo Construcción y Materiales Zona Centro",
    descripcion:
      "Exposición comercial de materiales, herramientas y soluciones constructivas.",
    categoria: "exposicion_comercial",
    estado: "confirmado",
    offsetInicio: 48,
    duracion: 3,
    estimadoAsistentes: 9200,
    sedeId: "sede-parque-fisa",
    organizadorId: "org-fisa",
    contactoIds: ["con-fisa-1"],
    esPago: true,
    etiquetas: ["construcción", "materiales", "ferretería"],
  },
  {
    id: "evt-021",
    titulo: "Jornada de Actualización en Salud Ocupacional",
    descripcion:
      "Charla técnica para mutuales, prevencionistas y jefaturas de recursos humanos.",
    categoria: "charla_capacitacion",
    estado: "confirmado",
    offsetInicio: 51,
    duracion: 1,
    estimadoAsistentes: 210,
    sedeId: "sede-udec",
    organizadorId: "org-mutual",
    contactoIds: ["con-mutual-1"],
    esPago: false,
    etiquetas: ["salud ocupacional", "RRHH", "normativa"],
  },
  {
    id: "evt-022",
    titulo: "Cumbre de Ciudades Portuarias",
    descripcion:
      "Encuentro municipal e internacional sobre logística portuaria y desarrollo urbano.",
    categoria: "seminario_congreso",
    estado: "en_planificacion",
    offsetInicio: 55,
    duracion: 2,
    estimadoAsistentes: 720,
    sedeId: "sede-sheraton-miramar",
    organizadorId: "org-muni-valpo",
    contactoIds: ["con-valpo-1"],
    esPago: false,
    etiquetas: ["portuario", "municipal", "urbanismo"],
  },
  {
    id: "evt-023",
    titulo: "Festival Gastronómico Costa Valparaíso",
    descripcion:
      "Evento público masivo con food trucks, productores locales y escenario musical.",
    categoria: "evento_publico",
    estado: "en_planificacion",
    offsetInicio: 58,
    duracion: 3,
    estimadoAsistentes: 14000,
    sedeId: "sede-enjoy-vina",
    organizadorId: "org-nexo-eventos",
    contactoIds: ["con-nexo-2"],
    esPago: false,
    etiquetas: ["gastronomía", "público general", "verano"],
  },

  // --- Fuera de la ventana de 60 días -------------------------------------
  {
    id: "evt-024",
    titulo: "Feria Internacional de Alimentos y Bebidas",
    descripcion:
      "Gran feria de exportación agroalimentaria con delegaciones de Asia y Europa.",
    categoria: "feria_industrial",
    estado: "en_planificacion",
    offsetInicio: 74,
    duracion: 4,
    estimadoAsistentes: 17500,
    sedeId: "sede-espacio-riesco",
    organizadorId: "org-fisa",
    contactoIds: ["con-fisa-1", "con-fisa-2"],
    esPago: true,
    etiquetas: ["alimentos", "exportación", "internacional"],
  },
  {
    id: "evt-025",
    titulo: "Congreso Vitivinícola Nacional",
    descripcion:
      "Encuentro técnico anual de enólogos, agrónomos y comercializadores.",
    categoria: "seminario_congreso",
    estado: "en_planificacion",
    offsetInicio: 88,
    duracion: 3,
    estimadoAsistentes: 640,
    sedeId: "sede-diego-rancagua",
    organizadorId: "org-vinos-chile",
    contactoIds: ["con-vinos-1"],
    esPago: true,
    etiquetas: ["vitivinícola", "enología", "técnico"],
  },

  // --- Ya finalizados (referencia histórica) -------------------------------
  {
    id: "evt-026",
    titulo: "Seminario de Eficiencia Hídrica en Faenas Mineras",
    descripcion:
      "Edición cerrada. Sirve de antecedente para la convocatoria del próximo ciclo.",
    categoria: "seminario_congreso",
    estado: "finalizado",
    offsetInicio: -12,
    duracion: 1,
    estimadoAsistentes: 290,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-aia",
    contactoIds: ["con-aia-2"],
    esPago: true,
    etiquetas: ["minería", "agua", "histórico"],
  },
  {
    id: "evt-027",
    titulo: "Expo Ganadera Osorno — Delegación Los Lagos",
    descripcion:
      "Edición cerrada. El organizador confirmó repetición para el próximo semestre.",
    categoria: "feria_industrial",
    estado: "finalizado",
    offsetInicio: -26,
    duracion: 3,
    estimadoAsistentes: 8600,
    sedeId: "sede-cumbres-puerto-montt",
    organizadorId: "org-camara-turismo-lg",
    contactoIds: ["con-turismo-1"],
    esPago: true,
    etiquetas: ["agro", "ganadería", "histórico"],
  },

  // --- Nuevos organizadores: recintos e instituciones educativas -----------
  {
    id: "evt-030",
    titulo: "Ciclo de Extensión: Innovación y Territorio",
    descripcion:
      "Charla abierta de la Dirección de Extensión con panel de empresas regionales.",
    categoria: "charla_capacitacion",
    estado: "confirmado",
    offsetInicio: 12,
    duracion: 1,
    estimadoAsistentes: 300,
    sedeId: "sede-udec",
    organizadorId: "org-udec-extension",
    contactoIds: ["con-udec-1"],
    esPago: false,
    etiquetas: ["universidad", "extensión", "innovación"],
  },
  {
    id: "evt-031",
    titulo: "Expo Mascotas Santiago",
    descripcion:
      "Evento masivo detectado en el calendario del recinto antes de su anuncio oficial.",
    categoria: "evento_publico",
    estado: "confirmado",
    offsetInicio: 21,
    duracion: 3,
    estimadoAsistentes: 12000,
    sedeId: "sede-espacio-riesco",
    organizadorId: "org-espacio-riesco",
    contactoIds: ["con-riesco-1"],
    esPago: true,
    etiquetas: ["masivo", "público general", "recinto"],
  },
  {
    id: "evt-032",
    titulo: "Feria Laboral Técnica INACAP Temuco",
    descripcion:
      "Encuentro de titulados con empresas de la región. Stands gratuitos para empleadores.",
    categoria: "evento_publico",
    estado: "confirmado",
    offsetInicio: 26,
    duracion: 2,
    estimadoAsistentes: 3200,
    sedeId: "sede-dreams-temuco",
    organizadorId: "org-inacap",
    contactoIds: ["con-inacap-1"],
    esPago: false,
    etiquetas: ["empleo", "educación técnica", "reclutamiento"],
  },
  {
    id: "evt-033",
    titulo: "Feria de Proveedores Hoteleros del Norte",
    descripcion:
      "Muestra comercial organizada por el propio hotel para su cadena de abastecimiento.",
    categoria: "exposicion_comercial",
    estado: "en_planificacion",
    offsetInicio: 29,
    duracion: 2,
    estimadoAsistentes: 1800,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-enjoy-eventos",
    contactoIds: ["con-enjoy-1"],
    esPago: true,
    etiquetas: ["hotelería", "proveedores", "abastecimiento"],
  },
  {
    id: "evt-034",
    titulo: "Expo Novios Concepción",
    descripcion:
      "Exposición comercial de proveedores de matrimonios y eventos sociales.",
    categoria: "exposicion_comercial",
    estado: "en_planificacion",
    offsetInicio: 44,
    duracion: 2,
    estimadoAsistentes: 4100,
    sedeId: "sede-sur-activo",
    organizadorId: "org-sur-activo",
    contactoIds: ["con-suractivo-1"],
    esPago: true,
    etiquetas: ["eventos sociales", "proveedores"],
  },

  // --- Historial: ediciones cerradas que alimentan la ficha del organizador -
  {
    id: "evt-035",
    titulo: "Expo Hormigón y Áridos",
    descripcion: "Edición cerrada.",
    categoria: "feria_industrial",
    estado: "finalizado",
    offsetInicio: -40,
    duracion: 3,
    estimadoAsistentes: 7400,
    sedeId: "sede-parque-fisa",
    organizadorId: "org-fisa",
    contactoIds: ["con-fisa-1"],
    esPago: true,
    etiquetas: ["construcción", "histórico"],
  },
  {
    id: "evt-036",
    titulo: "Foro Litio y Salares",
    descripcion: "Edición cerrada.",
    categoria: "seminario_congreso",
    estado: "finalizado",
    offsetInicio: -19,
    duracion: 2,
    estimadoAsistentes: 520,
    sedeId: "sede-casapiedra",
    organizadorId: "org-editec",
    contactoIds: ["con-editec-1"],
    esPago: true,
    etiquetas: ["minería", "litio", "histórico"],
  },
  {
    id: "evt-037",
    titulo: "Expo Lechera SOFO",
    descripcion: "Edición cerrada.",
    categoria: "feria_industrial",
    estado: "finalizado",
    offsetInicio: -55,
    duracion: 3,
    estimadoAsistentes: 9800,
    sedeId: "sede-sofo",
    organizadorId: "org-sofo",
    contactoIds: ["con-sofo-1"],
    esPago: true,
    etiquetas: ["agro", "lechería", "histórico"],
  },
  {
    id: "evt-038",
    titulo: "Jornadas de Medicina Familiar",
    descripcion: "Edición cerrada.",
    categoria: "seminario_congreso",
    estado: "finalizado",
    offsetInicio: -33,
    duracion: 2,
    estimadoAsistentes: 380,
    sedeId: "sede-sur-activo",
    organizadorId: "org-colmed",
    contactoIds: ["con-colmed-1"],
    esPago: true,
    etiquetas: ["salud", "histórico"],
  },
  {
    id: "evt-039",
    titulo: "Feria Navideña Comunal de Temuco",
    descripcion: "Edición cerrada.",
    categoria: "evento_publico",
    estado: "finalizado",
    offsetInicio: -8,
    duracion: 4,
    estimadoAsistentes: 15000,
    sedeId: "sede-sofo",
    organizadorId: "org-muni-temuco",
    contactoIds: ["con-temuco-1"],
    esPago: false,
    etiquetas: ["municipal", "histórico"],
  },
  {
    id: "evt-040",
    titulo: "Congreso de Turismo de Negocios",
    descripcion: "Edición cerrada.",
    categoria: "seminario_congreso",
    estado: "finalizado",
    offsetInicio: -62,
    duracion: 2,
    estimadoAsistentes: 450,
    sedeId: "sede-enjoy-antofagasta",
    organizadorId: "org-enjoy-eventos",
    contactoIds: ["con-enjoy-1"],
    esPago: true,
    etiquetas: ["turismo", "histórico"],
  },
  {
    id: "evt-041",
    titulo: "Semana de la Ciencia Abierta",
    descripcion: "Edición cerrada.",
    categoria: "evento_publico",
    estado: "finalizado",
    offsetInicio: -25,
    duracion: 5,
    estimadoAsistentes: 5600,
    sedeId: "sede-udec",
    organizadorId: "org-udec-extension",
    contactoIds: ["con-udec-1"],
    esPago: false,
    etiquetas: ["universidad", "divulgación", "histórico"],
  },
  {
    id: "evt-042",
    titulo: "Cata Técnica de Cosecha",
    descripcion: "Edición cerrada.",
    categoria: "charla_capacitacion",
    estado: "finalizado",
    offsetInicio: -14,
    duracion: 1,
    estimadoAsistentes: 120,
    sedeId: "sede-diego-rancagua",
    organizadorId: "org-vinos-chile",
    contactoIds: ["con-vinos-1"],
    esPago: true,
    etiquetas: ["vitivinícola", "histórico"],
  },

  // --- Espacios deportivos y explanadas municipales ------------------------
  {
    id: "evt-043",
    titulo: "Expo Feria Antofagasta Emprende",
    descripcion:
      "Feria comunal de emprendedores en la explanada del estadio, con escenario y food trucks.",
    categoria: "evento_publico",
    estado: "confirmado",
    offsetInicio: 16,
    duracion: 3,
    estimadoAsistentes: 13500,
    sedeId: "sede-estadio-calvo",
    organizadorId: "org-muni-valpo",
    contactoIds: ["con-valpo-1"],
    esPago: false,
    etiquetas: ["municipal", "emprendimiento", "masivo"],
  },
  {
    id: "evt-044",
    titulo: "Rodeo Oficial y Muestra Agrícola de Primavera",
    descripcion:
      "Evento tradicional con muestra de proveedores agrícolas en el perímetro.",
    categoria: "evento_publico",
    estado: "confirmado",
    offsetInicio: 37,
    duracion: 2,
    estimadoAsistentes: 9800,
    sedeId: "sede-medialuna-rancagua",
    organizadorId: "org-sna",
    contactoIds: ["con-sna-1"],
    esPago: true,
    etiquetas: ["agro", "tradicional", "masivo"],
  },
  {
    id: "evt-045",
    titulo: "Feria de Salud y Deporte Comunal",
    descripcion:
      "Operativo municipal con stands de prestadores de salud y marcas deportivas.",
    categoria: "evento_publico",
    estado: "en_planificacion",
    offsetInicio: 50,
    duracion: 2,
    estimadoAsistentes: 3600,
    sedeId: "sede-gimnasio-temuco",
    organizadorId: "org-muni-temuco",
    contactoIds: ["con-temuco-1"],
    esPago: false,
    etiquetas: ["municipal", "salud", "deporte"],
  },
  {
    id: "evt-046",
    titulo: "Fiesta Costumbrista del Borde Costero",
    descripcion: "Edición cerrada.",
    categoria: "evento_publico",
    estado: "finalizado",
    offsetInicio: -21,
    duracion: 3,
    estimadoAsistentes: 5400,
    sedeId: "sede-explanada-puerto-montt",
    organizadorId: "org-camara-turismo-lg",
    contactoIds: ["con-turismo-1"],
    esPago: false,
    etiquetas: ["turismo", "gastronomía", "histórico"],
  },
  {
    id: "evt-047",
    titulo: "Encuentro Deportivo Escolar Regional",
    descripcion: "Edición cerrada.",
    categoria: "evento_publico",
    estado: "finalizado",
    offsetInicio: -47,
    duracion: 4,
    estimadoAsistentes: 4000,
    sedeId: "sede-gimnasio-temuco",
    organizadorId: "org-muni-temuco",
    contactoIds: ["con-temuco-1"],
    esPago: false,
    etiquetas: ["municipal", "deporte", "histórico"],
  },
];

function aISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function desplazar(hoy: Date, dias: number): Date {
  const fecha = aMedianoche(hoy);
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

/**
 * Fecha en que la ingesta habría visto el evento: su inicio menos la
 * anticipación típica del origen, nunca después de hoy — un evento no puede
 * haberse detectado en el futuro.
 */
function fechaDeteccion(
  inicio: Date,
  fuenteId: string | undefined,
  hoy: Date,
): string {
  const anticipacion = fuenteId
    ? (ANTICIPACION_POR_FUENTE[fuenteId] ?? 15)
    : 15;
  const candidata = new Date(inicio);
  candidata.setDate(candidata.getDate() - anticipacion);
  const tope = aMedianoche(hoy);
  return aISO(candidata > tope ? tope : candidata);
}

/** Convierte las semillas en eventos con fechas absolutas. */
export function obtenerEventos(hoy = new Date()): Evento[] {
  return SEMILLAS.map((semilla) => {
    const inicio = desplazar(hoy, semilla.offsetInicio);
    const fin = desplazar(hoy, semilla.offsetInicio + semilla.duracion - 1);
    const fuenteId = ORIGEN_POR_EVENTO[semilla.id];

    return {
      id: semilla.id,
      titulo: semilla.titulo,
      descripcion: semilla.descripcion,
      categoria: semilla.categoria,
      estado: semilla.estado,
      fechaInicio: aISO(inicio),
      fechaFin: aISO(fin),
      estimadoAsistentes: semilla.estimadoAsistentes,
      sedeId: semilla.sedeId,
      organizadorId: semilla.organizadorId,
      contactoIds: semilla.contactoIds,
      urlOficial: semilla.urlOficial,
      esPago: semilla.esPago,
      etiquetas: semilla.etiquetas,
      fuenteId,
      detectadoEn: fechaDeteccion(inicio, fuenteId, hoy),
    } satisfies Evento;
  });
}

const MAPA_SEDES = new Map<string, Sede>(SEDES.map((s) => [s.id, s]));
const MAPA_ORGANIZADORES = new Map<string, Organizador>(
  ORGANIZADORES.map((o) => [o.id, o]),
);
const MAPA_CONTACTOS = new Map<string, ContactoClave>(
  CONTACTOS.map((c) => [c.id, c]),
);

/** Eventos con sede, organizador, contactos y urgencia ya resueltos. */
export function obtenerEventosEnriquecidos(
  hoy = new Date(),
): EventoEnriquecido[] {
  return obtenerEventos(hoy).map((evento) =>
    enriquecerEvento(
      evento,
      MAPA_SEDES,
      MAPA_ORGANIZADORES,
      MAPA_CONTACTOS,
      hoy,
    ),
  );
}
