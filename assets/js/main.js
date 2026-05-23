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
        toggle.innerHTML = '⋮';
      }
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
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
    let lastScrollTop = 0;

    const onScroll = () => {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      const ratio = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0;
      progress.style.setProperty('--scroll', String(ratio));
      if (header) header.classList.toggle('scrolled', scrollTop > 6);

      // Mobile Floating Widget Optimization
      if (window.innerWidth <= 768) {
        const liveBtn = document.getElementById('live-campaign-btn');
        const chatToggle = document.querySelector('.reachbot-toggle');
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Scrolling down
          if (liveBtn) liveBtn.classList.add('hide-on-mobile-scroll');
          if (chatToggle) chatToggle.classList.add('hide-on-mobile-scroll');
        } else {
          // Scrolling up
          if (liveBtn) liveBtn.classList.remove('hide-on-mobile-scroll');
          if (chatToggle) chatToggle.classList.remove('hide-on-mobile-scroll');
        }
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
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

// Local chatbot removed (handled entirely by chatbot.js now)

// --- App-Like Page Transitions ---
(function() {
  const isInternalLink = (url) => {
    // Check if it's the same origin
    if (url.origin !== window.location.origin) return false;
    // Check if it's a file download or media link (has extension other than .html)
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
    if (hasExtension && !url.pathname.endsWith('.html')) return false;
    return true; // Supports Vercel clean URLs (e.g. /portfolio instead of /portfolio.html)
  };

  // Inject required CSS for sweeps
  const style = document.createElement('style');
  style.innerHTML = `
    .page-sweep {
      position: fixed;
      top: 0; left: -20%; width: 140%; bottom: 0;
      pointer-events: none;
      transform: translateX(-200%) skewX(-15deg);
      transform-origin: bottom left;
      display: none; /* Hide completely from render tree to prevent Safari blocking */
    }
  `;
  document.head.appendChild(style);

  // Create 3 layered sweeps with HEX colors (safest for JS inline styles)
  // Cyan -> Magenta -> Dark
  const colors = ['#00f0ff', '#ff0055', '#0b0b0b'];
  const sweeps = colors.map((color, i) => {
    const el = document.createElement('div');
    el.className = 'page-sweep';
    el.style.backgroundColor = color; // Use backgroundColor explicitly
    el.style.zIndex = 999999 + i;
    el.style.transform = 'translateX(0) skewX(-15deg)'; // Start covering the screen
    el.style.display = 'block'; // Make visible for initial slide out
    document.body.appendChild(el);
    // FORCE REFLOW: Ensures the browser paints the "covered" state before requestAnimationFrame changes it!
    void el.offsetHeight; 
    return el;
  });

  // Reveal the page immediately after load (slide out to right)
  window.requestAnimationFrame(() => {
    // Reverse order on the way out: Top layer (Dark) slides away first to reveal Magenta, then Cyan!
    [...sweeps].reverse().forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.77, 0, 0.175, 1)';
        el.style.transform = 'translateX(200%) skewX(-15deg)';
        
        // Hide after animation finishes
        setTimeout(() => {
          el.style.display = 'none';
        }, 450);
      }, i * 75);
    });
  });

  // Fix for browser back button (bfcache)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      sweeps.forEach((el) => {
        el.style.transition = 'none';
        el.style.transform = 'translateX(200%) skewX(-15deg)';
        el.style.display = 'none';
      });
    }
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !a.href) return;
    const url = new URL(a.href, window.location.href);
    
    // Ignore external, blank targets, hash scrolls, mailto, tel, or download attributes
    if (a.target === '_blank' || url.hash || a.href.startsWith('mailto:') || a.href.startsWith('tel:') || a.hasAttribute('download')) return;
    
    if (isInternalLink(url)) {
      e.preventDefault();
      
      // Sweep in to cover from the left
      // Normal order on the way in: Cyan slides in, then Magenta covers it, then Dark covers it!
      sweeps.forEach((el, i) => {
        el.style.transition = 'none';
        el.style.transform = 'translateX(-200%) skewX(-15deg)';
        el.style.display = 'block'; // Make visible for animation
        
        // Force reflow
        void el.offsetHeight;

        setTimeout(() => {
          el.style.transition = 'transform 0.35s cubic-bezier(0.77, 0, 0.175, 1)';
          el.style.transform = 'translateX(0) skewX(-15deg)';
        }, i * 75);
      });

      // Redirect after animations complete
      setTimeout(() => {
        window.location.href = a.href;
      }, (sweeps.length * 75) + 300);
    }
  });
})();

