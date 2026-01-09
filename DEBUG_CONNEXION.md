# 🐛 Debug - Erreur de Connexion

## ✅ Checklist Rapide

### 1. Vérifier que le backend est démarré

```bash
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Server running on http://localhost:3000
📝 Mode MOCK activé - Utilisation de données factices
```

**Si vous ne voyez pas ce message, le backend n'est pas démarré !**

### 2. Vérifier que le backend répond

Ouvrez un nouveau terminal et testez :

```bash
curl http://localhost:3000/health
```

Vous devriez voir :
```json
{"status":"ok","message":"Server is running"}
```

**Si ça ne fonctionne pas, le backend n'est pas accessible !**

### 3. Tester l'endpoint de login directement

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@platform.com","password":"Admin123!"}'
```

Vous devriez voir une réponse avec un token.

### 4. Vérifier la console du navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet "Console"
3. Regardez les erreurs affichées

Erreurs courantes :
- `ECONNREFUSED` → Le backend n'est pas démarré
- `CORS error` → Problème de configuration CORS
- `404` → L'endpoint n'existe pas
- `Network Error` → Le backend n'est pas accessible

### 5. Vérifier l'URL de l'API dans le frontend

Le frontend utilise par défaut : `http://localhost:3000`

Vérifiez dans `frontend/src/services/api.ts` :
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## 🔧 Solutions aux Problèmes Courants

### Problème : "Impossible de se connecter au serveur"

**Solution :**
1. Vérifiez que le backend est démarré
2. Vérifiez que le port 3000 n'est pas utilisé par un autre processus
3. Vérifiez les logs du backend pour des erreurs

### Problème : Erreur CORS

**Solution :**
Vérifiez dans `backend/src/index.ts` que CORS est configuré :
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

### Problème : "Email ou mot de passe incorrect"

**Solution :**
Utilisez exactement :
- Email : `admin@platform.com`
- Password : `Admin123!` (avec la majuscule et le point d'exclamation)

### Problème : Le backend démarre mais ne répond pas

**Solution :**
1. Vérifiez les logs du backend pour des erreurs
2. Vérifiez que le fichier `.env` existe (même vide, le mode MOCK fonctionnera)
3. Redémarrez le backend

## 📋 Commandes de Test

### Test complet en une commande

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Terminal 3 - Test API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@platform.com","password":"Admin123!"}'
```

## 🎯 Test Rapide

1. **Démarrer le backend :**
   ```bash
   cd backend
   npm run dev
   ```

2. **Dans un autre terminal, tester l'API :**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Si ça fonctionne, tester le login :**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@platform.com","password":"Admin123!"}'
   ```

4. **Si tout fonctionne, le frontend devrait aussi fonctionner !**
