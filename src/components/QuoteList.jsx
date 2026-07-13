function QuoteCard({ quote }) {
  return (
    <article className="quote-card">
      <blockquote>“{quote.texte}”</blockquote>

      <div className="quote-meta">
        {(quote.auteur || quote.reference) && (
          <p>
            {quote.auteur && <strong>{quote.auteur}</strong>}
            {quote.auteur && quote.reference && " — "}
            {quote.reference && <span>{quote.reference}</span>}
          </p>
        )}

        <span className="theme-badge">
          {quote.theme?.nom ?? "Sans thème"}
        </span>
      </div>
    </article>
  );
}

export default function QuoteList({ quotes, loading, error, onRetry }) {
  if (loading) {
    return <div className="state-card">Chargement des citations…</div>;
  }

  if (error) {
    return (
      <div className="state-card state-error">
        <p>{error}</p>
        <button className="button button-primary" onClick={onRetry}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <div className="state-card">
        Aucune citation ne correspond à ce filtre.
      </div>
    );
  }

  return (
    <section className="quote-grid" aria-live="polite">
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </section>
  );
}
