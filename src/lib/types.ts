/**
 * Modelo de datos unificado del Radar de Eventos y Congregaciones.
 *
 * Relaciones:
 *   Evento ──n:1──▶ Sede
 *   Evento ──n:1──▶ Organizador ──1:n──▶ ContactoClave
 *   Evento ──1:1──▶ AlertaInfo   (derivada, no persistida)
 *   Evento ──n:1──▶ Fuente       (procedencia del dato)
 */

export type ID = string;

/** Fecha en formato ISO 8601 (`YYYY-MM-DD` o timestamp completo). */
export type ISODate = string;

// ---------------------------------------------------------------------------
// Enumeraciones de dominio
// ---------------------------------------------------------------------------

export type CategoriaEvento =
  | "feria_industrial"
  | "seminario_congreso"
  | "exposicion_comercial"
  | "charla_capacitacion"
  | "evento_publico";

export type EstadoEvento = "confirmado" | "en_planificacion" | "finalizado";

/**
 * Urgencia derivada de los días que faltan para el evento.
 * urgente: < 7 · proximo: 8–20 · planificacion: 21–60
 */
export type NivelUrgencia = "urgente" | "proximo" | "planificacion";

/**
 * Agrupación operativa del panel de alertas. Es más gruesa que `NivelUrgencia`
 * y responde a una decisión distinta: qué hacer con el evento, no cuán cerca
 * está. Ver `BANDAS` en `src/lib/metricas.ts`.
 */
export type BandaAlerta = "critica" | "oportunidad" | "mediano";

/**
 * Tipo de entidad que convoca. Las cinco primeras son las categorías del
 * directorio; `empresa_privada` recoge a quienes no encajan en ninguna
 * (mutualidades, clústeres de proveedores, corporativos).
 */
export type TipoOrganizador =
  | "productora"
  | "gremial"
  | "hotel_centro_eventos"
  | "universidad_instituto"
  | "organismo_publico"
  | "empresa_privada";

export type TipoSede =
  | "hotel"
  | "centro_convenciones"
  | "recinto_ferial"
  | "espacio_deportivo"
  | "municipal"
  | "universidad"
  | "otro";

/** Agrupación del directorio de sedes. Se deriva de `TipoSede`. */
export type FamiliaSede = "hoteleria" | "ferial" | "publico" | "academico";

/** Semáforo de concentración histórica de público en una sede. */
export type NivelActividad = "alta" | "media" | "baja";

export type RedSocial = "linkedin" | "instagram";

export type VentanaTiempo = 7 | 15 | 30 | 60;

/**
 * Familia del origen monitoreado: responde a "qué clase de sitio es", que es
 * como se agrupa el panel de ingesta.
 */
export type FamiliaFuente =
  | "ticketera"
  | "cartelera_hotel"
  | "prensa_local"
  | "gremial"
  | "portal_ferias"
  | "manual";

/**
 * Mecanismo técnico con que se obtiene el dato. Es independiente de la familia:
 * una ticketera puede exponer API y otra obligar a raspar su sitio.
 */
export type MecanismoFuente =
  | "sitio_web"
  | "rss"
  | "api"
  | "redes_sociales"
  | "boletin_municipal"
  | "carga_manual";

export type EstadoFuente = "activa" | "pausada" | "con_error";

/** Canales por los que se despacha una alerta. */
export type CanalNotificacion = "panel" | "correo" | "whatsapp";

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

/** Recinto donde ocurre el evento. Se reutiliza entre eventos. */
export interface Sede {
  id: ID;
  nombre: string;
  tipo: TipoSede;
  ciudad: string;
  /** Comuna. Solo difiere de `ciudad` en áreas metropolitanas. */
  comuna: string;
  region: string;
  direccion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  /** Aforo total del recinto, sumando todos sus espacios. */
  capacidadMaxima?: number;
  /** Salones arrendables y el rango de aforo que cubren. */
  salones?: {
    cantidad: number;
    capacidadMenor: number;
    capacidadMayor: number;
  };
  /** Contacto de la administración de eventos del recinto. */
  telefonoEventos?: string;
  emailEventos?: string;
  sitioWeb?: string;
}

/** Entidad que convoca o produce el evento. */
export interface Organizador {
  id: ID;
  nombre: string;
  tipo: TipoOrganizador;
  rubro?: string;
  sitioWeb?: string;
  contactoIds: ID[];
  /** Notas de prospección, convenios previos y antecedentes de la relación. */
  notasInternas?: string;
}

/** Persona a la que efectivamente se llama o escribe. */
export interface ContactoClave {
  id: ID;
  organizadorId: ID;
  nombreResponsable: string;
  cargo: string;
  /** Opcional: la ingesta a veces detecta al responsable sin su teléfono. */
  telefonoCelular?: string;
  /** Opcional: ídem para el correo directo. */
  email?: string;
  redSocial?: {
    tipo: RedSocial;
    url: string;
  };
  /** Marca si los datos fueron confirmados contra el organizador. */
  verificado: boolean;
}

