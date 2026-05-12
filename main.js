// ============================================================
//  NAV
// ============================================================

(function () {
     const nav = document.querySelector('nav');
     let lastY = window.scrollY;

     window.addEventListener('scroll', () => {
          const currentY = window.scrollY;

          if (currentY > lastY) {
               nav.style.transform = 'translateY(-100%)';
          } else {
               nav.style.transform = 'translateY(0)';
          }

          if (currentY > 0 || window.innerWidth < 530) {
               nav.style.borderBottom = '1px solid rgba(0, 0, 0, 0.06)';
          } else {
               nav.style.borderBottom = '1px solid rgba(0, 0, 0, 0.0)';
          }

          lastY = currentY;
     }, { passive: true });
})();

document.addEventListener('DOMContentLoaded', () => {

     // ============================================================
     //  LENIS SMOOTH SCROLL
     // ============================================================

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
     //  HERO — PLAY BUTTON MAGNETIC EFFECT
     // ============================================================

     const heroImgWrap = document.querySelector('main .img-wrap');
     const play = document.querySelector('.play');

     if (heroImgWrap && play) {
          let targetX = 0, targetY = 0;
          let currentX = 0, currentY = 0;
          let playRafId = null;

          const strength = 0.18;
          const lerp = (a, b, t) => a + (b - a) * t;

          function animatePlay() {
               currentX = lerp(currentX, targetX, 0.18);
               currentY = lerp(currentY, targetY, 0.18);
               play.style.transform = `translate(${currentX}px, ${currentY}px)`;
               playRafId = requestAnimationFrame(animatePlay);
          }

          function updateTarget(e) {
               const rect = heroImgWrap.getBoundingClientRect();
               const centerX = rect.width / 2;
               const centerY = rect.height / 2;
               targetX = (e.clientX - rect.left - centerX) * strength;
               targetY = (e.clientY - rect.top - centerY) * strength;
          }

          heroImgWrap.addEventListener('mouseenter', () => {
               playRafId = requestAnimationFrame(animatePlay);
          });

          heroImgWrap.addEventListener('mousemove', updateTarget);
          play.addEventListener('mousemove', updateTarget);

          heroImgWrap.addEventListener('mouseleave', (e) => {
               if (heroImgWrap.contains(e.relatedTarget)) return;

               targetX = 0;
               targetY = 0;

               setTimeout(() => {
                    cancelAnimationFrame(playRafId);
               }, 600);
          });
     }


     // ============================================================
     //  PORTFOLIO CARDS — INTERSECTION REVEAL
     // ============================================================

     const cards = document.querySelectorAll('.portfolio-card');

     if (cards.length) {
          const cardObserver = new IntersectionObserver((entries) => {
               entries.forEach(entry => {
                    if (entry.isIntersecting) {
                         entry.target.classList.remove('outview');
                         cardObserver.unobserve(entry.target);
                    }
               });
          }, { threshold: .7 });

          cards.forEach(card => cardObserver.observe(card));
     }


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
                    let aboutRafId = null;
                    let sectionTop = 0;

                    function cacheBounds() {
                         sectionTop = aboutSection.getBoundingClientRect().top + window.scrollY;
                    }

                    cacheBounds();

                    function update() {
                         aboutRafId = null;
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
                         if (aboutRafId) return;
                         aboutRafId = requestAnimationFrame(update);
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

     const philSection = document.querySelector('#phillosophy-section');
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

               img._startY = isLarge ? (640 + Math.random() * 40) : (270 + Math.random() * 40);
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
                         span.style.filter = 'blur(2px)';
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


     // ============================================================
     //  FAQ
     // ============================================================

     const faqs = document.querySelectorAll('.faq');

     if (faqs.length) {
          function setActive(faq) {
               faqs.forEach(f => {
                    f.classList.remove('active');
                    f.querySelector('.answer-wrap').style.height = '0px';
               });

               faq.classList.add('active');
               const answerWrap = faq.querySelector('.answer-wrap');
               const p = answerWrap.querySelector('p');
               answerWrap.style.height = p.offsetHeight + 6 + 'px';
          }

          setActive(faqs[0]);

          faqs.forEach(faq => {
               faq.addEventListener('mouseenter', () => setActive(faq));
          });
     }


     // ============================================================
     //  SLIDER
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

               function maxOffset() {
                    return Math.max(0, items[N - 1].offsetLeft);
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
                    applyOffset(items[current].offsetLeft, animate);
                    updateDots();
               }

               function nearestIndex() {
                    let best = 0, bestDist = Infinity;
                    items.forEach((el, i) => {
                         const d = Math.abs(el.offsetLeft - offset);
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
                    if (current >= N - 1) return;
                    autoTimer = setTimeout(() => {
                         snapTo(current + 1);
                         startAutoplay();
                    }, AUTOPLAY_MS);
               }

               function resetAutoplay() {
                    clearTimeout(autoTimer);
                    startAutoplay();
               }

               track.addEventListener('mousedown', e => {
                    if (e.button !== 0) return;
                    cancelAnimationFrame(rafId);
                    clearTimeout(autoTimer);
                    track.classList.remove('is-snapping');
                    track.classList.add('is-dragging');
                    document.body.style.cursor = 'grabbing';
                    
                    document.body.style.userSelect = 'none';
                    document.body.style.pointerEvents = 'none';
                    track.style.pointerEvents = 'auto'; 
                    
                    dragging = true;
                    startX = lastX = e.clientX;
                    startOff = offset;
                    lastT = performance.now();
                    velX = 0;
                    e.preventDefault();
               });

               window.addEventListener('mousemove', e => {
                    if (!dragging) return;
                    const now = performance.now();
                    velX = (e.clientX - lastX) / (now - lastT + 1);
                    lastX = e.clientX; lastT = now;
                    applyOffset(startOff - (e.clientX - startX), false);
                    updateDotsFromOffset();
               });

               window.addEventListener('mouseup', () => {
                    if (!dragging) return;
                    dragging = false;
                    track.classList.remove('is-dragging');
                    document.body.style.cursor = '';
                    
                    document.body.style.userSelect = '';
                    document.body.style.pointerEvents = '';
                    track.style.pointerEvents = '';
                    
                    momentum();
               });

               track.addEventListener('touchstart', e => {
                    cancelAnimationFrame(rafId);
                    clearTimeout(autoTimer);
                    track.classList.remove('is-snapping');
                    const t = e.touches[0];
                    dragging = true;
                    startX = lastX = t.clientX;
                    startOff = offset;
                    lastT = performance.now();
                    velX = 0;
               }, { passive: true });

               track.addEventListener('touchmove', e => {
                    if (!dragging) return;
                    const t = e.touches[0], now = performance.now();
                    velX = (t.clientX - lastX) / (now - lastT + 1);
                    lastX = t.clientX; lastT = now;
                    applyOffset(startOff - (t.clientX - startX), false);
                    updateDotsFromOffset();
               }, { passive: true });

               track.addEventListener('touchend', () => {
                    dragging = false;
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
                    track._wheelTimer = setTimeout(() => {
                         snapToNearest();
                         resetAutoplay();
                    }, 120);
               }, { passive: false });

               const sliderRef = { track, snapTo, resetAutoplay, getCurrent: () => current };
               sliders.push(sliderRef);

               const keyObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                         if (entry.isIntersecting) activeSlider = sliderRef;
                    });
               }, { threshold: 0.7 });
               keyObserver.observe(track);

               function momentum() {
                    let vel = -velX * 14;
                    function step() {
                         if (Math.abs(vel) < 0.5 || offset <= 0 || offset >= maxOffset()) {
                              snapToNearest();
                              resetAutoplay();
                              return;
                         }
                         vel *= 0.92;
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
                    items.forEach(el => {
                         const isPast = (el.offsetLeft + el.offsetWidth) <= offset + 8;
                         el.classList.toggle('is-past', isPast);
                         el.querySelectorAll('.card, .blog-card-wrap').forEach(c => c.classList.toggle('is-past', isPast));
                    });
               }

               applyOffset(0, false);
               updateDots();
               updateVisibility();

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

});