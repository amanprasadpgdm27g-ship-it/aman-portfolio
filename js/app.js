/**
 * Main Application Script for Aman Prasad Laheri Portfolio
 * Handles view switching, bluish theme toggle, photo switcher,
 * right-side sticky scroll spy, and interactive UI widgets.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentTheme = localStorage.getItem('aman_portfolio_theme') || 'dark';
  let activeView = 'home';
  let blockchainSim = null;

  // DOM Elements
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const viewHome = document.getElementById('view-home');
  const viewJourney = document.getElementById('view-journey');
  const viewExplore = document.getElementById('view-explore');
  const heroFrame = document.getElementById('heroFrame');
  const heroImg = document.getElementById('heroBackdropImg');
  const toggleBlurBtn = document.getElementById('toggleBlurBtn');
  const photoInput = document.getElementById('photoInput');
  const changePhotoBtn = document.getElementById('changePhotoBtn');
  const contactModal = document.getElementById('contactModal');
  const toastNotice = document.getElementById('toastNotice');

  // --- 1. Bluish Theme Management ---
  function applyTheme(theme) {
    if (theme === 'light') {
      htmlEl.setAttribute('data-theme', 'light');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
        themeToggleBtn.setAttribute('title', 'Switch to Bluish Dark Mode');
      }
    } else {
      htmlEl.removeAttribute('data-theme');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
        themeToggleBtn.setAttribute('title', 'Switch to Bluish Light Mode');
      }
    }
    localStorage.setItem('aman_portfolio_theme', theme);
  }

  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = (currentTheme === 'dark') ? 'light' : 'dark';
      applyTheme(currentTheme);
      showToast(`Switched to ${currentTheme === 'dark' ? 'Deep Bluish Dark' : 'Icy Bluish Light'} Mode`);
    });
  }

  // --- 2. View Switching System ---
  window.switchView = function(viewName) {
    activeView = viewName;
    const views = [viewHome, viewJourney, viewExplore];
    views.forEach(v => {
      if (v) {
        v.classList.remove('active');
      }
    });

    const portalBtns = document.querySelectorAll('.nav-portal-btn');
    portalBtns.forEach(btn => btn.classList.remove('active'));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'journey') {
      if (viewJourney) viewJourney.classList.add('active');
      const btn = document.querySelector('[data-portal="journey"]');
      if (btn) btn.classList.add('active');
      initScrollSpy('journey');
    } else if (viewName === 'explore') {
      if (viewExplore) viewExplore.classList.add('active');
      const btn = document.querySelector('[data-portal="explore"]');
      if (btn) btn.classList.add('active');
      initScrollSpy('explore');
      
      // Initialize blockchain simulation if not already initialized
      if (!blockchainSim && window.BlockchainSimulator) {
        blockchainSim = new window.BlockchainSimulator('chainBlocksContainer', 'chainStatusIndicator');
        blockchainSim.init();
      }
    } else {
      if (viewHome) viewHome.classList.add('active');
    }

    window.location.hash = viewName;
  };

  // Check URL hash on page load
  const hash = window.location.hash.replace('#', '');
  if (['home', 'journey', 'explore'].includes(hash)) {
    switchView(hash);
  } else {
    switchView('home');
  }

  // --- 3. Hero Backdrop Photo & Blur Controls ---
  // Load saved custom photo if present
  const savedPhoto = localStorage.getItem('aman_custom_photo');
  if (savedPhoto && heroImg) {
    heroImg.src = savedPhoto;
  }

  if (toggleBlurBtn && heroFrame) {
    toggleBlurBtn.addEventListener('click', () => {
      heroFrame.classList.toggle('deblurred');
      const isDeblurred = heroFrame.classList.contains('deblurred');
      toggleBlurBtn.innerHTML = isDeblurred 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Blur Background` 
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> Focus / Unblur`;
    });
  }

  if (changePhotoBtn && photoInput) {
    changePhotoBtn.addEventListener('click', () => {
      photoInput.click();
    });

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const result = evt.target.result;
          if (heroImg) heroImg.src = result;
          try {
            localStorage.setItem('aman_custom_photo', result);
            showToast('Hero photo updated successfully!');
          } catch(err) {
            showToast('Photo updated (File is too large for permanent localStorage storage)');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- 4. Right-Side Sticky ScrollSpy for Submodules ---
  let observer = null;
  function initScrollSpy(sectionPrefix) {
    if (observer) {
      observer.disconnect();
    }

    const sections = document.querySelectorAll(`#view-${sectionPrefix} .submodule-section`);
    const navLinks = document.querySelectorAll(`#sidebar-${sectionPrefix} .sidebar-item-link`);

    if (sections.length === 0 || navLinks.length === 0) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    });

    sections.forEach(s => observer.observe(s));
  }

  // --- 5. Abba Nahi Maanenge Interactive Widget ---
  window.testPersuasion = function(scenario) {
    const meterFill = document.getElementById('abbaMeterFill');
    const meterText = document.getElementById('abbaMeterText');
    const resultBox = document.getElementById('abbaResultBox');
    if (!meterFill || !meterText || !resultBox) return;

    playChime();

    if (scenario === 'safe') {
      meterFill.style.width = '40%';
      meterText.textContent = 'Persuasion: 40% (Sharma ji ka beta enters the chat)';
      resultBox.innerHTML = `
        <div style="font-size: 1.05rem; font-weight: 700; color: var(--accent-amber);">
          "Beta, Sharma ji ke bete ko dekho, government job ya conventional engineering safe hai!"
        </div>
        <p style="margin-top: 0.4rem; color: var(--text-secondary);">
          Aman's Response: "Abba, risk manage karna hi finance ka असली खेल hai! Let me show you my valuation model."
        </p>
      `;
    } else if (scenario === 'fintech') {
      meterFill.style.width = '85%';
      meterText.textContent = 'Persuasion: 85% (Curiosity Piqued!)';
      resultBox.innerHTML = `
        <div style="font-size: 1.05rem; font-weight: 700; color: var(--accent-cyan);">
          "Achha... ye blockchain aur digital lending me sach me future hai kya?"
        </div>
        <p style="margin-top: 0.4rem; color: var(--text-secondary);">
          Aman's Response: "Bilkul! Building tamper-proof ledgers and automated credit assessment at GLIM Gurgaon!"
        </p>
      `;
    } else if (scenario === 'cricket_finance') {
      meterFill.style.width = '100%';
      meterText.textContent = 'Persuasion: 100% (ABBA MAAN GAYE! 🎉)';
      resultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-emerald);">
          "Mera beta tournament me Best Batsman bhi hai, aur Times of India me high-value receivables bhi sort kar raha hai!"
        </div>
        <p style="margin-top: 0.4rem; color: var(--text-secondary); font-weight: 600;">
          Abba: "Ja Aman, jee le apni zindagi! Make Great Lakes and our family proud!" 🏏📈
        </p>
      `;
      showToast('🎉 Abba Maan Gaye! 100% Persuasion Reached!');
    }
  };

  // Web Audio Synth for interactive feedback
  function playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch(e) {
      // Audio context not allowed or not supported; fail silently
    }
  }

  // --- 6. Blockchain Simulation Quick Add Trigger ---
  window.triggerAddBlock = function() {
    if (!blockchainSim) return;
    const sender = prompt('Enter Transaction Sender (e.g., GLIM Treasury, Client MAS, Ad Agency):', 'Times of India MAS');
    if (!sender) return;
    const receiver = prompt('Enter Transaction Receiver:', 'Vendor Reconciliation');
    if (!receiver) return;
    const amount = prompt('Enter Amount in INR:', '3,50,000');
    if (!amount) return;

    blockchainSim.addBlock(`Tx: ${sender} -> ${receiver} (₹ ${amount})`);
    showToast('New block added and mined successfully!');
  };

  window.triggerResetChain = function() {
    if (blockchainSim) {
      blockchainSim.init();
      showToast('Blockchain restored to verified Genesis state.');
    }
  };

  // --- 7. Contact Modal & Social Links ---
  window.openContactModal = function() {
    if (contactModal) {
      contactModal.classList.add('open');
    }
  };

  window.closeContactModal = function() {
    if (contactModal) {
      contactModal.classList.remove('open');
    }
  };

  window.copyEmail = function(emailStr) {
    navigator.clipboard.writeText(emailStr).then(() => {
      showToast(`Copied email to clipboard: ${emailStr}`);
    }).catch(() => {
      showToast(`Email: ${emailStr}`);
    });
  };

  // Handle Contact Form Submit Simulation
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      showToast(`Thank you, ${name}! Your message has been routed to Aman.`);
      closeContactModal();
      contactForm.reset();
    });
  }

  // Close modal on click outside
  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        closeContactModal();
      }
    });
  }

  // --- 8. Toast Helper ---
  function showToast(msg) {
    if (!toastNotice) return;
    toastNotice.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 3200);
  }

  window.showToast = showToast;
});
