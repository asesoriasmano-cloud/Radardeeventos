# Sistema de Ingesta de Diarios

Sistema automático para extraer eventos de diarios nacionales y regionales chilenos usando Claude API.

## 📋 Componentes

### 1. **Catastro de Diarios** (`src/lib/ingesta/config.ts`)
- 17 diarios nacionales (impresos + digitales)
- 18+ diarios regionales (por región)
- Configurable: cadencia, prioridad, categoría

### 2. **Extracción Semántica** (`src/lib/ingesta/event-extractor.ts`)
- Usa Claude Opus 5 para análisis de contenido
- Entiende contexto, maneja variabilidad de formato
- Devuelve JSON estructurado: título, fecha, contacto, ubicación

### 3. **Web Scraper** (`src/lib/ingesta/fetcher.ts`)
- Obtiene contenido HTML de diarios
- Limpia scripts, styles, normaliza espacios
- Soporte para RSS feeds (fase 2)

### 4. **Mapper** (`src/lib/ingesta/mapper.ts`)
- Convierte EventoExtraido → Evento del modelo Radar
- Crea/vincula Sede, Organizador, ContactoClave
- Valida antes de guardar

### 5. **Pipeline** (`src/lib/ingesta/pipeline.ts`)
- Orquesta: fetch → extract → map → validate
- Procesa múltiples diarios con límite de concurrencia
- Retorna resumen de éxitos/errores

### 6. **Endpoint API** (`src/app/api/ingesta/procesar`)
- **POST**: Dispara ingesta (manual o cron)
- **GET**: Lista diarios disponibles (debug)
- Requiere token en header: `Authorization: Bearer <TOKEN>`

## 🚀 Uso

### Configuración de variables de entorno

```bash
# Copiar template y completar
cp .env.example .env.local

# Requeridas:
ANTHROPIC_API_KEY=sk-ant-...
INGESTA_API_TOKEN=token-secreto-aleatorio
```

### Procesar diarios manualmente

```bash
# Procesar 5 diarios nacionales de alta prioridad
curl -X POST \
  "https://tudominio.vercel.app/api/ingesta/procesar?prioridad=alta&limite=5" \
  -H "Authorization: Bearer $INGESTA_API_TOKEN"

# Procesar solo región específica
curl -X POST \
  "https://tudominio.vercel.app/api/ingesta/procesar?region=Antofagasta&limite=3" \
  -H "Authorization: Bearer $INGESTA_API_TOKEN"

# Ver diarios disponibles
curl "https://tudominio.vercel.app/api/ingesta/procesar?show=todos"
```

### Respuesta exitosa

```json
{
  "success": true,
  "resumen": {
    "diariosProcessados": 5,
    "diariosExitosos": 4,
    "eventosExtraidos": 12,
    "tiempoTotalMs": 18500
  },
  "resultados": [
    {
      "diarioId": "diario-mercurio",
      "diarioNombre": "El Mercurio",
      "exitoso": true,
      "eventosDetectados": 3,
      "eventosValidos": 3,
      "tiempoMs": 4200,
      "errores": []
    }
  ],
  "eventosExtraidos": 12,
  "ejemploEvento": { ... }
}
```

## 📊 Prioridades de diarios y municipios

| Prioridad | Ejemplos | Cadencia | Uso |
|-----------|----------|----------|-----|
| **alta** | El Mercurio, EMOL, BioBioChile | 2h | Diario, cron cada 2h |
| **media** | Sitios web municipales, diarios regionales | 4-8h | Diario, cron cada 6-8h |
| **baja** | Diarios políticos, Instagram municipales | 6-8h | Opcional, mantenimiento |

## 🏛️ Municipios como fuentes

Se agregaron **64 municipios chilenos** como fuentes automáticas. Cada municipio puede tener:
- **Sitio web** (web_scraping)
- **Página Facebook** (web_scraping)
- **Cuenta Instagram** (web_scraping)

Total: ~190 fuentes adicionales de municipios + redes sociales

### Eventos que publican municipios:
- Fiestas locales y festivales
- Eventos públicos, conciertos
- Actividades comunitarias
- Convocatorias y trámites

