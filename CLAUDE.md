# Radar de Eventos y Congregaciones

Sistema web que rastrea, clasifica y alerta con anticipación sobre actividades de
congregación masiva y eventos profesionales —seminarios en hoteles, ferias
industriales y comerciales, charlas, congresos y eventos municipales— por ciudad,
extrayendo los datos del organizador y de sus contactos clave (nombre, teléfono
o móvil, correo) para prospección comercial o despliegue de terreno.

La unidad de valor del producto es la **anticipación**: un evento detectado a 30
días vale mucho más que el mismo evento detectado a 3. Todo el diseño —el
selector de ventana en el header, los niveles de alerta, el orden por defecto de
las tablas— está subordinado a esa idea.

---

## 1. Pila tecnológica

| Capa | Elección | Notas |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Server Components por defecto |
| Lenguaje | TypeScript (strict) | Sin `any` implícito |
| Estilos | Tailwind CSS v4 | Configuración en CSS (`@theme inline`), sin `tailwind.config` |
| Componentes | shadcn/ui (base Radix, preset `radix-nova`) | Código copiado al repo, editable |
| Iconos | `lucide-react` | Único set de iconos del proyecto |
| Runtime | React 19 | |
| Lint | ESLint 9 (`eslint-config-next`) | |

Comandos:

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run lint    # eslint
```

Agregar un componente de shadcn:

```bash
npx shadcn@latest add <componente>
```

Componentes ya instalados: `button`, `card`, `badge`, `dialog`, `select`,
`table`, `tabs`, `tooltip`, `input`, `dropdown-menu`, `progress`, `separator`,
`scroll-area`, `sheet`.

---

## 2. Convención de carpetas

```
src/
├── app/                        # App Router: una carpeta por ruta
│   ├── layout.tsx              # html lang="es-CL" class="dark" + <AppShell>
│   ├── globals.css             # tema completo: tokens, @theme inline, utilidades
│   ├── page.tsx                # redirige a /alertas
│   ├── alertas/                # Panel de Alertas y Timeline
│   ├── eventos/                # Explorador de Eventos por Ciudad
│   ├── contactos/              # Directorio de Organizadores y Contactos
│   ├── sedes/                  # Mapa y Sedes Frecuentes
│   ├── fuentes/                # Ingesta & Fuentes de Monitoreo
│   └── configuracion/          # Configuración de Alertas
├── components/
│   ├── ui/                     # shadcn/ui — no editar salvo cambio de sistema de diseño
│   ├── layout/                 # AppShell, Sidebar, Header
│   ├── providers/              # RadarProvider (estado global de filtros)
│   ├── shared/                 # piezas reutilizables entre vistas
│   └── <dominio>/              # componentes propios de una vista (eventos/, alertas/…)
└── lib/
    ├── types.ts                # modelo de datos unificado
    ├── constants.ts            # ciudades, ventanas, niveles de alerta, tipos de evento
    ├── navegacion.ts           # definición única de las rutas del sidebar
    └── utils.ts                # cn() y helpers
