/* ===== NEXORA — Interactive Script ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== Particle System =====
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let animationFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.opacitySpeed = (Math.random() - 0.5) * 0.003;
      // Random hue between purple and cyan
      const hueRange = [260, 190]; // purple to cyan
      this.hue = Math.random() > 0.5
        ? hueRange[0] + Math.random() * 20
        : hueRange[1] + Math.random() * 20;
      this.saturation = 70 + Math.random() * 20;
      this.lightness = 55 + Math.random() * 15;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity += this.opacitySpeed;

      if (this.opacity <= 0.05 || this.opacity >= 0.6) {
        this.opacitySpeed *= -1;
      }

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
      }

      // Wrap around
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;
      ctx.fill();

      // Glow effect for larger particles
      if (this.size > 1.2) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity * 0.12})`;
        ctx.fill();
      }
    }
  }

  // Determine number of particles based on screen
  const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawConnectionLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const opacity = (1 - dist / 140) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnectionLines();
    animationFrame = requestAnimationFrame(animateParticles);
  }

  animateParticles();

  // Track mouse for particle interaction
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });


  // ===== Cursor Glow =====
  const cursorGlow = document.createElement('div');
  cursorGlow.classList.add('cursor-glow');
  document.body.appendChild(cursorGlow);

  let glowX = 0, glowY = 0;
  let targetGlowX = 0, targetGlowY = 0;

  document.addEventListener('mousemove', (e) => {
    targetGlowX = e.clientX;
    targetGlowY = e.clientY;
  });

  function updateCursorGlow() {
    glowX += (targetGlowX - glowX) * 0.08;
    glowY += (targetGlowY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(updateCursorGlow);
  }
  updateCursorGlow();


  // ===== Navbar Scroll Effect & Active Highlight =====
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a, .footer-links a');
  const allSmoothLinks = document.querySelectorAll('a[href^="#"]');

  // Active Link Highlight Function
  function updateActiveNav() {
    const currentScroll = window.scrollY;

    // Navbar Scrolled Style
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Section Highlight
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // offset for nav
      const sectionHeight = section.offsetHeight;
      if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    } else if (currentScroll < 100) {
      // Clear active states at very top
      navLinks.forEach(link => link.classList.remove('active'));
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav(); // Initial check

  // Smooth Scrolling JS Enhancement
  allSmoothLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      // Only process actual ID links
      if (targetId && targetId !== '#' && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          // Use scrollIntoView with smooth behavior. CSS scroll-margin-top handles offset.
          targetSection.scrollIntoView({ behavior: 'smooth' });
          
          // If mobile menu is open, close it
          const mobileMenu = document.getElementById('mobile-menu');
          const mobileMenuBtn = document.getElementById('mobile-menu-btn');
          if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
          }
        }
      }
    });
  });

  // ===== Specific Button Overrides & Debugging =====
  
  // ===== Authentication Flow & Modal Logic =====
  const authModal = document.getElementById('auth-modal');
  const authModalClose = document.getElementById('auth-modal-close');
  const loginContainer = document.getElementById('login-container');
  const signupContainer = document.getElementById('signup-container');
  
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  const unloggedUI = document.getElementById('auth-unlogged');
  const loggedUI = document.getElementById('auth-logged');
  const userNameDisplay = document.getElementById('user-name-display');
  const logoutBtn = document.getElementById('logout-btn');

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

  // Toggle internal forms
  document.getElementById('switch-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
  });

  document.getElementById('switch-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  });

  // Open Modal
  const loginLinks = document.querySelectorAll('a[href="#login"]');
  loginLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.body.style.overflow = 'hidden';
      authModal.classList.add('active');
      loginContainer.style.display = 'block';
      signupContainer.style.display = 'none';
    });
  });

  // Close Modal
  authModalClose.addEventListener('click', () => {
    document.body.style.overflow = '';
    authModal.classList.remove('active');
  });

  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      document.body.style.overflow = '';
      authModal.classList.remove('active');
    }
  });

  function showAuthError(formType, message) {
    const errorEl = document.getElementById(`${formType}-error`);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function hideAuthError(formType) {
    const errorEl = document.getElementById(`${formType}-error`);
    errorEl.style.display = 'none';
  }

  function setButtonLoading(formEl, isLoading) {
    const btn = formEl.querySelector('.auth-submit-btn');
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-loading');
    if (isLoading) {
      btn.disabled = true;
      text.style.display = 'none';
      spinner.style.display = 'flex';
    } else {
      btn.disabled = false;
      text.style.display = 'inline';
      spinner.style.display = 'none';
    }
  }

  // Handle Signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthError('signup');
    setButtonLoading(signupForm, true);

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      console.log("Signup response:", data);
      
      if (data.status === 'success') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nexora_token', data.token); // Unity with dashboard config
        localStorage.setItem('userName', data.data.user.name);
        localStorage.setItem('nexora_user', JSON.stringify(data.data.user));
        
        authModal.classList.remove('active');
        document.body.style.overflow = '';
        checkAuthState();
        signupForm.reset();

        // Redirect to dashboard based on role
        if (data.data.user.role === 'admin') {
           window.location.href = "admin-dashboard.html";
        } else {
           window.location.href = "dashboard.html";
        }

      } else {
        showAuthError('signup', data.error || data.message || 'Error creating account');
      }
    } catch (err) {
      console.error("Signup error:", err);
      showAuthError('signup', 'Server not responding. Please start backend.');
    } finally {
      setButtonLoading(signupForm, false);
    }
  });

  // Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthError('login');
    setButtonLoading(loginForm, true);

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json();
      console.log("Login response:", data);
      
      if (data.status === 'success') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nexora_token', data.token);
        localStorage.setItem('userName', data.data.user.name);
        localStorage.setItem('nexora_user', JSON.stringify(data.data.user));

        authModal.classList.remove('active');
        document.body.style.overflow = '';
        checkAuthState();
        loginForm.reset();

        // Redirect to dashboard based on role
        if (data.data.user.role === 'admin') {
           window.location.href = "admin-dashboard.html";
        } else {
           window.location.href = "dashboard.html";
        }

      } else {
        showAuthError('login', data.error || data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error("Login error:", err);
      showAuthError('login', 'Server not responding. Please start backend.');
    } finally {
      setButtonLoading(loginForm, false);
    }
  });

  // Check Auth State on Load
  function checkAuthState() {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    
    if (token && name) {
      // User is logged in
      if (unloggedUI) unloggedUI.style.display = 'none';
      if (loggedUI) loggedUI.style.display = 'flex';
      if (userNameDisplay) {
        // Just getting the first name
        userNameDisplay.textContent = name.split(' ')[0];
      }
    } else {
      // User is logged out
      if (unloggedUI) unloggedUI.style.display = 'flex';
      if (loggedUI) loggedUI.style.display = 'none';
    }
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      checkAuthState();
      alert('You have been logged out.');
    });
  }

  // Initialize Auth UI
  checkAuthState();

  // ===== Hero "Get Started" Button Logic =====
  const heroGetStartedBtn = document.getElementById('cta-get-started');
  if (heroGetStartedBtn) {
    // Wrap existing text in a span for clean animation toggling
    const btnTextContent = heroGetStartedBtn.innerHTML;
    heroGetStartedBtn.innerHTML = `
      <span class="btn-glow"></span>
      <span class="cta-btn-text">${btnTextContent.replace('<span class="btn-glow"></span>', '').trim()}</span>
      <span class="cta-btn-loader" aria-hidden="true">
        <span class="cta-spinner"></span>
        <span>Loading…</span>
      </span>
    `;

    heroGetStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Prevent double-clicks while animating
      if (heroGetStartedBtn.classList.contains('cta-loading')) return;

      // 1. Click feedback — scale down + glow pulse
      heroGetStartedBtn.classList.add('cta-clicked');
      setTimeout(() => heroGetStartedBtn.classList.remove('cta-clicked'), 300);

      // 2. Check auth state (support both key names used across the project)
      const isLogged =
        (localStorage.getItem('token') && localStorage.getItem('userName')) ||
        localStorage.getItem('nexora_token');

      // 3. Show loading state via CSS class
      heroGetStartedBtn.classList.add('cta-loading');

      setTimeout(() => {
        heroGetStartedBtn.classList.remove('cta-loading');

        if (isLogged) {
          // ✅ Logged in → smooth-scroll to services section (#features)
          const servicesSection = document.getElementById('features');
          if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          // 🔒 Not logged in → open signup/login modal
          document.body.style.overflow = 'hidden';
          if (authModal) authModal.classList.add('active');
          if (loginContainer && signupContainer) {
            loginContainer.style.display = 'none';
            signupContainer.style.display = 'block';
          }
        }
      }, 500); // brief loading animation before action
    });
  }

  // ===== Global Click Feedback & Logger =====
  document.querySelectorAll('a, button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Add animation scaling generic feedback
      this.classList.add('click-feedback-active');
      setTimeout(() => {
        this.classList.remove('click-feedback-active');
      }, 150);

      // Logging logic
      if (this.tagName === 'A') {
        const href = this.getAttribute('href');
        console.log(`[Interaction] Link clicked -> ${href || 'Empty/Dead Link'}`);
      } else {
        const id = this.id || 'Unnamed Button';
        const classNames = this.className || 'No Class';
        console.log(`[Interaction] Button clicked -> ID: ${id} | Class: ${classNames}`);
      }
    });
  });

  // ===== Demo Modal Logic =====
  const demoModal = document.getElementById('demo-modal');
  const demoModalClose = document.getElementById('demo-modal-close');
  const viewDemoLinks = document.querySelectorAll('a[href="#demo"]');

  if (demoModal && demoModalClose) {
    viewDemoLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.overflow = 'hidden';
        demoModal.classList.add('active');
      });
    });

    demoModalClose.addEventListener('click', () => {
      document.body.style.overflow = '';
      demoModal.classList.remove('active');
    });

    demoModal.addEventListener('click', (e) => {
      if (e.target === demoModal) {
        document.body.style.overflow = '';
        demoModal.classList.remove('active');
      }
    });
  }
  // ===== Mobile Menu Toggle =====
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }


  // ===== Typing Effect on Heading =====
  const headingEl = document.querySelector('.hero-heading');
  if (headingEl) {
    // Add shimmer overlay
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(
        110deg,
        transparent 20%,
        rgba(255,255,255,0.04) 40%,
        rgba(255,255,255,0.07) 50%,
        rgba(255,255,255,0.04) 60%,
        transparent 80%
      );
      background-size: 200% 100%;
      animation: shimmerEffect 5s ease-in-out infinite;
      pointer-events: none;
      border-radius: 12px;
    `;
    headingEl.style.position = 'relative';
    headingEl.style.overflow = 'hidden';
    headingEl.appendChild(shimmer);

    // Add shimmer keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmerEffect {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }


  // ===== Floating Cards Parallax on Mouse =====
  const floatingCards = document.querySelectorAll('.floating-card');

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    floatingCards.forEach((card, i) => {
      const factor = (i % 2 === 0 ? 1 : -1) * (12 + i * 4);
      const rotFactor = (i % 2 === 0 ? 1 : -1) * 2;
      card.style.transform = `
        translateX(${x * factor}px)
        translateY(${y * factor}px)
        rotate(${x * rotFactor}deg)
      `;
    });
  });


  // ===== Button Ripple Effect =====
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.15);
        top: ${e.clientY - rect.top - size/2}px;
        left: ${e.clientX - rect.left - size/2}px;
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Ripple animation
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes rippleAnim {
      to {
        transform: scale(1);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);


  // ===== Intersection Observer for re-triggering animations =====
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-in, .animate-float').forEach(el => {
    observer.observe(el);
  });


  // ===== Scroll Reveal for Services Section =====
  const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Only unobserve once revealed (one-shot animation)
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    scrollRevealObserver.observe(el);
  });


  // ===== Service Cards — Tilt on Mouse Move =====
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
        scale(1.02)
      `;

      // Move the glow to follow the cursor
      const glowEl = card.querySelector('.service-card-glow');
      if (glowEl) {
        glowEl.style.background = `radial-gradient(
          350px circle at ${x}px ${y}px,
          rgba(124, 58, 237, 0.14) 0%,
          transparent 70%
        )`;
        glowEl.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      const glowEl = card.querySelector('.service-card-glow');
      if (glowEl) {
        glowEl.style.opacity = '0';
        glowEl.style.background = '';
      }
    });
  });


  // ===== AI Chatbot Demo — Animated Conversation =====
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  let chatStarted = false;

  const conversation = [
    {
      type: 'ai',
      text: 'Hi there! 👋 I\'m NEXORA AI. How can I help your business today?',
      delay: 600
    },
    {
      type: 'user',
      text: 'I want a website for my business',
      delay: 2000
    },
    {
      type: 'ai',
      text: 'Great! We can create a modern website with AI chatbot, automation tools, and growth features. What type of business do you have?',
      delay: 1800
    },
    {
      type: 'user',
      text: 'Restaurant',
      delay: 2200
    },
    {
      type: 'ai',
      text: 'Perfect! 🍽️ We\'ll build a restaurant website with online menu, ordering system, and AI assistant. Would you like a free demo?',
      delay: 2000
    },
    {
      type: 'user',
      text: 'Yes, that sounds amazing!',
      delay: 2400
    },
    {
      type: 'ai',
      text: 'Awesome! 🚀 I\'ll set that up for you right away. You\'ll have a live preview in under 60 seconds. Let me grab some details...',
      delay: 2000
    }
  ];

  function createMessageEl(msg) {
    const div = document.createElement('div');
    div.className = `chat-msg msg-${msg.type}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = msg.type === 'ai' ? 'AI' : 'U';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = msg.text;

    div.appendChild(avatar);
    div.appendChild(bubble);
    return div;
  }

  function createTypingEl() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = 'AI';
    avatar.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.12))';
    avatar.style.border = '1px solid rgba(124,58,237,0.2)';
    avatar.style.color = '#a78bfa';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    div.appendChild(avatar);
    div.appendChild(dots);
    return div;
  }

  function playConversation() {
    if (chatStarted) return;
    chatStarted = true;

    let totalDelay = 500;

    conversation.forEach((msg, i) => {
      // If AI msg, show typing first
      if (msg.type === 'ai') {
        setTimeout(() => {
          const typing = createTypingEl();
          chatMessages.appendChild(typing);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, totalDelay);

        totalDelay += 1200; // typing duration
      }

      // If user msg, simulate typing in input
      if (msg.type === 'user') {
        const typeStart = totalDelay;
        const chars = msg.text.split('');
        chars.forEach((char, ci) => {
          setTimeout(() => {
            chatInput.value = msg.text.substring(0, ci + 1);
          }, typeStart + ci * 40);
        });
        totalDelay += chars.length * 40 + 200;
      }

      setTimeout(() => {
        // Remove typing indicator
        const typing = chatMessages.querySelector('.typing-indicator');
        if (typing) typing.remove();

        // Clear input for user messages
        if (msg.type === 'user') {
          chatInput.value = '';
        }

        // Add the message
        const el = createMessageEl(msg);
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, totalDelay);

      totalDelay += msg.delay;
    });

    // After full conversation, wait and replay
    setTimeout(() => {
      chatStarted = false;
      chatMessages.innerHTML = '';
      chatInput.value = '';
      // Replay after a brief pause
      setTimeout(() => playConversation(), 2000);
    }, totalDelay + 3000);
  }

  // Trigger chat when section comes into view
  if (chatMessages) {
    const chatObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !chatStarted) {
          playConversation();
        }
      });
    }, { threshold: 0.3 });

    chatObserver.observe(document.getElementById('chatbot-container'));
  }


  // ===== Portfolio Filter & View All =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const viewAllBtn = document.getElementById('view-all-projects-btn');
  const extraCards = document.querySelectorAll('.portfolio-extra-card');
  let showingAllProjects = false;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioCards.forEach(card => {
        const categories = card.dataset.category || '';
        const isExtra = card.classList.contains('portfolio-extra-card');
        
        // Check if card matches filter
        const matchesFilter = (filter === 'all' || categories.includes(filter));
        
        if (matchesFilter) {
          if (!isExtra || showingAllProjects) {
            card.classList.remove('hidden');
            card.style.position = '';
            card.style.visibility = '';
          }
        } else {
          card.classList.add('hidden');
          // After transition, set position absolute to remove from document flow
          setTimeout(() => {
            if (card.classList.contains('hidden')) {
              card.style.position = 'absolute';
              card.style.visibility = 'hidden';
            }
          }, 500);
        }
      });
    });
  });

  // View All Projects Handler
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      showingAllProjects = true;
      
      // Reveal extra cards with class logic
      extraCards.forEach((card, index) => {
        // Only show if it matches current filter
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const categories = card.dataset.category || '';
        
        if (activeFilter === 'all' || categories.includes(activeFilter)) {
          card.classList.add('show');       // CSS class for fade-in
          card.classList.remove('hidden');  // Remove hidden state
          card.style.position = '';
          card.style.visibility = '';
          
          // Add staggered delays dynamically
          card.style.animationDelay = `${index * 0.1}s`;
        }
      });
      
      // Hide the button after clicked
      viewAllBtn.style.opacity = '0';
      setTimeout(() => {
        viewAllBtn.parentElement.style.display = 'none';
      }, 300);
    });
  }

  // ===== Pricing Tabs Switching Logic =====
  const pricingTabs = document.querySelectorAll('.pricing-tab');
  const pricingContents = document.querySelectorAll('.pricing-tab-content');

  pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      pricingTabs.forEach(t => t.classList.remove('active'));
      // Add active to clicked
      tab.classList.add('active');

      const targetTabId = 'pricing-' + tab.dataset.pricingTab;

      // Hide all contents and show target
      pricingContents.forEach(content => {
        if (content.id === targetTabId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // Global CTA Pricing function used by inline HTML onclick
  window.handlePricingCTA = function() {
    const isAuth = !!localStorage.getItem('token') || !!localStorage.getItem('nexora_token');
    if (isAuth) {
      // Scroll to features/services
      const target = document.getElementById('features');
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    } else {
      // Open auth modal
      const authModal = document.getElementById('auth-modal');
      const authError = document.getElementById('auth-error');
      if (authModal) {
        authModal.style.display = 'flex';
        authModal.style.opacity = '1';
        if(authError) authError.textContent = '';
      }
    }
  };

  // ===== Pricing Currency Toggle =====
  const currencyToggle = document.getElementById('currency-toggle');
  const inrLabel = document.getElementById('currency-inr-label');
  const usdLabel = document.getElementById('currency-usd-label');
  let isUSD = false;

  if (inrLabel) inrLabel.classList.add('active');

  if (currencyToggle) {
    currencyToggle.addEventListener('click', () => {
      isUSD = !isUSD;
      currencyToggle.classList.toggle('toggled');

      // Update active label
      if (isUSD) {
        inrLabel.classList.remove('active');
        usdLabel.classList.add('active');
      } else {
        usdLabel.classList.remove('active');
        inrLabel.classList.add('active');
      }

      // Update all prices
      document.querySelectorAll('.plan-price').forEach(priceEl => {
        const currencyEl = priceEl.querySelector('.price-currency');
        const amountEl = priceEl.querySelector('.price-amount');

        // Animate
        amountEl.classList.add('price-changing');
        setTimeout(() => amountEl.classList.remove('price-changing'), 400);

        // Update values at the midpoint of the animation
        setTimeout(() => {
          if (isUSD) {
            currencyEl.textContent = '$';
            amountEl.textContent = priceEl.dataset.usd;
          } else {
            currencyEl.textContent = '₹';
            amountEl.textContent = priceEl.dataset.inr;
          }
        }, 160);
      });
    });
  }


  // ===== Lead Capture Form =====
  const leadForm = document.getElementById('lead-form');
  const submitBtn = document.getElementById('lead-submit-btn');
  const formSuccess = document.getElementById('form-success');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show loading state
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      // Simulate submission (replace with real API call)
      setTimeout(() => {
        // Hide form fields, show success
        btnText.style.display = '';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';

        // Show success message
        formSuccess.style.display = 'flex';
        submitBtn.style.display = 'none';

        // Also hide WhatsApp button
        const waBtn = leadForm.querySelector('.lead-btn-whatsapp');
        if (waBtn) waBtn.style.display = 'none';

        // Reset form
        leadForm.reset();
      }, 1500);
    });

    // Input focus glow on form wrapper
    const formInputs = leadForm.querySelectorAll('input');
    const formGlow = document.querySelector('.lead-form-glow');
    formInputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (formGlow) formGlow.style.opacity = '0.55';
      });
      input.addEventListener('blur', () => {
        if (formGlow) formGlow.style.opacity = '0.35';
      });
    });
  }


  // ===== Performance: Reduce animations when tab is not visible =====
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    } else {
      animateParticles();
    }
  });

  // ===== Prefers Reduced Motion =====
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.animate-in, .animate-float').forEach(el => {
      el.style.animation = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    if (animationFrame) cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cursorGlow.remove();
  }

});

/* ============================================================ */
/* ===== SERVICE MODAL CONFIGURATIONS & INTERFACE LOGIC ===== */
/* ============================================================ */

