document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  //  CHAR SPLITTING
  // ============================================================

  const paras = document.querySelectorAll('#about-section .about-us-text-wrap p');

  if (!paras.length) return;

  paras.forEach(p => {
    Array.from(p.childNodes).forEach(node => {

      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();

        [...node.textContent].forEach(ch => {
          if (ch === ' ' || ch === '\n') {
            frag.appendChild(document.createTextNode(ch));
          } else {
            const span = document.createElement('span');
            span.className = 'char reveal-text-dark';
            span.textContent = ch;
            frag.appendChild(span);
          }
        });

        node.replaceWith(frag);

      } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('grey')) {
        const parts = node.innerHTML.split(/(<br\s*\/?>)/gi);

        node.innerHTML = parts.map(part => {
          if (/^<br/i.test(part)) return part;

          return [...part].map(ch =>
            ch === ' ' ? ' ' : `<span class="char reveal-text-grey">${ch}</span>`
          ).join('');
        }).join('');
      }

    });
  });


  // ============================================================
  //  SCROLL REVEAL
  // ============================================================

  const section = document.querySelector('#about-section');

  if (!section || !paras[0] || !paras[1]) return;

  const allChars = [
    ...paras[0].querySelectorAll('.char'),
    ...paras[1].querySelectorAll('.char'),
  ];

  let ticking = false;

  function onScroll() {
    if (ticking) return;

    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      const start = windowH * 0.79;
      const end = windowH * 0.14;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const toReveal = Math.floor(progress * allChars.length);

      allChars.forEach((char, i) => {
        char.classList.toggle('revealed', i < toReveal);
      });

      ticking = false;
    });

    ticking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

});