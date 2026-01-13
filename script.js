// script.js — petites améliorations : enregistrement du service worker et navigation interne

// Enregistrer le service worker si disponible
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // échec silencieux en environnement de dev
    });
  });
}

// Fonction simple pour afficher une section et masquer les autres
function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('active');
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  // Mettre à jour les classes active sur la nav
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const navMap = {
    'accueil': 'nav-accueil',
    'sondages': 'nav-sondages',
    'signalement': 'nav-signalement',
    'proximite': 'nav-proximite',
    'moi': 'nav-moi'
  };
  const navId = navMap[id];
  if (navId) {
    const navEl = document.getElementById(navId);
    if (navEl) navEl.classList.add('active');
  }
}

// Attacher la navigation du bas
document.addEventListener('DOMContentLoaded', () => {
  const navBindings = [
    ['nav-accueil', 'accueil'],
    ['nav-sondages', 'sondages'],
    ['nav-signalement', 'signalement'],
    ['nav-proximite', 'proximite'],
    ['nav-moi', 'moi']
  ];
  navBindings.forEach(([navId, sectionId]) => {
    const el = document.getElementById(navId);
    if (el) {
      el.addEventListener('click', (e) => { e.preventDefault(); showSection(sectionId); });
    }
  });

  // FAB
  const fab = document.getElementById('fab');
  if (fab) fab.addEventListener('click', () => showSection('signalement'));
});
