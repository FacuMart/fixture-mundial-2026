# Fixture Mundial 2026 — Contexto del proyecto

## Qué es

Single Page Application para visualizar el fixture del FIFA World Cup 2026. Vanilla JS + CSS moderno, sin frameworks ni build step. Datos hardcodeados + resultados en `data/results.json`.

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
| Carga de resultados reales (`data/results.json`) | ✅ Completo |
| Tabla de posiciones calculada | ✅ Completo — PJ/G/E/P/GF/GC/Pts desde resultados |
| Diseño responsive (mobile-first) | ✅ Completo |
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
│   ├── groups.css              ← vista general y detalle de grupos; tabla de posiciones; sedes; results bar
│   └── bracket.css             ← bracket eliminatorias, final, 3er puesto
├── js/
│   ├── data/
│   │   ├── groups.js           ← constante GROUPS (12 grupos, 48 equipos, 72 partidos)
│   │   └── bracket.js          ← constante BRACKET (ronda32 → octavos → cuartos → semis → final)
│   ├── render/
│   │   ├── groups.js           ← makeGroupCard() + makeGroupDetail() + renderGroups() + initGroupControls() + calcStandings()
│   │   └── bracket.js          ← renderBracket()
│   ├── header.js               ← initParticles() + initCountdown() (partículas y countdown Argentina)
│   └── main.js                 ← async init + loadResults() + refreshResults() + activateTab() + lucide.createIcons()
├── data/
│   └── results.json            ← fuente de verdad de resultados (se edita manualmente y se pushea)
├── docs/
│   └── context.md              ← este archivo
└── mundial2026.html            ← archivo original monolítico (backup de referencia)
```

**Orden de carga de scripts en `index.html`:**
`lucide CDN` → `header.js` → `data/groups.js` → `data/bracket.js` → `render/groups.js` → `render/bracket.js` → `main.js`

`header.js` se carga primero porque no depende de ninguna constante de datos. `main.js` es un async IIFE que espera `loadResults()` antes de renderizar. Sin módulos ES para mantener compatibilidad con apertura directa en el navegador (en file:// el fetch falla silenciosamente y se usan resultados vacíos como fallback).

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

**Breakpoints del header:**

| Ancho | Comportamiento |
|---|---|
| > 860px | 3 columnas completas (logo + centro + countdown) |
| ≤ 860px | Logo oculto; countdown inline centrado |
| ≤ 600px | Header apilado verticalmente (`flex-direction: column`), padding reducido |
| ≤ 420px | Countdown oculto; solo centro; título con `clamp` más pequeño |

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

### Sistema de resultados

`data/results.json` es la fuente de verdad. Estructura:

```json
{
  "updated": "2026-06-11T20:30:00Z",
  "groups": {
    "A-0": { "home": 2, "away": 1 },
    "A-1": { "home": 0, "away": 0 }
  },
  "bracket": {}
}
```

- La clave es `"<letra>-<índice>"` donde el índice es la posición del partido en `group.matches` (0–5).
- Para agregar un resultado: editar el JSON y hacer push a GitHub. En el site, el usuario puede pulsar "Actualizar" para refrescar sin recargar la página.

**Funciones clave en `render/groups.js`:**

```js
function getResult(letter, index) {
  return (window.RESULTS?.groups || {})[`${letter}-${index}`] ?? null;
}

