// script.js — petites améliorations : enregistrement du service worker et navigation interne

// Enregistrer le service worker si disponible
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Listen for updates to the service worker and notify the page
      if (registration.waiting) {
        // there's an updated worker waiting
        console.log("SW waiting — consider prompt to reload");
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New update available
            console.log("New content available, please refresh.");
          }
        });
      });

      // When the controlling service worker changes, reload the page
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } catch (err) {
      // ignore registration errors in dev
      console.warn("SW registration failed:", err);
    }
  });
}

// Fonction simple pour afficher une section et masquer les autres
function showSection(id) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((s) => {
    s.classList.add("hidden");
    s.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
  }
  // Mettre à jour les classes active sur la nav
  document
    .querySelectorAll(".nav-item")
    .forEach((item) => item.classList.remove("active"));
  const navMap = {
    accueil: "nav-accueil",
    sondages: "nav-sondages",
    signalement: "nav-signalement",
    proximite: "nav-proximite",
    moi: "nav-moi",
  };
  const navId = navMap[id];
  if (navId) {
    const navEl = document.getElementById(navId);
    if (navEl) navEl.classList.add("active");
  }
}

// Attacher la navigation du bas
document.addEventListener("DOMContentLoaded", () => {
  const navBindings = [
    ["nav-accueil", "maville"],
    ["nav-sondages", "sondages"],
    ["nav-signalement", "signalement"],
    ["nav-proximite", "proximite"],
    ["nav-moi", "moi"],
  ];
  navBindings.forEach(([navId, sectionId]) => {
    const el = document.getElementById(navId);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showSection(sectionId);
      });
    }
  });

  // FAB
  const fab = document.getElementById("fab");
  if (fab) fab.addEventListener("click", () => showSection("signalement"));

  // MaVille fullscreen modal handling with animation and focus trap
  const openBtn = document.getElementById("open-maville");
  const modal = document.getElementById("maville-modal");
  const closeBtn = document.getElementById("maville-modal-close");
  let previousActive = null;
  let keydownHandler = null;

  function getFocusable(el) {
    return Array.from(
      el.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (e) => e.offsetWidth || e.offsetHeight || e === document.activeElement,
    );
  }

  function openMaville() {
    if (!modal) return;
    previousActive = document.activeElement;
    modal.classList.remove("hidden");
    // force reflow to ensure transition
    void modal.offsetWidth;
    modal.classList.add("maville-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // focus the close button for immediate keyboard access
    if (closeBtn) closeBtn.focus();

    // Add keyboard handling: Escape to close, Tab trap
    keydownHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMaville();
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusable(modal);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keydownHandler);
  }

  // Set modal content (title, image, body)
  function setMavilleContent({ title, imageUrl, body }) {
    if (!modal) return;
    const titleEl = modal.querySelector("#maville-title");
    const bodyEl = modal.querySelector(".content p");
    const panel = modal.querySelector(".panel");
    if (titleEl && typeof title === "string") titleEl.textContent = title;
    if (bodyEl && typeof body === "string") bodyEl.textContent = body;
    if (panel && typeof imageUrl === "string")
      panel.style.backgroundImage = `url('${imageUrl}')`;
  }

  function closeMaville(e) {
    if (e) e.preventDefault();
    if (!modal) return;
    modal.classList.remove("maville-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // wait for transition to finish before hiding completely
    const onTransitionEnd = (ev) => {
      if (ev.target === modal) {
        modal.classList.add("hidden");
        modal.removeEventListener("transitionend", onTransitionEnd);
      }
    };
    modal.addEventListener("transitionend", onTransitionEnd);
    // remove key handler and restore focus
    if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
    if (previousActive && typeof previousActive.focus === "function")
      previousActive.focus();
  }

  if (openBtn)
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openMaville();
    });
  if (closeBtn) closeBtn.addEventListener("click", closeMaville);
  if (modal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeMaville();
    });

  // Activate all 'Lire la suite' buttons to open the MaVille modal and load context
  const readMoreBtns = document.querySelectorAll(".read-more");
  if (readMoreBtns && readMoreBtns.length) {
    // helper: read supabase config from meta tags or window.SUPABASE_CONFIG
    function getSupabaseConfig() {
      const metaUrl = document.querySelector('meta[name="supabase-url"]');
      const metaKey = document.querySelector('meta[name="supabase-key"]');
      const url = metaUrl
        ? metaUrl.getAttribute("content")
        : (window.SUPABASE && window.SUPABASE.url) || null;
      const key = metaKey
        ? metaKey.getAttribute("content")
        : (window.SUPABASE && window.SUPABASE.anonKey) || null;
      return { url, key };
    }

    async function fetchArticleFromSupabase(id, cfg) {
      if (!cfg || !cfg.url || !cfg.key)
        throw new Error("Supabase not configured");
      const url = cfg.url.replace(/\/$/, "");
      // expecting a table `articles` — adapt fields as needed
      const endpoint = `${url}/rest/v1/articles?id=eq.${encodeURIComponent(id)}&select=*`;
      const res = await fetch(endpoint, {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error(`Supabase request failed: ${res.status}`);
      const json = await res.json();
      return Array.isArray(json) && json.length ? json[0] : null;
    }

    readMoreBtns.forEach((b) =>
      b.addEventListener("click", async (e) => {
        e.preventDefault();
        const article = b.closest("article");
        // data-article-id may be set on the button or the article element
        const id =
          b.dataset.articleId || (article && article.dataset.articleId) || null;
        const titleEl = article ? article.querySelector("h3") : null;
        const paraEl = article ? article.querySelector("p") : null;
        let imgUrl = null;
        const bgEl = article
          ? article.querySelector('[style*="background-image"]')
          : null;
        if (bgEl) {
          const m = /url\(['"]?(.*?)['"]?\)/.exec(bgEl.getAttribute("style"));
          if (m && m[1]) imgUrl = m[1];
        }

        const fallbackTitle = titleEl ? titleEl.textContent.trim() : "MaVille";
        const fallbackBody = paraEl ? paraEl.textContent.trim() : "";

        if (id) {
          const cfg = getSupabaseConfig();
          if (cfg.url && cfg.key) {
            try {
              // show loading
              const articleSection = document.getElementById("article");
              const hero = document.getElementById("article-hero");
              const titleOut = document.getElementById("article-title");
              const bodyOut = document.getElementById("article-body");
              if (titleOut) titleOut.textContent = "Chargement…";
              if (bodyOut) bodyOut.textContent = "";
              showSection("article");
              const data = await fetchArticleFromSupabase(id, cfg);
              if (data) {
                const t = data.title || fallbackTitle;
                const body = data.body || data.content || fallbackBody;
                const image = data.image_url || data.image || imgUrl || "";
                if (hero)
                  hero.style.backgroundImage = image ? `url('${image}')` : "";
                if (titleOut) titleOut.textContent = t;
                if (bodyOut) bodyOut.textContent = body;
                history.pushState(
                  { page: "article", id },
                  "",
                  `#article-${id}`,
                );
                return;
              }
            } catch (err) {
              console.warn(
                "Supabase fetch failed, falling back to local content",
                err,
              );
            }
          }
        }

        // fallback: use local DOM content and navigate to article view
        try {
          const articleSection = document.getElementById("article");
          const hero = document.getElementById("article-hero");
          const titleOut = document.getElementById("article-title");
          const bodyOut = document.getElementById("article-body");
          if (hero)
            hero.style.backgroundImage = imgUrl ? `url('${imgUrl}')` : "";
          if (titleOut) titleOut.textContent = fallbackTitle;
          if (bodyOut) bodyOut.textContent = fallbackBody;
          showSection("article");
          history.pushState({ page: "article" }, "", "#article");
        } catch (err) {
          openMaville();
        }
      }),
    );
  }

  // Article page back control + popstate handling
  const articleBack = document.getElementById("article-back");
  if (articleBack)
    articleBack.addEventListener("click", (e) => {
      e.preventDefault();
      history.back();
    });
  window.addEventListener("popstate", (e) => {
    if (e.state && e.state.page === "article") {
      showSection("article");
    } else {
      // default to MaVille section
      showSection("maville");
    }
  });

  // Dark mode toggle: persist in localStorage and toggle `dark` class on <html>
  const darkToggle = document.getElementById("dark-toggle");
  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      darkToggle?.setAttribute("aria-pressed", "true");
      const ic = document.getElementById("dark-icon");
      if (ic) ic.textContent = "light_mode";
    } else {
      html.classList.remove("dark");
      darkToggle?.setAttribute("aria-pressed", "false");
      const ic = document.getElementById("dark-icon");
      if (ic) ic.textContent = "dark_mode";
    }
  }
  function initTheme() {
    const saved = localStorage.getItem("maville-theme");
    if (saved) {
      applyTheme(saved);
      return;
    }
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("maville-theme", next);
    });
  }
  initTheme();
});
