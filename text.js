document.addEventListener('DOMContentLoaded', () => {

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // ============================================================
  //  SPLITTING
  // ============================================================

  const paras = document.querySelectorAll('#about-section .about-us-text-wrap p');
  if (!paras.length) return;

  paras.forEach(p => {
    Array.from(p.childNodes).forEach(node => {

      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const parts = isMobile
          ? node.textContent.split(/(\s+)/)
          : [...node.textContent].map(ch => ch);

        parts.forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part) || part === ' ' || part === '\n') {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className = 'char reveal-text-dark';
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

  // ============================================================
  //  SCROLL REVEAL
  // ============================================================

  const section = document.querySelector('#about-section');
  if (!section) return;

  const img = section.querySelector('.about-us-text-wrap img');

  const allChars = Array.from(
    section.querySelectorAll('.about-us-text-wrap p .char')
  ).filter(el => el.offsetParent !== null);

  const total = allChars.length;
  if (!total) return;

  const revealed = new Uint8Array(total);
  let imgRevealed = false;

  let lastCount = -1;
  let rafId = null;
  let sectionTop = 0;

  function cacheBounds() {
    sectionTop = section.getBoundingClientRect().top + window.scrollY;
  }

  cacheBounds();

  function update() {
    rafId = null;

    const rectTop  = sectionTop - window.scrollY;
    const windowH  = window.innerHeight;
    const start    = windowH * 0.89;
    const end      = windowH * 0.16;
    const progress = Math.min(1, Math.max(0, (start - rectTop) / (start - end)));
    const count    = Math.round(progress * total);

    if (count !== lastCount) {
      if (count > lastCount) {
        for (let i = Math.max(0, lastCount); i < count; i++) {
          if (!revealed[i]) {
            allChars[i].classList.add('revealed');
            revealed[i] = 1;
          }
        }
      } else {
        for (let i = lastCount - 1; i >= count; i--) {
          if (revealed[i]) {
            allChars[i].classList.remove('revealed');
            revealed[i] = 0;
          }
        }
      }
      lastCount = count;
    }

    // Reveal img only after all chars are revealed, hide if scrolling back
    if (img) {
      if (count === total && !imgRevealed) {
        img.classList.add('revealed');
        imgRevealed = true;
      } else if (count < total && imgRevealed) {
        img.classList.remove('revealed');
        imgRevealed = false;
      }
    }
  }

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    cacheBounds();
    lastCount = -1;
    onScroll();
  }, { passive: true });

  onScroll();
});