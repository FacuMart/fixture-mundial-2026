(function () {
  // Partidos de Argentina en UTC (ARG = UTC-3)
  const ARG_MATCHES = [
    { label: 'Argentina vs Argelia',  info: '16 jun · 22:00 ARG', start: new Date('2026-06-17T01:00:00Z') },
    { label: 'Argentina vs Austria',  info: '22 jun · 14:00 ARG', start: new Date('2026-06-22T17:00:00Z') },
    { label: 'Jordania vs Argentina', info: '27 jun · 23:00 ARG', start: new Date('2026-06-28T02:00:00Z') },
  ];
  const MATCH_DURATION = 2 * 60 * 60 * 1000; // 2 horas

  // — Partículas —
  function initParticles() {
    const container = document.getElementById('header-particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'hparticle';
      const size     = Math.random() * 4 + 1.5;
      const x        = Math.random() * 100;
      const delay    = Math.random() * 10;
      const duration = Math.random() * 7 + 7;
      const opacity  = Math.random() * 0.35 + 0.08;
      p.style.cssText = `left:${x}%;width:${size}px;height:${size}px;opacity:${opacity};animation-delay:${delay}s;animation-duration:${duration}s;`;
      container.appendChild(p);
    }
  }

  // — Countdown —
  function pad(n) { return String(Math.max(0, Math.floor(n))).padStart(2, '0'); }

  function setDigit(el, val) {
    if (!el || el.textContent === val) return;
    el.textContent = val;
    el.classList.remove('flip');
    void el.offsetHeight;
    el.classList.add('flip');
  }

  function initCountdown() {
    const matchEl  = document.getElementById('countdown-match');
    const infoEl   = document.getElementById('countdown-info');
    const digitsEl = document.getElementById('countdown-digits');
    const daysEl   = document.getElementById('cd-days');
    const hoursEl  = document.getElementById('cd-hours');
    const minsEl   = document.getElementById('cd-mins');
    const secsEl   = document.getElementById('cd-secs');
    if (!matchEl || !digitsEl) return;

    function tick() {
      const now     = Date.now();
      const ongoing = ARG_MATCHES.find(m => now >= m.start.getTime() && now < m.start.getTime() + MATCH_DURATION);
      const next    = ARG_MATCHES.find(m => m.start.getTime() > now);

      if (ongoing) {
        matchEl.textContent = ongoing.label;
        if (infoEl) infoEl.textContent = ongoing.info;
        digitsEl.innerHTML  = '<div class="countdown-live"><span class="live-dot"></span> EN JUEGO</div>';
        return;
      }

      if (!next) {
        matchEl.textContent = 'Fase Eliminatoria';
        if (infoEl) infoEl.textContent = '';
        digitsEl.innerHTML  = '<div class="countdown-done">Grupos completados ✓</div>';
        return;
      }

      matchEl.textContent = next.label;
      if (infoEl) infoEl.textContent = next.info;

      const diff  = next.start.getTime() - now;
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const secs  = Math.floor((diff % 60000) / 1000);

      setDigit(daysEl,  pad(days));
      setDigit(hoursEl, pad(hours));
      setDigit(minsEl,  pad(mins));
      setDigit(secsEl,  pad(secs));
    }

    tick();
    setInterval(tick, 1000);
  }

  initParticles();
  initCountdown();
})();
