(function() {
  const FALLBACK_NAV = "<aside class=\"sidebar\" aria-label=\"Conference navigation\">\n  <a class=\"sidebar-brand\" href=\"./index.html\">\n    <span>International Conference on Intelligent Multimedia, Networking, and Security</span>\n    <strong>(IMNS 2027)</strong>\n  </a>\n  <div class=\"sponsor-group\">\n    <div class=\"sponsor-row\">\n      <a class=\"logo-tile\" href=\"https://www.ieee.org/index.html\" target=\"_blank\" rel=\"noopener\"><img src=\"../gallery_gen/0ef15cb374fb53a0cfff7775b7b7c185_320x104_fit.png\" alt=\"IEEE\"></a>\n      <a class=\"logo-tile\" href=\"http://www.comsoc.org/\" target=\"_blank\" rel=\"noopener\"><img src=\"../gallery_gen/291072cf3804a51717d0122e03c31a82_326x118_fit.png\" alt=\"IEEE Communications Society\"></a>\n    </div>\n    <p class=\"sponsor-caption\">Technical Co-Sponsor</p>\n  </div>\n  <nav class=\"site-nav\">\n    <ul>\n      <li><a href=\"./index.html\">Home</a></li>\n      <li><a href=\"./Organizing-Committee.html\">Organizing Committee</a></li>\n      <li><a href=\"./Call-for-Paper.html\">Call for Paper</a></li>\n      <li><a href=\"./Submissions.html\">Submissions</a></li>\n      <li><a href=\"./Posters-and-Demo.html\">Posters and Demo</a></li>\n      <li><a href=\"./Program.html\">Program</a></li>\n      <li><a href=\"./Registration.html\">Registration</a></li>\n      <li><a href=\"./Keynote.html\">Keynote</a></li>\n      <li><a href=\"./Venue.html\">Venue</a></li>\n      <li><a href=\"./Sponsorship.html\">Sponsorship</a></li>\n      <li><a href=\"./Previous-Years.html\">Previous Years</a></li>\n    </ul>\n  </nav>\n</aside>\n\n<header class=\"mobile-header\">\n  <a class=\"mobile-brand\" href=\"./index.html\">IMNS 2027</a>\n  <details class=\"mobile-menu\">\n    <summary><span class=\"hamburger\" aria-hidden=\"true\"><span></span><span></span><span></span></span><span class=\"sr-only\">Menu</span></summary>\n    <nav class=\"site-nav\" aria-label=\"Mobile navigation\">\n      <ul>\n        <li><a href=\"./index.html\">Home</a></li>\n        <li><a href=\"./Organizing-Committee.html\">Organizing Committee</a></li>\n        <li><a href=\"./Call-for-Paper.html\">Call for Paper</a></li>\n        <li><a href=\"./Submissions.html\">Submissions</a></li>\n        <li><a href=\"./Posters-and-Demo.html\">Posters and Demo</a></li>\n        <li><a href=\"./Program.html\">Program</a></li>\n        <li><a href=\"./Registration.html\">Registration</a></li>\n        <li><a href=\"./Keynote.html\">Keynote</a></li>\n        <li><a href=\"./Venue.html\">Venue</a></li>\n        <li><a href=\"./Sponsorship.html\">Sponsorship</a></li>\n        <li><a href=\"./Previous-Years.html\">Previous Years</a></li>\n      </ul>\n    </nav>\n  </details>\n</header>";
  const FALLBACK_ANNOUNCEMENT = "<section class=\"announcement-block\" aria-labelledby=\"announcements-title\">\n  <div class=\"announcement-inner\">\n    <h2 id=\"announcements-title\">Announcements</h2>\n    <table class=\"announcement-table\">\n      <tbody>\n        <tr><td>TBD</td><td>Paper submission system and detailed CFP will be opened soon.</td></tr>\n        <tr><td>TBD</td><td>Keynote speaker lineup and invited talks will be announced.</td></tr>\n        <tr><td>09/05/2026</td><td>The IMNS 2027 website is officially launched. IMNS 2027 will take place in New York, NY on August 5–6, 2027.</td></tr>\n      </tbody>\n    </table>\n  </div>\n</section>";

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
