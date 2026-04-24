/**
 * ReachUp Media Custom Neo-Brutalist Chatbot
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Chatbot HTML into the DOM
  const chatbotHTML = `
    <!-- Chatbot Toggle Button -->
    <button id="reachbot-toggle" class="reachbot-toggle" aria-label="Toggle Chat">
      <span class="reachbot-icon">💬</span>
      <span class="reachbot-text">ASK REACHBOT</span>
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

  // Add Message to UI
  const addMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text; // allow safe HTML like bolding and links
    
    msgDiv.appendChild(bubble);
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  };

  // Bot Logic Engine
  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.match(/(service|what do you do|offer|help|marketing|manage)/)) {
      return "We specialize in <strong>Influencer Marketing</strong>, <strong>Artist & Band Management</strong>, <strong>Content & UGC</strong>, and overall Social Media strategy. Want to see some of our work?";
    }
    else if (lowerInput.match(/(work|campaign|portfolio|client|brand)/)) {
      return "We've run massive creator-led campaigns for brands like <strong>CabBazar</strong> (1.6M+ reach!), <strong>Be Minimalist</strong>, <strong>Monginis</strong>, and <strong>Space Seven Fitness</strong>. Check out our <a href='./portfolio.html' style='text-decoration:underline; font-weight:900; color:#000;'>Portfolio Page</a>!";
    }
    else if (lowerInput.match(/(contact|email|phone|whatsapp|reach|talk|call)/)) {
      return "Ready to break the algorithm? 🚀 Email us at <a href='mailto:suraj@reachupmedia.in'>suraj@reachupmedia.in</a>, or WhatsApp us at <a href='https://wa.me/917973043372' target='_blank'>+91 7973043372</a>.";
    }
    else if (lowerInput.match(/(hi|hello|hey|sup)/)) {
      return "Hey! How can I help you today? You can ask me about our services or our past campaigns.";
    }
    else if (lowerInput.match(/(price|cost|charge)/)) {
      return "Every campaign is uniquely crafted to fit your brand's specific needs and scale. It's best to chat with our founder! Shoot an email to <strong>suraj@reachupmedia.in</strong>.";
    }
    else {
      return "I'm still learning the ropes! 😅 For the best answer to that, you should probably just reach out directly at <strong>suraj@reachupmedia.in</strong> or WhatsApp <strong>+91 7973043372</strong>.";
    }
  };

  // Handle Form Submission
  chatForm.addEventListener('submit', (e) => {
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

    // 3. Generate and Delay Bot Response
    const botResponse = getBotResponse(userText);
    
    setTimeout(() => {
      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      
      // Add real response
      addMessage(botResponse, 'bot');
    }, 800 + Math.random() * 600); // 0.8s to 1.4s delay for realism
  });
});
