/**
 * patch_hero.js — Patches index.html to add atmospheric stage elements
 * Run: node patch_hero.js
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// ── 1. Add atmosphere block right after the existing <div class="companion-stage-card">
//    We insert before the drag-hint-wrap div
const DRAG_HINT_MARKER = `            <!-- Curved instruction arrow: "Drag to rotate Pip" -->`;
const ATMOSPHERE_HTML = `            <!-- ═══ ATMOSPHERIC BACKGROUND (picture-2 style) ═══ -->
            <div class="stage-atmosphere" aria-hidden="true">
              <div class="stage-crescent-moon">&#127769;</div>
              <div class="stage-bg-cloud stage-cloud-1"></div>
              <div class="stage-bg-cloud stage-cloud-2"></div>
              <div class="stage-bg-cloud stage-cloud-3"></div>
              <div class="stage-bg-cloud stage-cloud-4"></div>
              <div class="stage-glow-aura"></div>
              <div class="stage-scatter-star s-star-1">&#10022;</div>
              <div class="stage-scatter-star s-star-2">&#10022;</div>
              <div class="stage-scatter-star s-star-3">&#10022;</div>
              <div class="stage-scatter-star s-star-4">&#10022;</div>
              <div class="stage-scatter-star s-star-5">&#9733;</div>
              <div class="stage-scatter-star s-star-6">&#10022;</div>
              <div class="stage-scatter-star s-star-7">&#10022;</div>
              <div class="stage-scatter-star s-star-8">&#10022;</div>
              <div class="stage-scatter-star s-star-9">&#10022;</div>
            </div>

`;

if (!html.includes('stage-atmosphere')) {
  html = html.replace(DRAG_HINT_MARKER, ATMOSPHERE_HTML + DRAG_HINT_MARKER);
  console.log('✅ Inserted atmosphere block');
} else {
  console.log('ℹ️  Atmosphere block already present – skipping');
}

// ── 2. Change companion-stage-card class to also include "v2" for new CSS overrides
if (!html.includes('companion-stage-card v2')) {
  html = html.replace(
    `<div class="companion-stage-card">`,
    `<div class="companion-stage-card v2">`
  );
  console.log('✅ Added v2 class to stage card');
} else {
  console.log('ℹ️  v2 class already present');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ index.html patched successfully!');
