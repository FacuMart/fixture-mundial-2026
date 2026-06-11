// Dimensiones del bracket — se ajustan al viewport antes de cada render
let BT = {
  H:  90,   // altura de cada card
  G:  8,    // gap entre cards en R32
  CW: 128,  // ancho de columna
  CG: 22,   // gap entre columnas
  get totalH() { return 8 * (this.H + this.G) - this.G; },
};

// Calcula el centro vertical (midY desde top del col) de cada match en cada ronda
function calcBtPositions() {
  const { H, G } = BT;
  const r32 = Array.from({ length: 8 }, (_, i) => i * (H + G) + H / 2);
  const oct = Array.from({ length: 4 }, (_, i) => (r32[i * 2] + r32[i * 2 + 1]) / 2);
  const qf  = Array.from({ length: 2 }, (_, i) => (oct[i * 2] + oct[i * 2 + 1]) / 2);
  const sf  = [(qf[0] + qf[1]) / 2];
  return { r32, oct, qf, sf };
}

// Crea una card de partido para el árbol del bracket
function makeBtCard(match) {
  const el = document.createElement('div');
  el.className = 'bt-match'; // bt-arg se aplica dinámicamente por applyArgPath()
  el.id = 'bt-' + match.id;

  const r = (window.RESULTS?.bracket || {})[match.id] ?? null;
  if (r != null) el.classList.add('bt-completed');

  const scoreHtml = r != null
    ? `<div class="bt-score"><span>${r.home}</span><span class="bt-score-sep">:</span><span>${r.away}</span></div>`
    : '';

  el.innerHTML = `
    <div class="bt-label">${match.label}</div>
    <div class="bt-team"><i data-lucide="minus"></i><span>${match.home}</span></div>
    ${scoreHtml}
    <div class="bt-team"><i data-lucide="minus"></i><span>${match.away}</span></div>
    <div class="bt-date"><i data-lucide="calendar"></i>${match.date}</div>
  `;
  return el;
}

// Crea una columna de ronda con cards posicionadas absolutamente
// colDelay: segundos de retraso para la animación de entrada (escalonado por columna)
function makeBtColumn(matches, centers, title, colDelay = 0, rtl = false) {
  const wrap = document.createElement('div');
  wrap.className = 'bt-col-wrap';

  const lbl = document.createElement('div');
  lbl.className = 'bt-col-title';
  lbl.textContent = title;
  lbl.style.top = (centers[0] - BT.H / 2 - 22) + 'px';
  wrap.appendChild(lbl);

  const col = document.createElement('div');
  col.className = 'bt-col';
  col.style.cssText = `width:${BT.CW}px;height:${BT.totalH}px;`;

  matches.forEach((m, i) => {
    const card = makeBtCard(m);
    card.style.top = (centers[i] - BT.H / 2) + 'px';
    card.style.setProperty('--shimmer-delay', (colDelay + 0.45) + 's');
    if (rtl) card.classList.add('bt-shimmer-rtl');
    col.appendChild(card);
  });

  wrap.appendChild(col);
  return wrap;
}

