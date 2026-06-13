let groupView = 'general';
let selectedLetter = 'J';

function getResult(letter, index) {
  return (window.RESULTS?.groups || {})[`${letter}-${index}`] ?? null;
}

function calcStandings(letter, group) {
  const stats = {};
  group.teams.forEach(t => { stats[t.name] = { pj:0, g:0, e:0, p:0, gf:0, gc:0 }; });
  group.matches.forEach((m, i) => {
    const r = getResult(letter, i);
    if (r == null) return;
    stats[m.home].pj++; stats[m.away].pj++;
    stats[m.home].gf += r.home; stats[m.home].gc += r.away;
    stats[m.away].gf += r.away; stats[m.away].gc += r.home;
    if (r.home > r.away)      { stats[m.home].g++; stats[m.away].p++; }
    else if (r.home < r.away) { stats[m.away].g++; stats[m.home].p++; }
    else                      { stats[m.home].e++; stats[m.away].e++; }
  });
  return group.teams
    .map(t => ({ ...t, ...stats[t.name], pts: stats[t.name].g*3+stats[t.name].e, dg: stats[t.name].gf-stats[t.name].gc }))
    .sort((a, b) => b.pts-a.pts || b.dg-a.dg || b.gf-a.gf);
}

function flagImg(code) {
  return `<span class="fi fi-${code}"></span>`;
}

const MONTH_MAP = { jun: 5, jul: 6 };

function parseMatchUTC(dateStr, timeStr) {
  const [day, mon] = dateStr.trim().split(' ');
  const [h, m]     = timeStr.trim().split(':');
  return new Date(Date.UTC(2026, MONTH_MAP[mon], +day, +h + 3, +m));
}

function isArgentinaMatch(match) {
  return match.home === 'Argentina' || match.away === 'Argentina';
}

// ——— Calcula el estado de un partido (live / next / normal) ———
function getMatchState(letter, group, now) {
  let nextMatchTime = null;
  group.matches.forEach((m, i) => {
    const r = getResult(letter, i);
    if (r != null) return;
    const matchStart = parseMatchUTC(m.date, m.time);
    const matchEnd   = matchStart.getTime() + 2 * 60 * 60 * 1000;
    if (now < matchStart && (nextMatchTime === null || matchStart < nextMatchTime)) {
      nextMatchTime = matchStart.getTime();
    }
  });
  return (m, i) => {
    const r          = getResult(letter, i);
    const isCompleted = r != null;
    const matchStart = parseMatchUTC(m.date, m.time);
    const matchEnd   = matchStart.getTime() + 2 * 60 * 60 * 1000;
    const isLive     = !isCompleted && now >= matchStart && now < matchEnd;
    const isNext     = !isCompleted && !isLive && matchStart.getTime() === nextMatchTime;
    return { isCompleted, isLive, isNext, r };
  };
}

// ——— Tarjeta compacta (vista general) ———
function makeGroupCard(letter, group) {
  const card = document.createElement('div');
  card.className = 'group-card';

  const header = document.createElement('div');
  header.className = 'group-header';
  header.style.background = `linear-gradient(135deg, ${group.color}, ${group.color}CC)`;
  header.innerHTML = `<span class="group-letter">${letter}</span><span>Grupo ${letter}</span>`;
  card.appendChild(header);

  const teamsDiv = document.createElement('div');
  teamsDiv.className = 'group-teams';
  group.teams.forEach(t => {
    const row = document.createElement('div');
    row.className = 'team-row';
    row.innerHTML = `
      <span class="team-flag">${flagImg(t.flag)}</span>
      <span class="team-name">${t.name}</span>
      ${t.isArgentina ? '<span class="champion-badge"><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i> Campeón</span>' : ''}
    `;
    teamsDiv.appendChild(row);
  });
  card.appendChild(teamsDiv);

  const matchesDiv = document.createElement('div');
  matchesDiv.className = 'group-matches';
  const now = Date.now();
  const stateOf = getMatchState(letter, group, now);
  group.matches.forEach((m, i) => {
    const { isCompleted, isLive, isNext, r } = stateOf(m, i);
    const mc = document.createElement('div');
    mc.className = 'match-card'
      + (isArgentinaMatch(m) ? ' argentina-match' : '')
      + (isCompleted ? ' match-completed' : '')
      + (isNext      ? ' next-match'      : '')
      + (isLive      ? ' live-match'      : '');

    const homeTeam = group.teams.find(t => t.name === m.home);
    const awayTeam = group.teams.find(t => t.name === m.away);
    const hFlag = homeTeam ? flagImg(homeTeam.flag) : '<i data-lucide="flag"></i>';
    const aFlag = awayTeam ? flagImg(awayTeam.flag) : '<i data-lucide="flag"></i>';
    const scoreHtml = r != null
      ? `<div class="match-score completed">${r.home} : ${r.away}</div>`
      : `<div class="match-score">– : –</div>`;
    const badge = isLive
      ? '<div class="live-match-badge"><span class="live-dot-sm"></span> EN JUEGO</div>'
      : isNext
        ? '<div class="next-match-badge"><i data-lucide="zap"></i> Próximo</div>'
        : '';

    mc.innerHTML = `
      ${badge}
      <div class="match-teams">
        <div class="match-team"><span>${hFlag}</span><span>${m.home}</span></div>
        ${scoreHtml}
        <div class="match-team away"><span>${aFlag}</span><span>${m.away}</span></div>
      </div>
      <div class="match-info">
        <span><i data-lucide="calendar"></i> ${m.date} · ${m.time} (ARG)</span>
        <span><i data-lucide="building-2"></i> ${m.stadium}</span>
        <span><i data-lucide="map-pin"></i> ${m.city}</span>
      </div>
    `;
    matchesDiv.appendChild(mc);
  });
  card.appendChild(matchesDiv);

  return card;
}

