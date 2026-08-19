/**
 * Tipos específicos para la capa de ingesta.
 * Se mapean al modelo principal de Evento en src/lib/types.ts
 */

export interface ContactoExtraido {
  nombreResponsable?: string;
  cargo?: string;
  telefonoCelular?: string;
  email?: string;
}

export interface EventoExtraido {
  titulo: string;
  descripcion?: string;
  categoria: "feria_industrial" | "seminario_congreso" | "exposicion_comercial" | "charla_capacitacion" | "evento_publico";
  fechaInicio: string; // YYYY-MM-DD
  fechaFin?: string;
  horaInicio?: string; // HH:MM
  estimadoAsistentes?: number;
  ubicacion?: string;
  sede?: string; // nombre del recinto
  ciudad: string;
  comuna?: string;
  organizador?: string; // nombre de quien organiza
  contacto?: ContactoExtraido;
  urlOriginal?: string; // link a la noticia original
}

export interface ResultadoExtraccion {
  eventos: EventoExtraido[];
  diarioId: string;
  diarioNombre: string;
  diarioUrl: string;
  extraidoEn: string; // ISO datetime
  textoOriginal?: string; // para debug
}

export interface RegistroIngesta {
  id?: string;
  diarioId: string;
  diarioNombre: string;
  fuenteId?: string; // referencia a Fuente en DB
  estado: "pendiente" | "procesando" | "exito" | "error";
  eventosExtraidos: number;
  eventosGuardados: number;
  errorMensaje?: string;
  procesadoEn?: string; // ISO datetime
  proximaEjecucion?: string;
  createdAt: string;
}
