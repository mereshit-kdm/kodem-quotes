const THEMES_FILE = "Quotes/themes.json";

let themes = [];
let currentQuotes = [];

const homePage = document.getElementById("homePage");
const quotesPage = document.getElementById("quotesPage");
const themeList = document.getElementById("themeList");
const themeSearch = document.getElementById("themeSearch");
const quoteSearch = document.getElementById("quoteSearch");
const classifyBy = document.getElementById("classifyBy");
const themeTitle = document.getElementById("themeTitle");
const quoteCount = document.getElementById("quoteCount");
const quotesContainer = document.getElementById("quotesContainer");

function noCacheUrl(file) {
  return file + "?v=" + Date.now();
}

async function init() {
  try {
    const response = await fetch(noCacheUrl(THEMES_FILE));
    themes = await response.json();
    renderThemes(themes);
  } catch (error) {
    themeList.innerHTML = `<div class="empty">Impossible de charger les thèmes.</div>`;
  }
}

function renderThemes(list) {
  themeList.innerHTML = "";

  if (list.length === 0) {
    themeList.innerHTML = `<div class="empty">Aucun thème trouvé.</div>`;
    return;
  }

  list.forEach(theme => {
    const card = document.createElement("div");
    card.className = "theme-card";
    card.onclick = () => loadTheme(theme);

    card.innerHTML = `
      <h2>${escapeHtml(theme.name)}</h2>
      <p>${escapeHtml(theme.description || "Voir les citations")}</p>
    `;

    themeList.appendChild(card);
  });
}

async function loadTheme(theme) {
  themeTitle.textContent = theme.name;
  quotesContainer.innerHTML = `<div class="empty">Chargement...</div>`;

  try {
    const response = await fetch(noCacheUrl(theme.file));
    const text = await response.text();

    currentQuotes = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(parseQuoteLine);

    homePage.classList.add("hidden");
    quotesPage.classList.remove("hidden");

    quoteSearch.value = "";
    classifyBy.value = "all";

    renderQuotes();
    window.scrollTo(0, 0);
  } catch (error) {
    quotesContainer.innerHTML = `<div class="empty">Impossible de charger les citations.</div>`;
  }
}

function parseQuoteLine(line) {
  const parts = line.split("|").map(p => p.trim());
  return { text: parts[0] || "", author: parts[1] || "", reference: parts[2] || "" };
}

function renderQuotes() {
  const search = quoteSearch.value.toLowerCase().trim();
  const mode = classifyBy.value;

  const filteredQuotes = currentQuotes.filter(q =>
    `${q.text} ${q.author} ${q.reference}`.toLowerCase().includes(search)
  );

  quoteCount.textContent = `${filteredQuotes.length} citation(s)`;

  if (filteredQuotes.length === 0) {
    quotesContainer.innerHTML = `<div class="empty">Aucune citation trouvée.</div>`;
    return;
  }

  quotesContainer.innerHTML = "";

  if (mode === "all") {
    quotesContainer.appendChild(createGroup("Toutes les citations", filteredQuotes, true));
    return;
  }

  const groups = {};

  filteredQuotes.forEach(q => {
    let key = q[mode];

    if (!key) {
      key = mode === "author" ? "Source / auteur non précisé" : "Référence non précisée";
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(q);
  });

  Object.keys(groups).sort().forEach(groupName => {
    quotesContainer.appendChild(createGroup(groupName, groups[groupName], false));
  });
}

function createGroup(title, quotes, open = false) {
  const details = document.createElement("details");
  details.className = "group";
  if (open) details.open = true;

  const summary = document.createElement("summary");
  summary.textContent = `${title} (${quotes.length})`;
  details.appendChild(summary);

  quotes.forEach(q => {
    const card = document.createElement("article");
    card.className = "quote-card";

    card.innerHTML = `
      <div class="quote-text">“${escapeHtml(q.text)}”</div>
      <div class="quote-meta">
        ${q.author ? `<div><strong>Source / Auteur :</strong> ${escapeHtml(q.author)}</div>` : ""}
        ${q.reference ? `<div><strong>Référence :</strong> ${escapeHtml(q.reference)}</div>` : ""}
      </div>
    `;

    details.appendChild(card);
  });

  return details;
}

function goBack() {
  quotesPage.classList.add("hidden");
  homePage.classList.remove("hidden");
  quotesContainer.innerHTML = "";
  window.scrollTo(0, 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

themeSearch.addEventListener("input", () => {
  const search = themeSearch.value.toLowerCase();
  const filtered = themes.filter(theme =>
    `${theme.name} ${theme.description || ""}`.toLowerCase().includes(search)
  );
  renderThemes(filtered);
});

quoteSearch.addEventListener("input", renderQuotes);
classifyBy.addEventListener("change", renderQuotes);

init();
