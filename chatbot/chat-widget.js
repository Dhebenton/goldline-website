(function () {
  const chatbot = document.getElementById('chatbot-container');
  if (!chatbot) return;

  const messageContainer = chatbot.querySelector('.message-container');
  const input = chatbot.querySelector('input[type="text"]');
  const introWrap = chatbot.querySelector('.intro-wrap');
  const promptButtons = Array.from(chatbot.querySelectorAll('.prompt'));
  const orbControls = window.chatbotOrbControls;
  const defaultPlaceholder = 'Ask me anything...';
  const introExitDurationMs = 300;
  const placeholderTransitionMs = 180;

  if (!messageContainer || !input) return;

  const chatHistory = [];
  let isWaitingForReply = false;
  let hasEnteredChat = chatbot.classList.contains('messages-visible');

  function scrollToLatest() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function trapScroll(event) {
    const deltaY = event.deltaY;
    const canScroll = messageContainer.scrollHeight > messageContainer.clientHeight;
    if (!canScroll) {
      event.preventDefault();
      return;
    }

    const atTop = messageContainer.scrollTop <= 0;
    const atBottom =
      messageContainer.scrollTop + messageContainer.clientHeight >= messageContainer.scrollHeight - 1;

    if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
  }

  function createMessageBlock(role, text) {
    const block = document.createElement('div');
    block.className = `message-block ${role} f-c g8`;

    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = role === 'user' ? 'You' : 'Mobina';

    const body = document.createElement('p');
    body.textContent = text;

    block.append(who, body);

    return block;
  }

  function appendMessage(role, text) {
    const block = createMessageBlock(role, text);
    block.classList.add('is-entering');
    messageContainer.appendChild(block);

    requestAnimationFrame(() => {
      block.classList.remove('is-entering');
      scrollToLatest();
    });

    return block;
  }

  function setPlaceholder(nextPlaceholder) {
    input.classList.add('placeholder-transitioning');

    window.setTimeout(() => {
      input.placeholder = nextPlaceholder;
    }, placeholderTransitionMs / 2);

    window.setTimeout(() => {
      input.classList.remove('placeholder-transitioning');
    }, placeholderTransitionMs);
  }

  function revealMessages() {
    if (messageContainer.classList.contains('flex')) return;

    messageContainer.classList.add('flex');

    requestAnimationFrame(() => {
      chatbot.classList.add('messages-visible');
      scrollToLatest();
    });
  }

  function transitionIntroOut() {
    if (hasEnteredChat) {
      revealMessages();
      return Promise.resolve();
    }

    hasEnteredChat = true;
    chatbot.classList.add('intro-hidden');

    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (introWrap) {
          introWrap.hidden = true;
          introWrap.setAttribute('aria-hidden', 'true');
          introWrap.remove();
        }

        revealMessages();
        resolve();
      }, introExitDurationMs);
    });
  }

  async function sendMessage(message) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        history: chatHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data || typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Chat response was missing a reply.');
    }

    return data.reply.trim();
  }

  async function handleSubmit(rawMessage) {
    if (isWaitingForReply) return;

    const message = rawMessage.trim();
    if (!message) return;

    isWaitingForReply = true;
    input.value = '';
    input.disabled = true;
    setPlaceholder('Thinking...');

    appendMessage('user', message);
    chatHistory.push({ role: 'user', content: message });

    await transitionIntroOut();
    orbControls?.startThinkingOrb?.();

    try {
      const reply = await sendMessage(message);
      appendMessage('mobina', reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (error) {
      console.error('Chatbot request failed:', error);
      appendMessage('mobina', 'Sorry, something went wrong. Try again in a moment.');
    } finally {
      orbControls?.stopThinkingOrb?.();
      isWaitingForReply = false;
      input.disabled = false;
      setPlaceholder(defaultPlaceholder);
      input.focus();
      scrollToLatest();
    }
  }

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    handleSubmit(input.value);
  });

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleSubmit(button.textContent || '');
    });
  });

  messageContainer.addEventListener('wheel', trapScroll, { passive: false });
})();
