# 🚀 Guide de Démarrage Rapide

## ⚡ Démarrage en 3 Étapes

### Étape 1 : Démarrer le Backend

```bash
cd backend
npm install  # Si pas encore fait
npm run dev
```

**Vous devriez voir :**
```
🚀 Server running on http://localhost:3000
📝 Mode MOCK activé - Utilisation de données factices
👤 Utilisateurs disponibles :
   - admin@platform.com / Admin123! (SUPER_ADMIN)
   - admin-bistrot@test.com / Admin123! (ADMIN_RESTAURANT)
   - staff-bistrot@test.com / Staff123! (STAFF)
```

**⚠️ Si vous ne voyez pas ce message, le backend n'est pas démarré !**

### Étape 2 : Démarrer le Frontend

Dans un **nouveau terminal** :

```bash
cd frontend
npm install  # Si pas encore fait
npm run dev
```

**Vous devriez voir :**
```
VITE v5.x.x ready in xxx ms
  → Local:   http://localhost:5173/
```

### Étape 3 : Tester la Connexion

1. Ouvrez votre navigateur sur `http://localhost:5173/login`
2. Utilisez les identifiants :
   - **Email :** `admin@platform.com`
   - **Password :** `Admin123!`
3. Cliquez sur "Se connecter"

## ✅ Vérifications

### Vérifier que le backend fonctionne

Dans un terminal, testez :

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{"status":"ok","message":"Server is running"}
```

### Vérifier l'endpoint de login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@platform.com","password":"Admin123!"}'
```

Réponse attendue :
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "1",
    "email": "admin@platform.com",
    "role": "SUPER_ADMIN",
    "restaurant_id": null
  }
}
```

## 🐛 Problèmes Courants

### Erreur : "Impossible de se connecter au serveur"

**Cause :** Le backend n'est pas démarré ou n'écoute pas sur le port 3000

**Solution :**
1. Vérifiez que le backend est démarré (voir Étape 1)
2. Vérifiez qu'aucun autre processus n'utilise le port 3000
3. Vérifiez les logs du backend pour des erreurs

### Erreur : "Email ou mot de passe incorrect"

**Cause :** Identifiants incorrects ou backend non accessible

**Solution :**
1. Utilisez exactement :
   - Email : `admin@platform.com`
   - Password : `Admin123!` (avec majuscule et point d'exclamation)
2. Vérifiez que le backend est démarré
3. Vérifiez la console du navigateur (F12) pour plus de détails

### Erreur CORS

**Cause :** Problème de configuration CORS

**Solution :**
Vérifiez que dans `backend/src/index.ts`, CORS est configuré :
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

### Le backend ne démarre pas

**Causes possibles :**
1. Port 3000 déjà utilisé
2. Erreur dans le code
3. Dépendances non installées

**Solution :**
```bash
cd backend
npm install
npm run dev
```

Regardez les erreurs affichées dans le terminal.

## 📋 Checklist Complète

- [ ] Backend démarré sur le port 3000
- [ ] Frontend démarré sur le port 5173
- [ ] Backend répond à `/health`
- [ ] Endpoint `/api/auth/login` fonctionne
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Identifiants corrects utilisés

## 🎯 Test Rapide

Si tout est correct, après la connexion vous devriez être redirigé vers :
- `/admin/dashboard` (pour SUPER_ADMIN)
- `/restaurant/restaurant-1/dashboard` (pour ADMIN_RESTAURANT)
- `/caisse` (pour STAFF)
