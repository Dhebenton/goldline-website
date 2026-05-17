// ============================================================
//  SLIDER
//  Usage: <script src="slider.js" defer></script>
// ============================================================

(function () {
  function initSlider(track, indicatorEl, options = {}) {
    const AUTOPLAY_MS = options.autoplay ?? 3000;
    const THRESHOLD   = options.threshold ?? 0.7;

    const items = Array.from(track.children);
    const N     = items.length;

    let offset    = 0;
    let current   = 0;
    let dragging  = false;
    let startX    = 0;
    let startOff  = 0;
    let lastX     = 0;
    let lastT     = 0;
    let velX      = 0;
    let rafId     = null;
    let autoTimer = null;

    // ---- Cached layout values (invalidated on resize) ----
    let cachedOffsets  = [];
    let cachedWidths   = [];
    let cachedMaxOffset = 0;

    function cacheLayout() {
      cachedOffsets   = items.map(el => el.offsetLeft);
      cachedWidths    = items.map(el => el.offsetWidth);
      cachedMaxOffset = Math.max(0, cachedOffsets[N - 1]);
    }

    function maxOffset() {
      return cachedMaxOffset;
    }

    function applyOffset(x, animate) {
      offset = Math.max(0, Math.min(x, maxOffset()));
      if (animate) track.classList.add('is-snapping');
      else         track.classList.remove('is-snapping');
      track.style.transform = `translateX(${-offset}px)`;
      updateVisibility();
    }

    function snapTo(index, animate = true) {
      current = Math.max(0, Math.min(index, N - 1));
      applyOffset(cachedOffsets[current], animate);
      updateDots();
    }

    function nearestIndex() {
      let best = 0, bestDist = Infinity;
      cachedOffsets.forEach((left, i) => {
        const d = Math.abs(left - offset);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function snapToNearest() { snapTo(nearestIndex(), true); }

    // ---- Dots ----
    if (indicatorEl) {
      indicatorEl.innerHTML = '';
      items.forEach((_, i) => {
        const pip = document.createElement('div');
        pip.addEventListener('click', () => { resetAutoplay(); snapTo(i); });
        indicatorEl.appendChild(pip);
      });
    }

    function updateDots() {
      if (!indicatorEl) return;
      Array.from(indicatorEl.children).forEach((pip, i) => {
        const wasActive = pip.classList.contains('active');
        pip.classList.toggle('past', i < current);
        if (i === current && !wasActive) {
          pip.classList.remove('active');
          void pip.offsetWidth;
          pip.classList.add('active');
        } else if (i !== current) {
          pip.classList.remove('active');
        }
      });
    }

    function updateDotsFromOffset() {
      const n = nearestIndex();
      if (n !== current) { current = n; updateDots(); }
    }

    // ---- Autoplay ----
    function startAutoplay() {
      clearTimeout(autoTimer);
      // Loop back to 0 when at the end instead of stopping
      const next = current >= N - 1 ? 0 : current + 1;
      autoTimer = setTimeout(() => {
        snapTo(next);
        startAutoplay();
      }, AUTOPLAY_MS);
    }

    function resetAutoplay() {
      clearTimeout(autoTimer);
      startAutoplay();
    }

    // ---- Pause on hover (slider + indicator animation) ----
    track.addEventListener('mouseenter', () => {
      clearTimeout(autoTimer);
      if (indicatorEl) indicatorEl.classList.add('is-paused');
    });
    track.addEventListener('mouseleave', () => {
      if (indicatorEl) indicatorEl.classList.remove('is-paused');
      if (!dragging) startAutoplay();
    });

    // ---- Mouse drag ----
    track.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      track.classList.add('is-dragging');
      document.documentElement.style.cursor = 'grabbing';
      document.body.style.userSelect         = 'none';
      document.body.style.pointerEvents      = 'none';
      track.style.pointerEvents              = 'auto';
      dragging = true;
      startX = lastX = e.clientX;
      startOff = offset;
      lastT = performance.now();
      velX  = 0;
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const now = performance.now();
      velX  = (e.clientX - lastX) / (now - lastT + 1);
      lastX = e.clientX; lastT = now;
      applyOffset(startOff - (e.clientX - startX), false);
      updateDotsFromOffset();
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      document.documentElement.style.cursor = '';
      document.body.style.userSelect         = '';
      document.body.style.pointerEvents      = '';
      track.style.pointerEvents              = '';
      momentum();
    });

    // ---- Touch drag ----
    track.addEventListener('touchstart', e => {
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      const t = e.touches[0];
      dragging = true;
      startX = lastX = t.clientX;
      startOff = offset;
      lastT = performance.now();
      velX  = 0;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      if (!dragging) return;
      const t = e.touches[0], now = performance.now();
      velX  = (t.clientX - lastX) / (now - lastT + 1);
      lastX = t.clientX; lastT = now;
      applyOffset(startOff - (t.clientX - startX), false);
      updateDotsFromOffset();
    }, { passive: true });

    track.addEventListener('touchend', () => {
      dragging = false;
      momentum();
    });

    // ---- Wheel ----
    track.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      applyOffset(offset + e.deltaX, false);
      updateDotsFromOffset();
      clearTimeout(track._wheelTimer);
      track._wheelTimer = setTimeout(() => {
        snapToNearest();
        resetAutoplay();
      }, 120);
    }, { passive: false });

    // ---- Keyboard (active slider tracking) ----
    const sliderRef = { track, snapTo, resetAutoplay, getCurrent: () => current };
    sliders.push(sliderRef);

    const keyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeSlider = sliderRef;
      });
    }, { threshold: 0.7 });
    keyObserver.observe(track);

    // ---- Momentum with velocity threshold ----
    function momentum() {
      const dragDist = Math.abs(offset - startOff);
      const FLICK_VEL = 0.4; // px/ms — above this always moves one slide

      // Fast flick: jump one slide in the flick direction regardless of distance
      if (Math.abs(velX) > FLICK_VEL) {
        const target = velX < 0 ? current + 1 : current - 1;
        snapTo(Math.max(0, Math.min(target, N - 1)));
        resetAutoplay();
        return;
      }

      // Slow drag: decay into nearest
      let vel = -velX * 18;
      function step() {
        if (Math.abs(vel) < 0.5 || offset <= 0 || offset >= maxOffset()) {
          snapToNearest();
          resetAutoplay();
          return;
        }
        vel *= 0.94;
        applyOffset(offset + vel, false);
        updateDotsFromOffset();
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    track.addEventListener('transitionend', () => {
      track.classList.remove('is-snapping');
      updateVisibility();
    });

    // ---- Visibility (uses cached values) ----
    function updateVisibility() {
      items.forEach((el, i) => {
        const isPast = (cachedOffsets[i] + cachedWidths[i]) <= offset + 8;
        el.classList.toggle('is-past', isPast);
        el.querySelectorAll('.card, .blog-card-wrap').forEach(c => c.classList.toggle('is-past', isPast));
      });
    }

    // ---- Resize: re-cache and re-snap ----
    window.addEventListener('resize', () => {
      cacheLayout();
      snapTo(current, false);
    }, { passive: true });

    // ---- Init ----
    cacheLayout();
    applyOffset(0, false);
    updateDots();
    updateVisibility();

    // Start autoplay when slider scrolls into view
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAutoplay();
          observer.disconnect();
        }
      });
    }, { threshold: THRESHOLD });
    observer.observe(track);
  }

  const sliders = [];
  let activeSlider = null;

  document.addEventListener('keydown', e => {
    if (!activeSlider) return;
    if (e.key === 'ArrowRight') { activeSlider.resetAutoplay(); activeSlider.snapTo(activeSlider.getCurrent() + 1); }
    if (e.key === 'ArrowLeft')  { activeSlider.resetAutoplay(); activeSlider.snapTo(activeSlider.getCurrent() - 1); }
  });

  function guardLinks(track) {
    let startX = 0, startY = 0;
    track.addEventListener('pointerdown', e => {
      startX = e.clientX;
      startY = e.clientY;
    }, { passive: true });
    track.addEventListener('click', e => {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > 6 || dy > 6) e.preventDefault();
    }, true);
  }

  window.addEventListener('load', () => {
    const principlesTrack     = document.getElementById('sliderTrack');
    const principlesIndicator = document.getElementById('indicator');
    if (principlesTrack) { initSlider(principlesTrack, principlesIndicator); guardLinks(principlesTrack); }

    const blogSection   = document.getElementById('blog-section');
    const blogTrack     = document.getElementById('blogTrack');
    const blogIndicator = blogSection?.querySelector('.slider-indicator');
    if (blogTrack) { initSlider(blogTrack, blogIndicator, { autoplay: 4000 }); guardLinks(blogTrack); }
  });
})();