const SERVICE_CONFIG = {
  'website-development': {
    title: 'Website Development',
    desc: 'AI-powered website creation with stunning, responsive designs that convert visitors into loyal customers.',
    features: ['Custom Frontend Architecture', 'Full SEO Optimization', 'Backend Integration'],
    useCases: ['Business website', 'Digital Portfolio', 'Web App interface'],
    benefits: 'Establish a strong online presence, increase credibility, and drive more organic traffic directly to your business.',
    example: 'A local restaurant increased online reservations by 40% after we redesigned their site with an integrated automated booking system.',
    formFields: `<div class="form-group">
      <label>Frontend Style</label>
      <select class="form-control" name="frontend_style" required>
        <option value="" disabled selected>Select UI preference</option>
        <option value="3D/Animated">3D & Animated</option>
        <option value="Modern/Responsive">Modern Responsive</option>
        <option value="Minimal">Minimal UI</option>
      </select>
    </div>
    <div class="form-group">
      <label>Tech Stack / Framework</label>
      <input type="text" class="form-control" name="tech_stack" placeholder="e.g. Next.js, React, HTML/CSS..." required>
    </div>
    <div class="form-group">
      <label>Desired Features (comma separated)</label>
      <input type="text" class="form-control" name="features" placeholder="Login, Payments, Admin Panel...">
    </div>`
  },
  'ai-chatbots': {
    title: 'AI Chatbots',
    desc: 'Intelligent conversational agents that engage customers 24/7, answer queries, and drive sales automatically.',
    features: ['24/7 Availability', 'Natural Language Processing', 'Multi-channel integration'],
    useCases: ['Customer Support', 'Lead Generation', 'Internal Knowledge Base'],
    benefits: 'Slash support costs while providing instant, accurate answers to your customers at any time of day.',
    example: 'An e-commerce store reduced support tickets by 60% by implementing our AI agent to handle order tracking and FAQs.',
    formFields: `<div class="form-group">
      <label>Primary Use Case</label>
      <select class="form-control" name="use_case" required>
        <option value="" disabled selected>Select Primary Use</option>
        <option value="Customer Support">Customer Support</option>
        <option value="Lead Generation">Lead Generation</option>
        <option value="Internal Knowledge">Internal Knowledge Base</option>
      </select>
    </div>
    <div class="form-group">
      <label>Target Audience</label>
      <input type="text" class="form-control" name="audience" placeholder="Describe who will chat with this bot..." required>
    </div>`
  },
  'automation-systems': {
    title: 'Automation Systems',
    desc: 'Streamline workflows and eliminate repetitive tasks with AI-driven automation that saves time and resources.',
    features: ['Zapier / Make Configuration', 'Custom Scripting', 'API Development'],
    useCases: ['Data entry automation', 'Email sequence triggers', 'Invoice processing'],
    benefits: 'Free up your team to focus on high-value tasks while ensuring zero human error in repetitive processes.',
    example: 'A real estate agency saved 20 hours a week by automating their property listing updates across multiple platforms.',
    formFields: `<div class="form-group">
      <label>Systems to Integrate</label>
      <input type="text" class="form-control" name="systems" placeholder="e.g. Shopify, Gmail, Slack..." required>
    </div>
    <div class="form-group">
      <label>Current Workflow Bottlenecks</label>
      <textarea class="form-control" name="bottlenecks" placeholder="Describe the manual task you want automated..."></textarea>
    </div>`
  },
  'e-commerce-solutions': {
    title: 'E-commerce Solutions',
    desc: 'Full-featured online stores with AI product recommendations, smart inventory, and seamless payment processing.',
    features: ['Shopify/Custom Storefronts', 'AI Recommendation Engines', 'Stripe Integration'],
    useCases: ['Retail stores', 'Digital products', 'Subscription boxes'],
    benefits: 'Maximize revenue with optimized checkout flows and personalized product suggestions for every visitor.',
    example: 'A boutique clothing brand saw a 25% increase in average order value using our AI product recommendation engine.',
    formFields: `<div class="form-group">
      <label>Store Platform</label>
      <input type="text" class="form-control" name="platform" placeholder="e.g. Shopify, WooCommerce, Custom..." required>
    </div>
    <div class="form-group">
      <label>Number of Products</label>
      <select class="form-control" name="products" required>
        <option value="1-50">1 - 50</option>
        <option value="50-500">50 - 500</option>
        <option value="500+">500+</option>
      </select>
    </div>`
  },
  'marketing-seo': {
    title: 'Marketing & SEO',
    desc: 'Data-driven marketing strategies and AI-optimized SEO that boost your visibility and organic traffic.',
    features: ['Keyword Research', 'AI Content Generation', 'Ad Optimization'],
    useCases: ['Local businesses', 'SaaS products', 'Content creators'],
    benefits: 'Dominate search rankings and acquire customers at a fraction of the cost of traditional advertising.',
    example: 'A dental clinic doubled their monthly patient inquiries within 3 months through our targeted local SEO campaign.',
    formFields: `<div class="form-group">
      <label>Business Niche</label>
      <input type="text" class="form-control" name="niche" placeholder="e.g. Real Estate, SaaS, E-commerce..." required>
    </div>
    <div class="form-group">
      <label>Target Platforms</label>
      <input type="text" class="form-control" name="platforms" placeholder="Google Ads, Meta, SEO Blog..." required>
    </div>
    <div class="form-group">
      <label>Monthly Traffic Goal</label>
      <input type="text" class="form-control" name="goal" placeholder="e.g. 10,000 visitors/mo">
    </div>`
  },
  'analytics-dashboard': {
    title: 'Analytics Dashboard',
    desc: 'Real-time business insights and custom reporting dashboards to track your most important metrics.',
    features: ['Custom Data Visualizations', 'Multiple API integrations', 'Export Support'],
    useCases: ['Sales tracking', 'Marketing ROI', 'User behavior'],
    benefits: 'Make confident, data-driven decisions instantly instead of waiting days for manual reports.',
    example: 'A SaaS company identified a critical churn bottleneck by visualizing user onboarding drop-offs in our custom dashboard.',
    formFields: `<div class="form-group">
      <label>Data Sources</label>
      <input type="text" class="form-control" name="sources" placeholder="Google Analytics, Stripe, Custom DB..." required>
    </div>
    <div class="form-group">
      <label>Key Metrics</label>
      <textarea class="form-control" name="metrics" placeholder="Which KPIs are most important to you?"></textarea>
    </div>`
  },
  'ai-agents': {
    title: 'AI Agents',
    desc: 'Smart AI agents for automation, customer handling, and internal company workflows.',
    features: ['Process automation', 'Autonomous executing logic', 'LLM integration'],
    useCases: ['Automated Outreach', 'Research Assistant', 'HR Onboarding'],
    benefits: 'Deploy a highly capable digital workforce that scales infinitely without overhead costs.',
    example: 'A law firm deployed an AI research agent that reduced case preparation time from days to mere hours.',
    formFields: `<div class="form-group">
      <label>Agent Role</label>
      <input type="text" class="form-control" name="role" placeholder="e.g. Support, Research, Data Entry..." required>
    </div>
    <div class="form-group">
      <label>Integrations Required</label>
      <input type="text" class="form-control" name="integrations" placeholder="WhatsApp, Website, Internal Dashboard..." required>
    </div>`
  },
  'ai-marketing': {
    title: 'AI Marketing',
    desc: 'AI-powered ad optimization, content generation, and lead generation designed to scale.',
    features: ['Automated A/B Testing', 'AI Generated Creatives', 'Conversion Optimization'],
    useCases: ['Social Media Ads', 'Email Campaigns', 'Dynamic Retargeting'],
    benefits: 'Achieve superhuman ROAS by letting AI test thousands of ad variations and audiences simultaneously.',
    example: 'A fitness app reduced their cost-per-acquisition by 40% using our AI to dynamically generate and test ad creatives.',
    formFields: `<div class="form-group">
      <label>Current Monthly Ad Spend</label>
      <select class="form-control" name="spend" required>
        <option value="<$5k">Under $5k</option>
        <option value="$5k-$50k">$5k - $50k</option>
        <option value=">$50k">Over $50k</option>
      </select>
    </div>
    <div class="form-group">
      <label>Primary Goal</label>
      <select class="form-control" name="goal" required>
        <option value="Traffic">Traffic</option>
        <option value="Leads">Leads / Signups</option>
        <option value="Sales">Direct Sales</option>
      </select>
    </div>`
  },
  'ai-saas-solutions': {
    title: 'AI SaaS Solutions',
    desc: 'Custom SaaS platforms specifically built natively with AI engines to ensure scalability and product-market fit.',
    features: ['Full Stack AI integration', 'Premium User Dashboard', 'Scalable Cloud Backend'],
    useCases: ['AI writing tools', 'Image generators', 'Predictive analytics software'],
    benefits: 'Launch a highly competitive, defensible software product powered by cutting-edge AI technology.',
    example: 'We built a specialized AI writing platform for academics that reached $10k MRR in its first two months.',
    formFields: `<div class="form-group">
      <label>Core AI Feature</label>
      <textarea class="form-control" name="core_ai" placeholder="Describe the AI logic your SaaS needs..." required></textarea>
    </div>
    <div class="form-group">
      <label>Target Users</label>
      <input type="text" class="form-control" name="target_users" placeholder="e.g. B2B Businesses, Students..." required>
    </div>`
  }
};

