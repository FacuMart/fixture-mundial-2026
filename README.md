# Fixture FIFA World Cup 2026 🏆

SPA para visualizar el fixture completo del Mundial 2026 — fase de grupos, bracket de eliminatorias y seguimiento del camino de Argentina. Sin frameworks, sin build step.

**🌐 [Ver en vivo](https://facumart.github.io/fixture-mundial-2026/)** · **🔧 [Panel admin](https://facumart.github.io/fixture-mundial-2026/admin.html)**

---

## Stack

- **Vanilla JS + CSS moderno** — sin React, Vue ni build tools
- **Firebase Firestore** — fuente de verdad para resultados en tiempo real
- **Firebase Auth** — acceso al panel admin (email/password)
- **GitHub Pages** — hosting estático
- **Lucide Icons** + **flag-icons** — íconos y banderas vía CDN

---

## Features

### Fase de Grupos
- Vista general con las 12 cards de grupo (A–L) animadas
- Vista individual por grupo con tabla de posiciones (PJ/G/E/P/GF/GC/Pts)
- Clasificación según reglas 2026: top 2 directos + 8 mejores terceros (badge dorado)
- Marcado automático de partido en curso y próximo (múltiples partidos simultáneos soportados)

### Bracket de Eliminatorias
- Ronda de 32 (M73–M88) → Octavos → Cuartos → Semis → Final + 3er puesto
- Equipos resueltos en tiempo real desde los standings de grupos (`resolveTeam()`)
- Hover / tap en cards para ver fecha, horario, estadio y ciudad
- Mejor tercero se muestra solo cuando todos los grupos del conjunto terminaron

### Camino de Argentina
- Panel automático derivado de los resultados reales (sin localStorage)
- Destaca el camino de Argentina en el bracket con borde celeste y halo dorado
- Chips de estado por ronda: Ganó / Eliminada / Pendiente / Campeón

### Admin
- Login con Firebase Auth — solo el usuario registrado puede acceder
- Carga de scores para grupos y bracket desde `admin.html`
- El site público se actualiza en el próximo load o auto-refresh (cada 5 min)

---

## Estructura

```
fixture-mundial-2026/
├── index.html              ← SPA principal
├── admin.html              ← panel de carga (requiere login)
├── css/
│   ├── variables.css       ← design tokens
│   ├── layout.css          ← header, nav, footer, skeletons
│   ├── groups.css          ← fase de grupos
│   ├── bracket.css         ← bracket eliminatorias
│   └── admin.css           ← panel admin
├── js/
│   ├── firebase.js         ← init + load/save Firestore
│   ├── header.js           ← countdown + partículas
│   ├── admin.js            ← lógica del panel admin
│   ├── data/
│   │   ├── groups.js       ← 12 grupos, 48 equipos, 72 partidos
│   │   └── bracket.js      ← 32 partidos eliminatorios con sede y horario
│   ├── render/
│   │   ├── groups.js       ← renders de grupos + tabla de posiciones
│   │   └── bracket.js      ← render del bracket + Argentina path
│   └── main.js             ← init, loadResults(), activateTab()
└── docs/
    └── context.md          ← documentación técnica detallada
```

---

## Correr localmente

El proyecto requiere HTTP (Firebase no funciona con `file://`). Con cualquier servidor estático:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# VS Code
# Live Server extension → Open with Live Server
```

Abrir `http://localhost:8000`.

---

## Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Agregar app web → copiar `firebaseConfig` a `js/firebase.js`
3. Habilitar **Authentication → Email/contraseña** y crear un usuario
4. Crear base de datos **Firestore** en modo producción
5. Publicar las reglas:

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

## Carga de resultados

1. Abrir `admin.html` → login
2. Ingresar scores en el partido correspondiente (grupos o bracket)
3. **Guardar resultados** → se escribe en Firestore con timestamp
4. El site público actualiza en el próximo load o refresh automático