function calcStandings(letter, group) {
  // Calcula PJ/G/E/P/GF/GC/Pts para cada equipo del grupo
  // a partir de los resultados disponibles en window.RESULTS
  // Ordena por: Pts → DG → GF
  // Devuelve array de equipos ordenados (misma forma que group.teams + stats)
}
```

**`window.RESULTS`** se carga en `main.js` con `loadResults()` antes del primer render. Los renders de grupos leen de ahí directamente — no hay estado adicional.

### Vista general — `makeGroupCard(letter, group)`

Tarjeta compacta con:
1. `.group-header` — gradiente con `group.color`
2. `.group-teams` — lista de 4 equipos con flags y badge campeón
3. `.group-matches` — 6 `.match-card` con score real si existe, o `– : –`

Partidos con resultado: clase `.match-completed` (opacidad 0.82, equipo en `text-muted`) + `.match-score.completed` (score en bold).

**Efecto:** `@keyframes cardEntrance` (fade + scale desde 0.97) con `animation-delay` escalonado de 45ms por card (la A sale primero, la L última).

### Vista individual — `makeGroupDetail(letter, group)`

Panel expandido (max-width 780px, centrado) con 4 secciones:

**1. Header expandido**
- Letra gigante (2.6rem), nombre del grupo, subtítulo "FIFA WORLD CUP 2026"
- `@keyframes detailHeaderPulse` — brightness oscila entre 1 y 1.1 cada 5s usando el color del grupo

**2. Fila superior (2 columnas)**

| Columna izquierda | Columna derecha |
|---|---|
| **Equipos** — flags + nombres (fila de Argentina con fondo celeste) | **Clasificación** — tabla PJ/G/E/P/GF/GC/Pts calculada con `calcStandings()` |

Tabla de posiciones:
- Usa `calcStandings(letter, group)` — datos reales si hay resultados, ceros si no
- El orden de filas refleja la tabla real (mejor pts primero), no el orden del sorteo
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

- **Completado:** `.match-completed` + score en bold — no puede ser "próximo"
- **Próximo partido:** borde dorado + fondo cálido + badge `⚡ Próximo` parpadeante (`.next-match`) — solo si sin resultado y aún no jugado
- **En vivo** (dentro de las 2h del inicio, sin resultado): badge `● EN JUEGO` con punto rojo pulsante (`.live-match`)
- Los partidos de Argentina mantienen el borde y fondo celeste (`.argentina-match`)

**4. Sedes del grupo**

Cards con ciudad + nombre del estadio, deduplicadas por ciudad.

### Responsive de grupos

| Breakpoint | Cambio |
|---|---|
| ≤ 700px | `.detail-top-row` apila columnas verticalmente; `border-right` → `border-bottom` |
| ≤ 700px | `.detail-matches .match-info` pasa a `flex-wrap: wrap`; sedes en columna |
| ≤ 500px | Columna GC oculta en tabla de posiciones; results bar apilada; pills más pequeñas |

### Barra de resultados (`.results-bar`)

Aparece arriba del toggle de vistas en la sección Fase de Grupos:

```html
<div class="results-bar">
  <span id="results-updated">Cargando resultados…</span>
  <button id="refresh-btn"><i data-lucide="refresh-cw"></i> Actualizar</button>
</div>
```

- Muestra el timestamp del último `updated` en `results.json` (formato local es-AR)
- El botón llama `refreshResults()` que re-fetcha el JSON y re-renderiza grupos + bracket
- Durante la carga: el icono del botón gira con `@keyframes spinIcon` (clase `.spinning`)

---

## Bracket — Visual Design (`css/bracket.css`)

### Fondo oscuro de la sección eliminatorias

`#tab-eliminatorias` tiene un fondo navy oscuro con brillo azul:

```css
#tab-eliminatorias {
  background:
    radial-gradient(ellipse at 50% 42%, rgba(0,51,160,0.22) 0%, transparent 58%),
    linear-gradient(170deg, #0D1B3E 0%, #060E22 100%);
  border-radius: var(--radius);
  padding-bottom: 36px;
  box-shadow: 0 8px 48px rgba(0,0,0,0.35);
}
```

Todos los textos secundarios del bracket (`.arg-panel`, `.bt-col-title`, `.bracket-scroll-hint`) tienen overrides para ser legibles sobre este fondo oscuro (colores en blanco semitransparente).

### Cards del bracket (`.bt-match`)

Fondo azul FIFA oscuro con gradiente:

```css
.bt-match {
  background: linear-gradient(135deg, #0D2A6E 0%, #091E52 100%);
  overflow: hidden; /* necesario para clipear el shimmer ::before */
}
.bt-label  { background: rgba(0,0,0,0.22); color: rgba(255,255,255,0.38); }
.bt-team   { color: rgba(255,255,255,0.55); border-bottom: 1px solid rgba(255,255,255,0.07); }
.bt-date   { color: rgba(255,255,255,0.32); background: rgba(0,0,0,0.18); }
.bt-match.bt-arg .bt-team { color: var(--arg-blue); }
```

### Animación shimmer (`.bt-match::before`)

Barrido de luz diagonal que se repite cada 5s. El pseudo-elemento es un gradiente lineal diagonal que viaja de izquierda a derecha (o derecha a izquierda en la mitad derecha del bracket):

```css
.bt-match::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg,
    transparent 30%, rgba(255,255,255,0.32) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: btCardShimmer 5s ease var(--shimmer-delay, 0.5s) infinite;
}
@keyframes btCardShimmer {
  0%   { transform: translateX(-120%); }
  13%  { transform: translateX(220%); }
  100% { transform: translateX(220%); }
}
```

- **Delay por columna:** `--shimmer-delay` se setea con `card.style.setProperty('--shimmer-delay', ...)` en `makeBtColumn()`. Las columnas más cercanas al centro del bracket tienen mayor delay, creando efecto de luz que emana del centro.
- **Dirección RTL para mitad derecha:** la clase `.bt-shimmer-rtl` se agrega vía JS (`if (rtl) card.classList.add('bt-shimmer-rtl')`) y la regla CSS usa `animation-direction: reverse` para invertir el barrido sin duplicar el keyframe.
- **`overflow: hidden` es crítico:** sin él el pseudo-elemento es visible fuera de la card.

### Tercer y cuarto puesto (`.bt-third-card`)

Estilo dorado oscuro para distinguirlo del bracket estándar:

```css
.bt-third-title { color: var(--gold-dark); }
.bt-third-card {
  background: linear-gradient(135deg, #2C1F00 0%, #1A1200 100%);
  border: 1.5px solid rgba(201,168,0,0.45);
  box-shadow: 0 0 14px rgba(201,168,0,0.18);
}
.bt-third-card .bt-team { color: rgba(255,215,0,0.62); }
.bt-third-card .bt-date { color: rgba(255,215,0,0.38); }
```

### Centro del bracket (`.bt-center` + `.bt-trophy-wrap`)

El trofeo se posiciona al **tope** de la columna central (no centrado verticalmente), para que quede por encima de las cards de los semifinalistas:

```css
.bt-center {
  justify-content: flex-start;  /* antes: center */
  padding: 44px 12px 0;         /* antes: padding-bottom: 200px */
}
.bt-trophy-wrap { margin-bottom: 28px; }
```

**Por qué `margin-bottom: 28px`:** El anillo orbital exterior del trofeo mide 104px. La imagen del trofeo mide 68px. El anillo se extiende `(104-68)/2 = 18px` por debajo del borde de la imagen. Sin margen suficiente, el anillo superpone el texto "LA GRAN FINAL". Con `28px` hay ~10px de clearance visual.

---

## Bracket — Responsive (`css/bracket.css` + `js/render/bracket.js`)

El bracket es inherentemente ancho (4 rondas × 2 lados + centro). El enfoque es **scroll horizontal con momentum**, no una vista alternativa. No se puede mostrar un bracket simétrico de 8 columnas en 390px sin scroll.

### Dimensiones adaptativas (`BT` en `render/bracket.js`)

`BT` es un objeto `let` que se actualiza al inicio de cada `renderBracket()` según `window.innerWidth`:

| Viewport | H (card height) | CW (col width) | Ancho total aprox. |
|---|---|---|---|
| ≥ 900px | 90px | 128px | ~1370px |
| 600–899px | 78px | 110px | ~1160px |
| < 600px | 68px | 92px | ~990px |

