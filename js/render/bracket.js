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

// ── Resolución de equipos ────────────────────────────────────────────────────

// Devuelve { name, flag } si el slot está resuelto, null si no.
function resolveTeam(label) {
  // Ganador: "G M73", "G O1", "G C1", "G SF1"
  if (label.startsWith('G ')) {
    const m = findBracketMatchByLabel(label.slice(2));
    if (!m) return null;
    const r = (window.RESULTS?.bracket || {})[m.id] ?? null;
    if (r == null) return null;
    if (r.home > r.away) return resolveTeam(m.home);
    if (r.away > r.home) return resolveTeam(m.away);
    return null; // empate → sin ganador
  }

  // Perdedor: "Perd. SF1", "Perd. SF2" (3er puesto)
  if (label.startsWith('Perd. ')) {
    const m = findBracketMatchByLabel(label.slice(6));
    if (!m) return null;
    const r = (window.RESULTS?.bracket || {})[m.id] ?? null;
    if (r == null) return null;
    if (r.home > r.away) return resolveTeam(m.away);
    if (r.away > r.home) return resolveTeam(m.home);
    return null;
  }

  // Mejor tercero: "3ABCDF", "3CDFGH", etc.
  const thirdMatch = label.match(/^3([A-L]+)$/);
  if (thirdMatch) {
    return resolveBestThird([...thirdMatch[1]]);
  }

  // Posición en grupo: "1A", "2B"
  const posMatch = label.match(/^([12])([A-L])$/);
  if (posMatch) {
    const pos    = parseInt(posMatch[1]) - 1;
    const letter = posMatch[2];
    const group  = GROUPS[letter];
    if (!group) return null;
    const standings = calcStandings(letter, group);
    const team = standings[pos];
    return team ? { name: team.name, flag: team.flag } : null;
  }

  return null;
}

function findBracketMatchByLabel(labelStr) {
  const all = [
    ...BRACKET.ronda32, ...BRACKET.octavos,
    ...BRACKET.cuartos, ...BRACKET.semis,
    BRACKET.final, BRACKET.tercero,
  ];
  return all.find(m => (m.label || m.id) === labelStr) ?? null;
}

function groupFullyPlayed(letter) {
  const group = GROUPS[letter];
  if (!group) return false;
  return group.matches.every((_, i) => getResult(letter, i) != null);
}

function resolveBestThird(letters) {
  if (!letters.every(groupFullyPlayed)) return null;
  const thirds = letters
    .map(l => { const g = GROUPS[l]; return g ? calcStandings(l, g)[2] : null; })
    .filter(Boolean);
  if (!thirds.length) return null;
  thirds.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  return { name: thirds[0].name, flag: thirds[0].flag };
}

// Genera el HTML interno de un slot de equipo
function teamHtml(label) {
  const t = resolveTeam(label);
  if (t) return `<span class="fi fi-${t.flag} bt-flag"></span><span>${t.name}</span>`;
  return `<i data-lucide="minus"></i><span>${label}</span>`;
}

