# 🌌 Pip’s Midnight Observatory
> *“I build the dreams you fall asleep inside.”*

A whimsical, interactive character portfolio website built for the **haX.baby — Baby’s First Website 48-Hour Hackathon** (Track 1: Pip the Skull Baby).

---

## 🏆 Hackathon Submission Details

- **Event:** haX.baby · Baby’s First Website 48-Hour Hackathon
- **Track:** Track 1 — Same Baby, 1,000 Websites (**Pip the Skull Baby**)
- **Website Name:** Pip’s Midnight Observatory
- **Role:** Junior Dream Engineer at Midnight Nursery
- **Tagline:** “I build the dreams you fall asleep inside.”
- **Official Character Canon:**
  - **Identity:** A baby with a smooth, round skull face and a crooked smile.
  - **Eyes:** Deep eye sockets with warm, cozy glowing amber lights.
  - **Accessory:** Midnight-blue starry nightcap with a soft pastel pink bow.
  - **Personality:** Gentle, sleepy, curious, clumsy, easily delighted.
  - **Quirks:** Strictly *dislikes silence* (which is why the observatory is filled with music boxes, chimes, and soft lullabies).

---

## ✨ Features & Architecture

### 1. 🔄 Feature 1: Interactive 360° Rotating Pip Viewer (`#pip-360`)
- **Celestial Plinth Studio:** Pip is rendered on a circular celestial nursery plinth surrounded by orbiting constellation particles.
- **Horizontal Mouse & Touch Drag:** Visitors can click and drag horizontally on desktops or swipe on mobile screens to rotate Pip through a full 360°.
- **Physics Inertia & Damping:** Features momentum upon release and smooth interpolation.
- **Angle-Reactive Amber Eyes:** Pip's amber eyes shine brightly when facing the viewer and fade realistically into soft backlight when turned around.
- **Dynamic Perspective:** Multi-plane depth rendering showcasing the starry nightcap, pink bow ribbons, and cloud fluff from every angle.
- **Interactive Controls:**
  - Clear on-screen instruction: *“Drag to rotate Pip.”*
  - Real-time angle readout badge (`0°` to `360°`) with facing indicator (*Front View*, *Side*, *Back View*).
  - **“↺ Reset View”** button to quickly return to `0° Front`.
  - **“⏵ Auto-Spin”** toggle for hands-free continuous smooth rotation.
  - Quick-jump angle preset chips: `0° Front`, `45° Cozy`, `90° Side`, `180° Back`, `270° Profile`.
- **Honest Technical Architecture:** Fully disclosed as an interactive 3D rotational studio powered by CSS 3D transforms, real-time lighting physics, and official creator studio renders.

### 2. 🌟 Feature 2: Separate Pip Showcase Section (`#showcase`)
- A dedicated spotlight showcase card located right near the hero section.
- Features a large studio character portrait of Pip holding the glowing crescent lantern.
- Contains:
  - Official character badge and introduction.
  - Button labeled **“Explore Pip”** (navigates to `#about`).
  - Button labeled **“Talk with Pip”** (navigates to `chat.html`).
  - Link labeled **“View Pip in 360°”** (navigates to `#pip-360`).
- Keeps the original hero section completely intact with its own distinct layout.

### 3. 💬 Feature 3, 4 & 5: Dedicated “Talk with Pip” Chat Page (`chat.html`)
- Dedicated chat experience designed like talking to Pip inside the Midnight Nursery.
- **Visuals:** Features Pip's avatar with live pulsing online indicator, mood thought quotes, distinct visitor/Pip message bubbles, and typing indicator (*“Pip is thinking… 🌙”*).
- **Suggested Starter Question Chips:**
  - “Who are you, Pip?”
  - “What do you do at the Midnight Nursery?”
  - “How do you make dreams?”
  - “Tell me a bedtime story.”
  - “What is your favourite thing?”
  - “Why do your eyes glow amber?”
  - “Tell me a joke!”
  - “What happens in the Midnight Nursery?”
