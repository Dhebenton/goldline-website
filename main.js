(function () {
  const DURATION = 600; 
  const ease = t => 1 - Math.pow(1 - t, 3); 

  let target = window.scrollY;
  let current = window.scrollY;
  let rafId = null;
  let startY = 0;
  let startTime = 0;

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased = ease(progress);
    current = startY + (target - startY) * eased;
    window.scrollTo(0, current);
    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      current = target;
      rafId = null;
    }
  }

  window.addEventListener('wheel', e => {
    e.preventDefault();
    target = Math.max(0, Math.min(
      target + e.deltaY,
      document.documentElement.scrollHeight - window.innerHeight
    ));
    startY = current;
    startTime = performance.now();
    if (!rafId) rafId = requestAnimationFrame(animate);
  }, { passive: false });
})();


// ============================================================
//  NAV — hide on scroll down, show on scroll up
// ============================================================

(function () {
  const nav = document.querySelector('nav');
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;

    nav.style.transform = currentY > lastY ? 'translateY(-100%)' : 'translateY(0)';

    nav.style.borderBottom = (currentY > 0 || window.innerWidth < 530)
      ? '1px solid rgba(0, 0, 0, 0.06)'
      : '1px solid rgba(0, 0, 0, 0.0)';

    lastY = currentY;
  }, { passive: true });
})();


// ============================================================
//  PHILOSOPHY SCROLL
// ============================================================

