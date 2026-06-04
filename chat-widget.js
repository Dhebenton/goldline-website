(function () {
  const container = document.getElementById('chatbot-container');
  if (!container) return;

  const messageWrap = container.querySelector('.message-wrap');
  const inputWrap = container.querySelector('.input-wrap');
  const input = container.querySelector('input[type="text"]');
  const sendIcon = inputWrap?.querySelector('img');
  const tabs = Array.from(container.querySelectorAll('.tab-wrap .tab'));
  const promptButtons = Array.from(container.querySelectorAll('.prompt'));
  const bookingCallWrap = container.querySelector('.booking-call-wrap');
  const apiBaseUrl = window.CHATBOT_API_BASE_URL ||
    (window.location.hostname === 'dev.goldline.agency' ? 'https://api.goldline.agency' : '');
  const chatSwitchElements = [
    container.querySelector('.message-container > video'),
    container.querySelector('.message-container > .video'),
    container.querySelector('.message-container > .gradient'),
    container.querySelector('.message-container > .greeting'),
    messageWrap,
    inputWrap
  ].filter(Boolean);

  if (!messageWrap || !input) return;

  const chatHistory = [];
  const defaultPlaceholder = input.placeholder || 'Ask me anything..';
  const placeholderBlurMs = 170;
  const placeholderTransitionMs = placeholderBlurMs * 2;
  let isWaiting = false;
  let hasStartedChat = container.classList.contains('active');
  let hasRenderedFirstMessage = false;
  let placeholderTimer = null;
  let placeholderCleanupTimer = null;
  let switchTimer = null;
  let switchRevealTimer = null;

  function setImportantStyle(element, styles) {
    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value, 'important');
    });
  }

  function setSwitchHidden(element) {
    setImportantStyle(element, {
      transition: 'all ease .2s',
      opacity: '0',
      filter: 'blur(4px)',
      transform: 'translateY(-5px)',
      'pointer-events': 'none'
    });
  }

  function setSwitchVisible(element) {
    setImportantStyle(element, {
      transition: 'all ease .2s',
      opacity: '1',
      filter: 'blur(0px)',
      transform: 'translateY(0px)',
      'pointer-events': ''
    });
  }

  if (bookingCallWrap) {
    setSwitchHidden(bookingCallWrap);
  }

  function formatTime() {
    const date = new Date();
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function queueScroll() {
    requestAnimationFrame(() => {
      messageWrap.scrollTo({ top: messageWrap.scrollHeight, behavior: 'smooth' });
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
    time.textContent = formatTime();

    const paragraph = document.createElement('p');
    paragraph.textContent = content;

    message.append(sender, separator, time, paragraph);
    messageWrap.appendChild(message);

    const loadDelay = hasRenderedFirstMessage ? 10 : 310;
    hasRenderedFirstMessage = true;

    window.setTimeout(() => {
      message.classList.remove('load');
      queueScroll();
    }, loadDelay);

    return message;
  }

  function normalizePrompts(prompts) {
    if (!Array.isArray(prompts)) {
      return [];
    }

    return prompts
      .filter((prompt) => typeof prompt === 'string')
      .map((prompt) => prompt.trim())
      .filter((prompt) => prompt.length > 0)
      .slice(0, 2);
  }

  function appendPrompts(message, prompts) {
    const safePrompts = normalizePrompts(prompts);

    if (!message || safePrompts.length === 0) return;

    const promptWrap = document.createElement('div');
    promptWrap.className = 'fr';

    safePrompts.forEach((prompt) => {
      const button = document.createElement('button');
      button.className = 'prompt';
      button.type = 'button';
      button.textContent = prompt;
      button.addEventListener('click', () => {
        handleSubmit(prompt);
      });

      promptWrap.appendChild(button);
    });

    message.appendChild(promptWrap);
    queueScroll();
  }

  function enterChatState() {
    if (hasStartedChat) return;

    hasStartedChat = true;
    container.classList.add('active');

    window.setTimeout(() => {
      container.classList.add('done');
    }, 300);
  }

  function transitionPlaceholder(nextPlaceholder) {
    window.clearTimeout(placeholderTimer);
    window.clearTimeout(placeholderCleanupTimer);

    input.style.transition = `filter ${placeholderBlurMs / 1000}s ease`;
    input.style.filter = 'blur(4px)';

    placeholderTimer = window.setTimeout(() => {
      input.placeholder = nextPlaceholder;
      input.style.filter = '';
    }, placeholderBlurMs);

    placeholderCleanupTimer = window.setTimeout(() => {
      input.style.transition = '';
    }, placeholderTransitionMs);
  }

  function setWaiting(nextWaiting) {
    isWaiting = nextWaiting;
    input.disabled = nextWaiting;
    transitionPlaceholder(nextWaiting ? 'Thinking...' : defaultPlaceholder);
    inputWrap?.classList.toggle('active', input.value.trim().length > 0 && !nextWaiting);

    try {
      if (nextWaiting) {
        window.chatbotOrbControls?.startThinkingOrb?.();
      } else {
        window.chatbotOrbControls?.stopThinkingOrb?.();
      }
    } catch (error) {
      console.error('Chatbot orb state failed:', error);
    }

    if (!nextWaiting) {
      input.focus();
    }
  }

  function switchTab(nextMode, activeTab) {
    if (activeTab.classList.contains('active')) return;

    window.clearTimeout(switchTimer);
    window.clearTimeout(switchRevealTimer);

    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab === activeTab);
    });

    container.classList.add('switch');

    if (nextMode === 'call') {
      container.classList.add('call');
      container.classList.remove('chat');
      chatSwitchElements.forEach(setSwitchHidden);

      switchRevealTimer = window.setTimeout(() => {
        if (bookingCallWrap) {
          setSwitchVisible(bookingCallWrap);
        }
      }, 400);
    } else {
      container.classList.add('chat');
      container.classList.remove('call');
      if (bookingCallWrap) {
        setSwitchHidden(bookingCallWrap);
      }

      switchRevealTimer = window.setTimeout(() => {
        chatSwitchElements.forEach((element) => {
          if (
            container.classList.contains('active') &&
            (element.matches('.greeting') || element.matches('video') || element.matches('.video'))
          ) {
            setSwitchHidden(element);
            return;
          }

          setSwitchVisible(element);
        });
      }, 400);
    }

    switchTimer = window.setTimeout(() => {
      container.classList.remove('switch');
    }, 400);
  }

  async function requestReply(message) {
    const response = await fetch(`${apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: chatHistory
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Chat response was missing a reply.');
    }

    return {
      reply: data.reply.trim(),
      prompts: normalizePrompts(data.prompts)
    };
  }

  async function handleSubmit(rawMessage) {
    if (isWaiting) return;

    const source = typeof rawMessage === 'string' ? rawMessage : input.value;
    const message = source.trim();
    if (!message) return;

    input.value = '';
    inputWrap?.classList.remove('active');
    enterChatState();
    appendMessage('user', message);
    chatHistory.push({ role: 'user', content: message });
    setWaiting(true);

    try {
      const { reply, prompts } = await requestReply(message);
      const assistantMessage = appendMessage('assistant', reply);
      appendPrompts(assistantMessage, prompts);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (error) {
      console.error('Chatbot request failed:', error);
      const reply = 'Sorry, something went wrong. Try again in a moment.';
      appendMessage('assistant', reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } finally {
      setWaiting(false);
    }
  }

  input.addEventListener('input', () => {
    inputWrap?.classList.toggle('active', input.value.trim().length > 0 && !isWaiting);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleSubmit();
  });

  sendIcon?.addEventListener('click', () => {
    handleSubmit();
  });

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleSubmit(button.textContent || '');
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const label = tab.textContent.trim().toLowerCase();
      switchTab(label.includes('book') ? 'call' : 'chat', tab);
    });
  });

  messageWrap.addEventListener('wheel', (event) => {
    const canScroll = messageWrap.scrollHeight > messageWrap.clientHeight;

    if (!canScroll) {
      event.preventDefault();
      return;
    }

    const atTop = messageWrap.scrollTop <= 0;
    const atBottom = messageWrap.scrollTop + messageWrap.clientHeight >= messageWrap.scrollHeight - 1;

    if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
      event.preventDefault();
      return;
    }

    event.stopPropagation();
  }, { passive: false });
})();