- **Dual-Level Response System:**
  - **Level A (Working Offline Fallback):** 100% reliable rule-based semantic parser that recognizes dozens of questions about Pip's identity, nursery craft, lullabies, nightlights, dream delivery, jokes, stories, and dislikes, with varied answers so it never feels repetitive. Includes friendly fallbacks for unknown questions.
  - **Level B (Optional Live AI Responses):** A backend server endpoint (`POST /api/chat`) connects to Google Gemini (or OpenAI) if an API key is provided in `.env`, using Pip's official system prompt. If no key is set or the network is unreachable, it seamlessly falls back to Level A with zero errors.
- **Chat Usability:**
  - Press `Enter` to send, `Shift+Enter` for a new line.
  - Auto-scrolls to the newest message.
  - Timestamps on every message (`11:15 PM · Nursery Time`).
  - Session message preservation via `sessionStorage`.
  - Conversation restart button with confirmation modal.
  - Web Audio API gentle chime when Pip replies (respects mute toggle).

### 4. 👶 Interactive Character (Hero Section)
- **Cursor Parallax & Head Tilt:** Pip tilts dynamically in 3D perspective as the cursor moves across the screen (with touch and reduced-motion fallbacks).
- **Amber Eye-Glow Tracking:** Pip's amber eyes follow your cursor.
- **Wave / Tickle Reaction:** Clicking Pip or the “Wave at Pip 👋” button triggers a playful bounce animation and cycles through drowsy thought bubbles.
- **Hit Counter Odometer:** Vintage early-web mechanical counter tracking dreams delivered across the night sky.
- **Returning Visitor Memory:** Greet returning visitors via `localStorage`.

### 5. ⭐ Three Handcrafted Dream Projects
1. **The Lullaby Lab (Audio Lab):**
   - Official music box asset (`pip_lullaby_box.png`).
   - Playable 5-key pentatonic chime keyboard (*Do, Re, Mi, Sol, La*) via Web Audio API.
   - “Wind & Play Melody” button: Plays an 8-note soothing lullaby sequence (*“Pip’s Midnight Slumber”*).
2. **Nightlight Collection (Lighting Craft):**
   - Crescent moon porcelain lantern (`pip_dream_lantern.png`).
   - Interactive atmosphere switch (*Amber Slumber*, *Moonlight Violet*, *Stardust Mint*) with dynamic halo lighting.
3. **Dream Delivery Routes (Celestial Navigation):**
   - Interactive SVG sky route connecting nursery to sleepy towns.
   - “Launch Dream Delivery” button: Flies a dream capsule, increments the odometer, and prints real-time dispatch logs.

### 6. 📖 Scroll-Based Storytelling (A Night in the Life of Pip)
A 6-scene scroll-triggered visual journey tracking Pip's nocturnal shift from `00:00` (Stroke of Midnight) to `06:00` (Pink Dawn) with dynamic vertical starlight progress rail.

### 7. 💌 Bedtime Wish Guestbook (Early-Web Side Quest · +2 pts)
Persistent dream wishboard powered by `localStorage` where visitors pick a sticker (⭐, 🌙, 🧸, ☁️, 🥛, ✨) and pin notes to Pip's nursery wall.

### 8. ☀️ / 🌙 Day & Night Theme Toggle
Smooth transition between deep midnight navy (`#0b0f1d`) and soft morning milk cream (`#fbf9f4`) with `localStorage` persistence.

### 9. 🔊 Web Audio API Sound Synthesizer
Strictly **OFF by default** to honor visitor tranquility. Procedural sine/triangle pentatonic chimes with exponential bell decays.

### 10. 🕵️‍♂️ Hidden Easter Egg
Clicking the twinkling star on Pip's nightcap **7 times** triggers a star confetti explosion on canvas, a celebration fanfare, and Pip's Secret Dream Stash modal!

### 11. 💫 Sparkle Cursor Trail (Desktop Bonus · +2 pts)
Delicate trailing stardust sparkles follow the mouse cursor on desktop (disabled on touch and respects `prefers-reduced-motion`).

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, CSS3 (Custom properties, CSS Grid, Flexbox, 3D transforms), Vanilla JavaScript (ES6+ modular, zero dependencies).
- **Backend:** Node.js HTTP server (`server.js`) with static asset streaming, security path traversal checks, and a secure `POST /api/chat` endpoint.
- **Audio:** Web Audio API (FM / additive sine synthesis).
- **Graphics:** HTML5 Canvas (confetti & sparkle engines) + SVG constellation maps.
- **Fonts:** Fredoka & Quicksand via Google Fonts (with system fallbacks).

