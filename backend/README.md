# Backend - Jeu Resto

API backend pour la plateforme QR Avis Google + Roue.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

1. Copier `env.example` vers `.env`
2. Configurer les variables Airtable :
   - `AIRTABLE_API_KEY` : Récupérable sur https://airtable.com/api
   - `AIRTABLE_BASE_ID` : Visible dans l'URL de votre base Airtable
3. Configurer `JWT_SECRET` avec une clé secrète

### Base de données Airtable

1. **Créer les tables dans Airtable** selon le schéma dans `src/utils/airtable-schema.md`
2. **Récupérer l'API Key** :
   - Allez sur https://airtable.com/api
   - Sélectionnez votre base
   - Copiez votre API Key
3. **Récupérer le Base ID** :
   - Dans l'URL de votre base : `https://airtable.com/appXXXXXXXXXXXXXX`
   - Le Base ID est la partie après `/app`
4. **Configurer .env** avec ces valeurs

### Seed (Optionnel)

```bash
# Peupler la base avec des données de test
npm run seed
```

### Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 📁 Structure

```
src/
  controllers/    # Contrôleurs pour les routes
  routes/         # Définition des routes
  middleware/     # Middleware (auth, validation, etc.)
  services/       # Logique métier
  utils/          # Utilitaires (Airtable, etc.)
  types/          # Types TypeScript
```

## 🔐 Authentification

L'authentification utilise JWT. Les tokens sont stockés dans les cookies ou headers Authorization.

## 📊 API Endpoints

Voir la documentation complète dans `cursor_prompt_resto.md`.