`BT.CG` (gap entre columnas) está definido pero no se usa en JS — el gap real es el CSS `gap` de `.bt-half`, que se ajusta vía media queries.

### Hint de scroll

```html
<div class="bracket-scroll-hint">
  <i data-lucide="move-horizontal"></i> Deslizá para ver el bracket completo
</div>
```

- Visible en pantallas < 1300px (media query en CSS)
- Se desvanece automáticamente con `@keyframes hintFade` (4s delay, fade a 0)

### Breakpoints del bracket

| Breakpoint | Cambio |
|---|---|
| ≤ 1300px | Hint de scroll visible |
| ≤ 900px | `.bt-half gap: 14px`; centro 175px; trofeo 56px; botones arg más grandes |
| ≤ 600px | `.bt-half gap: 8px`; centro 130px; trofeo 44px; anillos orbitales escalados; arg panel apilado verticalmente con botones táctiles (6×12px) |

### Scrolling táctil

`.bracket-wrapper` tiene `-webkit-overflow-scrolling: touch` para momentum scroll en iOS. `.bracket-container` usa `width: max-content` en lugar de `min-width: 1370px` fijo, dejando que el contenido JS controle el ancho real.

### Arg panel en mobile (< 600px)

Los pasos (Grupo J → R32 → Octavos → ...) se apilan verticalmente. Los separadores `›` se ocultan. Los botones pasan a `padding: 6px 12px; font-size: 0.7rem` para cumplir tamaño mínimo táctil recomendado.

---

## Flujo de actualización de resultados

1. Partido termina → editar `data/results.json` con la nueva clave `"X-N": { "home": a, "away": b }`
2. Actualizar el campo `"updated"` al timestamp actual
3. `git add data/results.json && git commit -m "resultados" && git push`
4. GitHub Pages actualiza en ~1 min
5. El usuario pulsa "Actualizar" en el site (o recarga) — `loadResults()` hace `fetch('data/results.json?t=<now>')` con cache-busting

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

`lucide.createIcons()` se llama en `main.js` después del render inicial, en `initGroupControls()` después de cada cambio de vista, y en `refreshResults()` tras re-renderizar.

**Mapa de iconos:**