// ── Cards del bracket ────────────────────────────────────────────────────────

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

  const homeR = resolveTeam(match.home) != null;
  const awayR = resolveTeam(match.away) != null;

  const detailRows = [
    match.date    ? `<div class="bt-detail-row"><i data-lucide="calendar"></i>${match.date}</div>` : '',
    match.time    ? `<div class="bt-detail-row"><i data-lucide="clock"></i>${match.time} (ARG)</div>` : '',
    match.stadium ? `<div class="bt-detail-row"><i data-lucide="building-2"></i>${match.stadium}</div>` : '',
    match.city    ? `<div class="bt-detail-row"><i data-lucide="map-pin"></i>${match.city}</div>` : '',
  ].join('');

  el.innerHTML = `
    <div class="bt-label">${match.label}</div>
    <div class="bt-team${homeR ? ' bt-team--resolved' : ''}">${teamHtml(match.home)}</div>
    ${scoreHtml}
    <div class="bt-team${awayR ? ' bt-team--resolved' : ''}">${teamHtml(match.away)}</div>
    ${detailRows ? `<div class="bt-details">${detailRows}</div>` : ''}
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
  const finResult  = (window.RESULTS?.bracket || {})['FIN'] ?? null;
  const thrdResult = (window.RESULTS?.bracket || {})['3RD'] ?? null;

  const finScoreHtml = finResult != null
    ? `<div class="bt-score"><span>${finResult.home}</span><span class="bt-score-sep">:</span><span>${finResult.away}</span></div>`
    : '';
  const thrdScoreHtml = thrdResult != null
    ? `<div class="bt-score"><span>${thrdResult.home}</span><span class="bt-score-sep">:</span><span>${thrdResult.away}</span></div>`
    : '';

  const champion = finResult != null
    ? (finResult.home > finResult.away ? resolveTeam(BRACKET.final.home) : finResult.away > finResult.home ? resolveTeam(BRACKET.final.away) : null)
    : null;
  const championHtml = champion
    ? `<span class="fi fi-${champion.flag} bt-flag"></span><span>${champion.name}</span>`
    : `<i data-lucide="trophy"></i> Campeón`;

  const finHomeR  = resolveTeam(BRACKET.final.home)    != null;
  const finAwayR  = resolveTeam(BRACKET.final.away)    != null;
  const thrdHomeR = resolveTeam(BRACKET.tercero.home)  != null;
  const thrdAwayR = resolveTeam(BRACKET.tercero.away)  != null;

  const center = document.createElement('div');
  center.className = 'bt-center';
  center.innerHTML = `
    <div class="bt-final-block">
      <div class="bt-trophy-wrap">
        <img class="bt-trophy-img" src="assets/vecteezy_the-iconic-golden-fifa-world-cup-trophy-a-symbol-of-global_68283711.png" alt="Copa del Mundo">
      </div>
      <div class="bt-final-title"><i data-lucide="trophy"></i> La Gran Final</div>
      <div class="bt-final-card" id="bt-FIN">
        <div class="bt-final-team${finHomeR ? ' bt-team--resolved' : ''}">${teamHtml(BRACKET.final.home)}</div>
        ${finScoreHtml}
        <div class="bt-final-team${finAwayR ? ' bt-team--resolved' : ''}">${teamHtml(BRACKET.final.away)}</div>
        <div class="bt-final-meta"><i data-lucide="calendar"></i>${BRACKET.final.date}</div>
        <div class="bt-final-meta"><i data-lucide="map-pin"></i>${BRACKET.final.stadium}</div>
      </div>
      <div class="bt-champion">${championHtml}</div>
    </div>
    <div class="bt-third-block">
      <div class="bt-third-title"><i data-lucide="medal"></i> 3° y 4° Puesto</div>
      <div class="bt-third-card" id="bt-3RD">
        <div class="bt-team${thrdHomeR ? ' bt-team--resolved' : ''}">${teamHtml(BRACKET.tercero.home)}</div>
        ${thrdScoreHtml}
        <div class="bt-team${thrdAwayR ? ' bt-team--resolved' : ''}">${teamHtml(BRACKET.tercero.away)}</div>
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
  initBracketCardTap();
}

