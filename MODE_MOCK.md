# 🎭 Mode MOCK - Test sans Airtable

## 📝 Description

Le système est configuré pour fonctionner en mode **MOCK** (factice) lorsque Airtable n'est pas configuré. Cela permet de tester le frontend sans avoir besoin de configurer Airtable.

## ✅ Utilisateur Factice Disponible

### Admin Restaurant
- **Email :** `admin@restaurant.com`
- **Password :** `Admin123!`
- **Rôle :** `ADMIN_RESTAURANT`
- **Restaurant ID :** `restaurant-1`
- **Redirection :** `/restaurant/restaurant-1/dashboard`

## 🚀 Comment Utiliser

### Option 1 : Sans fichier .env (Recommandé pour test)

Le mode MOCK s'active automatiquement si `AIRTABLE_API_KEY` n'est pas défini.

```bash
cd backend
npm run dev
```

Vous verrez :
```
🚀 Server running on http://localhost:3000
📝 Mode MOCK activé - Utilisation de données factices
👤 Utilisateurs disponibles :
   - admin@platform.com / Admin123! (SUPER_ADMIN)
   - admin-bistrot@test.com / Admin123! (ADMIN_RESTAURANT)
   - staff-bistrot@test.com / Staff123! (STAFF)
```

### Option 2 : Forcer le mode MOCK

Créez un fichier `.env` avec :

```env
USE_MOCK=true
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Tester la Connexion

1. **Démarrer le backend :**
   ```bash
   cd backend
   npm run dev
   ```

2. **Démarrer le frontend :**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Se connecter :**
   - Aller sur `http://localhost:5173/login`
   - Utiliser le compte :
     * Email : `admin@restaurant.com`
     * Password : `Admin123!`
   - Vous serez redirigé vers `/restaurant/restaurant-1/dashboard`

## 🔄 Passer en Mode Réel (Airtable)

Quand vous voudrez utiliser Airtable :

1. Créez votre base Airtable
2. Configurez `.env` avec :
   ```env
   AIRTABLE_API_KEY=votre_api_key
   AIRTABLE_BASE_ID=votre_base_id
   USE_MOCK=false  # ou supprimez cette ligne
   JWT_SECRET=votre_secret
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

3. Redémarrez le backend

Le système basculera automatiquement en mode réel.

## 📋 Notes

- Les tokens JWT fonctionnent normalement même en mode MOCK
- Les redirections selon les rôles fonctionnent
- Toutes les pages sont accessibles
- Aucune donnée n'est persistée (tout est en mémoire)
