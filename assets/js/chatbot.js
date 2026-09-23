/**
 * Reachup Media Custom Neo-Brutalist Chatbot
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Chatbot HTML into the DOM
  const chatbotHTML = `
    <!-- Chatbot Toggle Button -->
    <button id="reachbot-toggle" class="reachbot-toggle" aria-label="Toggle Chat">
      <span class="reachbot-icon">💬</span>
    </button>

    <!-- Chatbot Window -->
    <div id="reachbot-window" class="reachbot-window hidden">
      <div class="reachbot-header">
        <div class="reachbot-title">
          <span class="pulse-dot"></span>
          <strong>REACHBOT</strong>
        </div>
        <button id="reachbot-close" class="reachbot-close" aria-label="Close Chat">✖</button>
      </div>
      
      <div id="reachbot-messages" class="reachbot-messages">
        <!-- Initial Greeting -->
        <div class="bot-msg">
          <div class="msg-bubble">Hey there! 👋 I'm ReachBot. I can help you learn about our <strong>services</strong>, past <strong>campaigns</strong>, or how to <strong>contact</strong> us. What's up?</div>
        </div>
      </div>

      <form id="reachbot-form" class="reachbot-form">
        <input type="text" id="reachbot-input" placeholder="Type your question..." autocomplete="off" required />
        <button type="submit" class="reachbot-send">➔</button>
      </form>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // Logic Elements
  const toggleBtn = document.getElementById('reachbot-toggle');
  const closeBtn = document.getElementById('reachbot-close');
  const chatWindow = document.getElementById('reachbot-window');
  const chatForm = document.getElementById('reachbot-form');
  const chatInput = document.getElementById('reachbot-input');
  const messagesContainer = document.getElementById('reachbot-messages');

  // Toggle Logic
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  // Only these tags/attributes are allowed through from either the user or the bot.
  const ALLOWED_TAGS = new Set(['STRONG', 'B', 'EM', 'I', 'A', 'BR']);
  const ALLOWED_LINK_SCHEMES = /^(https?:|mailto:|tel:)/i;

  // Strip everything except the small allowlist above (drops <script>, event handlers,
  // javascript: links, etc.) so neither user input nor an AI reply can inject markup.
  const sanitizeToFragment = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!ALLOWED_TAGS.has(child.tagName)) {
            // Unwrap disallowed elements, keeping their text content.
            const text = document.createTextNode(child.textContent);
            child.replaceWith(text);
            return;
          }
          [...child.attributes].forEach((attr) => {
            if (attr.name === 'href' && child.tagName === 'A') {
              if (!ALLOWED_LINK_SCHEMES.test(child.getAttribute('href') || '')) {
                child.removeAttribute('href');
              }
              return;
            }
            child.removeAttribute(attr.name);
          });
          if (child.tagName === 'A') {
            child.setAttribute('target', '_blank');
            child.setAttribute('rel', 'noopener noreferrer');
          }
          walk(child);
        }
      });
    };
    walk(template.content);
    return template.content;
  };

  // Add Message to UI
  const addMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-msg' : 'bot-msg';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.appendChild(sanitizeToFragment(text));

    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  };

  // Form Submission & API Call
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = chatInput.value.trim();
    if (!userText) return;

    // 1. Add User Message
    addMessage(userText, 'user');
    chatInput.value = '';

    // 2. Show Typing Indicator
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-msg typing-indicator';
    typingDiv.id = typingId;
    typingDiv.innerHTML = `<div class="msg-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    // 3. Call Gemini Serverless Function
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      
      const data = await response.json();
      
      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      if (!response.ok) {
        addMessage("Oops, my brain is taking a break. 😅 Try emailing letstalk@reachupmedia.in instead!", 'bot');
        console.error("Chat Error:", data);
      } else {
        addMessage(data.reply, 'bot');
      }
    } catch (err) {
      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      
      addMessage("Connection error! 😱 Please contact us on WhatsApp instead.", 'bot');
      console.error(err);
    }
  });
});
