(function () {
     const hand = document.getElementById('hour-hand');
     const timeEl = document.querySelector('.time');

     function update() {
          const now = new Date();

          // Hour hand
          const hours = now.getHours() % 12;
          const minutes = now.getMinutes();
          const seconds = now.getSeconds();
          const deg = (hours + minutes / 60 + seconds / 3600) * 30;
          const rad = (deg - 90) * (Math.PI / 180);

          const cx = 18, cy = 18, len = 11;
          const x2 = cx + Math.cos(rad) * len;
          const y2 = cy + Math.sin(rad) * len;

          hand.setAttribute('x2', x2);
          hand.setAttribute('y2', y2);

          // Time display
          const h = String(now.getHours()).padStart(2, '0');
          const m = String(now.getMinutes()).padStart(2, '0');
          const s = String(now.getSeconds()).padStart(2, '0');
          timeEl.textContent = `${h}:${m}:${s} local time`;

          requestAnimationFrame(update);
     }

     update();
})();