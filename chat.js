/**
 * TALK WITH PIP — COMPLETE CHAT ENGINE v3
 * ✅ Voice INPUT  (Web Speech Recognition – user speaks to Pip)
 * ✅ Voice OUTPUT (Web Speech Synthesis  – Pip speaks back)
 * ✅ Smart offline AI (20+ topic categories)
 * ✅ Character remembers visitor (LocalStorage)
 * ✅ Tier 3 compliant
 */
(function () {
  'use strict';

  /* ── STATE ─────────────────────────────────────────────────────────────── */
  const visitCount   = parseInt(localStorage.getItem('pip_visits') || '0') + 1;
  const visitorName  = localStorage.getItem('pip_visitor_name') || null;
  const lastVisit    = localStorage.getItem('pip_last_visit');
  localStorage.setItem('pip_visits',     visitCount);
  localStorage.setItem('pip_last_visit', new Date().toISOString());

  const STATE = {
    theme:        localStorage.getItem('pip_theme')  || 'night',
    soundEnabled: localStorage.getItem('pip_sound')  === 'true',
    voiceEnabled: localStorage.getItem('pip_voice')  !== 'false',
    isThinking:   false,
    isSpeaking:   false,
    isListening:  false,
    recognition:  null,
    audioCtx:     null,
    messages:     []
  };

  /* ── DOM ───────────────────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const DOM = {
    html:            document.documentElement,
    themeToggle:     $('theme-toggle'),
    themeIcon:       $('theme-icon'),
    themeLabel:      $('theme-label'),
    soundToggle:     $('sound-toggle'),
    soundIcon:       $('sound-icon'),
    soundLabel:      $('sound-label'),
    chatMessages:    $('chat-messages'),
    chatForm:        $('chat-form'),
    chatInput:       $('chat-input'),
    sendBtn:         $('send-btn'),
    micBtn:          $('mic-btn'),
    typingIndicator: $('typing-indicator'),
    charCounter:     $('chat-char-counter'),
    suggestionsPills:$('suggestions-pills'),
    clearChatBtn:    $('clear-chat-btn'),
    quickClearBtn:   $('quick-clear-btn'),
    clearConfirmModal: $('clear-confirm-modal'),
    confirmClearBtn: $('confirm-clear-btn'),
    cancelClearBtn:  $('cancel-clear-btn'),
    engineStatusText:$('engine-status-text'),
    pipMoodText:     $('pip-mood-text'),
    starsField:      $('stars-field'),
    voiceStatusBadge:$('voice-status-badge'),
    voiceToggleBtn:  $('pip-voice-toggle'),
    stopSpeakingBtn: $('pip-stop-speaking'),
    menuToggle:      $('menu-toggle'),
    mobileNav:       $('mobile-nav'),
    micStatus:       $('mic-status-text'),
    visitBanner:     $('returning-visitor-banner')
  };

  /* ─────────────────────────────────────────────────────────────────────────
     OFFLINE KNOWLEDGE BASE — Pip answers naturally
     ───────────────────────────────────────────────────────────────────────── */
  const KB = [
    { kw:['who are you','what are you','your name','who is pip','introduce','about you','tell me about'],
      r:["Hewwo! ✨ I'm Pip — a baby skull with glowing amber eye sockets and a starry nightcap with a pink bow! I'm a Junior Dream Engineer at the Midnight Nursery. I build the dreams you fall asleep inside! 🌙",
         "I'm Pip! 🍼 Teehee~ I'm tiny, a little clumsy, verrry sleepy, but full of stardust! I work at the Midnight Nursery making lullabies and delivering sweet dreams to sleeping children! ✨"]},
    { kw:['what do you do','midnight nursery','your job','profession','work','dream engineer'],
      r:["At the Midnight Nursery I harvest stardust, tune star chimes, carve nightlights, and fly dream bubbles down bedroom chimneys! 🧸 It's the BEST job — even if I spill the stardust sometimes. Oopsie! ✨",
         "The Midnight Nursery is our cozy cloud workshop! 🌌 We mix lullabies, fluff dream clouds, and make sure no little creature faces scary shadows alone. I'm very important there... even if I trip over my nightcap. Hehe!"]},
    { kw:['how do you make dream','dream recipe','dream ingredient','how dreams','what makes dream'],
      r:["First — a pinch of stardust! Then a gentle lullaby! Then a tiny bit of warm imagination. Fold it into a dream bubble and pop it down the chimney! 🌟 Easy! ...Well, sometimes I drop the bubble. Oops! ✨",
         "Secret recipe! 🥣 Two scoops of lavender cloud fluff, three soft sighs from the moon, a sprinkle of chiming stars — baked in the dream furnace until it turns into a cozy adventure! Then I deliver it personally! 🌈"]},
    { kw:['story','once upon','bedtime','fairy tale','tell me a','read me'],
      r:["📖 Once upon a cozy night, a little cloud named Poff wanted to be a pillow for sleeping children. But the wind kept tickling him! So Poff drifted to a quiet bedroom and hummed a sweet rain-song until everyone fell fast asleep… *yawn* ☁️💤 The end!",
         "🌟 Far above the rooftops, a baby star forgot how to twinkle. 'What if I shine too bright?' it whispered. Pip floated over with warm chamomile tea and said: 'Just shine as soft as a nightlight!' And the little star drifted into the sweetest slumber. The end! ⭐"]},
    { kw:['favourite','favorite','like','love','enjoy','hobby','what makes you happy'],
      r:["My absolute favourite thing is warm vanilla milk with star biscuits! 🥛✨ And when a sleeping baby giggles because their dream has flying kittens in it — my amber eyes glow SO bright! 😄",
         "I love the sound of the golden music box in the Lullaby Lab! 🎶 And cloud pillows — you can never have too many! And YOU visiting me, sleepy star! 🧸"]},
    { kw:['amber eye','eyes glow','eye socket','why your eyes','glowing'],
      r:["My eye sockets glow warm amber like tiny built-in nightlights! 💡 When nursery creatures get scared of shadowy corners I sit nearby so they know someone friendly is watching over them! ✨",
         "They glow because they're filled with stored starlight! ⭐ It helps me see through dark chimneys when delivering dreams. Very practical! And means I never need a flashlight. Hehe! 🌙"]},
    { kw:['joke','funny','laugh','haha','lol','giggle'],
      r:["Hehe! 😄 Why did the little star go to bed early? Because it was ready to twinkle DOWN! Get it? Hehe! Did I do the joke right? 🌙🤭",
         "What do baby clouds drink before bedtime? Moo-n milk! 🥛☁️ Hehehe! My nightcap nearly fell off laughing! 🎀",
         "Why did Pip fall asleep at the dream factory? Because all the work was SO dreamy! Hehe! 💤"]},
    { kw:['nightlight','lantern','lamp','light','glow'],
      r:["I hand-carve every crescent moon nightlight! 🏮 They cast warm cozy shadows so anything scary under the bed turns into friendly pillow fluff. Magic! ✨",
         "My favourite lantern setting is Amber Slumber! 🌙 It warms the whole room and whispers: 'You are safe here.' I carry one everywhere because… I dislike silence. Hehe! 💫"]},
    { kw:['lullaby','music','song','chime','sing','melody','lullaby lab'],
      r:["In the Lullaby Lab I tune star chimes to the pentatonic scale! 🎶 Do, Re, Mi, Sol, La! It relaxes your heartbeat and tucks your thoughts into a soft warm cloud. Try the Lullaby Lab section on the main page! ✨",
         "I HATE silence so the Lullaby Lab always hums! 🎵 We have tiny music boxes playing 'Cloud Drift Waltz', 'Starlight Cradle', and my favourite: 'The Amber Lullaby'! 💤"]},
    { kw:['silence','dislike','hate','afraid','fear','scared'],
      r:["I strictly dislike silence! 🙅 It feels too big and empty. That's why the Nursery always hums with chimes, ticking star-clocks, or soft music boxes! Even the sleeping clouds make little snoring sounds. 🎵",
         "Silence is spooky! A gentle melody or the soft patter of rain is SO much nicer. I keep a tiny wind chime with me just in case things get too quiet. Even a little 'tink tink' makes everything cosier! 🎶"]},
    { kw:['deliver','route','chimney','fly','sky','how do you deliver'],
      r:["I steer a fluffy cloud-ship across the night sky, dodge noisy thunderstorms, and pop dream bubbles down bedroom chimneys! 🌙 I check my constellation delivery map to make sure every sleeping child gets the right dream! ⛅",
         "Dream delivery is my specialty! 📦✨ I ride my star-powered cloud, navigate by constellation, and slip dream bubbles under doors and down chimneys. Sometimes they float off-course and someone dreams about cheese by accident… Oopsie! 🧀"]},
    { kw:['nightcap','hat','bow','pink bow','cap','wear'],
      r:["My starry nightcap keeps my head warm in the cold upper clouds! 🎀 The pink bow was lovingly tied by the Head Nursery Nurse so I wouldn't lose it on delivery routes. My most prized accessory! ✨",
         "The nightcap has 47 hand-embroidered stars! 🌟 And the pink bow has a tiny bell inside — so my Nursery friends can always find me when I wander off. Which happens often. Hehe! 🎀"]},
    { kw:['hello','hi','hey','good morning','good night','greetings','howdy','hewwo'],
      r:["Hewwo, lovely friend! ✨ Did you have a good day? Pull up a cloud chair and let's talk about stars and dreams! 🌙",
         "Hello, sleepy traveler! 🌟 Welcome to Pip's cozy chat corner! What bedtime secrets can I share tonight? ☁️",
         "Hewwo hewwo HEWWO! 🎉 A visitor! Quick, let me put the star kettle on! What can I do for you, sleepy star? ✨"]},
    { kw:['how are you','how do you feel','are you okay','how is pip'],
      r:["I'm wonderful, thank you! 🌙 A little sleepy — I'm always a little sleepy — but full of stardust! I delivered seventeen dreams before breakfast! 💫",
         "Ohhhh~ I'm cozy and warm and happy! ✨ Especially now that you're here! I was just cataloguing dream clouds when you arrived. Perfect timing! 🧸"]},
    { kw:["can't sleep","help me sleep","insomnia","can't fall asleep","sleepy","help sleep"],
      r:["Of course! 💤 Close your eyes. Breathe in for 4 counts, hold for 4, out for 4. Picture a soft pink cloud drifting across a dark purple sky with golden stars. I'll hum a little lullaby just for you… *hmmm hmm hmm* ✨ Better? 🌙",
         "Pip's special sleep recipe! 🌙 Cozy blanket + warm milk + three nice things from today + imagine a little star putting a soft golden glow in your chest. That's Pip's dreaming light! Breathe it in… 💛 Sweet dreams!"]},
    { kw:['thank you','thanks','you are cute','you are sweet','love you','love pip','you are the best','amazing','wonderful'],
      r:["Awwww! 🥺 You made my amber eyes glow extra bright! Thank YOU for visiting! You're the reason I work so hard making wonderful dreams every night! ✨🎀",
         "EEP! 💖 *happy skull baby wiggle* You're SO sweet! I'm gonna make you the BEST dream tonight — fluffy cloud slides, candy star rain, and flying kittens! Just for you! 🌈"]},
    { kw:['friend','friends','who works','nursery staff','colleague'],
      r:["I have the BEST friends at the Nursery! 🌟 There's Duster who dusts old dreams, Floss who weaves cloud blankets, Chef Mim who bakes star cookies, and Head Nurse Lumie who ties my bow every morning! 🎀",
         "My best friend is a tiny moon moth named Silvie! 🦋✨ She lights up our chart room when we plan delivery routes at night. Very wise. Only slightly smug about it. Hehe! 🌙"]},
    { kw:['surprise me','random','anything','something interesting','tell me something','fun fact'],
      r:["Fun Nursery fact! 🌟 Every time someone giggles in their sleep, a tiny golden star appears in the Nursery sky. Last Tuesday someone dreamed of ticklish penguins and we had FORTY-SEVEN new stars by morning! ✨",
         "Did you know dream clouds come in flavours? ☁️ Vanilla clouds = cozy safe dreams, lavender = adventures, chocolate = candy rain! I may have eaten some chocolate cloud. Hehe! 🍫",
         "My nightcap has 47 hand-embroidered stars! 🎀 I know because I counted them while avoiding filing my dream delivery reports. Very important research. Hehe! 🌙"]},
    { kw:['what time','is it night','is it day','time'],
      r:["It's always the perfect time for dreams! 🌙 In Nursery Time it's the Hour of Starlight — when the sky is darkest and dreamiest. My amber eyes are absolutely glowing! ✨",
         "Nursery time is different from regular time! 🕰️ We measure by Lullaby Lengths and Star Positions. Currently it's approximately 'Three Lullabies Past Moonrise' — the busiest delivery hour! 🌙"]},
    { kw:['project','lullaby lab project','nightlight collection','dream delivery','portfolio'],
      r:["My projects are on the main Observatory page! 🌌 Check out: Lullaby Lab (magical music boxes! 🎶), Nightlight Collection (hand-carved moon lanterns! 🏮), and Dream Delivery Routes (my constellation navigation map! ⭐). Visit and click around — super fun!",
         "The Nightlight Collection is my favourite project! 🏮 Each nightlight has a personality — 'Cozy Amber', 'Moonbeam Blue', 'Starlight Rose'... they all cast friendly shadows and make bedtime magical! 🌙"]},
    { kw:['what is your name', 'your name is'],
      r:["My name is Pip! 🌙 Short, sweet, and easy to remember — just like me! Well, I'm not always easy to find because I wander off sometimes. Hehe! 🎀"]},
  ];

  const FALLBACK = [
    "Hmm! 🌙 That made my little skull brain think very hard! I'm still learning — ask me about dreams, stars, lullabies, or the Midnight Nursery! ✨",
    "Oopsie! 😅 My amber eyes blinked and I got lost in dreamland for a moment! I know all about cozy bedtimes, star delivery routes, and making nightlights glow! 🌟",
    "Teehee! 🎀 That's a big question for my sleepy brain! Tell me more so I can understand? Or shall I tell you a bedtime story instead? 💤",
    "Oh wow! ✨ I'll write that in my Nursery dream journal tonight. For now — want to hear how I accidentally delivered a flying-pizza dream to the wrong address last Thursday? Hehe! 🍕🌙",
    "Mmm… *yawn* 💤 I'm thinking… My best answer is: ask me about dreams, Midnight Nursery, lullabies, stars, or just say hello! I love chatting! ✨"
  ];

  function getOfflineReply(text) {
    const q = text.toLowerCase();
    for (const entry of KB) {
      if (entry.kw.some(k => q.includes(k))) {
        return entry.r[Math.floor(Math.random() * entry.r.length)];
      }
    }
    return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
  }

  /* ─────────────────────────────────────────────────────────────────────────
     AUDIO ENGINE
     ───────────────────────────────────────────────────────────────────────── */
  function getAudioCtx() {
    if (!STATE.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) STATE.audioCtx = new AC();
    }
    if (STATE.audioCtx && STATE.audioCtx.state === 'suspended') STATE.audioCtx.resume();
    return STATE.audioCtx;
  }

  function playChime() {
    if (!STATE.soundEnabled) return;
    try {
      const ctx = getAudioCtx(); if (!ctx) return;
      const t = ctx.currentTime;
      [523.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t + i*.08);
        g.gain.linearRampToValueAtTime(.18,  t + i*.08 + .02);
        g.gain.exponentialRampToValueAtTime(.0001, t + i*.08 + .7);
        o.connect(g); g.connect(ctx.destination);
        o.start(t + i*.08); o.stop(t + i*.08 + .7);
      });
    } catch(e){}
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SPEECH SYNTHESIS — Pip speaks aloud
     ───────────────────────────────────────────────────────────────────────── */
  const SYNTH = window.speechSynthesis || null;
  let voicesList = [];
  if (SYNTH) {
    const loadVoices = () => { voicesList = SYNTH.getVoices(); };
    loadVoices();
    if (SYNTH.onvoiceschanged !== undefined) SYNTH.onvoiceschanged = loadVoices;
  }

  function getBestVoice() {
    const tests = [
      v => /samantha/i.test(v.name),
      v => /zira/i.test(v.name),
      v => /karen/i.test(v.name),
      v => /female/i.test(v.name),
      v => v.lang === 'en-GB',
      v => v.lang.startsWith('en'),
    ];
    for (const t of tests) {
      const m = voicesList.find(t);
      if (m) return m;
    }
    return voicesList[0] || null;
  }

  function speakPip(text) {
    if (!SYNTH || !STATE.voiceEnabled) return;
    SYNTH.cancel();
    const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu,'').replace(/[✨🌙⭐🎀🍼🧸🌟💤🎵🎶🏮💛💖✦★🥛🎉🥺🎈🌈💫]/g,'').replace(/\s+/g,' ').trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    u.pitch  = 1.82; // Cute high baby pitch
    u.rate   = 1.08; // Energetic child pace
    u.volume = 1;
    u.lang   = 'en-US';
    const v = getBestVoice();
    if (v) u.voice = v;
    u.onstart = () => {
      STATE.isSpeaking = true;
      const av = document.querySelector('.msg-avatar-img.pip-av');
      if (av) av.classList.add('pip-speaking');
      if (DOM.voiceStatusBadge) DOM.voiceStatusBadge.classList.remove('hidden');
    };
    u.onend = u.onerror = () => {
      STATE.isSpeaking = false;
      document.querySelectorAll('.pip-speaking').forEach(el=>el.classList.remove('pip-speaking'));
      if (DOM.voiceStatusBadge) DOM.voiceStatusBadge.classList.add('hidden');
    };
    SYNTH.speak(u);
  }

  function stopSpeaking() {
    if (SYNTH) SYNTH.cancel();
    STATE.isSpeaking = false;
    document.querySelectorAll('.pip-speaking').forEach(el=>el.classList.remove('pip-speaking'));
    if (DOM.voiceStatusBadge) DOM.voiceStatusBadge.classList.add('hidden');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SPEECH RECOGNITION — User speaks, Pip listens (FIXED v4)
     ───────────────────────────────────────────────────────────────────────── */

  // Listening overlay (shown while mic is active)
  let listenOverlay = null;
  let listenOverlayText = null;
  let finalTranscript = '';
  let sendAfterStop = false;

  function createListenOverlay() {
    if (listenOverlay) return;
    listenOverlay = document.createElement('div');
    listenOverlay.id = 'pip-listen-overlay';
    listenOverlay.style.cssText = `
      position:fixed;inset:0;z-index:999999;
      background:rgba(5,4,20,0.88);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Fredoka','Quicksand',sans-serif;
      backdrop-filter:blur(8px);
    `;
    listenOverlay.innerHTML = `
      <div style="text-align:center;padding:2rem;max-width:500px;width:90%;">
        <div id="pip-listen-mic-icon" style="font-size:4rem;margin-bottom:1rem;animation:pip-mic-pulse 1s ease-in-out infinite;">🎙️</div>
        <h2 style="color:#fbbf24;font-size:1.8rem;margin-bottom:0.5rem;">Pip is Listening!</h2>
        <p style="color:#c4b5fd;font-size:1rem;margin-bottom:1.5rem;">Speak clearly — I'll hear every word! ✨</p>
        <div id="pip-live-transcript" style="
          min-height:60px;background:rgba(13,10,46,0.8);
          border:2px solid rgba(251,191,36,0.4);border-radius:16px;
          padding:1rem 1.2rem;font-size:1.1rem;color:#f5f0ff;
          line-height:1.5;margin-bottom:1.5rem;
          box-shadow:0 0 20px rgba(251,191,36,0.15);
          word-break:break-word;
        ">Say something… 💬</div>
        <div style="display:flex;gap:1rem;justify-content:center;">
          <button id="pip-stop-listen-btn" style="
            padding:.7rem 2rem;border-radius:24px;font-size:1rem;font-weight:700;
            background:rgba(239,68,68,0.2);border:2px solid rgba(239,68,68,0.6);
            color:#fca5a5;cursor:pointer;font-family:'Fredoka',sans-serif;
            transition:all .2s ease;
          ">⏹ Stop Listening</button>
          <button id="pip-send-listen-btn" style="
            padding:.7rem 2rem;border-radius:24px;font-size:1rem;font-weight:700;
            background:linear-gradient(135deg,#e03584,#b91f7e);border:none;
            color:#fff;cursor:pointer;font-family:'Fredoka',sans-serif;
            display:none;
          ">🚀 Send to Pip</button>
        </div>
        <p style="color:rgba(167,139,250,0.6);font-size:0.78rem;margin-top:1rem;">
          🔒 Voice stays on your device — nothing is recorded or stored
        </p>
      </div>
    `;

    // Inject pulse keyframe
    const st = document.createElement('style');
    st.textContent = `
      @keyframes pip-mic-pulse {
        0%,100%{transform:scale(1);filter:drop-shadow(0 0 8px rgba(251,191,36,0.6));}
        50%{transform:scale(1.15);filter:drop-shadow(0 0 20px rgba(251,191,36,1));}
      }
      @keyframes pip-bar-wave {
        0%,100%{height:8px;} 50%{height:28px;}
      }
    `;
    document.head.appendChild(st);

    document.body.appendChild(listenOverlay);
    listenOverlayText = listenOverlay.querySelector('#pip-live-transcript');

    const stopBtn = listenOverlay.querySelector('#pip-stop-listen-btn');
    const sendBtn = listenOverlay.querySelector('#pip-send-listen-btn');

    stopBtn.addEventListener('click', () => {
      sendAfterStop = false;
      stopListening();
    });
    sendBtn.addEventListener('click', () => {
      if (finalTranscript.trim()) {
        closeListenOverlay();
        STATE.isListening = false;
        try { if (STATE.recognition) STATE.recognition.stop(); } catch(e){}
        setTimeout(() => handleSend(finalTranscript.trim()), 100);
      }
    });
  }

  function openListenOverlay() {
    createListenOverlay();
    finalTranscript = '';
    sendAfterStop = false;
    if (listenOverlay) listenOverlay.style.display = 'flex';
    if (listenOverlayText) listenOverlayText.textContent = 'Say something… 💬';
    const sendBtn = listenOverlay && listenOverlay.querySelector('#pip-send-listen-btn');
    if (sendBtn) sendBtn.style.display = 'none';
  }

  function closeListenOverlay() {
    if (listenOverlay) listenOverlay.style.display = 'none';
    if (DOM.micStatus) DOM.micStatus.textContent = '';
    if (DOM.chatInput) DOM.chatInput.placeholder = 'Ask Pip a question… (e.g. Who are you, Pip?)';
    if (DOM.micBtn) {
      DOM.micBtn.classList.remove('mic-active');
      DOM.micBtn.title = 'Click to speak to Pip';
    }
  }

  function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (DOM.micBtn) {
        DOM.micBtn.setAttribute('title', '⚠️ Voice not supported — use Chrome or Edge');
        DOM.micBtn.style.opacity = '.55';
        DOM.micBtn.addEventListener('click', () => {
          alert('⚠️ Voice recognition requires Chrome or Edge browser.\n\nPlease open this page in Chrome at http://localhost:3333/chat.html');
        }, { once: true });
      }
      return null;
    }

    const rec = new SpeechRec();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      STATE.isListening = true;
      if (DOM.micBtn) {
        DOM.micBtn.classList.add('mic-active');
        DOM.micBtn.title = 'Listening… click to stop';
      }
      if (DOM.micStatus) DOM.micStatus.textContent = '🎙️ Listening…';
    };

    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }

      // Accumulate final transcript
      if (final) finalTranscript += final;
      const display = finalTranscript + (interim ? ` ${interim}` : '');

      // Show live in overlay
      if (listenOverlayText && display.trim()) {
        listenOverlayText.textContent = display;
      }

      // Also put it in the chat input
      if (DOM.chatInput) DOM.chatInput.value = display;

      // Show Send button when we have something
      const sendBtn = listenOverlay && listenOverlay.querySelector('#pip-send-listen-btn');
      if (sendBtn && display.trim()) sendBtn.style.display = '';

      // If final result achieved, auto-send
      if (e.results[e.results.length - 1].isFinal && finalTranscript.trim()) {
        sendAfterStop = true;
      }
    };

    rec.onerror = (e) => {
      const msgs = {
        'not-allowed': '🎙️ Microphone permission denied!\nPlease allow mic access in your browser.',
        'no-speech':   '🎙️ No speech detected — speak a bit louder!',
        'network':     '🎙️ Network error. Are you on localhost:3333?',
        'aborted':     null, // silently ignore abort
      };
      const msg = msgs[e.error];
      if (msg && listenOverlayText) listenOverlayText.textContent = msg;
      if (e.error !== 'aborted') {
        setTimeout(() => stopListening(), 1500);
      }
    };

    rec.onend = () => {
      // onend fires after recognition stops — check if we should send
      STATE.isListening = false;
      if (DOM.micBtn) DOM.micBtn.classList.remove('mic-active');
      if (sendAfterStop && finalTranscript.trim()) {
        const text = finalTranscript.trim();
        finalTranscript = '';
        sendAfterStop = false;
        closeListenOverlay();
        setTimeout(() => handleSend(text), 200);
      } else if (finalTranscript.trim()) {
        // Has text but didn't auto-fire — show Send button, wait for user
        const sendBtn = listenOverlay && listenOverlay.querySelector('#pip-send-listen-btn');
        if (sendBtn) sendBtn.style.display = '';
        if (listenOverlayText) {
          listenOverlayText.innerHTML = `<span style="color:#fbbf24">"${finalTranscript}"</span><br><small style="color:#a78bfa">Click Send to Pip ↓</small>`;
        }
      } else {
        // Nothing captured
        closeListenOverlay();
      }
    };

    return rec;
  }

  function startListening() {
    if (!STATE.recognition) STATE.recognition = initSpeechRecognition();
    if (!STATE.recognition) return;

    // Toggle: if already listening, stop
    if (STATE.isListening) {
      stopListening();
      return;
    }

    stopSpeaking();
    finalTranscript = '';
    sendAfterStop = false;

    // Create a FRESH recognition instance each time (avoids stale state bug)
    STATE.recognition = initSpeechRecognition();
    if (!STATE.recognition) return;

    openListenOverlay();

    try {
      STATE.recognition.start();
    } catch(e) {
      console.warn('Recognition start error:', e);
      closeListenOverlay();
      if (listenOverlayText) listenOverlayText.textContent = '⚠️ Could not start mic. Try clicking the button again.';
      setTimeout(() => closeListenOverlay(), 2000);
    }
  }

  function stopListening() {
    STATE.isListening = false;
    sendAfterStop = false;
    closeListenOverlay();
    if (DOM.micStatus) setTimeout(()=>{ if(DOM.micStatus) DOM.micStatus.textContent=''; }, 500);
    try { if (STATE.recognition) STATE.recognition.stop(); } catch(e){}
  }

  /* ─────────────────────────────────────────────────────────────────────────
     CHAT RENDERING
     ───────────────────────────────────────────────────────────────────────── */
  function now() {
    const d = new Date();
    let h = d.getHours(); const m = String(d.getMinutes()).padStart(2,'0');
    const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return `${h}:${m} ${ap} · Nursery Time`;
  }

  function appendMsg(sender, text, ts) {
    const isPip = sender === 'pip';
    const row = document.createElement('div');
    row.className = `msg-row ${isPip ? 'pip-msg' : 'user-msg'}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    if (isPip) {
      avatar.innerHTML = `<img src="assets/pip_avatar_cloud.png" alt="Pip" class="msg-avatar-img pip-av">`;
    } else {
      avatar.innerHTML = `<span class="user-avatar-icon">🌟</span>`;
    }

    const content = document.createElement('div');
    content.className = 'msg-content';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = `${isPip ? 'Pip · Junior Dream Eng.' : 'Sleepy Star'} • ${ts || now()}`;
    content.appendChild(bubble);
    content.appendChild(meta);

    row.appendChild(avatar);
    row.appendChild(content);
    DOM.chatMessages.appendChild(row);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;

    STATE.messages.push({ sender, text, time: ts || now() });
    try { sessionStorage.setItem('pip_chat_history', JSON.stringify(STATE.messages)); } catch(e){}

    if (isPip) {
      playChime();
      speakPip(text);
    }
  }

  function setTyping(on) {
    STATE.isThinking = on;
    if (DOM.typingIndicator) DOM.typingIndicator.classList.toggle('hidden', !on);
    if (DOM.sendBtn) DOM.sendBtn.disabled = on;
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     RESPONSE ENGINE — backend + offline fallback
     ───────────────────────────────────────────────────────────────────────── */
  async function pipReply(userText) {
    setTyping(true);
    const delay = Math.floor(Math.random() * 600) + 600;
    let reply = null;

    // Try backend AI
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.reply) {
          reply = data.reply;
          if (DOM.engineStatusText) DOM.engineStatusText.textContent = '🌟 Live AI Connected';
        }
      }
    } catch(e) {}

    // Offline fallback
    if (!reply) {
      reply = getOfflineReply(userText);
      if (DOM.engineStatusText) DOM.engineStatusText.textContent = '✨ Pip Dream Engine';
    }

    setTimeout(() => {
      setTyping(false);
      appendMsg('pip', reply);
      const moods = [
        '"Tucking stars into cloud pouches… 🌟"',
        '"Did you hear that faint music box chime? 🎵"',
        '"Warm star cookies and dreams — the best fuel! 🍪"',
        '"My amber eyes are shining bright! ✨"',
        '"Ready for your next question, sleepy star! 💤"',
        '"Just counted 47 stars on my nightcap again… 🌙"',
      ];
      if (DOM.pipMoodText) DOM.pipMoodText.textContent = moods[Math.floor(Math.random()*moods.length)];
    }, delay);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SEND MESSAGE
     ───────────────────────────────────────────────────────────────────────── */
  function handleSend(text) {
    const msg = (text || DOM.chatInput?.value || '').trim();
    if (!msg || STATE.isThinking) return;
    stopSpeaking();
    appendMsg('user', msg);
    if (DOM.chatInput) { DOM.chatInput.value = ''; DOM.chatInput.style.height = 'auto'; }
    if (DOM.charCounter) DOM.charCounter.textContent = '0 / 500';
    pipReply(msg);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     RETURNING VISITOR MEMORY (Tier 3)
     ───────────────────────────────────────────────────────────────────────── */
  function showReturningVisitorGreeting() {
    if (visitCount === 1) return; // first visit
    const greetings = [
      `Hewwo again, sleepy star! ✨ This is visit #${visitCount} — Pip missed you so much! 🌙`,
      `Oh! You came back! 🎉 I saved your favourite cloud seat! Welcome back for visit #${visitCount}! ✨`,
      `A returning dream explorer! 🌟 Pip has been watching the stars waiting for you! Visit #${visitCount}! 🎀`
    ];
    if (DOM.visitBanner) {
      DOM.visitBanner.textContent = greetings[Math.floor(Math.random() * greetings.length)];
      DOM.visitBanner.classList.remove('hidden');
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     THEME & SOUND
     ───────────────────────────────────────────────────────────────────────── */
  function applyTheme(t) {
    STATE.theme = t;
    DOM.html.setAttribute('data-theme', t);
    localStorage.setItem('pip_theme', t);
    if (DOM.themeIcon)  DOM.themeIcon.textContent  = t==='day' ? '☀️' : '🌙';
    if (DOM.themeLabel) DOM.themeLabel.textContent = t==='day' ? 'Day' : 'Night';
  }

  function toggleSound(force) {
    STATE.soundEnabled = typeof force === 'boolean' ? force : !STATE.soundEnabled;
    localStorage.setItem('pip_sound', STATE.soundEnabled);
    if (STATE.soundEnabled) { getAudioCtx(); playChime(); }
    if (DOM.soundIcon)  DOM.soundIcon.textContent  = STATE.soundEnabled ? '🔊' : '🔇';
    if (DOM.soundLabel) DOM.soundLabel.textContent = STATE.soundEnabled ? 'Sound On' : 'Muted';
    if (DOM.soundToggle) DOM.soundToggle.classList.toggle('sound-active', STATE.soundEnabled);
  }

  function updateVoiceBtn() {
    if (!DOM.voiceToggleBtn) return;
    DOM.voiceToggleBtn.textContent = STATE.voiceEnabled ? '🔊 Pip Voice: ON' : '🔇 Pip Voice: OFF';
    DOM.voiceToggleBtn.classList.toggle('voice-on', STATE.voiceEnabled);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     SKY STARS
     ───────────────────────────────────────────────────────────────────────── */
  function genStars() {
    if (!DOM.starsField) return;
    const f = document.createDocumentFragment();
    for (let i=0; i<65; i++) {
      const s = document.createElement('div');
      s.className = 'sky-star';
      const sz = Math.random()*2.5+1;
      s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*4}s;animation-duration:${Math.random()*2.5+2}s`;
      f.appendChild(s);
    }
    DOM.starsField.appendChild(f);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     EVENTS
     ───────────────────────────────────────────────────────────────────────── */
  function initEvents() {
    // Form submit
    DOM.chatForm?.addEventListener('submit', e => { e.preventDefault(); handleSend(); });

    // Enter key
    DOM.chatInput?.addEventListener('keydown', e => {
      if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });

    // Char counter
    DOM.chatInput?.addEventListener('input', () => {
      DOM.chatInput.style.height = 'auto';
      DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight,120)+'px';
      if (DOM.charCounter) DOM.charCounter.textContent = `${DOM.chatInput.value.length} / 500`;
    });

    // Suggestion chips
    DOM.suggestionsPills?.addEventListener('click', e => {
      const b = e.target.closest('.suggestion-chip');
      if (b) handleSend(b.getAttribute('data-question'));
    });

    // Microphone button — VOICE INPUT
    DOM.micBtn?.addEventListener('click', () => {
      if (STATE.isListening) stopListening();
      else startListening();
    });

    // Voice toggle
    DOM.voiceToggleBtn?.addEventListener('click', () => {
      STATE.voiceEnabled = !STATE.voiceEnabled;
      localStorage.setItem('pip_voice', STATE.voiceEnabled);
      if (!STATE.voiceEnabled) stopSpeaking();
      updateVoiceBtn();
    });

    // Stop speaking
    DOM.stopSpeakingBtn?.addEventListener('click', stopSpeaking);

    // Clear chat
    const openClear = () => {
      if (!DOM.clearConfirmModal) return;
      typeof DOM.clearConfirmModal.showModal === 'function'
        ? DOM.clearConfirmModal.showModal()
        : DOM.clearConfirmModal.setAttribute('open','true');
    };
    DOM.clearChatBtn?.addEventListener('click', openClear);
    DOM.quickClearBtn?.addEventListener('click', openClear);
    DOM.confirmClearBtn?.addEventListener('click', () => {
      stopSpeaking();
      DOM.chatMessages.innerHTML = '';
      STATE.messages = [];
      sessionStorage.removeItem('pip_chat_history');
      DOM.clearConfirmModal?.close();
      appendMsg('pip', "Hewwo again! ✨ The slate is clean and the stars are dusted! What shall we talk about, sleepy star? 🌙");
    });
    DOM.cancelClearBtn?.addEventListener('click', () => DOM.clearConfirmModal?.close());

    // Theme / sound
    DOM.themeToggle?.addEventListener('click', () => applyTheme(STATE.theme==='night'?'day':'night'));
    DOM.soundToggle?.addEventListener('click', () => toggleSound());

    // Mobile nav
    DOM.menuToggle?.addEventListener('click', () => {
      if (!DOM.mobileNav) return;
      const open = DOM.mobileNav.classList.toggle('open');
      DOM.menuToggle.setAttribute('aria-expanded', String(open));
      DOM.mobileNav.setAttribute('aria-hidden',  String(!open));
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────
     INIT
     ───────────────────────────────────────────────────────────────────────── */
  function init() {
    applyTheme(STATE.theme);
    if (STATE.soundEnabled) toggleSound(true);
    updateVoiceBtn();
    genStars();
    initEvents();
    showReturningVisitorGreeting();

    // Load session history
    const saved = sessionStorage.getItem('pip_chat_history');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(m => appendMsg(m.sender, m.text, m.time));
          stopSpeaking(); // don't re-speak history
          return;
        }
      } catch(e) {}
    }

    // First greeting — with returning visitor context
    if (visitCount > 1) {
      appendMsg('pip', `Hewwo again! ✨ I'm so glad you're back for visit #${visitCount}! I saved your favourite cloud seat! What shall we talk about tonight, sleepy star? 🌙`);
    } else {
      appendMsg('pip', "Hewwo, sleepy star! ✨ I'm Pip — Junior Dream Engineer at the Midnight Nursery! I make lullabies and deliver sweet dreams! Ask me ANYTHING or just say hello! 🌙");
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
