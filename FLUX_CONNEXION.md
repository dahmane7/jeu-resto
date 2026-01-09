# 🔄 Flux de Connexion et Redirection

## 📍 Après la Connexion - Où atterrit-on ?

Selon le **rôle** de l'utilisateur, la redirection se fait automatiquement :

### 1. 👑 SUPER_ADMIN
**Route :** `/admin/dashboard`

**Page :** `AdminDashboard.tsx`

**Fonctionnalités prévues :**
- CRUD Restaurants
- Gestion utilisateurs (création Admin resto + Staff)
- Vue globale stats (optionnel V1)

**État actuel :** Page basique créée, à compléter avec les fonctionnalités

---

### 2. 🏢 ADMIN_RESTAURANT
**Route :** `/restaurant/{restaurant_id}/dashboard`

**Page :** À créer (actuellement placeholder)

**Fonctionnalités prévues :**
1. **Dashboard** (avec filtres période)
   - Visites
   - Clics Google
   - Formulaires complétés
   - Spins
   - Répartition lots
   - Gains (à récupérer/récupérés/expirés)

2. **Paramétrage Roue**
   - Toggle "Roue active"
   - CRUD Lots (nom, %, message, actif)
   - Validation : somme % ≤ 100

3. **Clients**
   - Liste + recherche
   - Filtres (téléphone, email, nom, ville, âge)
   - Fiche client (lecture seule)
   - Export CSV

**État actuel :** Route créée mais page à compléter

---

### 3. 🛒 STAFF (Mode Caisse)
**Route :** `/caisse`

**Page :** `CaisseMode.tsx`

**Fonctionnalités prévues :**
- Recherche Client (téléphone/email/prénom/nom)
- Affichage des lots non expirés
- Marquage "récupéré"
- Masquage partiel des données sensibles

**État actuel :** Page basique créée, à compléter avec l'interface de recherche

---

## 🔐 Code de Redirection (Login.tsx)

```typescript
// Après connexion réussie
if (user.role === 'SUPER_ADMIN') {
  navigate('/admin/dashboard');
} else if (user.role === 'ADMIN_RESTAURANT') {
  navigate(`/restaurant/${user.restaurant_id}/dashboard`);
} else if (user.role === 'STAFF') {
  navigate('/caisse');
}
```

## ⚠️ Problème Détecté

La route `/restaurant/:id/dashboard` n'est pas encore complètement configurée dans `App.tsx`. Il faut créer la page `RestaurantDashboard.tsx` et l'ajouter aux routes.

## 📋 Prochaines Étapes

1. ✅ **SUPER_ADMIN** - Page dashboard créée (à compléter)
2. ⚠️ **ADMIN_RESTAURANT** - Route créée mais page à créer
3. ✅ **STAFF** - Page caisse créée (à compléter)
