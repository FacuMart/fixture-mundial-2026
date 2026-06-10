# Fixture Mundial 2026 — Contexto del proyecto

## Qué es

Single Page Application para visualizar el fixture del FIFA World Cup 2026. Vanilla JS + CSS moderno, sin frameworks ni build step. Datos hardcodeados, pensado para extender con carga de resultados.

**Repo:** https://github.com/FacuMart/fixture-mundial-2026
**GitHub Pages:** https://facumart.github.io/fixture-mundial-2026/

---

## Estado actual

| Feature | Estado |
|---|---|
| Estructura de proyecto | ✅ Organizada en carpetas |
| Auditoría y corrección de errores (ronda 1) | ✅ Completo |
| Verificación de datos contra fuentes oficiales (ronda 2) | ✅ Completo |
| Favicon con logo oficial FIFA 2026 | ✅ Completo |
| Sistema de iconos Lucide (CDN) | ✅ Completo |
| Header con logo + countdown + efectos | ✅ Completo |
| Fase de Grupos — vista general con animaciones | ✅ Completo |
| Fase de Grupos — vista individual por grupo | ✅ Completo |
| Bracket de Eliminatorias (visualización) | ✅ Completo — sin líneas conectoras, ver nota ⚠️ |
| Camino de Argentina dinámico | ✅ Completo — panel con estado en localStorage |
| Carga de resultados reales | ⬜ Pendiente |
| Tabla de posiciones calculada | ⬜ Pendiente (estructura estática ya visible) |
| Clasificación automática al bracket | ⬜ Pendiente |
| Filtro por equipo / selección | ⬜ Pendiente |

> ✅ **Bracket completo:** Ronda de 32 (16 partidos, M73–M88) + Octavos (8) + Cuartos (4) + Semis (2) + Final + 3er puesto = **104 partidos totales** (72 grupos + 32 eliminatorias).
>
> ⚠️ **Sedes pendientes de verificación:** 3 partidos tienen sede estimada: Grupo B Suiza–Canadá (Arrowhead, KC), Grupo G Irán–Nueva Zelanda (NRG, Houston), Grupo G Egipto–Irán (NRG, Houston). Marcados con `// ⚠️` en el código.

---

## Estructura de archivos

```
fixture-mundial-2026/
├── index.html                  ← entrada: HTML puro, sin lógica ni estilos inline
├── assets/
│   └── tournaments_fifa-world-cup-2026.football-logos.cc.svg  ← favicon + logo header
├── css/
│   ├── variables.css           ← design tokens (:root), regla .lucide, reset, body
│   ├── layout.css              ← header (3 columnas, partículas, countdown), nav, footer, animaciones
│   ├── groups.css              ← vista general y detalle de grupos; tabla de posiciones; sedes
│   └── bracket.css             ← bracket eliminatorias, final, 3er puesto
├── js/
│   ├── data/
│   │   ├── groups.js           ← constante GROUPS (12 grupos, 48 equipos, 72 partidos)
│   │   └── bracket.js          ← constante BRACKET (ronda32 → octavos → cuartos → semis → final)
│   ├── render/
│   │   ├── groups.js           ← makeGroupCard() + makeGroupDetail() + renderGroups() + initGroupControls()
│   │   └── bracket.js          ← renderBracket()
│   ├── header.js               ← initParticles() + initCountdown() (partículas y countdown Argentina)
│   └── main.js                 ← navegación por tabs + render inicial + lucide.createIcons()
├── docs/
│   └── context.md              ← este archivo
└── mundial2026.html            ← archivo original monolítico (backup de referencia)
```

**Orden de carga de scripts en `index.html`:**
`lucide CDN` → `header.js` → `data/groups.js` → `data/bracket.js` → `render/groups.js` → `render/bracket.js` → `main.js`

`header.js` se carga primero porque no depende de ninguna constante de datos y puede inicializar las partículas y el countdown de inmediato. Sin módulos ES para mantener compatibilidad con apertura directa en el navegador.

