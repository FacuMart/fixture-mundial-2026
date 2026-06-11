# Fixture Mundial 2026 — Contexto del proyecto

## Qué es

Single Page Application para visualizar el fixture del FIFA World Cup 2026. Vanilla JS + CSS moderno, sin frameworks ni build step. Datos hardcodeados + resultados en Firebase Firestore.

**Repo:** https://github.com/FacuMart/fixture-mundial-2026
**GitHub Pages:** https://facumart.github.io/fixture-mundial-2026/
**Admin:** https://facumart.github.io/fixture-mundial-2026/admin.html

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
| Banderas en countdown (home flag · vs · away flag) | ✅ Completo — círculos 18px |
| Fase de Grupos — vista general con animaciones | ✅ Completo |
| Fase de Grupos — vista individual por grupo | ✅ Completo |
| Bracket de Eliminatorias (visualización) | ✅ Completo — sin líneas conectoras, ver nota ⚠️ |
| Camino de Argentina dinámico | ✅ Completo — panel con estado en localStorage |
| Firebase Firestore — fuente de verdad de resultados | ✅ Completo |
| Panel admin con login (Firebase Auth) | ✅ Completo — `admin.html` |
| Carga de resultados de grupos desde admin | ✅ Completo |
| Tabla de posiciones calculada | ✅ Completo — PJ/G/E/P/GF/GC/Pts desde resultados |
| Tab nav con sessionStorage (refresh/cierre) | ✅ Completo |
| FOUC del tab nav prevenido con inline script | ✅ Completo |
| Diseño responsive (mobile-first) | ✅ Completo |
| Resultados bracket con score + `.bt-completed` | ✅ Completo |
| Reveal escalonado de cards + shimmer coordinado | ✅ Completo |
| Auto-refresh cada 5 min + error handling visible | ✅ Completo |
| Visibilidad de scores en partidos completados | ✅ Completo — fondo blanco, sin opacity en card |
| Carga de resultados del bracket desde admin | ⬜ Pendiente (Fase 1 bracket) |
| Resolución automática de equipos en bracket | ⬜ Pendiente (Fase 2 bracket) |
| Argentina path automático desde resultados reales | ⬜ Pendiente (Fase 3 bracket) |
| Filtro por equipo / selección | ⬜ Pendiente |

> ✅ **Bracket completo:** Ronda de 32 (16 partidos, M73–M88) + Octavos (8) + Cuartos (4) + Semis (2) + Final + 3er puesto = **104 partidos totales** (72 grupos + 32 eliminatorias).
>
> ⚠️ **Sedes pendientes de verificación:** 3 partidos tienen sede estimada: Grupo B Suiza–Canadá (Arrowhead, KC), Grupo G Irán–Nueva Zelanda (NRG, Houston), Grupo G Egipto–Irán (NRG, Houston). Marcados con `// ⚠️` en el código.

---

## Estructura de archivos

```
fixture-mundial-2026/
├── index.html                  ← entrada principal
├── admin.html                  ← panel de carga de resultados (requiere login)
├── assets/
│   └── tournaments_fifa-world-cup-2026.football-logos.cc.svg
├── css/
│   ├── variables.css           ← design tokens (:root), regla .lucide, reset, body
│   ├── layout.css              ← header, nav, footer, animaciones, estado inicial de tab
│   ├── groups.css              ← vista general/detalle de grupos, tabla de posiciones, results bar
│   ├── bracket.css             ← bracket eliminatorias, final, 3er puesto
│   └── admin.css               ← estilos del panel admin (dark theme)
├── js/
│   ├── firebase.js             ← init Firebase, loadResultsFromFirebase(), saveResultsToFirebase()
│   ├── admin.js                ← lógica del panel admin: auth, render de inputs, guardar
│   ├── data/
│   │   ├── groups.js           ← constante GROUPS (12 grupos, 48 equipos, 72 partidos)
│   │   └── bracket.js          ← constante BRACKET (ronda32 → octavos → cuartos → semis → final)
│   ├── render/
│   │   ├── groups.js           ← makeGroupCard() + makeGroupDetail() + renderGroups() + initGroupControls() + calcStandings()
│   │   └── bracket.js          ← renderBracket()
│   ├── header.js               ← initParticles() + initCountdown() con banderas en countdown
│   └── main.js                 ← async init + loadResults() (Firebase) + refreshResults() + activateTab()
├── data/
│   └── results.json            ← legacy, ya no se usa (reemplazado por Firestore)
└── docs/
    └── context.md              ← este archivo
```

**Orden de carga de scripts en `index.html`:**
Firebase CDN (app/auth/firestore compat) → `firebase.js` → `lucide CDN` → `header.js` → `data/groups.js` → `data/bracket.js` → `render/groups.js` → `render/bracket.js` → `main.js`