```

Reglas:

- Los componentes de una sola vista viven en `src/components/<dominio>/`, no
  dentro de `src/app/`. `src/app/` contiene rutas, no implementación.
- `"use client"` solo donde hace falta: estado, efectos o handlers. El shell ya
  aísla la interactividad en `Sidebar` y `Header`, de modo que las páginas
  pueden seguir siendo Server Components.
- Las rutas se declaran una sola vez, en `src/lib/navegacion.ts`. El sidebar y
  el título del header se derivan de ahí; no duplicar literales de ruta.
- Nombres de archivo en `kebab-case`, componentes en `PascalCase`.
- El dominio se nombra en español (`Evento`, `Sede`, `Organizador`); las APIs de
  React y Next se usan en su idioma original.

---

## 3. Modelo de datos unificado

Definido en `src/lib/types.ts`.

```
Fuente ──1:n──▶ Evento
Evento ──n:1──▶ Sede
Evento ──n:1──▶ Organizador ──1:n──▶ ContactoClave
Evento ──1:1──▶ AlertaInfo   (derivada, no persistida)
```

### Evento

Entidad central. Una actividad de congregación detectada.

`titulo`, `descripcion`, `categoria`, `estado`, `fechaInicio` / `fechaFin`,
`estimadoAsistentes`, `sedeId`, `organizadorId`, `contactoIds`, `urlOficial`,
`esPago`, `etiquetas`, `fuenteId`, `detectadoEn`.

- `categoria`: `feria_industrial | seminario_congreso | exposicion_comercial |
  charla_capacitacion | evento_publico`
- `estado`: `confirmado | en_planificacion | finalizado`

### Sede

Recinto reutilizable entre eventos: `nombre`, `tipo`, `ciudad`, `comuna`,
`region`, `direccion`, `coordenadas { lat, lng }`, `capacidadMaxima`,
`salones { cantidad, capacidadMenor, capacidadMayor }`, `telefonoEventos`,
`emailEventos` y `sitioWeb`.

`tipo` admite `hotel | centro_convenciones | recinto_ferial |
espacio_deportivo | municipal | universidad | otro`, y cada uno declara su
`familia` en `TIPOS_SEDE`. Las familias son la agrupación del directorio:

| Familia | Contiene |
| --- | --- |
| `hoteleria` | Hoteles con salones de eventos |
| `ferial` | Recintos feriales y centros de convenciones |
| `publico` | Espacios deportivos y explanadas municipales |
| `academico` | Universidades y otros recintos |

`comuna` solo difiere de `ciudad` en áreas metropolitanas; el filtro de comuna
de `/sedes` se apoya en eso. `telefonoEventos` y `emailEventos` son de la
administración del recinto, no del organizador: son dos relaciones distintas y
no deben mezclarse.

### Organizador

Quien convoca: `nombre`, `rubro`, `sitioWeb`, `contactoIds`, `notasInternas` y
`tipo`, con seis valores:

| Valor | Etiqueta |
| --- | --- |
| `productora` | Productora de Eventos |
| `gremial` | Asociación Gremial |
| `hotel_centro_eventos` | Hotel / Centro de Eventos |
| `universidad_instituto` | Universidad / Instituto |
| `organismo_publico` | Organismo Público |
| `empresa_privada` | Empresa Privada |

Las cinco primeras son las categorías del directorio. `empresa_privada` existe
porque hay entidades reales que no encajan en ninguna —mutualidades, clústeres
de proveedores— y forzarlas a una categoría ajena falsearía el filtro.

Un hotel puede ser a la vez `Sede` (donde ocurre el evento) y `Organizador`
(cuando convoca el suyo). Son entidades distintas con ids distintos: el
calendario comercial de un recinto suele anticipar ferias que el productor aún
no anuncia, y por eso vale la pena tenerlo como organizador rastreable.

`notasInternas` guarda antecedentes de la relación —convenios, tarifas, con
quién escalar, qué evitar—. Es texto libre a propósito: intentar estructurarlo
antes de saber cómo se usa produciría campos que nadie llena.

### ContactoClave

Persona a la que efectivamente se llama o escribe: `nombreResponsable`,
`cargo`, `telefonoCelular?`, `email?`, `redSocial { tipo, url }` con tipo
`linkedin | instagram`, y `verificado`. Siempre cuelga de un `organizadorId`.

`telefonoCelular` y `email` son **opcionales a propósito**: la ingesta muchas
veces identifica al responsable sin su dato directo, y esa carencia es
información de negocio, no un caso borde. La UI nunca finge que el dato existe
—muestra "no detectado" y desactiva la acción— y `brechasDeContacto()` en
`src/lib/eventos.ts` es la única fuente de verdad sobre qué le falta a un
evento para poder gestionarse.

### AlertaInfo

`diasRestantes` y `nivelUrgencia` (`urgente | proximo | planificacion`). Es
**derivada**: la produce `calcularAlerta()` contra la fecha actual. Nunca se
persiste ni llega desde la API.

### Entidades de apoyo

- **Fuente** — origen monitoreado. Distingue dos ejes que no hay que mezclar:
  la **familia** (`ticketera | cartelera_hotel | prensa_local | gremial |
  portal_ferias | manual`), que es cómo se agrupa el panel, y el **mecanismo**
  (`sitio_web | rss | api | redes_sociales | boletin_municipal |
  carga_manual`), que es cómo se obtiene el dato. Guarda `estado`,
  `ultimaEjecucion`, `cadenciaMinutos`, `cobertura`, `anticipacionTipica` y
  `ultimoError`. **No guarda contadores**: cuántos eventos aportó y con qué
  tasa extrajo contactos se deriva de los eventos que la referencian
  (`enriquecerFuentes()`), porque un contador escrito a mano terminaría
  contradiciendo la tabla de eventos.
- **DeteccionManual** — evento cargado desde el formulario de ingreso rápido.
  Vive solo en la sesión del navegador.
- **ConfiguracionAlertas** — umbrales de anticipación, aforo mínimo, categorías
  vigiladas, canales y plantillas de prospección.
- **EventoEnriquecido** — `Evento` con `sede`, `organizador`, `contactos`,
  `contactoPrincipal` y `alerta` ya resueltos. Es el tipo que consumen las
  tarjetas y la tabla.

Convenciones de datos:

- Las fechas son `string` ISO 8601 (`YYYY-MM-DD`). El formateo a `es-CL` ocurre
  solo en la capa de presentación, vía los helpers de `src/lib/eventos.ts`.
- **Nunca usar `new Date("YYYY-MM-DD")` directamente.** La norma manda
  interpretar esa forma como medianoche UTC, así que en Chile (UTC−3/−4) la
  fecha civil se corre un día hacia atrás. Todo parseo pasa por `aFecha()` de
  `src/lib/eventos.ts`, que la construye componente a componente en hora local.
- Los identificadores son `string` opacos (`type ID = string`).
- Los campos derivados se calculan; no se almacenan duplicados de la misma
  verdad.

### Capa de datos

Mientras no exista backend, `src/data/` provee el conjunto de demostración:

- `sedes.ts` y `organizadores.ts` — entidades estáticas (21 sedes, 23
  organizadores, 27 contactos), enfocadas en actividad regional chilena.
- `fuentes.ts` — 14 orígenes monitoreados y `ORIGEN_POR_EVENTO`, el mapa que
  atribuye cada evento a la fuente que lo detectó. Las últimas
  sincronizaciones se declaran como minutos transcurridos, no como fechas
  fijas, por la misma razón que los eventos usan desplazamientos.
- `eventos.ts` — las semillas declaran la fecha como **desplazamiento en días
  respecto de hoy** (`offsetInicio`, `duracion`), de modo que el conjunto
  siempre contiene eventos urgentes, próximos y en planificación sin importar
  cuándo se ejecute. `obtenerEventosEnriquecidos()` resuelve las relaciones y
  calcula la urgencia.

Como la urgencia depende de la fecha actual, `src/app/layout.tsx` declara
`dynamic = "force-dynamic"`: ningún HTML se prerenderiza en build con días
restantes que quedarían obsoletos.

---

## 4. Reglas de diseño

### Dark mode estricto

No existe paleta clara ni alternador de tema. `<html>` lleva `class="dark"`
fija y `color-scheme: dark`. Los tokens se definen una sola vez en
`:root, .dark` dentro de `src/app/globals.css`. El selector `.dark` se conserva
únicamente para que las variantes `dark:` de Tailwind sigan resolviendo dentro
de los componentes de shadcn.

### Superficies

Tres niveles de profundidad, del más oscuro al más claro:
`--sidebar` (0.138) → `--background` (0.165) → `--card` (0.205).
Los bordes son blanco a baja opacidad (`oklch(1 0 0 / 10%)`), nunca un gris
sólido. El acento de marca es cian radar (`--primary`).

### Niveles de urgencia

La anticipación se codifica siempre con el mismo color, en toda la aplicación:

| Nivel | Días restantes | Token | Lectura |
| --- | --- | --- | --- |
| Urgente | < 7 | `--urgente` (rojo) | la ventana de contacto está por cerrarse |
| Próximo | 8–20 | `--proximo` (ámbar) | momento óptimo para agendar |
| Planificación | 21–60 | `--planificacion` (cian) | preparar material y ruta |

Cada nivel tiene su variante `-soft` (16% de opacidad) para fondos. El mapeo
días → nivel vive en `nivelPorDias()` en `src/lib/eventos.ts`; no reimplementar
esos umbrales dentro de un componente. Solo el nivel *urgente* late
(`animate-radar-pulse`); si todo parpadeara, nada destacaría.

### Bandas del panel de alertas

`/alertas` agrupa la agenda en tres **bandas** (`BandaAlerta`, definidas en
`src/lib/metricas.ts`): crítica (< 7 días), oportunidad (8–30) y mediano plazo
(> 30). Responden a una pregunta distinta de la urgencia —qué hacer con el
evento, no cuán cerca está— y por eso son más gruesas: un evento a 25 días es
"planificación" por urgencia y cae en la "ventana de oportunidad" por banda.

Cuando ambas escalas conviven en pantalla, el badge lleva el color de la
urgencia y el contenedor el de la banda. La urgencia sigue siendo la escala
canónica de color; la banda solo tiñe encabezados y bordes de sección.

### Categorías de evento

Cinco acentos fijos: feria industrial (naranja), seminario/congreso (violeta),
exposición comercial (magenta), charla/capacitación (verde), evento público
(azul). Se usan como punto de color, borde o fondo tenue, nunca como fondo
sólido de un bloque grande — compiten con los niveles de urgencia, que tienen
prioridad visual.

### Semáforo de concentración de sedes

`/sedes` clasifica cada recinto en `alta | media | baja` según un índice 0–100
que mezcla volumen de eventos y de público, **relativo al resto del radar**: no
hay umbrales absolutos, así el indicador sigue sirviendo aunque cambie la escala
de los datos.

El semáforo **no** usa el rojo/ámbar/verde clásico. En esta aplicación el rojo
significa alerta crítica y el ámbar, próximo; un recinto muy activo no es una
emergencia. La rampa va de gris (baja) a cian (media) a naranja (alta), y se
dibuja además como tres barras de altura creciente para que el nivel se lea sin
depender del color.

### Uso del color

- El color comunica estado, no decora. Un elemento sin estado va en
  `muted-foreground`.
- El color nunca es el único portador de información: siempre acompañado de
  texto o icono, para daltonismo y para lectura rápida en pantalla pequeña.
- Rojo queda reservado para alerta crítica y acciones destructivas.

### Layout

- Sidebar colapsable: 256 px expandido, 64 px colapsado, con tooltips laterales
  en estado colapsado. El estado vive en `RadarProvider`.
- Header fijo de 64 px con `backdrop-blur`, título derivado de la ruta activa,
  selector de ciudad/región, selector de ventana (7 / 15 / 30 / 60 días) y
  contador de alertas activas.
- Ciudad y ventana son **globales**: viven en `RadarProvider` y filtran todas
  las vistas. Cuando una vista necesita el selector de ciudad en su propia barra
  de filtros, ese control escribe en el estado global —no en una copia local—
  para que header y vista nunca diverjan.
- La ventana del header define el alcance por defecto. Si el usuario elige un
  rango de fechas explícito en la vista, manda el rango: así puede alcanzar
  eventos finalizados o más lejanos que la ventana.
- En `/alertas` la ventana gobierna solo el timeline —es ahí donde cambiar la
  escala cambia la lectura—. Las tres bandas cubren el horizonte completo por
  definición, así que recortarlas con la ventana las vaciaría de sentido.

### Tipografía y espaciado

- Geist Sans para texto (`--font-sans`), Geist Mono para datos monoespaciados.
- Números en tablas y contadores con `tabular-nums`.
- Radio base 0.625rem; la escala `--radius-*` se deriva de ahí.
- Espaciado en múltiplos de 4. Padding de página: 16 px móvil, 24 px escritorio.

### Accesibilidad

- Controles interactivos con `aria-label` cuando el texto visible no basta.
- Enlace de navegación activo marcado con `aria-current="page"`.
- Foco visible mediante `--ring`; no eliminar outlines sin reemplazo.

---

## 5. Estado actual

Las seis vistas están construidas: **Alertas y Timeline** (`/alertas`),
**Explorador de Eventos por Ciudad** (`/eventos`), **Directorio de
Organizadores y Contactos** (`/contactos`), **Mapa y Sedes Frecuentes**
(`/sedes`), **Ingesta & Fuentes** (`/fuentes`) y **Configuración de Alertas**
(`/configuracion`). `VistaPlaceholder` quedó sin uso.

No hay backend ni ingesta real: los datos salen de `src/data/` (21 sedes, 23
organizadores, 27 contactos, 47 eventos, 14 fuentes). La única persistencia es
`localStorage` para la configuración de alertas.

### Componentes de /eventos

```
src/components/eventos/
├── explorador-eventos.tsx   # orquestador: filtros, orden, modo de vista, exportación
├── barra-filtros.tsx        # búsqueda, categorías, rango de fechas, ciudad, aforo
├── tarjeta-evento.tsx       # tarjeta con fecha destacada, cuenta regresiva y contacto colapsable
├── vista-tabla.tsx          # tabla densa ordenable con revelado rápido de contacto
├── dialogo-detalle.tsx      # ficha completa del evento
├── panel-contacto.tsx       # teléfono, WhatsApp, correo con botón de copiar
└── badges.tsx               # BadgeCategoria, BadgeUrgencia, BadgeEstado
```

### Componentes de /alertas

```
src/components/alertas/
├── panel-alertas.tsx        # orquestador: ámbito, KPIs, timeline, bandas, reporte
├── kpi-banners.tsx          # 4 indicadores de cabecera
├── seccion-banda.tsx        # sección colapsable por banda, con su resumen
├── tarjeta-alerta.tsx       # tarjeta con borde de banda, brechas y acción de contacto
├── timeline.tsx             # tira de densidad día a día + cronología vertical
└── dialogo-reporte.tsx      # reporte semanal: copiar, CSV, imprimir/PDF
```

### Componentes de /contactos

```
src/components/contactos/
├── directorio-contactos.tsx     # orquestador: filtros, estado editable, ficha
├── estadisticas-directorio.tsx  # 3 bloques de cabecera
├── tabla-organizadores.tsx      # tabla enriquecida con último y próximos eventos
├── acciones-comunicacion.tsx    # tel: / wa.me / mailto: con asunto precargado
├── ficha-organizador.tsx        # modal con historial, sedes, contactos y notas
└── formulario-contacto.tsx      # alta y edición de contactos secundarios
```

`src/lib/directorio.ts` cruza organizadores, contactos y eventos en
`OrganizadorEnriquecido`, y de ahí salen las estadísticas y los enlaces de
comunicación. Los contactos de una ficha se resuelven filtrando por
`organizadorId`, no por `contactoIds`: así un contacto agregado desde la ficha
aparece sin tener que mantener sincronizadas las dos puntas de la relación.

**Las ediciones del directorio son locales al navegador.** No hay backend: las
notas y los contactos nuevos viven en el estado de `DirectorioContactos` y se
pierden al recargar. La UI lo dice explícitamente en cuanto se edita algo —
nunca hay que dar a entender que un dato quedó guardado cuando no es así.

### Componentes de /sedes

```
src/components/sedes/
├── panel-sedes.tsx          # orquestador: ámbito, comuna, agrupación, ficha
├── mapa-conceptual.tsx      # proyección esquemática de lat/lng en SVG
├── tarjeta-sede.tsx         # tarjeta del grid con ocupación y semáforo
├── ficha-sede.tsx           # modal: contacto, capacidad, ocupación 60 días, historial
└── semaforo-actividad.tsx   # tres barras de concentración histórica
```

`src/lib/sedes.ts` cruza sedes y eventos en `SedeEnriquecida` y de ahí salen la
ocupación, el semáforo y las agrupaciones por ciudad y por familia.

El **mapa es conceptual**, no cartográfico: proyecta lat/lng linealmente sobre
un lienzo para leer dispersión relativa. La UI lo dice explícitamente; nunca hay
que presentarlo como un mapa a escala ni añadirle referencias geográficas que no
existen.

`/eventos` acepta `?q=<término>` para llegar con el buscador precargado. Es el
mecanismo del "ver todos sus eventos" de una sede: un enlace normal, sin estado
compartido entre vistas.

`src/lib/metricas.ts` concentra la lógica de la vista de alertas: bandas, KPIs,
construcción del timeline y generación del reporte. Los componentes no calculan
agregados por su cuenta.

El reporte semanal se genera sobre un horizonte fijo de 7 días
(`HORIZONTE_REPORTE`), independiente de la ventana del header: "semanal"
significa la semana, no lo que esté seleccionado. El PDF sale del diálogo de
impresión del navegador —no hay dependencia de render— así que el botón se
llama "Imprimir / Guardar PDF" y no promete un archivo directo.

### Componentes de /fuentes

`src/lib/fuentes.ts` deriva todo lo que muestra el panel: eventos por fuente,
tasa de extracción de contactos, anticipación observada, minutos desde la
última corrida y si la fuente quedó fuera de cadencia (`FACTOR_ATRASO`, dos
ciclos perdidos).

- `estado-ingesta.tsx` — cuatro lecturas de salud arriba de la vista.
- `tabla-fuentes.tsx` — tabla agrupada por familia; cuando hay error o atraso
  el detalle se despliega en una fila propia bajo la fuente.
- `detecciones-fuente.tsx` — diálogo que explica la tasa: lista los eventos
  aportados y marca cuáles quedaron con contacto utilizable.
- `ingreso-rapido.tsx` — pegado de texto, extracción y formulario editable.
- `panel-fuentes.tsx` — orquesta las pestañas y el filtro por estado.

Dos criterios que conviene no romper:

- La **tasa de extracción es `undefined`, no 0 %**, cuando la fuente todavía no
  aportó eventos: sin denominador no hay tasa, y un 0 % mentiría sobre su
  desempeño.
- La **anticipación es la observada**, no la declarada, y puede superarla: un
  evento anunciado con mucha antelación se detecta cuando se publica, no antes.

`src/lib/extractor.ts` es un extractor **heurístico local**: expresiones
regulares para fechas, teléfonos chilenos, correos y aforos, más coincidencia
contra el catálogo de sedes. **No hay ningún modelo de lenguaje detrás**, y la
UI lo dice con todas sus letras. Todo lo que propone cae en campos editables y
nada se guarda solo.

El selector global de ciudad acota las fuentes: se muestran las de cobertura
nacional más las que cubren esa ciudad.

### Componentes de /configuracion

`src/lib/configuracion.ts` concentra persistencia, validación, simulación de
impacto y render de plantillas.

- `umbrales-anticipacion.tsx` — los dos umbrales sobre una misma línea de
  tiempo, porque lo que importa es su relación.
- `filtros-disparo.tsx` — aforo mínimo, categorías vigiladas y canales.
- `impacto-configuracion.tsx` — qué haría el sistema hoy con esas reglas,
  calculado contra los eventos reales del radar.
- `plantillas-prospeccion.tsx` — plantillas de WhatsApp y correo con vista
  previa contra un evento real, copia al portapapeles y enlace directo.
- `panel-configuracion.tsx` — estado, guardado y avisos de incoherencia.

Criterios:

- La configuración vive en `localStorage`, y la vista lo declara: sirve para
  probar umbrales, no para publicarlos al equipo.
- Se lee **después del montaje** (`useEffect`), no durante el render, para que
  el HTML del servidor y el del cliente coincidan.
- El recordatorio siempre tiene menos anticipación que el aviso principal; si
  se invierte, la vista lo marca y deshabilita el guardado.
- Las plantillas admiten solo las variables de `VARIABLES_PLANTILLA`; cualquier
  otra `{llave}` se señala como probable error de tipeo.
