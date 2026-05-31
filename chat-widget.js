(() => {

     window.addEventListener('chatbot:ready', () => {

          const container      = document.getElementById('chatbot-container');
          const messageWrap    = container.querySelector('.message-wrap');
          const inputContainer = container.querySelector('.input-container');
          const input          = container.querySelector('input[type="text"]');
          const promptButtons  = Array.from(container.querySelectorAll('.prompt'));

          if (!messageWrap || !input) return;

          const chatHistory = [];
          let isWaiting     = false;
          let hasSentFirst  = false;

          /* ── scroll ──────────────────────────────────── */

          function scrollToBottom() {
               messageWrap.scrollTo({ top: messageWrap.scrollHeight, behavior: 'smooth' });
          }

          function queueScroll() {
               requestAnimationFrame(() => {
                    scrollToBottom();
                    setTimeout(scrollToBottom, 80);
                    setTimeout(scrollToBottom, 220);
               });
          }

          /* ── trap scroll inside widget ───────────────── */

          messageWrap.addEventListener('wheel', event => {
               const canScroll = messageWrap.scrollHeight > messageWrap.clientHeight;

               if (!canScroll) {
                    event.preventDefault();
                    return;
               }

               const atTop    = messageWrap.scrollTop <= 0;
               const atBottom = messageWrap.scrollTop + messageWrap.clientHeight >= messageWrap.scrollHeight - 1;

               if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
                    event.preventDefault();
                    return;
               }

               event.stopPropagation();
          }, { passive: false });

          /* ── messages ────────────────────────────────── */

          function formatTime() {
               const d = new Date();
               return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          }

          function appendMessage(role, content) {
               const msg  = document.createElement('div');
               msg.className = role === 'assistant' ? 'msg mob load' : 'msg load';

               const sen  = document.createElement('span');
               sen.className = 'sen';
               sen.textContent = role === 'assistant' ? 'Mobina' : 'You';

               const sep  = document.createElement('div');
               sep.className = 'sep';

               const time = document.createElement('span');
               time.className = 'time';
               time.textContent = formatTime();

               const p    = document.createElement('p');
               p.textContent = content;

               msg.append(sen, sep, time, p);
               messageWrap.appendChild(msg);

               setTimeout(() => msg.classList.remove('load'), 50);
               queueScroll();
          }

          /* ── placeholder pulse ───────────────────────── */

          function setPlaceholder(text) {
               if (!input) { input.placeholder = text; return; }

               input.style.transition = 'filter .19s ease';
               input.style.filter = 'blur(3px)';

               setTimeout(() => { input.placeholder = text; }, 85);
               setTimeout(() => {
               input.style.filter = '';
               setTimeout(() => { input.style.transition = ''; }, 190);
               }, 170);
          }

          /* ── thinking state ──────────────────────────── */

          function startThinking() {
               input.disabled = true;
               setPlaceholder('Thinking...');
               window.chatbotOrbControls?.startThinkingOrb?.();
          }

          function stopThinking() {
               input.disabled = false;
               setPlaceholder('Ask me anything...');
               window.chatbotOrbControls?.stopThinkingOrb?.();
               input.focus();
          }

          /* ── transition intro → chat ─────────────────── */

          function transitionToChat() {
               if (hasSentFirst) return Promise.resolve();
               hasSentFirst = true;
               container.classList.add('active');
               return new Promise(resolve => setTimeout(resolve, 400));
          }

          /* ── send ────────────────────────────────────── */

          async function handleSubmit(raw) {
               if (isWaiting) return;

               const message = (typeof raw === 'string' ? raw : input.value).trim();
               if (!message) return;

               isWaiting    = true;
               input.value  = '';

               startThinking();
               await transitionToChat();
               appendMessage('user', message);

               const history = chatHistory.slice();
               chatHistory.push({ role: 'user', content: message });

               try {
                    const res  = await fetch('/api/chat', {
                         method:  'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body:    JSON.stringify({ message, history })
                    });

                    const data  = await res.json().catch(() => ({}));
                    const reply = typeof data.reply === 'string' && data.reply.trim()
                         ? data.reply.trim()
                         : 'Sorry, something went wrong. Try again in a moment.';

                    chatHistory.push({ role: 'assistant', content: reply });
                    appendMessage('assistant', reply);

               } catch {
                    const reply = 'Sorry, something went wrong. Try again in a moment.';
                    chatHistory.push({ role: 'assistant', content: reply });
                    appendMessage('assistant', reply);

               } finally {
                    stopThinking();
                    isWaiting = false;
               }
          }

          /* ── events ──────────────────────────────────── */

          input.addEventListener('keydown', event => {
               if (event.key !== 'Enter') return;
               event.preventDefault();
               handleSubmit();
          });

          promptButtons.forEach(btn => {
               btn.addEventListener('click', () => handleSubmit(btn.textContent));
          });

     });

})();