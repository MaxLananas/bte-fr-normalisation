(function () {
  const MARKED_SRC = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function parseFrontmatter(raw) {
    const fm = {};
    let body = raw;
    if (raw.trimStart().startsWith('---')) {
      const start = raw.indexOf('---');
      const end = raw.indexOf('---', start + 3);
      if (end !== -1) {
        const block = raw.slice(start + 3, end).trim();
        block.split('\n').forEach(line => {
          const colon = line.indexOf(':');
          if (colon === -1) return;
          const k = line.slice(0, colon).trim();
          const v = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
          if (k) fm[k] = v;
        });
        body = raw.slice(end + 3).trim();
      }
    }
    return { fm, body };
  }

  function applyCallouts(html) {
    return html.replace(
      /<blockquote>\s*<p>\[!(INFO|WARNING|TIP|DANGER)\]([^<]*)<\/p>([\s\S]*?)<\/blockquote>/gi,
      (_, type, title, rest) => {
        const map = {
          INFO:    { cls: 'info',    icon: 'fa-solid fa-circle-info' },
          WARNING: { cls: 'warning', icon: 'fa-solid fa-triangle-exclamation' },
          TIP:     { cls: 'tip',     icon: 'fa-solid fa-lightbulb' },
          DANGER:  { cls: 'danger',  icon: 'fa-solid fa-circle-xmark' }
        };
        const t = map[type.toUpperCase()] || map.INFO;
        const inner = rest.replace(/<\/?p>/g, '').trim();
        return `<div class="callout ${t.cls}">
          <i class="callout-ico ${t.icon}"></i>
          <div class="callout-content">${title.trim() ? `<strong>${title.trim()}</strong>` : ''}${inner ? '<p style="margin:4px 0 0;">' + inner + '</p>' : ''}</div>
        </div>`;
      }
    );
  }

  function applyGallery(html) {
    return html.replace(/<!--gallery-->([\s\S]*?)<!--\/gallery-->/gi, (_, c) => {
      return `<div class="img-grid">${c}</div>`;
    });
  }

  async function renderMd(raw) {
    await loadScript(MARKED_SRC);
    marked.setOptions({ breaks: true, gfm: true });
    let html = marked.parse(raw);
    html = applyCallouts(html);
    html = applyGallery(html);
    return html;
  }

  function buildNormHeader(fm, file) {
    const headerEl = document.getElementById('norm-header');
    if (!headerEl) return;

    const statusMap = {
      'Validée':   'badge-green',
      'En cours':  'badge-orange',
      'Dépréciée': 'badge-red'
    };
    const badgeCls = statusMap[fm.status] || 'badge-grey';

    headerEl.innerHTML = `
      <div class="article-breadcrumb">
        <a href="${pageUrl('index.html')}">Accueil</a>
        <i class="fa-solid fa-chevron-right"></i>
        <a href="${pageUrl('norm-index.html')}">Index</a>
        <i class="fa-solid fa-chevron-right"></i>
        <span>${fm.id || file.replace('.md', '')}</span>
      </div>
      <div class="article-id">${fm.id || ''}</div>
      <h1>${fm.title || 'Norme'}</h1>
      <div class="article-meta">
        ${fm.status   ? `<span><span class="badge ${badgeCls}"><i class="fa-solid fa-circle-dot"></i> ${fm.status}</span></span>` : ''}
        ${fm.authors  ? `<span><i class="fa-solid fa-user-pen"></i> ${fm.authors}</span>` : ''}
        ${fm.date     ? `<span><i class="fa-regular fa-calendar"></i> ${fmtDate(fm.date)}</span>` : ''}
        ${fm.category ? `<span><i class="fa-solid fa-folder"></i> ${fm.category}</span>` : ''}
      </div>
    `;
  }

  function buildTOC(bodyEl) {
    const tocEl = document.getElementById('toc');
    if (!tocEl || !bodyEl) return;

    const headings = bodyEl.querySelectorAll('h2, h3');
    if (!headings.length) {
      tocEl.innerHTML = '<li><span class="sidebar-section-label">Aucune section</span></li>';
      return;
    }

    tocEl.innerHTML = '';
    headings.forEach((h, i) => {
      const id = 'section-' + i;
      h.id = id;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent;
      if (h.tagName === 'H3') a.classList.add('sub');
      li.appendChild(a);
      tocEl.appendChild(li);
    });

    const links = tocEl.querySelectorAll('a');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const al = tocEl.querySelector(`a[href="#${e.target.id}"]`);
          if (al) al.classList.add('active');
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });

    headings.forEach(h => obs.observe(h));
  }

  function buildAuthors(fm, bodyEl) {
    if (!fm.authors || !bodyEl) return;
    const authors = fm.authors.split(',').map(a => a.trim()).filter(Boolean);
    const block = document.createElement('div');
    block.className = 'authors-block';
    block.innerHTML = `
      <h4>Auteurs</h4>
      <div class="author-chips">
        ${authors.map(a => `
          <div class="author-chip">
            <div class="ava">${a.charAt(0).toUpperCase()}</div>
            ${a}
          </div>
        `).join('')}
      </div>
    `;
    bodyEl.appendChild(block);
  }

  function buildArticleNav(file) {
    const navEl = document.getElementById('article-nav');
    if (!navEl) return;
    const { prev, next } = getNeighbours(file);

    navEl.innerHTML = `
      ${prev ? `
        <a href="${pageUrl('norm-viewer.html')}?norm=${prev.file}" class="art-nav-btn prev">
          <i class="fa-solid fa-arrow-left"></i>
          <div>
            <small>Précédent</small>
            <strong>${prev.id} — ${prev.title}</strong>
          </div>
        </a>
      ` : '<div></div>'}
      ${next ? `
        <a href="${pageUrl('norm-viewer.html')}?norm=${next.file}" class="art-nav-btn next">
          <div>
            <small>Suivant</small>
            <strong>${next.id} — ${next.title}</strong>
          </div>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      ` : '<div></div>'}
    `;
  }

  async function loadNormPage() {
    const params   = new URLSearchParams(window.location.search);
    const normFile = params.get('norm');
    const headerEl = document.getElementById('norm-header');
    const bodyEl   = document.getElementById('norm-body');

    if (!normFile || !bodyEl) {
      window.location.href = pageUrl('index.html');
      return;
    }

    bodyEl.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>`;
    if (headerEl) headerEl.innerHTML = '';

    const fetchTarget = normUrl(normFile);

    try {
      const resp = await fetch(fetchTarget);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const raw = await resp.text();
      const { fm, body } = parseFrontmatter(raw);

      buildNormHeader(fm, normFile);

      const html = await renderMd(body);
      bodyEl.innerHTML = html;

      buildAuthors(fm, bodyEl);
      buildTOC(bodyEl);
      buildArticleNav(normFile);

      if (fm.title) {
        document.title = `${fm.id} — ${fm.title} · BTE France Normes`;
      }

    } catch (err) {
      if (headerEl) headerEl.innerHTML = '';
      bodyEl.innerHTML = `
        <div class="error-state">
          <i class="fa-solid fa-file-circle-xmark"></i>
          <h3>Norme introuvable</h3>
          <p>Le fichier <code>norms/${normFile}</code> n'existe pas encore ou n'a pas pu être chargé.</p>
          <p style="margin-top:16px">
            <a href="${pageUrl('norm-index.html')}">
              <i class="fa-solid fa-arrow-left"></i> Retour à l'index
            </a>
          </p>
        </div>
      `;
    }
  }

  window.loadNormPage = loadNormPage;
})();
