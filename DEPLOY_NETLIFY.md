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
| `DATABASE_URL` | URL de connexion Supabase (PostgreSQL) avec `?sslmode=require` | Backend (Prisma) |
| `JWT_SECRET` | Chaîne secrète pour signer les tokens | Auth |
| `CORS_ORIGIN` | URL du site Netlify (ex. `https://ton-site.netlify.app`) | CORS (optionnel si même origine) |
| `VITE_API_URL` | **Même URL** que le site (ex. `https://ton-site.netlify.app`) | Build frontend : appels API vers ton site |

Pour un déploiement sur `https://mon-jeu-resto.netlify.app` :

- `VITE_API_URL` = `https://mon-jeu-resto.netlify.app`
- `CORS_ORIGIN` = `https://mon-jeu-resto.netlify.app`

Le front appelle alors `https://mon-jeu-resto.netlify.app/api/...`, redirigé par Netlify vers la fonction.

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

- **Function bundle trop gros** : le backend + Prisma peuvent dépasser la limite. Vérifier la taille dans les logs Netlify ; si besoin, héberger le backend ailleurs (ex. Render) et mettre cette URL dans `VITE_API_URL`.
- **502 / timeout** : augmenter le timeout de la fonction dans Netlify (plan payant) ou optimiser les requêtes DB.
- **CORS** : si tu appelles le site depuis un autre domaine, définis `CORS_ORIGIN` sur cette origine.