| `data-lucide` | Dónde |
|---|---|
| `circle-dot` | Header badge |
| `layout-grid` | Tab grupos / toggle vista general |
| `zoom-in` | Toggle vista por grupo |
| `trophy` | Tab eliminatorias, encabezado Final |
| `star` | Badge campeón Argentina (×3) |
| `flag` | Fallback bandera de equipo |
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
| `refresh-cw` | Botón Actualizar resultados |
| `move-horizontal` | Hint de scroll del bracket |

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
| `.match-completed` | `groups.css` | Partido terminado: opacidad reducida, score en bold |
| `.match-score.completed` | `groups.css` | Score numérico en bold, color `text-main` |
| `.results-bar` | `groups.css` | Barra de timestamp + botón Actualizar |
| `.results-refresh-btn.spinning` | `groups.css` | Icono girando durante el fetch |
| `.champion-badge` | `groups.css` | Badge ★★★ Campeón |
| `.bt-arg` | `bracket.css` | Ring celeste en camino de Argentina (aplicado dinámicamente) |
| `.bt-shimmer-rtl` | `bracket.css` | Shimmer direction reverse en cards de la mitad derecha del bracket |
| `.bt-third-card` | `bracket.css` | Card 3er/4to puesto con fondo y bordes dorados |
| `.arg-panel-inner` | `bracket.css` | Panel de seguimiento del camino de Argentina |
| `.arg-btn` / `.arg-btn-elim` | `bracket.css` | Botones del panel (activo celeste / eliminado rojo) |
| `.tbd` | `bracket.css` | Slots vacíos del bracket |
| `.detail-top-row` | `groups.css` | Flex de 2 columnas en vista individual |
| `.standings-table` | `groups.css` | Tabla de posiciones (calculada con `calcStandings()`) |
| `.sede-item` | `groups.css` | Card de ciudad + estadio |
| `.header-countdown-side` | `layout.css` | Columna derecha del header (centrada) |
| `.hparticle` | `layout.css` | Partícula dorada flotante |
| `.bracket-scroll-hint` | `bracket.css` | Hint "deslizá" visible < 1300px, se desvanece con CSS |

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
- **Datos separados del render:** `js/data/` exporta constantes; `js/render/` las consume. Los resultados viven en `data/results.json` y se leen de `window.RESULTS` en render time.
- **`lucide.createIcons()` múltiple:** se llama en el render inicial, en cada cambio de vista de grupos, y en `refreshResults()`.
- **Countdown hardcodeado en UTC:** las fechas de Argentina se definen como `new Date('...Z')` en `header.js` para no depender de parsing de strings ni zona horaria del navegador.
- **parseMatchUTC en render:** la detección de "próximo partido" en la vista individual usa la misma lógica de conversión ARG→UTC, centralizada en `parseMatchUTC()` dentro de `render/groups.js`.
- **Hash de URL para persistencia de pestaña:** `location.hash` guarda la pestaña activa (`#grupos` / `#eliminatorias`). Al cargar, `main.js` lee el hash y restaura la pestaña sin animación.
- **`mundial2026.html` preservado:** backup del archivo monolítico original.
- **Camino de Argentina calculado dinámicamente:** `isArgPath` en los datos ya no se usa para el render. `computeArgIds(state)` devuelve un `Set` de IDs a pintar según posición y resultados guardados en `localStorage` (`arg_bracket`). `applyArgPath()` aplica/quita `.bt-arg` sin re-renderizar el árbol. Ambas rutas confluyen en SF-2.
- **Resultados estáticos en JSON:** se eligió `data/results.json` como fuente de verdad (sin API) por costo cero, sin rate limits, funcionamiento offline, y control total del dato. El workflow es: editar JSON → push → GitHub Pages. Las APIs de fútbol disponibles (api-football.com, football-data.org) no tenían cobertura confiable del WC 2026 al momento de evaluar.
- **Cache-busting en fetch:** `loadResults()` agrega `?t=<Date.now()>` a la URL para evitar que el browser sirva el JSON antiguo tras un push.
- **Bracket responsive sin vista alternativa:** el bracket simétrico de 8 columnas no puede mostrarse sin scroll en pantallas < 1300px. Se optó por scroll horizontal con momentum (`-webkit-overflow-scrolling: touch`) + hint visual que se desvanece, en lugar de un layout alternativo que rompería la simetría visual. Las dimensiones `BT` se reducen por viewport para minimizar el ancho total (~990px en mobile vs ~1370px en desktop).
- **Tab nav con overflow-x scroll:** en lugar de `flex-wrap` (que causaría línea doble), la barra de tabs usa `overflow-x: auto; scrollbar-width: none` para que se desplace horizontalmente si los botones no caben. En la práctica con 2 tabs siempre caben, pero es a prueba de futuras extensiones.
- **GC oculta en tabla mobile:** en < 500px se oculta la columna "Goles en contra" de la standings table para que las 8 columnas restantes quepan sin reducir la legibilidad excesivamente.

---

## Backlog — Mejoras pendientes

Organizado por dificultad estimada. Cada ítem está listo para implementar en una sesión nueva.

---

### 🟢 Fácil

#### 1. Ocultar barra de resultados y panel de Argentina (temporalmente)

**Qué:** Ocultar el `#arg-panel` y `.results-bar` hasta que haya más contenido/resultados reales que justifiquen mostrarlos visualmente.

**Cómo:**
- Opción A (más simple): `display: none` en CSS sobre `#arg-panel` y `.results-bar`.
- Opción B (más limpia): agregar un flag `SHOW_ARG_PANEL = false` al inicio de `render/bracket.js` y envolver `renderArgPanel()` con un `if`. Ídem para la results bar en `index.html`.