---

## Header (`index.html` + `css/layout.css` + `js/header.js`)

### Estructura (3 columnas flex)

```
[ logo FIFA 2026 ]   FIFA WORLD CUP 2026      [ Countdown Argentina ]
                   🇺🇸 · 🇨🇦 · 🇲🇽
                  [ badge 48 equipos ]
```

HTML:
```html
<header class="site-header">
  <div class="header-particles" id="header-particles"></div>
  <div class="header-inner">
    <div class="header-logo-side">
      <img class="header-logo" src="assets/tournaments_fifa-world-cup-2026...svg">
    </div>
    <div class="header-center"> ... </div>
    <div class="header-countdown-side"> ... </div>
  </div>
</header>
```

### Efectos del header

| Efecto | Implementación |
|---|---|
| Gradiente animado de fondo | `background-size: 300%` + `@keyframes headerGradient` (14s) |
| Glow dorado superior | `::before` radial-gradient con `@keyframes glowPulse` (5s) |
| Sweep de luz diagonal | `::after` con `@keyframes headerSweep` (8s) |
| 30 partículas doradas ascendentes | JS en `header.js` crea `<div class="hparticle">` con posición/tamaño/delay random; `@keyframes particleRise` |
| Logo: entrada spring | `cubic-bezier(0.34,1.56,0.64,1)` — overshoot suave |
| Trofeo: anillos orbitales | `::before` (trazos punteados, 10s CW) + `::after` (dos arcos, 6s CCW) en `.bt-trophy-wrap`; el trofeo flota dentro con z-index 1 |
| Logo: flotación loop | `@keyframes logoFloat` (5s, ±7px vertical) |
| Logo: hover glow | `filter: drop-shadow` dorado intenso en `:hover` |
| "WORLD CUP": shimmer | `background-clip: text` + `-webkit-text-fill-color: transparent` + `@keyframes titleShimmer` (4s) |
| Badge: pulso de sombra | `@keyframes badgePulse` (3s, box-shadow expansiva) |

### Countdown (`js/header.js`)

Partidos de Argentina en UTC (datos hardcodeados, ARG = UTC-3):

```js
const ARG_MATCHES = [
  { label: 'Argentina vs Argelia',  info: '16 jun · 22:00 ARG', start: new Date('2026-06-17T01:00:00Z') },
  { label: 'Argentina vs Austria',  info: '22 jun · 14:00 ARG', start: new Date('2026-06-22T17:00:00Z') },
  { label: 'Jordania vs Argentina', info: '27 jun · 23:00 ARG', start: new Date('2026-06-28T02:00:00Z') },
];
```

- `tick()` corre cada 1 segundo con `setInterval`
- `setDigit(el, val)` — actualiza el texto y re-dispara `@keyframes digitFlip` (slide-in desde abajo) via `void el.offsetHeight`
- El partido se muestra en dos líneas: `#countdown-match` (nombre del partido) y `#countdown-info` (fecha/hora) centrados
- Si el partido está en curso (`now` entre `start` y `start + 2h`): muestra `● EN JUEGO` con punto rojo pulsante
- Si todos los partidos pasaron: muestra "Fase Eliminatoria / Grupos completados ✓"
- Los `:` separadores parpadean con `@keyframes sepBlink`
- **Responsive:** se oculta en `< 420px`; se centra en `< 860px`; el logo se oculta en `< 860px`

---

## Fase de Grupos (`js/render/groups.js` + `css/groups.css`)

### Dos vistas con toggle

```
[ Todos los grupos ]  [ Por grupo ]    [A][B][C][D][E][F][G][H][I][J][K][L]
```

El toggle y los pills son generados y gestionados por `initGroupControls()`. Estado en dos variables de módulo:
- `groupView`: `'general'` | `'individual'`
- `selectedLetter`: letra del grupo activo (default `'J'` — Argentina)