// ——— Panel detalle (vista individual) ———
function makeGroupDetail(letter, group) {
  const now = Date.now();
  const wrap = document.createElement('div');
  wrap.className = 'group-card group-detail-card';

  // Header
  const header = document.createElement('div');
  header.className = 'group-header group-header--detail';
  header.style.background = `linear-gradient(135deg, ${group.color} 0%, ${group.color}BB 100%)`;
  header.innerHTML = `
    <span class="group-letter">${letter}</span>
    <div>
      <div style="font-size:1.15rem">Grupo ${letter}</div>
      <div style="font-size:0.72rem;opacity:0.75;font-weight:600;letter-spacing:0.08em;margin-top:2px">FIFA WORLD CUP 2026</div>
    </div>
  `;
  wrap.appendChild(header);

  // Fila superior: equipos + tabla de posiciones
  const topRow = document.createElement('div');
  topRow.className = 'detail-top-row';

  // Columna equipos
  const teamsCol = document.createElement('div');
  teamsCol.className = 'detail-col';
  teamsCol.innerHTML = `<div class="detail-section-title" style="border-color:${group.color}"><i data-lucide="users"></i> Equipos</div>`;
  const teamsList = document.createElement('div');
  teamsList.className = 'detail-teams-list';
  group.teams.forEach(t => {
    const row = document.createElement('div');
    row.className = 'team-row' + (t.isArgentina ? ' argentina-team-row' : '');
    row.innerHTML = `
      <span class="team-flag">${flagImg(t.flag)}</span>
      <span class="team-name">${t.name}</span>
      ${t.isArgentina ? '<span class="champion-badge"><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i> Campeón</span>' : ''}
    `;
    teamsList.appendChild(row);
  });
  teamsCol.appendChild(teamsList);
  topRow.appendChild(teamsCol);

  // Columna tabla de posiciones
  const standingsCol = document.createElement('div');
  standingsCol.className = 'detail-col';
  standingsCol.innerHTML = `<div class="detail-section-title" style="border-color:${group.color}"><i data-lucide="bar-chart-2"></i> Clasificación</div>`;

  const standings = calcStandings(letter, group);
  const table = document.createElement('table');
  table.className = 'standings-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th class="th-team">Equipo</th>
        <th title="Partidos jugados">PJ</th>
        <th title="Ganados">G</th>
        <th title="Empatados">E</th>
        <th title="Perdidos">P</th>
        <th title="Goles a favor">GF</th>
        <th title="Goles en contra">GC</th>
        <th title="Puntos">Pts</th>
      </tr>
    </thead>
    <tbody>
      ${standings.map((t, i) => `
        <tr class="${i < 2 ? 'qualifies' : i === 2 ? 'third-possible' : ''}${t.isArgentina ? ' argentina-row' : ''}">
          <td><span class="pos-num${i < 2 ? ' pos-qualifies' : i === 2 ? ' pos-third' : ''}">${i + 1}</span></td>
          <td class="td-team">${flagImg(t.flag)}<span>${t.name}</span></td>
          <td>${t.pj}</td><td>${t.g}</td><td>${t.e}</td><td>${t.p}</td>
          <td>${t.gf}</td><td>${t.gc}</td>
          <td class="td-pts">${t.pts}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  standingsCol.appendChild(table);

  const classNote = document.createElement('div');
  classNote.className = 'classify-note';
  classNote.innerHTML = `
    <div class="classify-note-row"><i data-lucide="arrow-up-circle" class="lucide-direct"></i> Los 2 primeros clasifican directamente</div>
    <div class="classify-note-row"><i data-lucide="circle-dot" class="lucide-third"></i> Los 8 mejores terceros también clasifican</div>
  `;
  standingsCol.appendChild(classNote);

  topRow.appendChild(standingsCol);
  wrap.appendChild(topRow);

  // Partidos con highlight del próximo
  const matchSection = document.createElement('div');
  matchSection.className = 'detail-matches-section';
  matchSection.innerHTML = `<div class="detail-section-title detail-section-title--wide" style="border-color:${group.color}"><i data-lucide="calendar-days"></i> Partidos del grupo</div>`;

  const matchesDiv = document.createElement('div');
  matchesDiv.className = 'group-matches detail-matches';

  const stateOf = getMatchState(letter, group, now);
  group.matches.forEach((m, i) => {
    const { isCompleted, isLive, isNext, r } = stateOf(m, i);
    const mc = document.createElement('div');
    mc.className = 'match-card'
      + (isArgentinaMatch(m) ? ' argentina-match' : '')
      + (isCompleted ? ' match-completed' : '')
      + (isNext      ? ' next-match'      : '')
      + (isLive      ? ' live-match'      : '');

    const homeTeam = group.teams.find(t => t.name === m.home);
    const awayTeam = group.teams.find(t => t.name === m.away);
    const hFlag = homeTeam ? flagImg(homeTeam.flag) : '<i data-lucide="flag"></i>';
    const aFlag = awayTeam ? flagImg(awayTeam.flag) : '<i data-lucide="flag"></i>';
    const scoreHtml = isCompleted
      ? `<div class="match-score completed">${r.home} : ${r.away}</div>`
      : `<div class="match-score">– : –</div>`;
    const badge = isLive
      ? '<div class="live-match-badge"><span class="live-dot-sm"></span> EN JUEGO</div>'
      : isNext
        ? '<div class="next-match-badge"><i data-lucide="zap"></i> Próximo</div>'
        : '';

    mc.innerHTML = `
      ${badge}
      <div class="match-teams">
        <div class="match-team"><span>${hFlag}</span><span>${m.home}</span></div>
        ${scoreHtml}
        <div class="match-team away"><span>${aFlag}</span><span>${m.away}</span></div>
      </div>
      <div class="match-info">
        <span><i data-lucide="calendar"></i> ${m.date} · ${m.time} (ARG)</span>
        <span><i data-lucide="building-2"></i> ${m.stadium}</span>
        <span><i data-lucide="map-pin"></i> ${m.city}</span>
      </div>
    `;
    matchesDiv.appendChild(mc);
  });
  matchSection.appendChild(matchesDiv);
  wrap.appendChild(matchSection);

  // Sedes del grupo
  const sedesSection = document.createElement('div');
  sedesSection.className = 'detail-sedes';
  sedesSection.innerHTML = `<div class="detail-section-title" style="border-color:${group.color}"><i data-lucide="map"></i> Sedes</div>`;

  const sedesList = document.createElement('div');
  sedesList.className = 'sedes-list';
  const seen = new Set();
  group.matches.forEach(m => {
    if (seen.has(m.city)) return;
    seen.add(m.city);
    const item = document.createElement('div');
    item.className = 'sede-item';
    item.innerHTML = `
      <i data-lucide="map-pin"></i>
      <div>
        <span class="sede-city">${m.city}</span>
        <span class="sede-stadium">${m.stadium}</span>
      </div>
    `;
    sedesList.appendChild(item);
  });
  sedesSection.appendChild(sedesList);
  wrap.appendChild(sedesSection);

  return wrap;
}

// ——— Render principal ———
function renderGroups() {
  const grid = document.getElementById('groups-grid');
  grid.innerHTML = '';

  if (groupView === 'general') {
    grid.classList.remove('detail-mode');
    Object.entries(GROUPS).forEach(([letter, group], index) => {
      const card = makeGroupCard(letter, group);
      card.style.animationDelay = `${index * 0.045}s`;
      grid.appendChild(card);
    });
  } else {
    grid.classList.add('detail-mode');
    const group = GROUPS[selectedLetter];
    if (group) grid.appendChild(makeGroupDetail(selectedLetter, group));
  }
}

// ——— Controles de vista ———
function initGroupControls() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      groupView = btn.dataset.view;

      const selector = document.getElementById('group-selector');
      selector.hidden = groupView === 'general';

      renderGroups();
      lucide.createIcons();
    });
  });

  const selector = document.getElementById('group-selector');
  Object.keys(GROUPS).forEach(letter => {
    const pill = document.createElement('button');
    pill.className = 'group-pill' + (letter === selectedLetter ? ' active' : '');
    pill.type = 'button';
    pill.textContent = letter;
    pill.style.setProperty('--pill-color', GROUPS[letter].color);
    if (letter === selectedLetter) {
      pill.style.background    = GROUPS[letter].color;
      pill.style.borderColor   = GROUPS[letter].color;
      pill.style.color         = '#fff';
    }

    pill.addEventListener('click', () => {
      document.querySelectorAll('.group-pill').forEach(p => {
        p.classList.remove('active');
        p.style.background  = '';
        p.style.borderColor = '';
        p.style.color       = '';
      });
      pill.classList.add('active');
      pill.style.background  = GROUPS[letter].color;
      pill.style.borderColor = GROUPS[letter].color;
      pill.style.color       = '#fff';

      selectedLetter = letter;
      renderGroups();
      lucide.createIcons();
    });

    selector.appendChild(pill);
  });
}
