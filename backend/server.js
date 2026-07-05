import express from "express";
import cors from "cors";
import { Octokit } from "@octokit/rest";

const app = express();
app.use(cors());
app.use(express.json());

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  ADMIN_PASSWORD
} = process.env;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getFile(path) {
  try {
    const res = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH
    });

    const content = Buffer.from(res.data.content, "base64").toString("utf8");
    return { content, sha: res.data.sha };
  } catch {
    return { content: null, sha: null };
  }
}

async function saveFile(path, content, message, sha = null) {
  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {})
  });
}

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Kodem Quotes backend actif" });
});

app.post("/add-quote", async (req, res) => {
  try {
    const { password, theme, citation, author, reference } = req.body;

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    if (!theme || !citation) {
      return res.status(400).json({ error: "Thème et citation obligatoires" });
    }

    const fileName = `${slugify(theme)}.txt`;
    const quotePath = `Quotes/${fileName}`;
    const themesPath = "Quotes/themes.json";

    const line = [
      citation.trim(),
      author?.trim() || "",
      reference?.trim() || ""
    ].filter(Boolean).join(" | ");

    const quoteFile = await getFile(quotePath);
    const newQuoteContent = quoteFile.content
      ? `${quoteFile.content.trim()}\n${line}\n`
      : `${line}\n`;

    await saveFile(
      quotePath,
      newQuoteContent,
      `Ajout citation - ${theme}`,
      quoteFile.sha
    );

    const themesFile = await getFile(themesPath);
    let themes = themesFile.content ? JSON.parse(themesFile.content) : [];

    const exists = themes.some(t => t.file === quotePath);

    if (!exists) {
      themes.push({
        name: theme.trim(),
        file: quotePath,
        description: `Citations sur ${theme.trim()}`
      });

      await saveFile(
        themesPath,
        JSON.stringify(themes, null, 2),
        `Ajout thème - ${theme}`,
        themesFile.sha
      );
    }

    res.json({ ok: true, message: "Citation ajoutée avec succès" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend lancé sur le port ${PORT}`);
});