// --- Dynamic Dark Mode Toggle ---
(function() {
  // Inject Dark Mode CSS dynamically
  const darkStyle = document.createElement('style');
  darkStyle.innerHTML = `
    body.dark-mode {
      --bg-main: #0b0b0b;
      --bg-alt: #1a1a1a;
      --text-main: #ffffff;
      --border-thick: 3px solid #fff;
      --border-thin: 2px solid #fff;
      --shadow-hard: 6px 6px 0px #fff;
      --shadow-hard-hover: 10px 10px 0px #fff;
      background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px);
    }
    
    /* Only apply dark background and white text to cards WITHOUT inline backgrounds */
    body.dark-mode .card:not([style*="background"]) {
      background: var(--bg-alt);
      color: #fff;
    }
    /* Protect elements that always have a light background by forcing local variables */
    body.dark-mode .alt-bg,
    body.dark-mode .card[style*="--accent-cyan"],
    body.dark-mode .card[style*="--accent-yellow"],
    body.dark-mode .card[style*="background: #fff"],
    body.dark-mode .card[style*="background:#fff"] {
      --text-main: #000 !important;
      color: #000;
    }

    /* Except if a paragraph inside alt-bg explicitly asks for white text on a black background */
    body.dark-mode .alt-bg p[style*="color: #fff"],
    body.dark-mode .alt-bg p[style*="color:#fff"] {
      color: #fff !important;
    }

    body.dark-mode .card,
    body.dark-mode .nav a {
      border-color: #fff;
      box-shadow: var(--shadow-hard);
    }
    
    body.dark-mode .nav a {
      background: var(--bg-alt);
      color: #fff;
    }

    body.dark-mode .nav {
      background: rgba(11,11,11,0.9);
    }
    body.dark-mode .btn,
    body.dark-mode .nav a:hover,
    body.dark-mode .nav a.active {
      box-shadow: 4px 4px 0 #fff;
    }
    body.dark-mode .btn-primary { 
      color: #000 !important; 
    }
    body.dark-mode .icon-box,
    body.dark-mode .badge {
      border-color: #fff;
      box-shadow: 4px 4px 0 #fff;
    }
    body.dark-mode .header {
      background: rgba(11, 11, 11, 0.7);
      border-bottom-color: #fff;
    }
    body.dark-mode .header.scrolled {
      background: rgba(11, 11, 11, 0.85);
      box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
    }
    body.dark-mode .team-photo { 
      border-color: #fff; 
      box-shadow: 4px 4px 0 #fff; 
    }
    body.dark-mode .footer {
      box-shadow: inset 0 6px 0 rgba(255, 255, 255, 0.1);
      border-top-color: #fff;
    }
  `;
  document.head.appendChild(darkStyle);

  // Load saved preference. Default to light mode unless explicitly saved as dark mode.
  const savedDarkMode = localStorage.getItem('reachup_dark_mode');
  
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Inject Toggle Button into Header
  window.addEventListener('DOMContentLoaded', () => {
    const headerInner = document.querySelector('.header .inner');
    if (!headerInner) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-ghost dark-mode-toggle';
    toggleBtn.style.padding = '8px';
    toggleBtn.style.borderRadius = '50%';
    toggleBtn.style.width = '44px';
    toggleBtn.style.height = '44px';
    toggleBtn.style.fontSize = '1.2rem';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    toggleBtn.style.marginLeft = 'auto';
    toggleBtn.style.marginRight = '16px';
    toggleBtn.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🕶️';
    
    // Insert before "menu-toggle" button
    const menuToggle = headerInner.querySelector('.menu-toggle');
    if (menuToggle) {
      headerInner.insertBefore(toggleBtn, menuToggle);
    } else {
      headerInner.appendChild(toggleBtn);
    }

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      toggleBtn.innerHTML = isDark ? '☀️' : '🕶️';
      localStorage.setItem('reachup_dark_mode', isDark);
    });
  });
})();

