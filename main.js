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
    duration: .6,
    easing: t => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);


  // ============================================================
  //  PORTFOLIO
  // ============================================================

  const cards = document.querySelectorAll('.portfolio-card');

  if (cards.length) {
    const defaultObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('outview');
          defaultObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });

    const twoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('outview');
          twoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 1, rootMargin: '0px 0px -80px 0px' });

    cards.forEach(card => {
      if (card.classList.contains('two')) {
        twoObserver.observe(card);
      } else {
        defaultObserver.observe(card);
      }
    });
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
//  FOOTER CLOCK
// ============================================================

const hand = document.getElementById('hour-hand');
const timeEl = document.querySelector('.time');

if (hand && timeEl) {
  const cx = 18, cy = 18, len = 11;
  const DEG_TO_RAD = Math.PI / 180;

  let lastSecond = -1;

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Hand rotation
    const deg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
    const rad = (deg - 90) * DEG_TO_RAD;
    hand.setAttribute('x2', cx + Math.cos(rad) * len);
    hand.setAttribute('y2', cy + Math.sin(rad) * len);

    // Only rebuild the string once per second
    if (seconds !== lastSecond) {
      const h = String(hours).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');
      timeEl.textContent = `${h}:${m}:${s} local time`;
      lastSecond = seconds;
    }

    requestAnimationFrame(updateClock);
  }

  updateClock();
}

 // ============================================================
     //  FOOTER DUMMY HEIGHT
     // ============================================================

     const footer = document.querySelector('footer');

     if (footer) {
    const resizeObserver = new ResizeObserver(() => {
        document.body.style.paddingBottom = footer.offsetHeight + 'px';
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

});