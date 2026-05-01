(function () {
  const slider = document.querySelector('.blog-slider');
  if (!slider) return;

  // ── Setup ────────────────────────────────────────────────────
  const cards = Array.from(slider.querySelectorAll('.blog-card'));

  cards.forEach(card => {
    card.querySelectorAll('img, a').forEach(el => el.setAttribute('draggable', 'false'));
  });

  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img, a').forEach(el => el.setAttribute('draggable', 'false'));
    slider.appendChild(clone);
  });

  // ── State ────────────────────────────────────────────────────
  let x = 0;
  let pointerStartX = 0;
  let pointerX = 0;
  let hasDragged = false;
  let vx = 0;
  let lastX = 0;
  let lastTime = 0;
  let rafId = null;

  const DRAG_THRESHOLD = 6;
  const SNAP_EASE = 0.1;

  // ── Helpers ──────────────────────────────────────────────────
  function getSetWidth() {
    const gap = parseFloat(getComputedStyle(slider).gap) || 0;
    return cards.reduce((w, card) => w + card.offsetWidth + gap, 0);
  }

  function getCardWidth() {
    const gap = parseFloat(getComputedStyle(slider).gap) || 0;
    return cards[0].offsetWidth + gap;
  }

  function applyX(val) {
    const w = getSetWidth();
    x = val;
    if (x <= -w) x += w;
    if (x > 0) x -= w;
    slider.style.transform = `translateX(${x}px)`;
  }

  // ── Snap ─────────────────────────────────────────────────────
  function snap(velocity) {
    cancelAnimationFrame(rafId);
    const cardW = getCardWidth();

    const target = Math.abs(velocity) > 1
      ? velocity < 0
        ? Math.floor(x / cardW) * cardW
        : Math.ceil(x / cardW) * cardW
      : Math.round(x / cardW) * cardW;

    function tick() {
      const delta = (target - x) * SNAP_EASE;
      if (Math.abs(delta) < 0.15) {
        applyX(target);
        return;
      }
      applyX(x + delta);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  // ── Click guard ──────────────────────────────────────────────
  slider.addEventListener('click', (e) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // ── Mouse ────────────────────────────────────────────────────
  slider.addEventListener('mousedown', (e) => {
    hasDragged = false;
    pointerStartX = e.clientX;
    pointerX = e.clientX;
    lastX = e.clientX;
    lastTime = performance.now();
    vx = 0;
    cancelAnimationFrame(rafId);

    function onMove(e) {
      const totalDx = Math.abs(e.clientX - pointerStartX);

      if (totalDx > DRAG_THRESHOLD) hasDragged = true;

      if (hasDragged) slider.style.cursor = 'grabbing';

      if (!hasDragged) return;

      const now = performance.now();
      const dt = now - lastTime || 1;
      vx = (e.clientX - lastX) / dt * 16;
      lastX = e.clientX;
      lastTime = now;

      applyX(x + (e.clientX - pointerX));
      pointerX = e.clientX;
    }

    function onUp() {
      slider.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (hasDragged) snap(vx);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });

  // ── Touch ────────────────────────────────────────────────────
  slider.addEventListener('touchstart', (e) => {
    hasDragged = false;
    pointerStartX = e.touches[0].clientX;
    pointerX = e.touches[0].clientX;
    lastX = e.touches[0].clientX;
    lastTime = performance.now();
    vx = 0;
    cancelAnimationFrame(rafId);
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    const totalDx = Math.abs(e.touches[0].clientX - pointerStartX);
    if (totalDx > DRAG_THRESHOLD) hasDragged = true;
    if (!hasDragged) return;

    const now = performance.now();
    const dt = now - lastTime || 1;
    vx = (e.touches[0].clientX - lastX) / dt * 16;
    lastX = e.touches[0].clientX;
    lastTime = now;

    applyX(x + (e.touches[0].clientX - pointerX));
    pointerX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    if (hasDragged) snap(vx);
  }, { passive: true });

  // ── Trackpad ─────────────────────────────────────────────────
  slider.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    cancelAnimationFrame(rafId);
    applyX(x - e.deltaX);
    snap(-e.deltaX);
  }, { passive: false });

})();