---

## 🚀 Running Locally

### Option 1: Using the Node.js Server (Recommended)
1. Open a terminal in the project directory:
   ```bash
   node server.js
   ```
2. Navigate to:
   ```
   http://localhost:3333
   ```
3. To test the chat, navigate to:
   ```
   http://localhost:3333/chat.html
   ```

### Option 2: Using the One-Click Desktop Launcher (Windows)
Double-click `start_website.bat` in the project folder to start the server and open your browser automatically.

### Option 3: Direct File Opening (Offline Static Mode)
Double-click `index.html` or `chat.html` to open directly in any browser. All interactive features, the 360° viewer, and the Level A offline chat engine work 100% out of the box!

---

## 🤖 Configuring Optional Live AI Backend

The chat works 100% offline out-of-the-box. If you wish to connect a live LLM:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your Google Gemini API key (or OpenAI key):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Restart `node server.js`. The chat status pill in `chat.html` will display: `🌟 Live AI Connected`.
4. If no key is set or the call fails, Pip automatically uses the built-in Level A engine with zero interruption.

---

## 🌐 Deployment Instructions

### Deploying to GitHub Pages (Frontend)
1. Initialize Git and commit:
   ```bash
   git init
   git add .
   git commit -m "haX.baby Track 1: Pip's Midnight Observatory + 360 Viewer + AI Chat"
   ```
2. Create a public repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/<your-username>/pips-midnight-observatory.git
   git branch -M main
   git push -u origin main
   ```
3. In your repo, go to **Settings** > **Pages** > select `main` branch and `/` root, then click **Save**.
4. Your website is live at: `https://<your-username>.github.io/pips-midnight-observatory/`!
*(The 360° viewer and Level A offline chat engine work 100% statically on GitHub Pages).*

### Deploying Full-Stack (with Live AI Backend)
Deploy to Render, Railway, or Vercel:
- **Render / Railway:** Set build command to `npm install` (or none) and start command to `node server.js`. Add `GEMINI_API_KEY` to your environment variables dashboard.
- **Vercel:** Works directly as a static frontend + serverless function.

---

## 📋 Hackathon Verification Checklist

- [x] **Pip is the central character** (Official skull baby with nightcap & amber eyes).
- [x] **Interactive 360° Rotating Pip Viewer** (Dedicated `#pip-360` section with horizontal mouse/touch drag, inertia, amber eye lighting, and reset button).
- [x] **Separate Pip Showcase section** (Spotlight card near hero with large portrait and action buttons).
- [x] **Dedicated “Talk with Pip” chat page** (`chat.html` with starter questions, typing indicator, clear chat, and nursery status).
- [x] **Working chat responses** (Dual-level: 100% offline fallback engine + optional live AI backend).
- [x] **Three portfolio projects** (Lullaby Lab, Nightlight Collection, Dream Delivery Routes).
- [x] **Story told through scrolling** (6 scenes tracking 00:00 to 06:00).
- [x] **Functioning Day/Night toggle** (Persists in `localStorage`).
- [x] **Sound with working mute control** (Strictly OFF by default, Web Audio API).
- [x] **Hidden Easter egg** (Clicking nightcap star 7 times triggers confetti + secret modal).
- [x] **Responsive mobile, tablet & desktop layouts**.
- [x] **Zero broken assets or dead links**.
- [x] **Zero console errors**.

---

## 🎨 Asset Acknowledgements & Credits

- **Character & Lore:** Pip the Skull Baby is canon to **Track 1** of the [haX.baby](https://hax.baby) *Baby’s First Website* Hackathon.
- **Official Creator Pack:** Studio renders (`pip_avatar_cloud.png`, `pip_portrait.png`, `pip_lullaby_box.png`, `pip_dream_lantern.png`) provided by haX.baby.
- **Audio Synthesizer:** Custom procedural Web Audio API pentatonic sound generator.
- **Typography:** Google Fonts (*Fredoka*, *Quicksand*, *Space Mono*).

---

*Sleep tight and sweet dreams! 💤*

