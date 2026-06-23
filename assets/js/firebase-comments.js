import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const demoComments = [
  {
    name: "Docente evaluador",
    role: "Revision academica",
    message: "La informacion esta organizada y el protocolo remoto se entiende con claridad.",
    createdAt: new Date("2026-06-07T18:49:00")
  },
  {
    name: "Visitante",
    role: "Usuario domestico",
    message: "Me gusto que separaran servicios, blog y evidencias. Es facil encontrar cada parte.",
    createdAt: new Date("2026-06-15T20:12:00")
  }
];

const root = document.querySelector("[data-comments-root]");
const form = document.querySelector("[data-comment-form]");
const feed = document.querySelector("[data-comments-feed]");
const statusNode = document.querySelector("[data-comment-status]");
const localStorageKey = "fenixlabs-local-comments";

const isFirebaseConfigured = Object.entries(firebaseConfig).every(([key, value]) => {
  if (key === "storageBucket" || key === "messagingSenderId") {
    return true;
  }
  return typeof value === "string" && value.trim().length > 0;
});

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const getDate = (value) => {
  if (!value) {
    return new Date();
  }
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date(value);
};

const formatDate = (value) => {
  const date = getDate(value);
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const renderComments = (comments) => {
  if (!feed) {
    return;
  }

  if (!comments.length) {
    feed.innerHTML = '<p class="comments-empty">Aun no hay comentarios. Se el primero en escribir.</p>';
    return;
  }

  feed.innerHTML = comments.map((comment) => `
    <article class="firebase-comment">
      <header>
        <div>
          <strong>${escapeHtml(comment.name || "Visitante")}</strong>
          <span>${escapeHtml(comment.role || "Comentario")}</span>
        </div>
        <time>${formatDate(comment.createdAt)}</time>
      </header>
      <p>${escapeHtml(comment.message)}</p>
    </article>
  `).join("");
};

const getLocalComments = () => {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey) || "[]")
      .map((comment) => ({ ...comment, createdAt: new Date(comment.createdAt) }));
  } catch {
    return [];
  }
};

const saveLocalComment = (comment) => {
  const comments = [comment, ...getLocalComments()].slice(0, 24);
  localStorage.setItem(localStorageKey, JSON.stringify(comments));
  renderComments([...comments, ...demoComments]);
};

const setStatus = (message, type = "idle") => {
  if (!statusNode) {
    return;
  }
  statusNode.textContent = message;
  statusNode.dataset.status = type;
};

if (root && form && feed) {
  if (isFirebaseConfigured) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const commentsRef = collection(db, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"), limit(30));

    setStatus("Firebase conectado. Los comentarios se guardan en Firestore.", "ready");

    onSnapshot(commentsQuery, (snapshot) => {
      const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderComments(comments);
    }, () => {
      setStatus("No se pudieron cargar los comentarios. Revisa reglas o configuracion de Firebase.", "error");
      renderComments([...getLocalComments(), ...demoComments]);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const comment = {
        name: data.get("name").trim(),
        role: data.get("role").trim() || "Visitante",
        message: data.get("message").trim(),
        page: "index",
        createdAt: serverTimestamp()
      };

      if (!comment.name || !comment.message) {
        setStatus("Completa nombre y comentario antes de publicar.", "error");
        return;
      }

      try {
        setStatus("Publicando comentario...", "idle");
        await addDoc(commentsRef, comment);
        form.reset();
        setStatus("Comentario publicado correctamente.", "ready");
      } catch {
        setStatus("No se pudo publicar. Revisa permisos de Firestore.", "error");
      }
    });
  } else {
    setStatus("Modo demo local activo hasta conectar Firebase.", "idle");
    renderComments([...getLocalComments(), ...demoComments]);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const comment = {
        name: data.get("name").trim(),
        role: data.get("role").trim() || "Visitante",
        message: data.get("message").trim(),
        createdAt: new Date()
      };

      if (!comment.name || !comment.message) {
        setStatus("Completa nombre y comentario antes de publicar.", "error");
        return;
      }

      saveLocalComment(comment);
      form.reset();
      setStatus("Comentario guardado en este navegador. Pega tu config de Firebase para hacerlo real.", "ready");
    });
  }
}
