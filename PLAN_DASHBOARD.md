# 📊 Plan d'Enrichissement du Dashboard

## 🎯 Objectif

Enrichir le dashboard Admin Restaurant avec toutes les fonctionnalités prévues dans les spécifications.

## 📋 Fonctionnalités à Implémenter

### 1. Dashboard Principal (`/restaurant/{id}/dashboard`)

#### Statistiques Principales
- ✅ Visites (déjà présent)
- ✅ Clics Google (déjà présent)
- ✅ Formulaires complétés (déjà présent)
- ⏳ Spins (à ajouter)
- ⏳ Répartition lots (graphique)
- ⏳ Gains par statut (à récupérer/récupérés/expirés)

#### Filtres de Période
- ⏳ Sélecteur de période : Aujourd'hui, 7 jours, 30 jours, Personnalisé
- ⏳ Dates de début/fin pour période personnalisée

#### Graphiques
- ⏳ Graphique de répartition des lots (camembert)
- ⏳ Graphique des gains par statut (barres)

### 2. Navigation vers Autres Sections

- ⏳ Menu de navigation : Dashboard | Paramétrage Roue | Clients
- ⏳ Onglets ou sidebar pour naviguer entre les sections

### 3. Paramétrage Roue (`/restaurant/{id}/prizes`)

- ⏳ Toggle "Roue active"
- ⏳ Liste des lots avec CRUD
- ⏳ Validation : somme des % ≤ 100
- ⏳ Formulaire d'ajout/édition de lot

### 4. Clients (`/restaurant/{id}/clients`)

- ⏳ Liste des clients avec pagination
- ⏳ Recherche et filtres (téléphone, email, nom, ville, âge)
- ⏳ Fiche client détaillée (lecture seule)
- ⏳ Export CSV

## 🚀 Ordre d'Implémentation Recommandé

### Phase 1 : Dashboard Enrichi (Maintenant)
1. ✅ Ajouter toutes les cartes de statistiques
2. ✅ Ajouter le sélecteur de période
3. ✅ Ajouter les graphiques (avec données mockées)
4. ✅ Ajouter la navigation entre sections

### Phase 2 : Backend API (Ensuite)
1. Créer les endpoints de statistiques
2. Créer les endpoints pour les lots
3. Créer les endpoints pour les clients

### Phase 3 : Intégration (Final)
1. Connecter le frontend au backend
2. Remplacer les données mockées par les vraies données
3. Ajouter la gestion d'erreurs et le loading

## 📝 Prochaines Étapes Immédiates

1. **Enrichir RestaurantDashboard.tsx** avec :
   - Toutes les cartes de stats
   - Sélecteur de période
   - Graphiques (Recharts)
   - Navigation

2. **Créer les composants réutilisables** :
   - StatCard (carte de statistique)
   - PeriodSelector (sélecteur de période)
   - NavigationTabs (onglets de navigation)

3. **Ajouter les données mockées** pour tester l'interface
