/**
 * Interactive Visual Effects Engine
 * 1. Fast preloader lifecycle
 * 2. Fullscreen interactive envelope intro
 * 3. Ambient falling leaves & petals canvas animation
 * 4. Smooth parallax background drift (stable against mobile address-bar resize)
 */
(function (global) {
  'use strict';

  // ---- 1. Synchronous Image Preloader ----
  (function initPreloader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const sources = ['assets/envelope-no-wax-seal.png', 'assets/seal-overlay.png'];
    let remaining = sources.length;

    function hideLoader() {
      loader.classList.add('loader-done');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }

    sources.forEach(src => {
      const img = new Image();
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        if (--remaining <= 0) hideLoader();
      };
      img.onload = settle;
      img.onerror = settle;
      img.src = src;
      if (img.complete) settle();
    });
  })();

  // ---- 2. Fullscreen Interactive Envelope Intro ----
  (function initEnvelope() {
    const envelope = document.getElementById('envelope');
    if (!envelope) return;
    let envelopeOpened = false;

    envelope.addEventListener('click', () => {
      if (envelopeOpened) return;
      envelopeOpened = true;
      envelope.classList.add('opening');
      document.documentElement.classList.remove('envelope-locked');
      envelope.addEventListener('transitionend', () => {
        envelope.hidden = true;
      }, { once: true });
    });
  })();

  // ---- 3. Falling Leaves & Petals Canvas Animation ----
  let petalsEnabled = true;
  (function initPetals() {
    const petalCanvas = document.getElementById('petalCanvas');
    if (!petalCanvas) return;
    const petalCtx = petalCanvas.getContext('2d');
    let petals = [];

    function resizePetalCanvas() {
      petalCanvas.width = window.innerWidth;
      petalCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizePetalCanvas, { passive: true });
    resizePetalCanvas();

    // Tiny offscreen probes to read live computed RGB values of CSS variables
    const leafColorProbe = document.createElement('span');
    const petalColorProbe = document.createElement('span');
    leafColorProbe.style.cssText = 'position:absolute;visibility:hidden;color:var(--leaf-color)';
    petalColorProbe.style.cssText = 'position:absolute;visibility:hidden;color:var(--petal-color)';
    document.body.append(leafColorProbe, petalColorProbe);

    function rgbTuple(el, fallback) {
      const m = getComputedStyle(el).color.match(/[\d.]+/g);
      return m ? `${m[0]}, ${m[1]}, ${m[2]}` : (fallback || '138, 106, 48');
    }

    class Petal {
      constructor(i) {
        this.spawnDelay = i * 280 + Math.random() * 200;
        this.spawned = false;
      }
      randomize(enterFromLeft) {
        if (enterFromLeft) {
          this.x = -20;
          this.y = Math.random() * petalCanvas.height;
          this.speedX = Math.random() * 0.7 + 0.35;
        } else {
          this.x = Math.random() * petalCanvas.width;
          this.y = -30;
          this.speedX = Math.random() * 0.6 - 0.3;
        }
        this.size = Math.random() * 10 + 9;
        this.speedY = Math.random() * 0.9 + 0.5;
        this.rotation = Math.random() * 360;
        this.rotSpeed = Math.random() * 1.2 - 0.6;
        this.flutter = Math.random() * Math.PI * 2;
        this.flutterSpeed = Math.random() * 0.03 + 0.015;
        this.opacity = Math.random() * 0.45 + 0.25;
        this.type = Math.random() > 0.45 ? 'leaf' : 'petal';
      }
      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.008) + this.speedX;
        this.rotation += this.rotSpeed;
        this.flutter += this.flutterSpeed;
        if (this.y > petalCanvas.height + 30) {
          this.randomize(false);
        }
      }
      draw(leafRgb, petalRgb) {
        petalCtx.save();
        petalCtx.translate(this.x, this.y);
        petalCtx.rotate((this.rotation * Math.PI) / 180);

        const scaleX = Math.sin(this.flutter);
        petalCtx.scale(scaleX, 1);
        const s = this.size;

        if (this.type === 'leaf') {
          petalCtx.fillStyle = `rgba(${leafRgb}, ${this.opacity})`;
          petalCtx.beginPath();
          petalCtx.moveTo(0, s);
          petalCtx.bezierCurveTo(-s * 0.75, s * 0.3, -s * 0.7, -s * 0.5, 0, -s);
          petalCtx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.75, s * 0.3, 0, s);
          petalCtx.closePath();
          petalCtx.fill();

          petalCtx.strokeStyle = `rgba(${leafRgb}, ${this.opacity * 0.8})`;
          petalCtx.lineWidth = 1;
          petalCtx.beginPath();
          petalCtx.moveTo(0, s * 0.85);
          petalCtx.lineTo(0, -s * 0.75);
          petalCtx.stroke();
        } else {
          petalCtx.fillStyle = `rgba(${petalRgb}, ${this.opacity})`;
          petalCtx.beginPath();
          petalCtx.moveTo(0, s * 0.8);
          petalCtx.bezierCurveTo(-s * 0.8, s * 0.2, -s * 0.9, -s * 0.6, 0, -s * 0.5);
          petalCtx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.8, s * 0.2, 0, s * 0.8);
          petalCtx.closePath();
          petalCtx.fill();
        }

        petalCtx.restore();
      }
    }

    for (let i = 0; i < 24; i++) {
      petals.push(new Petal(i));
    }

    const petalsStartTime = performance.now();

    function animatePetals() {
      petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
      if (petalsEnabled) {
        const elapsed = performance.now() - petalsStartTime;
        const leafRgb = rgbTuple(leafColorProbe, '138, 106, 48');
        const petalRgb = rgbTuple(petalColorProbe, '163, 129, 63');
        petals.forEach(p => {
          if (!p.spawned) {
            if (elapsed < p.spawnDelay) return;
            p.spawned = true;
            p.randomize(Math.random() < 0.35);
          }
          p.update();
          p.draw(leafRgb, petalRgb);
        });
      }
      requestAnimationFrame(animatePetals);
    }
    animatePetals();
  })();

  // ---- 4. Parallax Background Scroll Drift + Sizing ----
  (function initBackgroundDrift() {
    const bgImageEl = document.querySelector('.bg-image');
    if (!bgImageEl) return;

    // Viewport probes to avoid mobile address bar jitter (svh: guaranteed-
    // visible height, used for the scroll-fraction math below; lvh: the
    // large/bars-hidden height, used for the box's own size -- matches what
    // the CSS fallback uses, but read here in JS and set as an inline style
    // instead of leaving it to a live `calc(100lvh + ...)`. That raw calc()
    // was occasionally painting stale/short on first load in some engines
    // (a "white bar" at the very bottom of the viewport until *any* other
    // style recalculation forced a repaint, e.g. nudging the Parallax
    // slider) -- measuring once in JS and re-measuring on load/resize/fonts
    // is the robust version of the same fix.
    const svhProbe = document.createElement('div');
    svhProbe.style.cssText = 'position:absolute;visibility:hidden;height:100svh;width:0;top:0;pointer-events:none;';
    const lvhProbe = document.createElement('div');
    lvhProbe.style.cssText = 'position:absolute;visibility:hidden;height:100lvh;width:0;top:0;pointer-events:none;';
    document.body.append(svhProbe, lvhProbe);

    let naturalImg = { w: 0, h: 0 };
    // How much extra vertical room the crop-position slider is guaranteed
    // to have to pan through, on top of whatever `cover` already needs.
    // Without this, a portrait photo on a narrow/tall (mobile) viewport can
    // land exactly height-constrained under plain `cover` -- image height
    // matches the box height with zero slack left over, so the "Crop
    // Position Y" slider has nothing to move and visibly does nothing.
    const MIN_PAN_RATIO = 1.3;

    function boxHeight() {
      const rawMax = getComputedStyle(document.documentElement).getPropertyValue('--bg-drift-max');
      const driftMax = parseFloat(rawMax) || 0;
      const lvh = lvhProbe.getBoundingClientRect().height || window.innerHeight;
      return lvh + driftMax;
    }

    function updateBgSizing() {
      const boxW = window.innerWidth;
      const boxH = boxHeight();
      bgImageEl.style.height = `${boxH}px`;
      if (!naturalImg.w || !naturalImg.h) {
        bgImageEl.style.backgroundSize = 'cover';
        return;
      }
      const coverScale = Math.max(boxW / naturalImg.w, boxH / naturalImg.h);
      const panScale = (boxH * MIN_PAN_RATIO) / naturalImg.h;
      const scale = Math.max(coverScale, panScale);
      bgImageEl.style.backgroundSize = `${naturalImg.w * scale}px ${naturalImg.h * scale}px`;
    }

    function updateDrift() {
      const rawMax = getComputedStyle(document.documentElement).getPropertyValue('--bg-drift-max');
      const bgDriftMax = parseFloat(rawMax) || 150;
      const stableH = svhProbe.getBoundingClientRect().height || window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - stableH;
      const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      bgImageEl.style.transform = `translateY(${-(fraction * bgDriftMax)}px)`;
    }

    function refreshAll() {
      updateBgSizing();
      updateDrift();
    }

    window.addEventListener('scroll', updateDrift, { passive: true });
    window.addEventListener('resize', refreshAll, { passive: true });
    // Fonts/images/iframes finishing after the initial synchronous run can
    // grow the page (or change the measured viewport probes) -- re-measure
    // once things settle rather than only reacting to user-driven events.
    window.addEventListener('load', refreshAll);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshAll).catch(() => {});
    }
    refreshAll();

    global.WeddingEffects = global.WeddingEffects || {};
    global.WeddingEffects.setBgImageNaturalSize = function (w, h) {
      naturalImg = { w: w || 0, h: h || 0 };
      updateBgSizing();
    };
  })();

  // Public effect controls
  global.WeddingEffects = global.WeddingEffects || {};
  global.WeddingEffects.setPetalsEnabled = function (enabled) {
    petalsEnabled = !!enabled;
  };

})(window);