(function () {
  function initPhilosophyScroll() {
    const philSection = document.querySelector('#phillosophy-section');
    if (!philSection) return;

    const h2   = philSection.querySelector('h2');
    const tag  = philSection.querySelector('.tag');
    const imgs = Array.from(philSection.querySelectorAll('img')).filter(
      img => getComputedStyle(img).display !== 'none'
    );

    tag.style.opacity = '0';
    tag.style.filter  = 'blur(5px)';

    const block = philSection.querySelector('.block');
    if (block) block.style.transform = 'translateY(0%)';

    const isPhilMobile  = window.innerWidth < 1024;
    const revealOrder   = [...imgs].sort(() => Math.random() - 0.5);

    imgs.forEach(img => {
      const isLarge =
        (img.classList.contains('two') || img.classList.contains('five')) &&
        !isPhilMobile;

      img._startY    = isLarge ? 640 + Math.random() * 40 : 270 + Math.random() * 40;
      img._endY      = isLarge ? -50 : 0;
      img._threshold = (revealOrder.indexOf(img) + 1) / (revealOrder.length + 1);

      const sign     = Math.random() < 0.5 ? -1 : 1;
      img._targetRot = sign * (3 * Math.random());

      img.style.height    = `${67 + Math.random() * 5}px`;
      img.style.width     = 'auto';
      img.style.opacity   = '0';
      img.style.filter    = 'blur(8px)';
      img.style.transform = `translateY(${img._startY}%) rotate(0deg)`;
    });

    h2.innerHTML = h2.textContent
      .split('')
      .map(char => char === ' ' ? ' ' : `<span style="opacity:0;filter:blur(3px)">${char}</span>`)
      .join('');

    const spans        = h2.querySelectorAll('span');
    const totalItems   = spans.length + 1;
    const tagRevealEnd = 1 / totalItems;
    const SECTION_OFFSET = philSection.offsetHeight * 0.06;
    const imgDelay     = 0.12;
    const imgScale     = 1 / (1 - imgDelay);

    window.addEventListener('scroll', () => {
      const rect     = philSection.getBoundingClientRect();
      const total    = philSection.offsetHeight - window.innerHeight * 0.3;
      const scrolled = -rect.top + window.innerHeight * 0.5 - SECTION_OFFSET;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);

      if (block) {
        block.style.transform = `translateY(${progress * -60}%)`;
      }

      tag.style.opacity = progress >= tagRevealEnd ? '1' : '0';
      tag.style.filter  = progress >= tagRevealEnd ? 'blur(0px)' : 'blur(4px)';

      const revealUpTo = Math.floor(progress * totalItems) - 1;
      spans.forEach((span, i) => {
        span.style.opacity = i < revealUpTo ? '1' : '0';
        span.style.filter  = i < revealUpTo ? 'blur(0px)' : 'blur(2px)';
      });

      const imgProgress = Math.min(Math.max((progress - imgDelay) * imgScale, 0), 1);

      revealOrder.forEach(img => {
        const translateY = img._startY + imgProgress * (img._endY - img._startY);
        img.style.transform = `translateY(${translateY}%) rotate(${imgProgress * img._targetRot}deg)`;
        img.style.opacity   = imgProgress >= img._threshold ? '1' : '0';
        img.style.filter    = imgProgress >= img._threshold ? 'blur(0px)' : 'blur(8px)';
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhilosophyScroll);
  } else {
    initPhilosophyScroll();
  }
})();


// ============================================================
//  ABOUT SCROLL
// ============================================================

(function () {
  function initAboutScroll() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const paras = document.querySelectorAll('#about-section .about-us-text-wrap p');
    if (!paras.length) return;

    paras.forEach(p => {
      Array.from(p.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag  = document.createDocumentFragment();
          const parts = isMobile
            ? node.textContent.split(/(\s+)/)
            : [...node.textContent].map(ch => ch);

          parts.forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part) || part === ' ' || part === '\n') {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className   = 'char reveal-text-dark';
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          node.replaceWith(frag);

        } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('grey')) {
          const parts = node.innerHTML.split(/(<br\s*\/?>)/gi);
          node.innerHTML = parts.map(part => {
            if (/^<br/i.test(part)) return part;
            if (isMobile) {
              return part.split(/(\s+)/).map(w =>
                !w || /^\s+$/.test(w) ? w : `<span class="char reveal-text-grey">${w}</span>`
              ).join('');
            } else {
              return [...part].map(ch =>
                ch === ' ' ? ' ' : `<span class="char reveal-text-grey">${ch}</span>`
              ).join('');
            }
          }).join('');
        }
      });
    });

    const aboutSection = document.querySelector('#about-section');
    if (!aboutSection) return;

    const img      = aboutSection.querySelector('.about-us-text-wrap img');
    const allChars = Array.from(
      aboutSection.querySelectorAll('.about-us-text-wrap p .char')
    ).filter(el => el.offsetParent !== null);

    const total = allChars.length;
    if (!total) return;

    const revealed  = new Uint8Array(total);
    let imgRevealed = false;
    let lastCount   = -1;
    let aboutRafId  = null;
    let sectionTop  = 0;

    function cacheBounds() {
      sectionTop = aboutSection.getBoundingClientRect().top + window.scrollY;
    }

    cacheBounds();

    function update() {
      aboutRafId = null;
      const rectTop  = sectionTop - window.scrollY;
      const windowH  = window.innerHeight;
      const progress = Math.min(1, Math.max(0,
        (windowH * 0.58 - rectTop) / (windowH * 0.46)
      ));
      const count = Math.round(progress * total);

      if (count !== lastCount) {
        if (count > lastCount) {
          for (let i = Math.max(0, lastCount); i < count; i++) {
            if (!revealed[i]) { allChars[i].classList.add('revealed'); revealed[i] = 1; }
          }
        } else {
          for (let i = lastCount - 1; i >= count; i--) {
            if (revealed[i]) { allChars[i].classList.remove('revealed'); revealed[i] = 0; }
          }
        }
        lastCount = count;
      }

      if (img) {
        if (count === total && !imgRevealed)   { img.classList.add('revealed');    imgRevealed = true;  }
        else if (count < total && imgRevealed) { img.classList.remove('revealed'); imgRevealed = false; }
      }
    }

    function onAboutScroll() {
      if (aboutRafId) return;
      aboutRafId = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onAboutScroll, { passive: true });
    window.addEventListener('resize', () => { cacheBounds(); lastCount = -1; onAboutScroll(); }, { passive: true });
    onAboutScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutScroll);
  } else {
    initAboutScroll();
  }
})();


// ============================================================
//  PORTFOLIO — intersection reveal
// ============================================================

(function () {
  function initPortfolio() {
    const cards = document.querySelectorAll('.portfolio-card');
    if (!cards.length) return;

    const defaultObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('outview');
          defaultObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });

    const twoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('outview');
          twoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 1, rootMargin: '0px 0px -80px 0px' });

    cards.forEach(card => {
      (card.classList.contains('two') ? twoObserver : defaultObserver).observe(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio);
  } else {
    initPortfolio();
  }
})();


