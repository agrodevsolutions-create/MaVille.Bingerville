// script.js — petites améliorations : enregistrement du service worker et navigation interne

// Enregistrer le service worker si disponible
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Listen for updates to the service worker and notify the page
      if (registration.waiting) {
        // there's an updated worker waiting
        console.log('SW waiting — consider prompt to reload');
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            console.log('New content available, please refresh.');
          }
        });
      });

      // When the controlling service worker changes, reload the page
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (err) {
      // ignore registration errors in dev
      console.warn('SW registration failed:', err);
    }
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
