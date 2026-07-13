export default function ThemeFilter({
  themes,
  selectedThemeId,
  onChange,
  counts
}) {
  return (
    <nav className="theme-filter" aria-label="Filtrer par thème">
      <button
        className={selectedThemeId === "all" ? "chip chip-active" : "chip"}
        onClick={() => onChange("all")}
      >
        Tous <span>{counts.all ?? 0}</span>
      </button>

      <button
        className={selectedThemeId === "none" ? "chip chip-active" : "chip"}
        onClick={() => onChange("none")}
      >
        Sans thème <span>{counts.none ?? 0}</span>
      </button>

      {themes.map((theme) => (
        <button
          key={theme.id}
          className={
            selectedThemeId === String(theme.id)
              ? "chip chip-active"
              : "chip"
          }
          onClick={() => onChange(String(theme.id))}
        >
          {theme.nom} <span>{counts[String(theme.id)] ?? 0}</span>
        </button>
      ))}
    </nav>
  );
}