**Archivo/s:** `css/bracket.css` o `js/render/bracket.js` + `index.html`

---

#### 2. Shimmer no arranca al cargar — espera a que el bracket esté visible

**Qué:** El shimmer actualmente empieza con `animation-delay` fijo desde que se renderiza el DOM. Si el usuario está en la pestaña "Fase de Grupos" al cargar, las animaciones del bracket ya se habrán consumido cuando vaya a "Llaves". El shimmer debería comenzar (o reiniciarse) cuando la sección `#tab-eliminatorias` se hace visible.

**Cómo:**
- En `activateTab()` dentro de `main.js`, cuando se activa `'eliminatorias'`, agregar y quitar una clase `.bt-animate-ready` al `#bracket-container`.
- En CSS: las animaciones de shimmer solo corren cuando el ancestro tiene `.bt-animate-ready`. Sin la clase, `animation-play-state: paused`.
- Alternativa más simple: al activar la tab, recalcular y reasignar los `animation-delay` inline para que cuenten desde ese momento (forzar reflow con `void el.offsetHeight`).

**Archivo/s:** `js/main.js`, `css/bracket.css`

---

### 🟡 Medio

#### 3. Centrado vertical del bracket de la Final respecto a las Semis

**Qué:** Al mover `.bt-center` a `justify-content: flex-start` para subir la copa, el bloque entero de la Final quedó demasiado elevado. El card de la Final debería estar centrado verticalmente entre los dos cards de Semi (`SF-1` y `SF-2`), que están posicionados absolutamente en `pos.sf` (el punto medio del bracket completo).

**Cómo:**
- `pos.sf[0]` es el `midY` del único partido de cada lado. La Final debería estar centrada en ese mismo `midY`. Actualmente el `bt-final-block` sube junto con la copa.
- Separar el trofeo del card: el `.bt-trophy-wrap` puede tener `position: absolute; top: 0` dentro de `.bt-center`, y el `.bt-final-block` usar `margin-top` calculado en JS para alinearse con `pos.sf[0] - finalCardHeight/2`.
- O en CSS puro: usar `padding-top` calculado en `.bt-final-block` para que su card quede al nivel correcto, independientemente de la altura del trofeo.

**Archivo/s:** `css/bracket.css`, posiblemente `js/render/bracket.js` para cálculo dinámico del offset

---

#### 4. Scroll vertical indeseado en el bracket en mobile

**Qué:** En mobile, el área del bracket genera scroll vertical dentro del contenedor además del scroll horizontal. Debería usar solo el scroll de la página para el eje Y, y el scroll horizontal del wrapper para el eje X.

**Causa probable:** `.bracket-wrapper` o `.bracket-container` tienen altura fija o `min-height` que, combinado con `overflow-x: auto`, también activa `overflow-y: auto/scroll` en algunos browsers (especialmente Safari/iOS). El `overflow-x: auto` implícitamente establece `overflow-y: auto` si no se especifica lo contrario.

**Cómo:**
```css
.bracket-wrapper {
  overflow-x: auto;
  overflow-y: visible; /* explícito — evita el scroll Y secundario */
}
```
Si `.bracket-container` tiene `height` fijo, cambiarlo a `height: auto`. Verificar también que ningún ancestro tenga `overflow: hidden` que esté recortando y creando el scroll.

**Archivo/s:** `css/bracket.css`

---

#### 5. Coherencia visual entre Fase de Grupos y Eliminatorias

**Qué:** La sección de grupos usa fondo blanco/gris claro (`--bg`, `--surface`) con cards blancas. El bracket ahora tiene fondo navy oscuro con cards azul FIFA. Hay una discontinuidad visual entre tabs. Evaluar si conviene:
- a) Oscurecer levemente el fondo de la sección de grupos (no necesariamente tan oscuro como el bracket)
- b) Agregar un acento de color más FIFA a los headers de grupo (ya tienen el `group.color`, pero podrían tener más brillo)
- c) Unificar la tipografía y sizing de los badges

