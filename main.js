document.addEventListener('DOMContentLoaded', () => {

     const lenis = new Lenis({
     duration: .5,
     easing: t => 1 - Math.pow(1 - t, 3),
     smoothWheel: true,
     smoothTouch: true
});

function raf(time) {
     lenis.raf(time);
     requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

     // ============================================================
     //  ABOUT SECTION
     // ============================================================

     const isMobile = window.matchMedia('(max-width: 768px)').matches;

     const paras = document.querySelectorAll('#about-section .about-us-text-wrap p');
     if (paras.length) {

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

          const aboutSection = document.querySelector('#about-section');
          if (aboutSection) {
               const img = aboutSection.querySelector('.about-us-text-wrap img');
               const allChars = Array.from(
                    aboutSection.querySelectorAll('.about-us-text-wrap p .char')
               ).filter(el => el.offsetParent !== null);

               const total = allChars.length;
               if (total) {
                    const revealed = new Uint8Array(total);
                    let imgRevealed = false;
                    let lastCount = -1;
                    let rafId = null;
                    let sectionTop = 0;

                    function cacheBounds() {
                         sectionTop = aboutSection.getBoundingClientRect().top + window.scrollY;
                    }

                    cacheBounds();

                    function update() {
                         rafId = null;
                         const rectTop  = sectionTop - window.scrollY;
                         const windowH  = window.innerHeight;
                         const start    = windowH * 0.58;
                         const end      = windowH * 0.12;
                         const progress = Math.min(1, Math.max(0, (start - rectTop) / (start - end)));
                         const count    = Math.round(progress * total);

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
                              if (count === total && !imgRevealed) { img.classList.add('revealed'); imgRevealed = true; }
                              else if (count < total && imgRevealed) { img.classList.remove('revealed'); imgRevealed = false; }
                         }
                    }

                    function onAboutScroll() {
                         if (rafId) return;
                         rafId = requestAnimationFrame(update);
                    }

                    window.addEventListener('scroll', onAboutScroll, { passive: true });
                    window.addEventListener('resize', () => { cacheBounds(); lastCount = -1; onAboutScroll(); }, { passive: true });
                    onAboutScroll();
               }
          }
     }

     // ============================================================
     //  PHILOSOPHY SCROLL
     // ============================================================

     const philSection = document.querySelector('#phillosophy-scroll');
     if (philSection) {
          const h2 = philSection.querySelector('h2');
          const tag = philSection.querySelector('.tag');
          const imgs = Array.from(philSection.querySelectorAll('img')).filter(img =>
               getComputedStyle(img).display !== 'none'
          );

          tag.style.opacity = '0';
          tag.style.filter = 'blur(5px)';

          const isPhilMobile = window.innerWidth < 1024;

          const revealOrder = [...imgs].sort(() => Math.random() - 0.5);
          imgs.forEach(img => {
               const isLarge = (img.classList.contains('two') || img.classList.contains('five')) && !isPhilMobile;

               img._startY = isLarge ? (520 + Math.random() * 40) : (270 + Math.random() * 40);
               img._endY = isLarge ? -50 : 0;
               img._threshold = (revealOrder.indexOf(img) + 1) / (revealOrder.length + 1);

               img.style.opacity = '0';
               img.style.filter = 'blur(8px)';
               img.style.transform = `translateY(${img._startY}%)`;
          });

          h2.innerHTML = h2.textContent.split('').map(char =>
               char === ' ' ? ' ' : `<span style="opacity:0;filter:blur(3px)">${char}</span>`
          ).join('');

          const spans = h2.querySelectorAll('span');
          const totalItems = spans.length + 1;
          const tagRevealEnd = 1 / totalItems;
          const SECTION_OFFSET = philSection.offsetHeight * 0.06;
          const imgDelay = 0.12;
          const imgScale = 1 / (1 - imgDelay);

          window.addEventListener('scroll', () => {
               const rect = philSection.getBoundingClientRect();
               const total = philSection.offsetHeight - window.innerHeight * 0.3;
               const scrolled = -rect.top + window.innerHeight * 0.5 - SECTION_OFFSET;
               const progress = Math.min(Math.max(scrolled / total, 0), 1);

               if (progress >= tagRevealEnd) {
                    tag.style.opacity = '1';
                    tag.style.filter = 'blur(0px)';
               } else {
                    tag.style.opacity = '0';
                    tag.style.filter = 'blur(4px)';
               }

               const revealUpTo = Math.floor(progress * totalItems) - 1;
               spans.forEach((span, i) => {
                    if (i < revealUpTo) {
                         span.style.opacity = '1';
                         span.style.filter = 'blur(0px)';
                    } else {
                         span.style.opacity = '0';
                         span.style.filter = 'blur(1px)';
                    }
               });

               const imgProgress = Math.min(Math.max((progress - imgDelay) * imgScale, 0), 1);

               revealOrder.forEach(img => {
                    img.style.transform = `translateY(${img._startY + imgProgress * (img._endY - img._startY)}%)`;

                    if (imgProgress >= img._threshold) {
                         img.style.opacity = '1';
                         img.style.filter = 'blur(0px)';
                    } else {
                         img.style.opacity = '0';
                         img.style.filter = 'blur(8px)';
                    }
               });

          }, { passive: true });
     }

     // ============================================================
     //  FOOTER DUMMY HEIGHT
     // ============================================================

     const footer = document.querySelector('footer');
     const dummy = document.querySelector('.footer-dummy');

     if (footer && dummy) {
          const resizeObserver = new ResizeObserver(() => {
               dummy.style.height = footer.offsetHeight + 'px';
          });
          resizeObserver.observe(footer);
     }

     // ============================================================
     //  FOOTER ABOVE CLASS
     // ============================================================

     const services = document.getElementById('services-section');

     if (footer && services) {
          const footerObserver = new IntersectionObserver((entries) => {
               entries.forEach(entry => {
                    if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                         footer.classList.add('above');
                    } else {
                         footer.classList.remove('above');
                    }
               });
          }, { threshold: 0 });

          footerObserver.observe(services);
     }

     // ============================================================
     //  CLOCK
     // ============================================================

     const hand = document.getElementById('hour-hand');
     const timeEl = document.querySelector('.time');

     if (hand && timeEl) {
          function updateClock() {
               const now = new Date();

               const hours = now.getHours() % 12;
               const minutes = now.getMinutes();
               const seconds = now.getSeconds();
               const deg = (hours + minutes / 60 + seconds / 3600) * 30;
               const rad = (deg - 90) * (Math.PI / 180);

               const cx = 18, cy = 18, len = 11;
               hand.setAttribute('x2', cx + Math.cos(rad) * len);
               hand.setAttribute('y2', cy + Math.sin(rad) * len);

               const h = String(now.getHours()).padStart(2, '0');
               const m = String(now.getMinutes()).padStart(2, '0');
               const s = String(now.getSeconds()).padStart(2, '0');
               timeEl.textContent = `${h}:${m}:${s} local time`;

               requestAnimationFrame(updateClock);
          }

          updateClock();
     }

});