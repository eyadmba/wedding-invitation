/* ---- design-lab.js ----
   High-Ergonomics Design Lab Engine for v3-hybrid:
   - Declarative: purely driven by window.StyleSchema.
   - Zero-build: runs over file:// or http:// with no dependencies.
   - Mobile-First: Slide-up bottom sheet with drag handle & peek/minimize mode.
   - Quick Palette Bar: 3 swatches ([P] Primary, [S] Secondary, [A] Accent) + batch spray actions.
   - Native Fallback Overrides: sets/removes CSS vars cleanly.
   - State Persistence: theme management + localStorage + JSON import/export.
*/
(function (global) {
  'use strict';

  var Schema = global.StyleSchema;
  var GLOBAL_KNOBS = Schema.GLOBAL_KNOBS;
  var CARDS = Schema.CARDS;
  var root = document.documentElement;

  var STORAGE_KEY = 'weddingLabState_v3';
  var THEMES_KEY = 'weddingLabThemes_v3';

  // ---- Color Conversion Utilities ----
  function hexToRgb(hex) {
    hex = String(hex || '#000000').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var num = parseInt(hex, 16) || 0;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgba(hex, alphaPct) {
    var c = hexToRgb(hex);
    var a = (typeof alphaPct === 'number' ? alphaPct : 100) / 100;
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  // ==================================================================
  // State Management
  // ==================================================================
  function defaultValueFor(knob) {
    if (knob.type === 'color') return { hex: knob.default, alpha: knob.defaultAlpha == null ? 100 : knob.defaultAlpha };
    if (knob.type === 'bgImage') return { preset: knob.default, dataUrl: null };
    return knob.default;
  }

  function buildDefaultState() {
    var s = { global: {}, cards: {} };
    GLOBAL_KNOBS.forEach(function (k) { s.global[k.id] = defaultValueFor(k); });
    CARDS.forEach(function (card) {
      var values = {}, overrides = {};
      card.knobs.forEach(function (k) {
        values[k.id] = defaultValueFor(k);
        if (k.overrides) overrides[k.id] = false;
      });
      s.cards[card.id] = { values: values, overrides: overrides };
    });
    // Default contrast override for timeline hour
    if (s.cards.timeline) {
      s.cards.timeline.overrides.hourTextColor = true;
      s.cards.timeline.values.hourTextColor = { hex: '#edf2e4', alpha: 100 };
    }
    return s;
  }

  var DEFAULT_STATE = buildDefaultState();
  var state = JSON.parse(JSON.stringify(DEFAULT_STATE));

  function deepMerge(target, src) {
    if (!src || typeof src !== 'object') return target;
    Object.keys(src).forEach(function (key) {
      var sv = src[key];
      if (sv && typeof sv === 'object' && !Array.isArray(sv) && target[key] && typeof target[key] === 'object') {
        deepMerge(target[key], sv);
      } else if (sv !== undefined) {
        target[key] = sv;
      }
    });
    return target;
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  function setState(obj) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    deepMerge(state, migrateLegacyState(obj || {}));
    sanitizeState();
    applyAll();
    rebuildPanel();
  }

  // Reshapes state saved under an older schema (localStorage, a saved user
  // theme, or a pasted Import/Export blob) into the current one, in place,
  // before it gets merged over the fresh defaults. Without this, an old
  // save's separate bgColor (opaque, alpha 100) + bgOverlayColor (the actual
  // tint) collapse into just bgColor at alpha 100 -- now that bgColor alone
  // also paints the overlay (see the --bg-color-solid comment in
  // styles.css), that reads as a fully opaque layer permanently covering
  // whatever background photo is picked afterwards. No-ops on already
  // current-shaped state (nothing to rename/fold), so it's safe to run on
  // every load, including the shared built-in theme objects.
  function migrateLegacyState(obj) {
    var g = obj && obj.global;
    if (!g) return obj;
    if (g.bgOverlayColor) {
      g.bgColor = { hex: g.bgOverlayColor.hex, alpha: g.bgOverlayColor.alpha };
      delete g.bgOverlayColor;
    }
    if (g.bgOverlayBlend !== undefined) {
      g.bgBlendMode = g.bgOverlayBlend;
      delete g.bgOverlayBlend;
    }
    if (g.accentColor || g.accentColorDeep) {
      obj.cards = obj.cards || {};
      obj.cards.timeline = obj.cards.timeline || {};
      obj.cards.timeline.values = obj.cards.timeline.values || {};
      if (g.accentColor && obj.cards.timeline.values.accentColor === undefined) obj.cards.timeline.values.accentColor = g.accentColor;
      if (g.accentColorDeep && obj.cards.timeline.values.accentColorDeep === undefined) obj.cards.timeline.values.accentColorDeep = g.accentColorDeep;
      delete g.accentColor;
      delete g.accentColorDeep;
    }
    return obj;
  }

  // Guards against state (localStorage, or a pasted/saved theme) referencing
  // a background preset that no longer exists in Schema.BG_PRESETS -- e.g. a
  // theme saved back when this asset still had its original .jfif extension,
  // before the file on disk was renamed to .jpg. Without this, that state
  // just keeps pointing at a 404 forever (a plain filename, not a data URL,
  // so there's nothing to fall back to visually). Known renames are mapped
  // straight across; anything else unrecognized falls back to the default.
  var KNOWN_BG_RENAMES = { 'assets/backgrounds/gemini-123123.jfif': 'assets/backgrounds/gemini-123123.jpg' };
  function sanitizeState() {
    var bg = state.global.bgImage;
    if (!bg || bg.dataUrl || !bg.preset) return;
    if (Schema.BG_PRESETS.some(function (p) { return p.value === bg.preset; })) return;
    var remapped = KNOWN_BG_RENAMES[bg.preset];
    var remappedKnown = remapped && Schema.BG_PRESETS.some(function (p) { return p.value === remapped; });
    state.global.bgImage = { preset: remappedKnown ? remapped : DEFAULT_STATE.global.bgImage.preset, dataUrl: null };
  }

  // ==================================================================
  // CSS Variable Application
  // ==================================================================
  var CARD_COMPOSITE_KNOBS = { cardColor: true, cardAlpha: true, cardBlurAmount: true };

  function applyKnobValue(knob, value, enabled) {
    if (knob.overrides && enabled === false) {
      if (knob.cssVar) root.style.removeProperty(knob.cssVar);
      return;
    }
    if (CARD_COMPOSITE_KNOBS[knob.id]) {
      recomputeCard();
      return;
    }
    switch (knob.type) {
      case 'color':
        if (knob.cssVar) root.style.setProperty(knob.cssVar, rgba(value.hex, value.alpha));
        // bgColor does double duty (flat page color + photo tint/overlay --
        // see the --bg-color-solid comment in styles.css), so it also needs
        // an always-opaque companion var for the flat/gradient side of that
        // split, independent of whatever alpha the tint side is set to.
        if (knob.id === 'bgColor') root.style.setProperty('--bg-color-solid', rgba(value.hex, 100));
        break;
      case 'colorNoAlpha':
        if (knob.cssVar) root.style.setProperty(knob.cssVar, value);
        break;
      case 'range':
        if (knob.cssVar) root.style.setProperty(knob.cssVar, value + (knob.unit || ''));
        break;
      case 'scale':
        if (knob.cssVar) root.style.setProperty(knob.cssVar, Number(value) / 100);
        break;
      case 'select':
      case 'font':
        if (knob.cssVar) root.style.setProperty(knob.cssVar, value);
        break;
      case 'ornamentMark':
        applyOrnamentMark(value);
        break;
      case 'bgImage':
        applyBgImage(value);
        break;
      case 'toggle':
        applyToggle(knob, value);
        break;
    }
  }

  function applyOrnamentMark(key) {
    var opt = Schema.ORNAMENT_MARKS[key] || Schema.ORNAMENT_MARKS.star;
    document.querySelectorAll('.ornament .mark').forEach(function (el) { el.textContent = opt.char; });
    root.style.setProperty('--ornament-mark-rotate', opt.rotate);
  }

  function applyBgImage(value) {
    var url = value && value.dataUrl ? value.dataUrl : (value && value.preset ? value.preset : '');
    root.style.setProperty('--bg-image', url ? "url('" + url + "')" : 'none');
    // Effects.js sizes/crops the background itself (see its "guaranteed pan
    // room" comment) rather than leaving it to a plain `background-size:
    // cover`, so it needs the image's real pixel dimensions -- hand them
    // over once loaded, and clear them out for "no image".
    if (!global.WeddingEffects || !global.WeddingEffects.setBgImageNaturalSize) return;
    if (!url) { global.WeddingEffects.setBgImageNaturalSize(0, 0); return; }
    var probe = new Image();
    probe.onload = function () { global.WeddingEffects.setBgImageNaturalSize(probe.naturalWidth, probe.naturalHeight); };
    probe.onerror = function () { global.WeddingEffects.setBgImageNaturalSize(0, 0); };
    probe.src = url;
  }

  function applyToggle(knob, value) {
    if (knob.target === 'petals') {
      if (global.WeddingEffects && global.WeddingEffects.setPetalsEnabled) {
        global.WeddingEffects.setPetalsEnabled(value);
      }
    } else if (knob.target === 'cardBackground' || knob.target === 'cardBlur') {
      recomputeCard();
    }
  }

  function recomputeCard() {
    var enabled = state.global.cardBackgroundEnabled;
    root.classList.toggle('card-on', !!enabled);
    if (!enabled) {
      root.style.setProperty('--card-bg', 'rgba(0,0,0,0)');
      root.style.setProperty('--card-blur', '0px');
      return;
    }
    root.style.setProperty('--card-bg', rgba(state.global.cardColor, state.global.cardAlpha));
    var blurOn = state.global.cardBlurEnabled;
    var blurPx = blurOn ? Number(state.global.cardBlurAmount) : 0;
    root.style.setProperty('--card-blur', blurPx + 'px');
  }

  function applyAll() {
    GLOBAL_KNOBS.forEach(function (knob) {
      if (CARD_COMPOSITE_KNOBS[knob.id]) return;
      applyKnobValue(knob, state.global[knob.id]);
    });
    recomputeCard();
    CARDS.forEach(function (card) {
      var cardState = state.cards[card.id];
      card.knobs.forEach(function (knob) {
        if (knob.overrides) {
          var enabled = !!cardState.overrides[knob.id];
          applyKnobValue(knob, cardState.values[knob.id], enabled);
        } else {
          applyKnobValue(knob, cardState.values[knob.id]);
        }
      });
    });
  }

  // ==================================================================
  // Quick Palette Swatches ([P], [S], [A]) & Batch Spray
  // ==================================================================
  var palettePrimary = '#edf2e4';
  var paletteSecondary = '#556b2f';
  var paletteAccent = '#a3813f';

  function syncPaletteFromState() {
    if (state.global.cardTitleColor && state.global.cardTitleColor.hex) palettePrimary = state.global.cardTitleColor.hex;
    if (state.global.cardTextColor && state.global.cardTextColor.hex) paletteSecondary = state.global.cardTextColor.hex;
    if (state.global.ornamentColor && state.global.ornamentColor.hex) paletteAccent = state.global.ornamentColor.hex;
  }

  // Exactly two spray buckets, sitewide: "Card Titles" and "All Text" (see
  // js/style-schema.js knob comments for the full per-section breakdown).
  // Buttons, ornaments/accents and the timeline's own line/dot colors are
  // deliberately untouched by either bucket -- those stay one-off knobs in
  // their own accordion rows.
  function batchApplyColor(target, hexColor) {
    if (!hexColor) return;
    var g = state.global;
    var h = state.cards.hero.values;
    var tl = state.cards.timeline.values;
    var loc = state.cards.location.values;
    var rsvp = state.cards.rsvp.values;

    switch (target) {
      case 'all-titles':
        // hero: the kicker ("دعوة لمن نحب") only; timeline/location/rsvp:
        // the shared section heading (falls back to cardTitleColor when its
        // own override isn't enabled, so this stays in sync either way).
        g.cardTitleColor.hex = hexColor;
        h.kickerColor.hex = hexColor;
        tl.sectionTitleColor.hex = hexColor;
        loc.sectionTitleColor.hex = hexColor;
        rsvp.sectionTitleColor.hex = hexColor;
        applyAll();
        break;

      case 'all-text':
        // hero: everything except the kicker; timeline: both time points;
        // location: both the location title and its time; rsvp: the
        // question and the radio answers, but NOT the submit button.
        g.cardTextColor.hex = hexColor;
        h.bismillahColor.hex = hexColor;
        h.verseColor.hex = hexColor;
        h.couplesColor.hex = hexColor;
        h.fathersColor.hex = hexColor;
        h.heroSecondaryColor.hex = hexColor;
        h.heroDateColor.hex = hexColor;
        h.footerColor.hex = hexColor;
        tl.hourTextColor.hex = hexColor;
        tl.labelTextColor.hex = hexColor;
        loc.venueNameColor.hex = hexColor;
        loc.venueTimeColor.hex = hexColor;
        rsvp.questionColor.hex = hexColor;
        rsvp.answerColor.hex = hexColor;
        applyAll();
        break;
    }
    rebuildPanel();
    showToast('Applied color palette spray.');
  }

  // ==================================================================
  // UI Builder & Mobile Drawer Components
  // ==================================================================
  var drawer = document.getElementById('designLabDrawer');
  var isMinimized = false;

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  function showToast(msg) {
    var toast = document.getElementById('labToast');
    if (toast) {
      toast.textContent = msg;
      setTimeout(function () { toast.textContent = ''; }, 2200);
    }
  }

  function renderColorControl(knob, getVal, setVal) {
    var value = getVal();
    var swatch = el('input', { type: 'color', value: value.hex, class: 'knob-color-picker' });
    var hexField = el('input', { type: 'text', value: value.hex, maxlength: '7', class: 'knob-hex-input' });
    var alphaField = el('input', { type: 'number', value: String(value.alpha), min: '0', max: '100', title: 'Opacity %', class: 'knob-alpha-input' });

    function commit() {
      var v = { hex: swatch.value, alpha: Number(alphaField.value) };
      setVal(v);
    }
    swatch.addEventListener('input', function () { hexField.value = swatch.value; commit(); });
    hexField.addEventListener('input', function () {
      var v = hexField.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
        if (v[0] !== '#') v = '#' + v;
        swatch.value = v;
        commit();
      }
    });
    alphaField.addEventListener('input', commit);

    // Quick Tint Badges [P], [S], [A]
    var btnP = el('button', { type: 'button', text: 'P', class: 'quick-badge-btn', 'data-badge': 'P', title: 'Tint with Primary Swatch' });
    var btnS = el('button', { type: 'button', text: 'S', class: 'quick-badge-btn', 'data-badge': 'S', title: 'Tint with Secondary Swatch' });
    var btnA = el('button', { type: 'button', text: 'A', class: 'quick-badge-btn', 'data-badge': 'A', title: 'Tint with Accent Swatch' });

    btnP.addEventListener('click', function (e) { e.preventDefault(); swatch.value = palettePrimary; hexField.value = palettePrimary; commit(); });
    btnS.addEventListener('click', function (e) { e.preventDefault(); swatch.value = paletteSecondary; hexField.value = paletteSecondary; commit(); });
    btnA.addEventListener('click', function (e) { e.preventDefault(); swatch.value = paletteAccent; hexField.value = paletteAccent; commit(); });

    var badgeGroup = el('div', { class: 'quick-badge-group' }, [btnP, btnS, btnA]);
    var ctrlGroup = el('div', { class: 'color-control-group' }, [badgeGroup, swatch, hexField, alphaField]);

    return el('div', { class: 'knob-row' }, [
      el('span', { class: 'knob-label', text: knob.label }),
      ctrlGroup
    ]);
  }

  function renderColorNoAlphaControl(knob, getVal, setVal) {
    var value = getVal();
    var swatch = el('input', { type: 'color', value: value, class: 'knob-color-picker' });
    var hexField = el('input', { type: 'text', value: value, maxlength: '7', class: 'knob-hex-input' });
    function commit(v) { setVal(v); }
    swatch.addEventListener('input', function () { hexField.value = swatch.value; commit(swatch.value); });
    hexField.addEventListener('input', function () {
      var v = hexField.value.trim();
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
        if (v[0] !== '#') v = '#' + v;
        swatch.value = v;
        commit(v);
      }
    });

    var btnP = el('button', { type: 'button', text: 'P', class: 'quick-badge-btn', 'data-badge': 'P', title: 'Tint with Primary' });
    var btnS = el('button', { type: 'button', text: 'S', class: 'quick-badge-btn', 'data-badge': 'S', title: 'Tint with Secondary' });
    var btnA = el('button', { type: 'button', text: 'A', class: 'quick-badge-btn', 'data-badge': 'A', title: 'Tint with Accent' });
    btnP.addEventListener('click', function (e) { e.preventDefault(); swatch.value = palettePrimary; hexField.value = palettePrimary; commit(palettePrimary); });
    btnS.addEventListener('click', function (e) { e.preventDefault(); swatch.value = paletteSecondary; hexField.value = paletteSecondary; commit(paletteSecondary); });
    btnA.addEventListener('click', function (e) { e.preventDefault(); swatch.value = paletteAccent; hexField.value = paletteAccent; commit(paletteAccent); });

    var badgeGroup = el('div', { class: 'quick-badge-group' }, [btnP, btnS, btnA]);
    var ctrlGroup = el('div', { class: 'color-control-group' }, [badgeGroup, swatch, hexField]);

    return el('div', { class: 'knob-row' }, [
      el('span', { class: 'knob-label', text: knob.label }),
      ctrlGroup
    ]);
  }

  function renderRangeControl(knob, getVal, setVal) {
    var value = getVal();
    var valBadge = el('span', { class: 'range-value-badge', text: value + (knob.unit || '') });
    var range = el('input', { type: 'range', min: String(knob.min), max: String(knob.max), value: String(value), class: 'knob-range-slider' });
    range.addEventListener('input', function () {
      var n = Number(range.value);
      valBadge.textContent = n + (knob.unit || '');
      setVal(n);
    });

    return el('div', { class: 'knob-row range-knob-row' }, [
      el('div', { class: 'range-label-row' }, [
        el('span', { class: 'knob-label', text: knob.label }),
        valBadge
      ]),
      range
    ]);
  }

  function renderSelectControl(knob, getVal, setVal) {
    var value = getVal();
    var select = el('select', { class: 'knob-select-dropdown' });
    (knob.options || []).forEach(function (opt) {
      var o = el('option', { value: opt.value, text: opt.label });
      if (opt.value === value) o.setAttribute('selected', 'selected');
      select.appendChild(o);
    });
    select.value = value;
    select.addEventListener('change', function () { setVal(select.value); });
    return el('div', { class: 'knob-row' }, [
      el('span', { class: 'knob-label', text: knob.label }),
      select
    ]);
  }

  function renderToggleControl(knob, getVal, setVal) {
    var value = getVal();
    var cb = el('input', { type: 'checkbox', class: 'knob-checkbox' });
    cb.checked = !!value;
    cb.addEventListener('change', function () { setVal(cb.checked); });
    return el('div', { class: 'knob-row' }, [
      el('span', { class: 'knob-label', text: knob.label }),
      cb
    ]);
  }

  function renderOrnamentMarkControl(knob, getVal, setVal) {
    var value = getVal();
    var select = el('select', { class: 'knob-select-dropdown' });
    Object.keys(knob.marks).forEach(function (key) {
      var o = el('option', { value: key, text: knob.marks[key].label });
      if (key === value) o.setAttribute('selected', 'selected');
      select.appendChild(o);
    });
    select.value = value;
    select.addEventListener('change', function () { setVal(select.value); });
    return el('div', { class: 'knob-row' }, [
      el('span', { class: 'knob-label', text: knob.label }),
      select
    ]);
  }

  function renderBgImageControl(knob, getVal, setVal) {
    var value = getVal();
    var presetSelect = el('select', { class: 'knob-select-dropdown' });
    (knob.presets || []).forEach(function (opt) {
      var o = el('option', { value: opt.value, text: opt.label });
      if (opt.value === value.preset && !value.dataUrl) o.setAttribute('selected', 'selected');
      presetSelect.appendChild(o);
    });
    presetSelect.value = value.dataUrl ? '' : value.preset;

    var fileInput = el('input', { type: 'file', accept: 'image/*', class: 'knob-file-input' });
    var clearBtn = el('button', { type: 'button', text: 'Clear', class: 'file-clear-btn' });

    presetSelect.addEventListener('change', function () {
      fileInput.value = '';
      setVal({ preset: presetSelect.value, dataUrl: null });
    });
    fileInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      presetSelect.value = '';
      var reader = new FileReader();
      reader.onload = function () {
        setVal({ preset: '', dataUrl: reader.result });
      };
      reader.readAsDataURL(file);
    });
    clearBtn.addEventListener('click', function () {
      fileInput.value = '';
      presetSelect.value = '';
      setVal({ preset: '', dataUrl: null });
    });

    return el('div', { style: 'display:flex; flex-direction:column; gap:6px;' }, [
      el('div', { class: 'knob-row' }, [
        el('span', { class: 'knob-label', text: 'Preset Photo' }),
        presetSelect
      ]),
      el('div', { class: 'knob-row' }, [
        el('span', { class: 'knob-label', text: 'Upload Photo' }),
        el('div', { class: 'file-input-group' }, [fileInput, clearBtn])
      ])
    ]);
  }

  function renderKnob(knob, getVal, setVal) {
    switch (knob.type) {
      case 'color': return renderColorControl(knob, getVal, setVal);
      case 'colorNoAlpha': return renderColorNoAlphaControl(knob, getVal, setVal);
      case 'range':
      case 'scale': return renderRangeControl(knob, getVal, setVal);
      case 'select':
      case 'font': return renderSelectControl(knob, getVal, setVal);
      case 'toggle': return renderToggleControl(knob, getVal, setVal);
      case 'ornamentMark': return renderOrnamentMarkControl(knob, getVal, setVal);
      case 'bgImage': return renderBgImageControl(knob, getVal, setVal);
      default: return el('div');
    }
  }

  // ---- 3-Swatch Palette Quick-Bar ----
  function buildPaletteBar() {
    syncPaletteFromState();
    var pPicker = el('input', { type: 'color', value: palettePrimary });
    var sPicker = el('input', { type: 'color', value: paletteSecondary });
    var aPicker = el('input', { type: 'color', value: paletteAccent });

    pPicker.addEventListener('input', function (e) { palettePrimary = e.target.value; });
    sPicker.addEventListener('input', function (e) { paletteSecondary = e.target.value; });
    aPicker.addEventListener('input', function (e) { paletteAccent = e.target.value; });

    var select = el('select', { class: 'palette-select' }, [
      el('option', { value: '', text: '⚡ Quick Spray Actions...' }),
      el('option', { value: 'p:all-titles', text: 'Apply [P] to Card Titles' }),
      el('option', { value: 's:all-titles', text: 'Apply [S] to Card Titles' }),
      el('option', { value: 'a:all-titles', text: 'Apply [A] to Card Titles' }),
      el('option', { value: 'p:all-text', text: 'Apply [P] to All Text' }),
      el('option', { value: 's:all-text', text: 'Apply [S] to All Text' }),
      el('option', { value: 'a:all-text', text: 'Apply [A] to All Text' })
    ]);

    var applyBtn = el('button', { type: 'button', text: 'Apply', class: 'palette-apply-btn' });
    applyBtn.addEventListener('click', function () {
      var val = select.value;
      if (!val) return;
      var parts = val.split(':');
      var type = parts[0];
      var target = parts[1];
      var color = palettePrimary;
      if (type === 's') color = paletteSecondary;
      if (type === 'a') color = paletteAccent;
      batchApplyColor(target, color);
      select.value = '';
    });

    var boxP = el('div', { class: 'palette-swatch-box', title: 'Primary Color [P]' }, [el('span', { class: 'palette-badge primary-badge', text: 'P' }), pPicker]);
    var boxS = el('div', { class: 'palette-swatch-box', title: 'Secondary Color [S]' }, [el('span', { class: 'palette-badge secondary-badge', text: 'S' }), sPicker]);
    var boxA = el('div', { class: 'palette-swatch-box', title: 'Accent Color [A]' }, [el('span', { class: 'palette-badge accent-badge', text: 'A' }), aPicker]);

    var swatchesRow = el('div', { class: 'palette-swatches-row' }, [boxP, boxS, boxA]);
    var actionsRow = el('div', { class: 'palette-actions-row' }, [select, applyBtn]);

    return el('div', { class: 'palette-bar' }, [swatchesRow, actionsRow]);
  }

  // ---- Theme Selector & Persistence Toolbar ----
  var BUILTIN_THEMES = Schema.PRESET_THEMES || [
    { id: 'sage-gold', label: 'Sage & Gold (Default)', state: DEFAULT_STATE }
  ];

  function loadUserThemes() {
    try {
      var raw = localStorage.getItem(THEMES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveUserThemes(list) {
    try { localStorage.setItem(THEMES_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function buildThemeBar() {
    var select = el('select', { class: 'theme-dropdown' });
    function refreshOptions() {
      select.innerHTML = '';
      BUILTIN_THEMES.forEach(function (t) { select.appendChild(el('option', { value: 'builtin:' + t.id, text: t.label })); });
      loadUserThemes().forEach(function (t) { select.appendChild(el('option', { value: 'user:' + t.id, text: t.label })); });
    }
    refreshOptions();

    select.addEventListener('change', function () {
      var v = select.value;
      var theme;
      if (v.indexOf('builtin:') === 0) {
        var id = v.slice(8);
        theme = BUILTIN_THEMES.find(function (t) { return t.id === id; });
      } else {
        var uid = v.slice(5);
        theme = loadUserThemes().find(function (t) { return t.id === uid; });
      }
      if (theme) {
        setState(theme.state);
        showToast('Loaded theme "' + theme.label + '"');
      }
    });

    var saveAsBtn = el('button', { type: 'button', text: '+ Save As', class: 'theme-action-btn', title: 'Save current styles as new theme' });
    saveAsBtn.addEventListener('click', function () {
      var name = prompt('Theme name?');
      if (!name) return;
      var themes = loadUserThemes();
      var id = 'u' + Date.now();
      themes.push({ id: id, label: name, state: getState() });
      saveUserThemes(themes);
      refreshOptions();
      select.value = 'user:' + id;
      showToast('Saved theme "' + name + '"');
    });

    return el('div', { class: 'theme-selector-bar' }, [
      el('div', { class: 'theme-select-wrapper' }, [
        el('span', { class: 'theme-label', text: 'Theme:' }),
        select
      ]),
      el('div', { class: 'theme-btn-group' }, [saveAsBtn])
    ]);
  }

  // ---- Accordion Panels (Global + Cards) ----
  function buildAccordions() {
    var accordion = el('div', { class: 'lab-accordion' });

    // 1. Grouped Global Sections
    var groups = {};
    var groupOrder = [];
    GLOBAL_KNOBS.forEach(function (k) {
      if (!groups[k.group]) { groups[k.group] = []; groupOrder.push(k.group); }
      groups[k.group].push(k);
    });

    groupOrder.forEach(function (groupName) {
      var panel = el('details', { class: 'lab-panel' });
      var summary = el('summary', { class: 'lab-panel-summary' }, [
        el('span', { class: 'panel-summary-left' }, [el('span', { class: 'panel-title', text: groupName })]),
        el('span', { class: 'panel-chevron', text: '▾' })
      ]);
      var content = el('div', { class: 'panel-content' });
      groups[groupName].forEach(function (knob) {
        var getVal = function () { return state.global[knob.id]; };
        var setVal = function (v) { state.global[knob.id] = v; applyKnobValue(knob, v); };
        content.appendChild(renderKnob(knob, getVal, setVal));
      });
      panel.appendChild(summary);
      panel.appendChild(content);
      accordion.appendChild(panel);
    });

    // 2. Card Sections
    CARDS.forEach(function (card) {
      var panel = el('details', { class: 'lab-panel card-panel' });
      var cardState = state.cards[card.id];

      var summaryLeft = el('span', { class: 'panel-summary-left' }, [
        el('span', { text: (card.icon || '🃏') + ' ' }),
        el('span', { class: 'panel-title', text: card.label })
      ]);

      var summaryRight = el('div', { class: 'panel-summary-right' });
      summaryRight.appendChild(el('span', { class: 'panel-chevron', text: '▾' }));

      var summary = el('summary', { class: 'lab-panel-summary' }, [summaryLeft, summaryRight]);
      var content = el('div', { class: 'panel-content' });

      card.knobs.forEach(function (knob) {
        if (knob.overrides) {
          var overrideToggle = el('input', { type: 'checkbox', class: 'knob-checkbox' });
          overrideToggle.checked = !!cardState.overrides[knob.id];

          var getVal = function () { return cardState.values[knob.id]; };
          var setVal = function (v) {
            cardState.values[knob.id] = v;
            if (cardState.overrides[knob.id]) applyKnobValue(knob, v);
          };

          var ctrl = renderKnob(knob, getVal, setVal);
          overrideToggle.addEventListener('change', function () {
            cardState.overrides[knob.id] = overrideToggle.checked;
            applyKnobValue(knob, cardState.values[knob.id], overrideToggle.checked);
          });

          var toggleRow = el('div', { class: 'knob-row', style: 'padding-bottom:4px; border-bottom:1px dashed rgba(0,0,0,0.08);' }, [
            el('span', { class: 'knob-label', style: 'color:#3f51b5; font-weight:600;', text: 'Enable ' + knob.label + ' Override' }),
            overrideToggle
          ]);

          content.appendChild(toggleRow);
          content.appendChild(ctrl);
        } else {
          var getVal2 = function () { return cardState.values[knob.id]; };
          var setVal2 = function (v) { cardState.values[knob.id] = v; applyKnobValue(knob, v); };
          content.appendChild(renderKnob(knob, getVal2, setVal2));
        }
      });

      panel.appendChild(summary);
      panel.appendChild(content);
      accordion.appendChild(panel);
    });

    return accordion;
  }

  // ---- Import / Export Dialog ----
  function buildExportImportModal() {
    var modalBackdrop = el('div', { class: 'theme-modal-backdrop', hidden: 'true' });
    var panel = el('div', { class: 'theme-modal-panel' });

    var header = el('div', { class: 'theme-modal-header' }, [
      el('h3', { text: '📋 Theme Import / Export' }),
      el('button', { type: 'button', class: 'modal-close-btn', text: '×' })
    ]);

    var textarea = el('textarea', { class: 'modal-textarea', rows: '8', placeholder: 'Paste JSON theme data here...' });
    var copyBtn = el('button', { type: 'button', class: 'modal-btn secondary', text: 'Copy to Clipboard' });
    var exportBtn = el('button', { type: 'button', class: 'modal-btn secondary', text: 'Export State' });
    var importBtn = el('button', { type: 'button', class: 'modal-btn primary', text: 'Import State' });
    var feedback = el('div', { class: 'modal-feedback', style: 'color:#2e7d32;' });

    header.querySelector('.modal-close-btn').addEventListener('click', function () {
      modalBackdrop.hidden = true;
    });

    exportBtn.addEventListener('click', function () {
      textarea.value = JSON.stringify(getState(), null, 2);
      feedback.textContent = 'Exported current state.';
    });

    copyBtn.addEventListener('click', function () {
      textarea.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textarea.value).catch(function () {});
      } else {
        document.execCommand('copy');
      }
      feedback.textContent = 'Copied to clipboard!';
    });

    importBtn.addEventListener('click', function () {
      try {
        var obj = JSON.parse(textarea.value);
        setState(obj);
        feedback.textContent = 'Theme successfully imported!';
      } catch (err) {
        feedback.style.color = '#c62828';
        feedback.textContent = 'Import error: ' + err.message;
      }
    });

    var actions = el('div', { class: 'modal-actions' }, [exportBtn, copyBtn, importBtn]);
    panel.appendChild(header);
    panel.appendChild(textarea);
    panel.appendChild(actions);
    panel.appendChild(feedback);
    modalBackdrop.appendChild(panel);
    document.body.appendChild(modalBackdrop);

    return modalBackdrop;
  }

  var exportModal = null;

  // ---- Main Panel Assembly ----
  function rebuildPanel() {
    drawer.innerHTML = '';

    // Mobile Drag Handle
    var dragHandle = el('div', { class: 'lab-drag-handle', id: 'labDragHandle', title: 'Tap or drag to minimize/expand' }, [
      el('span', { class: 'handle-bar' })
    ]);

    // Header
    var headerLeft = el('div', { class: 'lab-header-left' }, [
      el('span', { text: '🎨' }),
      el('h2', { class: 'lab-title', text: 'Design Lab' })
    ]);

    var peekBtn = el('button', { type: 'button', class: 'lab-icon-btn', title: 'Peek Mode (Minimize to view full invite)', text: '👁️' });
    var expBtn = el('button', { type: 'button', class: 'lab-icon-btn', title: 'Import / Export Theme JSON', text: '📋' });
    var resetBtn = el('button', { type: 'button', class: 'lab-icon-btn', title: 'Reset to default theme', text: '🔄' });
    var closeBtn = el('button', { type: 'button', class: 'lab-icon-btn close', title: 'Close Design Lab', text: '×' });

    var headerActions = el('div', { class: 'lab-header-actions' }, [peekBtn, expBtn, resetBtn, closeBtn]);
    var header = el('div', { class: 'lab-header' }, [headerLeft, headerActions]);

    // Event Handlers for Header
    dragHandle.addEventListener('click', toggleMinimize);
    peekBtn.addEventListener('click', toggleMinimize);
    closeBtn.addEventListener('click', function () { drawer.hidden = true; });

    expBtn.addEventListener('click', function () {
      if (!exportModal) exportModal = buildExportImportModal();
      exportModal.hidden = false;
      var ta = exportModal.querySelector('.modal-textarea');
      if (ta) ta.value = JSON.stringify(getState(), null, 2);
    });

    resetBtn.addEventListener('click', function () {
      if (confirm('Reset styles to default?')) {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        setState(DEFAULT_STATE);
        showToast('Reset to defaults.');
      }
    });

    // Body Container
    var body = el('div', { class: 'lab-body' });
    body.appendChild(buildThemeBar());
    body.appendChild(buildPaletteBar());
    body.appendChild(buildAccordions());

    // Footer Container
    var saveBtn = el('button', { type: 'button', class: 'lab-save-btn', text: '💾 Save Theme Changes' });
    var toast = el('span', { id: 'labToast', class: 'lab-toast' });
    saveBtn.addEventListener('click', function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
        showToast('Saved to localStorage.');
      } catch (e) {
        showToast('Could not save: ' + e.message);
      }
    });

    var footer = el('div', { class: 'lab-footer' }, [saveBtn, toast]);

    drawer.appendChild(dragHandle);
    drawer.appendChild(header);
    drawer.appendChild(body);
    drawer.appendChild(footer);
  }

  function toggleMinimize() {
    isMinimized = !isMinimized;
    drawer.classList.toggle('minimized', isMinimized);
    var peek = drawer.querySelector('.lab-icon-btn[title*="Peek"]');
    if (peek) peek.textContent = isMinimized ? '📱' : '👁️';
  }

  // ==================================================================
  // Boot & Initialization
  // ==================================================================
  function loadSavedState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var obj = JSON.parse(raw);
      deepMerge(state, migrateLegacyState(obj));
      return true;
    } catch (e) { return false; }
  }

  var labToggle = document.getElementById('labToggle');
  var isEditMode = new URLSearchParams(location.search).has('edit');
  if (!isEditMode && labToggle) {
    labToggle.style.display = 'none';
  }

  if (labToggle) {
    labToggle.addEventListener('click', function () {
      drawer.hidden = !drawer.hidden;
      if (!drawer.hidden) {
        drawer.classList.remove('minimized');
        isMinimized = false;
      }
    });
  }

  loadSavedState();
  sanitizeState();
  applyAll();
  rebuildPanel();

  global.DesignLab = {
    getState: getState,
    setState: setState,
    batchApplyColor: batchApplyColor
  };

})(window);
