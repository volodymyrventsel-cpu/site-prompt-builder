(function (global) {
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(base, patch) {
    var out = clone(base);
    Object.keys(patch || {}).forEach(function (key) {
      var srcVal = out[key];
      var patchVal = patch[key];
      if (
        srcVal &&
        patchVal &&
        typeof srcVal === 'object' &&
        typeof patchVal === 'object' &&
        !Array.isArray(srcVal) &&
        !Array.isArray(patchVal)
      ) {
        out[key] = deepMerge(srcVal, patchVal);
      } else {
        out[key] = patchVal;
      }
    });
    return out;
  }

  function normalizeHex(hex) {
    if (!hex || typeof hex !== 'string') return null;
    var h = hex.trim().toUpperCase();
    if (/^#[0-9A-F]{3}$/.test(h)) {
      return '#' + h.slice(1).split('').map(function (ch) { return ch + ch; }).join('');
    }
    if (/^#[0-9A-F]{6}$/.test(h)) return h;
    if (/^#[0-9A-F]{8}$/.test(h)) return h.slice(0, 7);
    return null;
  }

  function hexToRgb(hex) {
    var n = normalizeHex(hex);
    if (!n) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(n.slice(1, 3), 16),
      g: parseInt(n.slice(3, 5), 16),
      b: parseInt(n.slice(5, 7), 16)
    };
  }

  function hexToRgba(hex, alpha) {
    var rgb = hexToRgb(hex);
    return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha + ')';
  }

  function luminance(hex) {
    var rgb = hexToRgb(hex);
    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
  }

  function inferDark(colors, styleHints) {
    styleHints = styleHints || [];
    if (styleHints.some(function (h) { return /т[её]мн/i.test(h); })) return true;
    if (styleHints.some(function (h) { return /светл/i.test(h); })) return false;
    var bg = colors.background || '#0D0F14';
    return luminance(bg) < 120;
  }

  var DEFAULT_THEME = {
    version: 'v7-alpha',
    meta: {
      source: 'default',
      extractedAt: new Date().toISOString()
    },
    styleHints: [],
    tokens: {
      colors: {
        background: '#0D0F14',
        surface: '#141720',
        surfaceAlt: '#1C2030',
        border: '#252A3A',
        textPrimary: '#E8EAF2',
        textMuted: '#6A7390',
        accent: '#4F8EFF',
        accentSecondary: '#7C5CFC'
      },
      typography: {
        displayFont: 'Syne',
        bodyFont: 'DM Sans',
        heroWeight: '800',
        headingWeight: '700',
        bodyWeight: '400'
      },
      shape: {
        buttonRadius: '12px',
        cardRadius: '20px',
        inputRadius: '12px'
      },
      shadow: {
        card: '0 12px 28px rgba(0,0,0,0.20)',
        button: '0 10px 20px rgba(0,0,0,0.16)'
      },
      motion: {
        durationFast: '160ms',
        durationBase: '260ms',
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      spacing: {
        sectionY: '96px',
        containerMax: '1280px'
      }
    },
    components: {
      buttonPrimary: {
        background: '#4F8EFF',
        text: '#FFFFFF',
        border: '1px solid transparent',
        hoverBackground: '#3D7CF0',
        radius: '12px'
      },
      buttonSecondary: {
        background: 'transparent',
        text: '#E8EAF2',
        border: '1px solid rgba(255,255,255,0.16)',
        hoverBackground: 'rgba(255,255,255,0.05)',
        radius: '12px'
      },
      card: {
        background: '#141720',
        border: '1px solid #252A3A',
        radius: '20px'
      },
      input: {
        background: '#141720',
        text: '#E8EAF2',
        border: '1px solid #252A3A',
        radius: '12px',
        placeholder: '#6A7390'
      }
    }
  };

  function createThemeFromAnalysis(opts) {
    opts = opts || {};
    var palette = opts.palette || {};
    var styleHints = opts.styleHints || [];
    var dark = inferDark(palette, styleHints);

    var minimal = styleHints.some(function (h) { return /минимал/i.test(h); });
    var premium = styleHints.some(function (h) { return /премиум|люкс/i.test(h); });
    var bold = styleHints.some(function (h) { return /bold|dynamic|динам/i.test(h); });

    var colors = {
      background: normalizeHex(palette.background) || (dark ? '#0D0F14' : '#F7F8FC'),
      surface: normalizeHex(palette.surface) || (dark ? '#141720' : '#FFFFFF'),
      surfaceAlt: normalizeHex(palette.surfaceAlt) || (dark ? '#1C2030' : '#EEF1F7'),
      border: normalizeHex(palette.border) || (dark ? '#252A3A' : '#D8DFEA'),
      textPrimary: normalizeHex(palette.textPrimary) || (dark ? '#E8EAF2' : '#131722'),
      textMuted: normalizeHex(palette.textMuted) || (dark ? '#6A7390' : '#6B7280'),
      accent: normalizeHex(palette.accent) || '#4F8EFF',
      accentSecondary: normalizeHex(palette.accentSecondary) || '#7C5CFC'
    };

    var buttonRadius = premium ? '16px' : minimal ? '10px' : bold ? '14px' : '12px';
    var cardRadius = premium ? '24px' : minimal ? '16px' : '20px';
    var inputRadius = minimal ? '10px' : '12px';
    var cardShadow = minimal
      ? '0 8px 18px rgba(0,0,0,0.14)'
      : premium
      ? '0 18px 40px rgba(0,0,0,0.24)'
      : '0 12px 28px rgba(0,0,0,0.20)';

    return normalizeTheme({
      meta: {
        source: 'analysis-v7',
        extractedAt: new Date().toISOString(),
        report: opts.analysisMeta || {}
      },
      styleHints: styleHints,
      tokens: {
        colors: colors,
        typography: {
          displayFont: opts.displayFont || 'Syne',
          bodyFont: opts.bodyFont || 'DM Sans',
          heroWeight: bold ? '900' : '800',
          headingWeight: bold ? '800' : '700',
          bodyWeight: '400'
        },
        shape: {
          buttonRadius: buttonRadius,
          cardRadius: cardRadius,
          inputRadius: inputRadius
        },
        shadow: {
          card: cardShadow,
          button: premium ? '0 14px 28px rgba(0,0,0,0.18)' : '0 10px 20px rgba(0,0,0,0.16)'
        },
        motion: {
          durationFast: minimal ? '120ms' : '160ms',
          durationBase: premium ? '320ms' : '260ms',
          easing: premium ? 'cubic-bezier(0.19, 1, 0.22, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)'
        },
        spacing: {
          sectionY: premium ? '112px' : '96px',
          containerMax: '1280px'
        }
      },
      components: {
        buttonPrimary: {
          background: colors.accent,
          text: '#FFFFFF',
          border: '1px solid transparent',
          hoverBackground: colors.accentSecondary,
          radius: buttonRadius
        },
        buttonSecondary: {
          background: 'transparent',
          text: colors.textPrimary,
          border: '1px solid ' + hexToRgba(colors.border, 0.9),
          hoverBackground: hexToRgba(colors.textPrimary, 0.05),
          radius: buttonRadius
        },
        card: {
          background: colors.surface,
          border: '1px solid ' + colors.border,
          radius: cardRadius
        },
        input: {
          background: colors.surface,
          text: colors.textPrimary,
          border: '1px solid ' + colors.border,
          radius: inputRadius,
          placeholder: colors.textMuted
        }
      }
    });
  }

  function normalizeTheme(theme) {
    return deepMerge(DEFAULT_THEME, theme || {});
  }

  function buildPreviewVars(theme) {
    theme = normalizeTheme(theme);
    return {
      '--ref-bg': theme.tokens.colors.background,
      '--ref-surface': theme.tokens.colors.surface,
      '--ref-surface-alt': theme.tokens.colors.surfaceAlt,
      '--ref-border': theme.tokens.colors.border,
      '--ref-text': theme.tokens.colors.textPrimary,
      '--ref-muted': theme.tokens.colors.textMuted,
      '--ref-accent': theme.tokens.colors.accent,
      '--ref-accent-2': theme.tokens.colors.accentSecondary,
      '--ref-display-font': "'" + theme.tokens.typography.displayFont + "', serif",
      '--ref-body-font': "'" + theme.tokens.typography.bodyFont + "', sans-serif",
      '--ref-button-radius': theme.tokens.shape.buttonRadius,
      '--ref-card-radius': theme.tokens.shape.cardRadius,
      '--ref-input-radius': theme.tokens.shape.inputRadius,
      '--ref-card-shadow': theme.tokens.shadow.card,
      '--ref-button-shadow': theme.tokens.shadow.button,
      '--ref-fast': theme.tokens.motion.durationFast,
      '--ref-base': theme.tokens.motion.durationBase,
      '--ref-easing': theme.tokens.motion.easing
    };
  }

  function applyVarsToElement(el, vars) {
    if (!el || !vars) return;
    Object.keys(vars).forEach(function (key) {
      el.style.setProperty(key, vars[key]);
    });
  }

  function themeToJson(theme) {
    return JSON.stringify(normalizeTheme(theme), null, 2);
  }

  global.ThemeSystem = {
    DEFAULT_THEME: DEFAULT_THEME,
    normalizeTheme: normalizeTheme,
    createThemeFromAnalysis: createThemeFromAnalysis,
    buildPreviewVars: buildPreviewVars,
    applyVarsToElement: applyVarsToElement,
    themeToJson: themeToJson,
    normalizeHex: normalizeHex,
    hexToRgb: hexToRgb,
    hexToRgba: hexToRgba,
    luminance: luminance
  };
})(window);
