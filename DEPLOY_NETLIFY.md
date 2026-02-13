# Déploiement sur Netlify

Ce projet est prêt pour un déploiement **tout-en-un** sur Netlify : frontend + API (Express) tournent via une fonction serverless.

## Prérequis

- Compte Netlify
- Base Supabase configurée (PostgreSQL)
- Repo Git (GitHub, GitLab ou Bitbucket)

## Étapes

### 1. Variables d'environnement (Netlify)

Dans **Site configuration** → **Environment variables**, ajoute :

| Variable | Valeur | Utilisation |
|----------|--------|-------------|
| `DATABASE_URL` | **URL Supabase en mode pooler** (voir ci‑dessous). Obligatoire pour que la fonction puisse joindre la base. | Backend (Prisma) |
| `JWT_SECRET` | Chaîne secrète pour signer les tokens | Auth |
| `CORS_ORIGIN` | URL du site Netlify (ex. `https://ton-site.netlify.app`) | CORS (optionnel si même origine) |
| `VITE_API_URL` | **URL du site + chemin de la fonction** (ex. `https://ton-site.netlify.app/.netlify/functions/server`) | Build frontend : appels directs vers la fonction API |

Pour un déploiement sur `https://cozy-salamander-a3f6ff.netlify.app` :

- `VITE_API_URL` = `https://cozy-salamander-a3f6ff.netlify.app/.netlify/functions/server` (sans slash final)
- `CORS_ORIGIN` = `https://cozy-salamander-a3f6ff.netlify.app`

Le front appelle alors directement la fonction (ex. `.../.netlify/functions/server/api/auth/login`), sans passer par une redirection.

#### Connexion base de données (important)

Si tu vois **« Can't reach database server at ...:5432 »** au login, la fonction Netlify n’arrive pas à joindre Supabase. À faire :

1. **Vérifier que `DATABASE_URL` est bien définie** dans Netlify (Site configuration → Environment variables), sans espace, pour l’environnement **Production** (et Build si tu veux).
2. **Utiliser l’URL en mode pooler** pour le serverless (recommandé Supabase) :
   - Dans le dashboard Supabase : **Project Settings** → **Database**.
   - Section **Connection string** : onglet **Connection pooling** (ou **Transaction** / **Session**).
   - Copier l’URL (elle utilise le host `...pooler.supabase.com` et le port **6543**, pas 5432). L’utilisateur est en général `postgres.[ref]` (ref = id du projet).
   - Ajouter en query string : `?pgbouncer=true&sslmode=require` (ou au minimum `?sslmode=require`) si ce n’est pas déjà présent.
   - Mettre cette URL dans `DATABASE_URL` sur Netlify.
3. **Vérifier que le projet Supabase n’est pas en pause** (offre gratuite) : Dashboard → Settings → General → si « Paused », cliquer sur **Restore**.

Exemple d’URL pooler qui fonctionne sur Netlify (à adapter avec ton mot de passe et ta région) :

```text
postgresql://postgres.[ref]:[MOT_DE_PASSE]@aws-1-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

Après modification des variables, redéployer le site (Deploy → Trigger deploy).

### 2. Connexion du repo

1. **Add new site** → **Import an existing project**
2. Choisis ton repo
3. Netlify détecte `netlify.toml` :
   - **Build command** : `npm run build` (build backend puis frontend)
   - **Publish directory** : `frontend/dist`
   - **Functions** : `netlify/functions`

Aucune config manuelle nécessaire si `netlify.toml` est à la racine.

### 3. Déploiement

À chaque push sur la branche branchée, Netlify :

1. Installe les dépendances (racine + backend + frontend via les scripts)
2. Build le backend (`backend/dist` + Prisma)
3. Build le frontend (`frontend/dist`)
4. Déploie le site (fichiers dans `frontend/dist`)
5. Déploie la fonction `server` (Express wrappé par serverless-http)

Les requêtes vers `/api/*` sont envoyées à la fonction ; le reste sert le SPA (React).

## Développement en local

- **Backend seul** : `cd backend && npm run dev` (serveur sur http://localhost:3000)
- **Frontend seul** : `cd frontend && npm run dev` (Vite sur http://localhost:5173)
- Le front en local utilise `VITE_API_URL` ou `http://localhost:3000` par défaut

## En cas d’erreur de déploiement

- **« Can't reach database server » (500 au login)** : voir la section **Connexion base de données** plus haut (DATABASE_URL sur Netlify, URL pooler Supabase, projet non en pause).
- **Function bundle trop gros** : le backend + Prisma peuvent dépasser la limite. Vérifier la taille dans les logs Netlify ; si besoin, héberger le backend ailleurs (ex. Render) et mettre cette URL dans `VITE_API_URL`.
- **502 / timeout** : augmenter le timeout de la fonction dans Netlify (plan payant) ou optimiser les requêtes DB.
- **CORS** : si tu appelles le site depuis un autre domaine, définis `CORS_ORIGIN` sur cette origine.
