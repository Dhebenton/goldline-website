const section = document.querySelector('#archive-section');
const items = document.querySelectorAll('#archive-section a.ar-bl');

const floatingImg = document.createElement('img');
floatingImg.style.cssText = `
     position: fixed;
     pointer-events: none;
     opacity: 0;
     z-index: 100;
     width: 150px;
     top: 0;
     left: 0;
     will-change: transform;
`;
document.body.appendChild(floatingImg);

let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
let animating = false;

function lerp(start, end, factor) {
     return start + (end - start) * factor;
}

function animate() {
     currentX = lerp(currentX, targetX, .3);
     currentY = lerp(currentY, targetY, .3);
     floatingImg.style.transform = `translate(${currentX}px, ${currentY}px)`;

     if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
          requestAnimationFrame(animate);
     } else {
          animating = false;
     }
}

section.addEventListener('mousemove', (e) => {
     targetX = e.clientX + 12;
     targetY = e.clientY + 12;

     if (!animating) {
          animating = true;
          requestAnimationFrame(animate);
     }
});

section.addEventListener('mouseleave', () => {
     floatingImg.style.opacity = '0';
});

items.forEach(item => {
     const img = item.querySelector('img');
     if (!img) return;

     item.addEventListener('mouseenter', () => {
          floatingImg.src = img.src;
          floatingImg.style.opacity = '1';
     });

     item.addEventListener('mouseleave', () => {
          floatingImg.style.opacity = '0';
     });
});

if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
     document.body.removeAttribute('id');
}

window.addEventListener('DOMContentLoaded', () => {
     if (performance.getEntriesByType('navigation')[0]?.type === 'reload') return;

     setTimeout(() => {
          document.body.id = 'loading-in';

          setTimeout(() => {
               document.body.removeAttribute('id');
          }, 500);
     }, 5);
});