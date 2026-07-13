import { supabase } from "./supabase";

export async function fetchThemesAndQuotes() {
  const [themesResult, quotesResult] = await Promise.all([
    supabase
      .from("themes")
      .select("id, nom")
      .order("nom", { ascending: true }),

    supabase
      .from("citations")
      .select("id, texte, auteur, reference, theme_id")
      .order("id", { ascending: false })
  ]);

  if (themesResult.error) {
    throw themesResult.error;
  }

  if (quotesResult.error) {
    throw quotesResult.error;
  }

  const themes = themesResult.data ?? [];
  const quotes = quotesResult.data ?? [];
  const themeById = new Map(themes.map((theme) => [theme.id, theme]));

  return {
    themes,
    quotes: quotes.map((quote) => ({
      ...quote,
      theme: themeById.get(quote.theme_id) ?? null
    }))
  };
}

export async function createTheme(rawName) {
  const nom = rawName.replace(/\s+/g, " ").trim();

  if (!nom) {
    throw new Error("Le nom du thème est obligatoire.");
  }

  const { data: existing, error: searchError } = await supabase
    .from("themes")
    .select("id, nom")
    .ilike("nom", nom)
    .limit(1);

  if (searchError) {
    throw searchError;
  }

  if (existing?.length) {
    throw new Error(`Le thème « ${existing[0].nom} » existe déjà.`);
  }

  const { data, error } = await supabase
    .from("themes")
    .insert({ nom })
    .select("id, nom")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
