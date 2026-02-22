// --- PDF Viewer Modal Logic ---
function setupPDFViewer() {
  const pdfSection = document.getElementById('pdf-viewer-section');
  const pdfIframe = document.getElementById('pdf-iframe');
  const closeBtn = document.getElementById('close-pdf-viewer');
  if (!pdfSection || !pdfIframe || !closeBtn) return;
  // Open PDF
  document.querySelectorAll('.btn-case-study').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const pdf = btn.getAttribute('data-pdf');
      if (!pdf) return;
      pdfIframe.src = pdf;
      pdfSection.style.display = 'flex';
      setTimeout(() => pdfSection.classList.add('show'), 10);
      document.body.classList.add('no-scroll');
    });
  });
  // Close PDF
  closeBtn.addEventListener('click', function () {
    pdfSection.classList.remove('show');
    setTimeout(() => {
      pdfSection.style.display = 'none';
      pdfIframe.src = '';
      document.body.classList.remove('no-scroll');
    }, 350);
  });
  // Close on overlay click (outside container)
  pdfSection.addEventListener('click', function (e) {
    if (e.target === pdfSection) closeBtn.click();
  });
  // Close on Escape key
  window.addEventListener('keydown', function (e) {
    if (pdfSection.style.display === 'flex' && (e.key === 'Escape' || e.keyCode === 27)) closeBtn.click();
  });
}
window.addEventListener('DOMContentLoaded', setupPDFViewer);
// ReachUp Media - Interactions
(function () {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Toggle to enable/disable enhanced animations site-wide (easy revert)
  const enableEnhancedAnimations = true;
  // Toggle to enable a local, no-backend chatbot widget (expose globally so the widget initializer can see it)
  window.enableLocalChatbot = true;

  // Mobile nav toggle
  const toggle = qs('.menu-toggle');
  const nav = qs('.nav');
  if (toggle && nav) {
    // Create backdrop for mobile menu
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    const setExpanded = (open) => {
      if (open) {
        nav.classList.add('show');
        backdrop.classList.add('show');
        document.body.classList.add('no-scroll');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.innerHTML = '✕';
      } else {
        nav.classList.remove('show');
        backdrop.classList.remove('show');
        document.body.classList.remove('no-scroll');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '☰';
      }
    };

    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('show');
      setExpanded(open);
    });

    // Close when clicking a nav link (useful on small screens)
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      setExpanded(false);
    });
    // Close when tapping backdrop
    backdrop.addEventListener('click', () => setExpanded(false));
    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setExpanded(false);
    });
  }

  // Highlight active nav link based on current path
  try {
    const current = (location.pathname.split('/').pop() || 'index.html').replace(/\/?$/, '');
    qsa('.nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const isInternal = href.endsWith('.html') || href === './' || href === '/';
      if (!isInternal) return;
      const normalized = href.replace(/^\.\//, '');
      const matchIndex = current === '' ? (normalized === '' || normalized === 'index.html') : (normalized === current);
      if (matchIndex) a.classList.add('active');
    });
  } catch (e) { /* noop */ }

  // Add body loaded class for initial animations
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    // Ensure brand logo has a graceful fallback if the PNG is missing
    try {
      const logos = qsa('.brand .logo');
      const makePlaceholder = (box) => {
        if (!box) return;
        box.textContent = 'RU';
        box.classList.add('placeholder');
      };
      logos.forEach(box => {
        const img = box.querySelector('img');
        if (!img) { makePlaceholder(box); return; }
        const check = () => {
          if (!(img.complete && img.naturalWidth > 0)) makePlaceholder(box);
        };
        img.addEventListener('error', () => makePlaceholder(box));
        // Defer a tick to let the browser try to load, then verify
        setTimeout(check, 0);
      });
    } catch (e) { /* noop */ }
    if (!prefersReduced && enableEnhancedAnimations) {
      document.body.classList.add('enhanced-anim');
      // Assign directional effects and staggered delays to reveal elements
      const reveals = qsa('.reveal');
      const fxs = ['fx-up', 'fx-left', 'fx-right', 'fx-zoom'];
      // Group by nearest grid/container for nicer per-row staggering
      const groups = new Map();
      reveals.forEach((el) => {
        const key = el.closest('.grid') || el.closest('.container') || document.body;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(el);
      });
      groups.forEach((els) => {
        els.forEach((el, i) => {
          const fx = fxs[i % fxs.length];
          el.classList.add(fx);
          el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 70}ms`);
        });
      });
    }
  });

  // Scroll progress bar and header shadow
  (function setupScrollUI() {
    const progress = document.createElement('div');
    progress.className = 'progress';
    document.body.appendChild(progress);
    const header = qs('.header');

    const onScroll = () => {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      const ratio = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0;
      progress.style.setProperty('--scroll', String(ratio));
      if (header) header.classList.toggle('scrolled', scrollTop > 6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  // Reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  qsa('.reveal').forEach(el => observer.observe(el));

  // Smooth scroll for internal links
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id && qs(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  // Basic form handling (mailto fallback)
  const form = qs('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      // If there's no configured backend (action '#'), use mailto to open email client.
      const hasBackend = form.getAttribute('action') && form.getAttribute('action') !== '#';
      // Netlify handles submission when data-netlify="true" even with action missing; let it pass through.
      const isNetlify = form.hasAttribute('data-netlify');
      if (!hasBackend && !isNetlify) {
        e.preventDefault();
        const name = qs('[name="name"]', form)?.value ?? '';
        const email = qs('[name="email"]', form)?.value ?? '';
        const message = qs('[name="message"]', form)?.value ?? '';
        const subject = encodeURIComponent(`New enquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        const recipients = 'suraj@reachupmedia.in,letstalk@reachupmedia.in';
        const mail = `mailto:${recipients}?subject=${subject}&body=${body}`;
        window.location.href = mail;
      }
    });
  }

  // KPI count-up animation when visible
  if (!prefersReduced) {
    const kpis = qsa('.kpi');
    const re = /^\s*([0-9]+(?:\.[0-9]+)?)(.*)$/;
    const animateNumber = (el) => {
      const text = el.textContent || '';
      const m = text.match(re);
      if (!m) return; // no leading number
      const target = parseFloat(m[1]);
      const suffix = m[2] || '';
      const start = 0;
      const dur = 900; // ms
      const startTime = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - startTime) / dur);
        const val = (start + (target - start) * p);
        el.textContent = `${val.toFixed(target % 1 ? 1 : 0)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const kpiObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateNumber(e.target);
          kpiObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    kpis.forEach(k => kpiObserver.observe(k));
  }
})();

// --- Lightweight local chatbot (no backend, simple Q&A) ---
(function () {
  if (typeof enableLocalChatbot === 'undefined' || !enableLocalChatbot) return;
  try {
    const kb = [
      { q: [/service|offer|what.*do.*you.*do|work.*with/i], a: "We help with Influencer Campaigns, Brand Collaborations, Artist & Band Management, Content/UGC, and Social Media Marketing. Check Services for details." },
      { q: [/contact|email|mail/i], a: "You can email us at suraj@reachupmedia.in or letstalk@reachupmedia.in. We usually reply within 24 hours." },
      { q: [/phone|call|number|whatsapp/i], a: "Call/WhatsApp: +91 7973043372. We’re available during business hours IST." },
      { q: [/dheer|artist|band/i], a: "Dheer Official — a contemporary artist for college fests, corporate events, and concerts. See highlights in Portfolio or Instagram @dheerofficial_." },
      { q: [/price|pricing|cost|rate/i], a: "Pricing depends on scope, creators, and deliverables. Share your brief via Contact — we’ll send a tailored proposal." },
      { q: [/location|where|india|pan-?india/i], a: "We operate Pan‑India and work with regional and niche creators across languages." },
    ];

    const ask = (text) => {
      const t = (text || '').trim();
      if (!t) return "Could you share a bit more? For example: services, pricing, or how to contact us.";
      const hit = kb.find(item => item.q.some(re => re.test(t)));
      if (hit) return hit.a;
      // fallback: more helpful
      return "I'm your ReachUp Assistant! Try asking about services, pricing, contact, or Dheer Official. For anything else, email us at suraj@reachupmedia.in or use the contact form. 😊";
    };

    // UI
    const toggle = document.createElement('button');
    toggle.className = 'chatbot-toggle';
    toggle.setAttribute('aria-label', 'Open chat');
    toggle.textContent = '💬';

    const panel = document.createElement('div');
    panel.className = 'chatbot-panel';
    panel.innerHTML = `
      <div class="chatbot-header">
        <div class="title">💬 ReachUp Assistant</div>
        <button class="btn" style="background:#eef2ff;color:#1e40af;padding:6px 10px;border-radius:8px;">Close</button>
      </div>
      <div class="chatbot-body" role="log" aria-live="polite"></div>
      <div class="chatbot-footer">
        <input class="chatbot-input" type="text" placeholder="Ask about services, pricing, contact…" />
        <button class="chatbot-send">Send</button>
      </div>`;

    const body = panel.querySelector('.chatbot-body');
    const input = panel.querySelector('.chatbot-input');
    const sendBtn = panel.querySelector('.chatbot-send');
    const closeBtn = panel.querySelector('.chatbot-header .btn');

    const addMsg = (text, who = 'bot') => {
      const div = document.createElement('div');
      div.className = `chatbot-msg ${who}`;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    };

    // Typing indicator
    const showTyping = () => {
      const typing = document.createElement('div');
      typing.className = 'chatbot-msg bot typing';
      typing.textContent = 'Typing...';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      return typing;
    };

    const onSend = () => {
      const val = (input.value || '').trim();
      if (!val) return;
      addMsg(val, 'user');
      input.value = '';
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        addMsg(ask(val), 'bot');
      }, 600);
    };

    toggle.addEventListener('click', () => {
      panel.classList.toggle('show');
      if (panel.classList.contains('show') && !panel.dataset.greeted) {
        panel.dataset.greeted = '1';
        addMsg("👋 Hi! I'm your ReachUp Assistant. Ask me about services, pricing, or how to contact us. Type your question below!");
      }
    });
    closeBtn.addEventListener('click', () => panel.classList.remove('show'));
    sendBtn.addEventListener('click', onSend);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') onSend(); });

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  } catch (e) { /* noop */ }
})();

// Follow CTA: no animation — let the anchor behave normally
// (Removed slide-to-open interception so the link opens instantly.)
