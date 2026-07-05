const API_BASE_URL = "https://kodem-quotes.onrender.com";
const API_ADD_QUOTE = API_BASE_URL + "/add-quote";
const THEMES_FILE = "Quotes/themes.json";

const form = document.getElementById("quoteForm");
const passwordInput = document.getElementById("password");
const themeInput = document.getElementById("theme");
const citationInput = document.getElementById("citation");
const authorInput = document.getElementById("author");
const referenceInput = document.getElementById("reference");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("message");
const deployBox = document.getElementById("deployBox");
const progressBar = document.getElementById("progressBar");
const deployStatus = document.getElementById("deployStatus");
const deployTimer = document.getElementById("deployTimer");
const viewSiteBtn = document.getElementById("viewSiteBtn");
const addAnotherBtn = document.getElementById("addAnotherBtn");
const themeOptions = document.getElementById("themeOptions");

let deployStartTime = null;
let timerInterval = null;

initAdmin();

async function initAdmin() {
  try {
    const response = await fetch(THEMES_FILE + "?v=" + Date.now());
    const themes = await response.json();

    themeOptions.innerHTML = "";
    themes.forEach(theme => {
      const option = document.createElement("option");
      option.value = theme.name;
      themeOptions.appendChild(option);
    });
  } catch {}
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    password: passwordInput.value.trim(),
    theme: themeInput.value.trim(),
    citation: citationInput.value.trim(),
    author: authorInput.value.trim(),
    reference: referenceInput.value.trim()
  };

  if (!data.theme || !data.citation || !data.password) {
    showMessage("Veuillez remplir le mot de passe, le thème et la citation.", "error");
    return;
  }

  resetDeployUI();
  setFormEnabled(false);
  showMessage("Envoi vers Render...", "success");
  setProgress(10, "Envoi vers le backend Render...");

  try {
    const response = await fetch(API_ADD_QUOTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Erreur lors de l'ajout.");
    }

    showMessage("Citation ajoutée dans GitHub. Vérification du déploiement...", "success");
    setProgress(40, "Commit GitHub effectué. Attente du déploiement GitHub Pages...");
    startDeploymentCheck(data);

  } catch (error) {
    showMessage(error.message, "error");
    setProgress(0, "Erreur.");
    setFormEnabled(true);
  }
});

function startDeploymentCheck(data) {
  deployStartTime = Date.now();
  deployBox.classList.remove("hidden");
  startTimer();

  const slug = slugify(data.theme);
  const fileUrl = `Quotes/${slug}.txt`;

  let attempts = 0;
  const maxAttempts = 36;

  const interval = setInterval(async () => {
    attempts++;
    const percent = Math.min(95, 40 + attempts * 2);
    setProgress(percent, `Déploiement en cours... vérification ${attempts}/${maxAttempts}`);

    try {
      const response = await fetch(fileUrl + "?v=" + Date.now());
      const text = await response.text();

      if (response.ok && text.includes(data.citation)) {
        clearInterval(interval);
        stopTimer();

        setProgress(100, "✅ Déploiement terminé. La citation est visible sur le site.");
        showMessage("Citation visible sur le site.", "success");

        viewSiteBtn.href = "index.html?v=" + Date.now();
        viewSiteBtn.classList.remove("hidden");
        addAnotherBtn.classList.remove("hidden");
        return;
      }
    } catch {}

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      stopTimer();

      setProgress(95, "La citation est ajoutée, mais GitHub Pages prend plus de temps que prévu.");
      showMessage("Citation ajoutée. Rechargez le site dans quelques instants si elle n'apparaît pas encore.", "error");

      viewSiteBtn.href = "index.html?v=" + Date.now();
      viewSiteBtn.classList.remove("hidden");
      addAnotherBtn.classList.remove("hidden");
    }
  }, 5000);
}

addAnotherBtn.addEventListener("click", () => {
  citationInput.value = "";
  authorInput.value = "";
  referenceInput.value = "";
  resetDeployUI();
  setFormEnabled(true);
  citationInput.focus();
});

function resetDeployUI() {
  deployBox.classList.remove("hidden");
  progressBar.style.width = "0%";
  deployStatus.textContent = "En attente...";
  deployTimer.textContent = "";
  viewSiteBtn.classList.add("hidden");
  addAnotherBtn.classList.add("hidden");
}

function setProgress(percent, text) {
  progressBar.style.width = percent + "%";
  deployStatus.textContent = text;
}

function setFormEnabled(enabled) {
  submitBtn.disabled = !enabled;
  submitBtn.textContent = enabled ? "Ajouter la citation" : "Traitement en cours...";
  themeInput.disabled = !enabled;
  citationInput.disabled = !enabled;
  authorInput.disabled = !enabled;
  referenceInput.disabled = !enabled;
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
  messageBox.classList.remove("hidden");
}

function startTimer() {
  timerInterval = setInterval(() => {
    const seconds = Math.floor((Date.now() - deployStartTime) / 1000);
    deployTimer.textContent = `Temps écoulé : ${seconds} seconde(s)`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
