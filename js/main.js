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
    document.querySelectorAll('.bt-match').forEach(card => {
      card.style.animation = 'none';
      void card.offsetHeight;
      card.style.animation = '';
    });
    const btCenter = document.querySelector('.bt-center');
    if (btCenter) {
      btCenter.style.animation = 'none';
      void btCenter.offsetHeight;
      btCenter.style.animation = '';
    }
  }
}

async function loadResults() {
  try {
    const res = await fetch('data/results.json?t=' + Date.now());
    window.RESULTS = await res.json();
  } catch (_) {
    window.RESULTS = { updated: null, groups: {}, bracket: {} };
  }
  const el = document.getElementById('results-updated');
  if (el) {
    const ts = window.RESULTS.updated;
    el.textContent = ts
      ? 'Actualizado: ' + new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Sin resultados cargados';
  }
}

async function refreshResults() {
  const btn = document.getElementById('refresh-btn');
  if (btn) btn.classList.add('spinning');
  await loadResults();
  renderGroups();
  renderBracket();
  lucide.createIcons();
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
})();
