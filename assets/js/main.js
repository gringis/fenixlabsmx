// ==============================
// FÉNIX LABS - MAIN JS
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const scrollProgress = document.getElementById("scrollProgress");
  const themeStorageKey = "fenixlabs-theme";

  const applyTheme = (theme) => {
    const selectedTheme = theme || "auto";
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const resolvedTheme = selectedTheme === "auto"
      ? (prefersLight ? "light" : "dark")
      : selectedTheme;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeChoice = selectedTheme;

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", resolvedTheme === "light" ? "#fff5df" : "#07111f");
    }
  };

  const getStoredTheme = () => localStorage.getItem(themeStorageKey);
  applyTheme(getStoredTheme() || "auto");

  const buildThemeGate = () => {
    const overlay = document.createElement("section");
    overlay.className = "theme-gate";
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Seleccionar tema visual");
    const activeTheme = document.documentElement.dataset.themeChoice || "auto";
    overlay.innerHTML = `
      <div class="theme-gate-panel">
        <header class="theme-gate-header">
          <div>
            <h2>Configuración de apariencia</h2>
            <p>Selecciona cómo quieres ver Fénix Labs. Puedes cambiarlo después desde el botón flotante.</p>
          </div>
          <button class="theme-gate-close" type="button" data-theme-close aria-label="Cerrar selector">×</button>
        </header>
        <h3>Tema clásico</h3>
        <div class="theme-gate-options">
          <button class="${activeTheme === "light" ? "is-selected" : ""}" type="button" data-theme-pick="light">
            <span class="theme-preview theme-preview-light"><i></i><i></i><i></i></span>
            <strong>Predeterminado-Claro</strong>
          </button>
          <button class="${activeTheme === "dark" ? "is-selected" : ""}" type="button" data-theme-pick="dark">
            <span class="theme-preview theme-preview-dark"><i></i><i></i><i></i></span>
            <strong>Predeterminado-Oscuro</strong>
          </button>
          <button class="${activeTheme === "auto" ? "is-selected" : ""}" type="button" data-theme-pick="auto">
            <span class="theme-preview theme-preview-auto"><i></i><i></i><i></i></span>
            <strong>Predeterminado - Seguir el sistema</strong>
          </button>
          <button class="${activeTheme === "aurora" ? "is-selected" : ""}" type="button" data-theme-pick="aurora">
            <span class="theme-preview theme-preview-aurora"><i></i><i></i><i></i></span>
            <strong>Colorido</strong>
          </button>
          <button class="${activeTheme === "contrast" ? "is-selected" : ""}" type="button" data-theme-pick="contrast">
            <span class="theme-preview theme-preview-contrast"><i></i><i></i><i></i></span>
            <strong>Comodidad</strong>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add("theme-gate-open");

    overlay.querySelectorAll("[data-theme-pick]").forEach((button) => {
      button.addEventListener("click", () => {
        const theme = button.dataset.themePick;
        localStorage.setItem(themeStorageKey, theme);
        applyTheme(theme);
        closeThemeGate(overlay);
      });
    });

    overlay.querySelector("[data-theme-close]").addEventListener("click", () => {
      localStorage.setItem(themeStorageKey, document.documentElement.dataset.themeChoice || "auto");
      closeThemeGate(overlay);
    });
  };

  const closeThemeGate = (overlay) => {
    overlay.classList.add("is-closing");
    document.body.classList.remove("theme-gate-open");
    window.setTimeout(() => overlay.remove(), 260);
  };

  const buildThemeButton = () => {
    const button = document.createElement("button");
    button.className = "theme-switcher";
    button.type = "button";
    button.setAttribute("aria-label", "Cambiar tema visual");
    button.innerHTML = "<span>◐</span>";
    button.addEventListener("click", buildThemeGate);
    document.body.appendChild(button);
  };

  if (!getStoredTheme()) {
    buildThemeGate();
  }

  buildThemeButton();

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
    if ((getStoredTheme() || "auto") === "auto") {
      applyTheme("auto");
    }
  });

  if (menuToggle && navLinks) {
    menuToggle.setAttribute("aria-controls", navLinks.id);
    menuToggle.setAttribute("aria-expanded", "false");

    const closeMenu = () => {
      navLinks.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navLinks.classList.contains("active")) {
        closeMenu();
        menuToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("active")
        && !navLinks.contains(event.target)
        && !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = `${scrollPercent}%`;
    }
  };

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

});
