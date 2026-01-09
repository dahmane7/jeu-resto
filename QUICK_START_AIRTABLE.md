# 🚀 Guide de Démarrage Rapide - Airtable

## Étape 1 : Créer votre Base Airtable

1. Allez sur [Airtable.com](https://airtable.com) et créez un compte
2. Créez une nouvelle base (ou utilisez une existante)
3. Notez votre **Base ID** dans l'URL : `https://airtable.com/appXXXXXXXXXXXXXX`

## Étape 2 : Créer les Tables

Créez les 6 tables suivantes dans votre base Airtable. Voir `backend/src/utils/airtable-schema.md` pour les détails complets.

### Table 1 : Restaurants
- `name` (Single line text, Required)
- `slug` (Single line text, Required, Unique)
- `address` (Single line text, Required)
- `google_review_url` (URL, Required)
- `is_active` (Checkbox, Default: true)
- `phone` (Phone number, Optional)
- `email` (Email, Optional)
- `wheel_active` (Checkbox, Default: true)
- `created_at` (Date with time, Auto)
- `updated_at` (Date with time, Auto)

### Table 2 : Users
- `email` (Email, Required, Unique)
- `password_hash` (Single line text, Required)
- `role` (Single select: SUPER_ADMIN, ADMIN_RESTAURANT, STAFF)
- `restaurant_id` (Link to Restaurants, Optional)
- `created_at` (Date with time, Auto)

### Table 3 : Clients
- `restaurant_id` (Link to Restaurants, Required)
- `phone` (Phone number, Required)
- `email` (Email, Required)
- `first_name` (Single line text, Optional)
- `last_name` (Single line text, Optional)
- `city` (Single line text, Optional)
- `age_range` (Single select: -18, 18-24, 25-34, 35-44, 45+)
- `gdpr_consent` (Checkbox, Default: false)
- `consent_date` (Date, Optional)
- `created_at` (Date with time, Auto)
- `updated_at` (Date with time, Auto)

### Table 4 : Prizes
- `restaurant_id` (Link to Restaurants, Required)
- `name` (Single line text, Required)
- `percentage` (Number, Required)
- `message` (Long text, Required)
- `is_active` (Checkbox, Default: true)
- `created_at` (Date with time, Auto)
- `updated_at` (Date with time, Auto)

### Table 5 : Participations
- `restaurant_id` (Link to Restaurants, Required)
- `client_id` (Link to Clients, Required)
- `prize_id` (Link to Prizes, Optional)
- `status` (Single select: A_RECUPERER, RECUPERE, EXPIRE)
- `won_at` (Date with time, Required)
- `expires_at` (Date with time, Required)
- `claimed_at` (Date with time, Optional)
- `is_lost` (Checkbox, Default: false)
- `created_at` (Date with time, Auto)

### Table 6 : Analytics
- `restaurant_id` (Link to Restaurants, Required)
- `event_type` (Single select: VISIT, GOOGLE_CLICK, FORM_SUBMIT, SPIN, WIN, LOSE, CLAIM)
- `date` (Date with time, Auto)
- `client_id` (Link to Clients, Optional)
- `participation_id` (Link to Participations, Optional)

## Étape 3 : Récupérer l'API Key

1. Allez sur https://airtable.com/api
2. Sélectionnez votre base
3. Cliquez sur "Show API key"
4. Copiez votre **Personal access token** ou **API key**

## Étape 4 : Configurer le Projet

```bash
cd backend
cp env.example .env
```

Éditez `.env` avec vos valeurs :

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
JWT_SECRET=votre_secret_jwt
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Étape 5 : Installer et Lancer

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

## Étape 6 : (Optionnel) Peupler avec des Données de Test

```bash
npm run seed
```

Cela créera :
- 1 super-admin (admin@platform.com / Admin123!)
- 2 restaurants de test
- 2 admins et 2 staff
- 6 lots (3 par restaurant)

## ✅ Vérification

Si tout fonctionne, vous devriez voir :
```
🚀 Server running on http://localhost:3000
```

Et dans les logs du seed :
```
✅ Created super admin: admin@platform.com
✅ Created restaurant: Le Bistrot Gourmand
...
✨ Seeding completed!
```

## 🆘 Problèmes Courants

### Erreur : "AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set"
→ Vérifiez que votre fichier `.env` est bien configuré

### Erreur : "Table not found"
→ Vérifiez que les noms des tables dans Airtable correspondent exactement :
- Restaurants
- Users
- Clients
- Prizes
- Participations
- Analytics

### Erreur : "Field not found"
→ Vérifiez que tous les champs sont créés avec les bons noms (sensible à la casse)

### Erreur de rate limiting
→ Airtable limite à 5 requêtes/seconde sur le plan gratuit. Attendez quelques secondes entre les requêtes.

## 📚 Documentation Complète

- Schéma détaillé : `backend/src/utils/airtable-schema.md`
- Guide de migration : `MIGRATION_AIRTABLE.md`
- README principal : `README.md`