// ============================================================
//  FAQ — hover to expand
// ============================================================

(function () {
  function initFaq() {
    const faqs = document.querySelectorAll('.faq');
    if (!faqs.length) return;

    function setActive(faq) {
      faqs.forEach(f => {
        f.classList.remove('active');
        f.querySelector('.answer-wrap').style.height = '0px';
      });
      faq.classList.add('active');
      const answerWrap = faq.querySelector('.answer-wrap');
      answerWrap.style.height = answerWrap.querySelector('p').offsetHeight + 6 + 'px';
    }

    setActive(faqs[0]);
    faqs.forEach(faq => faq.addEventListener('mouseenter', () => setActive(faq)));
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
//  FOOTER — sticky height + above class
// ============================================================

(function () {
  function initFooter() {
    const footer   = document.querySelector('footer');
    const services = document.getElementById('services-section');
    if (!footer) return;

    new ResizeObserver(() => {
      document.body.style.paddingBottom = footer.offsetHeight + 'px';
    }).observe(footer);

    if (services) {
      new IntersectionObserver(entries => {
        entries.forEach(entry => {
          footer.classList.toggle('above',
            !entry.isIntersecting && entry.boundingClientRect.top < 0
          );
        });
      }, { threshold: 0 }).observe(services);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    initFooter();
  }
})();


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

    // Dots
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

    // Autoplay
    function startAutoplay() {
      clearTimeout(autoTimer);
      const next = current >= N - 1 ? 0 : current + 1;
      autoTimer = setTimeout(() => { snapTo(next); startAutoplay(); }, AUTOPLAY_MS);
    }

    function resetAutoplay() { clearTimeout(autoTimer); startAutoplay(); }

    // Pause on hover
    track.addEventListener('mouseenter', () => {
      clearTimeout(autoTimer);
      if (indicatorEl) indicatorEl.classList.add('is-paused');
    });
    track.addEventListener('mouseleave', () => {
      if (indicatorEl) indicatorEl.classList.remove('is-paused');
      if (!dragging) startAutoplay();
    });

    // Mouse drag
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
      document.body.style.userSelect        = '';
      document.body.style.pointerEvents     = '';
      track.style.pointerEvents             = '';
      momentum();
    });

    // Touch drag
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

    track.addEventListener('touchend', () => { dragging = false; momentum(); });

    // Wheel
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

    // Keyboard
    const sliderRef = { track, snapTo, resetAutoplay, getCurrent: () => current };
    sliders.push(sliderRef);

    new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) activeSlider = sliderRef; });
    }, { threshold: 0.7 }).observe(track);

    // Momentum
    function momentum() {
      const FLICK_VEL = 0.4;
      if (Math.abs(velX) > FLICK_VEL) {
        snapTo(Math.max(0, Math.min(velX < 0 ? current + 1 : current - 1, N - 1)));
        resetAutoplay();
        return;
      }
      let vel = -velX * 18;
      function step() {
        if (Math.abs(vel) < 0.5 || offset <= 0 || offset >= cachedMaxOffset) {
          snapToNearest(); resetAutoplay(); return;
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

    function updateVisibility() {
      items.forEach((el, i) => {
        const isPast = (cachedOffsets[i] + cachedWidths[i]) <= offset + 8;
        el.classList.toggle('is-past', isPast);
        el.querySelectorAll('.card, .blog-card-wrap').forEach(c => c.classList.toggle('is-past', isPast));
      });
    }

    window.addEventListener('resize', () => { cacheLayout(); snapTo(current, false); }, { passive: true });

    cacheLayout();
    applyOffset(0, false);
    updateDots();
    updateVisibility();

    new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { startAutoplay(); } });
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

    const blogSection   = document.getElementById('blog-section');
    const blogTrack     = document.getElementById('blogTrack');
    const blogIndicator = blogSection?.querySelector('.slider-indicator');
    if (blogTrack) { initSlider(blogTrack, blogIndicator, { autoplay: 4000 }); guardLinks(blogTrack); }
  });
})();
