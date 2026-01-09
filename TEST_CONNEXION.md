# 🔐 Guide de Test de Connexion

## ✅ Ce qui a été créé

1. **Service d'authentification** (`backend/src/services/auth.service.ts`)
   - Hash de mots de passe (bcrypt)
   - Génération de tokens JWT
   - Login et register

2. **Contrôleur d'authentification** (`backend/src/controllers/auth.controller.ts`)
   - POST `/api/auth/login`
   - POST `/api/auth/register`
   - GET `/api/auth/me`

3. **Middleware d'authentification** (`backend/src/middleware/auth.middleware.ts`)
   - Vérification des tokens JWT
   - Protection des routes

4. **Routes** (`backend/src/routes/auth.routes.ts`)
   - Routes configurées et connectées

## 🚀 Étapes pour Tester

### 1. Vérifier que le backend est démarré

```bash
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Server running on http://localhost:3000
```

### 2. Vérifier la configuration

Assurez-vous que votre fichier `.env` contient :

```env
AIRTABLE_API_KEY=votre_api_key
AIRTABLE_BASE_ID=votre_base_id
JWT_SECRET=votre_secret_jwt
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Vérifier qu'Airtable est configuré

- Les tables doivent être créées dans Airtable
- Au moins un utilisateur doit exister (via le seed)

### 4. Lancer le seed (si pas encore fait)

```bash
cd backend
npm run seed
```

Cela créera :
- Super admin : `admin@platform.com` / `Admin123!`
- Admin bistrot : `admin-bistrot@test.com` / `Admin123!`
- Staff bistrot : `staff-bistrot@test.com` / `Staff123!`

### 5. Tester la connexion

**Option 1 : Via le frontend**
1. Démarrer le frontend : `cd frontend && npm run dev`
2. Aller sur `http://localhost:5173/login`
3. Se connecter avec :
   - Email : `admin@platform.com`
   - Password : `Admin123!`

**Option 2 : Via curl/Postman**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@platform.com",
    "password": "Admin123!"
  }'
```

Réponse attendue :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@platform.com",
    "role": "SUPER_ADMIN",
    "restaurant_id": null
  }
}
```

## 🐛 Problèmes Courants

### Erreur : "Cannot connect to server"
→ Vérifiez que le backend est démarré sur le port 3000

### Erreur : "AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set"
→ Vérifiez votre fichier `.env` dans le dossier `backend`

### Erreur : "Email ou mot de passe incorrect"
→ Vérifiez que :
1. L'utilisateur existe dans Airtable
2. Le mot de passe est correct
3. Le hash du mot de passe est correct (relancer le seed si nécessaire)

### Erreur : "Table not found"
→ Vérifiez que la table "Users" existe dans Airtable avec le bon nom

### Erreur CORS
→ Vérifiez que `CORS_ORIGIN` dans `.env` correspond à l'URL du frontend (http://localhost:5173)

## ✅ Vérification Rapide

1. Backend démarré ? → `curl http://localhost:3000/health`
2. Route login existe ? → `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'`
3. Airtable configuré ? → Vérifier les logs du backend au démarrage
