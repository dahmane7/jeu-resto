# Schéma Airtable - Mapping des Tables

Ce document décrit la structure des tables Airtable nécessaires pour le projet.

## 📋 Configuration Requise

Dans votre base Airtable, vous devez créer les tables suivantes avec les champs spécifiés.

## 🏗️ Structure des Tables

### 1. Table: `Restaurants`

| Nom du Champ | Type | Options | Description |
|-------------|------|---------|-------------|
| `name` | Single line text | Required | Nom du restaurant |
| `slug` | Single line text | Required, Unique | Slug unique pour l'URL |
| `address` | Single line text | Required | Adresse du restaurant |
| `google_review_url` | URL | Required | Lien vers les avis Google |
| `is_active` | Checkbox | Default: true | Restaurant actif |
| `phone` | Phone number | Optional | Téléphone |
| `email` | Email | Optional | Email de contact |
| `wheel_active` | Checkbox | Default: true | Roue active |
| `created_at` | Date | Auto | Date de création |
| `updated_at` | Date | Auto | Date de mise à jour |

**Index recommandé :** `slug` (unique)

---

### 2. Table: `Users`

| Nom du Champ | Type | Options | Description |
|-------------|------|---------|-------------|
| `email` | Email | Required, Unique | Email de l'utilisateur |
| `password_hash` | Single line text | Required | Hash du mot de passe (bcrypt) |
| `role` | Single select | Required | SUPER_ADMIN, ADMIN_RESTAURANT, STAFF |
| `restaurant_id` | Link to Restaurants | Optional | Restaurant associé (si ADMIN ou STAFF) |
| `created_at` | Date | Auto | Date de création |

**Options pour `role` :**
- SUPER_ADMIN
- ADMIN_RESTAURANT
- STAFF

**Index recommandé :** `email` (unique)

---

### 3. Table: `Clients`

| Nom du Champ | Type | Options | Description |
|-------------|------|---------|-------------|
| `restaurant_id` | Link to Restaurants | Required | Restaurant associé |
| `phone` | Phone number | Required | Téléphone (identifiant principal) |
| `email` | Email | Required | Email |
| `first_name` | Single line text | Optional | Prénom |
| `last_name` | Single line text | Optional | Nom |
| `city` | Single line text | Optional | Ville |
| `age_range` | Single select | Optional | Tranche d'âge |
| `gdpr_consent` | Checkbox | Default: false | Consentement RGPD |
| `consent_date` | Date | Optional | Date du consentement |
| `created_at` | Date | Auto | Date de création |
| `updated_at` | Date | Auto | Date de mise à jour |

**Options pour `age_range` :**
- -18
- 18-24
- 25-34
- 35-44
- 45+

**Index recommandé :** 
- `restaurant_id` + `phone` (unique combination)
- `restaurant_id` + `email`

---

### 4. Table: `Prizes`

| Nom du Champ | Type | Options | Description |
|-------------|------|---------|-------------|
| `restaurant_id` | Link to Restaurants | Required | Restaurant associé |
| `name` | Single line text | Required | Nom du lot |
| `percentage` | Number | Required | Pourcentage (0-100) |
| `message` | Long text | Required | Message personnalisé |
| `is_active` | Checkbox | Default: true | Lot actif |
| `created_at` | Date | Auto | Date de création |
| `updated_at` | Date | Auto | Date de mise à jour |

**Index recommandé :** `restaurant_id` + `name` (unique combination)

---

### 5. Table: `Participations`

| Nom du Champ | Type | Options | Description |
|-------------|------|---------|-------------|
| `restaurant_id` | Link to Restaurants | Required | Restaurant associé |
| `client_id` | Link to Clients | Required | Client participant |
| `prize_id` | Link to Prizes | Optional | Lot gagné (si gagné) |
| `status` | Single select | Default: A_RECUPERER | Statut du lot |
| `won_at` | Date | Required | Date du gain |
| `expires_at` | Date | Required | Date d'expiration (won_at + 7 jours) |
| `claimed_at` | Date | Optional | Date de récupération |
| `is_lost` | Checkbox | Default: false | Si perdu |
| `created_at` | Date | Auto | Date de création |

**Options pour `status` :**
- A_RECUPERER
- RECUPERE
- EXPIRE

**Index recommandé :**
- `restaurant_id` + `client_id`
- `status` + `expires_at`

---

### 6. Table: `Analytics`

| Nom du Champ | Type | Options | Description |
|-------------|------|---------|-------------|
| `restaurant_id` | Link to Restaurants | Required | Restaurant associé |
| `event_type` | Single select | Required | Type d'événement |
| `date` | Date | Auto | Date de l'événement |
| `client_id` | Link to Clients | Optional | Client associé |
| `participation_id` | Link to Participations | Optional | Participation associée |

**Options pour `event_type` :**
- VISIT
- GOOGLE_CLICK
- FORM_SUBMIT
- SPIN
- WIN
- LOSE
- CLAIM

**Index recommandé :**
- `restaurant_id` + `date`
- `restaurant_id` + `event_type`

---

## 🔧 Instructions de Configuration Airtable

### Étape 1 : Créer la Base
1. Créez une nouvelle base Airtable
2. Notez le **Base ID** (visible dans l'URL ou dans les paramètres de l'API)

### Étape 2 : Créer les Tables
1. Créez les 6 tables listées ci-dessus
2. Ajoutez tous les champs avec les types spécifiés

### Étape 3 : Configurer les Relations
1. Configurez les champs de type "Link to table" pour créer les relations
2. Activez "Allow linking to multiple records" si nécessaire

### Étape 4 : Configurer les Index
1. Pour les champs uniques, activez "Unique values" dans les options du champ
2. Pour les combinaisons uniques (comme restaurant_id + phone), utilisez une formule ou un champ calculé

### Étape 5 : Récupérer l'API Key
1. Allez sur https://airtable.com/api
2. Sélectionnez votre base
3. Copiez votre **API Key**

### Étape 6 : Configurer .env
```env
AIRTABLE_API_KEY=votre_api_key
AIRTABLE_BASE_ID=votre_base_id
```

---

## ⚠️ Notes Importantes

1. **Limites Airtable :**
   - 5 requêtes par seconde par base (plan gratuit)
   - 1200 requêtes par seconde (plan Pro)
   - Maximum 100 000 enregistrements par table (plan gratuit)

2. **Relations :**
   - Airtable gère les relations via les champs "Link to table"
   - Les IDs sont automatiquement gérés par Airtable

3. **Dates :**
   - Utilisez le type "Date" avec option "Include time" pour les timestamps
   - Les dates sont stockées en UTC

4. **Unicité :**
   - Pour les combinaisons uniques (comme restaurant_id + phone), vous devrez peut-être créer un champ calculé ou gérer l'unicité dans le code

5. **Performance :**
   - Utilisez les filtres Airtable pour optimiser les requêtes
   - Limitez le nombre d'enregistrements récupérés avec `maxRecords`

---

## 🧪 Test de la Configuration

Après avoir configuré Airtable, testez la connexion avec :

```typescript
import { airtable, TABLES } from './utils/airtable';

// Test de connexion
async function testConnection() {
  try {
    const restaurants = await airtable.findMany(TABLES.RESTAURANTS, { maxRecords: 1 });
    console.log('✅ Connexion Airtable réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  }
}
```
