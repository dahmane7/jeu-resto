# 🚀 Commandes de Démarrage

## Backend (Port 3000)

### 1. Aller dans le dossier backend
```bash
cd backend
```

### 2. Installer les dépendances (si pas encore fait)
```bash
npm install
```

### 3. Démarrer le serveur
```bash
npm run dev
```

**Le serveur démarre automatiquement sur le port 3000**

Vous devriez voir :
```
🚀 Server running on http://localhost:3000
📝 Mode MOCK activé - Utilisation de données factices
👤 Utilisateurs disponibles :
   - admin@platform.com / Admin123! (SUPER_ADMIN)
   - admin-bistrot@test.com / Admin123! (ADMIN_RESTAURANT)
   - staff-bistrot@test.com / Staff123! (STAFF)
```

---

## Frontend (Port 5173)

### 1. Ouvrir un NOUVEAU terminal
(Le backend doit rester en cours d'exécution dans le premier terminal)

### 2. Aller dans le dossier frontend
```bash
cd frontend
```

### 3. Installer les dépendances (si pas encore fait)
```bash
npm install
```

### 4. Démarrer le serveur de développement
```bash
npm run dev
```

**Le frontend démarre automatiquement sur le port 5173**

Vous devriez voir :
```
VITE v5.x.x ready in xxx ms

  → Local:   http://localhost:5173/
  → Network: use --host to expose
```

---

## 📋 Commandes Complètes (Copier-Coller)

### Terminal 1 - Backend
```bash
cd /Users/dahmaneaissa/Desktop/jeu-resto/backend && npm install && npm run dev
```

### Terminal 2 - Frontend
```bash
cd /Users/dahmaneaissa/Desktop/jeu-resto/frontend && npm install && npm run dev
```

---

## ✅ Vérification

### Vérifier que le backend fonctionne
Dans un nouveau terminal :
```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{"status":"ok","message":"Server is running"}
```

### Vérifier que le frontend fonctionne
Ouvrez votre navigateur sur : `http://localhost:5173`

---

## 🛑 Arrêter les serveurs

Pour arrêter un serveur, appuyez sur `Ctrl + C` dans le terminal correspondant.

---

## ⚠️ Si le port 3000 est déjà utilisé

Si vous avez une erreur comme "Port 3000 is already in use" :

1. Trouver le processus qui utilise le port :
```bash
lsof -i :3000
```

2. Arrêter le processus :
```bash
kill -9 <PID>
```

Ou changer le port dans `backend/.env` :
```env
PORT=3001
```

Et mettre à jour `frontend/src/services/api.ts` :
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```