function renderBracket() {
  // Ajustar dimensiones según el viewport
  const vw = window.innerWidth;
  if (vw < 600) {
    BT.H = 68; BT.CW = 92; BT.CG = 8;
  } else if (vw < 900) {
    BT.H = 78; BT.CW = 110; BT.CG = 14;
  } else {
    BT.H = 90; BT.CW = 128; BT.CG = 22;
  }

  const container = document.getElementById('bracket-container');
  container.innerHTML = '';

  const pos = calcBtPositions();

  // Split data: izquierda (A) y derecha (B)
  const leftR32  = BRACKET.ronda32.slice(0, 8);
  const leftOct  = BRACKET.octavos.slice(0, 4);
  const leftQF   = BRACKET.cuartos.slice(0, 2);
  const leftSF   = BRACKET.semis.slice(0, 1);
  const rightSF  = BRACKET.semis.slice(1, 2);
  const rightQF  = BRACKET.cuartos.slice(2, 4);
  const rightOct = BRACKET.octavos.slice(4, 8);
  const rightR32 = BRACKET.ronda32.slice(8, 16);

  const wrapper = document.createElement('div');
  wrapper.className = 'bt-wrapper';
  wrapper.id = 'bt-wrapper';

  // Mitad izquierda: R32 → Oct → QF → SF (entrada escalonada hacia el centro)
  const leftHalf = document.createElement('div');
  leftHalf.className = 'bt-half';
  leftHalf.appendChild(makeBtColumn(leftR32, pos.r32, 'Ronda de 32', 0));
  leftHalf.appendChild(makeBtColumn(leftOct, pos.oct, 'Octavos',     0.08));
  leftHalf.appendChild(makeBtColumn(leftQF,  pos.qf,  'Cuartos',     0.16));
  leftHalf.appendChild(makeBtColumn(leftSF,  pos.sf,  'Semis',       0.24));

  // Centro: Final + 3er puesto
  const center = document.createElement('div');
  center.className = 'bt-center';
  center.innerHTML = `
    <div class="bt-final-block">
      <div class="bt-trophy-wrap">
        <img class="bt-trophy-img" src="assets/vecteezy_the-iconic-golden-fifa-world-cup-trophy-a-symbol-of-global_68283711.png" alt="Copa del Mundo">
      </div>
      <div class="bt-final-title"><i data-lucide="trophy"></i> La Gran Final</div>
      <div class="bt-final-card" id="bt-FIN">
        <div class="bt-final-team"><i data-lucide="minus"></i><span>${BRACKET.final.home}</span></div>
        <div class="bt-final-team"><i data-lucide="minus"></i><span>${BRACKET.final.away}</span></div>
        <div class="bt-final-meta"><i data-lucide="calendar"></i>${BRACKET.final.date}</div>
        <div class="bt-final-meta"><i data-lucide="map-pin"></i>${BRACKET.final.stadium}</div>
      </div>
      <div class="bt-champion"><i data-lucide="trophy"></i> Campeón</div>
    </div>
    <div class="bt-third-block">
      <div class="bt-third-title"><i data-lucide="medal"></i> 3° y 4° Puesto</div>
      <div class="bt-third-card" id="bt-3RD">
        <div class="bt-team"><i data-lucide="minus"></i><span>${BRACKET.tercero.home}</span></div>
        <div class="bt-team"><i data-lucide="minus"></i><span>${BRACKET.tercero.away}</span></div>
        <div class="bt-date"><i data-lucide="calendar"></i>${BRACKET.tercero.date}</div>
        <div class="bt-date"><i data-lucide="map-pin"></i>${BRACKET.tercero.stadium}</div>
      </div>
    </div>
  `;

  // Mitad derecha: SF → QF → Oct → R32 (simétrico: entrada desde el centro hacia afuera)
  const rightHalf = document.createElement('div');
  rightHalf.className = 'bt-half';
  rightHalf.appendChild(makeBtColumn(rightSF,  pos.sf,  'Semis',       0.24, true));
  rightHalf.appendChild(makeBtColumn(rightQF,  pos.qf,  'Cuartos',     0.16, true));
  rightHalf.appendChild(makeBtColumn(rightOct, pos.oct, 'Octavos',     0.08, true));
  rightHalf.appendChild(makeBtColumn(rightR32, pos.r32, 'Ronda de 32', 0,    true));

  wrapper.appendChild(leftHalf);
  wrapper.appendChild(center);
  wrapper.appendChild(rightHalf);
  container.appendChild(wrapper);

  adjustFinalPosition(pos);
  renderArgPanel();
  applyArgPath();
}

// Centra el card de la Final al mismo nivel vertical que las Semis
function adjustFinalPosition(pos) {
  const block = document.querySelector('.bt-final-block');
  if (!block) return;

  const vw = window.innerWidth;
  const trophyRingD   = vw < 600 ? 80 : 104;
  const trophyMarginB = 28;
  const flexGap       = 10;
  const titleH        = vw < 600 ? 18 : 20;
  const teamH         = vw < 600 ? 24 : 37;
  const metaH         = vw < 600 ? 17 : 24;
  const cardH         = 2 * teamH + 2 * metaH;
  const centerPadT    = vw < 600 ? 22 : 44;

  const aboveCardCenter = trophyRingD + trophyMarginB + flexGap + titleH + flexGap + cardH / 2;
  const targetCenter    = 28 + pos.sf[0]; // 28 = bt-half padding-top
  const marginTop       = Math.max(0, targetCenter - aboveCardCenter - centerPadT);

  block.style.marginTop = marginTop + 'px';
}

// Revela las cards del bracket de afuera hacia adentro con stagger, luego activa shimmer
function revealBracketCards() {
  const wrapper = document.getElementById('bt-wrapper');
  if (!wrapper) return;

  wrapper.classList.remove('bt-shimmer-active');
  wrapper.querySelectorAll('.bt-match').forEach(c => c.classList.remove('bt-revealed'));

  const leftHalf  = wrapper.querySelector('.bt-half:first-child');
  const rightHalf = wrapper.querySelector('.bt-half:last-child');
  if (!leftHalf || !rightHalf) return;

  const leftCols  = leftHalf.querySelectorAll(':scope > .bt-col-wrap');
  const rightCols = rightHalf.querySelectorAll(':scope > .bt-col-wrap');

  let lastDelay = 0;

  // R32(0)→Oct(1)→QF(2)→SF(3) en ambas mitades simultáneamente
  [0, 1, 2, 3].forEach(roundIndex => {
    const lCards = [...(leftCols[roundIndex]?.querySelectorAll('.bt-match')  || [])];
    const rCards = [...(rightCols[3 - roundIndex]?.querySelectorAll('.bt-match') || [])];

    lCards.forEach((card, i) => {
      const delay = roundIndex * 180 + i * 40;
      if (delay > lastDelay) lastDelay = delay;
      setTimeout(() => card.classList.add('bt-revealed'), delay);
    });
    rCards.forEach((card, i) => {
      const delay = roundIndex * 180 + i * 40;
      if (delay > lastDelay) lastDelay = delay;
      setTimeout(() => card.classList.add('bt-revealed'), delay);
    });
  });

  setTimeout(() => wrapper.classList.add('bt-shimmer-active'), lastDelay + 350);
}

