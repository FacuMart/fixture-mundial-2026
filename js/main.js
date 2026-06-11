function activateTab(tabName, animate) {
  const btn    = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const target = document.getElementById('tab-' + tabName);
  if (!btn || !target) return;

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
  lucide.createIcons();
  if (document.getElementById('tab-eliminatorias')?.classList.contains('active')) {
    setTimeout(revealBracketCards, 50);
  }
  if (btn) btn.classList.remove('spinning');
}

(async function init() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      location.hash = btn.dataset.tab;
      activateTab(btn.dataset.tab, true);
    });
  });

  document.getElementById('refresh-btn')?.addEventListener('click', refreshResults);

  await loadResults();
  renderGroups();
  renderBracket();
  initGroupControls();
  lucide.createIcons();

  const initialTab = ['grupos', 'eliminatorias'].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : 'grupos';
  activateTab(initialTab, false);

  // Auto-refresh cada 5 minutos
  setInterval(refreshResults, 5 * 60 * 1000);
})();
