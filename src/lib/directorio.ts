import { aFecha, normalizar, numeroWhatsApp } from "@/lib/eventos";
import type {
  ContactoClave,
  EventoEnriquecido,
  Organizador,
  Sede,
  TipoOrganizador,
} from "@/lib/types";

/** Organizador con su historial y su cartera de contactos ya resueltos. */
export interface OrganizadorEnriquecido {
  organizador: Organizador;
  contactos: ContactoClave[];
  /** Primer contacto: el que se muestra como "contacto clave" en la tabla. */
  contactoClave?: ContactoClave;

  /** Todo el historial, del más reciente al más antiguo. */
  eventos: EventoEnriquecido[];
  /** Último evento ya ocurrido. */
  ultimoEvento?: EventoEnriquecido;
  /** Eventos futuros, del más cercano al más lejano. */
  proximosEventos: EventoEnriquecido[];

  /** Sedes donde suele operar, de más a menos frecuente. */
  sedesHabituales: Array<{ sede: Sede; veces: number }>;
  ciudades: string[];

  /** Contactos con celular directo y confirmado. */
  contactosValidados: number;
  asistentesAcumulados: number;
}

/**
 * Cruza organizadores, contactos y eventos en una sola estructura.
 * El directorio no vuelve a recorrer los eventos: todo se calcula aquí.
 */
export function enriquecerOrganizadores(
  organizadores: Organizador[],
  contactos: ContactoClave[],
  eventos: EventoEnriquecido[],
): OrganizadorEnriquecido[] {
  const porOrganizador = new Map<string, EventoEnriquecido[]>();
  for (const evento of eventos) {
    const lista = porOrganizador.get(evento.organizadorId) ?? [];
    lista.push(evento);
    porOrganizador.set(evento.organizadorId, lista);
  }

  return organizadores.map((organizador) => {
    const propios = (porOrganizador.get(organizador.id) ?? [])
      .slice()
      .sort(
        (a, b) =>
          aFecha(b.fechaInicio).getTime() - aFecha(a.fechaInicio).getTime(),
      );

    const pasados = propios.filter((e) => e.alerta.diasRestantes < 0);
    const proximos = propios
      .filter((e) => e.alerta.diasRestantes >= 0)
      .sort((a, b) => a.alerta.diasRestantes - b.alerta.diasRestantes);

    const conteoSedes = new Map<string, { sede: Sede; veces: number }>();
    for (const evento of propios) {
      const actual = conteoSedes.get(evento.sedeId);
      if (actual) actual.veces += 1;
      else conteoSedes.set(evento.sedeId, { sede: evento.sede, veces: 1 });
    }

    // Los contactos se filtran por el organizador, no por `contactoIds`: así
    // los secundarios agregados desde la ficha aparecen sin tocar la entidad.
    const propiosContactos = contactos.filter(
      (contacto) => contacto.organizadorId === organizador.id,
    );

    return {
      organizador,
      contactos: propiosContactos,
      contactoClave: propiosContactos[0],
      eventos: propios,
      ultimoEvento: pasados[0],
      proximosEventos: proximos,
      sedesHabituales: [...conteoSedes.values()].sort(
        (a, b) => b.veces - a.veces,
      ),
      ciudades: [...new Set(propios.map((e) => e.sede.ciudad))].sort(),
      contactosValidados: propiosContactos.filter(
        (c) => c.telefonoCelular && c.verificado,
      ).length,
      asistentesAcumulados: propios.reduce(
        (suma, e) => suma + e.estimadoAsistentes,
        0,
      ),
    };
  });
}

// ---------------------------------------------------------------------------
// Estadísticas de cabecera
// ---------------------------------------------------------------------------

export interface EstadisticasDirectorio {
  totalEntidades: number;
  totalProductoras: number;
  porTipo: Array<{ tipo: TipoOrganizador; total: number }>;

  totalContactos: number;
  /** Contactos con celular directo y verificado. */
  movilesValidados: number;
  porcentajeMovilValidado: number;

  eventosRegistrados: number;
  promedioEventosPorEntidad: number;
  entidadMasActiva?: { nombre: string; eventos: number };
  entidadesSinContacto: number;
}

