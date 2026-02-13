# 🔗 URLs d'Accès - Guide Complet

## 👥 Parcours Client (Public)

### Écran 1 : Avis Google
**URL :** `http://localhost:5173/r/{slug}`

**Exemple :** `http://localhost:5173/r/mon-restaurant` (slug du restaurant créé au seed)

**Fonctionnalités :**
- Page publique accessible sans authentification
- Bouton pour laisser un avis Google
- Bouton "J'ai laissé mon avis" → redirige vers le formulaire

### Écran 2 : Formulaire
**URL :** `http://localhost:5173/r/{slug}/form`

**Exemple :** `http://localhost:5173/r/mon-restaurant/form`

### Écran 3 : Roue
**URL :** `http://localhost:5173/r/{slug}/wheel`
            
**Exemple :** `http://localhost:5173/r/mon-restaurant/wheel`

### Écran 4 : Résultat
**URL :** `http://localhost:5173/r/{slug}/result`

**Exemple :** `http://localhost:5173/r/mon-restaurant/result`

---

## 🔐 Back-Office Admin Restaurant

### Page de Connexion
**URL :** `http://localhost:5173/login`

**Identifiants :**
- Email : `admin@restaurant.com`
- Password : `Admin123!`

### Dashboard Admin
**URL :** `http://localhost:5173/restaurant/{restaurant_id}/dashboard`

**Exemple :** `http://localhost:5173/restaurant/restaurant-1/dashboard`

**Fonctionnalités :**
- Statistiques (Visites, Clics Google, Formulaires, Spins)
- Graphiques (Répartition lots, Gains par statut)
- Sélecteur de période

### Paramétrage Roue
**URL :** `http://localhost:5173/restaurant/{restaurant_id}/prizes`

**Exemple :** `http://localhost:5173/restaurant/restaurant-1/prizes`

**Fonctionnalités :**
- Toggle "Roue active"
- CRUD des lots
- Validation des pourcentages

### Clients
**URL :** `http://localhost:5173/restaurant/{restaurant_id}/clients`

**Exemple :** `http://localhost:5173/restaurant/restaurant-1/clients`

**Fonctionnalités :**
- Liste des clients
- Recherche et filtres
- Fiche client détaillée
- Export CSV

---

## 📋 Résumé Rapide

| Type | URL | Authentification |
|------|-----|------------------|
| **Client - Accueil** | `/r/mon-restaurant` | ❌ Public |
| **Client - Formulaire** | `/r/mon-restaurant/form` | ❌ Public |
| **Client - Roue** | `/r/mon-restaurant/wheel` | ❌ Public |
| **Client - Résultat** | `/r/mon-restaurant/result` | ❌ Public |
| **Admin - Login** | `/login` | ❌ Public |
| **Admin - Dashboard** | `/restaurant/restaurant-1/dashboard` | ✅ Requis |
| **Admin - Paramétrage** | `/restaurant/restaurant-1/prizes` | ✅ Requis |
| **Admin - Clients** | `/restaurant/restaurant-1/clients` | ✅ Requis |

---

## 🚀 Comment Accéder à l'Admin

1. **Aller sur la page de login :**
   ```
   http://localhost:5173/login
   ```

2. **Se connecter avec :**
   - Email : `admin@restaurant.com`
   - Password : `Admin123!`

3. **Vous serez automatiquement redirigé vers :**
   ```
   http://localhost:5173/restaurant/restaurant-1/dashboard
   ```

4. **Navigation :**
   - Utilisez les onglets en haut pour naviguer entre :
     - Dashboard
     - Paramétrage Roue
     - Clients

---

## 🎯 Test Complet

### Tester le Parcours Client
1. Ouvrez : `http://localhost:5173/r/mon-restaurant`
2. Suivez les étapes : Avis → Formulaire → Roue → Résultat
3. Les données (visite, clic Google, formulaire, tirage, participation) sont enregistrées en base et visibles dans l’admin (Dashboard, Clients, Récupérations).

### Tester le Back-Office Admin
1. Ouvrez : `http://localhost:5173/login`
2. Connectez-vous avec `admin@restaurant.com` / `Admin123!`
3. Explorez : Dashboard → Paramétrage Roue → Clients

---

## ⚠️ Notes Importantes

- **Client** : Utilise le **slug** du restaurant (ex. `mon-restaurant` pour le restaurant créé au seed)
- **Admin** : Utilise l'**ID** du restaurant (UUID après connexion)
- Les routes admin sont **protégées** : vous devez être connecté
- Les routes client sont **publiques** : accessibles sans authentification
