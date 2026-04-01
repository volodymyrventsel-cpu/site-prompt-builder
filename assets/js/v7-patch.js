(function (global) {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function uniq(arr) {
    return Array.from(new Set(arr || []));
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function safeToast(msg) {
    if (typeof global.toast === 'function') {
      global.toast(msg);
    } else {
      console.log('[v7]', msg);
    }
  }

  function getThemeSystem() {
    if (global.ThemeSystem) return global.ThemeSystem;

    var FALLBACK_THEME = {
      colors: {
        bg: '#0D0F14',
        surface: '#141720',
        surfaceAlt: '#1C2030',
        text: '#E8EAF2',
        muted: '#6A7390',
        accent: '#4F8EFF',
        border: '#252A3A'
      },
      typography: {
        display: 'Syne',
        body: 'DM Sans'
      },
      shapes: {
        buttonRadius: '12px',
        cardRadius: '20px',
        inputRadius: '12px'
      },
      shadows: {
        card: '0 12px 28px rgba(0,0,0,0.20)',
        button: '0 10px 20px rgba(0,0,0,0.16)'
      },
      motion: {
        fast: '160ms',
        base: '260ms',
        easing: 'cubic-bezier(0.22,1,0.36,1)'
      },
      spacing: {
        sectionY: '96px'
      },
      meta: {
        source: 'fallback'
      }
    };

    function normalizeTheme(input) {
      var out = deepClone(FALLBACK_THEME);
      input = input || {};

      if (input.colors) Object.assign(out.colors, input.colors);
      if (input.typography) Object.assign(out.typography, input.typography);
      if (input.shapes) Object.assign(out.shapes, input.shapes);
      if (input.shadows) Object.assign(out.shadows, input.shadows);
      if (input.motion) Object.assign(out.motion, input.motion);
      if (input.spacing) Object.assign(out.spacing, input.spacing);
      if (input.meta) Object.assign(out.meta, input.meta);

      return out;
    }

    function createThemeFromAnalysis(data) {
      data = data || {};
      var palette = data.palette || {};
      var t = normalizeTheme({});

      t.colors.bg = palette.background || palette.bg || t.colors.bg;
      t.colors.surface = palette.surface || t.colors.surface;
      t.colors.surfaceAlt = palette.surfaceAlt || palette.surface_alt || t.colors.surfaceAlt;
      t.colors.text = palette.text || palette.tx || t.colors.text;
      t.colors.muted = palette.muted || palette.m1 || t.colors.muted;
      t.colors.accent = palette.accent || palette.ac || t.colors.accent;
      t.colors.border = palette.border || palette.bd || t.colors.border;

      if (data.displayFont) t.typography.display = data.displayFont;
      if (data.bodyFont) t.typography.body = data.bodyFont;

      t.meta = {
        source: 'analysis',
        styleHints: data.styleHints || [],
        analysisMeta: data.analysisMeta || {}
      };

      return t;
    }

    function buildPreviewVars(theme) {
      theme = normalizeTheme(theme);
      return {
        '--ref-bg': theme.colors.bg,
        '--ref-surface': theme.colors.surface,
        '--ref-surface-alt': theme.colors.surfaceAlt,
        '--ref-text': theme.colors.text,
        '--ref-muted': theme.colors.muted,
        '--ref-accent': theme.colors.accent,
        '--ref-border': theme.colors.border,
        '--ref-display-font': '"' + theme.typography.display + '"',
        '--ref-body-font': '"' + theme.typography.body + '"',
        '--ref-button-radius': theme.shapes.buttonRadius,
        '--ref-card-radius': theme.shapes.cardRadius,
        '--ref-input-radius': theme.shapes.inputRadius,
        '--ref-card-shadow': theme.shadows.card,
        '--ref-button-shadow': theme.shadows.button,
        '--ref-fast': theme.motion.fast,
        '--ref-base': theme.motion.base,
        '--ref-easing': theme.motion.easing
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

    return {
      DEFAULT_THEME: FALLBACK_THEME,
      normalizeTheme: normalizeTheme,
      createThemeFromAnalysis: createThemeFromAnalysis,
      buildPreviewVars: buildPreviewVars,
      applyVarsToElement: applyVarsToElement,
      themeToJson: themeToJson
    };
  }

  var TS = getThemeSystem();

  function getSelectedDisplayFont() {
    var sel = document.getElementById('sel-disp-font');
    if (sel && sel.value) return sel.value;

    var approved = (global.S && global.S.approvedFonts || []).find(function (f) {
      return f.role === 'display';
    });
    if (approved) return approved.name;

    if (global.S && global.S._dispPool && global.S._dispPool.length) return global.S._dispPool[0];
    return 'Syne';
  }

  function getSelectedBodyFont() {
    var sel = document.getElementById('sel-body-font');
    if (sel && sel.value) return sel.value;

    var approved = (global.S && global.S.approvedFonts || []).find(function (f) {
      return f.role === 'body';
    });
    if (approved) return approved.name;

    if (global.S && global.S._bodyPool && global.S._bodyPool.length) return global.S._bodyPool[0];
    return 'DM Sans';
  }

  function ensurePatchStyles() {
    if (document.getElementById('v7-patch-styles')) return;

    var style = document.createElement('style');
    style.id = 'v7-patch-styles';
    style.textContent = `
      .v7-box{background:var(--s2);border:1px solid var(--bd);border-radius:var(--r);padding:12px;color:var(--tx);font-size:11px;line-height:1.6}
      .v7-url-item{padding:10px 12px;border:1px solid var(--bd);border-radius:8px;background:var(--s1);margin-bottom:8px}
      .v7-url-item:last-child{margin-bottom:0}
      .v7-url-top{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap}
      .v7-url-title{font-family:'DM Mono',monospace;font-size:10px;color:var(--tx);word-break:break-all}
      .v7-badges{display:flex;gap:6px;flex-wrap:wrap}
      .v7-badge{font-family:'DM Mono',monospace;font-size:9px;padding:2px 7px;border-radius:999px;border:1px solid var(--bd2);color:var(--m2);background:var(--bd)}
      .v7-badge.ok{color:var(--grn);border-color:#3ecf8e40;background:#3ecf8e10}
      .v7-badge.warn{color:#e6b840;border-color:#f0c04040;background:#f0c04010}
      .v7-badge.err{color:var(--red);border-color:#f0606040;background:#f0606010}
      .v7-mini{font-size:10px;color:var(--m2);margin-top:6px;white-space:pre-wrap}
      .v7-theme-json{width:100%;min-height:240px;resize:vertical;background:var(--s2);border:1px solid var(--bd);border-radius:var(--r);padding:12px;color:#A0A8C0;font-family:'DM Mono',monospace;font-size:9px;line-height:1.7;outline:none}
      .v7-theme-json:focus{border-color:var(--ac)}
      .theme-samples-wrap{margin-bottom:18px}
      .theme-samples-title{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--m1);margin-bottom:8px}
      .theme-samples{display:grid;grid-template-columns:1fr;gap:10px}
      .theme-card-sample{border-radius:var(--ref-card-radius,20px);border:1px solid var(--ref-border,#252A3A);background:var(--ref-surface,#141720);box-shadow:var(--ref-card-shadow,0 12px 28px rgba(0,0,0,0.2));padding:14px;transition:all var(--ref-base,260ms) var(--ref-easing,ease)}
      .theme-card-kicker{font-family:'DM Mono',monospace;font-size:9px;color:var(--ref-accent,#4F8EFF);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em}
      .theme-card-title{font-family:var(--ref-display-font,'Syne',serif);font-size:16px;line-height:1.2;color:var(--ref-text,#E8EAF2);margin-bottom:6px}
      .theme-card-body{font-family:var(--ref-body-font,'DM Sans',sans-serif);font-size:12px;line-height:1.6;color:var(--ref-muted,#6A7390);margin-bottom:10px}
      .theme-btn-row{display:flex;gap:8px;flex-wrap:wrap}
      .theme-btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;font-size:11px;font-family:var(--ref-body-font,'DM Sans',sans-serif);font-weight:600;border-radius:var(--ref-button-radius,12px);transition:all var(--ref-fast,160ms) var(--ref-easing,ease);cursor:pointer}
      .theme-btn.primary{background:var(--ref-accent,#4F8EFF);color:#fff;border:1px solid transparent;box-shadow:var(--ref-button-shadow,0 10px 20px rgba(0,0,0,0.16))}
      .theme-btn.secondary{background:transparent;color:var(--ref-text,#E8EAF2);border:1px solid var(--ref-border,#252A3A)}
      .theme-input{width:100%;margin-top:10px;border-radius:var(--ref-input-radius,12px);border:1px solid var(--ref-border,#252A3A);background:var(--ref-surface,#141720);color:var(--ref-text,#E8EAF2);padding:10px 12px;font-size:12px;outline:none}
      .studio-preview.themed-preview{background:var(--ref-bg,#0D0F14)!important;border-color:var(--ref-border,#252A3A)!important}
      .studio-preview.themed-preview .preview-header-bar{background:var(--ref-surface-alt,#1C2030)!important;border-bottom-color:var(--ref-border,#252A3A)!important}
      .studio-preview.themed-preview .phb-url{background:var(--ref-surface,#141720)!important}
      .studio-preview.themed-preview .phb-url span{color:var(--ref-muted,#6A7390)!important}
      .studio-preview.themed-preview .preview-block{background:var(--ref-surface,#141720)!important;border-color:var(--ref-border,#252A3A)!important;color:var(--ref-text,#E8EAF2)!important;box-shadow:var(--ref-card-shadow,0 12px 28px rgba(0,0,0,0.20))}
      .studio-preview.themed-preview .pb-name{font-family:var(--ref-display-font,'Syne',serif)!important;color:var(--ref-text,#E8EAF2)!important}
      .studio-preview.themed-preview .pb-variant{color:var(--ref-muted,#6A7390)!important;font-family:'DM Mono',monospace}
      .studio-preview.themed-preview .pb-change{border-color:var(--ref-border,#252A3A)!important;color:var(--ref-text,#E8EAF2)!important;background:var(--ref-surface-alt,#1C2030)!important}
      .studio-preview.themed-preview .pb-toggle.on{color:var(--ref-accent,#4F8EFF)!important;border-color:var(--ref-accent,#4F8EFF)!important}
      .studio-preview.themed-preview .pb-toggle.off{color:#f06060!important;border-color:#f06060!important}
    `;
    document.head.appendChild(style);
  }

  function ensureState() {
    global.S = global.S || {};

    if (!global.S.palette) {
      global.S.palette = {
        background: '#0D0F14',
        surface: '#141720',
        surfaceAlt: '#1C2030',
        accent: '#4F8EFF',
        text: '#E8EAF2',
        muted: '#6A7390',
        border: '#252A3A'
      };
    }

    if (!global.S.analysisReport) {
      global.S.analysisReport = {
        imageCount: 0,
        urlReports: [],
        usedFallback: false,
        totalColors: 0,
        totalFonts: 0,
        styleHints: [],
        urls: []
      };
    }

    if (!global.S.theme) {
      global.S.theme = TS.createThemeFromAnalysis({
        palette: global.S.palette || {},
        displayFont: getSelectedDisplayFont(),
        bodyFont: getSelectedBodyFont(),
        styleHints: []
      });
    }
  }

  function ensureAnalysisPanels() {
    var body = document.querySelector('#rbox .rb-body');
    if (!body || document.getElementById('v7-analysis-panels')) return;

    var wrapper = document.createElement('div');
    wrapper.id = 'v7-analysis-panels';
    wrapper.innerHTML = `
      <div class="rb-sec">
        <div class="rb-sec-t">Диагностика URL-анализа</div>
        <div class="v7-box" id="v7-diagnostics-box">Пока ещё нет данных анализа.</div>
      </div>
      <div class="rb-sec">
        <div class="rb-sec-t">
          Theme JSON
          <span style="display:flex;gap:8px;">
            <button class="copybtn" type="button" onclick="copyThemeJson()">Copy JSON</button>
            <button class="copybtn" type="button" onclick="importThemeJson()">Import JSON</button>
          </span>
        </div>
        <textarea id="v7-theme-json" class="v7-theme-json" spellcheck="false"></textarea>
      </div>
    `;

    body.insertBefore(wrapper, body.lastElementChild);
  }

  function ensureStudioSamples() {
    var studioLeft = document.querySelector('.studio-left');
    if (!studioLeft || document.getElementById('v7-theme-samples-wrap')) return;

    var stepNav = studioLeft.querySelector('.step-nav');
    var wrapper = document.createElement('div');
    wrapper.id = 'v7-theme-samples-wrap';
    wrapper.className = 'theme-samples-wrap';
    wrapper.innerHTML = `
      <div class="theme-samples-title">Компоненты темы</div>
      <div class="theme-samples" id="v7-theme-samples"></div>
    `;

    studioLeft.insertBefore(wrapper, stepNav);
  }

  function derivePaletteFromColorList(colors) {
    colors = uniq(colors).filter(Boolean);

    return {
      background: colors[0] || '#0D0F14',
      surface: colors[1] || colors[0] || '#141720',
      surfaceAlt: colors[2] || colors[1] || '#1C2030',
      accent: colors[3] || colors[0] || '#4F8EFF',
      text: colors[4] || '#E8EAF2',
      muted: colors[5] || '#6A7390',
      border: colors[6] || colors[2] || '#252A3A'
    };
  }

  function hasUsefulPalette(palette) {
    if (!palette) return false;
    var values = Object.values(palette).filter(Boolean);
    return values.length >= 4;
  }

  function mergeUrlAnalysisIntoState(urlReports) {
    ensureState();

    urlReports = urlReports || [];

    var allFonts = uniq(
      urlReports.flatMap(function (r) {
        return (r && r.fonts) || [];
      })
    );

    var allColors = uniq(
      urlReports.flatMap(function (r) {
        return (r && r.colors) || [];
      })
    );

    if (allFonts.length) {
      global.S._dispPool = uniq(allFonts.concat(global.S._dispPool || [])).slice(0, 12);
      global.S._bodyPool = uniq(allFonts.concat(global.S._bodyPool || [])).slice(0, 12);

      if (typeof global.renderFontCards === 'function') {
        try { global.renderFontCards(); } catch (e) {}
      }
    }

    if (allColors.length && !hasUsefulPalette(global.S.palette)) {
      global.S.palette = derivePaletteFromColorList(allColors);
    }

    global.S.analysisReport = global.S.analysisReport || {};
    global.S.analysisReport.urlReports = urlReports;
    global.S.analysisReport.totalColors = allColors.length;
    global.S.analysisReport.totalFonts = allFonts.length;
  }

  function renderDiagnostics() {
    ensureAnalysisPanels();

    var box = document.getElementById('v7-diagnostics-box');
    if (!box) return;

    var report = global.S.analysisReport || {};
    var urlReports = report.urlReports || [];

    if (!urlReports.length) {
      box.innerHTML = `
        <div><strong>URL-анализ пока не запускался.</strong></div>
        <div class="v7-mini">После запуска анализа здесь появится честная диагностика: HTML, CSS, количество найденных цветов, шрифтов, предупреждения и ошибки.</div>
      `;
      return;
    }

    box.innerHTML = urlReports.map(function (item) {
      item = item || {};

      var warnHtml = (item.warnings || []).length
        ? '<div class="v7-mini">Warnings: ' + item.warnings.join(' | ') + '</div>'
        : '';

      var errHtml = (item.errors || []).length
        ? '<div class="v7-mini" style="color:#f09090;">Errors: ' + item.errors.join(' | ') + '</div>'
        : '';

      return `
        <div class="v7-url-item">
          <div class="v7-url-top">
            <div class="v7-url-title">${item.url || '—'}</div>
            <div class="v7-badges">
              <span class="v7-badge ${item.ok ? 'ok' : 'err'}">${item.ok ? 'OK' : 'FAIL'}</span>
              <span class="v7-badge ${item.htmlFetched ? 'ok' : 'err'}">HTML: ${item.htmlFetched ? 'yes' : 'no'}</span>
              <span class="v7-badge ${item.cssFetchedCount ? 'ok' : 'warn'}">CSS: ${item.cssFetchedCount || 0}/${item.cssLinksDiscovered || 0}</span>
              <span class="v7-badge ${(item.colors && item.colors.length) ? 'ok' : 'warn'}">Colors: ${(item.colors || []).length}</span>
              <span class="v7-badge ${(item.fonts && item.fonts.length) ? 'ok' : 'warn'}">Fonts: ${(item.fonts || []).length}</span>
            </div>
          </div>
          <div class="v7-mini">Fetch: ${item.htmlVia || '—'}${item.cssFiles && item.cssFiles.length ? ' · CSS files loaded: ' + item.cssFiles.length : ''}</div>
          ${warnHtml}
          ${errHtml}
        </div>
      `;
    }).join('') + `
      <div class="v7-mini" style="margin-top:10px;">Summary: totalColors=${report.totalColors || 0}, totalFonts=${report.totalFonts || 0}, fallback=${report.usedFallback ? 'yes' : 'no'}</div>
    `;
  }

  function renderThemeJson() {
    ensureAnalysisPanels();

    var ta = document.getElementById('v7-theme-json');
    if (!ta) return;

    ta.value = TS.themeToJson(global.S.theme || TS.DEFAULT_THEME);
  }

  function applyThemeToStudio() {
    ensureState();

    var theme = global.S.theme || TS.DEFAULT_THEME;
    var vars = TS.buildPreviewVars(theme);

    var preview = document.querySelector('.studio-preview');
    if (preview) {
      preview.classList.add('themed-preview');
      TS.applyVarsToElement(preview, vars);
    }

    var sampleWrap = document.getElementById('v7-theme-samples');
    if (sampleWrap) {
      TS.applyVarsToElement(sampleWrap, vars);
    }
  }

  function renderThemeSamples() {
    ensureStudioSamples();

    var wrap = document.getElementById('v7-theme-samples');
    if (!wrap) return;

    var theme = global.S.theme || TS.DEFAULT_THEME;
    var vars = TS.buildPreviewVars(theme);

    TS.applyVarsToElement(wrap, vars);

    wrap.innerHTML = `
      <div class="theme-card-sample">
        <div class="theme-card-kicker">reference style</div>
        <div class="theme-card-title">Ваша структура в визуальном языке референса</div>
        <div class="theme-card-body">Здесь показывается, как будет выглядеть карточка, кнопки и поле формы после наложения новой темы.</div>
        <div class="theme-btn-row">
          <button class="theme-btn primary" type="button">Primary CTA</button>
          <button class="theme-btn secondary" type="button">Secondary</button>
        </div>
        <input class="theme-input" type="text" placeholder="Email / input style preview" />
      </div>
    `;
  }

  function syncThemeFromState(extraMeta) {
    ensureState();

    global.S.theme = TS.createThemeFromAnalysis({
      palette: global.S.palette || {},
      displayFont: getSelectedDisplayFont(),
      bodyFont: getSelectedBodyFont(),
      styleHints: (typeof global.getStyles === 'function' ? global.getStyles() : []) || [],
      analysisMeta: extraMeta || global.S.analysisReport || {}
    });

    global.S.theme = TS.normalizeTheme(global.S.theme);

    renderThemeJson();
    renderThemeSamples();
    applyThemeToStudio();
  }

  async function analyzeReferenceUrls(urls) {
    if (!urls || !urls.length) return [];
    if (!global.StyleExtractor || typeof global.StyleExtractor.extractFromUrl !== 'function') {
      return urls.map(function (url) {
        return {
          url: url,
          ok: false,
          htmlFetched: false,
          htmlVia: 'none',
          cssFetchedCount: 0,
          cssLinksDiscovered: 0,
          cssFiles: [],
          fonts: [],
          colors: [],
          warnings: ['StyleExtractor is not available'],
          errors: ['StyleExtractor.extractFromUrl not found']
        };
      });
    }

    var jobs = urls.map(async function (url) {
      try {
        var r = await global.StyleExtractor.extractFromUrl(url);
        return Object.assign({
          url: url,
          ok: false,
          htmlFetched: false,
          htmlVia: 'unknown',
          cssFetchedCount: 0,
          cssLinksDiscovered: 0,
          cssFiles: [],
          fonts: [],
          colors: [],
          warnings: [],
          errors: []
        }, r || {});
      } catch (e) {
        return {
          url: url,
          ok: false,
          htmlFetched: false,
          htmlVia: 'error',
          cssFetchedCount: 0,
          cssLinksDiscovered: 0,
          cssFiles: [],
          fonts: [],
          colors: [],
          warnings: [],
          errors: [e.message || 'Unknown extract error']
        };
      }
    });

    return Promise.all(jobs);
  }

  global.copyThemeJson = async function () {
    var ta = document.getElementById('v7-theme-json');
    if (!ta) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ta.value || '');
      } else {
        ta.select();
        document.execCommand('copy');
      }
      safeToast('Theme JSON copied');
    } catch (e) {
      console.error('copyThemeJson error:', e);
      safeToast('Copy failed');
    }
  };

  global.importThemeJson = function () {
    try {
      ensureState();

      var ta = document.getElementById('v7-theme-json');
      if (!ta) return;

      var raw = (ta.value || '').trim();
      if (!raw) {
        safeToast('Theme JSON is empty');
        return;
      }

      var parsed = JSON.parse(raw);
      var normalized = TS.normalizeTheme(parsed);

      global.S.theme = normalized;
      global.S.analysisReport = global.S.analysisReport || {};
      global.S.analysisReport.importedFromJson = true;

      renderThemeJson();
      renderThemeSamples();
      applyThemeToStudio();

      if (typeof global.renderAnalysisResult === 'function') {
        try { global.renderAnalysisResult(); } catch (e) {}
      }

      if (typeof global.renderPreview === 'function') {
        try { global.renderPreview(); } catch (e) {}
      }

      safeToast('Theme imported');
    } catch (e) {
      console.error('importThemeJson error:', e);
      safeToast('Invalid Theme JSON');
      alert('Invalid Theme JSON: ' + e.message);
    }
  };

  function bindThemeUi() {
    ['sel-disp-font', 'sel-body-font'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.__v7Bound) return;

      el.addEventListener('change', function () {
        syncThemeFromState(global.S.analysisReport || {});
      });

      el.__v7Bound = true;
    });
  }

  function patchColorUpdater(fnName) {
    if (!global[fnName] || global[fnName].__v7Patched) return;

    var original = global[fnName];

    var wrapped = function () {
      var result = original.apply(this, arguments);
      try {
        syncThemeFromState(global.S.analysisReport || {});
      } catch (e) {
        console.error(fnName + ' patch error:', e);
      }
      return result;
    };

    wrapped.__v7Patched = true;
    global[fnName] = wrapped;
  }

  function patchRunAnalysis() {
    if (!global.runAnalysis || global.runAnalysis.__v7Patched) return;

    var original = global.runAnalysis;

    var wrapped = async function () {
      ensureState();

      var urls = (typeof global.getUrls === 'function' ? global.getUrls() : []) || [];
      var styleHints = (typeof global.getStyles === 'function' ? global.getStyles() : []) || [];

      var result = await original.apply(this, arguments);

      try {
        var urlReports = await analyzeReferenceUrls(urls);

        global.S.analysisReport = global.S.analysisReport || {};
        global.S.analysisReport.urls = urls;
        global.S.analysisReport.styleHints = styleHints;
        global.S.analysisReport.urlReports = urlReports;

        mergeUrlAnalysisIntoState(urlReports);

        global.S.analysisReport.usedFallback = !urlReports.some(function (r) {
          return (r.colors && r.colors.length) || (r.fonts && r.fonts.length);
        });

        if (!hasUsefulPalette(global.S.palette)) {
          var allColors = uniq(urlReports.flatMap(function (r) {
            return (r && r.colors) || [];
          }));
          if (allColors.length) {
            global.S.palette = derivePaletteFromColorList(allColors);
          }
        }

        syncThemeFromState(global.S.analysisReport);
        renderDiagnostics();
        renderThemeJson();
        renderThemeSamples();
        applyThemeToStudio();
      } catch (e) {
        console.error('patchRunAnalysis post-hook error:', e);
      }

      return result;
    };

    wrapped.__v7Patched = true;
    global.runAnalysis = wrapped;
  }

  global.renderThemeJson = renderThemeJson;
  global.applyThemeToStudio = applyThemeToStudio;
  global.syncThemeFromState = syncThemeFromState;
  global.renderDiagnostics = renderDiagnostics;
  global.renderThemeSamples = renderThemeSamples;

  onReady(function () {
    ensurePatchStyles();
    ensureState();
    ensureAnalysisPanels();
    ensureStudioSamples();

    bindThemeUi();
    patchColorUpdater('updateColor');
    patchColorUpdater('updateColorHex');
    patchRunAnalysis();

    syncThemeFromState(global.S.analysisReport || {});
    renderDiagnostics();
    renderThemeJson();
    renderThemeSamples();
    applyThemeToStudio();
  });
})(window);
