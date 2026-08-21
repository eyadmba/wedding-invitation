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

  // ---- 4. Background Sizing + Scroll Pan ----
  // The background is never allowed to "run out": rather than a plain
  // `background-size: cover` (which can leave zero vertical slack on a
  // portrait photo/viewport pairing) plus a pixel `transform`, this scales
  // the photo up (forcibly, past what `cover` alone needs, if the source is
  // too short) so there's always at least --bg-drift-max px of pure
  // vertical slack beyond the viewport, then pans through that slack purely
  // via `background-position` percentages. Percentages are already defined
  // relative to *whatever* slack currently exists (0% = image edge flush
  // with the box's edge on that side, 100% = the opposite edge) -- so
  // blending from the Crop Position Y slider's anchor up to 100% as the
  // page scrolls can mathematically never expose the flat color behind it,
  // no matter how much slack the anchor already ate into, or how
  // aggressively the image had to be zoomed to get any slack at all.
  // Horizontal (Crop Position X) is simpler: a static anchor, no scroll
  // blending -- there's no horizontal equivalent of "scrolling the page",
  // so it just picks which slice of the image's width to show and stays
  // there.
  (function initBackgroundPan() {
    const bgImageEl = document.querySelector('.bg-image');
    if (!bgImageEl) return;

    // Viewport probes to avoid mobile address bar jitter (svh: guaranteed-
    // visible height, used for the scroll-fraction math below; lvh: the
    // large/bars-hidden height, used for the box's own size -- read here in
    // JS and set as an inline style rather than left to a live CSS
    // `100lvh`, which was occasionally painting stale/short on first load
    // in some engines; measuring once in JS and re-measuring on
    // load/resize/fonts is the robust version of the same fix).
    const svhProbe = document.createElement('div');
    svhProbe.style.cssText = 'position:absolute;visibility:hidden;height:100svh;width:0;top:0;pointer-events:none;';
    const lvhProbe = document.createElement('div');
    lvhProbe.style.cssText = 'position:absolute;visibility:hidden;height:100lvh;width:0;top:0;pointer-events:none;';
    document.body.append(svhProbe, lvhProbe);

    let naturalImg = { w: 0, h: 0 };
    // There's no user-facing "horizontal drift" slider (Crop Position X is
    // just a static anchor), so unlike the vertical slack -- which is
    // guaranteed by --bg-drift-max -- horizontal slack gets a fixed minimum
    // ratio instead, purely so the X slider always has *some* real room to
    // move even when `cover` alone would otherwise land exactly
    // width-matched (the common case: a portrait photo on a landscape
    // viewport is height-constrained under cover, leaving zero horizontal
    // slack on its own).
    const MIN_H_SLACK_RATIO = 1.15;

    function boxHeight() {
      return lvhProbe.getBoundingClientRect().height || window.innerHeight;
    }

    function driftMaxPx() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--bg-drift-max');
      return parseFloat(raw) || 0;
    }

    function updateBgSizing() {
      const boxH = boxHeight();
      bgImageEl.style.height = `${boxH}px`;
      if (!naturalImg.w || !naturalImg.h) {
        bgImageEl.style.backgroundSize = 'cover';
        return;
      }
      const boxW = window.innerWidth;
      const coverScale = Math.max(boxW / naturalImg.w, boxH / naturalImg.h);
      // Guarantee at least driftMaxPx of real vertical slack, and at least
      // MIN_H_SLACK_RATIO's worth of horizontal slack, beyond the box --
      // even if that means zooming in well past what `cover` needs on its
      // own (soft/upscaled on a too-small source, but the sliders always
      // have real room to move, and the photo never falls short of the
      // viewport).
      const vSlackScale = (boxH + driftMaxPx()) / naturalImg.h;
      const hSlackScale = (boxW * MIN_H_SLACK_RATIO) / naturalImg.w;
      const scale = Math.max(coverScale, vSlackScale, hSlackScale);
      bgImageEl.style.backgroundSize = `${naturalImg.w * scale}px ${naturalImg.h * scale}px`;
    }

    function updatePan() {
      const style = getComputedStyle(document.documentElement);
      const rawX = parseFloat(style.getPropertyValue('--bg-position-x'));
      const xPct = isNaN(rawX) ? 50 : rawX;
      const rawAnchor = parseFloat(style.getPropertyValue('--bg-position-y'));
      const anchorPct = isNaN(rawAnchor) ? 50 : rawAnchor;
      const stableH = svhProbe.getBoundingClientRect().height || window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - stableH;
      const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      const liveYPct = anchorPct + (100 - anchorPct) * fraction;
      bgImageEl.style.backgroundPosition = `${xPct}% ${liveYPct}%`;
    }

    function refreshAll() {
      updateBgSizing();
      updatePan();
    }

    // Scroll only ever needs to re-pan (sizing is scroll-independent), and
    // is throttled to one recompute per frame -- background-position
    // changes paint (unlike a transform), so this keeps scroll from
    // re-running the getComputedStyle/getBoundingClientRect reads on every
    // single scroll event.
    let panQueued = false;
    function queuePan() {
      if (panQueued) return;
      panQueued = true;
      requestAnimationFrame(function () { panQueued = false; updatePan(); });
    }

    window.addEventListener('scroll', queuePan, { passive: true });
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
      refreshAll();
    };
  })();

  // Public effect controls
  global.WeddingEffects = global.WeddingEffects || {};
  global.WeddingEffects.setPetalsEnabled = function (enabled) {
    petalsEnabled = !!enabled;
  };

})(window);