Cada pill muestra el color del grupo cuando está activa (inline style). `lucide.createIcons()` se llama después de cada cambio de vista para procesar los nuevos `data-lucide`.

### Vista general — `makeGroupCard(letter, group)`

Tarjeta compacta con:
1. `.group-header` — gradiente con `group.color`
2. `.group-teams` — lista de 4 equipos con flags y badge campeón
3. `.group-matches` — 6 `.match-card`, con clase `argentina-match` si aplica

**Efecto:** `@keyframes cardEntrance` (fade + scale desde 0.97) con `animation-delay` escalonado de 45ms por card (la A sale primero, la L última).

### Vista individual — `makeGroupDetail(letter, group)`

Panel expandido (max-width 780px, centrado) con 4 secciones:

**1. Header expandido**
- Letra gigante (2.6rem), nombre del grupo, subtítulo "FIFA WORLD CUP 2026"
- `@keyframes detailHeaderPulse` — brightness oscila entre 1 y 1.1 cada 5s usando el color del grupo

**2. Fila superior (2 columnas)**

| Columna izquierda | Columna derecha |
|---|---|
| **Equipos** — flags + nombres (fila de Argentina con fondo celeste) | **Clasificación** — tabla PJ/G/E/P/GF/GC/Pts |

Tabla de posiciones:
- Estructura estática (todo en 0 hasta que se carguen resultados)
- Posiciones 1 y 2 tienen número en círculo azul FIFA (`.pos-qualifies`)
- Fila de Argentina con fondo celeste (`var(--arg-accent)`)
- Nota "Los 2 primeros clasifican" con icono `arrow-up-circle` verde

**3. Partidos del grupo**

Los 6 partidos en formato amplio. El siguiente partido cronológico se detecta comparando `Date.now()` contra `parseMatchUTC(m.date, m.time)`:

```js
function parseMatchUTC(dateStr, timeStr) {
  const [day, mon] = dateStr.trim().split(' ');
  const [h, m]     = timeStr.trim().split(':');
  return new Date(Date.UTC(2026, MONTH_MAP[mon], +day, +h + 3, +m));
}
```

- **Próximo partido:** borde dorado + fondo cálido + badge `⚡ Próximo` parpadeante (`.next-match`)
- **En vivo** (dentro de las 2h del inicio): badge `● EN JUEGO` con punto rojo pulsante (`.live-match`)
- Los partidos de Argentina mantienen el borde y fondo celeste (`.argentina-match`)

**4. Sedes del grupo**

Cards con ciudad + nombre del estadio, deduplicadas por ciudad (cada ciudad aparece una vez aunque tenga múltiples partidos):

```js
const seen = new Set();
group.matches.forEach(m => {
  if (seen.has(m.city)) return;
  seen.add(m.city);
  // render sede-item
});
```

