import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { useQuotesRealtime } from "./hooks/useQuotesRealtime";
import Header from "./components/Header";
import ThemeFilter from "./components/ThemeFilter";
import QuoteList from "./components/QuoteList";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const {
    themes,
    quotes,
    loading,
    refreshing,
    error,
    refresh
  } = useQuotesRealtime();

  const [session, setSession] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const counts = useMemo(() => {
    const result = { all: quotes.length, none: 0 };

    for (const quote of quotes) {
      const key =
        quote.theme_id === null || quote.theme_id === undefined
          ? "none"
          : String(quote.theme_id);

      result[key] = (result[key] ?? 0) + 1;
    }

    return result;
  }, [quotes]);

  const visibleQuotes = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    return quotes.filter((quote) => {
      const matchesTheme =
        selectedThemeId === "all" ||
        (selectedThemeId === "none" && !quote.theme_id) ||
        String(quote.theme_id) === selectedThemeId;

      if (!matchesTheme) return false;
      if (!normalizedSearch) return true;

      const haystack = [
        quote.texte,
        quote.auteur,
        quote.reference,
        quote.theme?.nom
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr");

      return haystack.includes(normalizedSearch);
    });
  }, [quotes, search, selectedThemeId]);

  async function logout() {
    await supabase.auth.signOut();
    setAdminOpen(false);
  }

  return (
    <div className="app-shell">
      <Header
        isAdminOpen={adminOpen}
        session={session}
        refreshing={refreshing}
        onToggleAdmin={() => setAdminOpen((open) => !open)}
        onLogout={logout}
      />

      {adminOpen && (
        <AdminPanel
          session={session}
          onThemeCreated={() => refresh({ silent: true })}
        />
      )}

      <main>
        <section className="toolbar">
          <div>
            <h2>Toutes les citations</h2>
            <p>
              {visibleQuotes.length} citation
              {visibleQuotes.length > 1 ? "s" : ""} affichée
              {visibleQuotes.length > 1 ? "s" : ""}
            </p>
          </div>

          <label className="search-box">
            <span className="sr-only">Rechercher</span>
            <input
              type="search"
              placeholder="Rechercher une citation, un auteur…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </section>

        <ThemeFilter
          themes={themes}
          selectedThemeId={selectedThemeId}
          onChange={setSelectedThemeId}
          counts={counts}
        />

        <QuoteList
          quotes={visibleQuotes}
          loading={loading}
          error={error}
          onRetry={() => refresh()}
        />
      </main>

      <footer>
        <span>Kodem Quotes V2</span>
        <span>Données synchronisées avec Supabase</span>
      </footer>
    </div>
  );
}
