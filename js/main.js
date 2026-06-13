function activateTab(tabName, animate) {
  const btn    = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const target = document.getElementById('tab-' + tabName);
  if (!btn || !target) return;

  document.documentElement.removeAttribute('data-tab');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  btn.classList.add('active');
  target.classList.add('active');

  if (animate) {
    target.style.animation = 'none';
    void target.offsetHeight;
    target.style.animation = '';
  }

  if (tabName === 'eliminatorias') {
    const btCenter = document.querySelector('.bt-center');
    if (btCenter) {
      btCenter.style.animation = 'none';
      void btCenter.offsetHeight;
      btCenter.style.animation = '';
    }
    setTimeout(revealBracketCards, 50);
  }
}

async function loadResults() {
  let fetchError = false;
  try {
    window.RESULTS = await loadResultsFromFirebase();
  } catch (_) {
    window.RESULTS = { updated: null, groups: {}, bracket: {} };
    fetchError = true;
  }
  const el = document.getElementById('results-updated');
  if (el) {
    if (fetchError) {
      el.textContent = 'Error al cargar resultados';
    } else {
      const ts = window.RESULTS?.updated;
      el.textContent = ts
        ? 'Actualizado: ' + new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
        : 'Sin resultados cargados';
    }
  }
}

async function refreshResults() {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.classList.add('spinning');
  await loadResults();
  renderGroups();
  renderBracket();
  renderSchedule();
  lucide.createIcons();
  if (document.getElementById('tab-eliminatorias')?.classList.contains('active')) {
    setTimeout(revealBracketCards, 50);
  }
  if (btn) btn.classList.remove('spinning');
}

(async function init() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sessionStorage.setItem('activeTab', btn.dataset.tab);
      activateTab(btn.dataset.tab, true);
    });
  });

  document.getElementById('refresh-btn')?.addEventListener('click', refreshResults);

  // Activar el tab guardado antes de cargar datos para evitar el flash
  const saved = sessionStorage.getItem('activeTab');
  const initialTab = ['grupos', 'eliminatorias', 'fechas'].includes(saved) ? saved : 'grupos';
  activateTab(initialTab, false);

  // Mostrar skeletons mientras espera Firebase
  showGroupsSkeleton();
  showBracketSkeleton();
  showScheduleSkeleton();
  lucide.createIcons();

  await loadResults();
  renderGroups();
  renderBracket();
  renderSchedule();
  initGroupControls();
  lucide.createIcons();

  // Reveal del bracket después de renderizar, si corresponde
  if (initialTab === 'eliminatorias') {
    setTimeout(revealBracketCards, 50);
  }

  // Auto-refresh cada 5 minutos
  setInterval(refreshResults, 5 * 60 * 1000);
})();

function showGroupsSkeleton() {
  const grid = document.getElementById('groups-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 12 }, () => `
    <div class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-body">
        <div class="skeleton-line sk-w80"></div>
        <div class="skeleton-line sk-w65"></div>
        <div class="skeleton-line sk-w75"></div>
        <div class="skeleton-line sk-w70"></div>
        <div class="skeleton-divider"></div>
        <div class="skeleton-line sk-w90"></div>
        <div class="skeleton-line sk-w85"></div>
        <div class="skeleton-line sk-w90"></div>
      </div>
    </div>
  `).join('');
}

function showBracketSkeleton() {
  const container = document.getElementById('bracket-container');
  if (!container) return;
  container.innerHTML = `
    <div class="bracket-skeleton-loader">
      <div class="bracket-skeleton-spinner"></div>
      <span>Cargando bracket…</span>
    </div>
  `;
}