export function calcularEstadisticas(
  fichas: OrganizadorEnriquecido[],
): EstadisticasDirectorio {
  const contactos = fichas.flatMap((f) => f.contactos);
  const validados = contactos.filter((c) => c.telefonoCelular && c.verificado);
  const eventos = fichas.reduce((suma, f) => suma + f.eventos.length, 0);

  const porTipo = new Map<TipoOrganizador, number>();
  for (const ficha of fichas) {
    porTipo.set(
      ficha.organizador.tipo,
      (porTipo.get(ficha.organizador.tipo) ?? 0) + 1,
    );
  }

  const masActiva = [...fichas].sort(
    (a, b) => b.eventos.length - a.eventos.length,
  )[0];

  return {
    totalEntidades: fichas.length,
    totalProductoras: fichas.filter((f) => f.organizador.tipo === "productora")
      .length,
    porTipo: [...porTipo.entries()]
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total),

    totalContactos: contactos.length,
    movilesValidados: validados.length,
    porcentajeMovilValidado:
      contactos.length === 0
        ? 0
        : Math.round((validados.length / contactos.length) * 100),

    eventosRegistrados: eventos,
    promedioEventosPorEntidad:
      fichas.length === 0 ? 0 : Math.round((eventos / fichas.length) * 10) / 10,
    entidadMasActiva:
      masActiva && masActiva.eventos.length > 0
        ? {
            nombre: masActiva.organizador.nombre,
            eventos: masActiva.eventos.length,
          }
        : undefined,
    entidadesSinContacto: fichas.filter((f) => f.contactos.length === 0).length,
  };
}

// ---------------------------------------------------------------------------
// Búsqueda y filtro
// ---------------------------------------------------------------------------

export interface FiltrosDirectorio {
  busqueda: string;
  tipos: TipoOrganizador[];
  /** Solo entidades con al menos un contacto accionable. */
  soloAccionables: boolean;
}

export function filtrarDirectorio(
  fichas: OrganizadorEnriquecido[],
  filtros: FiltrosDirectorio,
): OrganizadorEnriquecido[] {
  const busqueda = normalizar(filtros.busqueda.trim());

  return fichas.filter((ficha) => {
    if (
      filtros.tipos.length > 0 &&
      !filtros.tipos.includes(ficha.organizador.tipo)
    ) {
      return false;
    }

    if (
      filtros.soloAccionables &&
      !ficha.contactos.some((c) => c.telefonoCelular || c.email)
    ) {
      return false;
    }

    if (!busqueda) return true;

    const indice = normalizar(
      [
        ficha.organizador.nombre,
        ficha.organizador.rubro ?? "",
        ...ficha.contactos.map(
          (c) => `${c.nombreResponsable} ${c.cargo} ${c.email ?? ""}`,
        ),
        ...ficha.ciudades,
      ].join(" "),
    );

    return indice.includes(busqueda);
  });
}

// ---------------------------------------------------------------------------
// Enlaces de comunicación rápida
// ---------------------------------------------------------------------------

export function enlaceTelefono(contacto: ContactoClave): string | undefined {
  if (!contacto.telefonoCelular) return undefined;
  return `tel:${contacto.telefonoCelular.replace(/\s/g, "")}`;
}

/**
 * WhatsApp con el próximo evento como excusa de contacto. Sin evento agendado
 * el mensaje cae a una presentación genérica, que sigue siendo mejor que nada.
 */
export function enlaceWhatsAppDirectorio(
  contacto: ContactoClave,
  ficha: OrganizadorEnriquecido,
): string | undefined {
  if (!contacto.telefonoCelular) return undefined;

  const nombre = contacto.nombreResponsable.split(" ")[0];
  const proximo = ficha.proximosEventos[0];
  const mensaje = proximo
    ? `Hola ${nombre}, escribo desde el equipo comercial por "${proximo.titulo}" en ${proximo.sede.ciudad}. ¿Tienes un momento para conversar?`
    : `Hola ${nombre}, escribo desde el equipo comercial a propósito de los eventos que organiza ${ficha.organizador.nombre}. ¿Tienes un momento para conversar?`;

  return `https://wa.me/${numeroWhatsApp(contacto.telefonoCelular)}?text=${encodeURIComponent(mensaje)}`;
}

/** Correo con asunto y cuerpo preconfigurados según el próximo evento. */
export function enlaceCorreo(
  contacto: ContactoClave,
  ficha: OrganizadorEnriquecido,
): string | undefined {
  if (!contacto.email) return undefined;

  const proximo = ficha.proximosEventos[0];
  const asunto = proximo
    ? `Consulta comercial — ${proximo.titulo}`
    : `Consulta comercial — eventos de ${ficha.organizador.nombre}`;

  const cuerpo = proximo
    ? `Estimado/a ${contacto.nombreResponsable}:\n\nEscribo a propósito de "${proximo.titulo}", agendado en ${proximo.sede.nombre} (${proximo.sede.ciudad}).\n\nMe gustaría conocer las alternativas de participación disponibles.\n\nQuedo atento/a.\n`
    : `Estimado/a ${contacto.nombreResponsable}:\n\nEscribo para conocer el calendario de actividades de ${ficha.organizador.nombre} y las alternativas de participación disponibles.\n\nQuedo atento/a.\n`;

  return `mailto:${contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}
