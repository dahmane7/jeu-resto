# 🚀 Démarrage Complet - Backend + Frontend

## 📋 Prérequis

- Backend doit être démarré sur le port 3000
- Frontend démarrera sur le port 5173

---

## 🔧 Étape 1 : Démarrer le Backend

### Terminal 1 - Backend

```bash
cd /Users/dahmaneaissa/Desktop/jeu-resto/backend
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

**⚠️ Ne fermez pas ce terminal !**

---

## 🎨 Étape 2 : Démarrer le Frontend

### Terminal 2 - Frontend (NOUVEAU TERMINAL)

```bash
cd /Users/dahmaneaissa/Desktop/jeu-resto/frontend
npm run dev
```

**Vous devriez voir :**
```
VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Vérification

### 1. Vérifier le Backend
Dans un nouveau terminal :
```bash
curl http://localhost:3000/health
```
Réponse attendue : `{"status":"ok","message":"Server is running"}`

### 2. Vérifier le Frontend
Ouvrez votre navigateur sur : **http://localhost:5173**

Vous devriez être redirigé vers `/login`

### 3. Tester la Connexion

1. Allez sur `http://localhost:5173/login`
2. Utilisez les identifiants :
   - **Email :** `admin@platform.com`
   - **Password :** `Admin123!`
3. Cliquez sur "Se connecter"

**Vous devriez être redirigé vers `/admin/dashboard`**

---

## 🎯 Commandes Rapides (Copier-Coller)

### Terminal 1 - Backend
```bash
cd /Users/dahmaneaissa/Desktop/jeu-resto/backend && npm run dev
```

### Terminal 2 - Frontend
```bash
cd /Users/dahmaneaissa/Desktop/jeu-resto/frontend && npm run dev
```

---

## 🐛 Problèmes Courants

### Le frontend ne se connecte pas au backend

**Vérifiez :**
1. Le backend est démarré (Terminal 1)
2. Le backend répond à `http://localhost:3000/health`
3. Pas d'erreurs dans la console du navigateur (F12)

### Erreur CORS

Le backend est configuré pour accepter les requêtes depuis `http://localhost:5173`. Si vous avez une erreur CORS, vérifiez que le backend affiche bien "Mode MOCK activé".

### Le frontend ne démarre pas

**Vérifiez :**
1. Les dépendances sont installées : `npm install`
2. Le port 5173 n'est pas utilisé par un autre processus
3. Pas d'erreurs dans le terminal

---

## 📊 État des Serveurs

| Serveur | Port | URL | Statut |
|---------|------|-----|--------|
| Backend | 3000 | http://localhost:3000 | ✅ Démarré |
| Frontend | 5173 | http://localhost:5173 | ✅ Démarré |

---

## 🛑 Arrêter les Serveurs

Pour arrêter un serveur, appuyez sur `Ctrl + C` dans le terminal correspondant.

**Important :** Arrêtez d'abord le frontend, puis le backend.
