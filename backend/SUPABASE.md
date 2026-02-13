# Connexion Supabase (PostgreSQL)

## 1. Variables d'environnement

Dans `backend/.env`, assure-toi d'avoir :

```env
DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@db.vedzbcstpkzstdwvixmx.supabase.co:5432/postgres?sslmode=require
```

- Remplace **TON_MOT_DE_PASSE** par le mot de passe de ta base Supabase (sans crochets).
- Le `?sslmode=require` en fin d’URL est nécessaire pour la connexion.

## 2. Première migration

Une fois le bon mot de passe dans `.env`, exécute dans le dossier `backend` :

```bash
npm run db:migrate
```

ou :

```bash
npx prisma migrate dev --name init
```

Cela crée toutes les tables sur Supabase (Restaurant, User, Client, Prize, Participation, Analytics).

## 3. Données initiales (seed)

Pour créer un restaurant et un compte admin de test :

```bash
cd backend
npm run seed
```

Cela crée :
- Un restaurant **Mon Restaurant** (slug : `mon-restaurant`)
- Un utilisateur **admin@restaurant.com** / **Admin123!** (rôle Admin Restaurant)

Tu peux ensuite te connecter à l’app avec ces identifiants.

## 4. Vérifier la connexion

- Démarrer le backend : `npm run dev`
- Ouvrir : http://localhost:3000/api/health  
  Si tout est bon, tu verras `"database": "connected"`.

## 5. Migration claim_code (parcours client)

Pour enregistrer les participations avec un code de réclamation (ex. ABC-123-XYZ), applique la migration :

```bash
cd backend
npx prisma migrate deploy
```

(Si tu préfères en dev : `npx prisma migrate dev --name add_claim_code`.)

## 6. Optionnel : Prisma Studio

Pour voir et modifier les données dans le navigateur :

```bash
npm run db:studio
```

## Erreur TLS "bad certificate format"

Si tu as une erreur TLS en lançant la migration, essaie depuis ton terminal (en dehors de Cursor) ou utilise l’URL **Session pooler** ou **Transaction pooler** depuis le dashboard Supabase (Connect → onglet correspondant) et mets cette URL dans `DATABASE_URL` (avec `?sslmode=require` en fin si besoin).
