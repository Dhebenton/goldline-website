(function () {
  function initPhilosophyScroll() {
    const philSection = document.querySelector('#phillosophy-section');
    if (!philSection) return;

    const h2 = philSection.querySelector('h2');
    const tag = philSection.querySelector('.tag');
    const imgs = Array.from(philSection.querySelectorAll('img')).filter(
      img => getComputedStyle(img).display !== 'none'
    );

    tag.style.opacity = '0';
    tag.style.filter = 'blur(5px)';

    const block = philSection.querySelector('.block');
    if (block) block.style.transform = 'translateY(0%)';

    const isPhilMobile = window.innerWidth < 1024;
    const revealOrder = [...imgs].sort(() => Math.random() - 0.5);

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
      .map(char =>
        char === ' '
          ? ' '
          : `<span style="opacity:0;filter:blur(3px)">${char}</span>`
      )
      .join('');

    const spans        = h2.querySelectorAll('span');
    const totalItems   = spans.length + 1;
    const tagRevealEnd = 1 / totalItems;
    const SECTION_OFFSET = philSection.offsetHeight * 0.06;
    const imgDelay     = 0.12;
    const imgScale     = 1 / (1 - imgDelay);

    window.addEventListener(
      'scroll',
      () => {
        const rect     = philSection.getBoundingClientRect();
        const total    = philSection.offsetHeight - window.innerHeight * 0.3;
        const scrolled = -rect.top + window.innerHeight * 0.5 - SECTION_OFFSET;
        const progress = Math.min(Math.max(scrolled / total, 0), 1);

        if (block) {
          const blockY = 0 + progress * -60;
          block.style.transform = `translateY(${blockY}%)`;
        }

        // Tag reveal
        if (progress >= tagRevealEnd) {
          tag.style.opacity = '1';
          tag.style.filter  = 'blur(0px)';
        } else {
          tag.style.opacity = '0';
          tag.style.filter  = 'blur(4px)';
        }

        const revealUpTo = Math.floor(progress * totalItems) - 1;
        spans.forEach((span, i) => {
          if (i < revealUpTo) {
            span.style.opacity = '1';
            span.style.filter  = 'blur(0px)';
          } else {
            span.style.opacity = '0';
            span.style.filter  = 'blur(2px)';
          }
        });

        const imgProgress = Math.min(
          Math.max((progress - imgDelay) * imgScale, 0),
          1
        );

        revealOrder.forEach(img => {
          const translateY = img._startY + imgProgress * (img._endY - img._startY);

          const rotate = imgProgress * img._targetRot;

          img.style.transform = `translateY(${translateY}%) rotate(${rotate}deg)`;

          if (imgProgress >= img._threshold) {
            img.style.opacity = '1';
            img.style.filter  = 'blur(0px)';
          } else {
            img.style.opacity = '0';
            img.style.filter  = 'blur(8px)';
          }
        });
      },
      { passive: true }
    );
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhilosophyScroll);
  } else {
    initPhilosophyScroll();
  }
})();