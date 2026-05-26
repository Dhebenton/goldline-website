(function () {
  const nav = document.querySelector('nav');
  let lastY = window.scrollY;
  let wasScrolled = null;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const scrolled = currentY > 0 || window.innerWidth < 530;

    nav.style.transform = currentY > lastY ? 'translateY(-100%)' : 'translateY(0)';

    if (scrolled !== wasScrolled) {
      nav.style.borderColor = scrolled
        ? 'rgba(0, 0, 0, 0.07)'
        : 'rgba(0, 0, 0, 0.0)';
      nav.style.boxShadow = scrolled
        ? '0px 1px 3px 0px hsl(0, 0%, 0%, .04)'
        : '0px 1px 3px 0px hsl(0, 0%, 0%, .00)';
      wasScrolled = scrolled;
    }

    lastY = currentY;
  }, { passive: true });
})();

// ============================================================
//  FAQ
// ============================================================

(function () {
  function initFaq() {
    const faqs = document.querySelectorAll('.faq');
    if (!faqs.length) return;

    const isMobile      = window.innerWidth < 1042;
    const isBelowMobile = window.innerWidth < 540;

    function getP(faq) {
      const answerWrap = faq.querySelector('.a-w');
      return isBelowMobile
        ? answerWrap.querySelector('p.mob-below')
        : answerWrap.querySelector('p.mob-no');
    }

    function setActive(faq) {
      faqs.forEach(f => {
        f.classList.remove('active');
        f.querySelector('.a-w').style.height = '0px';
      });
      faq.classList.add('active');
      const answerWrap = faq.querySelector('.a-w');
      answerWrap.style.height = getP(faq).offsetHeight + 3 + 'px';
    }

    faqs.forEach(faq => {
      faq.addEventListener(isMobile ? 'click' : 'mouseenter', () => setActive(faq));
    });

    setTimeout(() => setActive(faqs[0]), 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();

// ============================================================
//  FADE OUT
// ============================================================

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

  e.preventDefault();
  document.body.classList.add('fade-out');

  setTimeout(() => {
    window.location.href = href;
  }, 500);
});

// ============================================================
//  SLIDER
// ============================================================

(function () {
  const sliders = [];
  let activeSlider = null;
  function initSlider(track, indicatorEl, options = {}) {
    const AUTOPLAY_MS = options.autoplay ?? 3000;
    const THRESHOLD   = options.threshold ?? 0.7;
    const items = Array.from(track.children);
    const N     = items.length;
    let offset         = 0;
    let current        = 0;
    let dragging       = false;
    let startX         = 0;
    let startOff       = 0;
    let lastX          = 0;
    let lastT          = 0;
    let velX           = 0;
    let rafId          = null;
    let autoTimer      = null;
    let cachedOffsets   = [];
    let cachedWidths    = [];
    let cachedMaxOffset = 0;
    function cacheLayout() {
      cachedOffsets   = items.map(el => el.offsetLeft);
      cachedWidths    = items.map(el => el.offsetWidth);
      cachedMaxOffset = Math.max(0, cachedOffsets[N - 1]);
    }
    function applyOffset(x, animate) {
      offset = Math.max(0, Math.min(x, cachedMaxOffset));
      track.classList.toggle('is-snapping', animate);
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
    function startAutoplay() {
      clearTimeout(autoTimer);
      const next = current >= N - 1 ? 0 : current + 1;
      autoTimer = setTimeout(() => { snapTo(next); startAutoplay(); }, AUTOPLAY_MS);
    }
    function resetAutoplay() { clearTimeout(autoTimer); startAutoplay(); }
    track.addEventListener('mouseenter', () => {
      clearTimeout(autoTimer);
      if (indicatorEl) indicatorEl.classList.add('is-paused');
    });
    track.addEventListener('mouseleave', () => {
      if (indicatorEl) indicatorEl.classList.remove('is-paused');
      if (!dragging) startAutoplay();
    });
    const VEL_WINDOW_MS = 80;
    const velBuf = [];
    function recordMove(clientX) {
      const now = performance.now();
      velBuf.push({ t: now, x: clientX });
      while (velBuf.length > 1 && now - velBuf[0].t > VEL_WINDOW_MS) velBuf.shift();
    }
    function computeVel() {
      if (velBuf.length < 2) return 0;
      const first = velBuf[0];
      const last  = velBuf[velBuf.length - 1];
      const dt    = last.t - first.t;
      return dt > 0 ? (last.x - first.x) / dt : 0;
    }
    function resetVelBuf(clientX) {
      velBuf.length = 0;
      velBuf.push({ t: performance.now(), x: clientX });
    }
    track.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      track.classList.add('is-dragging');
      document.documentElement.style.cursor = 'grabbing';
      document.body.style.userSelect        = 'none';
      document.body.style.pointerEvents     = 'none';
      track.style.pointerEvents             = 'auto';
      dragging = true;
      startX   = e.clientX;
      startOff = offset;
      resetVelBuf(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      recordMove(e.clientX);
      applyOffset(startOff - (e.clientX - startX), false);
      updateDotsFromOffset();
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      document.documentElement.style.cursor = '';
      document.body.style.userSelect        = '';
      document.body.style.pointerEvents     = '';
      track.style.pointerEvents             = '';
      velX = computeVel();
      momentum();
    });
    track.addEventListener('touchstart', e => {
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      const t = e.touches[0];
      dragging = true;
      startX   = t.clientX;
      startOff = offset;
      resetVelBuf(t.clientX);
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (!dragging) return;
      e.preventDefault();
      const t = e.touches[0];
      recordMove(t.clientX);
      applyOffset(startOff - (t.clientX - startX), false);
      updateDotsFromOffset();
    }, { passive: false });
    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      velX = computeVel();
      momentum();
    });
    track.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      cancelAnimationFrame(rafId);
      clearTimeout(autoTimer);
      track.classList.remove('is-snapping');
      applyOffset(offset + e.deltaX, false);
      updateDotsFromOffset();
      clearTimeout(track._wheelTimer);
      track._wheelTimer = setTimeout(() => { snapToNearest(); resetAutoplay(); }, 120);
    }, { passive: false });
    const sliderRef = { track, snapTo, resetAutoplay, getCurrent: () => current };
    sliders.push(sliderRef);
    new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) activeSlider = sliderRef; });
    }, { threshold: 0.5 }).observe(track);
    function momentum() {
      const FLICK_THRESHOLD = 0.3;
      const scrollVel = -velX;
      if (Math.abs(velX) > FLICK_THRESHOLD) {
        const next = scrollVel > 0
          ? Math.min(current + 1, N - 1)
          : Math.max(current - 1, 0);
        snapTo(next);
        resetAutoplay();
        return;
      }
      let vel = scrollVel * 120;
      const FRICTION = 0.90;
      function step() {
        if (Math.abs(vel) < 0.5 || offset <= 0 || offset >= cachedMaxOffset) {
          snapToNearest();
          resetAutoplay();
          return;
        }
        vel *= FRICTION;
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
    function updateVisibility() {
      if (window.innerWidth < 800) {
        items.forEach(el => {
          el.classList.remove('is-past');
          el.querySelectorAll('.card, .bcw').forEach(c => c.classList.remove('is-past'));
        });
        return;
      }
      items.forEach((el, i) => {
        const isPast = (cachedOffsets[i] + cachedWidths[i]) <= offset + 8;
        el.classList.toggle('is-past', isPast);
        el.querySelectorAll('.card, .bcw').forEach(c => c.classList.toggle('is-past', isPast));
      });
    }
    window.addEventListener('resize', () => {
      cacheLayout();
      applyOffset(cachedOffsets[current] ?? 0, false);
      updateDots();
    }, { passive: true });
    cacheLayout();
    applyOffset(0, false);
    updateDots();
    updateVisibility();
    new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) startAutoplay(); });
    }, { threshold: THRESHOLD }).observe(track);
  }
  document.addEventListener('keydown', e => {
    if (!activeSlider) return;
    if (e.key === 'ArrowRight') { activeSlider.resetAutoplay(); activeSlider.snapTo(activeSlider.getCurrent() + 1); }
    if (e.key === 'ArrowLeft')  { activeSlider.resetAutoplay(); activeSlider.snapTo(activeSlider.getCurrent() - 1); }
  });
  function guardLinks(track) {
    let startX = 0, startY = 0;
    track.addEventListener('pointerdown', e => { startX = e.clientX; startY = e.clientY; }, { passive: true });
    track.addEventListener('click', e => {
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) e.preventDefault();
    }, true);
  }
  window.addEventListener('load', () => {
    const principlesTrack     = document.getElementById('sliderTrack');
    const principlesIndicator = document.getElementById('indicator');
    if (principlesTrack) { initSlider(principlesTrack, principlesIndicator); guardLinks(principlesTrack); }
    const blogSection   = document.getElementById('articles');
    const blogTrack     = document.getElementById('blogTrack');
    const blogIndicator = blogSection?.querySelector('.slider-indicator');
    if (blogTrack) { initSlider(blogTrack, blogIndicator, { autoplay: 4000 }); guardLinks(blogTrack); }
  });
})();

