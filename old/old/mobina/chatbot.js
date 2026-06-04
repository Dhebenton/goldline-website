(() => {

     const container = document.getElementById('chatbot-container');
     if (!container) return;

     /* ── INJECT HTML on window load ──────────────────── */

     window.addEventListener('load', () => {

          container.innerHTML = `
               <div class="background-cover cu"></div>
               <div class="tab-wrap fr g16">
                    <button class="tab active">Chat</button>
                    <button class="tab mra">Book A Call</button>
                    <button class="close fr jc">
                         <img src="/assets/cross.svg" decoding="async" loading="lazy" />
                    </button>
               </div>
               <div class="flex message-container">
                    <div class="message-wrap cu fc g28 flex"></div>
                    <div class="video-wrap">
                         <div class="border"></div>
                         <video src="/assets/mobina-v.webm" autoplay muted loop playsinline preload="none"></video>
                         <div class="gradient cu fs"></div>
                    </div>
                    <div class="starter-wrap fs je fc">
                         <span class="name">Mobina</span>
                         <p>Hey, Im Mobina, Goldline's AI assistant.<br>What are you looking for?</p>
                         <div class="fr g8">
                              <button class="prompt">I have a project</button>
                              <button class="prompt">What do you'se do?</button>
                              <button class="prompt">Am i a fit?</button>
                         </div>
                    </div>
               </div>
               <div class="input-wrap cu fr as">
                    <div id="chatWidgetOrb" class="chat-orb fr jc">
                         <svg width="22" height="22" viewBox="0 0 40 40" fill="currentColor">
                              <g class="inner-ring"></g>
                              <g class="outer-ring"></g>
                         </svg>
                    </div>
                    <div class="input-container fr">
                         <input type="text" class="flex" placeholder="Ask me anything...">
                    </div>
               </div>
          `;

          initOrb();
          window.dispatchEvent(new CustomEvent('chatbot:ready'));
     });

     /* ── ORB + OPEN/CLOSE ────────────────────────────── */

     function initOrb() {

          const orb         = container.querySelector('#chatWidgetOrb');
          const closeButton = container.querySelector('.tab-wrap .close');
          const innerRing   = orb.querySelector('.inner-ring');
          const outerRing   = orb.querySelector('.outer-ring');

          let isOpen       = false;
          let breathingAni = [];
          let thinkingAni  = [];

          /* ── build dots ──────────────────────────────── */

          const innerDots = Array.from({ length: 4 }, (_, i) => {
               const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
               return {
                    cx: 20 + Math.cos(angle) * 5,
                    cy: 20 + Math.sin(angle) * 5
               };
          });

          const outerDots = Array.from({ length: 10 }, (_, i) => {
               const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
               return {
                    cx: 20 + Math.cos(angle) * 12,
                    cy: 20 + Math.sin(angle) * 12
               };
          });

          innerRing.innerHTML = innerDots
               .map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="1.75"></circle>`)
               .join('');

          outerRing.innerHTML = outerDots
               .map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="1.75"></circle>`)
               .join('');

          const innerCircles = Array.from(innerRing.querySelectorAll('circle'));
          const outerCircles = Array.from(outerRing.querySelectorAll('circle'));

          const innerRadius = { min: 4.5,  max: 5.5  };
          const outerRadius = { min: 10.8, max: 13.2 };

          /* ── helpers ─────────────────────────────────── */

          function killAll() {
               [...breathingAni, ...thinkingAni].forEach(a => a?.cancel());
               breathingAni = [];
               thinkingAni  = [];
          }

          /* ── breathing ───────────────────────────────── */

          function startBreathing() {
               killAll();

               innerCircles.forEach((circle, i) => {
                    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                    const minX = 20 + Math.cos(angle) * innerRadius.min;
                    const minY = 20 + Math.sin(angle) * innerRadius.min;
                    const maxX = 20 + Math.cos(angle) * innerRadius.max;
                    const maxY = 20 + Math.sin(angle) * innerRadius.max;

                    breathingAni.push(circle.animate(
                         [
                              { cx: `${minX}`, cy: `${minY}` },
                              { cx: `${maxX}`, cy: `${maxY}` }
                         ],
                         { duration: 2000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }
                    ));
               });

               outerCircles.forEach((circle, i) => {
                    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                    const minX = 20 + Math.cos(angle) * outerRadius.min;
                    const minY = 20 + Math.sin(angle) * outerRadius.min;
                    const maxX = 20 + Math.cos(angle) * outerRadius.max;
                    const maxY = 20 + Math.sin(angle) * outerRadius.max;

                    breathingAni.push(circle.animate(
                         [
                              { cx: `${minX}`, cy: `${minY}` },
                              { cx: `${maxX}`, cy: `${maxY}` }
                         ],
                         { duration: 2000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: (i / 10) * 200 }
                    ));
               });
          }

          /* ── thinking ────────────────────────────────── */

          function startThinkingOrb() {
               killAll();

               thinkingAni = [
                    innerRing.animate(
                         [
                              { transform: 'rotate(0deg)',   transformOrigin: '20px 20px' },
                              { transform: 'rotate(360deg)', transformOrigin: '20px 20px' }
                         ],
                         { duration: 5500, iterations: Infinity, easing: 'linear' }
                    ),
                    outerRing.animate(
                         [
                              { transform: 'rotate(0deg)',    transformOrigin: '20px 20px' },
                              { transform: 'rotate(-360deg)', transformOrigin: '20px 20px' }
                         ],
                         { duration: 8000, iterations: Infinity, easing: 'linear' }
                    )
               ];
          }

          function stopThinkingOrb() {
               killAll();
               startBreathing();
          }

          /* ── activate / deactivate ───────────────────── */

          function flashDots(circles, stagger) {
               circles.forEach((circle, i) => {
                    circle.animate(
                         [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }],
                         { duration: 600, delay: i * stagger * 1000, easing: 'ease-in-out' }
                    );
               });
          }

          function activateOrb() {
               innerRing.animate(
                    [
                         { transform: 'rotate(0deg)',   transformOrigin: '20px 20px' },
                         { transform: 'rotate(180deg)', transformOrigin: '20px 20px' }
                    ],
                    { duration: 500, fill: 'forwards', easing: 'cubic-bezier(0.45,0,0.55,1)' }
               );

               outerRing.animate(
                    [
                         { transform: 'rotate(0deg)',   transformOrigin: '20px 20px' },
                         { transform: 'rotate(-72deg)', transformOrigin: '20px 20px' }
                    ],
                    { duration: 500, fill: 'forwards', easing: 'cubic-bezier(0.45,0,0.55,1)' }
               );

               flashDots(innerCircles, 0.15);
               flashDots([...outerCircles].reverse(), 0.09);
          }

          function deactivateOrb() {
               innerRing.animate(
                    [
                         { transform: 'rotate(180deg)', transformOrigin: '20px 20px' },
                         { transform: 'rotate(0deg)',   transformOrigin: '20px 20px' }
                    ],
                    { duration: 500, fill: 'forwards', easing: 'cubic-bezier(0.45,0,0.55,1)' }
               );

               outerRing.animate(
                    [
                         { transform: 'rotate(-72deg)', transformOrigin: '20px 20px' },
                         { transform: 'rotate(0deg)',   transformOrigin: '20px 20px' }
                    ],
                    { duration: 500, fill: 'forwards', easing: 'cubic-bezier(0.45,0,0.55,1)' }
               );

               flashDots([...innerCircles].reverse(), 0.15);
               flashDots(outerCircles, 0.09);

               setTimeout(startBreathing, 520);
          }

          /* ── open / close ────────────────────────────── */

          function openWidget() {
               if (isOpen) return;
               isOpen = true;

               container.classList.remove('closing', 'closed');
               container.classList.add('open');

               activateOrb();
          }

          function closeWidget() {
               if (!isOpen) return;
               isOpen = false;

               container.classList.add('closing');
               deactivateOrb();

               requestAnimationFrame(() => {
                    container.classList.remove('open');
               });

               setTimeout(() => {
                    container.classList.remove('closing');
                    container.classList.add('closed');
               }, 400);
          }

          /* ── events ──────────────────────────────────── */

          orb.addEventListener('click', event => {
               event.stopPropagation();
               if (!isOpen) openWidget();
          });

          closeButton.addEventListener('click', event => {
               event.stopPropagation();
               closeWidget();
          });

          document.addEventListener('click', event => {
               if (!isOpen || container.contains(event.target)) return;
               closeWidget();
          });

          /* ── expose for chat-widget.js ───────────────── */

          window.chatbotOrbControls = {
               startThinkingOrb,
               stopThinkingOrb
          };

          startBreathing();
     }

})();