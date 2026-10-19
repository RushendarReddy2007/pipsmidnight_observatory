/**
 * FEATURES.JS — All Hackathon Tier Features
 * ✅ Tier 1: Eyes follow cursor, scroll-driven story, Easter egg, responsive
 * ✅ Tier 2: Flashlight/nightlight cursor, Lullaby Lab real audio, mini-game
 * ✅ Tier 3: Character remembers visitor (LocalStorage), custom greetings
 */
(function() {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     TIER 3: CHARACTER REMEMBERS VISITOR
     ══════════════════════════════════════════════════════════════════════════ */
  const visitCount = parseInt(localStorage.getItem('pip_visits') || '0') + 1;
  localStorage.setItem('pip_visits', visitCount);
  localStorage.setItem('pip_last_visit', new Date().toISOString());

  function showVisitorGreeting() {
    const bubble = document.getElementById('companion-speech-text');
    if (!bubble) return;
    if (visitCount === 1) {
      bubble.textContent = '"Hewwo! Tap my head, tickle my tummy, or talk with me! ✨"';
    } else if (visitCount === 2) {
      bubble.textContent = `"Oh! You came back! 🎉 Visit #${visitCount} — Pip missed you so much! 🌙"`;
    } else {
      bubble.textContent = `"A loyal dream explorer! 🌟 Visit #${visitCount}! Your cloud seat is always saved! ✨"`;
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TIER 1: EYES FOLLOW CURSOR
     Pip's amber glowing eyes track the mouse pointer smoothly
     ══════════════════════════════════════════════════════════════════════════ */
  function initEyeTracking() {
    const pipImg = document.getElementById('companion-pip-img');
    if (!pipImg) return;

    // Create eye overlay elements positioned over Pip's eye sockets
    const eyeContainer = document.createElement('div');
    eyeContainer.id = 'pip-eye-tracker';
    eyeContainer.style.cssText = `
      position:absolute;top:0;left:0;width:100%;height:100%;
      pointer-events:none;z-index:15;
    `;

    const leftPupil  = createPupil('left-pupil');
    const rightPupil = createPupil('right-pupil');
    eyeContainer.appendChild(leftPupil);
    eyeContainer.appendChild(rightPupil);
    pipImg.parentElement.appendChild(eyeContainer);

    let lastX = 0, lastY = 0;
    document.addEventListener('mousemove', (e) => {
      lastX = e.clientX; lastY = e.clientY;
    });

    function updateEyes() {
      const rig = document.getElementById('companion-rig');
      if (!rig) { requestAnimationFrame(updateEyes); return; }
      const rect = rig.getBoundingClientRect();
      const cx = rect.left + rect.width  * 0.5;
      const cy = rect.top  + rect.height * 0.38; // eye level

      const dx = lastX - cx, dy = lastY - cy;
      const angle = Math.atan2(dy, dx);
      const dist  = Math.min(Math.hypot(dx, dy) / 8, 5);

      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist;

      [leftPupil, rightPupil].forEach(p => {
        p.style.transform = `translate(calc(-50% + ${ex}px), calc(-50% + ${ey}px))`;
      });
      requestAnimationFrame(updateEyes);
    }
    requestAnimationFrame(updateEyes);

    // Touch fallback — tilt Pip's rig slightly
    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      lastX = t.clientX; lastY = t.clientY;
    }, { passive: true });
  }

  function createPupil(id) {
    const p = document.createElement('div');
    p.id = id;
    p.style.cssText = `
      position:absolute;
      width:10px;height:10px;
      border-radius:50%;
      background:rgba(251,191,36,.85);
      box-shadow:0 0 8px rgba(251,191,36,.9),0 0 18px rgba(251,191,36,.5);
      transform:translate(-50%,-50%);
      transition:transform .08s ease;
      pointer-events:none;
    `;
    // Position left/right
    if (id.includes('left')) {
      p.style.left = '38%'; p.style.top = '36%';
    } else {
      p.style.left = '62%'; p.style.top = '36%';
    }
    return p;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TIER 2: FLASHLIGHT / NIGHTLIGHT CURSOR
     Canvas-based flashlight reveals content behind dark curtain
     ══════════════════════════════════════════════════════════════════════════ */
  let flashlightMode = false;
  let flashCanvas, flashCtx, mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;

  function createFlashlightCanvas() {
    flashCanvas = document.createElement('canvas');
    flashCanvas.id = 'flashlight-canvas';
    flashCanvas.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      pointer-events:none;z-index:9999;
      display:none;
      mix-blend-mode:multiply;
    `;
    document.body.appendChild(flashCanvas);
    flashCtx = flashCanvas.getContext('2d');
    resizeFlashCanvas();
    window.addEventListener('resize', resizeFlashCanvas);
  }

  function resizeFlashCanvas() {
    if (!flashCanvas) return;
    flashCanvas.width  = window.innerWidth;
    flashCanvas.height = window.innerHeight;
  }

  function drawFlashlight() {
    if (!flashlightMode || !flashCtx) return;
    flashCtx.clearRect(0, 0, flashCanvas.width, flashCanvas.height);

    // Dark overlay
    flashCtx.fillStyle = 'rgba(5,4,20,0.92)';
    flashCtx.fillRect(0, 0, flashCanvas.width, flashCanvas.height);

    // Flashlight cone — radial gradient hole
    const grad = flashCtx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
    grad.addColorStop(0,    'rgba(5,4,20,0)');
    grad.addColorStop(0.5,  'rgba(5,4,20,0)');
    grad.addColorStop(0.85, 'rgba(5,4,20,0.6)');
    grad.addColorStop(1,    'rgba(5,4,20,0.92)');

    flashCtx.globalCompositeOperation = 'destination-out';
    flashCtx.fillStyle = grad;
    flashCtx.beginPath();
    flashCtx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
    flashCtx.fill();
    flashCtx.globalCompositeOperation = 'source-over';

    // Amber glow center
    const glow = flashCtx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
    glow.addColorStop(0,   'rgba(251,191,36,0.08)');
    glow.addColorStop(0.5, 'rgba(251,191,36,0.03)');
    glow.addColorStop(1,   'transparent');
    flashCtx.fillStyle = glow;
    flashCtx.beginPath();
    flashCtx.arc(mouseX, mouseY, 80, 0, Math.PI*2);
    flashCtx.fill();

    requestAnimationFrame(drawFlashlight);
  }

  function toggleFlashlight(on) {
    flashlightMode = on;
    if (flashCanvas) flashCanvas.style.display = on ? 'block' : 'none';
    document.body.style.cursor = on ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='10' fill='%23fbbf24' fill-opacity='.25' stroke='%23fbbf24' stroke-width='2'/%3E%3C/svg%3E") 16 16, crosshair` : '';
    if (on) drawFlashlight();
  }

  function initFlashlightCursor() {
    createFlashlightCanvas();

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
    });
    document.addEventListener('touchmove', (e) => {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }, { passive: true });

    // Add flashlight toggle button to page
    const btn = document.createElement('button');
    btn.id = 'flashlight-toggle';
    btn.innerHTML = '🔦 Nightlight';
    btn.title = 'Toggle flashlight cursor mode';
    btn.style.cssText = `
      position:fixed;bottom:100px;right:20px;z-index:10000;
      padding:.5rem 1rem;border-radius:24px;font-size:.85rem;font-weight:700;
      font-family:'Fredoka','Quicksand',sans-serif;
      background:rgba(16,12,36,.85);border:1.5px solid rgba(251,191,36,.5);
      color:#fbbf24;cursor:pointer;transition:all .2s ease;
      box-shadow:0 4px 16px rgba(0,0,0,.4);
    `;
    btn.addEventListener('click', () => {
      flashlightMode = !flashlightMode;
      toggleFlashlight(flashlightMode);
      btn.innerHTML = flashlightMode ? '💡 Exit Nightlight' : '🔦 Nightlight';
      btn.style.background = flashlightMode
        ? 'rgba(251,191,36,.25)' : 'rgba(16,12,36,.85)';
    });
    document.body.appendChild(btn);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TIER 2: LULLABY LAB — Real Web Audio API
     ══════════════════════════════════════════════════════════════════════════ */
  let lullabyPlaying = false;
  let lullabyCtx = null;
  let lullabyNodes = [];

  const LULLABY_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 392.00, 349.23, 293.66];
  const LULLABY_DURATIONS = [0.5, 0.5, 0.5, 0.5, 0.75, 0.25, 0.5, 0.5];

  function playLullabyNote(ctx, freq, startTime, duration, gainValue) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const reverb = ctx.createConvolver();
    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.4);
    lullabyNodes.push(osc, gain);

    // Overtone (1 octave up, softer)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(gainValue * 0.25, startTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.3);
    lullabyNodes.push(osc2, gain2);
  }

  function startLullaby() {
    if (lullabyPlaying) return;
    lullabyPlaying = true;
    lullabyCtx = new (window.AudioContext || window.webkitAudioContext)();

    let t = lullabyCtx.currentTime + 0.1;
    function playLoop() {
      if (!lullabyPlaying) return;
      LULLABY_NOTES.forEach((note, i) => {
        playLullabyNote(lullabyCtx, note, t, LULLABY_DURATIONS[i], 0.22);
      });
      const totalDur = LULLABY_DURATIONS.reduce((a,b)=>a+b,0);
      t += totalDur + 0.5;
      setTimeout(() => {
        if (lullabyPlaying) playLoop();
      }, (totalDur + 0.5) * 1000);
    }
    playLoop();
  }

  function stopLullaby() {
    lullabyPlaying = false;
    if (lullabyCtx) {
      lullabyNodes.forEach(n => { try { n.stop(); } catch(e){} });
      lullabyNodes = [];
      lullabyCtx.close();
      lullabyCtx = null;
    }
  }

  function initLullabyLabControls() {
    // Find Lullaby Lab project card and add audio controls
    const cards = document.querySelectorAll('.project-card, .dream-project-card');
    cards.forEach(card => {
      const title = card.querySelector('h3, .project-title, .card-title');
      if (!title || !title.textContent.toLowerCase().includes('lullaby')) return;

      const ctrl = document.createElement('div');
      ctrl.style.cssText = 'margin-top:.8rem;display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;';

      const playBtn = document.createElement('button');
      playBtn.innerHTML = '▶️ Play Lullaby';
      playBtn.style.cssText = `
        padding:.4rem .9rem;border-radius:20px;font-size:.82rem;font-weight:700;
        font-family:'Fredoka',sans-serif;cursor:pointer;transition:all .2s;
        background:linear-gradient(135deg,rgba(167,139,250,.25),rgba(139,92,246,.2));
        border:1.5px solid rgba(167,139,250,.5);color:#c4b5fd;
      `;

      const stopBtn = document.createElement('button');
      stopBtn.innerHTML = '⏹️ Stop';
      stopBtn.style.cssText = playBtn.style.cssText;
      stopBtn.style.display = 'none';

      const muteNote = document.createElement('span');
      muteNote.textContent = '🔊 Audio on (click stop to mute)';
      muteNote.style.cssText = 'font-size:.75rem;color:#a78bfa;';
      muteNote.style.display = 'none';

      playBtn.onclick = () => {
        startLullaby();
        playBtn.style.display = 'none';
        stopBtn.style.display = '';
        muteNote.style.display = '';
      };
      stopBtn.onclick = () => {
        stopLullaby();
        stopBtn.style.display = 'none';
        muteNote.style.display = 'none';
        playBtn.style.display = '';
      };

      ctrl.appendChild(playBtn);
      ctrl.appendChild(stopBtn);
      ctrl.appendChild(muteNote);
      card.appendChild(ctrl);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TIER 2: MINI-GAME — Dream Catcher (catch falling stars)
     ══════════════════════════════════════════════════════════════════════════ */
  let gameActive = false;
  let gameScore  = 0;
  let gameEl     = null;

  function createMiniGame() {
    if (gameEl) { gameEl.remove(); gameEl = null; }
    gameActive = false;

    const overlay = document.createElement('div');
    overlay.id = 'dream-catcher-game';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      background:rgba(5,4,20,.95);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      padding-top:40px;
      font-family:'Fredoka','Quicksand',sans-serif;
      color:#f5f0ff;
    `;

    overlay.innerHTML = `
      <h2 style="font-size:2rem;color:#fbbf24;margin-bottom:.3rem;">⭐ Dream Catcher ⭐</h2>
      <p style="color:#c4b5fd;margin-bottom:.8rem;">Click the falling dream stars before they escape!</p>
      <div style="display:flex;gap:1.5rem;margin-bottom:.8rem;font-size:1.1rem;">
        <span>Score: <strong id="gc-score" style="color:#fbbf24;">0</strong></span>
        <span>Time: <strong id="gc-timer" style="color:#f9a8d4;">30</strong>s</span>
      </div>
      <div id="gc-arena" style="
        position:relative;width:min(600px,90vw);height:400px;
        background:rgba(10,8,25,.8);border:2px solid rgba(167,139,250,.3);
        border-radius:20px;overflow:hidden;margin-bottom:.8rem;
      "></div>
      <div style="display:flex;gap:1rem;">
        <button id="gc-start" style="
          padding:.6rem 1.5rem;border-radius:24px;font-size:1rem;font-weight:700;
          background:linear-gradient(135deg,#e03584,#b91f7e);border:none;
          color:#fff;cursor:pointer;font-family:'Fredoka',sans-serif;
        ">▶ Start Game</button>
        <button id="gc-close" style="
          padding:.6rem 1.5rem;border-radius:24px;font-size:1rem;font-weight:700;
          background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.3);
          color:#fff;cursor:pointer;font-family:'Fredoka',sans-serif;
        ">✕ Close</button>
      </div>
      <p id="gc-result" style="margin-top:.8rem;font-size:1.2rem;color:#fbbf24;min-height:1.5rem;"></p>
    `;

    document.body.appendChild(overlay);
    gameEl = overlay;

    const arena     = overlay.querySelector('#gc-arena');
    const scoreEl   = overlay.querySelector('#gc-score');
    const timerEl   = overlay.querySelector('#gc-timer');
    const resultEl  = overlay.querySelector('#gc-result');
    const startBtn  = overlay.querySelector('#gc-start');
    const closeBtn  = overlay.querySelector('#gc-close');
    let timeLeft, gameInterval, spawnInterval;

    closeBtn.onclick = () => { endGame(); overlay.remove(); gameEl = null; };

    startBtn.onclick = () => {
      gameScore = 0; timeLeft = 30;
      scoreEl.textContent = '0';
      timerEl.textContent = '30';
      resultEl.textContent = '';
      arena.innerHTML = '';
      startBtn.disabled = true;
      gameActive = true;

      gameInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
      }, 1000);

      spawnInterval = setInterval(() => {
        if (!gameActive) return;
        spawnStar(arena, scoreEl);
      }, 700);
    };

    function endGame() {
      gameActive = false;
      clearInterval(gameInterval);
      clearInterval(spawnInterval);
      startBtn.disabled = false;
      arena.querySelectorAll('.gc-star').forEach(s => s.remove());
      const msg = gameScore >= 20 ? '🌟 Dream Master! Amazing!' :
                  gameScore >= 10 ? '✨ Great catch! Pip is impressed!' :
                  '🌙 Good try! Keep catching those dreams!';
      resultEl.textContent = `Final Score: ${gameScore} ⭐ — ${msg}`;
    }
  }

  function spawnStar(arena, scoreEl) {
    const star = document.createElement('div');
    star.className = 'gc-star';
    const emojis = ['⭐','🌟','✨','💫','🌙'];
    star.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const x = Math.random() * (arena.offsetWidth - 40);
    const dur = Math.random()*2 + 2;
    star.style.cssText = `
      position:absolute;left:${x}px;top:-30px;
      font-size:${1.5+Math.random()}rem;cursor:pointer;
      animation:starFall ${dur}s linear forwards;
      filter:drop-shadow(0 0 6px #fbbf24);
    `;

    star.onclick = () => {
      star.remove();
      gameScore++;
      scoreEl.textContent = gameScore;
      // Pop effect
      const pop = document.createElement('span');
      pop.textContent = '+1 ✨';
      pop.style.cssText = `
        position:absolute;left:${x}px;top:${parseInt(star.style.top)||0}px;
        color:#fbbf24;font-weight:700;font-size:1rem;
        animation:popUp .6s ease-out forwards;pointer-events:none;
        font-family:'Fredoka',sans-serif;
      `;
      arena.appendChild(pop);
      setTimeout(() => pop.remove(), 700);
    };

    star.addEventListener('animationend', () => star.remove());
    arena.appendChild(star);
  }

  function initMiniGameButton() {
    // Add game button to the mini-games section
    const catchBtn = document.getElementById('mg-catcher-btn');
    if (catchBtn) {
      catchBtn.addEventListener('click', () => {
        createMiniGame();
      });
    }
    // Also add a floating game button
    const gameBtn = document.createElement('button');
    gameBtn.id = 'floating-game-btn';
    gameBtn.innerHTML = '⭐ Play Dream Catcher';
    gameBtn.title = 'Play the Dream Catcher mini-game!';
    gameBtn.style.cssText = `
      position:fixed;bottom:50px;right:20px;z-index:10000;
      padding:.5rem 1rem;border-radius:24px;font-size:.85rem;font-weight:700;
      font-family:'Fredoka','Quicksand',sans-serif;
      background:linear-gradient(135deg,rgba(167,139,250,.25),rgba(139,92,246,.18));
      border:1.5px solid rgba(167,139,250,.5);color:#c4b5fd;cursor:pointer;
      transition:all .2s ease;box-shadow:0 4px 16px rgba(0,0,0,.4);
    `;
    gameBtn.addEventListener('click', createMiniGame);
    document.body.appendChild(gameBtn);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TIER 1: SCROLL-DRIVEN STORY
     Sections fade+slide in as user scrolls
     ══════════════════════════════════════════════════════════════════════════ */
  function initScrollStory() {
    const targets = document.querySelectorAll(
      '#about, #projects, #story, #guestbook, .project-card, .about-detail, .story-chapter'
    );
    if (!targets.length || !window.IntersectionObserver) return;

    targets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity    = '1';
          entry.target.style.transform  = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => obs.observe(el));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INJECT CSS FOR MINI-GAME ANIMATIONS
     ══════════════════════════════════════════════════════════════════════════ */
  function injectGameCSS() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes starFall {
        from { top: -30px; opacity: 1; }
        to   { top: 420px; opacity: .3; }
      }
      @keyframes popUp {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(-30px); }
      }
      #gc-start:hover { opacity: .85; transform: scale(1.04); }
      #gc-close:hover { background: rgba(255,255,255,.2); }
      #flashlight-toggle:hover { background: rgba(251,191,36,.2) !important; border-color: #fbbf24 !important; }
      #floating-game-btn:hover { background: linear-gradient(135deg,rgba(167,139,250,.35),rgba(139,92,246,.28)) !important; transform: translateY(-2px); }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INIT ALL
     ══════════════════════════════════════════════════════════════════════════ */
  function init() {
    injectGameCSS();
    showVisitorGreeting();
    initEyeTracking();
    initFlashlightCursor();
    initMiniGameButton();
    initScrollStory();
    // Lullaby Lab controls — wait for DOM to be fully rendered
    setTimeout(initLullabyLabControls, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