function initBracketCardTap() {
  if (window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('#bt-wrapper .bt-match').forEach(card => {
    card.addEventListener('click', () => {
      const isOpen = card.classList.contains('bt-open');
      document.querySelectorAll('#bt-wrapper .bt-match.bt-open')
        .forEach(c => c.classList.remove('bt-open'));
      if (!isOpen) card.classList.add('bt-open');
    });
  });
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

// 1° → R32-14 (M86) → R16-7 (O7) → QF-4 (C4) → SF-2
// 2° → R32-12 (M84) → R16-6 (O6) → QF-3 (C3) → SF-2
const ARG_PATH_MAP = {
  '1': ['R32-14', 'R16-7', 'QF-4', 'SF-2'],
  '2': ['R32-12', 'R16-6', 'QF-3', 'SF-2'],
};
const ARG_ROUND_LABELS = ['R32', 'Octavos', 'Cuartos', 'Semis'];
const ARG_ROUND_KEYS   = ['r32', 'r16', 'qf', 'sf'];

// Busca un partido del bracket por su id ('R32-14', 'R16-7', etc.)
function findMatchById(id) {
  return [...BRACKET.ronda32, ...BRACKET.octavos, ...BRACKET.cuartos, ...BRACKET.semis]
    .find(m => m.id === id) ?? null;
}

// Deriva el estado del camino de Argentina desde window.RESULTS
function computeArgFromResults() {
  const state = { position: null, provisional: false };
  const jGroup = GROUPS['J'];
  if (!jGroup) return state;

  const groupResults   = window.RESULTS?.groups  || {};
  const bracketResults = window.RESULTS?.bracket || {};

  const groupResultCount = jGroup.matches.reduce(
    (n, _, i) => n + (groupResults[`J-${i}`] != null ? 1 : 0), 0
  );
  if (groupResultCount === 0) return state;

  const jStandings = calcStandings('J', jGroup);
  const argIdx = jStandings.findIndex(t => t.isArgentina);
  if (argIdx < 0) return state;

  state.position   = String(argIdx + 1);
  state.provisional = groupResultCount < jGroup.matches.length;

  if (!ARG_PATH_MAP[state.position]) return state; // eliminada en grupos

  const path = ARG_PATH_MAP[state.position];
  for (let i = 0; i < path.length; i++) {
    const r = bracketResults[path[i]] ?? null;
    if (r == null) break;

    const match = findMatchById(path[i]);
    if (!match) break;

    const isArgHome = resolveTeam(match.home)?.name === 'Argentina';
    const argScore  = isArgHome ? r.home : r.away;
    const oppScore  = isArgHome ? r.away : r.home;

    if (argScore > oppScore)      { state[ARG_ROUND_KEYS[i]] = 'won'; }
    else if (argScore < oppScore) { state[ARG_ROUND_KEYS[i]] = 'lost'; break; }
  }

  // Final — solo si ganó la semi
  if (state.sf === 'won') {
    const finR = bracketResults['FIN'] ?? null;
    if (finR != null) {
      const isArgHome = resolveTeam(BRACKET.final.home)?.name === 'Argentina';
      const argScore  = isArgHome ? finR.home : finR.away;
      const oppScore  = isArgHome ? finR.away : finR.home;
      if (argScore > oppScore)      state.final = 'won';
      else if (argScore < oppScore) state.final = 'lost';
    }
  }

  return state;
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
  const ids = computeArgIds(computeArgFromResults());
  document.querySelectorAll('.bt-match').forEach(card => {
    const id = card.id.replace('bt-', '');
    card.classList.toggle('bt-arg', ids.has(id));
  });
}

function renderArgPanel() {
  const panel = document.getElementById('arg-panel');
  if (!panel) return;
  const state = computeArgFromResults();

  const steps = [];

  if (!state.position) {
    steps.push(`<span class="arg-status arg-status--pending">Sin resultados</span>`);
  } else if (!ARG_PATH_MAP[state.position]) {
    steps.push(`
      <div class="arg-step">
        <span class="arg-step-label">Grupo J:</span>
        <span class="arg-status arg-status--lost">${state.position}° — No clasificó</span>
      </div>`);
  } else {
    const prov = state.provisional
      ? ` <span class="arg-prov">(prov.)</span>` : '';
    steps.push(`
      <div class="arg-step">
        <span class="arg-step-label">Grupo J:</span>
        <span class="arg-status arg-status--won">${state.position}°${prov}</span>
      </div>`);

    for (let i = 0; i < ARG_ROUND_KEYS.length; i++) {
      const prev = i === 0 || state[ARG_ROUND_KEYS[i - 1]] === 'won';
      if (!prev) break;

      const result = state[ARG_ROUND_KEYS[i]];
      let chip;
      if      (result === 'won')  chip = `<span class="arg-status arg-status--won">Ganó</span>`;
      else if (result === 'lost') chip = `<span class="arg-status arg-status--lost">Eliminada</span>`;
      else                        chip = `<span class="arg-status arg-status--pending">Pendiente</span>`;

      steps.push(`
        <div class="arg-step">
          <span class="arg-step-label">${ARG_ROUND_LABELS[i]}:</span>
          ${chip}
        </div>`);

      if (result !== 'won') break;
    }

    if (state.sf === 'won') {
      let chip;
      if      (state.final === 'won')  chip = `<span class="arg-status arg-status--champion">🏆 Campeón</span>`;
      else if (state.final === 'lost') chip = `<span class="arg-status arg-status--lost">Finalista</span>`;
      else                             chip = `<span class="arg-status arg-status--pending">Pendiente</span>`;

      steps.push(`
        <div class="arg-step">
          <span class="arg-step-label">Final:</span>
          ${chip}
        </div>`);
    }
  }

  panel.innerHTML = `
    <div class="arg-panel-inner">
      <span class="arg-panel-title">🇦🇷 Argentina</span>
      ${steps.join('<span class="arg-step-sep">›</span>')}
    </div>`;
}