/**
 * Origen de datos monitoreado por la ingesta.
 *
 * No guarda contadores: cuántos eventos aportó y con qué tasa de éxito
 * extrajo contactos se deriva de los eventos que la referencian
 * (`enriquecerFuentes()` en `src/lib/fuentes.ts`). Un contador escrito a mano
 * terminaría contradiciendo la tabla de eventos.
 */
export interface Fuente {
  id: ID;
  nombre: string;
  familia: FamiliaFuente;
  mecanismo: MecanismoFuente;
  url?: string;
  estado: EstadoFuente;
  /** Instante de la última corrida del rastreo. */
  ultimaEjecucion?: ISODate;
  /** Cadencia declarada del rastreo, en minutos. */
  cadenciaMinutos: number;
  /** Ciudades cubiertas. `["todas"]` = cobertura nacional. */
  cobertura: string[];
  /** Días de anticipación con que este origen suele publicar un evento. */
  anticipacionTipica: number;
  /** Detalle del fallo cuando `estado === "con_error"`. */
  ultimoError?: string;
  notas?: string;
}

/**
 * Contacto clave para una detección manual. Puede haber múltiples
 * (principal + adicionales) cuando el evento abarca varias municipalidades.
 */
export interface ContactoDeteccion {
  nombreResponsable?: string;
  cargo?: string;
  telefonoCelular?: string;
  email?: string;
  municipalidad?: string;
}

/**
 * Evento cargado a mano desde /fuentes. Vive solo en la sesión del navegador:
 * no entra al conjunto de datos ni afecta a las demás vistas.
 */
export interface DeteccionManual {
  id: ID;
  titulo: string;
  urlFuente?: string;
  sede: string;
  fechaInicio: ISODate;
  fechaFin?: ISODate;
  estimadoAsistentes?: number;
  contactos: ContactoDeteccion[];
  registradoEn: ISODate;
}

/** Reglas que gobiernan cuándo y cómo se dispara una alerta. */
export interface ConfiguracionAlertas {
  /** Primer aviso: días de anticipación. */
  avisoPrincipalDias: number;
  /** Recordatorio posterior. Debe ser menor que el aviso principal. */
  recordatorioDias: number;
  /** Aforo estimado mínimo para que un evento sea notificable. */
  aforoMinimo: number;
  /** Categorías vigiladas. Vacío = ninguna alerta se dispara. */
  categorias: CategoriaEvento[];
  canales: CanalNotificacion[];
  plantillaWhatsApp: string;
  asuntoCorreo: string;
  plantillaCorreo: string;
}

/** Actividad de congregación detectada. Entidad central del sistema. */
export interface Evento {
  id: ID;
  titulo: string;
  descripcion?: string;
  categoria: CategoriaEvento;
  estado: EstadoEvento;

  fechaInicio: ISODate;
  fechaFin: ISODate;
  estimadoAsistentes: number;

  sedeId: ID;
  organizadorId: ID;
  contactoIds: ID[];

  urlOficial?: string;
  esPago?: boolean;
  etiquetas: string[];

  fuenteId?: ID;
  detectadoEn?: ISODate;
}

/**
 * Urgencia de un evento. **Derivada**: se calcula contra la fecha actual
 * mediante `calcularAlerta()`; nunca se persiste ni llega desde la API.
 */
export interface AlertaInfo {
  diasRestantes: number;
  nivelUrgencia: NivelUrgencia;
}

// ---------------------------------------------------------------------------
// Tipos de apoyo para la UI
// ---------------------------------------------------------------------------

/** Evento con sus relaciones resueltas, listo para pintar en tarjeta o tabla. */
export interface EventoEnriquecido extends Evento {
  sede: Sede;
  organizador: Organizador;
  contactos: ContactoClave[];
  /** Primer contacto del organizador. Es el que se muestra en la tabla. */
  contactoPrincipal?: ContactoClave;
  alerta: AlertaInfo;
}

/** Filtros globales que viven en el header y afectan a todas las vistas. */
export interface FiltrosGlobales {
  ciudad: string;
  ventana: VentanaTiempo;
}

/** Estado de la barra de filtros de /eventos. */
export interface FiltrosEventos {
  busqueda: string;
  categorias: CategoriaEvento[];
  desde?: Date;
  hasta?: Date;
  ciudad: string;
  aforo: [number, number];
}

export type ModoVista = "tarjetas" | "tabla";

/** Columnas de la tabla que admiten ordenamiento. */
export type ColumnaOrdenable =
  "fechaInicio" | "titulo" | "ciudad" | "estimadoAsistentes" | "organizador";

export type DireccionOrden = "asc" | "desc";

export interface Orden {
  columna: ColumnaOrdenable;
  direccion: DireccionOrden;
}
