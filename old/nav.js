(function () {
     const nav = document.querySelector('nav');
     let lastY = window.scrollY;

     window.addEventListener('scroll', () => {
          const currentY = window.scrollY;

          // Hide/show on scroll direction
          if (currentY > lastY) {
               nav.style.transform = 'translateY(-100%)';
          } else {
               nav.style.transform = 'translateY(0)';
          }

          // Border when scrolled away from top
          if (currentY > 0) {
               nav.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
          } else {
               nav.style.borderBottom = '1px solid rgba(0, 0, 0, 0.0)';
          }

          lastY = currentY;
     }, { passive: true });
})();