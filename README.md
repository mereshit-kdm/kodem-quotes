# Kodem Quotes V2

Refonte React + Vite + Supabase, sans fichiers TXT.

## Fonctionnalités

- lecture directe des tables `themes` et `citations`;
- affichage et filtrage des citations;
- recherche par citation, auteur, référence ou thème;
- rafraîchissement automatique via Supabase Realtime;
- connexion administrateur avec Supabase Auth;
- ajout d'un thème depuis l'espace d'administration;
- aucune modification de la structure actuelle de la base.

## Structure de base attendue

Le code utilise uniquement les colonnes déjà décrites :

### `public.themes`

- `id`
- `nom`

### `public.citations`

- `id`
- `texte`
- `auteur`
- `reference`
- `theme_id`

## Installation locale

```bash
npm install
cp .env.example .env
npm run dev
```

Dans `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

La clé Publishable est une clé cliente. Ne placez jamais de clé Secret ou
`service_role` dans cette application.

## Compte administrateur

Créez l'utilisateur administrateur dans :

Supabase > Authentication > Users

Le formulaire utilise `signInWithPassword`.

## RLS nécessaire

Le site public doit pouvoir effectuer :

- `SELECT` sur `public.themes`;
- `SELECT` sur `public.citations`.

L'utilisateur authentifié doit pouvoir effectuer :

- `INSERT` sur `public.themes`.

Conservez vos politiques RLS existantes si elles couvrent déjà ces opérations.
Le code n'exige aucun changement de colonne ou de table.

Exemple de politique d'insertion réservée aux utilisateurs authentifiés :

```sql
create policy "authenticated users can insert themes"
on public.themes
for insert
to authenticated
with check (true);
```

## Realtime

Dans Supabase, vérifiez que `themes` et `citations` sont incluses dans la
publication Realtime. Lorsqu'une ligne est créée, modifiée ou supprimée, le
site recharge automatiquement les deux listes.

## Déploiement Render

1. Créez un nouveau **Static Site** depuis le dépôt GitHub.
2. Build command : `npm ci && npm run build`
3. Publish directory : `dist`
4. Ajoutez les variables :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Déployez.

Le fichier `render.yaml` peut également être utilisé comme Blueprint.

## Version

`2.0.0`
