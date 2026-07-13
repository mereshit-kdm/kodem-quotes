import { useState } from "react";
import { createTheme } from "../lib/data";
import LoginForm from "./LoginForm";

export default function AdminPanel({ session, onThemeCreated }) {
  const [themeName, setThemeName] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return (
      <aside className="admin-panel">
        <LoginForm />
      </aside>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const theme = await createTheme(themeName);
      setThemeName("");
      setStatus({
        type: "success",
        message: `Le thème « ${theme.nom} » a été ajouté.`
      });
      onThemeCreated?.();
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Impossible d’ajouter le thème."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside className="admin-panel">
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Administration</p>
            <h2>Ajouter un thème</h2>
          </div>
          <span className="authenticated-badge">Connecté</span>
        </div>

        <p>
          Le thème sera enregistré directement dans la table{" "}
          <code>public.themes</code>. La liste publique se mettra à jour
          automatiquement.
        </p>

        <label>
          Nom du thème
          <input
            type="text"
            placeholder="Ex. Vérité"
            maxLength={80}
            value={themeName}
            onChange={(event) => setThemeName(event.target.value)}
            required
          />
        </label>

        {status.message && (
          <p className={`form-message ${status.type}`}>
            {status.message}
          </p>
        )}

        <button
          className="button button-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Ajout en cours…" : "Ajouter le thème"}
        </button>
      </form>
    </aside>
  );
}