**Qué revisar puntualmente:**
- `.group-header` vs `.bt-col-title` — jerarquía visual
- Match cards en grupos (`.match-card`) vs bracket cards (`.bt-match`) — grosor de borde, radius, shadows
- Tabla de posiciones — ¿encaja con el resto del diseño?
- El panel de controles (toggle vista + pills) — ¿se ve bien junto a la results-bar?

**Archivo/s:** `css/groups.css`, `css/variables.css`

---

### 🔴 Difícil

#### 6. Animación de entrada de cards del bracket (reveal escalonado → shimmer)

**Qué:** Al cargar la sección de eliminatorias, los cards deberían aparecer de a uno (o de a grupos por ronda), de afuera hacia adentro (R32 primero, luego Octavos, Cuartos, Semis, Final). Cuando el último card termine de aparecer, arranca el shimmer.

**Cómo:**

**Fase 1 — Reveal escalonado:**
- Las cards arrancan con `opacity: 0; transform: translateY(12px)` (o scale).
- JS agrega la clase `.bt-revealed` a cada card con `setTimeout` escalonado: `delay = roundIndex * 180 + cardIndexInRound * 40` ms.
- `.bt-revealed { animation: btReveal 0.35s ease forwards; }`

**Fase 2 — Shimmer arranca solo cuando todas las cards están visibles:**
- En JS, calcular el tiempo total del reveal (último card delay + 350ms de la animación).
- Usar `setTimeout` para agregar `.bt-shimmer-active` al `#bt-wrapper` cuando ese tiempo pase.
- En CSS: `animation-play-state: paused` por defecto en `.bt-match::before`; solo corre cuando `.bt-shimmer-active .bt-match::before`.

**Consideración:** el `colDelay` actual es para el shimmer, no para el reveal. Habría que añadir un segundo delay independiente para el reveal, o reemplazar el sistema actual de delay.

**Archivo/s:** `js/render/bracket.js`, `css/bracket.css`

---

#### 7. Revisión del sistema de carga de resultados y posiciones

**Qué:** Revisar la robustez del flujo completo de resultados para cuando haya datos reales. Puntos a evaluar:

- **Orden de renderizado:** si `loadResults()` tarda (GitHub Pages con latencia), la página se muestra por un instante sin resultados. Considerar un skeleton o estado de carga.
- **Tabla de posiciones con resultados parciales:** `calcStandings()` funciona bien con 0 o 6 resultados, pero con 2 o 3 resultados intermedios el orden de la tabla puede ser incorrecto (criterios de desempate incompletos). FIFA usa criterios adicionales (enfrentamiento directo, fair play) que actualmente no están implementados.
- **Resultados del bracket:** el objeto `bracket` en `results.json` existe pero no se usa en el render. Habría que mostrar scores en las cards del bracket y aplicar la clase `.match-completed` equivalente.
- **Actualización automática:** el botón "Actualizar" es manual. Evaluar si conviene un poll automático cada N minutos durante la fase de grupos activa.
- **Error handling visible:** si el fetch falla, el fallback es silencioso (`window.RESULTS = {}`). Considerar mostrar un mensaje de error en `.results-updated` en lugar de "Sin resultados cargados".

**Archivo/s:** `js/main.js`, `js/render/groups.js`, `js/render/bracket.js`, `data/results.json`

---

### Ideas futuras (sin prioridad)

- **Clasificación automática al bracket:** poblar los slots de `BRACKET` según posiciones finales de grupos una vez completada la fase
- **Filtro por equipo:** highlight de todos los partidos de un equipo al clickearlo
- **Dark mode:** toggle con `prefers-color-scheme` + variable override
- **Verificar 3 sedes pendientes** (Grupo B: Suiza vs Canadá; Grupo G: Irán vs Nueva Zelanda, Egipto vs Irán)
- **Re-render del bracket al rotar pantalla:** listener en `window.resize` con debounce que llame `renderBracket()`
