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