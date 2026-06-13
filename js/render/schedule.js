const SCHED_MONTH    = { jun: 5, jul: 6 };
const SCHED_MON_LONG = { jun: 'junio', jul: 'julio' };
const SCHED_DOW      = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SCHED_DOW_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

let schedFilterDate  = null;
let schedInitialized = false;

function schedDateKey(rawDate) {
  const p = rawDate.trim().split(' ');
  return `${p[0]} ${p[1]}`;
}

function schedDateObj(key) {
  const [d, m] = key.split(' ');
  return new Date(2026, SCHED_MONTH[m], +d);
}

function schedToUTC(key, time) {
  const [d, m] = key.split(' ');
  const [h, min] = time.split(':').map(Number);
  return new Date(Date.UTC(2026, SCHED_MONTH[m], +d, h + 3, min)).getTime();
}

function schedGetResult(m) {
  if (m.type === 'group') return (window.RESULTS?.groups  || {})[m.id] ?? null;
  return                         (window.RESULTS?.bracket || {})[m.id] ?? null;
}

// Devuelve true solo cuando Argentina está CONFIRMADA en ese slot de bracket.
// Para slots de posición de grupo ("1J", "2H"), exige que el grupo esté completamente jugado.
// Para slots de resultado de bracket ("G M86", "G O6"...), resolveTeam ya requiere resultado.
function schedArgInSlot(label) {
  const posMatch = label.match(/^([12])([A-L])$/);
  if (posMatch) {
    const letter = posMatch[2];
    const group  = GROUPS[letter];
    if (!group) return false;
    const allPlayed = group.matches.every((_, i) =>
      (window.RESULTS?.groups || {})[`${letter}-${i}`] != null);
    if (!allPlayed) return false;
  }
  return resolveTeam(label)?.name === 'Argentina';
}

function buildScheduleMatches() {
  const list = [];

  Object.entries(GROUPS).forEach(([letter, group]) => {
    group.matches.forEach((m, i) => {
      const dk = schedDateKey(m.date);
      list.push({
        type: 'group', round: `Grupo ${letter}`,
        groupColor: group.color, id: `${letter}-${i}`, groupLetter: letter,
        home: m.home, away: m.away,
        homeTeam: group.teams.find(t => t.name === m.home),
        awayTeam: group.teams.find(t => t.name === m.away),
        dk, dateObj: schedDateObj(dk), time: m.time,
        stadium: m.stadium, city: m.city,
        isArg: m.home === 'Argentina' || m.away === 'Argentina',
      });
    });
  });

  const rounds = [
    { key: 'ronda32', label: 'Ronda de 32' },
    { key: 'octavos', label: 'Octavos de Final' },
    { key: 'cuartos', label: 'Cuartos de Final' },
    { key: 'semis',   label: 'Semifinales' },
  ];
  rounds.forEach(({ key, label }) => {
    (BRACKET[key] || []).forEach(m => {
      const dk = schedDateKey(m.date);
      list.push({
        type: 'bracket', round: label, groupColor: null, id: m.id,
        home: m.home, away: m.away, homeTeam: null, awayTeam: null,
        dk, dateObj: schedDateObj(dk), time: m.time,
        stadium: m.stadium, city: m.city,
        isArg: schedArgInSlot(m.home) || schedArgInSlot(m.away),
      });
    });
  });

  ['tercero', 'final'].forEach(key => {
    const m = BRACKET[key];
    if (!m) return;
    const dk = schedDateKey(m.date);
    list.push({
      type: 'bracket',
      round: key === 'final' ? 'Gran Final' : '3.° Puesto',
      groupColor: null, id: m.id,
      home: m.home, away: m.away, homeTeam: null, awayTeam: null,
      dk, dateObj: schedDateObj(dk), time: m.time,
      stadium: m.stadium, city: m.city, isArg: false,
    });
  });

  list.sort((a, b) => {
    const d = a.dateObj - b.dateObj;
    if (d) return d;
    const [ah, am] = a.time.split(':').map(Number);
    const [bh, bm] = b.time.split(':').map(Number);
    return (ah * 60 + am) - (bh * 60 + bm);
  });

  return list;
}