// ============================================================ ARGENTINA PATH TRACKER

// Caminos posibles según posición en Grupo J
// 1° → R32-14 (M86) → R16-7 (O7) → QF-4 (C4) → SF-2
// 2° → R32-12 (M84) → R16-6 (O6) → QF-3 (C3) → SF-2  (semi idéntica)
const ARG_PATH_MAP = {
  '1': ['R32-14', 'R16-7', 'QF-4', 'SF-2'],
  '2': ['R32-12', 'R16-6', 'QF-3', 'SF-2'],
};
const ARG_ROUND_LABELS = ['R32', 'Octavos', 'Cuartos', 'Semis'];
const ARG_ROUND_KEYS   = ['r32', 'r16', 'qf', 'sf'];

function loadArgState() {
  try { return JSON.parse(localStorage.getItem('arg_bracket')) || {}; } catch { return {}; }
}
function saveArgState(s) {
  localStorage.setItem('arg_bracket', JSON.stringify(s));
}

function computeArgIds(state) {
  const ids = new Set();
  if (!state.position) return ids;
  const path = ARG_PATH_MAP[state.position];
  if (!path) return ids;
  for (let i = 0; i < path.length; i++) {
    ids.add(path[i]);
    if (state[ARG_ROUND_KEYS[i]] !== 'won') break;
  }
  return ids;
}

function applyArgPath() {
  const ids = computeArgIds(loadArgState());
  document.querySelectorAll('.bt-match').forEach(card => {
    const id = card.id.replace('bt-', '');
    card.classList.toggle('bt-arg', ids.has(id));
  });
}

function renderArgPanel() {
  const panel = document.getElementById('arg-panel');
  if (!panel) return;
  const state = loadArgState();

  let html = '<div class="arg-panel-inner">';
  html += '<span class="arg-panel-title">🇦🇷 Argentina</span>';

  // Paso 0: posición en Grupo J
  html += '<div class="arg-step">';
  html += '<span class="arg-step-label">Grupo J:</span>';
  ['1', '2'].forEach(v => {
    const active = state.position === v ? ' active' : '';
    html += `<button class="arg-btn${active}" data-action="position" data-value="${v}" type="button">${v}°</button>`;
  });
  html += '</div>';

  // Pasos por ronda — solo aparece si el paso anterior fue "ganó"
  if (state.position) {
    for (let i = 0; i < ARG_ROUND_KEYS.length; i++) {
      const key  = ARG_ROUND_KEYS[i];
      const prev = i === 0 || state[ARG_ROUND_KEYS[i - 1]] === 'won';
      if (!prev) break;

      html += '<span class="arg-step-sep">›</span>';
      html += '<div class="arg-step">';
      html += `<span class="arg-step-label">${ARG_ROUND_LABELS[i]}:</span>`;
      html += `<button class="arg-btn${state[key] === 'won'  ? ' active' : ''}" data-action="${key}" data-value="won"  type="button">Ganó</button>`;
      html += `<button class="arg-btn${state[key] === 'lost' ? ' active arg-btn-elim' : ''}" data-action="${key}" data-value="lost" type="button">Perdió</button>`;
      html += '</div>';

      if (state[key] !== 'won') break;
    }
  }

  html += '</div>';
  panel.innerHTML = html;

  panel.querySelectorAll('.arg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value  = btn.dataset.value;
      let s = loadArgState();

      if (action === 'position') {
        // Toggle: click la misma posición la deselecciona
        s = s.position === value ? {} : { position: value };
      } else {
        const idx = ARG_ROUND_KEYS.indexOf(action);
        s[action] = s[action] === value ? null : value;
        // Limpiar rondas posteriores al cambiar un resultado previo
        for (let i = idx + 1; i < ARG_ROUND_KEYS.length; i++) delete s[ARG_ROUND_KEYS[i]];
      }

      saveArgState(s);
      renderArgPanel();
      applyArgPath();
    });
  });
}
