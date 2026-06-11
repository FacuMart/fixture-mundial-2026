// ─── Estado local ─────────────────────────────────────────────────────────────
let localResults = { updated: null, groups: {}, bracket: {} };

// ─── Auth ─────────────────────────────────────────────────────────────────────
console.log('[admin] script cargado, firebase.apps:', firebase.apps.length);

auth.onAuthStateChanged(user => {
  console.log('[admin] onAuthStateChanged:', user ? user.email : 'null');
  document.getElementById('login-section').hidden  = !!user;
  document.getElementById('admin-panel').hidden    = !user;
  if (user) {
    loadAndRender();
  }
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  const errEl = document.getElementById('login-error');
  const btn   = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Ingresando…';
  errEl.textContent = '';
  console.log('[admin] intentando login con:', email);
  try {
    const result = await auth.signInWithEmailAndPassword(email, pass);
    console.log('[admin] login ok:', result.user.email);
  } catch (err) {
    console.error('[admin] login error:', err.code, err.message);
    errEl.textContent = 'Usuario o contraseña incorrectos';
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// ─── Carga inicial ────────────────────────────────────────────────────────────
async function loadAndRender() {
  setStatus('Cargando…', 'loading');
  try {
    localResults = await loadResultsFromFirebase();
  } catch (_) {
    localResults = { updated: null, groups: {}, bracket: {} };
  }
  renderAdmin();
  updateLastSaved();
}

// ─── Render del panel ─────────────────────────────────────────────────────────
function renderAdmin() {
  const container = document.getElementById('groups-admin');
  container.innerHTML = '';

  Object.entries(GROUPS).forEach(([letter, group]) => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.innerHTML = `
      <div class="admin-card-header" style="background: linear-gradient(135deg, ${group.color}, ${group.color}CC)">
        <span class="admin-group-letter">${letter}</span>
        <span>Grupo ${letter}</span>
      </div>
    `;

    const matchesList = document.createElement('div');
    matchesList.className = 'admin-matches';

    group.matches.forEach((m, i) => {
      const key = `${letter}-${i}`;
      const saved = localResults.groups?.[key] ?? null;
      const row = document.createElement('div');
      row.className = 'admin-match-row' + (saved !== null ? ' has-result' : '');
      row.dataset.key = key;

      row.innerHTML = `
        <div class="admin-match-meta">
          <span class="admin-match-date">${m.date} · ${m.time}</span>
        </div>
        <div class="admin-match-score-row">
          <span class="admin-team-name home">${m.home}</span>
          <input class="score-input" type="number" min="0" max="99" placeholder="–"
            data-side="home" data-key="${key}" value="${saved !== null ? saved.home : ''}">
          <span class="admin-score-sep">:</span>
          <input class="score-input" type="number" min="0" max="99" placeholder="–"
            data-side="away" data-key="${key}" value="${saved !== null ? saved.away : ''}">
          <span class="admin-team-name away">${m.away}</span>
          <button class="clear-btn" data-key="${key}" title="Limpiar resultado">×</button>
        </div>
      `;

      row.querySelector('.clear-btn').addEventListener('click', e => {
        const k = e.currentTarget.dataset.key;
        delete localResults.groups[k];
        row.querySelectorAll('.score-input').forEach(inp => inp.value = '');
        row.classList.remove('has-result');
      });

      row.querySelectorAll('.score-input').forEach(inp => {
        inp.addEventListener('input', () => {
          const k  = inp.dataset.key;
          const gr = row.querySelectorAll('.score-input');
          const hv = gr[0].value;
          const av = gr[1].value;
          if (hv !== '' && av !== '') {
            if (!localResults.groups) localResults.groups = {};
            localResults.groups[k] = { home: parseInt(hv, 10), away: parseInt(av, 10) };
            row.classList.add('has-result');
          } else {
            delete localResults.groups?.[k];
            row.classList.remove('has-result');
          }
        });
      });

      matchesList.appendChild(row);
    });

    card.appendChild(matchesList);
    container.appendChild(card);
  });

  setStatus('', '');
  renderBracketAdmin();
}

// ─── Render bracket ───────────────────────────────────────────────────────────
function renderBracketAdmin() {
  const container = document.getElementById('bracket-admin');
  container.innerHTML = '';

  const rounds = [
    { name: 'Ronda de 32 — Lado A', color: '#4f46e5', matches: BRACKET.ronda32.slice(0, 8) },
    { name: 'Ronda de 32 — Lado B', color: '#4f46e5', matches: BRACKET.ronda32.slice(8) },
    { name: 'Octavos de Final',      color: '#7c3aed', matches: BRACKET.octavos },
    { name: 'Cuartos de Final',       color: '#9333ea', matches: BRACKET.cuartos },
    { name: 'Semifinales',            color: '#c026d3', matches: BRACKET.semis },
    { name: 'Final + 3er Puesto',     color: '#e11d48', matches: [BRACKET.final, BRACKET.tercero] },
  ];

  rounds.forEach(round => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.innerHTML = `
      <div class="admin-card-header" style="background: linear-gradient(135deg, ${round.color}, ${round.color}CC); justify-content: center;">
        <span>${round.name}</span>
      </div>
    `;

    const matchesList = document.createElement('div');
    matchesList.className = 'admin-matches';

    round.matches.forEach(m => {
      const key   = m.id;
      const label = m.label || m.id;
      const saved = localResults.bracket?.[key] ?? null;
      const row   = document.createElement('div');
      row.className = 'admin-match-row' + (saved !== null ? ' has-result' : '');
      row.dataset.key = key;

      row.innerHTML = `
        <div class="admin-match-meta">
          <span class="admin-match-date">${label} · ${m.date}</span>
        </div>
        <div class="admin-match-score-row">
          <span class="admin-team-name home">${m.home}</span>
          <input class="score-input" type="number" min="0" max="99" placeholder="–"
            data-side="home" data-key="${key}" value="${saved !== null ? saved.home : ''}">
          <span class="admin-score-sep">:</span>
          <input class="score-input" type="number" min="0" max="99" placeholder="–"
            data-side="away" data-key="${key}" value="${saved !== null ? saved.away : ''}">
          <span class="admin-team-name away">${m.away}</span>
          <button class="clear-btn" data-key="${key}" title="Limpiar resultado">×</button>
        </div>
      `;

      row.querySelector('.clear-btn').addEventListener('click', e => {
        const k = e.currentTarget.dataset.key;
        delete localResults.bracket[k];
        row.querySelectorAll('.score-input').forEach(inp => inp.value = '');
        row.classList.remove('has-result');
      });

      row.querySelectorAll('.score-input').forEach(inp => {
        inp.addEventListener('input', () => {
          const k  = inp.dataset.key;
          const gr = row.querySelectorAll('.score-input');
          const hv = gr[0].value;
          const av = gr[1].value;
          if (hv !== '' && av !== '') {
            if (!localResults.bracket) localResults.bracket = {};
            localResults.bracket[k] = { home: parseInt(hv, 10), away: parseInt(av, 10) };
            row.classList.add('has-result');
          } else {
            delete localResults.bracket?.[k];
            row.classList.remove('has-result');
          }
        });
      });

      matchesList.appendChild(row);
    });

    card.appendChild(matchesList);
    container.appendChild(card);
  });
}

// ─── Guardar ──────────────────────────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', saveAll);
document.getElementById('save-btn-bottom').addEventListener('click', saveAll);

async function saveAll() {
  const btns = document.querySelectorAll('.save-all-btn');
  btns.forEach(b => { b.disabled = true; b.textContent = 'Guardando…'; });
  setStatus('Guardando…', 'loading');

  localResults.updated = new Date().toISOString();

  try {
    await saveResultsToFirebase(localResults);
    updateLastSaved();
    setStatus('Guardado correctamente', 'ok');
    document.querySelectorAll('.admin-match-row.has-result').forEach(r => {
      r.classList.add('just-saved');
      setTimeout(() => r.classList.remove('just-saved'), 1500);
    });
  } catch (err) {
    setStatus('Error al guardar: ' + err.message, 'error');
  }

  btns.forEach(b => { b.disabled = false; b.textContent = 'Guardar resultados'; });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function updateLastSaved() {
  const el = document.getElementById('last-saved');
  const ts = localResults.updated;
  el.textContent = ts
    ? 'Último guardado: ' + new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Sin datos guardados';
}

function setStatus(msg, type) {
  const el = document.getElementById('admin-status');
  el.textContent = msg;
  el.className = 'admin-status ' + (type || '');
}
