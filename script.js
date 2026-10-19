/**
 * PIP'S MIDNIGHT OBSERVATORY — INTERACTIVE ENGINE
 * haX.baby Hackathon 2026 · Track 1: Pip the Skull Baby
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTS & APPLICATION STATE
     ========================================================================== */
  const STATE = {
    theme: 'night',
    soundEnabled: false,
    easterEggClicks: 0,
    easterEggGoal: 7,
    audioCtx: null,
    dreamsDelivered: 1429,
    isDispatching: false
  };

  // Pentatonic scale frequencies for celestial chime lullabies (C major pentatonic)
  const NOTE_FREQS = {
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'G4': 392.00,
    'A4': 440.00,
    'C5': 523.25,
    'D5': 587.33,
    'E5': 659.25,
    'G5': 783.99
  };

  // Sample dream delivery messages
  const DREAM_DISPATCHES = [
    { destination: "Slumber Valley (Bed #402)", dream: "A flying origami crane that sings lullabies in the breeze." },
    { destination: "Whispering Chimneys (Apt 3B)", dream: "A swimming pool made of warm lavender pudding and soft marshmallow clouds." },
    { destination: "Cloud Cushion 9 (Cradle #12)", dream: "Riding a glowing friendly space whale through Saturn’s pastel rings." },
    { destination: "Moonlit Pine Forest", dream: "A hidden treehouse library where books whisper bedtime stories on their own." },
    { destination: "Coastal Star Harbor", dream: "Finding a glowing seashell that hums the melody of sweet forgotten dreams." },
    { destination: "Cosmic Hackathon Arena", dream: "A magical code compiler that fixes every single bug with a star burst! ✨" }
  ];

  // Default guestbook notes
  const DEFAULT_WISHES = [
    {
      name: "Sleepy Nova",
      sticker: "⭐",
      message: "Please build a dream where I can float weightlessly above the candy mountains!",
      date: "Oct 17, 2026"
    },
    {
      name: "Luna the Ghostling",
      sticker: "🌙",
      message: "Pip, thank you for making the nightlight amber. The monsters are our friends now!",
      date: "Oct 17, 2026"
    },
    {
      name: "Captain Pajamas",
      sticker: "🧸",
      message: "May your nightcap bow never untie! Best Junior Dream Engineer ever.",
      date: "Oct 16, 2026"
    },
    {
      name: "Hackathon Sleeper",
      sticker: "✨",
      message: "May all developers in the hackathon get at least 8 hours of cozy slumber tonight!",
      date: "Oct 16, 2026"
    }
  ];

  /* ==========================================================================
     2. DOM ELEMENTS CACHE
     ========================================================================== */
  const DOM = {
    html: document.documentElement,
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    themeLabel: document.getElementById('theme-label'),
    soundToggle: document.getElementById('sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    soundLabel: document.getElementById('sound-label'),
    menuToggle: document.getElementById('menu-toggle'),
    mobileNav: document.getElementById('mobile-nav'),
    mobileLinks: document.querySelectorAll('.mobile-nav-link'),
    navLinks: document.querySelectorAll('.nav-link'),
    starsField: document.getElementById('stars-field'),
    pipStage: document.getElementById('pip-stage'),
    pipCharacter: document.getElementById('pip-character'),
    eyeLeft: document.getElementById('eye-left'),
    eyeRight: document.getElementById('eye-right'),
    pipBubble: document.getElementById('pip-bubble'),
    pipBubbleText: document.getElementById('pip-bubble-text'),
    ticklePipBtn: document.getElementById('tickle-pip-btn'),
    easterEggStar: document.getElementById('easter-egg-star'),
    easterEggModal: document.getElementById('easter-egg-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    sparkleCanvas: document.getElementById('sparkle-canvas'),
    odometer: document.getElementById('odometer'),
    counterLastDigit: document.getElementById('counter-last-digit'),
    visitorGreeting: document.getElementById('visitor-greeting'),
    chimeKeys: document.querySelectorAll('.chime-key'),
    windLullabyBtn: document.getElementById('wind-lullaby-btn'),
    lullabyStatus: document.getElementById('lullaby-status'),
    lanternGlow: document.getElementById('lantern-glow'),
    swatchBtns: document.querySelectorAll('.swatch-btn'),
    lampReadingText: document.getElementById('lamp-reading-text'),
    dispatchRouteBtn: document.getElementById('dispatch-route-btn'),
    routeProgress: document.getElementById('route-progress'),
    deliveryCapsule: document.getElementById('delivery-capsule'),
    dispatchLog: document.getElementById('dispatch-log'),
    logActiveLine: document.getElementById('log-active-line'),
    deliveryHint: document.getElementById('delivery-hint'),
    storyScenes: document.querySelectorAll('.story-scene'),
    storyProgressLine: document.getElementById('story-progress-line'),
    guestbookForm: document.getElementById('guestbook-form'),
    wishName: document.getElementById('wish-name'),
    wishSticker: document.getElementById('wish-sticker'),
    wishMessage: document.getElementById('wish-message'),
    charCounter: document.getElementById('char-counter'),
    notesPinboard: document.getElementById('notes-pinboard'),
    clearWishesBtn: document.getElementById('clear-wishes-btn'),
    bedtimeBlessingBtn: document.getElementById('bedtime-blessing-btn'),
    // 360 Turntable Elements
    turntableStage: document.getElementById('turntable-stage'),
    turntableRig: document.getElementById('turntable-rig'),
    angleReadout: document.getElementById('angle-readout'),
    angleFacingLabel: document.getElementById('angle-facing-label'),
    reset360Btn: document.getElementById('reset-360-btn'),
    autospin360Btn: document.getElementById('autospin-360-btn'),
    autospinIcon: document.getElementById('autospin-icon'),
    autospinLabel: document.getElementById('autospin-label'),
    angleChips: document.querySelectorAll('.angle-chip'),
    turntableShadow: document.getElementById('turntable-shadow'),
    eye360Left: document.getElementById('eye-360-left'),
    eye360Right: document.getElementById('eye-360-right')
  };

  /* ==========================================================================
     3. AUDIO ENGINE (Web Audio API Synthesizer)
     Strictly OFF by default. Gentle, comforting pentatonic music box chimes.
     ========================================================================== */
  function getAudioContext() {
    if (!STATE.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        STATE.audioCtx = new AudioCtxClass();
      }
    }
    if (STATE.audioCtx && STATE.audioCtx.state === 'suspended') {
      STATE.audioCtx.resume();
    }
    return STATE.audioCtx;
  }

  /**
   * Plays a single gentle chime note using FM/Sine synthesis with bell-like decay
   */
  function playChime(noteOrFreq, duration = 1.2, volume = 0.25) {
    if (!STATE.soundEnabled) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const freq = typeof noteOrFreq === 'number' ? noteOrFreq : (NOTE_FREQS[noteOrFreq] || 440);
      const now = ctx.currentTime;

      // Primary tone oscillator
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Shimmer overtone oscillator (bell-like character)
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.01, now);

      // Envelope: Instant gentle attack, long exponential decay
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      overtoneGain.gain.setValueAtTime(0.0001, now);
      overtoneGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.015);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.6));

      osc.connect(gainNode);
      overtone.connect(overtoneGain);
      gainNode.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(now);
      overtone.start(now);

      osc.stop(now + duration);
      overtone.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Plays a short harmonious star twinkle chord or sparkle sound
   */
  function playStarTwinkle() {
    if (!STATE.soundEnabled) return;
    const chord = ['C5', 'E5', 'G5'];
    chord.forEach((note, index) => {
      setTimeout(() => playChime(note, 0.9, 0.18), index * 80);
    });
  }

  /**
   * Plays celebration fanfare for Easter Egg discovery
   */
  function playCelebrationFanfare() {
    if (!STATE.soundEnabled) return;
    const melody = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];
    melody.forEach((note, idx) => {
      setTimeout(() => playChime(note, 1.4, 0.22), idx * 110);
    });
  }

  /**
   * Plays full gentle 8-note lullaby sequence
   */
  let isLullabyPlaying = false;
  function playLullabySong() {
    if (isLullabyPlaying) return;
    isLullabyPlaying = true;

    // Enable sound if it was off so user hears what they requested
    if (!STATE.soundEnabled) {
      toggleSound(true);
    }

    const melody = [
      { note: 'G4', time: 0 },
      { note: 'E4', time: 400 },
      { note: 'G4', time: 800 },
      { note: 'A4', time: 1300 },
      { note: 'G4', time: 1800 },
      { note: 'E4', time: 2400 },
      { note: 'D4', time: 3000 },
      { note: 'C4', time: 3700 }
    ];

    if (DOM.lullabyStatus) {
      DOM.lullabyStatus.textContent = '🎶 Playing “Pip’s Midnight Slumber”...';
      DOM.lullabyStatus.style.color = '#fbbf24';
    }

    melody.forEach(item => {
      setTimeout(() => {
        playChime(item.note, 1.8, 0.28);
        // Highlight corresponding key on virtual keyboard
        const key = document.querySelector(`.chime-key[data-note="${item.note}"]`);
        if (key) {
          key.classList.add('key-active');
          setTimeout(() => key.classList.remove('key-active'), 320);
        }
      }, item.time);
    });

    setTimeout(() => {
      isLullabyPlaying = false;
      if (DOM.lullabyStatus) {
        DOM.lullabyStatus.textContent = '💤 Lullaby completed. Ready for sweet dreams!';
        DOM.lullabyStatus.style.color = '';
      }
    }, 4800);
  }

  function toggleSound(forceState) {
    STATE.soundEnabled = typeof forceState === 'boolean' ? forceState : !STATE.soundEnabled;

    if (STATE.soundEnabled) {
      getAudioContext();
      DOM.soundToggle.classList.add('sound-active');
      DOM.soundIcon.textContent = '🔊';
      DOM.soundLabel.textContent = 'Sound On';
      DOM.soundToggle.title = 'Sound: ON (Click to mute)';
      playChime('C5', 0.8, 0.2);
    } else {
      DOM.soundToggle.classList.remove('sound-active');
      DOM.soundIcon.textContent = '🔇';
      DOM.soundLabel.textContent = 'Muted';
      DOM.soundToggle.title = 'Sound: OFF (Click to unmute)';
    }
  }

  /* ==========================================================================
     4. DAY / NIGHT THEME CONTROLLER
     ========================================================================== */
  function applyTheme(theme) {
    STATE.theme = theme;
    DOM.html.setAttribute('data-theme', theme);
    localStorage.setItem('pip_theme', theme);

    if (theme === 'day') {
      DOM.themeIcon.textContent = '☀️';
      DOM.themeLabel.textContent = 'Day';
      DOM.themeToggle.title = 'Switch to Night Mode';
    } else {
      DOM.themeIcon.textContent = '🌙';
      DOM.themeLabel.textContent = 'Night';
      DOM.themeToggle.title = 'Switch to Day Mode';
    }
  }

  function toggleTheme() {
    const nextTheme = STATE.theme === 'night' ? 'day' : 'night';
    applyTheme(nextTheme);
    playStarTwinkle();
  }

  /* ==========================================================================
     5. DYNAMIC SKY STARS GENERATOR
     ========================================================================== */
  function generateSkyStars() {
    if (!DOM.starsField) return;
    const count = 75;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'sky-star';
      const size = Math.random() * 2.5 + 1;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 4;
      const duration = Math.random() * 2.5 + 2;

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.animationDelay = `${delay}s`;
      star.style.animationDuration = `${duration}s`;

      fragment.appendChild(star);
    }

    DOM.starsField.appendChild(fragment);
  }

  /* ==========================================================================
     6. INTERACTIVE PIP (Cursor parallax, eye tracking, tickle response)
     ========================================================================== */
  function initInteractivePip() {
    if (!DOM.pipStage || !DOM.pipCharacter) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    // Track mouse position over the hero stage
    window.addEventListener('mousemove', (e) => {
      // Only run on desktop screens (> 768px)
      if (window.innerWidth <= 768) return;

      const rect = DOM.pipStage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      targetRotY = Math.max(-14, Math.min(14, deltaX * 18));
      targetRotX = Math.max(-12, Math.min(12, -deltaY * 16));

      // Subtle amber eye tracking shift
      const eyeShiftX = Math.max(-3, Math.min(3, deltaX * 4));
      const eyeShiftY = Math.max(-2, Math.min(2, deltaY * 3));

      if (DOM.eyeLeft) DOM.eyeLeft.style.transform = `translate(${eyeShiftX}px, ${eyeShiftY}px)`;
      if (DOM.eyeRight) DOM.eyeRight.style.transform = `translate(${eyeShiftX}px, ${eyeShiftY}px)`;
    });

    // Smooth physics loop
    function updatePipTilt() {
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotY += (targetRotY - currentRotY) * 0.1;

      if (DOM.pipCharacter) {
        DOM.pipCharacter.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      }
      requestAnimationFrame(updatePipTilt);
    }
    requestAnimationFrame(updatePipTilt);

    // Cute Pip Thought Bubble Dialogues
    const pipThoughts = [
      "“Did you hear that star chime? 🌟”",
      "“One pinch of stardust, two yawns! 💤”",
      "“My nightcap bow is pinned with care! 🎀”",
      "“Silence is spooky... let’s make a melody! 🎵”",
      "“Who wants a dream about flying pancakes? 🥞”",
      "“Giggle! My amber eyes see right into bedtime! ✨”"
    ];
    let thoughtIdx = 0;

    function waveAtPip() {
      thoughtIdx = (thoughtIdx + 1) % pipThoughts.length;
      if (DOM.pipBubbleText) {
        DOM.pipBubbleText.textContent = pipThoughts[thoughtIdx];
      }
      DOM.pipCharacter.classList.remove('pip-bounce');
      void DOM.pipCharacter.offsetWidth; // Reflow
      DOM.pipCharacter.classList.add('pip-bounce');

      playChime('E5', 0.6, 0.2);
    }

    if (DOM.ticklePipBtn) {
      DOM.ticklePipBtn.addEventListener('click', waveAtPip);
    }
    DOM.pipCharacter.addEventListener('click', waveAtPip);
  }

  /* ==========================================================================
     7. HIDDEN EASTER EGG (Click Nightcap Star 7 Times)
     ========================================================================== */
  function initEasterEgg() {
    if (!DOM.easterEggStar) return;

    DOM.easterEggStar.addEventListener('click', (e) => {
      e.stopPropagation();
      STATE.easterEggClicks++;

      playChime(350 + (STATE.easterEggClicks * 60), 0.5, 0.2);

      // Playful feedback on Pip's speech bubble
      if (STATE.easterEggClicks < STATE.easterEggGoal) {
        const remaining = STATE.easterEggGoal - STATE.easterEggClicks;
        if (DOM.pipBubbleText) {
          DOM.pipBubbleText.textContent = `“Hehe, that tickles! ${remaining} more secret taps... ⭐”`;
        }
      } else {
        // Goal reached! Trigger celebration
        triggerEasterEggCelebration();
        STATE.easterEggClicks = 0; // Reset
      }
    });

    if (DOM.closeModalBtn && DOM.easterEggModal) {
      DOM.closeModalBtn.addEventListener('click', () => {
        DOM.easterEggModal.close();
      });
    }
  }

  function triggerEasterEggCelebration() {
    playCelebrationFanfare();
    launchConfetti();

    if (DOM.pipBubbleText) {
      DOM.pipBubbleText.textContent = "“YOU FOUND IT! You unlocked my secret stash! 🎉”";
    }

    if (DOM.easterEggModal) {
      if (typeof DOM.easterEggModal.showModal === 'function') {
        DOM.easterEggModal.showModal();
      } else {
        DOM.easterEggModal.setAttribute('open', 'true');
      }
    }
  }

  /* ==========================================================================
     8. CONFETTI & SPARKLE CURSOR ENGINES
     ========================================================================== */
  function launchConfetti() {
    const canvas = DOM.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#fbbf24', '#f472b6', '#c4b5fd', '#6ee7b7', '#fef3c7', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        life: 1
      });
    }

    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.rotSpeed;
        p.life -= 0.012;

        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          // Draw little star or diamond
          ctx.beginPath();
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fill();
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(renderConfetti);
  }

  // Sparkle cursor trail for desktop
  function initSparkleCursor() {
    const canvas = DOM.sparkleCanvas;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const sparkles = [];
    const colors = ['#fbbf24', '#f472b6', '#c4b5fd', '#ffffff'];

    window.addEventListener('mousemove', (e) => {
      // Throttle spawn rate
      if (Math.random() > 0.4) return;

      sparkles.push({
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 + 0.5
      });

      if (sparkles.length > 40) sparkles.shift();
    });

    function drawSparkles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.025;

        if (s.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Remove faded sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        if (sparkles[i].alpha <= 0) sparkles.splice(i, 1);
      }

      requestAnimationFrame(drawSparkles);
    }

    requestAnimationFrame(drawSparkles);
  }

  /* ==========================================================================
     9. PROJECT INTERACTIONS
     ========================================================================== */
  function initProjectInteractions() {
    // 1. Lullaby Keyboard
    DOM.chimeKeys.forEach(btn => {
      btn.addEventListener('click', () => {
        const note = btn.getAttribute('data-note');
        playChime(note, 1.3, 0.3);

        btn.classList.add('key-active');
        setTimeout(() => btn.classList.remove('key-active'), 250);

        if (DOM.lullabyStatus) {
          DOM.lullabyStatus.textContent = `Chimed Note ${note} ✨`;
        }
      });
    });

    if (DOM.windLullabyBtn) {
      DOM.windLullabyBtn.addEventListener('click', playLullabySong);
    }

    // 2. Nightlight Swatches
    const lampAtmospheres = {
      'amber': {
        glow: 'radial-gradient(circle, rgba(251, 191, 36, 0.65) 0%, rgba(251, 191, 36, 0.15) 50%, transparent 70%)',
        desc: 'Current Ambiance: <strong>Warm Amber</strong> · Perfect for sleepy stories.'
      },
      'moonlight': {
        glow: 'radial-gradient(circle, rgba(196, 181, 253, 0.65) 0%, rgba(167, 139, 250, 0.15) 50%, transparent 70%)',
        desc: 'Current Ambiance: <strong>Moonlight Violet</strong> · Casts dream protection.'
      },
      'aurora': {
        glow: 'radial-gradient(circle, rgba(110, 231, 183, 0.65) 0%, rgba(52, 211, 153, 0.15) 50%, transparent 70%)',
        desc: 'Current Ambiance: <strong>Stardust Mint</strong> · Clears bad dreams away.'
      }
    };

    DOM.swatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.swatchBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const color = btn.getAttribute('data-color');
        const config = lampAtmospheres[color];

        if (config && DOM.lanternGlow) {
          DOM.lanternGlow.style.background = config.glow;
          if (DOM.lampReadingText) DOM.lampReadingText.innerHTML = config.desc;
        }

        playChime('G5', 0.6, 0.2);
      });
    });

    // 3. Dream Delivery Route Simulator
    if (DOM.dispatchRouteBtn) {
      DOM.dispatchRouteBtn.addEventListener('click', launchDreamDispatch);
    }
  }

  function launchDreamDispatch() {
    if (STATE.isDispatching) return;
    STATE.isDispatching = true;

    if (DOM.dispatchRouteBtn) {
      DOM.dispatchRouteBtn.disabled = true;
      DOM.dispatchRouteBtn.innerHTML = '<span>🚀 Capsule in Flight...</span>';
    }

    playStarTwinkle();

    // Trigger SVG path progress animation
    if (DOM.routeProgress) {
      DOM.routeProgress.style.strokeDashoffset = '0';
    }

    // Animate the capsule
    if (DOM.deliveryCapsule) {
      DOM.deliveryCapsule.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
      DOM.deliveryCapsule.setAttribute('transform', 'translate(530, 90)');
    }

    const randomItem = DREAM_DISPATCHES[Math.floor(Math.random() * DREAM_DISPATCHES.length)];

    if (DOM.logActiveLine) {
      DOM.logActiveLine.textContent = `[Sector Active] Dispatching to ${randomItem.destination}...`;
    }

    // Arrival completion
    setTimeout(() => {
      playChime('C5', 1.5, 0.28);
      STATE.dreamsDelivered++;
      updateOdometerDisplay(STATE.dreamsDelivered);

      if (DOM.logActiveLine) {
        DOM.logActiveLine.innerHTML = `<strong>✨ Delivered!</strong> “${randomItem.dream}”`;
      }
      if (DOM.deliveryHint) {
        DOM.deliveryHint.textContent = `Package confirmed at ${randomItem.destination}!`;
      }

      // Reset flight path ready for next run
      setTimeout(() => {
        if (DOM.routeProgress) {
          DOM.routeProgress.style.transition = 'none';
          DOM.routeProgress.style.strokeDashoffset = '800';
          setTimeout(() => {
            DOM.routeProgress.style.transition = '';
          }, 50);
        }
        if (DOM.deliveryCapsule) {
          DOM.deliveryCapsule.style.transition = 'none';
          DOM.deliveryCapsule.setAttribute('transform', 'translate(60, 250)');
          setTimeout(() => {
            DOM.deliveryCapsule.style.transition = '';
          }, 50);
        }

        STATE.isDispatching = false;
        if (DOM.dispatchRouteBtn) {
          DOM.dispatchRouteBtn.disabled = false;
          DOM.dispatchRouteBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Launch Dream Delivery</span>';
        }
      }, 1500);
    }, 2500);
  }

  /* ==========================================================================
     10. ODOMETER HIT COUNTER CONTROLLER
     ========================================================================== */
  function updateOdometerDisplay(number) {
    localStorage.setItem('pip_odometer', number);
    const numStr = String(number).padStart(6, '0');
    if (DOM.odometer) {
      const digits = DOM.odometer.querySelectorAll('.digit');
      digits.forEach((el, idx) => {
        if (numStr[idx]) el.textContent = numStr[idx];
      });
    }
  }

  function initOdometer() {
    const saved = localStorage.getItem('pip_odometer');
    if (saved && !isNaN(parseInt(saved, 10))) {
      STATE.dreamsDelivered = parseInt(saved, 10);
    }
    updateOdometerDisplay(STATE.dreamsDelivered);
  }

  /* ==========================================================================
     11. RETURNING VISITOR RECOGNITION
     ========================================================================== */
  function checkReturningVisitor() {
    let visits = parseInt(localStorage.getItem('pip_visits') || '0', 10);
    visits++;
    localStorage.setItem('pip_visits', visits);

    if (visits > 1 && DOM.visitorGreeting) {
      DOM.visitorGreeting.textContent = `Welcome back, dream traveler! (Visit #${visits}) 💤`;
    }
  }

  /* ==========================================================================
     12. SCROLL STORYLINE OBSERVER
     ========================================================================== */
  function initStoryScroll() {
    if (!DOM.storyScenes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            DOM.storyScenes.forEach((s) => s.classList.remove('active-scene'));
            entry.target.classList.add('active-scene');

            const sceneNum = parseInt(entry.target.getAttribute('data-scene') || '1', 10);
            const percentage = ((sceneNum - 1) / (DOM.storyScenes.length - 1)) * 100;

            if (DOM.storyProgressLine) {
              DOM.storyProgressLine.style.height = `${percentage}%`;
            }
          }
        });
      },
      { threshold: 0.55 }
    );

    DOM.storyScenes.forEach((scene) => observer.observe(scene));
  }

  /* ==========================================================================
     13. DREAM GUESTBOOK (Local Storage Wish Board)
     ========================================================================== */
  function loadWishes() {
    const raw = localStorage.getItem('pip_wishes');
    let list = DEFAULT_WISHES;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {
        list = DEFAULT_WISHES;
      }
    }
    renderWishes(list);
  }

  function renderWishes(list) {
    if (!DOM.notesPinboard) return;
    DOM.notesPinboard.innerHTML = '';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'pinned-note';

      const pin = document.createElement('div');
      pin.className = 'note-pin';
      pin.setAttribute('aria-hidden', 'true');

      const header = document.createElement('div');
      header.className = 'note-header';

      const author = document.createElement('span');
      author.className = 'note-author';
      author.textContent = item.name;

      const sticker = document.createElement('span');
      sticker.className = 'note-sticker';
      sticker.textContent = item.sticker;

      header.appendChild(author);
      header.appendChild(sticker);

      const body = document.createElement('p');
      body.className = 'note-body';
      body.textContent = `“${item.message}”`;

      const date = document.createElement('span');
      date.className = 'note-date';
      date.textContent = item.date;

      card.appendChild(pin);
      card.appendChild(header);
      card.appendChild(body);
      card.appendChild(date);

      DOM.notesPinboard.appendChild(card);
    });
  }

  function initGuestbook() {
    loadWishes();

    if (DOM.wishMessage && DOM.charCounter) {
      DOM.wishMessage.addEventListener('input', () => {
        DOM.charCounter.textContent = `${DOM.wishMessage.value.length} / 180`;
      });
    }

    if (DOM.guestbookForm) {
      DOM.guestbookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = DOM.wishName.value.trim() || 'Sleepy Stargazer';
        const sticker = DOM.wishSticker.value || '⭐';
        const message = DOM.wishMessage.value.trim();

        if (!message) return;

        const newNote = {
          name,
          sticker,
          message,
          date: 'Just now'
        };

        let currentWishes = [];
        try {
          currentWishes = JSON.parse(localStorage.getItem('pip_wishes')) || DEFAULT_WISHES;
        } catch (err) {
          currentWishes = DEFAULT_WISHES;
        }

        currentWishes.unshift(newNote);
        localStorage.setItem('pip_wishes', JSON.stringify(currentWishes));

        renderWishes(currentWishes);
        playChime('C5', 0.9, 0.25);

        // Reset form
        DOM.guestbookForm.reset();
        if (DOM.charCounter) DOM.charCounter.textContent = '0 / 180';

        // Feedback in thought bubble
        if (DOM.pipBubbleText) {
          DOM.pipBubbleText.textContent = `“Yay! I pinned ${name}’s wish to my wall! 📌”`;
        }
      });
    }

    if (DOM.clearWishesBtn) {
      DOM.clearWishesBtn.addEventListener('click', () => {
        localStorage.setItem('pip_wishes', JSON.stringify(DEFAULT_WISHES));
        renderWishes(DEFAULT_WISHES);
        playChime('A4', 0.5, 0.2);
      });
    }
  }

  /* ==========================================================================
     14. BEDTIME BLESSING & CLOSING ACTIONS
     ========================================================================== */
  function initClosingActions() {
    if (DOM.bedtimeBlessingBtn) {
      DOM.bedtimeBlessingBtn.addEventListener('click', () => {
        playCelebrationFanfare();
        launchConfetti();
        if (DOM.pipBubbleText) {
          DOM.pipBubbleText.textContent = "“Pip’s blessing bestowed: Dream deep, sleep tight! 💫”";
        }
        alert("🌙 Pip's Bedtime Blessing Received:\n\n“May your pillow stay cool, your blanket stay warm, and your heart be filled with starlight tonight. Sleep well, sweet dreamer!”");
      });
    }
  }

  /* ==========================================================================
     15. MOBILE MENU & ACCESSIBILITY NAVIGATION
     ========================================================================== */
  function initNavigation() {
    if (DOM.menuToggle && DOM.mobileNav) {
      DOM.menuToggle.addEventListener('click', () => {
        const isOpen = DOM.mobileNav.classList.toggle('open');
        DOM.menuToggle.setAttribute('aria-expanded', String(isOpen));
        DOM.mobileNav.setAttribute('aria-hidden', String(!isOpen));
      });
    }

    // Close mobile nav when clicking any link
    DOM.mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        DOM.mobileNav.classList.remove('open');
        DOM.menuToggle.setAttribute('aria-expanded', 'false');
        DOM.mobileNav.setAttribute('aria-hidden', 'true');
      });
    });

    // Update active nav link based on scroll section
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;

      sections.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          DOM.navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  /* ==========================================================================
     16. FEATURE 1: MEET PIP IN 360° TURNTABLE CONTROLLER
     ========================================================================== */
  function initTurntable360() {
    if (!DOM.turntableStage || !DOM.turntableRig) return;

    let currentAngle = 0;
    let targetAngle = 0;
    let isDragging = false;
    let startX = 0;
    let startAngle = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let isAutoSpin = false;

    function normalizeAngle(a) {
      let norm = a % 360;
      if (norm < 0) norm += 360;
      return norm;
    }

    function renderAngle(angle) {
      const norm = normalizeAngle(angle);

      // Rotate Rig
      DOM.turntableRig.style.transform = `rotateY(${norm.toFixed(1)}deg)`;

      // Readout
      if (DOM.angleReadout) {
        DOM.angleReadout.textContent = `${Math.round(norm)}°`;
      }

      // Facing label
      if (DOM.angleFacingLabel) {
        if (norm >= 315 || norm < 45) {
          DOM.angleFacingLabel.textContent = '(Front View)';
        } else if (norm >= 45 && norm < 135) {
          DOM.angleFacingLabel.textContent = '(Left Profile)';
        } else if (norm >= 135 && norm < 225) {
          DOM.angleFacingLabel.textContent = '(Back View)';
        } else {
          DOM.angleFacingLabel.textContent = '(Right Profile)';
        }
      }

      // Dynamic Amber Eye Glow & Lighting calculation
      // Eyes glow when facing camera (0 / 360 deg), fade when facing away
      const rad = (norm * Math.PI) / 180;
      const cosVal = Math.cos(rad); // 1 facing front, -1 facing back, 0 facing side
      const eyeOpacity = Math.max(0, cosVal);

      if (DOM.eye360Left && DOM.eye360Right) {
        DOM.eye360Left.style.opacity = eyeOpacity.toFixed(2);
        DOM.eye360Right.style.opacity = eyeOpacity.toFixed(2);
      }

      // Plinth shadow shift based on angle
      if (DOM.turntableShadow) {
        const shadowShiftX = Math.sin(rad) * 15;
        DOM.turntableShadow.style.transform = `translateX(${shadowShiftX.toFixed(1)}px)`;
      }

      // Active preset chip highlight
      if (DOM.angleChips) {
        DOM.angleChips.forEach(chip => {
          const chipAngle = parseInt(chip.getAttribute('data-angle'), 10);
          const diff = Math.abs(chipAngle - norm);
          if (diff < 15 || diff > 345) {
            chip.classList.add('active');
          } else {
            chip.classList.remove('active');
          }
        });
      }
    }

    // Animation loop with damping/inertia
    function turntableLoop() {
      if (isAutoSpin && !isDragging) {
        targetAngle += 0.45;
      } else if (!isDragging && Math.abs(velocity) > 0.05) {
        targetAngle += velocity;
        velocity *= 0.92; // Damping
      }

      // Smooth interpolation
      currentAngle += (targetAngle - currentAngle) * 0.15;
      renderAngle(currentAngle);

      requestAnimationFrame(turntableLoop);
    }
    turntableLoop();

    // Mouse Dragging
    DOM.turntableStage.addEventListener('mousedown', (e) => {
      isDragging = true;
      isAutoSpin = false;
      updateAutoSpinUI();
      startX = e.clientX;
      startAngle = targetAngle;
      lastX = e.clientX;
      lastTime = performance.now();
      velocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const deltaX = e.clientX - startX;
      targetAngle = startAngle + (deltaX * 0.75);

      velocity = ((e.clientX - lastX) / dt) * 10;
      lastX = e.clientX;
      lastTime = now;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
      }
    });

    // Touch Dragging on Mobile
    DOM.turntableStage.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      isDragging = true;
      isAutoSpin = false;
      updateAutoSpinUI();
      startX = e.touches[0].clientX;
      startAngle = targetAngle;
      lastX = e.touches[0].clientX;
      lastTime = performance.now();
      velocity = 0;
    }, { passive: true });

    DOM.turntableStage.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const deltaX = e.touches[0].clientX - startX;
      targetAngle = startAngle + (deltaX * 0.85);

      velocity = ((e.touches[0].clientX - lastX) / dt) * 10;
      lastX = e.touches[0].clientX;
      lastTime = now;
    }, { passive: true });

    DOM.turntableStage.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Reset View Button
    if (DOM.reset360Btn) {
      DOM.reset360Btn.addEventListener('click', () => {
        isAutoSpin = false;
        updateAutoSpinUI();
        velocity = 0;
        targetAngle = 0;
        currentAngle = 0;
        renderAngle(0);
        playChime('C5', 0.6, 0.2);
      });
    }

    // Auto-Spin Toggle
    function updateAutoSpinUI() {
      if (DOM.autospin360Btn) {
        if (isAutoSpin) {
          DOM.autospin360Btn.classList.add('btn-primary');
          DOM.autospin360Btn.classList.remove('btn-secondary');
          if (DOM.autospinIcon) DOM.autospinIcon.textContent = '⏸';
          if (DOM.autospinLabel) DOM.autospinLabel.textContent = 'Pause Spin';
        } else {
          DOM.autospin360Btn.classList.remove('btn-primary');
          DOM.autospin360Btn.classList.add('btn-secondary');
          if (DOM.autospinIcon) DOM.autospinIcon.textContent = '⏵';
          if (DOM.autospinLabel) DOM.autospinLabel.textContent = 'Auto-Spin';
        }
      }
    }

    if (DOM.autospin360Btn) {
      DOM.autospin360Btn.addEventListener('click', () => {
        isAutoSpin = !isAutoSpin;
        updateAutoSpinUI();
        playChime('G4', 0.4, 0.18);
      });
    }

    // Preset Angle Chips
    DOM.angleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        isAutoSpin = false;
        updateAutoSpinUI();
        velocity = 0;
        const targetDeg = parseInt(chip.getAttribute('data-angle'), 10) || 0;
        targetAngle = targetDeg;
        playChime('E4', 0.5, 0.2);
      });
    });

    // Initial render
    renderAngle(0);
  }

  /* ==========================================================================
     17. TALKING TOM-STYLE 3D+360° INTERACTIVE COMPANION ENGINE
     ========================================================================== */
  function initTalkingPipCompanion() {
    // Stage & Rig Elements
    const stage = document.getElementById('companion-3d-stage');
    const rig = document.getElementById('companion-rig');
    const body = document.getElementById('pip-rig-body');
    const pipImg = document.getElementById('companion-pip-img');
    const eyeLeft = document.getElementById('comp-eye-left');
    const eyeRight = document.getElementById('comp-eye-right');
    const prevBtn = document.getElementById('stage-arrow-prev');
    const nextBtn = document.getElementById('stage-arrow-next');
    const resetBtn = document.getElementById('companion-reset-btn');
    const view360Btn = document.getElementById('view-360-trigger');
    const thumbBtns = document.querySelectorAll('.angle-thumb-btn');
    const bubble = document.getElementById('companion-speech-bubble');
    const bubbleText = document.getElementById('companion-speech-text');
    const touchHead = document.getElementById('touch-head');
    const touchBelly = document.getElementById('touch-belly');
    const touchFeet = document.getElementById('touch-feet');
    const petLayer = document.getElementById('pet-particles-layer');
    const starBtn = document.getElementById('companion-star-btn');
    const voiceBtn = document.getElementById('voice-talk-btn');
    const voiceBtnText = document.getElementById('voice-btn-text');
    const voiceBox = document.getElementById('voice-transcript-box');
    const transcriptStatus = document.getElementById('transcript-status');
    const transcriptText = document.getElementById('transcript-text');
    const stopSpeechBtn = document.getElementById('stop-speech-btn');
    const starCounterEl = document.getElementById('star-count-val');
    const mgCatcherBtn = document.getElementById('mg-catcher-btn');
    const mgFeedBtn = document.getElementById('mg-feed-btn');
    const mgBedtimeBtn = document.getElementById('mg-bedtime-btn');
    const accessoryChips = document.querySelectorAll('.accessory-chip');
    const interactiveStars = document.querySelectorAll('.interactive-star');

    if (!stage || !rig || !body) return;

    // --- State variables ---
    let angle = 0;
    let targetAngle = 0;
    let isDragging = false;
    let startX = 0;
    let startAngle = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let characterState = 'idle'; // idle | happy | sleepy | surprised | laughing | listening | talking | excited | thinking
    let stateTimer = null;
    let dreamStars = parseInt(localStorage.getItem('pip_dream_stars') || '25', 10);
    let isRecognizing = false;
    let recognition = null;
    let petMoveCount = 0;

    // Update Dream Star counter display
    function updateStarCounter(change = 0) {
      dreamStars += change;
      localStorage.setItem('pip_dream_stars', dreamStars);
      if (starCounterEl) {
        starCounterEl.textContent = dreamStars;
        starCounterEl.parentElement.classList.add('star-bump');
        setTimeout(() => starCounterEl.parentElement.classList.remove('star-bump'), 300);
      }
    }
    updateStarCounter(0);

    // --- Character State Machine ---
    function setCharacterState(state, duration = 3000) {
      characterState = state;
      body.classList.remove('state-happy', 'state-sleepy', 'state-laughing', 'state-listening', 'state-talking', 'state-excited', 'state-thinking');
      body.classList.add(`state-${state}`);

      if (stateTimer) clearTimeout(stateTimer);
      if (duration > 0) {
        stateTimer = setTimeout(() => {
          characterState = 'idle';
          body.classList.remove(`state-${state}`);
        }, duration);
      }
    }

    // --- Speech Bubble Updater ---
    function setSpeechBubble(text, avatar = '🍼') {
      if (bubbleText) {
        bubbleText.textContent = text;
      }
      if (bubble) {
        const miniAvatar = bubble.querySelector('.bubble-avatar-mini');
        if (miniAvatar) miniAvatar.textContent = avatar;
        bubble.classList.remove('bubble-pop');
        void bubble.offsetWidth;
        bubble.classList.add('bubble-pop');
      }
    }

    // --- Speech Synthesis (Pip speaks aloud in child voice!) ---
    function speakAloud(text) {
      if (!window.speechSynthesis) return;

      // Only speak aloud if sound is enabled
      if (!STATE.soundEnabled) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.45; // Cute baby/child voice pitch

      // Try finding a friendly voice
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Kid') || v.name.includes('Google UK English Female') || v.lang.startsWith('en'));
      if (friendlyVoice) utterance.voice = friendlyVoice;

      utterance.onstart = () => {
        setCharacterState('talking', 0);
        if (eyeLeft && eyeRight) {
          eyeLeft.style.animation = 'starTwinkle 0.3s infinite';
          eyeRight.style.animation = 'starTwinkle 0.3s infinite';
        }
      };

      utterance.onend = () => {
        setCharacterState('idle', 100);
        if (eyeLeft && eyeRight) {
          eyeLeft.style.animation = '';
          eyeRight.style.animation = '';
        }
      };

      utterance.onerror = () => {
        setCharacterState('idle', 100);
      };

      window.speechSynthesis.speak(utterance);
    }

    // --- 360 Turntable Rendering ---
    function normalizeAngle(a) {
      let norm = a % 360;
      if (norm < 0) norm += 360;
      return norm;
    }

    function render360(deg) {
      const norm = normalizeAngle(deg);
      rig.style.transform = `rotateY(${norm.toFixed(1)}deg)`;

      // Amber eyes lighting: fade when facing backwards
      const rad = (norm * Math.PI) / 180;
      const cosVal = Math.cos(rad);
      const opacity = Math.max(0.05, cosVal);
      if (eyeLeft && eyeRight) {
        eyeLeft.style.opacity = opacity.toFixed(2);
        eyeRight.style.opacity = opacity.toFixed(2);
      }

      // Update active thumbnail
      thumbBtns.forEach(btn => {
        const btnAngle = parseInt(btn.getAttribute('data-angle'), 10);
        const diff = Math.abs(btnAngle - norm);
        if (diff < 22 || diff > 338) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Rotational Physics Loop
    function turntableLoop() {
      if (!isDragging && Math.abs(velocity) > 0.05) {
        targetAngle += velocity;
        velocity *= 0.92; // Damping
      }
      angle += (targetAngle - angle) * 0.16;
      render360(angle);
      requestAnimationFrame(turntableLoop);
    }
    turntableLoop();

    // Mouse Dragging on 3D Stage
    stage.addEventListener('mousedown', (e) => {
      // Don't drag if clicking interactive zones
      if (e.target.classList.contains('pip-touch-target') || e.target.classList.contains('interactive-star') || e.target.classList.contains('stage-chevron-btn')) return;
      isDragging = true;
      startX = e.clientX;
      startAngle = targetAngle;
      lastX = e.clientX;
      lastTime = performance.now();
      velocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const deltaX = e.clientX - startX;
      targetAngle = startAngle + (deltaX * 0.75);

      velocity = ((e.clientX - lastX) / dt) * 10;
      lastX = e.clientX;
      lastTime = now;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch Dragging on Mobile
    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      if (e.target.classList.contains('pip-touch-target') || e.target.classList.contains('interactive-star') || e.target.classList.contains('stage-chevron-btn')) return;
      isDragging = true;
      startX = e.touches[0].clientX;
      startAngle = targetAngle;
      lastX = e.touches[0].clientX;
      lastTime = performance.now();
      velocity = 0;
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const deltaX = e.touches[0].clientX - startX;
      targetAngle = startAngle + (deltaX * 0.85);

      velocity = ((e.touches[0].clientX - lastX) / dt) * 10;
      lastX = e.touches[0].clientX;
      lastTime = now;
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Chevrons < and > step rotation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        velocity = 0;
        targetAngle -= 45;
        playChime('C5', 0.4, 0.2);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        velocity = 0;
        targetAngle += 45;
        playChime('E5', 0.4, 0.2);
      });
    }

    // Thumbnail Carousel Click
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        velocity = 0;
        const deg = parseInt(btn.getAttribute('data-angle'), 10) || 0;
        targetAngle = deg;
        playChime('G4', 0.4, 0.2);
      });
    });

    // Reset View Button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        velocity = 0;
        targetAngle = 0;
        angle = 0;
        render360(0);
        playChime('C5', 0.5, 0.25);
        setSpeechBubble("“View reset to front! Ready for more dream magic! ✨”", "🔄");
      });
    }

    // View 360 Button on Right Card
    if (view360Btn) {
      view360Btn.addEventListener('click', () => {
        velocity = 0;
        targetAngle += 360;
        playChime('G5', 0.8, 0.25);
        setSpeechBubble("“Wheee! Spinning across the 360° celestial plinth! 🌌”", "💫");
      });
    }

    // --- Talking Tom Touch Interactions ---
    // 1. Head Tap (Greeting, nod, blinks)
    if (touchHead) {
      touchHead.addEventListener('click', (e) => {
        e.stopPropagation();
        body.classList.remove('pip-nod-anim');
        void body.offsetWidth;
        body.classList.add('pip-nod-anim');

        setCharacterState('happy', 2500);
        playChime('E5', 0.7, 0.25);

        const greetings = [
          "“Giggle! Careful with my starry nightcap! ✨”",
          "“Hewwo, lovely star! Did you come to hear a lullaby?”",
          "“*Yawn*... My head is full of sweet flying dreams! ☁️”"
        ];
        const text = greetings[Math.floor(Math.random() * greetings.length)];
        setSpeechBubble(text, "👶");
        speakAloud(text);
        updateStarCounter(2);
      });
    }

    // 2. Belly Tap (Tickle, giggle, wiggle)
    if (touchBelly) {
      touchBelly.addEventListener('click', (e) => {
        e.stopPropagation();
        body.classList.remove('pip-wiggle-anim');
        void body.offsetWidth;
        body.classList.add('pip-wiggle-anim');

        setCharacterState('laughing', 2500);
        // Play cute laughing pentatonic chime sequence
        playChime('G4', 0.3, 0.25);
        setTimeout(() => playChime('C5', 0.3, 0.25), 100);
        setTimeout(() => playChime('E5', 0.4, 0.25), 200);

        const giggles = [
          "“Hehe, tickles! That tickles my tummy! 🤭”",
          "“Oopsie! My dream stardust is super ticklish today! ✨”",
          "“*Giggle snort!* Stop it, you silly star! 🍼”"
        ];
        const text = giggles[Math.floor(Math.random() * giggles.length)];
        setSpeechBubble(text, "🤭");
        speakAloud(text);
        updateStarCounter(3);
      });
    }

    // 3. Feet Tap (Baby kick, boots wiggle)
    if (touchFeet) {
      touchFeet.addEventListener('click', (e) => {
        e.stopPropagation();
        body.classList.remove('pip-kick-anim');
        void body.offsetWidth;
        body.classList.add('pip-kick-anim');

        setCharacterState('excited', 2500);
        playChime('D5', 0.5, 0.25);

        const kicks = [
          "“Kick, kick! My little booties are made of cloud fluff! ☁️”",
          "“Ready to run across the rooftops to deliver dreams! 🚀”",
          "“Tickly toes! Time to step into dreamland! 💤”"
        ];
        const text = kicks[Math.floor(Math.random() * kicks.length)];
        setSpeechBubble(text, "🧦");
        speakAloud(text);
        updateStarCounter(2);
      });
    }

    // 4. Petting Gesture (Mouse drag / hover across body)
    body.addEventListener('mousemove', (e) => {
      petMoveCount++;
      if (petMoveCount % 16 === 0) {
        spawnPetHeart(e.clientX, e.clientY);
        if (characterState === 'idle') {
          setCharacterState('happy', 1500);
          setSpeechBubble("“Mmm... feels like warm vanilla milk... 🥛💤”", "💖");
          playChime('A4', 0.4, 0.15);
          updateStarCounter(1);
        }
      }
    });

    function spawnPetHeart(x, y) {
      if (!petLayer) return;
      const rect = stage.getBoundingClientRect();
      const particle = document.createElement('div');
      particle.className = 'floating-heart-particle';
      particle.textContent = Math.random() > 0.5 ? '💖' : '✨';
      particle.style.left = `${(x - rect.left)}px`;
      particle.style.top = `${(y - rect.top)}px`;
      petLayer.appendChild(particle);

      setTimeout(() => particle.remove(), 1400);
    }

    // 5. Double Click / Double Tap (Excited Jump!)
    body.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      body.classList.remove('pip-jump-anim');
      void body.offsetWidth;
      body.classList.add('pip-jump-anim');

      setCharacterState('excited', 2800);
      playStarTwinkle();

      const jumps = [
        "“Wheee! High five, dream friend! You are the best! 🎉”",
        "“Bouncing on dream clouds! Can you catch me? 🌟”"
      ];
      const text = jumps[Math.floor(Math.random() * jumps.length)];
      setSpeechBubble(text, "🎉");
      speakAloud(text);
      updateStarCounter(5);
    });

    // 6. Interactive Surrounding Stars (Tap to pop & score)
    interactiveStars.forEach(star => {
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        star.style.transform = 'scale(1.8) rotate(45deg)';
        setTimeout(() => star.style.transform = '', 350);

        playChime('C5', 0.4, 0.25);
        updateStarCounter(5);
        setSpeechBubble("“Plink! You caught a floating starlight spark! +5 Stars ⭐”", "✨");
      });
    });

    // 7. Secret Easter Egg Star Hitbox (7 clicks)
    if (starBtn && DOM.easterEggStar) {
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.easterEggStar.click();
      });
    }

    // --- Voice Interaction ("Talk to Pip" Web Speech Recognition) ---
    function initSpeechRecognition() {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) return null;

      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        isRecognizing = true;
        setCharacterState('listening', 0);
        if (voiceBtn) voiceBtn.classList.add('listening-active');
        if (voiceBtnText) voiceBtnText.textContent = 'Listening...';
        if (voiceBox) voiceBox.classList.remove('hidden');
        if (transcriptStatus) transcriptStatus.textContent = 'Pip is listening to your voice... 🎙️';
        if (transcriptText) transcriptText.textContent = '“Speak into your microphone...”';
        setSpeechBubble("“I’m listening, sleepy star! Say anything...”", "👂");
      };

      rec.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;
        if (transcriptText) transcriptText.textContent = `“${spokenText}”`;

        setCharacterState('thinking', 0);
        if (transcriptStatus) transcriptStatus.textContent = 'Pip is thinking... 💭';
        setSpeechBubble("“Hmm... let me check my nursery dream notes... 💭”", "🤔");

        // Generate response using offline knowledge base (or backend AI)
        let replyText = null;
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: spokenText })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.reply) replyText = data.reply;
          }
        } catch (e) {
          // fallback
        }

        // Offline Fallback match
        if (!replyText) {
          const clean = spokenText.toLowerCase();
          if (clean.includes('who are you') || clean.includes('your name')) {
            replyText = "Hewwo, sleepy star! I’m Pip, Junior Dream Engineer at Midnight Nursery! I make lullabies and dream delivery routes!";
          } else if (clean.includes('how do you make dreams') || clean.includes('recipe')) {
            replyText = "First I collect a pinch of stardust, mix in a lullaby and soft cloud fluff, and poof! A dream is born!";
          } else if (clean.includes('story') || clean.includes('bedtime story')) {
            replyText = "Once upon a starry night, a little cloud named Poff floated down to be a soft pillow for sleeping children, humming a sweet lullaby!";
          } else if (clean.includes('joke')) {
            replyText = "Why did the little star go to bed early? Because it was ready to twinkle down! Hehe!";
          } else if (clean.includes('favorite') || clean.includes('favourite')) {
            replyText = "Warm vanilla milk with star cookies! And watching babies smile in their dreams!";
          } else {
            replyText = "Hehe, that’s a big question for my sleepy little brain! I love talking with you! Ask me about dreams or lullabies!";
          }
        }

        if (transcriptStatus) transcriptStatus.textContent = 'Pip says:';
        setSpeechBubble(replyText, "💬");
        speakAloud(replyText);
        updateStarCounter(5);
      };

      rec.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        if (transcriptStatus) transcriptStatus.textContent = 'Microphone paused.';
        setCharacterState('idle', 100);
      };

      rec.onend = () => {
        isRecognizing = false;
        if (voiceBtn) voiceBtn.classList.remove('listening-active');
        if (voiceBtnText) voiceBtnText.textContent = 'Talk to Pip';
      };

      return rec;
    }

    recognition = initSpeechRecognition();

    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (!recognition) {
          alert("🎙️ Microphone Speech Recognition is not supported by your current browser. You can still talk with Pip using the 'Talk with Pip' page or click Pip's body parts to interact!");
          setSpeechBubble("“Browser mic isn’t available, but we can talk anytime in the chat page! 💬”", "🧸");
          return;
        }

        if (isRecognizing) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (e) {
            recognition.stop();
          }
        }
      });
    }

    if (stopSpeechBtn) {
      stopSpeechBtn.addEventListener('click', () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (voiceBox) voiceBox.classList.add('hidden');
        setCharacterState('idle', 100);
      });
    }

    // --- Mini-Games ---
    // A. Star Catcher Game
    if (mgCatcherBtn) {
      mgCatcherBtn.addEventListener('click', () => {
        setCharacterState('excited', 3000);
        playStarTwinkle();
        setSpeechBubble("“Star Catcher Active! Tap the 4 floating stars around me! ⭐”", "🌟");

        // Spawn bonus temporary stars
        for (let i = 0; i < 5; i++) {
          const bonusStar = document.createElement('div');
          bonusStar.className = 'interactive-star bonus-game-star';
          bonusStar.textContent = ['⭐', '🌟', '✨', '💫'][i % 4];
          bonusStar.style.left = `${15 + Math.random() * 70}%`;
          bonusStar.style.top = `${15 + Math.random() * 65}%`;
          bonusStar.style.animation = 'pipBounceAnim 1.2s infinite alternate';

          bonusStar.addEventListener('click', () => {
            playChime('G5', 0.4, 0.25);
            updateStarCounter(10);
            bonusStar.remove();
            setSpeechBubble("“Star caught! +10 Dream Stars! 🌟”", "🎉");
          });

          stage.appendChild(bonusStar);
          setTimeout(() => bonusStar.remove(), 7000);
        }
      });
    }

    // B. Feed Pip Mini-Game
    if (mgFeedBtn) {
      mgFeedBtn.addEventListener('click', () => {
        setCharacterState('laughing', 3500);
        playChime('C5', 0.4, 0.2);

        // Spawn cookie flying to Pip
        const cookie = document.createElement('div');
        cookie.textContent = '🍪';
        cookie.style.position = 'absolute';
        cookie.style.fontSize = '2.5rem';
        cookie.style.left = '10%';
        cookie.style.top = '40%';
        cookie.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
        cookie.style.zIndex = '30';
        stage.appendChild(cookie);

        setTimeout(() => {
          cookie.style.left = '45%';
          cookie.style.top = '35%';
          cookie.style.transform = 'scale(0.3)';
          cookie.style.opacity = '0';
        }, 50);

        setTimeout(() => {
          cookie.remove();
          // Munch sound
          playChime('E5', 0.3, 0.25);
          setTimeout(() => playChime('G5', 0.4, 0.25), 120);

          body.classList.remove('pip-wiggle-anim');
          void body.offsetWidth;
          body.classList.add('pip-wiggle-anim');

          setSpeechBubble("“*Crunch crunch!* Yummy! Star cookies are my absolute favorite! +15 Stars! 😋🍪”", "🍪");
          speakAloud("Yummy! Star cookies are my absolute favorite! Thank you!");
          updateStarCounter(15);
        }, 1100);
      });
    }

    // C. Bedtime Mode Mini-Game
    if (mgBedtimeBtn) {
      mgBedtimeBtn.addEventListener('click', () => {
        setCharacterState('sleepy', 5000);
        playChime('G4', 1.5, 0.25);

        // Dim lighting
        const plinthShadow = document.getElementById('plinth-shadow-disc');
        if (plinthShadow) plinthShadow.style.filter = 'blur(20px)';

        const text = "“Yaaawn... time to snuggle under my cloud blanket. Sleep tight, little dream traveler! 💤”";
        setSpeechBubble(text, "🌙");
        speakAloud(text);
        updateStarCounter(10);
      });
    }

    // --- Customization & Accessory Selector ---
    accessoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        accessoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const style = chip.getAttribute('data-style');
        if (pipImg) {
          pipImg.parentElement.classList.remove('accessory-rose', 'accessory-gold', 'accessory-mint');
          if (style !== 'classic') {
            pipImg.parentElement.classList.add(`accessory-${style}`);
          }
        }

        playChime('C5', 0.4, 0.2);
        setSpeechBubble(`“Ooh! You switched my nightcap to the ${chip.textContent} theme! 🎀”`, "✨");
      });
    });

    console.log("🎮 Talking Tom-style 3D+360 Interactive Pip Companion initialized!");
  }

  /* ==========================================================================
     18. INITIALIZATION
     ========================================================================== */
  function init() {
    // 1. Theme setup
    const savedTheme = localStorage.getItem('pip_theme') || 'night';
    applyTheme(savedTheme);
    if (DOM.themeToggle) {
      DOM.themeToggle.addEventListener('click', toggleTheme);
    }

    // 2. Sound setup
    if (DOM.soundToggle) {
      DOM.soundToggle.addEventListener('click', () => toggleSound());
    }

    // 3. Components
    generateSkyStars();
    initNavigation();
    initInteractivePip();
    initTurntable360();
    // initTalkingPipCompanion(); // Handled completely by fix-all.js video engine
    initEasterEgg();
    initSparkleCursor();
    initProjectInteractions();
    initOdometer();
    checkReturningVisitor();
    initStoryScroll();
    initGuestbook();
    initClosingActions();

    console.log("✨ Pip's Midnight Observatory loaded with 100% stardust and baby magic!");
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
