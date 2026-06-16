const COMMENT_PROVIDER = {
  mode: "local",
  github: {
    repo: "",
    category: "General",
  },
};

const INDEX_COMMENTS_KEY = "fenixlabs-comments:index";

const SEEDED_INDEX_COMMENTS = [
  {
    name: "Docente evaluador",
    text: "La información es clara y se relaciona con soporte remoto, normas de atención y documentación del proyecto.",
    createdAt: "2026-06-07T18:49:00-06:00",
    seeded: true,
  },
  {
    name: "Usuario externo",
    text: "Me gusta que el sitio se vea como una empresa real aunque sea un proyecto académico.",
    createdAt: "2026-06-07T19:05:00-06:00",
    seeded: true,
  },
  {
    name: "Compañero de clase",
    text: "El blog ayuda a encontrar rápido las entradas y entender qué aporta cada sección.",
    createdAt: "2026-06-07T19:18:00-06:00",
    seeded: true,
  },
  {
    name: "Cliente simulado",
    text: "La explicación de soporte presencial y remoto queda directa y fácil de consultar.",
    createdAt: "2026-06-07T19:42:00-06:00",
    seeded: true,
  },
  {
    name: "Revisión académica",
    text: "La organización por temas facilita revisar el proyecto y entender cada servicio.",
    createdAt: "2026-06-07T20:03:00-06:00",
    seeded: true,
  },
  {
    name: "Visitante del sitio",
    text: "El diseño se siente limpio, serio y consistente para presentar un servicio técnico.",
    createdAt: "2026-06-07T20:26:00-06:00",
    seeded: true,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  setupIndexComments();
});

function setupIndexComments() {
  const section = document.querySelector("[data-index-comments]");
  if (!section) return;

  const form = section.querySelector("[data-index-comment-form]");
  const card = section.querySelector("[data-index-comment-card]");
  const progress = section.querySelector("[data-index-comment-progress]");
  const counter = section.querySelector("[data-index-comment-counter]");
  let currentIndex = 0;
  let rotationId;

  const getVisibleComments = () => [
    ...readLocalComments(INDEX_COMMENTS_KEY),
    ...SEEDED_INDEX_COMMENTS,
  ];

  function renderPreview(preferredIndex = currentIndex) {
    const comments = getVisibleComments();

    if (!comments.length) {
      card.innerHTML = `<p class="comments-empty">Aún no hay comentarios publicados.</p>`;
      counter.textContent = "0 / 0";
      return;
    }

    currentIndex = Math.max(0, Math.min(preferredIndex, comments.length - 1));
    const comment = comments[currentIndex];
    card.classList.remove("is-visible");

    window.setTimeout(() => {
      card.innerHTML = `
        <div>
          <strong>${escapeHtml(comment.name)}</strong>
          <span>${formatDate(comment.createdAt)}</span>
        </div>
        <p>${escapeHtml(comment.text)}</p>
      `;
      counter.textContent = `${currentIndex + 1} / ${comments.length}`;
      card.classList.add("is-visible");
      restartProgress(progress);
    }, 140);
  }

  function restartRotation() {
    window.clearInterval(rotationId);
    rotationId = window.setInterval(() => {
      const comments = getVisibleComments();
      if (!comments.length) return;
      currentIndex = (currentIndex + 1) % comments.length;
      renderPreview(currentIndex);
    }, 6200);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const text = String(formData.get("comment") || "").trim();

    if (!name || !text) return;

    const comments = readLocalComments(INDEX_COMMENTS_KEY);
    comments.unshift({
      name,
      text,
      createdAt: new Date().toISOString(),
    });

    saveLocalComments(INDEX_COMMENTS_KEY, comments.slice(0, 30));
    form.reset();
    renderPreview(0);
    restartRotation();
  });

  renderPreview();
  restartRotation();
}

function readLocalComments(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveLocalComments(key, comments) {
  try {
    localStorage.setItem(key, JSON.stringify(comments));
  } catch {
    // Static fallback: if storage is blocked, the form simply will not persist.
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function restartProgress(progress) {
  if (!progress) return;
  progress.classList.remove("is-running");
  void progress.offsetWidth;
  progress.classList.add("is-running");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}
