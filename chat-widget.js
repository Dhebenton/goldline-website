document.addEventListener('DOMContentLoaded', () => {
     const chatbotContainer = document.querySelector('#chatbot-container');

     if (!chatbotContainer) {
          return;
     }

     const messageWrap = chatbotContainer.querySelector('.message-wrap');
     const input = chatbotContainer.querySelector('input[type="text"]');
     const inputContainer = chatbotContainer.querySelector('.input-container');
     const promptButtons = Array.from(chatbotContainer.querySelectorAll('.prompt'));
     const chatHistory = [];
     let isWaiting = false;
     let inputBlurTimer = null;
     let inputBlurSwapTimer = null;
     let hasSentFirstMessage = false;

     if (!messageWrap || !input) {
          return;
     }

     messageWrap.style.scrollBehavior = 'smooth';

     function formatTime(date) {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');

          return `${hours}:${minutes}`;
     }

     function scrollToBottom() {
          const target = messageWrap.scrollHeight;

          if (typeof messageWrap.scrollTo === 'function') {
               messageWrap.scrollTo({
                    top: target,
                    behavior: 'smooth'
               });
               return;
          }

          messageWrap.scrollTop = target;
     }

     function queueScrollToBottom() {
          requestAnimationFrame(() => {
               scrollToBottom();

               setTimeout(scrollToBottom, 80);
               setTimeout(scrollToBottom, 220);
          });
     }

     function appendMessage(role, content) {
          const message = document.createElement('div');
          message.className = role === 'assistant' ? 'msg mob load' : 'msg load';

          const sender = document.createElement('span');
          sender.className = 'sen';
          sender.textContent = role === 'assistant' ? 'Mobina' : 'You';

          const separator = document.createElement('div');
          separator.className = 'sep';

          const time = document.createElement('span');
          time.className = 'time';
          time.textContent = formatTime(new Date());

          const paragraph = document.createElement('p');
          paragraph.textContent = content;

          message.append(sender, separator, time, paragraph);
          messageWrap.appendChild(message);

          setTimeout(() => {
               message.classList.remove('load');
          }, 50);

          queueScrollToBottom();
     }

     function pulseInputBlur(onBlurred) {
          if (!inputContainer) {
               onBlurred?.();
               return;
          }

          clearTimeout(inputBlurTimer);
          clearTimeout(inputBlurSwapTimer);
          inputContainer.style.filter = 'blur(3px)';
          inputContainer.style.transition = 'filter 170ms ease';

          inputBlurSwapTimer = setTimeout(() => {
               onBlurred?.();
          }, 60);

          inputBlurTimer = setTimeout(() => {
               inputContainer.style.filter = '';
          }, 170);
     }

     function delay(ms) {
          return new Promise(resolve => {
               setTimeout(resolve, ms);
          });
     }

     function startThinking() {
          pulseInputBlur(() => {
               input.placeholder = 'Thinking...';
          });
          input.disabled = true;
          window.chatbotOrbControls?.startThinkingOrb?.();
     }

     function stopThinking() {
          input.disabled = false;
          window.chatbotOrbControls?.stopThinkingOrb?.();
          pulseInputBlur(() => {
               input.placeholder = 'Ask me anything...';
               input.focus();
          });
     }

     async function sendMessage(promptMessage) {
          if (isWaiting) {
               return;
          }

          const message = typeof promptMessage === 'string'
               ? promptMessage.trim()
               : input.value.trim();

          if (!message) {
               return;
          }

          isWaiting = true;
          input.value = '';
          startThinking();

          if (!hasSentFirstMessage) {
               hasSentFirstMessage = true;
               chatbotContainer.classList.add('active');
               await delay(400);
          }

          appendMessage('user', message);

          const requestHistory = chatHistory.slice();
          chatHistory.push({ role: 'user', content: message });

          try {
               const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                         message,
                         history: requestHistory
                    })
               });

               const data = await response.json().catch(() => ({}));
               const reply = typeof data.reply === 'string' && data.reply.trim()
                    ? data.reply.trim()
                    : 'Sorry, something went wrong. Try again in a moment.';

               chatHistory.push({ role: 'assistant', content: reply });
               appendMessage('assistant', reply);
          } catch (error) {
               const reply = 'Sorry, something went wrong. Try again in a moment.';
               chatHistory.push({ role: 'assistant', content: reply });
               appendMessage('assistant', reply);
          } finally {
               stopThinking();
               isWaiting = false;
          }
     }

     input.addEventListener('keydown', event => {
          if (event.key !== 'Enter') {
               return;
          }

          event.preventDefault();
          sendMessage();
     });

     promptButtons.forEach(button => {
          button.addEventListener('click', () => {
               sendMessage(button.textContent);
          });
     });
});
