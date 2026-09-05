const fs = require('fs');
const path = require('path');

const dir2027 = 'F:/#WebsiteManagement/conf-imns.github.io/2027';
const navHtml = fs.readFileSync(path.join(dir2027, 'navigation.html'), 'utf8').trim();
const annHtml = fs.readFileSync(path.join(dir2027, 'announcement.html'), 'utf8').trim();

const jsCode = `(function() {
  const FALLBACK_NAV = ${JSON.stringify(navHtml)};
  const FALLBACK_ANNOUNCEMENT = ${JSON.stringify(annHtml)};

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

  function highlightActiveNav() {
    let currentPage = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];
    if (!currentPage || currentPage === '' || currentPage === '/') {
      currentPage = 'index.html';
    }
    const links = document.querySelectorAll('.site-nav a');
    links.forEach(function(link) {
      link.removeAttribute('aria-current');
      const href = link.getAttribute('href');
      if (!href) return;
      const targetPage = href.split('/').pop().split('?')[0].split('#')[0];
      if (targetPage.toLowerCase() === currentPage.toLowerCase()) {
        link.setAttribute('aria-current', 'page');
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
        if (url.includes('navigation')) {
          html = FALLBACK_NAV;
        } else if (url.includes('announcement')) {
          html = FALLBACK_ANNOUNCEMENT;
        }
      }

      if (html) {
        el.innerHTML = html;
      }
    }

    highlightActiveNav();
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
`;

fs.writeFileSync(path.join(dir2027, 'js', 'include.js'), jsCode, 'utf8');
console.log('Successfully wrote 2027/js/include.js');