/* --- Global Open/Close Functions --- */

function openLearnMoreModal(serviceId) {
  const config = SERVICE_CONFIG[serviceId];
  if (!config) return;

  document.getElementById('lm-title').textContent = config.title;
  document.getElementById('lm-desc').textContent = config.desc;
  
  const featureList = document.getElementById('lm-features');
  if(featureList) {
    featureList.innerHTML = config.features.map(f => 
      `<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${f}</span></li>`
    ).join('');
  }

  const usecaseList = document.getElementById('lm-use-cases');
  if(usecaseList) {
    usecaseList.innerHTML = config.useCases.map(uc => 
      `<li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> <span>${uc}</span></li>`
    ).join('');
  }

  const benefitsEl = document.getElementById('lm-benefits');
  if(benefitsEl) benefitsEl.textContent = config.benefits;

  const exampleEl = document.getElementById('lm-example');
  if(exampleEl) exampleEl.textContent = config.example;

  document.getElementById('learn-more-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLearnMoreModal() {
  document.getElementById('learn-more-modal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function openServiceForm(serviceId) {
  // Authentication check!
  const token = localStorage.getItem('nexora_token');
  if (!token) {
    // Should already be blurred/disabled, but catch just in case
    return document.getElementById('auth-modal').classList.add('active');
  }

  const config = SERVICE_CONFIG[serviceId];
  if (!config) return;

  document.getElementById('sf-service-name').textContent = config.title;
  document.getElementById('sf-service-id').value = config.title;
  
  // Inject Dynamic Form fields
  document.getElementById('dynamic-form-fields').innerHTML = config.formFields;
  
  // Reset message blocks
  const msgEl = document.getElementById('form-submit-msg');
  msgEl.className = 'form-message';
  msgEl.style.display = 'none';

  document.getElementById('service-form-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeServiceForm() {
  document.getElementById('service-form-modal').classList.remove('active');
  document.body.style.overflow = 'auto';
  document.getElementById('project-form').reset();
}

/* --- Project Submission Logic --- */

document.getElementById('project-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const btn = document.getElementById('form-submit-btn');
  const msgBox = document.getElementById('form-submit-msg');
  const token = localStorage.getItem('nexora_token');

  btn.classList.add('btn-loading');
  
  // Convert basic fields to Object mapping
  const formData = new FormData(form);
  const payload = {
    serviceType: formData.get('serviceId'),
    formData: {}
  };

  // Assign dynamic data
  for (let [key, value] of formData.entries()) {
    if (key !== 'serviceId') {
      payload.formData[key] = value;
    }
  }

  try {
    const res = await fetch(`${API_URL}/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (res.ok) {
      msgBox.textContent = "Project request submitted successfully! We'll be in touch.";
      msgBox.className = 'form-message success';
      form.reset();
      
      setTimeout(() => {
        closeServiceForm();
      }, 2500);
    } else {
      msgBox.textContent = data.error || "Failed to submit request. Please try again.";
      msgBox.className = 'form-message error';
    }
  } catch (err) {
    msgBox.textContent = "Network error. Make sure you are connected.";
    msgBox.className = 'form-message error';
  } finally {
    btn.classList.remove('btn-loading');
  }
});

/* --- Authentication Initialization (Unlocking UI) --- */

function initServiceUIUnlocking() {
  const token = localStorage.getItem('nexora_token');
  const lockedBtns = document.querySelectorAll('.btn-locked');

  if (token) {
    lockedBtns.forEach(btn => {
      btn.classList.add('unlocked');
      // Change content inside
      const iconSpan = btn.querySelector('.locked-icon');
      const textSpan = btn.querySelector('.locked-text');
      if (iconSpan) iconSpan.textContent = '🚀'; // Unlock emoji
      if (textSpan) textSpan.textContent = 'Start Project';
    });
  } else {
    lockedBtns.forEach(btn => {
      btn.classList.remove('unlocked');
      const iconSpan = btn.querySelector('.locked-icon');
      const textSpan = btn.querySelector('.locked-text');
      if (iconSpan) iconSpan.textContent = '🔒';
      if (textSpan) textSpan.textContent = 'Get Started';
    });
  }
}

// Check unlocking immediately upon script loading
document.addEventListener('DOMContentLoaded', () => {
  initServiceUIUnlocking();

  // Close dynamic modals when clicking outside
  document.querySelectorAll('.dynamic-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      // If clicking directly on the overlay background (not content inside)
      if(e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Also clean up any forms inside an opened service-form modal
        const form = modal.querySelector('form');
        if(form) form.reset();
      }
    });
  });
});

// Since the existing authentication logic handles LocalStorage, we overwrite the custom window auth flow to catch login
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  // Just piggybacking to see if auth succeeded then we init
  if (args[0].includes('/api/auth/login') || args[0].includes('/api/auth/signup')) {
    setTimeout(initServiceUIUnlocking, 1000);
  }
  return response;
};