function renderSchedule() {
  const now = Date.now();
  const matches = buildScheduleMatches();

  // Próximo por grupo (misma lógica que la pestaña grupos: cada grupo marca su propio próximo)
  const nextByGroup = {};
  Object.entries(GROUPS).forEach(([letter, group]) => {
    let t = null;
    group.matches.forEach((m, i) => {
      const r = (window.RESULTS?.groups || {})[`${letter}-${i}`];
      if (r != null) return;
      const ms = schedToUTC(schedDateKey(m.date), m.time);
      if (ms > now && (t === null || ms < t)) t = ms;
    });
    nextByGroup[letter] = t;
  });

  // Próximo global solo para partidos de bracket
  let nextBracketUTC = null;
  for (const m of matches) {
    if (m.type !== 'bracket') continue;
    if (schedGetResult(m) != null) continue;
    const t = schedToUTC(m.dk, m.time);
    if (t > now && (nextBracketUTC === null || t < nextBracketUTC)) nextBracketUTC = t;
  }

  const byDate = new Map();
  for (const m of matches) {
    if (!byDate.has(m.dk)) byDate.set(m.dk, []);
    byDate.get(m.dk).push(m);
  }

  // first date that still has upcoming/live matches
  let scrollKey = null;
  for (const [dk, ms] of byDate) {
    const hasActive = ms.some(m => {
      if (schedGetResult(m) != null) return false;
      return schedToUTC(m.dk, m.time) >= now - 7200000;
    });
    if (hasActive) { scrollKey = dk; break; }
  }

  // on first render: auto-select today's date (ARG time), or nearest upcoming
  if (!schedInitialized) {
    schedInitialized = true;
    const nowArg   = new Date(Date.now() - 3 * 3600 * 1000);
    const monKey   = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][nowArg.getUTCMonth()];
    const todayKey = `${nowArg.getUTCDate()} ${monKey}`;
    schedFilterDate = byDate.has(todayKey) ? todayKey : (scrollKey ?? null);
  }

  // pills
  const filterEl = document.getElementById('date-filter');
  if (filterEl) {
    filterEl.innerHTML = '';

    const allPill = document.createElement('button');
    allPill.className = 'date-pill' + (schedFilterDate === null ? ' active' : '');
    allPill.type = 'button';
    allPill.textContent = 'Todos';
    allPill.addEventListener('click', () => { schedFilterDate = null; renderSchedule(); });
    filterEl.appendChild(allPill);

    for (const [dk] of byDate) {
      const [day, mon] = dk.split(' ');
      const dow = SCHED_DOW[schedDateObj(dk).getDay()];
      const pill = document.createElement('button');
      pill.className = 'date-pill' + (schedFilterDate === dk ? ' active' : '');
      pill.type = 'button';
      pill.dataset.dk = dk;
      pill.innerHTML = `<span class="dpill-dow">${dow}</span><span class="dpill-date">${day} ${mon}</span>`;
      pill.addEventListener('click', () => { schedFilterDate = dk; renderSchedule(); });
      filterEl.appendChild(pill);
    }

    const targetKey = schedFilterDate ?? scrollKey;
    if (targetKey) {
      const pill = filterEl.querySelector(`[data-dk="${targetKey}"]`);
      if (pill) setTimeout(() => pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 60);
    }
  }

  // list
  const listEl = document.getElementById('schedule-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  let hasAny = false;
  for (const [dk, dayMatches] of byDate) {
    if (schedFilterDate && dk !== schedFilterDate) continue;
    hasAny = true;

    const [day, mon] = dk.split(' ');
    const dow     = SCHED_DOW_LONG[schedDateObj(dk).getDay()];
    const monLong = SCHED_MON_LONG[mon];

    const dayBlock = document.createElement('div');
    dayBlock.className = 'sched-day';
    dayBlock.innerHTML = `
      <div class="sched-day-header">
        <div class="sched-day-label">
          <span class="sched-dow">${dow}</span>
          <span class="sched-date">${day} de ${monLong}</span>
        </div>
        <span class="sched-count">${dayMatches.length} ${dayMatches.length === 1 ? 'partido' : 'partidos'}</span>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'sched-cards';

    dayMatches.forEach((m, idx) => {
      const r = schedGetResult(m);
      const startUTC  = schedToUTC(m.dk, m.time);
      const isCompleted = r != null;
      const isLive      = !isCompleted && now >= startUTC && now < startUTC + 7200000;
      const nextRef     = m.type === 'group' ? nextByGroup[m.groupLetter] : nextBracketUTC;
      const isNext      = !isCompleted && !isLive && startUTC === nextRef;

      const card = document.createElement('div');
      card.className = 'sched-card'
        + (isCompleted ? ' match-completed' : '')
        + (isLive      ? ' live-match'      : '')
        + (isNext      ? ' next-match'      : '')
        + (m.isArg     ? ' argentina-match' : '');
      card.style.animationDelay = `${idx * 0.04}s`;

      const roundColor = m.type === 'group' ? m.groupColor : 'var(--fifa-blue)';
      const hFlag = m.homeTeam ? `<span class="fi fi-${m.homeTeam.flag} sched-flag"></span>` : '';
      const aFlag = m.awayTeam ? `<span class="fi fi-${m.awayTeam.flag} sched-flag"></span>` : '';

      const scoreHtml = isCompleted
        ? `<div class="sched-score completed">${r.home}&nbsp;:&nbsp;${r.away}</div>`
        : `<div class="sched-score">–&nbsp;:&nbsp;–</div>`;

      const badge = isLive
        ? '<div class="live-match-badge"><span class="live-dot-sm"></span> EN JUEGO</div>'
        : isNext
          ? '<div class="next-match-badge"><i data-lucide="zap"></i> Próximo</div>'
          : '';

      card.innerHTML = `
        ${badge}
        <div class="sched-card-top">
          <span class="sched-round" style="color:${roundColor};border-color:${roundColor}33;background:${roundColor}16">${m.round}</span>
          <span class="sched-time"><i data-lucide="clock-3"></i> ${m.time} ARG</span>
        </div>
        <div class="sched-teams">
          <div class="sched-team home">${hFlag}<span class="sched-name">${m.home}</span></div>
          ${scoreHtml}
          <div class="sched-team away"><span class="sched-name">${m.away}</span>${aFlag}</div>
        </div>
        <div class="sched-meta">
          <span><i data-lucide="building-2"></i>${m.stadium}</span>
          <span><i data-lucide="map-pin"></i>${m.city}</span>
        </div>
      `;

      grid.appendChild(card);
    });

    dayBlock.appendChild(grid);
    listEl.appendChild(dayBlock);
  }

  if (!hasAny) {
    listEl.innerHTML = '<div class="sched-empty"><i data-lucide="calendar-x-2"></i> No hay partidos en esta fecha.</div>';
    lucide.createIcons();
  } else {
    lucide.createIcons();
  }
}

function showScheduleSkeleton() {
  const filterEl = document.getElementById('date-filter');
  if (filterEl) {
    filterEl.innerHTML =
      `<div class="sched-sk-pill sched-sk-pill--wide"></div>` +
      Array.from({ length: 9 }, () => `<div class="sched-sk-pill"></div>`).join('');
  }

  const listEl = document.getElementById('schedule-list');
  if (!listEl) return;
  listEl.innerHTML = `
    <div class="sched-day">
      <div class="sched-sk-day-header"></div>
      <div class="sched-cards">
        ${Array.from({ length: 8 }, () => `
          <div class="sched-sk-card">
            <div class="sched-sk-row sched-sk-row--top">
              <div class="sched-sk-line sk-w40"></div>
              <div class="sched-sk-line sk-w25"></div>
            </div>
            <div class="sched-sk-line sched-sk-teams-row"></div>
            <div class="sched-sk-row sched-sk-row--meta">
              <div class="sched-sk-line sk-w55"></div>
              <div class="sched-sk-line sk-w35"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
