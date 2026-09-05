(function() {
  const FALLBACK_ANNOUNCEMENT = "<section class=\"announcement-block\" aria-labelledby=\"announcements-title\">\n  <div class=\"announcement-inner\">\n    <h2 id=\"announcements-title\">Announcements</h2>\n    <table class=\"announcement-table\">\n      <tbody>\n        <tr><td>TBD</td><td>Paper submission system and detailed CFP will be opened soon.</td></tr>\n        <tr><td>TBD</td><td>Keynote speaker lineup and invited talks will be announced.</td></tr>\n        <tr><td>09/05/2026</td><td>The IMNS 2027 website is officially launched. IMNS 2027 will take place in the New York Area on August 5-6, 2027.</td></tr>\n      </tbody>\n    </table>\n  </div>\n</section>";

  function ensureExternalLinksTargetBlank(root) {
    const context = root || document;
    const links = context.querySelectorAll('a[href]');
    links.forEach(function(link) {
      const href = link.getAttribute('href');
      if (!href) return;
      // Do NOT set target="_blank" on the internal Previous-Years.html navigation page
      if (href.includes('Previous-Years.html')) return;

      // Set target="_blank" on out-of-site links and previous conference sites (e.g. 2026)
      const isOutOfSite = href.startsWith('http://') || 
                          href.startsWith('https://') || 
                          href.includes('/2026') || 
                          href.includes('../2026') || 
                          href.includes('/2025') ||
                          href.includes('../2025');
      if (isOutOfSite) {
        link.setAttribute('target', '_blank');
        if (!link.getAttribute('rel')) {
          link.setAttribute('rel', 'noopener');
        }
      }
    });
  }

  async function loadIncludes() {
    const includeElements = Array.from(document.querySelectorAll('[data-include]'));
    for (const el of includeElements) {
      const url = el.getAttribute('data-include');
      if (!url) continue;

      let html = '';
      if (window.location.protocol !== 'file:') {
        try {
          const res = await fetch(url + '?v=' + Date.now());
          if (res.ok) {
            html = await res.text();
          }
        } catch (e) {
          // fallback below
        }
      }

      if (!html) {
        if (url.includes('announcement')) {
          html = FALLBACK_ANNOUNCEMENT;
        }
      }

      if (html) {
        el.innerHTML = html;
      }
    }

    ensureExternalLinksTargetBlank();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadIncludes);
    } else {
      loadIncludes();
    }
  }
})();