### Ejemplos de municipios integrados:
- Santiago, La Florida, Las Condes (Metropolitana)
- Antofagasta, Calama (Antofagasta)
- Concepción, Los Ángeles (Biobío)
- Valparaíso, San Antonio (Valparaíso)
- Temuco, Pucón (Araucanía)
- Puerto Montt, Castro (Los Lagos)

### Cómo procesar solo municipios:

```bash
# Procesar todos los municipios
curl -X POST \
  "https://tudominio.vercel.app/api/ingesta/procesar?show=municipios" \
  -H "Authorization: Bearer $INGESTA_API_TOKEN"

# Procesar municipios de una región específica
curl -X POST \
  "https://tudominio.vercel.app/api/ingesta/procesar?region=Antofagasta" \
  -H "Authorization: Bearer $INGESTA_API_TOKEN"

# Ver lista de municipios disponibles
curl "https://tudominio.vercel.app/api/ingesta/procesar?show=municipios"
```

## 🔄 Cron Jobs (Vercel)

Para configurar ejecución automática, agregar a `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/ingesta/procesar?prioridad=alta&limite=10",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/ingesta/procesar?prioridad=media&limite=5",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## 💾 Fase 2: Persistencia en BD

Actualmente el endpoint retorna eventos sin guardar en BD.

Para agregar persistencia (Supabase/Firebase):

1. Crear tablas en BD si no existen
2. En `src/lib/ingesta/storage.ts`: implementar guardado
3. Modificar `src/app/api/ingesta/procesar/route.ts` para insertar
4. Cambiar `/eventos` para leer de BD real

```typescript
// Ejemplo de cómo sería:
await guardarEventosEnBD(eventosValidos);
```

## 🧪 Testing local

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Simular ingesta de EMOL
curl -X POST \
  "http://localhost:3000/api/ingesta/procesar?limite=1" \
  -H "Authorization: Bearer test-token"
```

## 📈 Estimaciones

**Volumen diario** (una ejecución de ingesta completa):
- Nacionales: ~15-20 eventos/día
- Regionales: ~30-40 eventos/día
- Municipios: ~40-60 eventos/día (redes sociales + web)
- **Total**: ~85-120 eventos/día

**Costo Claude API** (Opus 5):
- ~$0.015 / 1K tokens input
- ~$0.06 / 1K tokens output
- Estimado: $15-25/mes para ~270 fuentes

**Tiempo de ingesta**:
- Por diario/municipio: 3-8 segundos (fetch + extract)
- 5 en paralelo: ~12-18 segundos total
- 80+ fuentes: ~4-6 minutos (con concurrencia)
- 270 fuentes (con municipios): ~15-20 minutos (con concurrencia)

**Fuentes activas**:
- Diarios nacionales: 8
- Diarios regionales: 18+
- Municipios (web + redes): 64 × 3 = ~190 fuentes
- **Total**: ~270 fuentes de ingesta

## ⚠️ Limitaciones actuales

1. **No guarda en BD**: Endpoint retorna resultados sin persistencia
2. **Sin sesión HTTP**: Cada diario es fetch independiente (sin sesión reutilizada)
3. **Formato HTML crudo**: Usa regex, no jsdom/Cheerio aún
4. **Sin detectar cambios**: No valida si evento ya existe
5. **Sin OCR**: No procesa PDFs (preparado para fase 2)

## 🎯 Mejoras futuras

- [ ] Integrar Supabase / Firebase para persistencia
- [ ] Agregar sesión HTTP para diarios que la requieren
- [ ] Usar jsdom/Cheerio para parsing robusto
- [ ] Detectar duplicados (hash de título + fecha)
- [ ] OCR para PDFs (tesseract ya instalado)
- [ ] Dashboard de monitoreo de ingesta
- [ ] Backoff inteligente si diario no responde
- [ ] Caché de extracciones recientes

## 📞 Soporte

Si un diario no procesa:
1. Revisar `resultados[].errores` en respuesta
2. Verificar si el sitio está activo: `curl <url>`
3. Actualizar selector CSS en `config.ts` si estructura cambió
4. Crear issue con logs de error

---

**Última actualización**: 2026-08-19  
**Autor**: Sistema de Ingesta v1.0
