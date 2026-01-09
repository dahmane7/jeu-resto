# Plateforme QR Avis Google + Roue

Plateforme web multi-restaurants permettant de collecter des avis Google et des données clients via un jeu de roue gamifié accessible par QR code.

## 🚀 Stack Technique

- **Frontend :** React + TypeScript + Tailwind CSS + Vite
- **Backend :** Node.js + Express + TypeScript
- **Base de données :** Airtable
- **API Client :** Airtable SDK
- **Auth :** JWT

## 📁 Structure du Projet

```
/jeu-resto
  /backend
    /src
      /controllers
      /routes
      /middleware
      /services
      /utils
    /prisma
      schema.prisma
  /frontend
    /src
      /components
      /pages
      /hooks
      /services
      /store
      /types
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- Compte Airtable avec une base créée
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp env.example .env
# Éditer .env avec vos clés Airtable :
# - AIRTABLE_API_KEY (récupérable sur https://airtable.com/api)
# - AIRTABLE_BASE_ID (visible dans l'URL de votre base)
npm run dev
```

**Configuration Airtable :**
1. Créez les tables dans Airtable selon le schéma dans `backend/src/utils/airtable-schema.md`
2. Récupérez votre API Key sur https://airtable.com/api
3. Notez votre Base ID (dans l'URL de votre base)
4. Configurez les variables dans `.env`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📊 Base de Données

La base de données utilise **Airtable**. Le schéma des tables est documenté dans `backend/src/utils/airtable-schema.md`.

### Tables principales :
- `Restaurants` - Informations des restaurants
- `Users` - Utilisateurs (Super-admin, Admin restaurant, Staff)
- `Clients` - Clients participants
- `Prizes` - Lots de la roue
- `Participations` - Participations des clients
- `Analytics` - Événements trackés

### Configuration Airtable

Voir `backend/src/utils/airtable-schema.md` pour les instructions détaillées de configuration des tables dans Airtable.

## 🔐 Rôles

- **SUPER_ADMIN** : Gestion de tous les restaurants et utilisateurs
- **ADMIN_RESTAURANT** : Gestion d'un restaurant spécifique
- **STAFF** : Mode caisse pour récupération des lots

## 📝 Documentation

Voir `cursor_prompt_resto.md` pour la documentation complète du projet.

## 🧪 Développement

- Backend : `http://localhost:3000`
- Frontend : `http://localhost:5173`

## 📄 License

ISC
