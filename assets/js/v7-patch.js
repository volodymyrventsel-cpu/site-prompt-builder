(function (global) {
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

  function getSelectedDisplayFont() {
    var sel = document.getElementById('sel-disp-font');
    if (sel && sel.value) return sel.value;
    var approved = (global.S.approvedFonts || []).find(function (f) { return f.role === 'display'; });
    if (approved) return approved.name;
    if (global.S._dispPool && global.S._dispPool.length) return global.S._dispPool[0];
    return 'Syne';
  }

  function getSelectedBodyFont() {
    var sel = document.getElementById('sel-body-font');
    if (sel && sel.value) return sel.value;
    var approved = (global.S.approvedFonts || []).find(function (f) { return f.role === 'body'; });
    if (approved) return approved.name;
    if (global.S._bodyPool && global.S._bodyPool.length) return global.S._bodyPool[0];
    return 'DM Sans';
  }

  function ensurePatchStyles() {
    if (document.getElementById('v7-patch-styles')) return;
    var style = document.createElement('style');
    style.id = 'v7-patch-styles';
    style.textContent = `
      .v7-box{
        background:var(--s2);
        border:1px solid var(--bd);
        border-radius:var(--r);
        padding:12px;
        color:var(--tx);
        font-size:11px;
        line-height:1.6;
      }
      .v7-url-item{
        padding:10px 12px;
        border:1px solid var(--bd);
        border-radius:8px;
        background:var(--s1);
        margin-bottom:8px;
      }
      .v7-url-item:last-child{margin-bottom:0;}
      .v7-url-top{
        display:flex;
        gap:10px;
        align-items:center;
        justify-content:space-between;
        margin-bottom:6px;
        flex-wrap:wrap;
      }
      .v7-url-title{
        font-family:'DM Mono',monospace;
        font-size:10px;
        color:var(--tx);
        word-break:break-all;
      }
      .v7-badges{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
      }
      .v7-badge{
        font-family:'DM Mono',monospace;
        font-size:9px;
        padding:2px 7px;
        border-radius:999px;
        border:1px solid var(--bd2);
        color:var(--m2);
        background:var(--bd);
      }
      .v7-badge.ok{color:var(--grn);border-color:#3ecf8e40;background:#3ecf8e10;}
      .v7-badge.warn{color:var(--gold);border-color:#f0c04040;background:#f0c04010;}
      .v7-badge.err{color:var(--red);border-color:#f0606040;background:#f0606010;}
      .v7-mini{
        font-size:10px;
        color:var(--m2);
        margin-top:6px;
      }
      .v7-theme-json{
        width:100%;
        min-height:240px;
        resize:vertical;
        background:var(--s2);
        border:1px solid var(--bd);
        border-radius:var(--r);
        padding:12px;
        color:#A0A8C0;
        font-family:'DM Mono',monospace;
        font-size:9px;
        line-height:1.7;
        outline:none;
      }
      .v7-theme-json:focus{
        border-color:var(--ac);
      }
      .theme-samples-wrap{
        margin-bottom:18px;
      }
      .theme-samples-title{
        font-family:'DM Mono',monospace;
        font-size:9px;
        text-transform:uppercase;
        letter-spacing:.8px;
        color:var(--m1);
        margin-bottom:8px;
      }
      .theme-samples{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }
      .theme-card-sample{
        border-radius:var(--ref-card-radius, 20px);
        border:1px solid var(--ref-border, #252A3A);
        background:var(--ref-surface, #141720);
        box-shadow:var(--ref-card-shadow, 0 12px 28px rgba(0,0,0,0.2));
        padding:14px;
        transition:all var(--ref-base, 260ms) var(--ref-easing, ease);
      }
      .theme-card-kicker{
        font-family:'DM Mono',monospace;
        font-size:9px;
        color:var(--ref-accent, #4F8EFF);
        margin-bottom:6px;
        text-transform:uppercase;
        letter-spacing:.08em;
      }
      .theme-card-title{
        font-family:var(--ref-display-font, 'Syne', serif);
        font-size:16px;
        line-height:1.2;
        color:var(--ref-text, #E8EAF2);
        margin-bottom:6px;
      }
      .theme-card-body{
        font-family:var(--ref-body-font, 'DM Sans', sans-serif);
        font-size:12px;
        line-height:1.6;
        color:var(--ref-muted, #6A7390);
        margin-bottom:10px;
      }
      .theme-btn-row{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }
      .theme-btn{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:10px 14px;
        font-size:11px;
        font-family:var(--ref-body-font, 'DM Sans', sans-serif);
        font-weight:600;
        border-radius:var(--ref-button-radius, 12px);
        transition:all var(--ref-fast, 160ms) var(--ref-easing, ease);
        cursor:pointer;
      }
      .theme-btn.primary{
        background:var(--ref-accent, #4F8EFF);
        color:#fff;
        border:1px solid transparent;
        box-shadow:var(--ref-button-shadow, 0 10px 20px rgba(0,0,0,0.16));
      }
      .theme-btn.secondary{
        background:transparent;
        color:var(--ref-text, #E8EAF2);
        border:1px solid var(--ref-border, #252A3A);
      }
      .theme-input{
        width:100%;
        margin-top:10px;
        border-radius:var(--ref-input-radius, 12px);
        border:1px solid var(--ref-border, #252A3A);
        background:var(--ref-surface, #141720);
        color:var(--ref-text, #E8EAF2);
        padding:10px 12px;
        font-size:12px;
        outline:none;
      }
      .studio-preview.themed-preview{
        background:var(--ref-bg, #0D0F14) !important;
        border-color:var(--ref-border, #252A3A) !important;
      }
      .studio-preview.themed-preview .preview-header-bar{
        background:var(--ref-surface-alt, #1C2030) !important;
        border-bottom-color:var(--ref-border, #252A3A) !important;
      }
      .studio-preview.themed-preview .phb-url{
        background:var(--ref-surface, #141720) !important;
      }
      .studio-preview.themed-preview .phb-url span{
        color:var(--ref-muted, #6A7390) !important;
      }
      .studio-preview.themed-preview .preview-block{
        border-color:var(--ref-border, #252A3A) !important;
        color:var(--ref-text, #E8EAF2) !important;
        box-shadow:var(--ref-card-shadow, 0 12px 28px rgba(0,0,0,0.20));
      }
      .studio-preview.themed-preview .pb-name{
        font-family:var(--ref-display-font, 'Syne', serif) !important;
        color:var(--ref-text, #E8EAF2) !important;
      }
      .studio-preview.themed-preview .pb-variant{
        color:var(--ref-muted, #6A7390) !important;
        font-family:'DM Mono',monospace;
      }
      .studio-preview.themed-preview .pb-change{
        border-color:var(--ref-border, #252A3A) !important;
        color:var(--ref-text, #E8EAF2) !important;
        background:var(--ref-surface-alt, #1C2030) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureState() {
    if (!global.S.theme) {
      global.S.theme = global.ThemeSystem.createThemeFromAnalysis({
        palette: global.S.palette || {},
        displayFont: getSelectedDisplayFont(),
        bodyFont: getSelectedBodyFont(),
        styleHints: []
      });
    }
    if (!global.S.analysisReport) {
      global.S.analysisReport = {
        imageCount: 0,
        urlReports: [],
        usedFallback: false,
        totalColors: 0,
        totalFonts: 0,
        styleHints: []
      };
    }
  }

  function ensureAnalysisPanels() {
    var body = document.querySelector('#rbox .rb-body');
    if (!body || document.getElementById('v7-analysis-panels')) return;

    var wrapper = document.createElement('div');
    wrapper.id = 'v7-analysis-panels';
    wrapper.innerHTML = `
      <div class="rb-sec">
        <div class="rb-sec-t">Діагностика URL-анализа</div>
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

  function syncThemeFromState(extraMeta) {
    ensureState();

    var theme = global.ThemeSystem.createThemeFromAnalysis({
      palette: global.S.palette || {},
      displayFont: getSelectedDisplayFont(),
      bodyFont: getSelectedBodyFont(),
      styleHints: (typeof global.getStyles === 'function' ? global.getStyles() : []) || [],
      analysisMeta: extraMeta || global.S.analysisReport || {}
    });

    global.S.theme = theme;
    renderThemeJson();
    renderThemeSamples();
    applyThemeToStudio();
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
        <div class="v7-mini">Сейчас инструмент умеет честно показывать, что именно он увидел в HTML/CSS и где не хватило данных.</div>
      `;
      return;
    }

    box.innerHTML =
      urlReports.map(function (item) {
        return `
          <div class="v7-url-item
