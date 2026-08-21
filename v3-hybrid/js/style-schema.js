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
    { id: 'bgColor', label: 'Background Color', type: 'color', cssVar: '--bg-color', default: '#f4efe3', defaultAlpha: 0, group: 'Background' },
    { id: 'bgBlendMode', label: 'Background Blend Mode', type: 'select', cssVar: '--bg-blend-mode', options: BLEND_MODES, default: 'normal', group: 'Background' },
    { id: 'bgImage', label: 'Background Image', type: 'bgImage', cssVar: '--bg-image', presets: BG_PRESETS, default: 'assets/backgrounds/sage-floral.jpg', group: 'Background' },
    { id: 'bgPositionY', label: 'Crop Position Y', type: 'range', cssVar: '--bg-position-y', min: 0, max: 100, default: 50, unit: '%', group: 'Background' },
    { id: 'bgParallax', label: 'Parallax Scroll Drift', type: 'range', cssVar: '--bg-drift-max', min: 0, max: 150, default: 150, unit: 'px', group: 'Background' },

    // Functional Colors
    { id: 'cardTitleColor', label: 'Card Title Color', type: 'color', cssVar: '--card-title-color', default: '#edf2e4', defaultAlpha: 100, group: 'Colors' },
    { id: 'cardTextColor', label: 'Card Text Color', type: 'color', cssVar: '--card-text-color', default: '#556b2f', defaultAlpha: 100, group: 'Colors' },
    { id: 'buttonColor', label: 'Button Background', type: 'color', cssVar: '--button-color', default: '#edf2e4', defaultAlpha: 100, group: 'Colors' },
    { id: 'buttonTextColor', label: 'Button Text Color', type: 'color', cssVar: '--button-text-color', default: '#556b2f', defaultAlpha: 100, group: 'Colors' },
    { id: 'ornamentColor', label: 'Ornament & Accent Color', type: 'color', cssVar: '--ornament-color', default: '#fff0d1', defaultAlpha: 100, group: 'Colors' },

    // Fonts & Sizing
    { id: 'displayFont', label: 'Display Font (Titles)', type: 'font', cssVar: '--font-display', options: FONT_OPTIONS, default: "'Aref Ruqaa', serif", group: 'Fonts' },
    { id: 'bodyFont', label: 'Body Font (Copy)', type: 'font', cssVar: '--font-body', options: FONT_OPTIONS, default: "'Amiri', serif", group: 'Fonts' },
    { id: 'textScale', label: 'General Text Scale', type: 'scale', cssVar: '--text-scale', min: 50, max: 200, default: 100, group: 'Size & Shadow' },
    { id: 'cardTitleSize', label: 'Card Title Scale', type: 'scale', cssVar: '--card-title-scale', min: 50, max: 200, default: 100, group: 'Size & Shadow' },
    { id: 'textShadow', label: 'Text Shadow Intensity', type: 'range', cssVar: '--text-shadow-intensity', min: 0, max: 10, default: 5, unit: '', group: 'Size & Shadow' },

    // Ornaments & Effects
    { id: 'ornamentMark', label: 'Ornament Glyph', type: 'ornamentMark', cssVar: '--ornament-mark-rotate', marks: ORNAMENT_MARKS, default: 'star', group: 'Effects' },
    { id: 'petalsEnabled', label: 'Falling Leaves / Petals', type: 'toggle', target: 'petals', default: true, group: 'Effects' },
    { id: 'leafColor', label: 'Leaf Color', type: 'colorNoAlpha', cssVar: '--leaf-color', default: '#8a6a30', group: 'Effects' },
    { id: 'petalColor', label: 'Petal Color', type: 'colorNoAlpha', cssVar: '--petal-color', default: '#a3813f', group: 'Effects' },

    // Glass Card Surface
    { id: 'cardBackgroundEnabled', label: 'Enable Glass Cards', type: 'toggle', target: 'cardBackground', default: true, group: 'Card Glass' },
    { id: 'cardColor', label: 'Card Base Tint', type: 'colorNoAlpha', cssVar: null, default: '#878787', group: 'Card Glass' },
    { id: 'cardAlpha', label: 'Card Opacity', type: 'range', cssVar: null, min: 0, max: 100, default: 20, unit: '%', group: 'Card Glass' },
    { id: 'cardBlurEnabled', label: 'Backdrop Blur', type: 'toggle', target: 'cardBlur', default: true, group: 'Card Glass' },
    { id: 'cardBlurAmount', label: 'Blur Amount', type: 'range', cssVar: null, min: 0, max: 40, default: 14, unit: 'px', group: 'Card Glass' }
  ];

  // ---- CARDS (Per-Section Knobs and Overrides) ----
  var CARDS = [
    {
      id: 'hero',
      label: 'Hero Section',
      icon: '👑',
      knobs: [
        { id: 'bismillahFont', label: 'Bismillah Font', type: 'font', cssVar: '--bismillah-font', options: FONT_OPTIONS, default: "'Aref Ruqaa', serif" },
        { id: 'bismillahColor', label: 'Bismillah Color', type: 'color', cssVar: '--bismillah-color', default: '#f3ecd8', defaultAlpha: 100 },
        { id: 'bismillahScale', label: 'Bismillah Size', type: 'scale', cssVar: '--bismillah-scale', min: 50, max: 200, default: 100 },
        { id: 'kickerColor', label: 'Kicker Color (دعوة لمن نحب)', type: 'color', cssVar: '--kicker-color', default: '#f3ecd8', defaultAlpha: 100 },
        { id: 'kickerScale', label: 'Kicker Size', type: 'scale', cssVar: '--kicker-scale', min: 50, max: 200, default: 100 },
        { id: 'verseColor', label: 'Verse Color', type: 'color', cssVar: '--verse-color', default: '#f3ecd8', defaultAlpha: 95 },
        { id: 'verseScale', label: 'Verse Size', type: 'scale', cssVar: '--verse-scale', min: 50, max: 200, default: 100 },
        { id: 'couplesColor', label: 'Bride & Groom Names Color', type: 'color', cssVar: '--names-color', default: '#f3ecd8', defaultAlpha: 100 },
        { id: 'namesScale', label: 'Names Size', type: 'scale', cssVar: '--names-scale', min: 50, max: 200, default: 100 },
        { id: 'fathersColor', label: 'Fathers Names Color', type: 'color', cssVar: '--fathers-color', default: '#f3ecd8', defaultAlpha: 100 },
        { id: 'fathersScale', label: 'Fathers Size', type: 'scale', cssVar: '--fathers-scale', min: 50, max: 200, default: 100 },
        { id: 'heroSecondaryColor', label: 'Secondary Color (يتشرف / بدعوتكم)', type: 'color', cssVar: '--hero-secondary', default: '#f3ecd8', defaultAlpha: 88 },
        { id: 'heroSecondaryScale', label: 'Secondary Size', type: 'scale', cssVar: '--hero-secondary-scale', min: 50, max: 200, default: 100 },
        { id: 'heroDateColor', label: 'Date Line Color', type: 'color', cssVar: '--hero-date-color', default: '#f3ecd8', defaultAlpha: 90 },
        { id: 'heroDateScale', label: 'Date Line Size', type: 'scale', cssVar: '--hero-date-scale', min: 50, max: 200, default: 100 },
        { id: 'footerColor', label: 'Footer Notice Color', type: 'color', cssVar: '--footer-color', default: '#f3ecd8', defaultAlpha: 100 },
        { id: 'footerScale', label: 'Footer Notice Size', type: 'scale', cssVar: '--footer-scale', min: 50, max: 200, default: 100 }
      ],
      overridable: []
    },
    {
      id: 'timeline',
      label: 'Timeline Section',
      icon: '⏳',
      knobs: [
        { id: 'accentColor', label: 'Timeline Line (Light)', type: 'color', cssVar: '--accent-color', default: '#a3813f', defaultAlpha: 100 },
        { id: 'accentColorDeep', label: 'Timeline Dot (Deep)', type: 'color', cssVar: '--accent-color-deep', default: '#8a6a30', defaultAlpha: 100 },
        { id: 'sectionTitleColor', label: 'Section Title Color', type: 'color', cssVar: '--timeline-title-color', overrides: 'cardTitleColor', default: '#edf2e4', defaultAlpha: 100 },
        { id: 'hourTextColor', label: 'Hour Text Color', type: 'color', cssVar: '--timeline-hour-color', overrides: 'cardTextColor', default: '#edf2e4', defaultAlpha: 100 },
        { id: 'labelTextColor', label: 'Label Text Color', type: 'color', cssVar: '--timeline-label-color', overrides: 'cardTextColor', default: '#556b2f', defaultAlpha: 100 }
      ],
      overridable: ['cardTitleColor', 'cardTextColor']
    },
    {
      id: 'location',
      label: 'Location Section',
      icon: '📍',
      knobs: [
        { id: 'sectionTitleColor', label: 'Section Title Color', type: 'color', cssVar: '--location-title-color', overrides: 'cardTitleColor', default: '#edf2e4', defaultAlpha: 100 },
        { id: 'venueNameColor', label: 'Venue Name Color', type: 'color', cssVar: '--location-venue-color', overrides: 'cardTitleColor', default: '#edf2e4', defaultAlpha: 100 },
        { id: 'venueTimeColor', label: 'Venue Time Color', type: 'color', cssVar: '--location-time-color', overrides: 'cardTextColor', default: '#556b2f', defaultAlpha: 100 }
      ],
      overridable: ['cardTitleColor', 'cardTextColor']
    },
    {
      id: 'rsvp',
      label: 'RSVP Section',
      icon: '💌',
      knobs: [
        { id: 'sectionTitleColor', label: 'Section Title Color', type: 'color', cssVar: '--rsvp-title-color', overrides: 'cardTitleColor', default: '#edf2e4', defaultAlpha: 100 },
        { id: 'questionColor', label: 'Question Color', type: 'color', cssVar: '--rsvp-question-color', overrides: 'cardTitleColor', default: '#edf2e4', defaultAlpha: 100 },
        { id: 'answerColor', label: 'Answer Options Color', type: 'color', cssVar: '--rsvp-answer-color', overrides: 'cardTextColor', default: '#556b2f', defaultAlpha: 100 }
      ],
      overridable: ['cardTitleColor', 'cardTextColor']
    }
  ];

  // ---- SHIPPED PRESET THEMES (Ported from v2-gemini) ----
  var PRESET_THEMES = [
    {
      id: 'sage-gold',
      label: 'Sage & Gold (Default)',
      state: {
        global: {
          bgColor: { hex: '#f4efe3', alpha: 0 },
          bgBlendMode: 'normal',
          bgImage: { preset: 'assets/backgrounds/sage-floral.jpg', dataUrl: null },
          bgPositionY: 50,
          bgParallax: 150,
          cardTitleColor: { hex: '#edf2e4', alpha: 100 },
          cardTextColor: { hex: '#556b2f', alpha: 100 },
          buttonColor: { hex: '#edf2e4', alpha: 100 },
          buttonTextColor: { hex: '#556b2f', alpha: 100 },
          ornamentColor: { hex: '#fff0d1', alpha: 100 },
          displayFont: "'Aref Ruqaa', serif",
          bodyFont: "'Amiri', serif",
          textScale: 100,
          cardTitleSize: 100,
          textShadow: 5,
          ornamentMark: 'star',
          petalsEnabled: true,
          leafColor: '#8a6a30',
          petalColor: '#a3813f',
          cardBackgroundEnabled: true,
          cardColor: '#878787',
          cardAlpha: 20,
          cardBlurEnabled: true,
          cardBlurAmount: 14
        },
        cards: {
          hero: {
            values: {
              bismillahFont: "'Aref Ruqaa', serif",
              bismillahColor: { hex: '#f3ecd8', alpha: 100 },
              bismillahScale: 100,
              kickerColor: { hex: '#f3ecd8', alpha: 100 },
              kickerScale: 100,
              verseColor: { hex: '#f3ecd8', alpha: 95 },
              verseScale: 100,
              couplesColor: { hex: '#f3ecd8', alpha: 100 },
              namesScale: 100,
              fathersColor: { hex: '#f3ecd8', alpha: 100 },
              fathersScale: 100,
              heroSecondaryColor: { hex: '#f3ecd8', alpha: 88 },
              heroSecondaryScale: 100,
              heroDateColor: { hex: '#f3ecd8', alpha: 90 },
              heroDateScale: 100,
              footerColor: { hex: '#f3ecd8', alpha: 100 },
              footerScale: 100
            },
            overrides: {}
          },
          timeline: {
            values: {
              accentColor: { hex: '#a3813f', alpha: 100 },
              accentColorDeep: { hex: '#8a6a30', alpha: 100 },
              sectionTitleColor: { hex: '#edf2e4', alpha: 100 },
              hourTextColor: { hex: '#edf2e4', alpha: 100 },
              labelTextColor: { hex: '#556b2f', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              hourTextColor: true,
              labelTextColor: false
            }
          },
          location: {
            values: {
              sectionTitleColor: { hex: '#edf2e4', alpha: 100 },
              venueNameColor: { hex: '#edf2e4', alpha: 100 },
              venueTimeColor: { hex: '#556b2f', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              venueNameColor: false,
              venueTimeColor: false
            }
          },
          rsvp: {
            values: {
              sectionTitleColor: { hex: '#edf2e4', alpha: 100 },
              questionColor: { hex: '#edf2e4', alpha: 100 },
              answerColor: { hex: '#556b2f', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              questionColor: false,
              answerColor: false
            }
          }
        }
      }
    },
    {
      id: 'classic-burgundy',
      label: 'Classic Burgundy & Ivory',
      state: {
        global: {
          bgColor: { hex: '#361118', alpha: 15 },
          bgBlendMode: 'multiply',
          bgImage: { preset: 'assets/backgrounds/pin2.jpg', dataUrl: null },
          bgPositionY: 30,
          bgParallax: 100,
          cardTitleColor: { hex: '#fdfbf7', alpha: 100 },
          cardTextColor: { hex: '#e4b679', alpha: 100 },
          buttonColor: { hex: '#6B1D2F', alpha: 100 },
          buttonTextColor: { hex: '#ffffff', alpha: 100 },
          ornamentColor: { hex: '#d4af37', alpha: 100 },
          displayFont: "'Aref Ruqaa', serif",
          bodyFont: "'El Messiri', sans-serif",
          textScale: 100,
          cardTitleSize: 105,
          textShadow: 6,
          ornamentMark: 'diamond',
          petalsEnabled: true,
          leafColor: '#6B1D2F',
          petalColor: '#C5A059',
          cardBackgroundEnabled: true,
          cardColor: '#3b0e17',
          cardAlpha: 30,
          cardBlurEnabled: true,
          cardBlurAmount: 16
        },
        cards: {
          hero: {
            values: {
              bismillahFont: "'Aref Ruqaa', serif",
              bismillahColor: { hex: '#fdfbf7', alpha: 100 },
              bismillahScale: 100,
              kickerColor: { hex: '#fdfbf7', alpha: 100 },
              kickerScale: 100,
              verseColor: { hex: '#fdfbf7', alpha: 95 },
              verseScale: 100,
              couplesColor: { hex: '#fdfbf7', alpha: 100 },
              namesScale: 105,
              fathersColor: { hex: '#fdfbf7', alpha: 100 },
              fathersScale: 100,
              heroSecondaryColor: { hex: '#f4ece0', alpha: 90 },
              heroSecondaryScale: 100,
              heroDateColor: { hex: '#fdfbf7', alpha: 100 },
              heroDateScale: 100,
              footerColor: { hex: '#fdfbf7', alpha: 100 },
              footerScale: 100
            },
            overrides: {}
          },
          timeline: {
            values: {
              accentColor: { hex: '#C5A059', alpha: 100 },
              accentColorDeep: { hex: '#6B1D2F', alpha: 100 },
              sectionTitleColor: { hex: '#fdfbf7', alpha: 100 },
              hourTextColor: { hex: '#fdfbf7', alpha: 100 },
              labelTextColor: { hex: '#e4b679', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              hourTextColor: true,
              labelTextColor: false
            }
          },
          location: {
            values: {
              sectionTitleColor: { hex: '#fdfbf7', alpha: 100 },
              venueNameColor: { hex: '#fdfbf7', alpha: 100 },
              venueTimeColor: { hex: '#e4b679', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              venueNameColor: false,
              venueTimeColor: false
            }
          },
          rsvp: {
            values: {
              sectionTitleColor: { hex: '#fdfbf7', alpha: 100 },
              questionColor: { hex: '#fdfbf7', alpha: 100 },
              answerColor: { hex: '#e4b679', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              questionColor: false,
              answerColor: false
            }
          }
        }
      }
    },
    {
      id: 'emerald-night',
      label: 'Emerald & Champagne',
      state: {
        global: {
          bgColor: { hex: '#0a1a12', alpha: 35 },
          bgBlendMode: 'multiply',
          bgImage: { preset: 'assets/backgrounds/sage-hires.png', dataUrl: null },
          bgPositionY: 50,
          bgParallax: 120,
          cardTitleColor: { hex: '#f5eedb', alpha: 100 },
          cardTextColor: { hex: '#a5c4ab', alpha: 100 },
          buttonColor: { hex: '#c5a059', alpha: 100 },
          buttonTextColor: { hex: '#112217', alpha: 100 },
          ornamentColor: { hex: '#f5eedb', alpha: 100 },
          displayFont: "'Aref Ruqaa', serif",
          bodyFont: "'Amiri', serif",
          textScale: 100,
          cardTitleSize: 100,
          textShadow: 7,
          ornamentMark: 'star',
          petalsEnabled: true,
          leafColor: '#2b533b',
          petalColor: '#c5a059',
          cardBackgroundEnabled: true,
          cardColor: '#0f241a',
          cardAlpha: 45,
          cardBlurEnabled: true,
          cardBlurAmount: 18
        },
        cards: {
          hero: {
            values: {
              bismillahFont: "'Aref Ruqaa', serif",
              bismillahColor: { hex: '#f5eedb', alpha: 100 },
              bismillahScale: 100,
              kickerColor: { hex: '#f5eedb', alpha: 100 },
              kickerScale: 100,
              verseColor: { hex: '#f5eedb', alpha: 95 },
              verseScale: 100,
              couplesColor: { hex: '#f5eedb', alpha: 100 },
              namesScale: 100,
              fathersColor: { hex: '#f5eedb', alpha: 100 },
              fathersScale: 100,
              heroSecondaryColor: { hex: '#f5eedb', alpha: 85 },
              heroSecondaryScale: 100,
              heroDateColor: { hex: '#f5eedb', alpha: 100 },
              heroDateScale: 100,
              footerColor: { hex: '#f5eedb', alpha: 100 },
              footerScale: 100
            },
            overrides: {}
          },
          timeline: {
            values: {
              accentColor: { hex: '#c5a059', alpha: 100 },
              accentColorDeep: { hex: '#2b533b', alpha: 100 },
              sectionTitleColor: { hex: '#f5eedb', alpha: 100 },
              hourTextColor: { hex: '#f5eedb', alpha: 100 },
              labelTextColor: { hex: '#a5c4ab', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              hourTextColor: true,
              labelTextColor: false
            }
          },
          location: {
            values: {
              sectionTitleColor: { hex: '#f5eedb', alpha: 100 },
              venueNameColor: { hex: '#f5eedb', alpha: 100 },
              venueTimeColor: { hex: '#a5c4ab', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              venueNameColor: false,
              venueTimeColor: false
            }
          },
          rsvp: {
            values: {
              sectionTitleColor: { hex: '#f5eedb', alpha: 100 },
              questionColor: { hex: '#f5eedb', alpha: 100 },
              answerColor: { hex: '#a5c4ab', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              questionColor: false,
              answerColor: false
            }
          }
        }
      }
    },
    {
      id: 'minimal-pearl',
      label: 'Minimalist Pearl & Charcoal',
      state: {
        global: {
          bgColor: { hex: '#f7f4ed', alpha: 0 },
          bgBlendMode: 'normal',
          bgImage: { preset: '', dataUrl: null },
          bgPositionY: 50,
          bgParallax: 0,
          cardTitleColor: { hex: '#222220', alpha: 100 },
          cardTextColor: { hex: '#66665e', alpha: 100 },
          buttonColor: { hex: '#2b2b28', alpha: 100 },
          buttonTextColor: { hex: '#ffffff', alpha: 100 },
          ornamentColor: { hex: '#8a7960', alpha: 100 },
          displayFont: "'Aref Ruqaa', serif",
          bodyFont: "'Amiri', serif",
          textScale: 100,
          cardTitleSize: 100,
          textShadow: 0,
          ornamentMark: 'square',
          petalsEnabled: false,
          leafColor: '#8a7960',
          petalColor: '#a89980',
          cardBackgroundEnabled: true,
          cardColor: '#ffffff',
          cardAlpha: 70,
          cardBlurEnabled: true,
          cardBlurAmount: 8
        },
        cards: {
          hero: {
            values: {
              bismillahFont: "'Aref Ruqaa', serif",
              bismillahColor: { hex: '#222220', alpha: 100 },
              bismillahScale: 100,
              kickerColor: { hex: '#222220', alpha: 100 },
              kickerScale: 100,
              verseColor: { hex: '#444440', alpha: 100 },
              verseScale: 100,
              couplesColor: { hex: '#222220', alpha: 100 },
              namesScale: 100,
              fathersColor: { hex: '#222220', alpha: 100 },
              fathersScale: 100,
              heroSecondaryColor: { hex: '#555550', alpha: 100 },
              heroSecondaryScale: 100,
              heroDateColor: { hex: '#333330', alpha: 100 },
              heroDateScale: 100,
              footerColor: { hex: '#444440', alpha: 100 },
              footerScale: 100
            },
            overrides: {}
          },
          timeline: {
            values: {
              accentColor: { hex: '#a89980', alpha: 100 },
              accentColorDeep: { hex: '#8a7960', alpha: 100 },
              sectionTitleColor: { hex: '#222220', alpha: 100 },
              hourTextColor: { hex: '#222220', alpha: 100 },
              labelTextColor: { hex: '#66665e', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              hourTextColor: true,
              labelTextColor: false
            }
          },
          location: {
            values: {
              sectionTitleColor: { hex: '#222220', alpha: 100 },
              venueNameColor: { hex: '#222220', alpha: 100 },
              venueTimeColor: { hex: '#66665e', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              venueNameColor: false,
              venueTimeColor: false
            }
          },
          rsvp: {
            values: {
              sectionTitleColor: { hex: '#222220', alpha: 100 },
              questionColor: { hex: '#222220', alpha: 100 },
              answerColor: { hex: '#66665e', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              questionColor: false,
              answerColor: false
            }
          }
        }
      }
    },
    {
      id: 'midnight-velvet',
      label: 'Midnight Sapphire & Gold',
      state: {
        global: {
          bgColor: { hex: '#0b1326', alpha: 45 },
          bgBlendMode: 'multiply',
          bgImage: { preset: 'assets/backgrounds/pintrest1.jpg', dataUrl: null },
          bgPositionY: 40,
          bgParallax: 140,
          cardTitleColor: { hex: '#fff5df', alpha: 100 },
          cardTextColor: { hex: '#8da4c4', alpha: 100 },
          buttonColor: { hex: '#c5a059', alpha: 100 },
          buttonTextColor: { hex: '#0b1326', alpha: 100 },
          ornamentColor: { hex: '#ffd700', alpha: 100 },
          displayFont: "'Aref Ruqaa', serif",
          bodyFont: "'Amiri', serif",
          textScale: 100,
          cardTitleSize: 105,
          textShadow: 8,
          ornamentMark: 'star',
          petalsEnabled: true,
          leafColor: '#1d3557',
          petalColor: '#ffd700',
          cardBackgroundEnabled: true,
          cardColor: '#081020',
          cardAlpha: 50,
          cardBlurEnabled: true,
          cardBlurAmount: 20
        },
        cards: {
          hero: {
            values: {
              bismillahFont: "'Aref Ruqaa', serif",
              bismillahColor: { hex: '#fff5df', alpha: 100 },
              bismillahScale: 100,
              kickerColor: { hex: '#fff5df', alpha: 100 },
              kickerScale: 100,
              verseColor: { hex: '#fff5df', alpha: 95 },
              verseScale: 100,
              couplesColor: { hex: '#fff5df', alpha: 100 },
              namesScale: 105,
              fathersColor: { hex: '#fff5df', alpha: 100 },
              fathersScale: 100,
              heroSecondaryColor: { hex: '#fff5df', alpha: 85 },
              heroSecondaryScale: 100,
              heroDateColor: { hex: '#fff5df', alpha: 100 },
              heroDateScale: 100,
              footerColor: { hex: '#fff5df', alpha: 100 },
              footerScale: 100
            },
            overrides: {}
          },
          timeline: {
            values: {
              accentColor: { hex: '#ffd700', alpha: 100 },
              accentColorDeep: { hex: '#1d3557', alpha: 100 },
              sectionTitleColor: { hex: '#fff5df', alpha: 100 },
              hourTextColor: { hex: '#fff5df', alpha: 100 },
              labelTextColor: { hex: '#8da4c4', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              hourTextColor: true,
              labelTextColor: false
            }
          },
          location: {
            values: {
              sectionTitleColor: { hex: '#fff5df', alpha: 100 },
              venueNameColor: { hex: '#fff5df', alpha: 100 },
              venueTimeColor: { hex: '#8da4c4', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              venueNameColor: false,
              venueTimeColor: false
            }
          },
          rsvp: {
            values: {
              sectionTitleColor: { hex: '#fff5df', alpha: 100 },
              questionColor: { hex: '#fff5df', alpha: 100 },
              answerColor: { hex: '#8da4c4', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              questionColor: false,
              answerColor: false
            }
          }
        }
      }
    },
    {
      id: 'forest-garnet',
      label: 'Forest & Garnet',
      state: {
        global: {
          bgColor: { hex: '#f4efe3', alpha: 0 },
          bgBlendMode: 'normal',
          bgImage: { preset: 'assets/backgrounds/gemini-123123.jpg', dataUrl: null },
          bgPositionY: 14,
          bgParallax: 150,
          cardTitleColor: { hex: '#213300', alpha: 100 },
          cardTextColor: { hex: '#213300', alpha: 100 },
          buttonColor: { hex: '#edf2e4', alpha: 100 },
          buttonTextColor: { hex: '#556b2f', alpha: 100 },
          ornamentColor: { hex: '#86131f', alpha: 100 },
          displayFont: "'Aref Ruqaa', serif",
          bodyFont: "'Amiri', serif",
          textScale: 100,
          cardTitleSize: 100,
          textShadow: 5,
          ornamentMark: 'star',
          petalsEnabled: true,
          leafColor: '#8a6a30',
          petalColor: '#a3813f',
          cardBackgroundEnabled: true,
          cardColor: '#878787',
          cardAlpha: 20,
          cardBlurEnabled: true,
          cardBlurAmount: 14
        },
        cards: {
          hero: {
            values: {
              bismillahFont: "'Aref Ruqaa', serif",
              bismillahColor: { hex: '#213300', alpha: 100 },
              bismillahScale: 100,
              kickerColor: { hex: '#213300', alpha: 100 },
              kickerScale: 100,
              verseColor: { hex: '#213300', alpha: 95 },
              verseScale: 100,
              couplesColor: { hex: '#213300', alpha: 100 },
              namesScale: 100,
              fathersColor: { hex: '#213300', alpha: 100 },
              fathersScale: 100,
              heroSecondaryColor: { hex: '#213300', alpha: 88 },
              heroSecondaryScale: 100,
              heroDateColor: { hex: '#213300', alpha: 90 },
              heroDateScale: 100,
              footerColor: { hex: '#213300', alpha: 100 },
              footerScale: 100
            },
            overrides: {}
          },
          timeline: {
            values: {
              accentColor: { hex: '#a3813f', alpha: 100 },
              accentColorDeep: { hex: '#8a6a30', alpha: 100 },
              sectionTitleColor: { hex: '#213300', alpha: 100 },
              hourTextColor: { hex: '#213300', alpha: 100 },
              labelTextColor: { hex: '#213300', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              hourTextColor: true,
              labelTextColor: false
            }
          },
          location: {
            values: {
              sectionTitleColor: { hex: '#213300', alpha: 100 },
              venueNameColor: { hex: '#213300', alpha: 100 },
              venueTimeColor: { hex: '#213300', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              venueNameColor: false,
              venueTimeColor: false
            }
          },
          rsvp: {
            values: {
              sectionTitleColor: { hex: '#213300', alpha: 100 },
              questionColor: { hex: '#213300', alpha: 100 },
              answerColor: { hex: '#213300', alpha: 100 }
            },
            overrides: {
              sectionTitleColor: false,
              questionColor: false,
              answerColor: false
            }
          }
        }
      }
    }
  ];

  global.StyleSchema = {
    FONT_OPTIONS: FONT_OPTIONS,
    BG_PRESETS: BG_PRESETS,
    BLEND_MODES: BLEND_MODES,
    ORNAMENT_MARKS: ORNAMENT_MARKS,
    GLOBAL_KNOBS: GLOBAL_KNOBS,
    CARDS: CARDS,
    PRESET_THEMES: PRESET_THEMES
  };
})(window);