// --- Dynamic Campaign Stats ---
(function() {
  async function fetchCampaignStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const liveCount = json.data.liveCount;
        
        // Update floating button
        const liveBtnText = document.querySelector('#live-campaign-btn .hover-text');
        if (liveBtnText) {
          liveBtnText.textContent = `${liveCount} Brand Campaign${liveCount === 1 ? '' : 's'}`;
        }
      }
    } catch (err) {
      console.error('Failed to fetch campaign stats:', err);
    }
  }
  
  // Fetch stats on load
  window.addEventListener('DOMContentLoaded', fetchCampaignStats);

  // --- Campaign Estimator Widget Logic ---
  function initCampaignEstimator() {
    const budgetInput = document.getElementById('est-budget');
    const budgetVal = document.getElementById('est-budget-val');
    const nicheInput = document.getElementById('est-niche');
    const mixInput = document.getElementById('est-mix');
    
    const viewsOutput = document.getElementById('est-views');
    const creatorsOutput = document.getElementById('est-creators');
    const erOutput = document.getElementById('est-er');
    const pitchBtn = document.getElementById('est-pitch-btn');
    
    if (!budgetInput || !nicheInput || !mixInput) return;

    function updateEstimates() {
      const budget = parseInt(budgetInput.value);
      
      // Update budget label
      budgetVal.textContent = `₹${budget.toLocaleString('en-IN')}`;
      
      // CPM baseline values for Indian regional markets (increased to reduce estimated views slightly)
      const cpms = {
        mobility: 320,
        fitness: 450,
        skincare: 520,
        fmcg: 360,
        tech: 580
      };
      
      // Creator baseline cost factors based on mix (increased to reduce estimated creators count slightly)
      const creatorCosts = {
        nano: 10000,
        balanced: 20000,
        macro: 60000
      };
      
      const engagementRates = {
        nano: '5.5%',
        balanced: '3.8%',
        macro: '2.1%'
      };
      
      const viewMultipliers = {
        nano: 1.2,
        balanced: 1.0,
        macro: 0.85
      };

      const selectedNiche = nicheInput.value;
      const selectedMix = mixInput.value;
      
      // 1. Calculate Estimated Creators
      let creatorCount = Math.round(budget / creatorCosts[selectedMix]);
      if (creatorCount < 1) creatorCount = 1;
      
      // 2. Calculate Estimated Views (Budget / CPM * 1000 * multiplier)
      const cpm = cpms[selectedNiche];
      const viewMultiplier = viewMultipliers[selectedMix];
      let estimatedViews = Math.round((budget / cpm) * 1000 * viewMultiplier);
      
      // Format views nicely
      let formattedViews = '';
      if (estimatedViews >= 100000) {
        formattedViews = `${(estimatedViews / 100000).toFixed(1)} Lakh+`;
      } else {
        formattedViews = `${estimatedViews.toLocaleString('en-IN')}+`;
      }
      
      // 3. Expected Engagement
      const expectedER = engagementRates[selectedMix];
      
      // Update UI elements
      viewsOutput.textContent = formattedViews;
      creatorsOutput.textContent = `${creatorCount} Creator${creatorCount === 1 ? '' : 's'}`;
      erOutput.textContent = expectedER;
      
      // 4. Update WhatsApp pitch link
      const nicheLabel = nicheInput.options[nicheInput.selectedIndex].text;
      const mixLabel = mixInput.options[mixInput.selectedIndex].text;
      const pitchMsg = encodeURIComponent(
        `Hi ReachUp Media, let's collaborate! I want to pitch a campaign:\n\n` +
        `- Budget: ₹${budget.toLocaleString('en-IN')}\n` +
        `- Focus/Niche: ${nicheLabel}\n` +
        `- Creator Mix: ${mixLabel}\n` +
        `- Target Views: ${formattedViews}\n` +
        `- Target Creators: ${creatorCount}\n\n` +
        `Let's discuss this strategy!`
      );
      pitchBtn.href = `https://wa.me/917973043372?text=${pitchMsg}`;
    }

    budgetInput.addEventListener('input', updateEstimates);
    nicheInput.addEventListener('change', updateEstimates);
    mixInput.addEventListener('change', updateEstimates);
    
    // Initial run
    updateEstimates();
  }

  // --- Portfolio Filter Logic ---
  function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('#portfolio-filters-sec .filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (filterButtons.length === 0 || portfolioItems.length === 0) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active button background colors (Neo-brutalist custom styling overrides)
        filterButtons.forEach(b => {
          b.classList.remove('active');
          b.style.background = '#fff';
        });
        btn.classList.add('active');
        btn.style.background = 'var(--accent-yellow)';
        
        const filterVal = btn.getAttribute('data-filter');
        
        portfolioItems.forEach(item => {
          if (filterVal === 'all') {
            item.style.display = 'block';
            // Fade-in effect
            item.style.opacity = '1';
          } else {
            const itemCat = item.getAttribute('data-category');
            if (itemCat === filterVal) {
              item.style.display = 'block';
              item.style.opacity = '1';
            } else {
              item.style.display = 'none';
              item.style.opacity = '0';
            }
          }
        });
      });
    });
  }

  // --- Creator Intake Form Handler ---
  function initCreatorIntakeForm() {
    const creatorForm = document.getElementById('creator-form');
    if (!creatorForm) return;
    
    creatorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = creatorForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting Details...';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(creatorForm);
        // AJAX POST to FormSubmit
        const response = await fetch(creatorForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success modal
          const modal = document.getElementById('creator-success-modal');
          if (modal) {
            modal.style.display = 'flex';
          }
          creatorForm.reset();
        } else {
          showToast('Failed to submit application. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting creator form:', err);
        showToast('Submission error. Please check your connection.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
    
    const closeModalBtn = document.getElementById('close-creator-modal');
    const successModal = document.getElementById('creator-success-modal');
    if (closeModalBtn && successModal) {
      closeModalBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
      });
      // Close modal on click outside
      successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
          successModal.style.display = 'none';
        }
      });
    }
  }

  // --- Custom Clipboard Toast Logic ---
  function showToast(message) {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 40px;
      background: #fff;
      color: #000;
      border: 3px solid #000;
      box-shadow: 6px 6px 0 #000;
      padding: 16px 24px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 800;
      text-transform: uppercase;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    toast.innerHTML = `<span>📋</span> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    // Force reflow
    void toast.offsetHeight;
    
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }

  function setupClipboardCopy() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href') || '';
      
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        // Strip out tel: and mailto: links and URL parameters
        const cleanText = href.replace(/^(mailto:|tel:)/, '').split('?')[0];
        
        // Copy to clipboard
        navigator.clipboard.writeText(cleanText).then(() => {
          showToast(`Copied to Clipboard: ${cleanText}`);
        }).catch(err => {
          console.error('Failed to copy to clipboard:', err);
        });
      }
    });
  }

  // Initialize all features on load
  window.addEventListener('DOMContentLoaded', () => {
    initCampaignEstimator();
    initPortfolioFilters();
    initCreatorIntakeForm();
    setupClipboardCopy();
  });
})();
