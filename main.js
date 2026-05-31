// ============================================================
//  PHILOSOPHY SCROLL
// ============================================================

(function () {
  function initPhilosophyScroll() {
    const philSection = document.querySelector('#scroll-sec');
    if (!philSection) return;

    const h2   = philSection.querySelector('h2');
    const tag  = philSection.querySelector('.t');
    const imgs = Array.from(philSection.querySelectorAll('img')).filter(
      img => getComputedStyle(img).display !== 'none'
    );

    tag.style.opacity = '0';
    tag.style.filter  = 'blur(5px)';

    const block = philSection.querySelector('.blk');
    if (block) block.style.transform = 'translateY(0%)';

    const isPhilMobile = window.innerWidth < 1052;
    const revealOrder  = [...imgs].sort(() => Math.random() - 0.5);

    imgs.forEach(img => {
      const isLarge =
        (img.classList.contains('four') || img.classList.contains('six')) &&
        !isPhilMobile;

      img._startY    = isLarge ? 600 + Math.random() * 40 : 270 + Math.random() * 40;
      img._endY      = isLarge ? -50 : 0;
      img._threshold = (revealOrder.indexOf(img) + 1) / (revealOrder.length + 1);
      img._startRot  = (Math.random() * 4) - 2;

      const targetSign = Math.random() < 0.5 ? -1 : 1;
      img._targetRot   = targetSign * (5 * Math.random());

      img.style.height    = `${(isPhilMobile ? 57 : 55) + Math.random() * 5}px`;
      img.style.width     = 'auto';
      img.style.opacity   = '0';
      img.style.filter    = 'blur(8px)';
      img.style.transform = `translateY(${img._startY}%) rotate(${img._startRot}deg)`;
    });

    if (isPhilMobile) {
      h2.innerHTML = h2.textContent
        .split(' ')
        .map(word => `<span style="opacity:0;filter:blur(3px)">${word}</span>`)
        .join(' ');
    } else {
      h2.innerHTML = h2.textContent
        .split('')
        .map(char => char === ' ' ? ' ' : `<span style="opacity:0;filter:blur(3px)">${char}</span>`)
        .join('');
    }

    const spans        = h2.querySelectorAll('span');
    const totalItems   = spans.length + 1;
    const tagRevealEnd = 1 / totalItems;
    const SECTION_OFFSET = philSection.offsetHeight * 0.06;
    const imgDelay     = 0.12;
    const imgScale     = 1 / (1 - imgDelay);

    window.addEventListener('scroll', () => {
      const rect     = philSection.getBoundingClientRect();
      const total    = (philSection.offsetHeight - window.innerHeight * 0.3) * 0.9;
      const scrolled = -rect.top + window.innerHeight * 0.5 - SECTION_OFFSET;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);

      if (block) {
        block.style.transform = `translateY(${progress * - 40}%)`;
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
        const rotate     = img._startRot + imgProgress * (img._targetRot - img._startRot);
        img.style.transform = `translateY(${translateY}%) rotate(${rotate}deg)`;
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

    const paras = document.querySelectorAll('#ab-sec .autw p');
    if (!paras.length) return;

    paras.forEach(p => {
      Array.from(p.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag  = document.createDocumentFragment();
          if (isMobile) {
            const parts = node.textContent.split(/(\s+)/);
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
          } else {
            const chars = [...node.textContent];
            let i = 0;
            while (i < chars.length) {
              if (chars[i] === ' ') {
                frag.appendChild(document.createTextNode(' '));
                i++;
              } else {
                // Pair two non-space chars, but don't let a pair straddle a space
                const pair = chars[i + 1] && chars[i + 1] !== ' ' ? chars[i] + chars[i + 1] : chars[i];
                const span = document.createElement('span');
                span.className   = 'char reveal-text-dark';
                span.textContent = pair;
                frag.appendChild(span);
                i += pair.length;
              }
            }
          }
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
              const chars = [...part];
              let out = '';
              let i = 0;
              while (i < chars.length) {
                if (chars[i] === ' ') {
                  out += ' ';
                  i++;
                } else {
                  const pair = chars[i + 1] && chars[i + 1] !== ' ' ? chars[i] + chars[i + 1] : chars[i];
                  out += `<span class="char reveal-text-grey">${pair}</span>`;
                  i += pair.length;
                }
              }
              return out;
            }
          }).join('');
        }
      });
    });

    const aboutSection = document.querySelector('#ab-sec');
    if (!aboutSection) return;

    const img      = aboutSection.querySelector('.autw img');
    const allChars = Array.from(
      aboutSection.querySelectorAll('.autw p .char')
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
//  FAQ
// ============================================================

(function () {
  function initFaq() {
    const faqs = document.querySelectorAll('.faq');
    if (!faqs.length) return;

    const isMobile      = window.innerWidth < 1042;
    const isBelowMobile = window.innerWidth < 540;

    function getP(faq) {
      const answerWrap = faq.querySelector('.ans');
      return isBelowMobile
        ? answerWrap.querySelector('p.be-mo')
        : answerWrap.querySelector('p.n-mo');
    }

    function setActive(faq) {
      faqs.forEach(f => {
        f.classList.remove('active');
        f.querySelector('.ans').style.height = '0px';
      });
      faq.classList.add('active');
      const answerWrap = faq.querySelector('.ans');
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