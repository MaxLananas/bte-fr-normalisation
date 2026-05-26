const NORMS_DATA = {
  N1: {
    title: "À propos de la Normalisation",
    icon: "📋",
    color: "bleu",
    description: "Comprendre le système de normes, comment les soumettre et rejoindre le comité.",
    items: [
      { id: "N1.1", title: "À propos des Normes", file: "N1/N1.1.md" },
      { id: "N1.2", title: "Soumettre une Norme", file: "N1/N1.2.md" },
      { id: "N1.3", title: "Rejoindre le Comité", file: "N1/N1.3.md" }
    ]
  },
  N2: {
    title: "Infrastructure",
    icon: "🏗️",
    color: "rouge",
    description: "Routes, trottoirs, voies ferrées, signalisation et tout ce qui structure l'espace urbain.",
    items: [
      { id: "N2.1", title: "Routes", file: "N2/N2.1.md" },
      { id: "N2.2", title: "Trottoirs", file: "N2/N2.2.md" },
      { id: "N2.3", title: "Voies ferrées", file: "N2/N2.3.md" },
      { id: "N2.4", title: "Signalisation routière", file: "N2/N2.4.md" },
      { id: "N2.5", title: "Éclairage public", file: "N2/N2.5.md" }
    ]
  },
  N3: {
    title: "Bâtiments",
    icon: "🏢",
    color: "vert",
    description: "Portes, fenêtres, toits, murs et tous les éléments constitutifs d'un bâtiment.",
    items: [
      { id: "N3.1", title: "Portes", file: "N3/N3.1.md" },
      { id: "N3.2", title: "Fenêtres", file: "N3/N3.2.md" },
      { id: "N3.3", title: "Toits", file: "N3/N3.3.md" },
      { id: "N3.4", title: "Murs et façades", file: "N3/N3.4.md" },
      { id: "N3.5", title: "Balcons et terrasses", file: "N3/N3.5.md" }
    ]
  },
  N4: {
    title: "Véhicules",
    icon: "🚗",
    color: "orange",
    description: "Voitures, camions, bus, trains, avions et embarcations fluviales.",
    items: [
      { id: "N4.1", title: "Voitures", file: "N4/N4.1.md" },
      { id: "N4.2", title: "Camions et utilitaires", file: "N4/N4.2.md" },
      { id: "N4.3", title: "Bus et transports en commun", file: "N4/N4.3.md" },
      { id: "N4.4", title: "Trains", file: "N4/N4.4.md" }
    ]
  },
  N5: {
    title: "Décorations & Mobilier",
    icon: "🪑",
    color: "violet",
    description: "Bancs, poubelles, lampadaires, fontaines et tout le mobilier urbain.",
    items: [
      { id: "N5.1", title: "Mobilier urbain", file: "N5/N5.1.md" },
      { id: "N5.2", title: "Parcs et espaces verts", file: "N5/N5.2.md" },
      { id: "N5.3", title: "Décorations intérieures", file: "N5/N5.3.md" }
    ]
  },
  N6: {
    title: "Logos, Drapeaux & Enseignes",
    icon: "🏳️",
    color: "jaune",
    description: "Drapeaux français et régionaux, logos d'entreprises, panneaux et enseignes.",
    items: [
      { id: "N6.1", title: "Drapeaux de France et régions", file: "N6/N6.1.md" },
      { id: "N6.2", title: "Logos d'entreprises", file: "N6/N6.2.md" },
      { id: "N6.3", title: "Enseignes commerciales", file: "N6/N6.3.md" }
    ]
  }
};

function setActive() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

document.addEventListener('DOMContentLoaded', setActive);
