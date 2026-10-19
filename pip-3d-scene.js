/**
 * PIP 3D REALISTIC WEBGL ENGINE — Three.js
 * Combines the user's authentic, photorealistic Pip artwork (Image 1 & 2)
 * with real 3D volumetric depth, continuous 360° turntable rotation,
 * dynamic amber eye illumination, golden lantern light, and celestial particles.
 */
(function () {
  'use strict';

  function initWhenReady() {
    if (typeof THREE === 'undefined') {
      setTimeout(initWhenReady, 50);
      return;
    }
    setupPipRealistic3D();
  }

  function setupPipRealistic3D() {
    const stage = document.getElementById('companion-3d-stage');
    const rig   = document.getElementById('companion-rig');
    const oldImg = document.getElementById('companion-pip-img');
    const oldEyeL = document.getElementById('comp-eye-left');
    const oldEyeR = document.getElementById('comp-eye-right');

    if (!stage || !rig) return;
    window.__PIP_3D_ACTIVE__ = true;

    // Hide old 2D image
    if (oldImg)  oldImg.style.display = 'none';
    if (oldEyeL) oldEyeL.style.display = 'none';
    if (oldEyeR) oldEyeR.style.display = 'none';

    // Canvas container
    let container = document.getElementById('pip-three-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pip-three-container';
      container.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 8;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        cursor: grab;
      `;
      rig.appendChild(container);
    } else {
      container.innerHTML = '';
    }

    // ── 1. SCENE, CAMERA, RENDERER ──────────────────────────────────
    const scene = new THREE.Scene();

    const width  = rig.clientWidth  || 430;
    const height = rig.clientHeight || 430;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 4.4);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── 2. DYNAMIC LIGHTING ──────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x4a3b68, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7e8, 1.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa78bfa, 1.8);
    rimLight.position.set(-3, 2, -4);
    scene.add(rimLight);

    // ── 3. 3D PLINTH WITH GLOWING RUNIC RING ────────────────────────
    const plinthGroup = new THREE.Group();
    plinthGroup.position.set(0, -1.05, 0);

    // Base cylinder
    const plinthGeo = new THREE.CylinderGeometry(1.65, 1.72, 0.16, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0c0922,
      roughness: 0.5,
      metalness: 0.6,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthGroup.add(plinthMesh);

    // Golden glowing ring
    const ringGeo = new THREE.TorusGeometry(1.58, 0.032, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.8,
    });
    const plinthRing = new THREE.Mesh(ringGeo, ringMat);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.set(0, 0.09, 0);
    plinthGroup.add(plinthRing);
    scene.add(plinthGroup);

    // ── 4. REALISTIC PIP CHARACTER 3D VOLUMETRIC STAGE ──────────────
    const rootCharacter = new THREE.Group();
    scene.add(rootCharacter);

    // Texture loader with cross-origin & filter
    const loader = new THREE.TextureLoader();
    const TEX_FILES = [
      'assets/pip_tex_0.png', // 0°  (front HD)
      'assets/pip_tex_1.png', // 45°
      'assets/pip_tex_2.png', // 90° (profile)
      'assets/pip_tex_3.png', // 180° (back view)
      'assets/pip_tex_4.png', // 225°
      'assets/pip_tex_5.png', // 270° (left profile)
    ];

    const textures = TEX_FILES.map(src => {
      const tex = loader.load(src);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });

    // Create dual-mesh cross-fade system for seamless transitions
    const cardGeo = new THREE.PlaneGeometry(2.35, 2.35);

    const matA = new THREE.MeshBasicMaterial({
      map: textures[0],
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const meshA = new THREE.Mesh(cardGeo, matA);
    meshA.position.set(0, 0.08, 0);
    rootCharacter.add(meshA);

    const matB = new THREE.MeshBasicMaterial({
      map: textures[0],
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const meshB = new THREE.Mesh(cardGeo, matB);
    meshB.position.set(0, 0.08, 0.001);
    rootCharacter.add(meshB);

    // ── 5. REAL 3D AMBER EYE GLOWS & POINT LIGHTS ───────────────────
    const eyeGlowGroup = new THREE.Group();
    eyeGlowGroup.position.set(0, 0.08, 0.05);

    const eyeCoreGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const eyeCoreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const eyeMeshL = new THREE.Mesh(eyeCoreGeo, eyeCoreMat);
    eyeMeshL.position.set(0.12, 0.38, 0.04);
    eyeGlowGroup.add(eyeMeshL);

    const eyeMeshR = new THREE.Mesh(eyeCoreGeo, eyeCoreMat);
    eyeMeshR.position.set(0.48, 0.42, 0.04);
    eyeGlowGroup.add(eyeMeshR);

    // Amber point lights illuminating the face in 3D
    const eyeLightL = new THREE.PointLight(0xfbbf24, 1.8, 1.8);
    eyeLightL.position.set(0.12, 0.38, 0.15);
    eyeGlowGroup.add(eyeLightL);

    const eyeLightR = new THREE.PointLight(0xfbbf24, 1.8, 1.8);
    eyeLightR.position.set(0.48, 0.42, 0.15);
    eyeGlowGroup.add(eyeLightR);

    // Golden Lantern dynamic point light in 3D
    const lanternLight = new THREE.PointLight(0xfef08a, 2.4, 3.2);
    lanternLight.position.set(0.46, -0.22, 0.35);
    rootCharacter.add(lanternLight);

    rootCharacter.add(eyeGlowGroup);

    // ── 6. FLOATING 3D CELESTIAL STARS ──────────────────────────────
    const starCount = 36;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = (i / starCount) * Math.PI * 2;
      const rad = 1.4 + Math.random() * 0.8;
      starPos[i * 3 + 0] = Math.cos(theta) * rad;
      starPos[i * 3 + 1] = -0.6 + Math.random() * 1.8;
      starPos[i * 3 + 2] = Math.sin(theta) * rad;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.065,
      transparent: true,
      opacity: 0.85,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // ── 7. 360° TURNTABLE ROTATION & MULTI-ANGLE CROSS-FADE ──────────
    const THUMB_ANGLES = [0, 45, 90, 180, 225, 270];
    const indicator = document.getElementById('pip-angle-indicator');
    const thumbBtns = document.querySelectorAll('.angle-thumb-btn');

    let currentRotationY = 0;
    let targetRotationY  = 0;
    let velocityY        = 0;
    let isDragging       = false;
    let startPointerX    = 0;
    let autoSpinActive   = false;

    function normalizeDeg(deg) {
      return ((deg % 360) + 360) % 360;
    }

    // Determine current and target texture index for smooth cross-fade
    let activeTexIdx = 0;

    function getTextureIndexForAngle(deg) {
      const d = normalizeDeg(deg);
      if (d >= 22 && d < 68) return 1;    // 45°
      if (d >= 68 && d < 135) return 2;   // 90°
      if (d >= 135 && d < 205) return 3;  // 180° (back)
      if (d >= 205 && d < 248) return 4;  // 225°
      if (d >= 248 && d < 338) return 5;  // 270°
      return 0;                           // 0° (front)
    }

    function updateCharacterAngle(deg) {
      const d = normalizeDeg(deg);
      const newIdx = getTextureIndexForAngle(d);

      if (newIdx !== activeTexIdx) {
        // Swap textures with smooth cross-fade
        matB.map = textures[newIdx];
        matB.opacity = 1.0;
        matA.opacity = 0.0;
        matA.map = textures[newIdx];
        matA.opacity = 1.0;
        activeTexIdx = newIdx;
      }

      // Sync degrees indicator
      if (indicator) indicator.textContent = `${Math.round(d)}°`;

      // Sync active thumbnail button
      thumbBtns.forEach((btn, idx) => {
        btn.classList.toggle('active', THUMB_ANGLES[idx] === THUMB_ANGLES[newIdx]);
      });

      // Eyes visible only when facing front
      const eyesVisible = (newIdx === 0 || d < 25 || d > 335);
      eyeGlowGroup.visible = eyesVisible;
    }

    // ── 8. POINTER CONTROLS (MOUSE & TOUCH) ──────────────────────────
    const dom = renderer.domElement;

    function onPointerDown(clientX) {
      isDragging = true;
      autoSpinActive = false;
      startPointerX = clientX;
      velocityY = 0;
      dom.style.cursor = 'grabbing';
    }

    function onPointerMove(clientX) {
      if (!isDragging) return;
      const dx = clientX - startPointerX;
      startPointerX = clientX;
      // High responsiveness
      const deltaRad = (dx / 320) * Math.PI * 1.2;
      targetRotationY += deltaRad;
      velocityY = deltaRad * 0.45;
    }

    function onPointerUp() {
      isDragging = false;
      dom.style.cursor = 'grab';
    }

    dom.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX));
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', (e) => onPointerDown(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDragging) onPointerMove(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Chevron buttons
    const prevBtn = document.getElementById('stage-arrow-prev');
    const nextBtn = document.getElementById('stage-arrow-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        autoSpinActive = false;
        targetRotationY -= (45 * Math.PI) / 180;
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        autoSpinActive = false;
        targetRotationY += (45 * Math.PI) / 180;
      });
    }

    // Reset View button
    const resetBtn = document.getElementById('companion-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        autoSpinActive = false;
        velocityY = 0;
        targetRotationY = 0;
      });
    }

    // Thumbnail buttons
    thumbBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        autoSpinActive = false;
        velocityY = 0;
        const deg = parseFloat(btn.dataset.angle || '0');
        targetRotationY = (deg * Math.PI) / 180;
      });
    });

    // 360 Badge on Plinth toggles continuous revolving turntable
    const badge360 = document.getElementById('badge-360');
    if (badge360) {
      badge360.addEventListener('click', (e) => {
        e.stopPropagation();
        autoSpinActive = !autoSpinActive;
        badge360.style.boxShadow = autoSpinActive ? '0 0 24px #fbbf24' : '';
      });
    }

    // Responsive resize
    function onResize() {
      const w = rig.clientWidth  || 430;
      const h = rig.clientHeight || 430;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ── 9. ANIMATION LOOP ────────────────────────────────────────────
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time  = clock.getElapsedTime();

      // Auto-rotation turntable
      if (autoSpinActive) {
        targetRotationY += 0.45 * delta;
      } else if (!isDragging && Math.abs(velocityY) > 0.0005) {
        targetRotationY += velocityY;
        velocityY *= 0.93; // smooth friction
      }

      // Smooth interpolation to target rotation
      currentRotationY += (targetRotationY - currentRotationY) * 0.16;

      // Rotate root character group in 3D
      rootCharacter.rotation.y = currentRotationY;
      plinthRing.rotation.z = currentRotationY * 0.5;

      // Sync character angle texture and thumbnail
      const deg = (currentRotationY * 180) / Math.PI;
      updateCharacterAngle(deg);

      // Gentle floating breath
      rootCharacter.position.y = Math.sin(time * 2.2) * 0.035;

      // Dynamic light pulse on lantern and glowing eyes
      lanternLight.intensity = 2.2 + Math.sin(time * 4.0) * 0.45;
      const eyeIntensity = 1.6 + Math.sin(time * 3.0) * 0.35;
      eyeLightL.intensity = eyeIntensity;
      eyeLightR.intensity = eyeIntensity;

      // Orbiting celestial particles
      starParticles.rotation.y = time * 0.06;

      renderer.render(scene, camera);
    }

    animate();
    console.log('Realistic 3D Pip turntable initialized successfully!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
})();
