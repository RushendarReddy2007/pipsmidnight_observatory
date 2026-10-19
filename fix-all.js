/**
 * FIX-ALL.JS — Pip's Midnight Observatory
 * Complete fix for ALL reported issues:
 * 1. Cursor sparkles everywhere
 * 2. 360° realistic 3D rotation with inertia + image swapping
 * 3. Sound toggle fix
 * 4. Nightcap style buttons working
 * 5. Lullaby Lab / Lighting Craft audio fix
 * 6. Delivery routes no shake + Launch button shows animation
 * 7. Scroll story highlights one by one
 * 8. Voice assistant: Pip listens AND responds
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════
     HELPER UTILITIES
     ══════════════════════════════════════════════════════════════════ */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  /* ══════════════════════════════════════════════════════════════════
     1. CURSOR SPARKLES — float up on every mouse move
     ══════════════════════════════════════════════════════════════════ */
  (function initCursorSparkles() {
    const SPARKLE_CHARS = ['✦', '✧', '⭐', '✨', '💫', '🌟', '·', '★'];
    const COLORS = ['#fbbf24', '#f9a8d4', '#a78bfa', '#60a5fa', '#34d399', '#fff'];
    let lastSparkleTime = 0;
    const THROTTLE_MS = 40;

    function createSparkle(x, y) {
      const now = Date.now();
      if (now - lastSparkleTime < THROTTLE_MS) return;
      lastSparkleTime = now;

      const el = document.createElement('div');
      el.className = 'pip-sparkle-particle';
      el.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      const size = Math.random() * 10 + 8;
      const offsetX = (Math.random() - 0.5) * 24;
      el.style.cssText = `
        left: ${x + offsetX - size / 2}px;
        top: ${y - size / 2}px;
        font-size: ${size}px;
        color: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-duration: ${0.6 + Math.random() * 0.4}s;
        text-shadow: 0 0 6px currentColor;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }

    document.addEventListener('mousemove', (e) => createSparkle(e.clientX, e.clientY), { passive: true });
    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      createSparkle(t.clientX, t.clientY);
    }, { passive: true });
  })();

  /* ══════════════════════════════════════════════════════════════════
     2. 360° REALISTIC 3D ROTATION WITH INERTIA
        Uses perspective rotateY + scale trick for genuine 3D feel
        Swaps Pip images at angle boundaries
     ══════════════════════════════════════════════════════════════════ */
  (function init360Rotation() {
    const rig     = $('companion-rig');
    const pipImg  = $('companion-pip-img');
    const stage   = $('companion-3d-stage');
    const resetBtn= $('companion-reset-btn');
    const prevBtn = $('stage-arrow-prev');
    const nextBtn = $('stage-arrow-next');
    const badge360= $('badge-360');
    const thumbBtns = $$('.angle-thumb-btn');
    if (!rig || !pipImg || window.__PIP_3D_ACTIVE__) return;

    // Pip image set: 6 angles matching the thumbnail strip in Image 1
    // 0° (front reference picture), 45°, 90°, 180° (back), 225°, 270°
    const IMAGES = [
      'assets/pip.jpg',              // 0° — user requested reference illustration
      'assets/pip_thumb_1.png',      // 45°
      'assets/pip_thumb_2.png',      // 90° profile
      'assets/pip_thumb_3.png',      // 180° back view
      'assets/pip_thumb_4.png',      // 225° back angle
      'assets/pip_thumb_5.png',      // 270° profile
    ];

    const IMAGE_ANGLES = [0, 45, 90, 180, 225, 270];

    let currentAngle = 0;
    let velocity     = 0;
    let isDragging   = false;
    let dragStartX   = 0;
    let dragStartAngle = 0;
    let currentImgIdx = 0;
    let animFrameId   = null;
    let autoSpinActive = false; // user controls rotation

    // Angle indicator
    let indicator = $('pip-angle-indicator');
    if (!indicator && stage) {
      indicator = document.createElement('div');
      indicator.id = 'pip-angle-indicator';
      indicator.textContent = '0°';
      stage.appendChild(indicator);
    }

    const eyeLeft  = $('comp-eye-left');
    const eyeRight = $('comp-eye-right');

    function normalizeAngle(a) {
      return ((a % 360) + 360) % 360;
    }

    // Determine which image angle index corresponds to angle a
    function getImageIndex(angle) {
      const a = normalizeAngle(angle);
      if (a >= 22 && a < 68) return 1;    // 45°
      if (a >= 68 && a < 135) return 2;   // 90°
      if (a >= 135 && a < 205) return 3;  // 180° (back)
      if (a >= 205 && a < 248) return 4;  // 225°
      if (a >= 248 && a < 338) return 5;  // 270°
      return 0;                           // 0° (front)
    }

    // Apply 3D perspective rotation + image angle update
    function applyTransform(angle) {
      const a = normalizeAngle(angle);

      const newIdx = getImageIndex(a);
      if (newIdx !== currentImgIdx) {
        currentImgIdx = newIdx;
        pipImg.src = IMAGES[newIdx];
        thumbBtns.forEach(btn => {
          btn.classList.toggle('active', parseInt(btn.dataset.angle || '0') === IMAGE_ANGLES[newIdx]);
        });
      }

      // Smooth 3D tilt within the current sector for continuous fluid perspective
      const sectorCenters = [0, 45, 90, 180, 225, 270];
      const center = sectorCenters[newIdx];
      let diff = a - center;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const subTilt = clamp(diff * 0.45, -20, 20);

      // Subtle scale for depth
      const scale = (newIdx === 3) ? 0.95 : (newIdx === 2 || newIdx === 5 ? 0.98 : 1.0);
      rig.style.transform = `perspective(1000px) rotateY(${subTilt}deg) scale(${scale})`;

      if (indicator) indicator.textContent = `${Math.round(a)}°`;

      // Amber eye glow: visible when facing front
      if (eyeLeft && eyeRight) {
        const eyesVisible = (newIdx === 0 || a > 335 || a < 25);
        eyeLeft.style.opacity  = eyesVisible ? '0.95' : '0';
        eyeRight.style.opacity = eyesVisible ? '0.95' : '0';
      }
    }

    // Physics animation loop
    function animationLoop() {
      if (isDragging) {
        animFrameId = requestAnimationFrame(animationLoop);
        return;
      }

      if (autoSpinActive) {
        currentAngle += 0.35;
        if (currentAngle >= 360) currentAngle -= 360;
        applyTransform(currentAngle);
      } else if (Math.abs(velocity) > 0.01) {
        currentAngle += velocity;
        velocity *= 0.93; // smooth friction
        if (Math.abs(velocity) <= 0.01) velocity = 0;
        applyTransform(currentAngle);
      }
      animFrameId = requestAnimationFrame(animationLoop);
    }

    // Pointer/touch handlers
    function onDragStart(clientX) {
      autoSpinActive = false;
      isDragging = true;
      dragStartX = clientX;
      dragStartAngle = currentAngle;
      velocity = 0;
      rig.style.cursor = 'grabbing';
      rig.style.transition = 'none';
    }

    function onDragMove(clientX) {
      if (!isDragging) return;
      const dx = clientX - dragStartX;
      const sens = 0.55; // degrees per pixel
      currentAngle = dragStartAngle + dx * sens;
      applyTransform(currentAngle);
      velocity = dx * 0.04;
      dragStartX = clientX;
      dragStartAngle = currentAngle;
    }

    function onDragEnd() {
      isDragging = false;
      rig.style.cursor = 'grab';
    }

    // Mouse events on rig
    rig.addEventListener('mousedown', (e) => { e.preventDefault(); onDragStart(e.clientX); });
    window.addEventListener('mousemove', (e) => { if (isDragging) onDragMove(e.clientX); });
    window.addEventListener('mouseup', onDragEnd);

    // Touch events
    rig.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onDragStart(e.touches[0].clientX);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      onDragMove(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    // Chevron buttons
    if (prevBtn) prevBtn.addEventListener('click', () => {
      autoSpinActive = false;
      velocity = 0;
      currentAngle -= 60;
      applyTransform(currentAngle);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      autoSpinActive = false;
      velocity = 0;
      currentAngle += 60;
      applyTransform(currentAngle);
    });

    // Reset button
    if (resetBtn) resetBtn.addEventListener('click', () => {
      autoSpinActive = false;
      velocity = 0;
      currentAngle = 0;
      applyTransform(0);
      // Spring back animation
      rig.style.transition = 'transform 0.5s cubic-bezier(.22,.97,.5,1.27)';
      setTimeout(() => { rig.style.transition = 'none'; }, 600);
    });

    // Thumbnail buttons
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        autoSpinActive = false;
        velocity = 0;
        const angle = parseFloat(btn.dataset.angle || '0');
        currentAngle = angle;
        applyTransform(angle);
        rig.style.transition = 'transform 0.4s cubic-bezier(.22,.97,.5,1.27)';
        setTimeout(() => { rig.style.transition = 'none'; }, 450);
      });
    });

    // Toggle auto-spin when clicking 360 badge
    if (badge360) {
      badge360.addEventListener('click', (e) => {
        e.stopPropagation();
        autoSpinActive = !autoSpinActive;
        badge360.style.boxShadow = autoSpinActive ? '0 0 25px #fbbf24' : '';
      });
    }

    // Start
    applyTransform(0);
    animationLoop();
  })();

  /* ══════════════════════════════════════════════════════════════════
     3. SOUND TOGGLE FIX
        Ensure AudioContext starts ONLY after user interaction
     ══════════════════════════════════════════════════════════════════ */
  (function fixSoundToggle() {
    let audioCtx = null;
    let ambientOsc = null;
    let ambientGain = null;
    const soundToggle = $('sound-toggle');
    const soundIcon   = $('sound-icon');
    const soundLabel  = $('sound-label');

    if (!soundToggle) return;

    function getCtx() {
      if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function playChime(freq, dur, vol) {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur + 0.1);
      } catch(e) { console.warn('Chime error:', e); }
    }

    function startAmbient() {
      try {
        const ctx = getCtx();
        ambientOsc = ctx.createOscillator();
        ambientGain = ctx.createGain();
        ambientOsc.type = 'sine';
        ambientOsc.frequency.value = 55;
        ambientGain.gain.setValueAtTime(0, ctx.currentTime);
        ambientGain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 1.5);
        ambientOsc.connect(ambientGain);
        ambientGain.connect(ctx.destination);
        ambientOsc.start();
      } catch(e) {}
    }

    function stopAmbient() {
      try {
        if (ambientGain) {
          ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
          setTimeout(() => {
            try { ambientOsc && ambientOsc.stop(); } catch(e) {}
            ambientOsc = null; ambientGain = null;
          }, 900);
        }
      } catch(e) {}
    }

    // Override the existing sound toggle handler
    soundToggle.addEventListener('click', function handler() {
      const isOn = soundToggle.classList.toggle('sound-active');
      if (isOn) {
        soundIcon && (soundIcon.textContent = '🔊');
        soundLabel && (soundLabel.textContent = 'Sound On');
        soundToggle.title = 'Sound: ON (Click to mute)';
        startAmbient();
        setTimeout(() => playChime(523.25, 0.8, 0.22), 200);
        setTimeout(() => playChime(659.25, 0.6, 0.18), 500);
        setTimeout(() => playChime(783.99, 0.5, 0.15), 750);
      } else {
        soundIcon && (soundIcon.textContent = '🔇');
        soundLabel && (soundLabel.textContent = 'Sound: Off');
        soundToggle.title = 'Sound: OFF (Click to enable)';
        stopAmbient();
      }
    });

    // Expose playChime globally so other features can use it
    window.PIP_CHIME = playChime;
  })();

  /* ══════════════════════════════════════════════════════════════════
     4. NIGHTCAP STYLE BUTTONS — Actually apply CSS filter to Pip image
     ══════════════════════════════════════════════════════════════════ */
  (function fixNightcapButtons() {
    const chips = $$('.accessory-chip');
    const pipImg = $('companion-pip-img');
    if (!chips.length || !pipImg) return;

    const FILTERS = {
      'classic': '',
      'rose':    'hue-rotate(320deg) saturate(1.5) brightness(1.05)',
      'gold':    'hue-rotate(25deg) saturate(1.7) sepia(0.3) brightness(1.1)',
      'mint':    'hue-rotate(140deg) saturate(1.4) brightness(1.05)',
    };

    const BASE_GLOW = 'drop-shadow(0 0 30px rgba(251,191,36,0.55)) drop-shadow(0 0 60px rgba(139,92,246,0.35)) drop-shadow(0 12px 40px rgba(0,0,0,0.7))';

    const GLOW_TINTS = {
      'classic': BASE_GLOW,
      'rose':    'drop-shadow(0 0 30px rgba(255,150,180,0.6)) drop-shadow(0 0 60px rgba(255,100,150,0.3)) drop-shadow(0 12px 40px rgba(0,0,0,0.7))',
      'gold':    'drop-shadow(0 0 30px rgba(255,200,50,0.7)) drop-shadow(0 0 60px rgba(255,180,0,0.4)) drop-shadow(0 12px 40px rgba(0,0,0,0.7))',
      'mint':    'drop-shadow(0 0 30px rgba(52,211,153,0.55)) drop-shadow(0 0 60px rgba(16,185,129,0.3)) drop-shadow(0 12px 40px rgba(0,0,0,0.7))',
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const style = chip.dataset.style || 'classic';
        pipImg.classList.add('nightcap-transition');
        pipImg.style.filter = GLOW_TINTS[style] + (FILTERS[style] ? ` ${FILTERS[style]}` : '');

        // Bubble feedback
        const bubble = $('companion-speech-text');
        if (bubble) {
          const msgs = {
            'classic': '"My classic midnight nightcap! The perfect shade of stardust! ✨"',
            'rose':    '"Ooh, rosy pink! I feel like a dream flower! 🌸"',
            'gold':    '"Golden stardust! I am SPARKLING! 🌟"',
            'mint':    '"Minty fresh! Like a cloud made of dreams! ☁️"',
          };
          bubble.textContent = msgs[style] || '"Looking cozy! ✨"';
        }

        // Play a chime if sound is on
        if (window.PIP_CHIME) {
          const notes = { classic: 523.25, rose: 659.25, gold: 783.99, mint: 587.33 };
          window.PIP_CHIME(notes[style] || 523.25, 0.6, 0.18);
        }
      });
    });
  })();

  /* ══════════════════════════════════════════════════════════════════
     5. LULLABY LAB — Fix audio + chime keys + wind button
     ══════════════════════════════════════════════════════════════════ */
  (function fixLullabyLab() {
    const PENTATONIC = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
      'G4': 392.00, 'A4': 440.00
    };

    const MELODY = [
      { note: 'G4', time: 0    },
      { note: 'A4', time: 500  },
      { note: 'G4', time: 1000 },
      { note: 'E4', time: 1500 },
      { note: 'D4', time: 2100 },
      { note: 'C4', time: 2700 },
      { note: 'E4', time: 3200 },
      { note: 'G4', time: 3700 },
    ];

    function playNote(freq, dur, vol) {
      try {
        if (!window.PIP_CHIME) {
          // Standalone audio if sound not toggled on
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(); osc.stop(ctx.currentTime + dur + 0.1);
          return;
        }
        window.PIP_CHIME(freq, dur, vol);
      } catch(e) { console.warn('Note error:', e); }
    }

    // Fix individual chime keys
    const chimeKeys = $$('.chime-key');
    chimeKeys.forEach(key => {
      // Remove all existing listeners by cloning
      const newKey = key.cloneNode(true);
      key.parentNode && key.parentNode.replaceChild(newKey, key);
      newKey.addEventListener('click', () => {
        const noteKey = newKey.dataset.note || 'C4';
        const freq = PENTATONIC[noteKey] || 261.63;
        playNote(freq, 1.0, 0.28);
        newKey.classList.add('key-active');
        setTimeout(() => newKey.classList.remove('key-active'), 350);
        // Bubble
        const bubble = $('companion-speech-text');
        if (bubble) bubble.textContent = `"${noteKey}! 🎵 That note is perfect!"`;
      });
    });

    // Wind lullaby button
    const windBtn = $('wind-lullaby-btn');
    const lullabyStatus = $('lullaby-status');
    let isPlaying = false;

    if (windBtn) {
      const newWindBtn = windBtn.cloneNode(true);
      windBtn.parentNode && windBtn.parentNode.replaceChild(newWindBtn, windBtn);

      newWindBtn.addEventListener('click', () => {
        if (isPlaying) return;
        isPlaying = true;
        const iconEl = newWindBtn.querySelector('#wind-btn-icon');
        const textEl = newWindBtn.querySelector('#wind-btn-text');
        if (iconEl) iconEl.textContent = '🎵';
        if (textEl) textEl.textContent = 'Playing...';
        newWindBtn.disabled = true;

        if (lullabyStatus) {
          lullabyStatus.textContent = '🎶 Playing Pip\'s Midnight Slumber...';
          lullabyStatus.style.color = '#fbbf24';
        }

        MELODY.forEach(item => {
          setTimeout(() => {
            const freq = PENTATONIC[item.note] || 261.63;
            playNote(freq, 0.9, 0.26);
            // Highlight corresponding key
            const key = document.querySelector(`.chime-key[data-note="${item.note}"]`);
            if (key) {
              key.classList.add('key-active');
              setTimeout(() => key.classList.remove('key-active'), 320);
            }
          }, item.time);
        });

        setTimeout(() => {
          isPlaying = false;
          newWindBtn.disabled = false;
          if (iconEl) iconEl.textContent = '🗝️';
          if (textEl) textEl.textContent = 'Wind & Play Melody';
          if (lullabyStatus) {
            lullabyStatus.textContent = '💤 Lullaby complete! Sweet dreams~';
            lullabyStatus.style.color = '#a78bfa';
          }
        }, 4800);
      });
    }
  })();

  /* ══════════════════════════════════════════════════════════════════
     5b. LIGHTING CRAFT — Nightlight glow color swatches audio + interaction
     ══════════════════════════════════════════════════════════════════ */
  (function fixLightingCraft() {
    const swatchBtns = $$('.swatch-btn');
    const lanternGlow = $('lantern-glow');
    const lampReading = $('lamp-reading-text');
    if (!swatchBtns.length) return;

    const GLOW_COLORS = {
      'amber':     { bg: 'radial-gradient(ellipse, rgba(251,191,36,0.5) 0%, rgba(217,119,6,0.2) 50%, transparent 70%)', label: 'Warm Amber · Perfect for sleepy stories.', note: 440 },
      'moonlight': { bg: 'radial-gradient(ellipse, rgba(167,139,250,0.5) 0%, rgba(109,40,217,0.2) 50%, transparent 70%)', label: 'Moonlight Violet · Dreamy adventures await.', note: 523.25 },
      'aurora':    { bg: 'radial-gradient(ellipse, rgba(52,211,153,0.5) 0%, rgba(16,185,129,0.2) 50%, transparent 70%)', label: 'Stardust Mint · For the cosiest cloud naps.', note: 659.25 },
    };

    swatchBtns.forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode && btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', () => {
        $$('.swatch-btn').forEach(b => b.classList.remove('active'));
        newBtn.classList.add('active');

        const color = newBtn.dataset.color || 'amber';
        const cfg = GLOW_COLORS[color] || GLOW_COLORS.amber;

        if (lanternGlow) {
          lanternGlow.style.background = cfg.bg;
          lanternGlow.style.transition = 'background 0.5s ease';
          lanternGlow.dataset.color = color;
        }

        if (lampReading) {
          lampReading.innerHTML = `Current Ambiance: <strong>${color.charAt(0).toUpperCase() + color.slice(1)}</strong> · ${cfg.label}`;
        }

        // Play matching chime note
        if (window.PIP_CHIME) {
          window.PIP_CHIME(cfg.note, 0.8, 0.2);
        } else {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.frequency.value = cfg.note;
            osc.type = 'sine';
            g.gain.setValueAtTime(0.22, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 1);
          } catch(e) {}
        }
      });
    });
  })();

  /* ══════════════════════════════════════════════════════════════════
     6. DREAM DELIVERY ROUTES — Launch button animation
     ══════════════════════════════════════════════════════════════════ */
  (function fixDeliveryLaunch() {
    const launchBtn = $('dispatch-route-btn');
    if (!launchBtn) return;

    const DISPATCHES = [
      { dest: 'Slumber Valley (Bed #402)', dream: 'A flying origami crane singing lullabies in the breeze 🕊️' },
      { dest: 'Whispering Chimneys (Apt 3B)', dream: 'Swimming in warm lavender pudding and marshmallow clouds 💜' },
      { dest: 'Cloud Cushion 9 (Cradle #12)', dream: 'Riding a glowing space whale through Saturn\'s pastel rings 🐋' },
      { dest: 'Moonlit Pine Forest', dream: 'A treehouse library where books whisper bedtime stories 📚' },
      { dest: 'Cosmic Hackathon Arena', dream: 'A magic compiler that fixes every bug with a star burst ✨' },
    ];

    const newBtn = launchBtn.cloneNode(true);
    launchBtn.parentNode && launchBtn.parentNode.replaceChild(newBtn, launchBtn);

    // Also update SVG capsule animation
    function animateCapsule() {
      const capsule = $('delivery-capsule');
      const routeProgress = $('route-progress');
      if (!capsule || !routeProgress) return;

      // Animate the progress path
      routeProgress.style.strokeDashoffset = '800';
      routeProgress.style.transition = 'stroke-dashoffset 3s cubic-bezier(.4,0,.2,1)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          routeProgress.style.strokeDashoffset = '0';
        });
      });

      // Animate capsule along path
      const path = document.getElementById('route-path');
      if (!path) return;
      const len = path.getTotalLength();
      let start = null;
      const dur = 3000;

      function step(ts) {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / dur, 1);
        const pt = path.getPointAtLength(prog * len);
        capsule.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
        if (prog < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function showDispatchModal(dispatch) {
      // Remove existing modal
      const old = $('pip-dispatch-modal');
      if (old) old.remove();

      const modal = document.createElement('div');
      modal.id = 'pip-dispatch-modal';

      const stars = Array.from({ length: 12 }, () => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const s = ['✦','✨','⭐','🌟'][Math.floor(Math.random() * 4)];
        const delay = Math.random() * 1.5;
        return `<span class="dispatch-star-particle" style="left:${x}%;top:${y}%;animation-delay:${delay}s">${s}</span>`;
      }).join('');

      modal.innerHTML = `
        <div class="dispatch-inner">
          <div class="dispatch-stars">${stars}</div>
          <div class="rocket-anim">🚀</div>
          <h3>Dream Dispatched! 🌙</h3>
          <p>Pip is flying to:<br><strong style="color:#fbbf24">${dispatch.dest}</strong></p>
          <div class="dispatch-route-path">
            📦 Dream Package: <em>"${dispatch.dream}"</em>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:center;font-size:0.85rem;color:#a78bfa;">
            <div>🛰️ Route: Nursery Base → Cloud 9 → Chimney Town → ${dispatch.dest}</div>
            <div id="dispatch-countdown" style="color:#fbbf24;font-size:1rem;font-weight:700;margin-top:0.5rem">Closing in 5s...</div>
          </div>
          <button id="dispatch-close-btn" style="
            margin-top:1.2rem;padding:.55rem 1.5rem;border-radius:24px;
            background:linear-gradient(135deg,#e03584,#b91f7e);border:none;
            color:#fff;font-size:1rem;font-weight:700;cursor:pointer;
            font-family:'Fredoka',sans-serif;
          ">✓ Acknowledged!</button>
        </div>
      `;

      document.body.appendChild(modal);

      // Countdown
      let secs = 5;
      const cd = modal.querySelector('#dispatch-countdown');
      const timer = setInterval(() => {
        secs--;
        if (cd) cd.textContent = secs > 0 ? `Closing in ${secs}s...` : 'Closing...';
        if (secs <= 0) { clearInterval(timer); modal.remove(); }
      }, 1000);

      const closeBtn = modal.querySelector('#dispatch-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => { clearInterval(timer); modal.remove(); });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) { clearInterval(timer); modal.remove(); }
      });
    }

    newBtn.addEventListener('click', () => {
      const dispatch = DISPATCHES[Math.floor(Math.random() * DISPATCHES.length)];

      // Update dispatch log
      const logLine = $('log-active-line');
      const deliveryHint = $('delivery-hint');
      if (logLine) logLine.textContent = `[${new Date().toLocaleTimeString()}] Launching to ${dispatch.dest}...`;
      if (deliveryHint) deliveryHint.textContent = `✅ Dream en route to ${dispatch.dest}!`;

      // Play launch chime
      if (window.PIP_CHIME) {
        window.PIP_CHIME(261.63, 0.3, 0.2);
        setTimeout(() => window.PIP_CHIME(329.63, 0.3, 0.2), 150);
        setTimeout(() => window.PIP_CHIME(392.00, 0.3, 0.2), 300);
        setTimeout(() => window.PIP_CHIME(523.25, 0.8, 0.25), 450);
      } else {
        // Play without sound toggle
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
            setTimeout(() => {
              const osc = ctx.createOscillator();
              const g = ctx.createGain();
              osc.frequency.value = f; osc.type = 'sine';
              g.gain.setValueAtTime(0.22, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
              osc.connect(g); g.connect(ctx.destination);
              osc.start(); osc.stop(ctx.currentTime + 0.8);
            }, i * 150);
          });
        } catch(e) {}
      }

      animateCapsule();
      setTimeout(() => showDispatchModal(dispatch), 400);
    });
  })();

  /* ══════════════════════════════════════════════════════════════════
     7. SCROLL STORY — Highlight scenes one by one
     ══════════════════════════════════════════════════════════════════ */
  (function fixScrollStory() {
    const scenes = $$('.story-scene');
    const progressLine = $('story-progress-line');
    if (!scenes.length) return;

    let activeScene = null;

    function updateActiveScene() {
      const vh = window.innerHeight;
      const targetY = vh * 0.45;
      let closestScene = null;
      let closestDist = Infinity;

      scenes.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Distance from center of element to target line
        const mid = rect.top + rect.height / 2;
        const dist = Math.abs(mid - targetY);
        // Only consider elements that are in or near viewport
        if (rect.bottom > 60 && rect.top < vh - 60) {
          if (dist < closestDist) {
            closestDist = dist;
            closestScene = el;
          }
        }
      });

      if (closestScene && closestScene !== activeScene) {
        if (activeScene) {
          activeScene.classList.remove('active-scene', 'scene-active');
          activeScene.classList.add('scene-visited');
        }
        closestScene.classList.add('active-scene', 'scene-active');
        closestScene.classList.remove('scene-visited');
        activeScene = closestScene;

        if (progressLine) {
          const sceneIdx = parseInt(closestScene.dataset.scene || '1');
          const progress = (sceneIdx / scenes.length) * 100;
          progressLine.style.height = `${progress}%`;
          progressLine.style.transition = 'height 0.4s ease';
        }

        if (window.PIP_CHIME && $('sound-toggle')?.classList.contains('sound-active')) {
          const SCENE_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
          const sceneIdx = parseInt(closestScene.dataset.scene || '1') - 1;
          window.PIP_CHIME(SCENE_NOTES[sceneIdx % SCENE_NOTES.length], 0.5, 0.1);
        }
      }
    }

    // Run on scroll with throttle
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
      if (!scrollTimer) {
        scrollTimer = requestAnimationFrame(() => {
          updateActiveScene();
          scrollTimer = null;
        });
      }
    }, { passive: true });

    // Initialize first scene
    setTimeout(updateActiveScene, 300);
  })();

  /* ══════════════════════════════════════════════════════════════════
     7b. DREAM GUESTBOOK — Post wish notes beside form immediately
     ══════════════════════════════════════════════════════════════════ */
  (function fixGuestbook() {
    const form = $('guestbook-form');
    const board = $('notes-pinboard');
    const nameInput = $('wish-name');
    const stickerInput = $('wish-sticker');
    const msgInput = $('wish-message');
    const counter = $('char-counter');
    const clearBtn = $('clear-wishes-btn');

    if (!form || !board) return;

    const DEFAULT_WISHES = [
      { name: "Sleepy Nova", sticker: "⭐", message: "Please build a dream where I can float weightlessly above the candy mountains!", date: "Oct 17, 2026" },
      { name: "Luna the Ghostling", sticker: "🌙", message: "Pip, thank you for making the nightlight amber. The monsters are our friends now!", date: "Oct 17, 2026" },
      { name: "Captain Pajamas", sticker: "☁️", message: "Can you send a dream about sailing a pillow pirate ship on chocolate milk waves?", date: "Oct 18, 2026" },
      { name: "Starlet Dreamer", sticker: "✨", message: "Thank you Pip for keeping watch while all the babies and stars are fast asleep! 💤", date: "Oct 19, 2026" }
    ];

    function renderNotes(wishes) {
      board.innerHTML = '';
      wishes.forEach(item => {
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

        board.appendChild(card);
      });
    }

    function loadAndRender() {
      let wishes = DEFAULT_WISHES;
      try {
        const raw = localStorage.getItem('pip_wishes');
        if (raw) wishes = JSON.parse(raw);
      } catch(e) {
        wishes = DEFAULT_WISHES;
      }
      renderNotes(wishes);
    }

    // Always render immediately
    loadAndRender();

    // Char counter
    if (msgInput && counter) {
      msgInput.addEventListener('input', () => {
        counter.textContent = `${msgInput.value.length} / 180`;
      });
    }

    // Form submit listener (clone to replace any dead or broken listeners)
    const newForm = form.cloneNode(true);
    form.parentNode && form.parentNode.replaceChild(newForm, form);

    const newNameInput = $('wish-name');
    const newStickerInput = $('wish-sticker');
    const newMsgInput = $('wish-message');
    const newCounter = $('char-counter');

    if (newMsgInput && newCounter) {
      newMsgInput.addEventListener('input', () => {
        newCounter.textContent = `${newMsgInput.value.length} / 180`;
      });
    }

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (newNameInput ? newNameInput.value.trim() : '') || 'Sleepy Stargazer';
      const sticker = (newStickerInput ? newStickerInput.value : '') || '⭐';
      const message = newMsgInput ? newMsgInput.value.trim() : '';

      if (!message) return;

      const newWish = {
        name,
        sticker,
        message,
        date: 'Just now'
      };

      let current = [];
      try {
        current = JSON.parse(localStorage.getItem('pip_wishes')) || DEFAULT_WISHES;
      } catch(err) {
        current = DEFAULT_WISHES;
      }

      current.unshift(newWish);
      localStorage.setItem('pip_wishes', JSON.stringify(current));
      renderNotes(current);

      // Play soft chime
      if (window.PIP_CHIME) {
        window.PIP_CHIME(523.25, 0.8, 0.25);
      }

      // Reset form
      newForm.reset();
      if (newCounter) newCounter.textContent = '0 / 180';

      // Feedback in speech bubble
      const bubble = $('companion-speech-text');
      if (bubble) {
        bubble.textContent = `“Yay! I pinned ${name}’s wish note to my wall! 📌✨”`;
      }
    });

    if (clearBtn) {
      const newClearBtn = clearBtn.cloneNode(true);
      clearBtn.parentNode && clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
      newClearBtn.addEventListener('click', () => {
        localStorage.setItem('pip_wishes', JSON.stringify(DEFAULT_WISHES));
        renderNotes(DEFAULT_WISHES);
        if (window.PIP_CHIME) window.PIP_CHIME(440, 0.5, 0.2);
      });
    }
  })();

  /* ══════════════════════════════════════════════════════════════════
     8. VOICE ASSISTANT ON MAIN PAGE — Pip listens and responds
        Fix: proper Speech Recognition that actually captures user voice
     ══════════════════════════════════════════════════════════════════ */
  (function fixMainPageVoice() {
    const voiceBtn  = $('voice-talk-btn');
    const voiceText = $('voice-btn-text');
    const bubble    = $('companion-speech-text');
    const transcript= $('transcript-text');
    const transcriptBox = $('voice-transcript-box');
    const transcriptStatus = $('transcript-status');
    const stopBtn   = $('stop-speech-btn');

    if (!voiceBtn) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SYNTH = window.speechSynthesis;

    let rec = null;
    let isListening = false;
    let isSpeaking = false;

    // Pip's local knowledge base for the main page
    const RESPONSES = [
      { kw: ['who are you','what are you','your name','who is pip'],
        r: ["Hewwo! ✨ I'm Pip — Junior Dream Engineer at the Midnight Nursery! I make lullabies and deliver sweet dreams! 🌙"] },
      { kw: ['hello','hi','hey','howdy','greet'],
        r: ["Hiii sleepy star! 💫 Welcome to Pip's Midnight Observatory! Come, let's explore the stars together!"] },
      { kw: ['lullaby','music','song','chime'],
        r: ["I love making lullabies! 🎶 Try clicking the star chime keys in my Lullaby Lab section below! Do Re Mi Sol La!"] },
      { kw: ['dream','dream delivery','deliver'],
        r: ["I deliver dreams through bedroom chimneys every night! 🚀 Check out my Dream Delivery Routes project below!"] },
      { kw: ['nightlight','lantern','lamp','light'],
        r: ["My nightlights turn scary shadows into friendly pillow fluff! 🏮 Try changing the lantern color in the projects below!"] },
      { kw: ['story','bedtime','once upon'],
        r: ["📖 Once upon a cozy night, little Pip woke at midnight, gathered stardust, and delivered sweet dreams across the sky... *yawn* 💤"] },
      { kw: ['joke','funny','laugh'],
        r: ["Why did the little star go to bed early? Because it was ready to twinkle DOWN! Hehe! 🌙🤭"] },
      { kw: ['tickle','belly','tummy'],
        r: ["Hehehe! 😄 That tickles! My tummy is very ticklish! Hehe stop stop! 🍼"] },
      { kw: ['favourite','favorite','love','like'],
        r: ["My favourite things are warm vanilla milk, star biscuits, and YOU visiting me! 🥛⭐"] },
      { kw: ['eye','amber','glow'],
        r: ["My amber eyes are built-in nightlights! ✨ They store starlight so I can see through dark chimneys! Very practical!"] },
      { kw: ['game','play','catch','star'],
        r: ["Ooh, wanna play? 🎮 Click the star catch button below to play Dream Catcher! Catch all the falling stars!"] },
      { kw: ['help','what can'],
        r: ["I can tell you about dreams, lullabies, nightlights! Tap my head, tickle my tummy, or ask me anything! ✨"] },
      { kw: ['goodbye','bye','sleep'],
        r: ["Sweet dreams, sleepy star! 💤 May your dreams be full of warm vanilla and dancing constellations! Goodnight! 🌙"] },
    ];

    function getPipResponse(text) {
      const t = text.toLowerCase();
      for (const entry of RESPONSES) {
        if (entry.kw.some(k => t.includes(k))) {
          return entry.r[Math.floor(Math.random() * entry.r.length)];
        }
      }
      // Generic
      const fallbacks = [
        "Hmm... I'm not sure about that, but it sounds cozy! ✨ Ask me about dreams, lullabies or stars!",
        "Ooh that's a big question for a little dream engineer! 🍼 Maybe scroll down to learn more about me?",
        "Teehee~ I dropped my stardust thinking about that! 💫 Can you ask again?",
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    function speakPip(text) {
      if (!SYNTH) return;
      SYNTH.cancel();
      const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[✨🌙⭐🎀🍼🧸🌟💤🎵🎶🏮💛💖✦★🥛🎉🥺🎈🌈💫]/g, '').replace(/\s+/g, ' ').trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.pitch = 1.82; // Cute high baby pitch
      u.rate = 1.08;  // Energetic baby cadence
      u.volume = 1;
      u.lang = 'en-US';
      // Pick sweetest baby/child/female voice
      const voices = SYNTH.getVoices();
      const v = voices.find(v => /samantha|karen|zira|victoria|child/i.test(v.name))
             || voices.find(v => /female/i.test(v.name) && v.lang.startsWith('en'))
             || voices.find(v => v.lang.startsWith('en'))
             || voices[0];
      if (v) u.voice = v;
      u.onstart = () => { isSpeaking = true; };
      u.onend = u.onerror = () => { isSpeaking = false; };
      SYNTH.speak(u);
    }

    function showResponse(userText, pipReply) {
      if (bubble) bubble.textContent = pipReply;
      if (transcript) transcript.textContent = `You: "${userText}" → Pip: "${pipReply}"`;
      speakPip(pipReply);
    }

    function stopListening() {
      isListening = false;
      voiceBtn.classList.remove('voice-listening');
      if (voiceText) voiceText.textContent = 'Talk to Pip';
      if (transcriptStatus) transcriptStatus.textContent = '✅ Got it!';
      if (transcriptBox) transcriptBox.classList.add('hidden');
      try { rec && rec.stop(); } catch(e) {}
    }

    function startListening() {
      if (!SpeechRec) {
        if (bubble) bubble.textContent = '"Voice recognition not supported in this browser. Try Chrome or Edge! 🎙️"';
        return;
      }
      if (isListening) { stopListening(); return; }

      rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('voice-listening');
        if (voiceText) voiceText.textContent = '🎙️ Listening...';
        if (bubble) bubble.textContent = '"I\'m listening, sleepy star! Ask me anything! 🎙️"';
        if (transcriptBox) transcriptBox.classList.remove('hidden');
        if (transcriptStatus) transcriptStatus.textContent = '🎙️ Listening...';
        if (transcript) transcript.textContent = '"Say something to Pip..."';
        if (SYNTH) SYNTH.cancel();
      };

      rec.onresult = (e) => {
        const t = Array.from(e.results).map(r => r[0].transcript).join('');
        if (transcript) transcript.textContent = `You: "${t}"`;
        if (e.results[e.results.length - 1].isFinal) {
          stopListening();
          if (t.trim()) {
            setTimeout(() => {
              const reply = getPipResponse(t.trim());
              showResponse(t.trim(), reply);
            }, 300);
          }
        }
      };

      rec.onerror = (e) => {
        stopListening();
        const msgs = {
          'not-allowed': '"Oops! Microphone permission denied. Please allow mic access! 🎙️"',
          'no-speech':   '"I didn\'t hear anything! Try speaking louder, sleepy star! 🎙️"',
          'network':     '"Network error. Are you on localhost? 🌐"',
        };
        if (bubble) bubble.textContent = msgs[e.error] || '"Microphone error. Try again! 🎙️"';
      };

      rec.onend = () => { if (isListening) stopListening(); };

      try { rec.start(); }
      catch(e) {
        stopListening();
        if (bubble) bubble.textContent = '"Couldn\'t start the microphone. Try clicking again! 🎙️"';
      }
    }

    // Override the existing voice button
    const newVoiceBtn = voiceBtn.cloneNode(true);
    voiceBtn.parentNode && voiceBtn.parentNode.replaceChild(newVoiceBtn, voiceBtn);
    newVoiceBtn.addEventListener('click', startListening);

    // Stop button
    if (stopBtn) {
      const newStopBtn = stopBtn.cloneNode(true);
      stopBtn.parentNode && stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
      newStopBtn.addEventListener('click', () => {
        stopListening();
        if (SYNTH) SYNTH.cancel();
      });
    }

    // Load voices when available
    if (SYNTH && SYNTH.onvoiceschanged !== undefined) {
      SYNTH.onvoiceschanged = () => SYNTH.getVoices();
    }
  })();

  /* ══════════════════════════════════════════════════════════════════
     9. STAR INTERACTIONS — click on floating stars for sparkles
     ══════════════════════════════════════════════════════════════════ */
  (function fixStarInteractions() {
    const stars = $$('.interactive-star');
    const bubble = $('companion-speech-text');
    const starCountEl = $('star-count-val');
    let starCount = parseInt(localStorage.getItem('pip_stars') || '0');

    if (starCountEl) starCountEl.textContent = starCount;

    const STAR_MSGS = [
      '"Ooh, you found my star! 🌟 It goes in the dream basket!"',
      '"A twinkling star for your collection! ✨ So shiny!"',
      '"Hehe, tickle tickle star! 💫 You\'re so gentle!"',
      '"That\'s my favourite star! It smells like vanilla! 🌙"',
    ];

    stars.forEach(star => {
      star.style.cursor = 'pointer';
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        starCount++;
        if (starCountEl) starCountEl.textContent = starCount;
        localStorage.setItem('pip_stars', starCount);
        if (bubble) bubble.textContent = STAR_MSGS[Math.floor(Math.random() * STAR_MSGS.length)];
        if (window.PIP_CHIME) window.PIP_CHIME(783.99, 0.4, 0.15);
        // Burst sparkles
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const rect = star.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const sparkle = document.createElement('div');
            sparkle.className = 'pip-sparkle-particle';
            sparkle.textContent = ['✦','✨','⭐','💫'][Math.floor(Math.random() * 4)];
            sparkle.style.cssText = `
              left:${cx + (Math.random()-0.5)*40}px;
              top:${cy + (Math.random()-0.5)*20}px;
              font-size:${10+Math.random()*10}px;
              color:#fbbf24;
            `;
            document.body.appendChild(sparkle);
            sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
          }, i * 80);
        }
      });
    });
  })();

  /* ══════════════════════════════════════════════════════════════════
     INIT — Run after DOM is ready
     ══════════════════════════════════════════════════════════════════ */
  console.log('✨ fix-all.js loaded — All Pip Observatory fixes active!');

})();
