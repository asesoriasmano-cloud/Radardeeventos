/**
 * Event Extractor: Usa Claude API para extraer eventos de texto de diarios.
 * Entiende contexto, maneja variabilidad, y devuelve JSON estructurado.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { DiarioConfig } from "./config";
import type { ResultadoExtraccion, EventoExtraido } from "./tipos";

const client = new Anthropic();

/**
 * Extrae eventos del texto de un diario usando Claude.
 * Adapta el prompt según el tipo de diario (general, financiero, político).
 */
export async function extraerEventosDelTexto(
  textoDelDiario: string,
  diarioConfig: DiarioConfig
): Promise<ResultadoExtraccion> {
  const prompt = construirPrompt(textoDelDiario, diarioConfig);

  try {
    const response = await client.messages.create({
      // Extraer fechas, nombres y teléfonos de un texto y devolverlos en JSON
      // es trabajo de clasificación, no de razonamiento: Haiku lo resuelve
      // por una fracción del costo de Opus, y el cuello de botella real es
      // la calidad del texto que se le manda, no la del modelo.
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const contenido = response.content[0];
    if (contenido.type !== "text") {
      throw new Error("Respuesta inesperada de Claude");
    }

    // Parsear JSON de la respuesta
    const jsonMatch = contenido.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`No JSON encontrado en respuesta para ${diarioConfig.nombre}`);
      return {
        eventos: [],
        diarioId: diarioConfig.id,
        diarioNombre: diarioConfig.nombre,
        diarioUrl: diarioConfig.url,
        extraidoEn: new Date().toISOString(),
      };
    }

    const resultado = JSON.parse(jsonMatch[0]);
    return {
      eventos: resultado.eventos || [],
      diarioId: diarioConfig.id,
      diarioNombre: diarioConfig.nombre,
      diarioUrl: diarioConfig.url,
      extraidoEn: new Date().toISOString(),
      textoOriginal: textoDelDiario.substring(0, 500), // primeros 500 chars para debug
    };
  } catch (error) {
    console.error(
      `Error extrayendo eventos de ${diarioConfig.nombre}:`,
      error
    );
    throw error;
  }
}

/**
 * Construye el prompt adaptado al tipo de diario.
 */
function construirPrompt(textoDelDiario: string, config: DiarioConfig): string {
  const filtroCategoria = construirFiltroCategoria(config);
  const ejemplosFormato = construirEjemplosFormato();

  return `Eres un experto chileno extrayendo eventos de congregación masiva de prensa regional y nacional.

DIARIO: ${config.nombre}
TIPO: ${config.categoria}
${config.region ? `REGIÓN: ${config.region}` : "COBERTURA: Nacional"}

${filtroCategoria}

INSTRUCCIONES:
1. Extrae TODOS los eventos de congregación masiva del texto
2. Entiende contexto: "próxima semana" = 7 días desde hoy
3. Las fechas deben estar en YYYY-MM-DD (formato ISO)
4. Si no hay año, asume el año actual o próximo si la fecha es pasada
5. Si hay múltiples eventos en un párrafo, extrae cada uno por separado
6. Devuelve JSON VÁLIDO, no comentarios

CATEGORÍAS DE EVENTOS (elige 1):
- feria_industrial: Ferias, exposiciones industria
- seminario_congreso: Seminarios, congresos, conferencias
- exposicion_comercial: Muestras comerciales, expo ventas
- charla_capacitacion: Capacitaciones, charlas, talleres
- evento_publico: Conciertos, festivales, marchas, eventos municipales

IGNORA COMPLETAMENTE:
- Política pura (sin congregación masiva)
- Obituarios, hechos de sangre
- Análisis y opinión
- Publicidad de productos/servicios

DEVUELVE ESTE JSON (VÁLIDO, SIN COMENTARIOS):
{
  "eventos": [
    {
      "titulo": "Nombre del evento",
      "descripcion": "2-3 líneas de contexto",
      "categoria": "seminario_congreso",
      "fechaInicio": "2026-09-15",
      "fechaFin": "2026-09-16",
      "horaInicio": "09:00",
      "estimadoAsistentes": 200,
      "ubicacion": "Calle X, número Y",
      "sede": "Nombre del recinto o hotel",
      "ciudad": "Santiago",
      "comuna": "Providencia",
      "organizador": "Nombre de la entidad que organiza",
      "contacto": {
        "nombreResponsable": "Juan Pérez",
        "cargo": "Gerente de Eventos",
        "telefonoCelular": "+56912345678",
        "email": "juan@empresa.cl"
      },
      "urlOriginal": "https://..."
    }
  ]
}

SI NO HAY EVENTOS, DEVUELVE:
{"eventos": []}

${ejemplosFormato}

TEXTO DEL DIARIO:
${textoDelDiario}`;
}

function construirFiltroCategoria(config: DiarioConfig): string {
  if (config.categoria === "financiero") {
    return `ÉNFASIS: Extrae EVENTOS CORPORATIVOS:
- Seminarios de negocios, conferencias ejecutivas
- Lanzamientos de productos B2B
- Convenciones empresariales
- Reuniones gremiales con asistencia numerosa
Ignora: recomendaciones de bolsa, análisis de mercado, cambios de ejecutivos sin evento.`;
  }

  if (config.categoria === "politica") {
    return `ÉNFASIS: Extrae SOLO si hay CONGREGACIÓN MASIVA ANUNCIADA:
- Asambleas, marchas, manifestaciones con fecha
- Foros públicos, debates
Ignora: política pura, declaraciones, votaciones.`;
  }

  return `ÉNFASIS: TODOS los eventos de congregación masiva.`;
}

function construirEjemplosFormato(): string {
  return `
EJEMPLOS:

1. Texto: "La Cámara de Comercio de Antofagasta realiza mañana (15 de agosto) a las 10:00 AM el IX Seminario de Competitividad Minera en el Hotel Enjoy. Se espera la asistencia de 150 empresarios. Contacto: Roberto Silva, gerente, +56987654321"
   JSON: {"eventos": [{"titulo": "IX Seminario de Competitividad Minera", "categoria": "seminario_congreso", "fechaInicio": "2026-08-15", "horaInicio": "10:00", "estimadoAsistentes": 150, "sede": "Hotel Enjoy", "ciudad": "Antofagasta", "organizador": "Cámara de Comercio de Antofagasta", "contacto": {"nombreResponsable": "Roberto Silva", "cargo": "Gerente", "telefonoCelular": "+56987654321"}}]}

2. Texto: "El diario informó sobre cambios en la directiva de Codelco pero sin evento específico"
   JSON: {"eventos": []}`;
}