Ejemplo Grupo J: Kansas City (Arrowhead), Santa Clara (Levi's), Arlington (AT&T).

**Efecto de entrada:** `@keyframes detailEntrance` — fade + slide-up al cambiar de grupo.

---

## Datos del torneo

### Grupos (`js/data/groups.js`)

```js
GROUPS = {
  A: {
    color: '#E53E3E',
    teams: [ { name, flag, isArgentina } ],
    matches: [ { home, away, date, time, stadium, city } ]
  },
  // B … L
}
```

- 12 grupos (A–L), 4 equipos, 6 partidos por grupo = 72 partidos
- Equipos del sorteo oficial FIFA (Kennedy Center, 5 dic 2025)
- Horarios en **Argentina (UTC-3)**
- `isArgentina: true` solo en el equipo Argentina (Grupo J)

**Grupo J — Argentina:**
```
16 jun 22:00 — Argentina vs Argelia    — Arrowhead Stadium, Kansas City
17 jun 01:00 — Austria vs Jordania     — Levi's Stadium, Santa Clara
22 jun 14:00 — Argentina vs Austria    — AT&T Stadium, Arlington
23 jun 00:00 — Argelia vs Jordania     — Levi's Stadium, Santa Clara
27 jun 23:00 — Argelia vs Austria      — Arrowhead Stadium, Kansas City
27 jun 23:00 — Jordania vs Argentina   — AT&T Stadium, Arlington
```

### Bracket (`js/data/bracket.js`)

```js
BRACKET = {
  ronda32: [ { id, label, home, away, date, isArgPath } ],  // 16 partidos M73–M88
  octavos: [ ... ],  // 8
  cuartos: [ ... ],  // 4
  semis:   [ ... ],  // 2
  final:   { home, away, date, stadium },
  tercero: { home, away, date, stadium },
}
```

- `home`/`away` son slots (`'1J'`, `'G M85'`, etc.), no equipos reales
- `isArgPath` en los datos es referencia documental; el render lo ignora — la clase `.bt-arg` la gestiona `applyArgPath()` en `render/bracket.js`
- **Camino Argentina si termina 1°J:** R32-14 → R16-7 → QF-4 → SF-2
- **Camino Argentina si termina 2°J:** R32-12 → R16-6 → QF-3 → SF-2 (misma semi)
- **Final:** MetLife Stadium, East Rutherford (19 jul)
- **3er puesto:** Hard Rock Stadium, Miami (18 jul)

---

## Banderas — flag-icons

CDN: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css">`

Uso: `<span class="fi fi-{code}"></span>` donde `{code}` es el ISO 3166-1 alpha-2 del país (ej: `ar`, `br`, `gb-sct` para Escocia, `gb-eng` para Inglaterra).

Helper en `render/groups.js`: `flagImg(code)` genera el HTML del span.

El campo `flag` en `js/data/groups.js` almacena el código ISO (no el emoji).

**Tamaños por contexto (todos con `background-size: cover`, proporción 4:3, sin border-radius, `border: 1px solid rgba(0,0,0,0.18)`):**

| Contexto | Clase CSS | Dimensiones |
|---|---|---|
| Team rows (vista general/detalle) | `.team-flag .fi` | 24×18px |
| Vista detalle ampliada | `.detail-col .team-flag .fi` | 28×21px |
| Match cards | `.match-team .fi` | 18×14px |
| Tabla de posiciones | `.standings-table .td-team .fi` | 20×15px |
| Header anfitriones | `.header-hosts .fi` | 40×30px |

---

## Sistema de iconos — Lucide

CDN: `<script src="https://unpkg.com/lucide@latest"></script>`

`lucide.createIcons()` se llama en `main.js` después del render inicial, y en `initGroupControls()` después de cada cambio de vista (para procesar los nuevos nodos del DOM).

**Mapa de iconos:**

| `data-lucide` | Dónde |
|---|---|
| `circle-dot` | Header badge |
| `layout-grid` | Tab grupos / toggle vista general |
| `zoom-in` | Toggle vista por grupo |
| `trophy` | Tab eliminatorias, encabezado Final |
| `star` | Badge campeón Argentina (×3) |
| `flag` | Fallback bandera de equipo (cuando no se encuentra el equipo) |
| `calendar` / `calendar-days` | Fecha de partidos |
| `building-2` | Estadio |
| `map-pin` / `map` | Ciudad / Sedes |
| `minus` | Slots TBD en bracket |
| `medal` | 3er y 4to puesto |
| `users` | Sección equipos (detalle) |
| `bar-chart-2` | Sección clasificación (detalle) |
| `arrow-up-circle` | Nota "clasifican" (detalle) |
| `zap` | Badge "Próximo" partido |
| `check-circle` | Grupos completados |

---

## Estilos

### Design tokens (`css/variables.css`)

| Variable | Valor | Uso |
|---|---|---|
| `--fifa-blue` | `#0033A0` | Color primario |
| `--gold` / `--gold-dark` | `#FFD700` / `#C9A800` | Acentos dorados |
| `--bg` | `#F5F7FA` | Fondo de página |
| `--surface` | `#FFFFFF` | Cards |
| `--border` | `#E2E8F0` | Bordes |
| `--text-main` / `--text-muted` / `--text-light` | — | Jerarquía de texto |
| `--arg-blue` / `--arg-blue-dk` | `#74ACDF` / `#4A8FC0` | Acento albiceleste |
| `--arg-accent` | `rgba(116,172,223,0.15)` | Fondo partidos/filas Argentina |
| `--shadow-sm/md/hover` | — | Sombras |
| `--radius` / `--radius-sm` | `12px` / `8px` | Border radius |
| `--transition` | `0.22s ease` | Transiciones globales |

### Clases clave

| Clase | Archivo | Descripción |
|---|---|---|
| `.lucide` | `variables.css` | Base de todos los iconos Lucide |
| `.argentina-match` | `groups.css` | Borde celeste + fondo suave |
| `.next-match` | `groups.css` | Borde dorado + fondo cálido + badge parpadeante |
| `.live-match` | `groups.css` | Borde rojo + badge EN JUEGO con punto pulsante |
| `.champion-badge` | `groups.css` | Badge ★★★ Campeón |
| `.bt-arg` | `bracket.css` | Ring celeste en camino de Argentina (aplicado dinámicamente) |
| `.arg-panel-inner` | `bracket.css` | Panel de seguimiento del camino de Argentina |
| `.arg-btn` / `.arg-btn-elim` | `bracket.css` | Botones del panel (activo celeste / eliminado rojo) |
| `.tbd` | `bracket.css` | Slots vacíos del bracket |
| `.detail-top-row` | `groups.css` | Flex de 2 columnas en vista individual |
| `.standings-table` | `groups.css` | Tabla de posiciones (estática) |
| `.sede-item` | `groups.css` | Card de ciudad + estadio |
| `.header-countdown-side` | `layout.css` | Columna derecha del header (centrada) |
| `.hparticle` | `layout.css` | Partícula dorada flotante |

---

## Errores corregidos

### Auditoría de código (ronda 1)

| Archivo | Error | Fix |
|---|---|---|
| `js/data/groups.js` | `city: 'Dallas'` en AT&T Stadium | → `'Arlington'` |
| `css/variables.css` | Variables `--g-A` a `--g-L` sin usar | Eliminadas |
| `css/bracket.css` | `.bracket-connector` sin elemento que la use | Eliminada |
| `css/bracket.css` | `min-width: 900px` para 5 columnas | → `1200px` |
| `js/render/bracket.js` + `css/bracket.css` + `js/main.js` | Líneas conectoras SVG entre rondas | Eliminadas — bracket sin líneas |
| `index.html` | Botones de nav sin `type="button"` | Corregido |
| `index.html` | `<nav>` sin `aria-label` | Agregado |
| `js/main.js` | `rAF` para re-trigger de animación | → `void offsetHeight` (reflow síncrono) |

### Verificación de datos (ronda 2)

| Área | Error | Fix |
|---|---|---|
| Grupo D | `Rep. Europeo C` placeholder | → `Türkiye` 🇹🇷 |
| Grupo F | `Rep. Europeo B` + 6 partidos incorrectos | → `Suecia` 🇸🇪 + datos reescritos |
| Grupo I | `Rep. FIFA Playoff 2` + 6 partidos incorrectos | → `Noruega` 🇳🇴 + datos reescritos |
| Grupo J | 5 de 6 partidos con datos incorrectos | Reescritos (1er: 16 jun KC) |
| Grupo K | `Rep. Congo` ambiguo | → `RD Congo` 🇨🇩 |
| Múltiples grupos | Denver/Empower Field como sede | Eliminado — Denver no es sede |
| Bracket | Solo 8 "octavos" para 32 clasificados | → Ronda de 32 (16 partidos M73–M88) |
| Bracket | Argentina: `1J vs 2I`, 2 jul | → `1J vs 2H`, 3 jul, Hard Rock Miami |
| Bracket | 3er puesto: AT&T Arlington | → Hard Rock Stadium, Miami |

**Sedes con `// ⚠️` en el código (estimadas, no verificadas oficialmente):**
- Grupo B: Suiza vs Canadá (25 jun) — Arrowhead Stadium, KC
- Grupo G: Irán vs Nueva Zelanda (16 jun) — NRG Stadium, Houston
- Grupo G: Egipto vs Irán (26 jun) — NRG Stadium, Houston

---

## Decisiones de diseño

- **Sin módulos ES:** scripts clásicos para abrir `index.html` directo sin servidor.
- **DOM imperativo:** `createElement` en JS, sin templates HTML, para facilitar futura generación con datos reales.
- **Títulos de columna del bracket posicionados dinámicamente:** `bt-col-title` no tiene `top` fijo en CSS; `makeBtColumn()` calcula `top = firstCardCenter - H/2 - 22px` para que cada título quede pegado al primer card de su columna (R32, Octavos, Cuartos, Semis).
- **Datos separados del render:** `js/data/` exporta constantes; `js/render/` las consume. Al agregar resultados, `data/` puede volverse async sin tocar renders.
- **`lucide.createIcons()` múltiple:** se llama en el render inicial y en cada cambio de vista de grupos, para procesar los nuevos nodos que se agregan al DOM dinámicamente.
- **Countdown hardcodeado en UTC:** las fechas de Argentina se definen como `new Date('...Z')` en `header.js` para no depender de parsing de strings ni zona horaria del navegador.
- **parseMatchUTC en render:** la detección de "próximo partido" en la vista individual usa la misma lógica de conversión ARG→UTC, centralizada en `parseMatchUTC()` dentro de `render/groups.js`.
- **Hash de URL para persistencia de pestaña:** `location.hash` guarda la pestaña activa (`#grupos` / `#eliminatorias`). Al cargar, `main.js` lee el hash y restaura la pestaña sin animación. El botón Atrás del navegador también navega entre pestañas.
- **`mundial2026.html` preservado:** backup del archivo monolítico original.
- **Camino de Argentina calculado dinámicamente:** `isArgPath` en los datos ya no se usa para el render. `computeArgIds(state)` devuelve un `Set` de IDs a pintar según posición y resultados guardados en `localStorage` (`arg_bracket`). `applyArgPath()` aplica/quita `.bt-arg` sin re-renderizar el árbol. Ambas rutas confluyen en SF-2.

---

## Carga automática de resultados — opciones evaluadas

| Opción | Viabilidad | Detalle |
|---|---|---|
| **api-football.com** (RapidAPI) | ✅ Mejor opción | CORS habilitado, tier gratuito 100 req/día, cubre FIFA World Cup. Requiere API key |
| **football-data.org** | ✅ Alternativa | Gratuito con registro, CORS habilitado. Cobertura de WC 2026 puede demorar |
| Scraping directo FIFA/ESPN | ❌ No viable | CORS bloquea requests desde el browser sin backend |
| APIs no oficiales (SofaScore) | ⚠️ Inestable | Sin garantías de continuidad |

Pendiente de implementar: fetch al cargar la página, mapeo de resultados al formato de `GROUPS`/`BRACKET`, guardado en `localStorage` como caché.

---

## Próximos pasos posibles

- **Carga de resultados:** inputs de score en cada `.match-card`, guardado en `localStorage`
- **Tabla de posiciones calculada:** poblar la standings table con PJ/G/E/P/GF/GC/DG/Pts reales a partir de los resultados cargados
- **Clasificación automática al bracket:** poblar los slots según posiciones finales de grupos
- **Filtro por equipo:** highlight de todos los partidos de un equipo al clickearlo
- **Dark mode:** toggle con `prefers-color-scheme` + variable override
- **Verificar 3 sedes pendientes** (Grupo B y Grupo G)
