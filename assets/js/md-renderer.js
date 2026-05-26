const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@9/marked.min.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function parseCallouts(html) {
  return html.replace(/<blockquote>\s*<p>\[!(INFO|WARNING|TIP|DANGER)\]\s*(.*?)<\/p>([\s\S]*?)<\/blockquote>/gi, (_, type, title, body) => {
    const map = {
      INFO: { cls: 'info', icon: 'ℹ️' },
      WARNING: { cls: 'warning', icon: '⚠️' },
      TIP: { cls: 'tip', icon: '💡' },
      DANGER: { cls: 'danger', icon: '🚨' }
    };
    const t = map[type.toUpperCase()] || map.INFO;
    return `<div class="callout ${t.cls}"><span class="callout-icon">${t.icon}</span><div class="callout-body"><strong>${title}</strong>${body}</div></div>`;
  });
}

function parseImageGrid(html) {
  return html.replace(/<!--gallery-->([\s\S]*?)<!--\/gallery-->/gi, (_, content) => {
    return `<div class="img-grid">${content}</div>`;
  });
}

async function renderMarkdown(mdContent) {
  if (typeof marked === 'undefined') {
    await loadScript(MARKED_CDN);
  }

  marked.setOptions({
    breaks: true,
    gfm: true
  });

  let html = marked.parse(mdContent);
  html = parseCallouts(html);
  html = parseImageGrid(html);
  return html;
}

async function loadNormPage() {
  const params = new URLSearchParams(window.location.search);
  const normFile = params.get('norm');

  if (!normFile) {
    window.location.href = 'index.html';
    return;
  }

  const contentEl = document.getElementById('norm-body');
  const headerEl = document.getElementById('norm-header');

  try {
    const resp = await fetch(`norms/${normFile}`);
    if (!resp.ok) throw new Error('Fichier introuvable');

    const md = await resp.text();
    const lines = md.split('\n');
    const frontmatter = {};
    let bodyStart = 0;

    if (lines[0] === '---') {
      let i = 1;
      while (i < lines.length && lines[i] !== '---') {
        const [key, ...val] = lines[i].split(':');
        if (key && val.length) frontmatter[key.trim()] = val.join(':').trim();
        i++;
      }
      bodyStart = i + 1;
    }

    const body = lines.slice(bodyStart).join('\n');
    const html = await renderMarkdown(body);

    if (headerEl) {
      headerEl.innerHTML = `
        <div class="norm-id">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          ${frontmatter.id || normFile.replace('.md', '')}
          ${frontmatter.status ? `<span class="tag tag-vert">${frontmatter.status}</span>` : ''}
        </div>
        <h1>${frontmatter.title || 'Norme'}</h1>
        <div class="norm-meta">
          ${frontmatter.authors ? `<span>✍️ ${frontmatter.authors}</span>` : ''}
          ${frontmatter.date ? `<span>📅 ${formatDate(frontmatter.date)}</span>` : ''}
          ${frontmatter.category ? `<span>🏷️ ${frontmatter.category}</span>` : ''}
        </div>
      `;
    }

    if (contentEl) {
      contentEl.innerHTML = html;

      if (frontmatter.authors) {
        const authors = frontmatter.authors.split(',').map(a => a.trim());
        contentEl.innerHTML += `
          <div class="norm-authors">
            <h4>Auteurs</h4>
            <div class="author-list">
              ${authors.map(a => `
                <div class="author-chip">
                  <div class="avatar">${a[0] || '?'}</div>
                  ${a}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      buildTOC();
    }

    if (frontmatter.title) {
      document.title = `${frontmatter.title} — BTE France Normes`;
    }

    updateBreadcrumb(frontmatter);
    buildNavButtons(normFile);

  } catch (err) {
    contentEl.innerHTML = `
      <div class="callout danger">
        <span class="callout-icon">🚨</span>
        <div class="callout-body">
          <strong>Erreur de chargement</strong>
          Impossible de charger cette norme. ${err.message}
        </div>
      </div>
    `;
  }
}

function buildTOC() {
  const tocEl = document.getElementById('toc');
  if (!tocEl) return;

  const headings = document.querySelectorAll('#norm-body h2, #norm-body h3');
  if (!headings.length) return;

  const items = [];
  headings.forEach((h, i) => {
    const id = `heading-${i}`;
    h.id = id;
    items.push({ id, text: h.textContent, level: h.tagName });
  });

  tocEl.innerHTML = items.map(item => `
    <li>
      <a href="#${item.id}" style="${item.level === 'H3' ? 'padding-left: 32px;' : ''}">
        ${item.text}
      </a>
    </li>
  `).join('');

  const links = tocEl.querySelectorAll('a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = tocEl.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

function updateBreadcrumb(fm) {
  const bc = document.getElementById('breadcrumb');
  if (!bc || !fm.id) return;

  const parts = fm.id.split('.');
  let crumbs = `<a href="index.html">Accueil</a>`;
  crumbs += `<span class="breadcrumb-sep">›</span>`;
  crumbs += `<a href="norm-index.html">Index</a>`;
  crumbs += `<span class="breadcrumb-sep">›</span>`;
  crumbs += `<span>${fm.id}: ${fm.title || ''}</span>`;

  bc.innerHTML = crumbs;
}

function buildNavButtons(currentFile) {
  const allNorms = [];
  Object.values(NORMS_DATA).forEach(cat => {
    cat.items.forEach(item => allNorms.push(item));
  });

  const idx = allNorms.findIndex(n => n.file === currentFile);
  const prev = idx > 0 ? allNorms[idx - 1] : null;
  const next = idx < allNorms.length - 1 ? allNorms[idx + 1] : null;

  const navEl = document.getElementById('norm-nav-bottom');
  if (!navEl) return;

  navEl.innerHTML = `
    ${prev ? `
      <a href="norm-viewer.html?norm=${prev.file}" class="norm-nav-btn prev">
        <span>←</span>
        <div>
          <small>Précédent</small>
          <span>${prev.id}: ${prev.title}</span>
        </div>
      </a>
    ` : '<div></div>'}
    ${next ? `
      <a href="norm-viewer.html?norm=${next.file}" class="norm-nav-btn next">
        <div>
          <small>Suivant</small>
          <span>${next.id}: ${next.title}</span>
        </div>
        <span>→</span>
      </a>
    ` : '<div></div>'}
  `;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}
