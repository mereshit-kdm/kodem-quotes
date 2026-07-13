import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setStatus({
        type: "error",
        message: error.message || "Connexion refusée."
      });
    }

    setSubmitting(false);
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>Connexion administrateur</h2>
      <p>
        Utilisez le compte administrateur créé dans Supabase Auth.
      </p>

      <label>
        Adresse e-mail
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label>
        Mot de passe
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
        {submitting ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