// ============================================================
//  FAQ
// ============================================================

(function () {
  function initFaq() {
    const faqs = document.querySelectorAll('.faq');
    if (!faqs.length) return;

    const isMobile      = window.innerWidth < 1042;
    const isBelowMobile = window.innerWidth < 540;

    function getP(faq) {
      const answerWrap = faq.querySelector('.a-w');
      return isBelowMobile
        ? answerWrap.querySelector('p.mob-below')
        : answerWrap.querySelector('p.mob-no');
    }

    function setActive(faq) {
      faqs.forEach(f => {
        f.classList.remove('active');
        f.querySelector('.a-w').style.height = '0px';
      });
      faq.classList.add('active');
      const answerWrap = faq.querySelector('.a-w');
      answerWrap.style.height = getP(faq).offsetHeight + 3 + 'px';
    }

    faqs.forEach(faq => {
      faq.addEventListener(isMobile ? 'click' : 'mouseenter', () => setActive(faq));
    });

    setTimeout(() => setActive(faqs[0]), 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();


// ============================================================
//  FOOTER CLOCK
// ============================================================

(function () {
  function initClock() {
    const hand   = document.getElementById('hour-hand');
    const timeEl = document.querySelector('.time');
    if (!hand || !timeEl) return;

    const cx = 18, cy = 18, len = 11;
    const DEG_TO_RAD = Math.PI / 180;
    let lastSecond = -1;

    function updateClock() {
      const now     = new Date();
      const hours   = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const rad = ((((hours % 12) + minutes / 60 + seconds / 3600) * 30) - 90) * DEG_TO_RAD;
      hand.setAttribute('x2', cx + Math.cos(rad) * len);
      hand.setAttribute('y2', cy + Math.sin(rad) * len);

      if (seconds !== lastSecond) {
        timeEl.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')} local time`;
        lastSecond = seconds;
      }

      requestAnimationFrame(updateClock);
    }

    updateClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClock);
  } else {
    initClock();
  }
})();


// ============================================================
//  FOOTER — above class
// ============================================================

(function () {
  function initFooter() {
    const footer   = document.querySelector('footer');
    const services = document.getElementById('service-section');
    if (!footer || !services) return;

    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        footer.classList.toggle('above',
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        );
      });
    }, { threshold: 0 }).observe(services);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();

// ============================================================
//  CTA TYPEWRITER
// ============================================================

(function () {
  const el = document.getElementById('cta-typewriter');
  if (!el) return;

  const phrases = [
    "We'd love to hear from you",
    "The first step is a conversation",
    "We're taking on new projects",
    "We're ready to collaborate"
  ];

  const TYPE_MS   = 55;
  const DELETE_MS = 25;
  const PAUSE_MS  = 2600;
  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIndex);

      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_MS);
        return;
      }
      setTimeout(tick, TYPE_MS);
    } else {
      el.textContent = phrase.slice(0, --charIndex);

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, DELETE_MS);
    }
  }

  tick();
})();