**Orden de carga de scripts en `admin.html`:**
Firebase CDN → `firebase.js` → `data/groups.js` → `admin.js`

---

## Firebase (`js/firebase.js`)

Usa el SDK compat v9 de Firebase cargado desde CDN (scripts clásicos, sin build step).

```js
firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

async function loadResultsFromFirebase()       // lee results/current
async function saveResultsToFirebase(data)     // escribe results/current
```

**Estructura del documento Firestore (`results/current`):**

```json
{
  "updated": "2026-06-11T20:30:00.000Z",
  "groups": {
    "A-0": { "home": 2, "away": 1 },
    "J-0": { "home": 3, "away": 0 }
  },
  "bracket": {}
}
```

La clave de grupos es `"<letra>-<índice>"`, igual que antes con `results.json`.

**Firestore Security Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /results/current {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Panel Admin (`admin.html` + `js/admin.js` + `css/admin.css`)

Página separada que requiere login con Firebase Auth (email/password). Solo el usuario creado en Firebase Console puede ingresar.

### Flujo
1. Abrir `admin.html` → si no está autenticado, muestra formulario de login
2. Login con `auth.signInWithEmailAndPassword()` → `onAuthStateChanged` dispara → panel visible
3. Carga los resultados actuales de Firestore → pre-rellena los inputs
4. El admin edita scores (inputs numéricos por partido, organizados por grupo)
5. "Guardar resultados" → `saveResultsToFirebase(localResults)` → Firestore actualizado
6. El site público (`index.html`) lee de Firestore en el próximo load o auto-refresh

### Estado local del admin
`localResults` espeja la estructura de Firestore. Cada input `oninput` actualiza `localResults.groups[key]`. El botón "×" por partido limpia la clave del objeto.

### FOUC en admin
El panel usa `[hidden] { display: none !important; }` en `admin.css` para que el `hidden` attribute no sea sobreescrito por `display: flex` del `#login-section`.

---

## Tab Navigation (`js/main.js`)

### Comportamiento
- **Abrir página (URL limpia):** siempre muestra Fase de Grupos
- **Navegar a Llaves:** guarda `'eliminatorias'` en `sessionStorage`
- **Refrescar:** restaura el tab guardado en `sessionStorage`
- **Cerrar pestaña y reabrir:** `sessionStorage` se limpia → vuelve a Fase de Grupos

### Anti-FOUC (Flash of Unstyled Content)
El HTML tiene hardcodeado el tab de grupos como activo. Al refrescar en Llaves, el browser pintaría grupos brevemente antes de que JS corrija el estado.

**Solución:** inline `<script>` en `<head>` que corre antes del primer paint:
```html
<script>!function(){var t=sessionStorage.getItem('activeTab');document.documentElement.setAttribute('data-tab',t==='eliminatorias'?'eliminatorias':'grupos')}()</script>
```

CSS en `layout.css` usa `html[data-tab]` para mostrar el tab correcto desde el primer frame. Una vez que `activateTab()` corre (JS), remueve el atributo `data-tab` y toma el control con las clases `.active`.

```css
html[data-tab="grupos"]        .tab-btn[data-tab="grupos"]        { /* active styles */ }
html[data-tab="eliminatorias"] .tab-btn[data-tab="eliminatorias"] { /* active styles */ }
html[data-tab="grupos"]        #tab-grupos        { display: block; }
html[data-tab="eliminatorias"] #tab-eliminatorias { display: block; }
```

### Íconos estáticos
`lucide.createIcons()` se llama **antes** del `await loadResults()` para que los íconos del nav y header aparezcan inmediatamente, sin esperar a Firebase.

---

## Header (`index.html` + `css/layout.css` + `js/header.js`)

### Estructura (3 columnas flex)

```
[ logo FIFA 2026 ]   FIFA WORLD CUP 2026      [ Countdown Argentina ]
                   🇺🇸 · 🇨🇦 · 🇲🇽
                  [ badge 48 equipos ]
```

### Countdown con banderas (`js/header.js`)

Partidos de Argentina en UTC (datos hardcodeados, ARG = UTC-3):

```js
const ARG_MATCHES = [
  { home: { name: 'Argentina', flag: 'ar' }, away: { name: 'Argelia',  flag: 'dz' }, info: '16 jun · 22:00 ARG', start: new Date('2026-06-17T01:00:00Z') },
  { home: { name: 'Argentina', flag: 'ar' }, away: { name: 'Austria',  flag: 'at' }, info: '22 jun · 14:00 ARG', start: new Date('2026-06-22T17:00:00Z') },
  { home: { name: 'Jordania',  flag: 'jo' }, away: { name: 'Argentina',flag: 'ar' }, info: '27 jun · 23:00 ARG', start: new Date('2026-06-28T02:00:00Z') },
];
```

`matchHTML(m)` genera: `🇦🇷 Argentina <vs> Argelia 🇩🇿` (bandera home a la izquierda, bandera away a la derecha del nombre away).

Banderas renderizadas como **círculos** de 18×18px con `border-radius: 50%` y `background-position: center`.

- `tick()` corre cada 1 segundo con `setInterval`
- Si el partido está en curso: muestra `● EN JUEGO`
- Si todos los partidos pasaron: "Fase Eliminatoria / Grupos completados ✓"
- **Responsive:** se oculta en `< 420px`; se centra en `< 860px`

---

## Fase de Grupos (`js/render/groups.js` + `css/groups.css`)

### Sistema de resultados

`window.RESULTS` se carga desde Firestore en `loadResults()` antes del primer render. Estructura idéntica a la que tenía `data/results.json`.

```js
function getResult(letter, index) {
  return (window.RESULTS?.groups || {})[`${letter}-${index}`] ?? null;
}

function calcStandings(letter, group) {
  // Calcula PJ/G/E/P/GF/GC/Pts desde window.RESULTS
  // Ordena por: Pts → DG → GF
}
```

### Dos vistas con toggle

```
[ Todos los grupos ]  [ Por grupo ]    [A][B][C][D][E][F][G][H][I][J][K][L]
```

- `groupView`: `'general'` | `'individual'`
- `selectedLetter`: default `'J'` (Argentina)

### Vista general — `makeGroupCard(letter, group)`

Tarjeta compacta: header con color del grupo → lista de equipos → 6 partidos con score real o `– : –`. Animación de entrada escalonada de 45ms por card.

### Vista individual — `makeGroupDetail(letter, group)`

Panel expandido con: header · (equipos | tabla de posiciones) · partidos del grupo · sedes.

**Tabla de posiciones:** usa `calcStandings()`. Posiciones 1–2 en círculo azul FIFA. Fila Argentina en celeste.

**Estado de partidos:** `.match-completed` / `.next-match` / `.live-match` / `.argentina-match`.

- `.match-score.completed` → fondo `rgba(255,255,255,0.92)` + texto `var(--text-main)` + sombra sutil. Sin opacity en la card ni en los elementos hijos.

---

## Bracket (`js/data/bracket.js` + `js/render/bracket.js` + `css/bracket.css`)

### Estructura de datos

```js
BRACKET = {
  ronda32: [ { id, label, home, away, date, isArgPath } ],  // M73–M88
  octavos: [ ... ],  // O1–O8
  cuartos: [ ... ],  // C1–C4
  semis:   [ ... ],  // SF1–SF2
  final:   { home, away, date, stadium },
  tercero: { home, away, date, stadium },
}
```

`home`/`away` son slots (`'1J'`, `'G M85'`), no equipos reales aún.

**Camino Argentina:**
- 1°J: R32-14 → R16-7 → QF-4 → SF-2
- 2°J: R32-12 → R16-6 → QF-3 → SF-2 (misma semi)

### Plan de evolución del bracket

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Inputs en admin para resultados del bracket | ⬜ Pendiente |
| Fase 2 | `resolveTeam("1A")` → nombre real desde calcStandings; `resolveTeam("G M73")` → ganador del match | ⬜ Pendiente |
| Fase 3 | Argentina path automático desde resultados reales (reemplaza el panel manual) | ⬜ Pendiente |

### Render

El bracket es scroll horizontal. Dimensiones `BT` se recalculan por viewport en cada `renderBracket()`:

| Viewport | H | CW | Ancho total aprox. |
|---|---|---|---|
| ≥ 900px | 90px | 128px | ~1370px |
| 600–899px | 78px | 110px | ~1160px |
| < 600px | 68px | 92px | ~990px |

**Animaciones:** reveal escalonado (R32→Oct→QF→SF, ambas mitades simultáneas, delay = roundIndex×180 + cardIndex×40ms) → `.bt-shimmer-active` al wrapper 350ms después.

---

## Flujo de actualización de resultados

1. Partido termina → abrir `admin.html` (o `localhost:XXXX/admin.html` en desarrollo)
2. Login con email/contraseña del usuario Firebase
3. Ingresar scores en los inputs del grupo correspondiente
4. "Guardar resultados" → se escribe en Firestore con timestamp
5. El site público actualiza en el próximo load o auto-refresh de 5 minutos

---

## Datos del torneo

### Grupos (`js/data/groups.js`)

```js
GROUPS = {
  A: { color: '#E53E3E', teams: [...], matches: [...] },
  // B … L
}
```

12 grupos (A–L), 4 equipos, 6 partidos por grupo = 72 partidos. Horarios en ARG (UTC-3).

**Grupo J — Argentina:**
```
16 jun 22:00 — Argentina vs Argelia    — Arrowhead Stadium, Kansas City
17 jun 01:00 — Austria vs Jordania     — Levi's Stadium, Santa Clara
22 jun 14:00 — Argentina vs Austria    — AT&T Stadium, Arlington
23 jun 00:00 — Argelia vs Jordania     — Levi's Stadium, Santa Clara
27 jun 23:00 — Argelia vs Austria      — Arrowhead Stadium, Kansas City
27 jun 23:00 — Jordania vs Argentina   — AT&T Stadium, Arlington
```

---

## Banderas — flag-icons

CDN: `flag-icons@7.2.3`. Uso: `<span class="fi fi-{code}"></span>`.

| Contexto | Dimensiones | Shape |
|---|---|---|
| Team rows (vista general/detalle) | 24×18px | rect |
| Match cards | 18×14px | rect |
| Tabla de posiciones | 20×15px | rect |
| Header anfitriones | 40×30px | rect |
| Countdown Argentina | 18×18px | círculo |

---

## Decisiones de diseño

- **Firebase compat SDK (v9):** scripts clásicos, sin build step ni npm. Compatible con GitHub Pages tal cual.
- **Un solo documento Firestore (`results/current`):** toda la app lee y escribe un único doc. Simple, sin complejidad de colecciones.
- **Admin como página separada (`admin.html`):** no contamina la URL del fixture público. Se accede directamente.
- **`sessionStorage` para persistencia de tab:** persiste a través de refresh (misma sesión), se limpia al cerrar la pestaña. Por diseño, la URL pública siempre abre en Fase de Grupos.
- **Inline script anti-FOUC en `<head>`:** único punto donde se puede ejecutar código antes del primer paint. Lee sessionStorage y setea `data-tab` en `<html>`. CSS lo usa para estado inicial. `activateTab()` lo limpia al tomar el control.
- **`lucide.createIcons()` doble:** una vez antes del `await` (íconos estáticos del nav/header), otra después del render (íconos dinámicos en cards).
- **Sin módulos ES:** scripts clásicos para no requerir servidor en desarrollo local (aunque Firebase requiere HTTP de todas formas).
- **DOM imperativo:** `createElement` en JS, sin templates HTML.
- **Countdown hardcodeado en UTC:** `new Date('...Z')` en `header.js`, sin depender de la zona horaria del navegador.
- **Bracket responsive sin vista alternativa:** scroll horizontal con momentum (`-webkit-overflow-scrolling: touch`) + hint visual que se desvanece. Las dimensiones `BT` se reducen por viewport.
- **`data/results.json` no se usa más:** reemplazado por Firestore. El archivo se mantiene como legacy/referencia.

---

## Backlog

### Próximos pasos

1. **Fase 1 bracket:** agregar inputs de resultados del bracket en `admin.html` — igual estructura que grupos, keys `"R32-1"`, `"R16-1"`, etc. en `window.RESULTS.bracket`
2. **Fase 2 bracket:** `resolveTeam(label)` — convierte `"1A"` al equipo real vía `calcStandings`, `"G M73"` al ganador del partido
3. **Fase 3 bracket:** Argentina path calculado automáticamente desde resultados reales

### Pendiente menor

- **Criterios de desempate FIFA completos:** `calcStandings()` ordena por Pts → DG → GF. Faltan enfrentamiento directo y fair play.
- **Skeleton de carga:** mientras Firebase responde, la página muestra vacío. Considerar estado esquelético.
- **Re-render del bracket al rotar pantalla:** listener `window.resize` con debounce.
- **Verificar 3 sedes estimadas** marcadas con `// ⚠️` en el código.
- **Dark mode toggle.**

---

## Errores corregidos

### Auditoría ronda 1

| Archivo | Error | Fix |
|---|---|---|
| `js/data/groups.js` | `city: 'Dallas'` en AT&T Stadium | → `'Arlington'` |
| `css/bracket.css` | `min-width: 900px` para 5 columnas | → `1200px` |
| `index.html` | Botones de nav sin `type="button"` | Corregido |

### Verificación de datos ronda 2

| Área | Error | Fix |
|---|---|---|
| Grupo D | `Rep. Europeo C` | → `Türkiye` |
| Grupo F | `Rep. Europeo B` + 6 partidos incorrectos | → `Suecia` + datos reescritos |
| Grupo I | `Rep. FIFA Playoff 2` + 6 partidos incorrectos | → `Noruega` + datos reescritos |
| Grupo J | 5 de 6 partidos incorrectos | Reescritos |
| Bracket | Solo 8 "octavos" para 32 clasificados | → Ronda de 32 (M73–M88) |
| Bracket | Argentina: `1J vs 2I` | → `1J vs 2H`, Hard Rock Miami |
| Bracket | 3er puesto: AT&T Arlington | → Hard Rock Stadium, Miami |
