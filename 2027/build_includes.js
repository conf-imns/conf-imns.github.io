const fs = require('fs');
const path = require('path');

const dir2027 = __dirname;
const navTemplate = fs.readFileSync(path.join(dir2027, 'navigation.html'), 'utf8').trim();
const annHtml = fs.readFileSync(path.join(dir2027, 'announcement.html'), 'utf8').trim();

const pages = [
  'index.html',
  'Organizing-Committee.html',
  'Call-for-Paper.html',
  'Submissions.html',
  'Posters-and-Demo.html',
  'Program.html',
  'Registration.html',
  'Keynote.html',
  'Venue.html',
  'Sponsorship.html',
  'Previous-Years.html'
];

function getStaticNav(page) {
  // Indent nav lines with 2 spaces to match HTML body indentation
  let formatted = navTemplate.split('\n').map(line => line ? '  ' + line : '').join('\n');

  // Add aria-current="page" only to the nav item link corresponding to this page (both desktop sidebar and mobile menu)
  const targetHref = `<li><a href="./${page}"`;
  formatted = formatted.split(targetHref).join(`<li><a href="./${page}" aria-current="page"`);

  return formatted;
}

// 1. Update static navigation and footer sponsors in all 2027 HTML files
const footerSponsorRegex = /<div class="footer-sponsors">[\s\S]*?<\/div>/;
const targetFooterSponsors = `<div class="footer-sponsors">
            <a class="logo-tile" href="https://www.ieee.org/index.html" target="_blank" rel="noopener"><img src="../gallery_gen/0ef15cb374fb53a0cfff7775b7b7c185_268x88_fit.png" alt="IEEE"></a>
            <a class="logo-tile" href="http://www.comsoc.org/" target="_blank" rel="noopener"><img src="../gallery_gen/291072cf3804a51717d0122e03c31a82_264x96_fit.png" alt="IEEE Communications Society"></a>
            <a class="logo-tile" href="https://www.stevens.edu/" target="_blank" rel="noopener"><img src="../gallery/stevens_horizontal.png" alt="Stevens Institute of Technology"></a>
          </div>`;

pages.forEach(page => {
  const filePath = path.join(dir2027, page);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const staticNav = getStaticNav(page);

  const placeholderRegex = /[ \t]*<!-- Navigation included from navigation\.html -->\s*<div id="site-navigation-placeholder" data-include="\.\/navigation\.html"><\/div>/;
  const staticNavRegex = /[ \t]*<aside class="sidebar" aria-label="Conference navigation">[\s\S]*?<\/header>/;

  if (placeholderRegex.test(content)) {
    content = content.replace(placeholderRegex, staticNav);
  } else if (staticNavRegex.test(content)) {
    content = content.replace(staticNavRegex, staticNav);
  } else {
    console.warn(`Could not find navigation placeholder or existing static nav in ${page}`);
  }

  if (footerSponsorRegex.test(content)) {
    content = content.replace(footerSponsorRegex, targetFooterSponsors);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${page}: refreshed static navigation and sponsors`);
});

// 2. Build 2027/js/include.js without any JS navigation
const jsCode = `(function() {
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
`;

fs.writeFileSync(path.join(dir2027, 'js', 'include.js'), jsCode, 'utf8');
console.log('Successfully wrote 2027/js/include.js (no JS navigation)');
