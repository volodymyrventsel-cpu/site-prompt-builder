(function (global) {
  async function tryDirectFetch(url) {
    var r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('Direct fetch HTTP ' + r.status);
    return {
      text: await r.text(),
      via: 'direct'
    };
  }

  async function tryProxyFetch(url) {
    var proxy = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
    var r = await fetch(proxy, { signal: AbortSignal.timeout(12000) });
    if (!r.ok) throw new Error('Proxy fetch HTTP ' + r.status);
    var data = await r.json();
    if (!data || !data.contents) throw new Error('Proxy returned empty contents');
    return {
      text: data.contents,
      via: 'allorigins'
    };
  }

  async function fetchText(url) {
    var errors = [];
    try {
      return await tryDirectFetch(url);
    } catch (e) {
      errors.push('direct: ' + (e.message || String(e)));
    }
    try {
      return await tryProxyFetch(url);
    } catch (e) {
      errors.push('proxy: ' + (e.message || String(e)));
    }
    throw new Error(errors.join(' | '));
  }

  function absoluteUrl(base, href) {
    try {
      return new URL(href, base).href;
    } catch (e) {
      return null;
    }
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

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (x) {
      return Number(x).toString(16).padStart(2, '0');
    }).join('').toUpperCase();
  }

  function cssColorToHex(value) {
    try {
      var el = document.createElement('span');
      el.style.color = '';
      el.style.color = value.trim();
      if (!el.style.color) return null;
      document.body.appendChild(el);
      var resolved = getComputedStyle(el).color;
      el.remove();
      var m = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return null;
      return rgbToHex(m[1], m[2], m[3]);
    } catch (e) {
      return null;
    }
  }

  function extractFontsFromText(text) {
    var fonts = new Set();

    var gfMatches = text.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"'&\s]+)/gi);
    for (var gf of gfMatches) {
      var decoded = decodeURIComponent(gf[1]).replace(/\+/g, ' ');
      var familyParts = decoded.split('&family=');
      familyParts.forEach(function (part) {
        var family = part.split(':')[0].trim();
        if (family && family.length > 2) fonts.add(family);
      });
    }

    var ffMatches = text.matchAll(/font-family\s*:\s*([^;}{]+)/gi);
    for (var ff of ffMatches) {
      var first = ff[1].split(',')[0].replace(/['"]/g, '').trim();
      if (
        first &&
        first.length > 2 &&
        !['inherit', 'initial', 'serif', 'sans-serif', 'monospace', 'system-ui'].includes(first)
      ) {
        fonts.add(first);
      }
    }

    return Array.from(fonts);
  }

  function extractColorsFromText(text) {
    var out = new Set();

    (text.match(/#[0-9a-fA-F]{3,8}\b/g) || []).forEach(function (match) {
      var hex = normalizeHex(match);
      if (hex) out.add(hex);
    });

    (text.match(/rgba?\([^)]+\)/gi) || []).forEach(function (match) {
      var hex = cssColorToHex(match);
      if (hex) out.add(hex);
    });

    (text.match(/hsla?\([^)]+\)/gi) || []).forEach(function (match) {
      var hex = cssColorToHex(match);
      if (hex) out.add(hex);
    });

    (text.match(/(?:oklch|oklab|lab|lch|color)\([^)]+\)/gi) || []).forEach(function (match) {
      var hex = cssColorToHex(match);
      if (hex) out.add(hex);
    });

    var varMatches = text.matchAll(/--[\w-]+\s*:\s*([^;}{]+)/g);
    for (var vm of varMatches) {
      var hex2 = cssColorToHex(vm[1]);
      if (hex2) out.add(hex2);
    }

    return Array.from(out);
  }

  async function extractFromUrl(url) {
    var report = {
      url: url,
      ok: false,
      htmlFetched: false,
      htmlVia: null,
      cssLinksDiscovered: 0,
      cssFetchedCount: 0,
      cssFiles: [],
      fonts: [],
      colors: [],
      errors: [],
      warnings: []
    };

    try {
      var htmlResult = await fetchText(url);
      var html = htmlResult.text || '';
      report.htmlFetched = true;
      report.htmlVia = htmlResult.via;

      var doc = new DOMParser().parseFromString(html, 'text/html');

      var combinedText = html + '\n';

      Array.from(doc.querySelectorAll('style')).forEach(function (styleTag) {
        combinedText += '\n' + (styleTag.textContent || '');
      });

      var cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
        .map(function (el) { return el.getAttribute('href'); })
        .filter(Boolean)
        .map(function (href) { return absoluteUrl(url, href); })
        .filter(Boolean);

      report.cssLinksDiscovered = cssLinks.length;

      for (var i = 0; i < Math.min(cssLinks.length, 12); i++) {
        var cssUrl = cssLinks[i];
        try {
          var cssResult = await fetchText(cssUrl);
          combinedText += '\n' + cssResult.text;
          report.cssFetchedCount += 1;
          report.cssFiles.push({
            url: cssUrl,
            via: cssResult.via
          });
        } catch (e) {
          report.errors.push('CSS fetch failed: ' + cssUrl + ' — ' + (e.message || String(e)));
        }
      }

      report.fonts = extractFontsFromText(combinedText).slice(0, 20);
      report.colors = extractColorsFromText(combinedText).slice(0, 40);

      if (!report.colors.length) {
        report.warnings.push('No colors extracted from HTML/CSS');
      }
      if (!report.fonts.length) {
        report.warnings.push('No fonts extracted from HTML/CSS');
      }

      report.ok = report.htmlFetched;
    } catch (e) {
      report.errors.push(e.message || String(e));
    }

    return report;
  }

  global.StyleExtractor = {
    extractFromUrl: extractFromUrl
  };
})(window);
