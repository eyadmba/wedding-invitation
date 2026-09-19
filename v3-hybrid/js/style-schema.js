/* ---- style-schema.js ----
   Declarative manifest: Single source of truth for all Design Lab knobs,
   font choices, background presets, card sections, and preset themes.
   Runs directly in browser via script tag (attached to window.StyleSchema).
*/
(function (global) {
  'use strict';

  var FONT_OPTIONS = [
    { value: "'Aref Ruqaa', serif", label: 'Aref Ruqaa (Display Serif)' },
    { value: "'Aref Ruqaa Ink', serif", label: 'Aref Ruqaa Ink' },
    { value: "'Amiri', serif", label: 'Amiri (Classic Serif)' },
    { value: "'Amiri Quran', serif", label: 'Amiri Quran' },
    { value: "'Cairo', sans-serif", label: 'Cairo (Modern Sans)' },
    { value: "'Tajawal', sans-serif", label: 'Tajawal (Clean Sans)' },
    { value: "'El Messiri', sans-serif", label: 'El Messiri (Elegant Sans)' },
    { value: "'Almarai', sans-serif", label: 'Almarai' },
    { value: "'Fustat', sans-serif", label: 'Fustat' },
    { value: "'Gulzar', serif", label: 'Gulzar' },
    { value: "'Harmattan', sans-serif", label: 'Harmattan' },
    { value: "'IBM Plex Sans Arabic', sans-serif", label: 'IBM Plex Sans Arabic' },
    { value: "'Jomhuria', serif", label: 'Jomhuria' },
    { value: "'Katibeh', serif", label: 'Katibeh' },
    { value: "'Lateef', serif", label: 'Lateef' },
    { value: "'Mada', sans-serif", label: 'Mada' },
    { value: "'Marhey', serif", label: 'Marhey' },
    { value: "'Markazi Text', serif", label: 'Markazi Text' },
    { value: "'Mirza', serif", label: 'Mirza' },
    { value: "'Noto Naskh Arabic', serif", label: 'Noto Naskh Arabic' },
    { value: "'Noto Nastaliq Urdu', serif", label: 'Noto Nastaliq Urdu' },
    { value: "'Qahiri', serif", label: 'Qahiri' },
    { value: "'Rakkas', serif", label: 'Rakkas' },
    { value: "'Reem Kufi', sans-serif", label: 'Reem Kufi' },
    { value: "'Scheherazade New', serif", label: 'Scheherazade New' },
    { value: "'Zain', sans-serif", label: 'Zain' },
    { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond (Latin)' }
  ];

  var BG_PRESETS = [
    { value: '', label: '— None (Flat Color) —' },
    { value: 'assets/backgrounds/sage-floral.jpg', label: 'Sage Floral (Theme 1)' },
    { value: 'assets/backgrounds/pin2.jpg', label: 'Pin 2 (Warm Paper)' },
    { value: 'assets/backgrounds/pintrest1.jpg', label: 'Pintrest 1 (Botanical)' },
    { value: 'assets/backgrounds/sage-hires.png', label: 'Sage Hi-Res (Texture)' },
    { value: 'assets/backgrounds/Club.jpg', label: 'King Hussein Club' },
    { value: 'assets/backgrounds/gemini-123123.jpg', label: 'Gemini 123123' }
  ];

  var BLEND_MODES = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply (Darken)' },
    { value: 'lighten', label: 'Lighten (Brighten)' },
    { value: 'overlay', label: 'Overlay (Contrast)' },
    { value: 'screen', label: 'Screen (Luminous)' }
  ];

  var ORNAMENT_MARKS = {
    star:    { char: '✦', rotate: '0deg',  label: '✦ Star' },
    diamond: { char: '◆', rotate: '0deg',  label: '◆ Diamond' },
    square:  { char: '◆', rotate: '45deg', label: '■ Square' },
    circle:  { char: '●', rotate: '0deg',  label: '● Circle' },
    plus:    { char: '+', rotate: '0deg',  label: '+ Plus' },
    none:    { char: '',  rotate: '0deg',  label: '— None —' }
  };

  // ---- GLOBAL_KNOBS ----
  var GLOBAL_KNOBS = [
    // Background: one color (with its own alpha) doubles as both the flat
    // page color AND the tint/overlay over the background photo -- see the
    // --bg-color-solid / --bg-color split in styles.css. There's no
    // separate "Overlay Color" knob anymore: set a blend mode and a
    // non-transparent alpha here to tint the photo, or leave alpha at 0 for
    // no tint at all.
    { id: 'bgColor', label: 'Background Color', type: 'color', cssVar: '--bg-color', default: '#f7f4ed', defaultAlpha: 0, group: 'Background' },
    { id: 'bgBlendMode', label: 'Background Blend Mode', type: 'select', cssVar: '--bg-blend-mode', options: BLEND_MODES, default: 'normal', group: 'Background' },
    { id: 'bgImage', label: 'Background Image', type: 'bgImage', cssVar: '--bg-image', presets: BG_PRESETS, default: 'assets/backgrounds/Club.jpg', group: 'Background' },
    { id: 'bgPositionX', label: 'Crop Position X', type: 'range', cssVar: '--bg-position-x', min: 0, max: 100, default: 50, unit: '%', group: 'Background' },
    { id: 'bgPositionY', label: 'Crop Position Y', type: 'range', cssVar: '--bg-position-y', min: 0, max: 100, default: 50, unit: '%', group: 'Background' },
    { id: 'bgParallax', label: 'Parallax Scroll Drift', type: 'range', cssVar: '--bg-drift-max', min: 0, max: 150, default: 0, unit: 'px', group: 'Background' },

    // Functional Colors
    { id: 'cardTitleColor', label: 'Card Title Color', type: 'color', cssVar: '--card-title-color', default: '#520000', defaultAlpha: 100, group: 'Colors' },
    { id: 'cardTextColor', label: 'Card Text Color', type: 'color', cssVar: '--card-text-color', default: '#520000', defaultAlpha: 100, group: 'Colors' },
    { id: 'buttonColor', label: 'Button Background', type: 'color', cssVar: '--button-color', default: '#530914', defaultAlpha: 100, group: 'Colors' },
    { id: 'buttonTextColor', label: 'Button Text Color', type: 'color', cssVar: '--button-text-color', default: '#ffffff', defaultAlpha: 100, group: 'Colors' },
    { id: 'ornamentColor', label: 'Ornament & Accent Color', type: 'color', cssVar: '--ornament-color', default: '#fff7c2', defaultAlpha: 100, group: 'Colors' },

    // Fonts & Sizing
    { id: 'displayFont', label: 'Display Font (Titles)', type: 'font', cssVar: '--font-display', options: FONT_OPTIONS, default: "'Aref Ruqaa', serif", group: 'Fonts' },
    { id: 'bodyFont', label: 'Body Font (Copy)', type: 'font', cssVar: '--font-body', options: FONT_OPTIONS, default: "'Amiri', serif", group: 'Fonts' },
    { id: 'textScale', label: 'General Text Scale', type: 'scale', cssVar: '--text-scale', min: 50, max: 200, default: 100, group: 'Size & Shadow' },
    { id: 'cardTitleSize', label: 'Card Title Scale', type: 'scale', cssVar: '--card-title-scale', min: 50, max: 200, default: 138, group: 'Size & Shadow' },
    { id: 'textShadowBlur', label: 'Text Shadow Spread', type: 'range', cssVar: '--text-shadow-blur', min: 0, max: 10, default: 2, unit: '', group: 'Size & Shadow' },
    { id: 'textShadowOpacity', label: 'Text Shadow Opacity', type: 'range', cssVar: '--text-shadow-opacity', min: 0, max: 100, default: 25, unit: '%', group: 'Size & Shadow' },

    // Ornaments & Effects
    { id: 'ornamentMark', label: 'Ornament Glyph', type: 'ornamentMark', cssVar: '--ornament-mark-rotate', marks: ORNAMENT_MARKS, default: 'star', group: 'Effects' },
    { id: 'petalsEnabled', label: 'Falling Leaves / Petals', type: 'toggle', target: 'petals', default: true, group: 'Effects' },
    { id: 'leafColor', label: 'Leaf Color', type: 'colorNoAlpha', cssVar: '--leaf-color', default: '#2e490d', group: 'Effects' },
    { id: 'petalColor', label: 'Petal Color', type: 'colorNoAlpha', cssVar: '--petal-color', default: '#6f1623', group: 'Effects' },

    // Glass Card Surface
    { id: 'cardBackgroundEnabled', label: 'Enable Glass Cards', type: 'toggle', target: 'cardBackground', default: true, group: 'Card Glass' },
    { id: 'cardColor', label: 'Card Base Tint', type: 'colorNoAlpha', cssVar: null, default: '#b17f07', group: 'Card Glass' },
    { id: 'cardAlpha', label: 'Card Opacity', type: 'range', cssVar: null, min: 0, max: 100, default: 5, unit: '%', group: 'Card Glass' },
    { id: 'cardBlurEnabled', label: 'Backdrop Blur', type: 'toggle', target: 'cardBlur', default: true, group: 'Card Glass' },
    { id: 'cardBlurAmount', label: 'Blur Amount', type: 'range', cssVar: null, min: 0, max: 40, default: 9, unit: 'px', group: 'Card Glass' }
  ];

  // ---- CARDS (Per-Section Knobs and Overrides) ----
  var CARDS = [
    {
      id: 'hero',
      label: 'Hero Section',
      icon: '👑',
      knobs: [
        { id: 'bismillahFont', label: 'Bismillah Font', type: 'font', cssVar: '--bismillah-font', options: FONT_OPTIONS, default: "'Aref Ruqaa', serif" },
        { id: 'bismillahColor', label: 'Bismillah Color', type: 'color', cssVar: '--bismillah-color', default: '#520000', defaultAlpha: 100 },
        { id: 'bismillahScale', label: 'Bismillah Size', type: 'scale', cssVar: '--bismillah-scale', min: 50, max: 200, default: 100 },
        { id: 'kickerColor', label: 'Kicker Color (دعوة لمن نحب)', type: 'color', cssVar: '--kicker-color', default: '#520000', defaultAlpha: 100 },
        { id: 'kickerScale', label: 'Kicker Size', type: 'scale', cssVar: '--kicker-scale', min: 50, max: 200, default: 100 },
        { id: 'verseColor', label: 'Verse Color', type: 'color', cssVar: '--verse-color', default: '#520000', defaultAlpha: 100 },
        { id: 'verseScale', label: 'Verse Size', type: 'scale', cssVar: '--verse-scale', min: 50, max: 200, default: 100 },
        { id: 'couplesColor', label: 'Bride & Groom Names Color', type: 'color', cssVar: '--names-color', default: '#520000', defaultAlpha: 100 },
        { id: 'namesScale', label: 'Names Size', type: 'scale', cssVar: '--names-scale', min: 50, max: 200, default: 100 },
        { id: 'fathersColor', label: 'Fathers Names Color', type: 'color', cssVar: '--fathers-color', default: '#520000', defaultAlpha: 100 },
        { id: 'fathersScale', label: 'Fathers Size', type: 'scale', cssVar: '--fathers-scale', min: 50, max: 200, default: 100 },
        { id: 'heroSecondaryColor', label: 'Secondary Color (يتشرف / بدعوتكم)', type: 'color', cssVar: '--hero-secondary', default: '#520000', defaultAlpha: 100 },
        { id: 'heroSecondaryScale', label: 'Secondary Size', type: 'scale', cssVar: '--hero-secondary-scale', min: 50, max: 200, default: 100 },
        { id: 'heroDateColor', label: 'Date Line Color', type: 'color', cssVar: '--hero-date-color', default: '#520000', defaultAlpha: 100 },
        { id: 'heroDateScale', label: 'Date Line Size', type: 'scale', cssVar: '--hero-date-scale', min: 50, max: 200, default: 100 },
        { id: 'footerColor', label: 'Footer Notice Color', type: 'color', cssVar: '--footer-color', default: '#520000', defaultAlpha: 100 },
        { id: 'footerScale', label: 'Footer Notice Size', type: 'scale', cssVar: '--footer-scale', min: 50, max: 200, default: 100 }
      ],
      overridable: []
    },
    {
      id: 'timeline',
      label: 'Timeline Section',
      icon: '⏳',
      knobs: [
        { id: 'accentColor', label: 'Timeline Line (Light)', type: 'color', cssVar: '--accent-color', default: '#520000', defaultAlpha: 100 },
        { id: 'accentColorDeep', label: 'Timeline Dot (Deep)', type: 'color', cssVar: '--accent-color-deep', default: '#520000', defaultAlpha: 100 },
        { id: 'sectionTitleColor', label: 'Section Title Color', type: 'color', cssVar: '--timeline-title-color', overrides: 'cardTitleColor', default: '#520000', defaultAlpha: 100 },
        { id: 'hourTextColor', label: 'Hour Text Color', type: 'color', cssVar: '--timeline-hour-color', overrides: 'cardTextColor', default: '#520000', defaultAlpha: 100 },
        { id: 'labelTextColor', label: 'Label Text Color', type: 'color', cssVar: '--timeline-label-color', overrides: 'cardTextColor', default: '#520000', defaultAlpha: 100 }
      ],
      overridable: ['cardTitleColor', 'cardTextColor']
    },
    {
      id: 'location',
      label: 'Location Section',
      icon: '📍',
      knobs: [
        { id: 'sectionTitleColor', label: 'Section Title Color', type: 'color', cssVar: '--location-title-color', overrides: 'cardTitleColor', default: '#520000', defaultAlpha: 100 },
        { id: 'venueNameColor', label: 'Venue Name Color', type: 'color', cssVar: '--location-venue-color', overrides: 'cardTitleColor', default: '#520000', defaultAlpha: 100 },
        { id: 'venueTimeColor', label: 'Venue Time Color', type: 'color', cssVar: '--location-time-color', overrides: 'cardTextColor', default: '#520000', defaultAlpha: 100 }
      ],
      overridable: ['cardTitleColor', 'cardTextColor']
    },
    {
      id: 'rsvp',
      label: 'RSVP Section',
      icon: '💌',
      knobs: [
        { id: 'sectionTitleColor', label: 'Section Title Color', type: 'color', cssVar: '--rsvp-title-color', overrides: 'cardTitleColor', default: '#520000', defaultAlpha: 100 },
        { id: 'questionColor', label: 'Question Color', type: 'color', cssVar: '--rsvp-question-color', overrides: 'cardTitleColor', default: '#520000', defaultAlpha: 100 },
        { id: 'answerColor', label: 'Answer Options Color', type: 'color', cssVar: '--rsvp-answer-color', overrides: 'cardTextColor', default: '#520000', defaultAlpha: 100 }
      ],
      overridable: ['cardTitleColor', 'cardTextColor']
    }
  ];

  // ---- THEME REGISTRY ----
  // Each theme's actual knob values live in their own file under
  // v3-hybrid/themes/<script>, loaded into window.WeddingThemes by a plain
  // <script src> tag in index.html (see the comment there) -- NOT fetched.
  // fetch()/XHR of a local file is blocked by Chromium's file:// CORS policy
  // (this site is meant to open straight off disk, no server), but a
  // <script src> tag has no such restriction, so each theme file is JS
  // (`(window.WeddingThemes ??= {})['id'] = {...}`) rather than raw .json.
  // This registry is the one hardcoded list of *which* themes exist and
  // drives the Design Lab dropdown's labels/order; design-lab.js reads the
  // matching theme's data straight out of window.WeddingThemes[id] (see its
  // "Theme Loading" section). Adding a theme means: drop themes/<id>.js,
  // add its <script> tag in index.html, and add one entry here.
  var DEFAULT_THEME_ID = 'king-hussein-club';
  var THEME_REGISTRY = [
    { id: 'king-hussein-club', label: 'King Hussein Club (Default)' },
    { id: 'sage-gold', label: 'Sage & Gold' },
    { id: 'classic-burgundy', label: 'Classic Burgundy & Ivory' },
    { id: 'emerald-night', label: 'Emerald & Champagne' },
    { id: 'minimal-pearl', label: 'Minimalist Pearl & Charcoal' },
    { id: 'midnight-velvet', label: 'Midnight Sapphire & Gold' },
    { id: 'forest-garnet', label: 'Forest & Garnet' }
  ];

  global.StyleSchema = {
    FONT_OPTIONS: FONT_OPTIONS,
    BG_PRESETS: BG_PRESETS,
    BLEND_MODES: BLEND_MODES,
    ORNAMENT_MARKS: ORNAMENT_MARKS,
    GLOBAL_KNOBS: GLOBAL_KNOBS,
    CARDS: CARDS,
    DEFAULT_THEME_ID: DEFAULT_THEME_ID,
    THEME_REGISTRY: THEME_REGISTRY
  };
})(window);
