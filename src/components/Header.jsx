export default function Header({
  isAdminOpen,
  session,
  refreshing,
  onToggleAdmin,
  onLogout
}) {
  return (
    <header className="site-header">
      <div>
        <p className="eyebrow">Version 2.0</p>
        <h1>Kodem Quotes</h1>
        <p className="subtitle">
          Des citations classées par thèmes, mises à jour en temps réel.
        </p>
      </div>

      <div className="header-actions">
        {refreshing && (
          <span className="live-status" role="status">
            Actualisation…
          </span>
        )}

        {session && (
          <button className="button button-ghost" onClick={onLogout}>
            Déconnexion
          </button>
        )}

        <button
          className="button button-primary"
          onClick={onToggleAdmin}
          aria-expanded={isAdminOpen}
        >
          {isAdminOpen ? "Fermer l’administration" : "Administration"}
        </button>
      </div>
    </header>
  );
}
