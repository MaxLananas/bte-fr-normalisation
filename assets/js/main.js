const NORMS_DATA = [
  {
    id: 'N1',
    title: 'À propos de la Normalisation',
    icon: 'fa-solid fa-circle-info',
    items: [
      { id: 'N1.1', title: 'À propos des Normes', file: 'N1/N1.1.md' },
      { id: 'N1.2', title: 'Soumettre une Norme', file: 'N1/N1.2.md' },
      { id: 'N1.3', title: 'Rejoindre le Comité', file: 'N1/N1.3.md' }
    ]
  },
  {
    id: 'N2',
    title: 'Infrastructure routière',
    icon: 'fa-solid fa-road',
    items: [
      { id: 'N2.1', title: 'Routes', file: 'N2/N2.1.md' },
      { id: 'N2.2', title: 'Trottoirs', file: 'N2/N2.2.md' },
      { id: 'N2.3', title: 'Parkings & places de stationnement', file: 'N2/N2.3.md' },
      { id: 'N2.4', title: 'Panneaux de signalisation', file: 'N2/N2.4.md' },
      { id: 'N2.5', title: 'Arrêts de bus', file: 'N2/N2.5.md' },
      { id: 'N2.6', title: 'Pistes cyclables & arceaux vélo', file: 'N2/N2.6.md' }
    ]
  },
  {
    id: 'N3',
    title: 'Transports en commun & Voies ferrées',
    icon: 'fa-solid fa-train',
    items: [
      { id: 'N3.1', title: 'Rails de train', file: 'N3/N3.1.md' },
      { id: 'N3.2', title: 'Rails de tramway', file: 'N3/N3.2.md' },
      { id: 'N3.3', title: 'Caténaires', file: 'N3/N3.3.md' }
    ]
  },
  {
    id: 'N4',
    title: 'Bâtiments',
    icon: 'fa-solid fa-building',
    items: [
      { id: 'N4.1', title: 'Hauteur des bâtiments', file: 'N4/N4.1.md' },
      { id: 'N4.2', title: 'Fenêtres', file: 'N4/N4.2.md' },
      { id: 'N4.3', title: 'Toits', file: 'N4/N4.3.md' },
      { id: 'N4.4', title: 'Portes', file: 'N4/N4.4.md' },
      { id: 'N4.5', title: 'Murs & façades', file: 'N4/N4.5.md' },
      { id: 'N4.6', title: 'Balcons & terrasses', file: 'N4/N4.6.md' }
    ]
  },
  {
    id: 'N5',
    title: 'Mobilier urbain',
    icon: 'fa-solid fa-city',
    items: [
      { id: 'N5.1', title: 'Éclairage public', file: 'N5/N5.1.md' },
      { id: 'N5.2', title: 'Arbres & végétation', file: 'N5/N5.2.md' },
      { id: 'N5.3', title: 'Bancs & mobilier de rue', file: 'N5/N5.3.md' },
      { id: 'N5.4', title: 'Poubelles & conteneurs', file: 'N5/N5.4.md' },
      { id: 'N5.5', title: 'Poteaux électriques', file: 'N5/N5.5.md' }
    ]
  },
  {
    id: 'N6',
    title: 'Drapeaux, Logos & Enseignes',
    icon: 'fa-solid fa-flag',
    items: [
      { id: 'N6.1', title: 'Drapeaux de France & régions', file: 'N6/N6.1.md' },
      { id: 'N6.2', title: 'Logos d\'entreprises françaises', file: 'N6/N6.2.md' },
      { id: 'N6.3', title: 'Enseignes commerciales', file: 'N6/N6.3.md' }
    ]
  }
];

function resolveBase() {
  const loc = window.location;
  const parts = loc.pathname.split('/');
  parts.pop();
  return loc.origin + parts.join('/');
}

function normUrl(file) {
  return resolveBase() + '/norms/' + file;
}

function pageUrl(page) {
  return resolveBase() + '/' + page;
}

function getAllItems() {
  return NORMS_DATA.flatMap(cat => cat.items);
}

function getNeighbours(file) {
  const all = getAllItems();
  const idx = all.findIndex(i => i.file === file);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null
  };
}

function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    const h = a.getAttribute('href') || '';
    if (h === page || (page === '' && h === 'index.html')) {
      a.classList.add('active');
    }
  });
}

function fmtDate(d) {
  if (!d) return '';
  const parts = d.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  return new Date(d).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
