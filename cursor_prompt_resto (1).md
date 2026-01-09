# Prompt Cursor - Développement Plateforme "QR Avis Google + Roue"

## 🎯 Contexte du Projet

Tu vas développer une plateforme web multi-restaurants permettant de collecter des avis Google et des données clients via un jeu de roue gamifié accessible par QR code.

## 📋 Vue d'Ensemble

**Type d'application :** Web app mobile-first multi-tenant  
**Stack technique recommandée :**
- **Frontend :** React + TypeScript + Tailwind CSS + Vite
- **Backend :** Node.js + Express + TypeScript
- **Base de données :** PostgreSQL
- **ORM :** Prisma
- **Auth :** JWT
- **Déploiement :** Docker

## 🏗️ Architecture Système

### Structure Multi-Tenant
- Isolation des données par restaurant via `restaurant_id`
- Accès par slug : `/r/{slug}`
- 3 niveaux d'accès : Super-admin, Admin restaurant, Staff caisse

### Base de Données - Modèles Principaux

```prisma
model Restaurant {
  id                  String   @id @default(uuid())
  name                String
  slug                String   @unique
  address             String
  google_review_url   String
  is_active           Boolean  @default(true)
  phone               String?
  email               String?
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  
  wheel_active        Boolean  @default(true)
  prizes              Prize[]
  clients             Client[]
  users               User[]
  participations      Participation[]
}

model User {
  id              String   @id @default(uuid())
  email           String   @unique
  password_hash   String
  role            Role     @default(STAFF)
  restaurant_id   String?
  restaurant      Restaurant? @relation(fields: [restaurant_id], references: [id])
  created_at      DateTime @default(now())
}

enum Role {
  SUPER_ADMIN
  ADMIN_RESTAURANT
  STAFF
}

model Client {
  id              String   @id @default(uuid())
  restaurant_id   String
  restaurant      Restaurant @relation(fields: [restaurant_id], references: [id])
  
  phone           String   // Identifiant principal
  email           String
  first_name      String?
  last_name       String?
  city            String?
  age_range       String?  // -18, 18-24, 25-34, 35-44, 45+
  
  gdpr_consent    Boolean  @default(false)
  consent_date    DateTime?
  
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  participations  Participation[]
  
  @@unique([restaurant_id, phone])
  @@index([restaurant_id, email])
  @@index([restaurant_id, phone])
}

model Prize {
  id              String   @id @default(uuid())
  restaurant_id   String
  restaurant      Restaurant @relation(fields: [restaurant_id], references: [id])
  
  name            String   // Unique par restaurant
  percentage      Float    // 0-100
  message         String
  is_active       Boolean  @default(true)
  
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  
  participations  Participation[]
  
  @@unique([restaurant_id, name])
}

model Participation {
  id              String   @id @default(uuid())
  restaurant_id   String
  restaurant      Restaurant @relation(fields: [restaurant_id], references: [id])
  
  client_id       String
  client          Client   @relation(fields: [client_id], references: [id])
  
  prize_id        String?
  prize           Prize?   @relation(fields: [prize_id], references: [id])
  
  status          PrizeStatus @default(A_RECUPERER)
  
  won_at          DateTime @default(now())
  expires_at      DateTime // won_at + 7 jours
  claimed_at      DateTime?
  
  is_lost         Boolean  @default(false) // Si perdu implicite ou explicite
  
  created_at      DateTime @default(now())
  
  @@index([restaurant_id, client_id])
  @@index([status, expires_at])
}

enum PrizeStatus {
  A_RECUPERER
  RECUPERE
  EXPIRE
}

model Analytics {
  id              String   @id @default(uuid())
  restaurant_id   String
  
  event_type      String   // VISIT, GOOGLE_CLICK, FORM_SUBMIT, SPIN
  date            DateTime @default(now())
  
  client_id       String?
  participation_id String?
  
  @@index([restaurant_id, date])
  @@index([restaurant_id, event_type])
}
```

## 🎨 Parcours Utilisateur Client

### Écran 1 : Avis Google (`/r/{slug}`)
```
┌─────────────────────────────┐
│   [Logo Restaurant]         │
│                             │
│   Nom du Restaurant         │
│                             │
│  ┌────────────────────────┐ │
│  │ 🌟 Laisser un avis     │ │
│  │    Google              │ │
│  └────────────────────────┘ │
│                             │
│  Après avoir laissé ton     │
│  avis, reviens ici          │
│                             │
│  ┌────────────────────────┐ │
│  │ J'ai laissé mon avis → │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

### Écran 2 : Formulaire
```
Champs obligatoires :
- Téléphone * (validation format)
- Email * (validation format)
- Consentement RGPD * (checkbox obligatoire)

Champs optionnels :
- Prénom
- Nom
- Ville
- Tranche d'âge (select)

Texte consentement :
"J'accepte que mes données soient utilisées 
pour me contacter et recevoir des offres du restaurant."
[Lien] Politique de confidentialité
```

### Écran 3 : Roue
```
- Animation de roue interactive
- Segments colorés représentant les lots
- Bouton "Lancer la roue"
- Animation de spin
```

### Écran 4 : Résultat
```
SI GAGNÉ:
┌─────────────────────────────┐
│   🎉 Félicitations !        │
│                             │
│   Tu as gagné :             │
│   [NOM DU LOT]              │
│                             │
│   [Message personnalisé]    │
│                             │
│   ⏰ À récupérer sous 7j    │
│   en donnant ton téléphone  │
│   ou email en caisse        │
└─────────────────────────────┘

SI PERDU:
┌─────────────────────────────┐
│   😔 Dommage...             │
│                             │
│   [Message personnalisé     │
│    ou message par défaut]   │
└─────────────────────────────┘
```

## 🔐 Back-Office

### Super-Admin
**Route :** `/admin/dashboard`

Fonctionnalités :
- CRUD Restaurants
- Gestion utilisateurs (création Admin resto + Staff)
- Vue globale stats (optionnel V1)

### Admin Restaurant
**Route :** `/admin/restaurant/{id}`

Sections :
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

### Staff Caisse
**Route :** `/caisse`

Interface simplifiée :
```
┌────────────────────────────────┐
│  Recherche Client              │
│  [___________] 🔍              │
│                                │
│  Résultats:                    │
│  ┌──────────────────────────┐ │
│  │ Jean Dupont              │ │
│  │ 06** ** ** 42            │ │
│  │ j***@email.com           │ │
│  │ 2 lots à récupérer       │ │
│  └──────────────────────────┘ │
│                                │
│  Fiche Client:                 │
│  Lots non expirés:             │
│  ┌──────────────────────────┐ │
│  │ Café offert              │ │
│  │ Gagné le: 05/01/2026     │ │
│  │ Expire le: 12/01/2026    │ │
│  │ [Marquer récupéré]       │ │
│  └──────────────────────────┘ │
└────────────────────────────────┘
```

## ⚙️ Règles Métier Critiques

### 1. Déduplication Client
```typescript
// Algorithme de déduplication
async function getOrCreateClient(restaurantId, formData) {
  // 1. Chercher par téléphone (prioritaire)
  let client = await findClientByPhone(restaurantId, formData.phone);
  
  if (client) {
    // Si email diffère, mettre à jour
    if (client.email !== formData.email) {
      client = await updateClientEmail(client.id, formData.email);
    }
    // Mettre à jour les autres champs optionnels s'ils sont fournis
    return client;
  }
  
  // 2. Si téléphone nouveau, créer nouveau client
  return await createClient(restaurantId, formData);
}
```

### 2. Tirage de la Roue
```typescript
function spinWheel(activePrizes: Prize[]): Prize | null {
  const totalPercentage = activePrizes.reduce((sum, p) => sum + p.percentage, 0);
  
  // Validation
  if (totalPercentage > 100) {
    throw new Error('Total percentage exceeds 100%');
  }
  
  // Tirage aléatoire
  const random = Math.random() * 100;
  
  let cumulative = 0;
  for (const prize of activePrizes) {
    cumulative += prize.percentage;
    if (random < cumulative) {
      return prize; // GAGNÉ
    }
  }
  
  // Si on arrive ici = PERDU (implicite ou explicite)
  return null;
}
```

### 3. Expiration Automatique
```typescript
// Cron job ou fonction appelée régulièrement
async function expireOldPrizes() {
  const now = new Date();
  
  await prisma.participation.updateMany({
    where: {
      status: 'A_RECUPERER',
      expires_at: { lt: now }
    },
    data: {
      status: 'EXPIRE'
    }
  });
}
```

### 4. Validation Pourcentages
```typescript
// Avant sauvegarde des lots
function validatePrizePercentages(prizes: Prize[]): boolean {
  const total = prizes
    .filter(p => p.is_active)
    .reduce((sum, p) => sum + p.percentage, 0);
  
  if (total > 100) {
    throw new Error('La somme des pourcentages ne peut pas dépasser 100%');
  }
  
  return true;
}
```

## 📊 Analytics & Tracking

Événements à traquer :
```typescript
enum AnalyticsEvent {
  VISIT = 'VISIT',              // Scan QR / visite page restaurant
  GOOGLE_CLICK = 'GOOGLE_CLICK', // Clic vers Google avis
  FORM_SUBMIT = 'FORM_SUBMIT',   // Soumission formulaire
  SPIN = 'SPIN',                 // Lancement roue
  WIN = 'WIN',                   // Gain
  LOSE = 'LOSE',                 // Perdu
  CLAIM = 'CLAIM'                // Récupération lot
}
```

## 🚀 API Endpoints Principaux

### Client (Public)
```
GET    /api/r/:slug                    # Infos restaurant
POST   /api/r/:slug/track/visit        # Track visite
POST   /api/r/:slug/track/google-click # Track clic Google
POST   /api/r/:slug/participate        # Soumission formulaire + spin
```

### Back-Office (Authentifié)
```
# Auth
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

# Super-Admin
GET    /api/admin/restaurants
POST   /api/admin/restaurants
PUT    /api/admin/restaurants/:id
DELETE /api/admin/restaurants/:id
GET    /api/admin/users
POST   /api/admin/users

# Admin Restaurant
GET    /api/restaurant/:id/dashboard?period=7d
GET    /api/restaurant/:id/prizes
POST   /api/restaurant/:id/prizes
PUT    /api/restaurant/:id/prizes/:prizeId
DELETE /api/restaurant/:id/prizes/:prizeId
PUT    /api/restaurant/:id/wheel-active
GET    /api/restaurant/:id/clients
GET    /api/restaurant/:id/clients/:clientId
GET    /api/restaurant/:id/export/clients.csv

# Staff Caisse
GET    /api/caisse/search?q=...
GET    /api/caisse/client/:id/prizes
PUT    /api/caisse/participation/:id/claim
```

## 🎯 Plan de Développement par Phases

### Phase 1 : Setup & Infrastructure (Jour 1-2)
- [ ] Initialiser projet (Vite + React + TypeScript)
- [ ] Setup Prisma + PostgreSQL
- [ ] Créer schéma DB complet
- [ ] Setup authentification JWT
- [ ] Créer middleware de vérification rôles

### Phase 2 : Back-Office Super-Admin (Jour 3-4)
- [ ] Interface login
- [ ] CRUD Restaurants
- [ ] Gestion utilisateurs
- [ ] Système de rôles et permissions

### Phase 3 : Back-Office Admin Restaurant (Jour 5-7)
- [ ] Dashboard avec stats
- [ ] Paramétrage roue (CRUD lots)
- [ ] Validation pourcentages
- [ ] Liste clients + filtres
- [ ] Export CSV

### Phase 4 : Parcours Client (Jour 8-11)
- [ ] Page restaurant (/r/{slug})
- [ ] Écran avis Google
- [ ] Formulaire avec validation
- [ ] Animation roue (canvas ou bibliothèque)
- [ ] Écran résultat
- [ ] Logique de tirage
- [ ] Déduplication clients

### Phase 5 : Mode Caisse (Jour 12-13)
- [ ] Interface de recherche
- [ ] Affichage lots non expirés
- [ ] Marquage "récupéré"
- [ ] Masquage données sensibles

### Phase 6 : Analytics & Finalisation (Jour 14-15)
- [ ] Tracking événements
- [ ] Cron job expiration
- [ ] Tests end-to-end
- [ ] Optimisations mobile
- [ ] Documentation

## ⚠️ Points d'Attention Critiques

### Sécurité
- ✅ Hash passwords (bcrypt)
- ✅ Validation JWT sur toutes routes protégées
- ✅ Isolation données par restaurant_id
- ✅ Masquage partiel téléphone/email en mode caisse
- ✅ Validation inputs côté serveur
- ✅ Protection CSRF
- ✅ Rate limiting sur endpoints publics

### Performance
- ✅ Index DB sur colonnes recherchées
- ✅ Pagination listes clients
- ✅ Cache restaurant data
- ✅ Optimisation requêtes (eager loading)

### UX Mobile
- ✅ Design mobile-first
- ✅ Touch-friendly (boutons min 44px)
- ✅ Animations fluides roue
- ✅ Feedback visuel actions
- ✅ Messages erreur clairs

### RGPD
- ✅ Consentement obligatoire avant jeu
- ✅ Date de consentement stockée
- ✅ Page politique de confidentialité
- ✅ Export données client (CSV)

## 📝 Exclusions V1 (Ne PAS Développer)

❌ Vérification réelle avis Google posté  
❌ Limitation "1 participation par commande" (contrôle)  
❌ Email/SMS confirmation  
❌ Gestion stock/quotas lots  
❌ Édition manuelle fiches clients  
❌ Audit log détaillé  
❌ URL résultat partageable  

## 🧪 Tests Essentiels

```typescript
// Tests critiques à implémenter
describe('Client Deduplication', () => {
  it('should reuse existing client by phone');
  it('should update email if different');
  it('should create new client if phone is new');
});

describe('Wheel Spin', () => {
  it('should respect prize percentages');
  it('should handle implicit loss when sum < 100');
  it('should reject when sum > 100');
});

describe('Prize Expiration', () => {
  it('should expire prizes after 7 days');
  it('should not show expired prizes in caisse mode');
});

describe('Multi-tenant Isolation', () => {
  it('should not access other restaurant data');
  it('should filter clients by restaurant');
});
```

## 💡 Recommandations Techniques

### Bibliothèques Suggérées
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "tailwindcss": "^3.3.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.292.0",
    
    "express": "^4.18.0",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "express-validator": "^7.0.0",
    "nodemailer": "^6.9.0",
    "node-cron": "^3.0.0"
  }
}
```

### Animation Roue
Utiliser Canvas API ou bibliothèque légère comme `react-custom-roulette` ou créer une animation CSS/SVG custom.

## 🎬 Séquence de Prompts pour Cursor

### ✅ Étape 1 : Schéma Prisma (FAIT)

### 📋 Étape 2 : Configuration & Migrations
```
Génère et applique la migration Prisma initiale.
Crée également un fichier seed.ts pour initialiser :
- 1 super-admin (email: admin@platform.com, password: Admin123!)
- 2 restaurants de test avec slugs "restaurant-test-1" et "restaurant-test-2"
- 1 admin par restaurant
- 3 lots par restaurant avec des pourcentages qui totalisent < 100
```

### 🔐 Étape 3 : Système d'Authentification
```
Crée le système d'authentification complet :

1. Middleware auth.middleware.ts :
   - Vérification JWT
   - Extraction du user et de son rôle
   - Fonction requireRole(['SUPER_ADMIN', 'ADMIN_RESTAURANT'])

2. Service auth.service.ts :
   - register(email, password, role, restaurantId?)
   - login(email, password) → retourne { token, user }
   - hashPassword(password)
   - comparePassword(password, hash)
   - generateToken(userId, role, restaurantId?)

3. Controller auth.controller.ts :
   - POST /api/auth/login
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password

4. Routes auth.routes.ts

Utilise bcrypt pour le hash et jsonwebtoken pour les tokens.
Le token doit contenir : userId, role, restaurantId (si applicable).
```

### 🏢 Étape 4 : API Super-Admin (Gestion Restaurants)
```
Crée les endpoints de gestion des restaurants pour le super-admin :

1. Service restaurant.service.ts :
   - getAllRestaurants()
   - getRestaurantById(id)
   - createRestaurant(data)
   - updateRestaurant(id, data)
   - deleteRestaurant(id)
   - validateSlugUnique(slug, excludeId?)

2. Controller restaurant.controller.ts :
   - GET /api/admin/restaurants
   - GET /api/admin/restaurants/:id
   - POST /api/admin/restaurants
   - PUT /api/admin/restaurants/:id
   - DELETE /api/admin/restaurants/:id

3. Ajoute validation avec express-validator :
   - Nom obligatoire
   - Slug unique, format kebab-case
   - Google review URL format valide
   - Adresse obligatoire

Protège toutes les routes avec requireRole(['SUPER_ADMIN']).
```

### 👥 Étape 5 : API Gestion Utilisateurs (Super-Admin)
```
Crée les endpoints de gestion des utilisateurs :

1. Service user.service.ts :
   - getAllUsers(filters?)
   - getUserById(id)
   - createUser(email, password, role, restaurantId?)
   - updateUser(id, data)
   - deleteUser(id)

2. Controller user.controller.ts :
   - GET /api/admin/users
   - POST /api/admin/users
   - PUT /api/admin/users/:id
   - DELETE /api/admin/users/:id

Règles :
- ADMIN_RESTAURANT et STAFF doivent avoir un restaurantId
- SUPER_ADMIN n'a pas de restaurantId
- Validation email unique
```

### 🎰 Étape 6 : API Paramétrage Roue (Admin Restaurant)
```
Crée la gestion des lots pour l'admin restaurant :

1. Service prize.service.ts :
   - getPrizesByRestaurant(restaurantId)
   - createPrize(restaurantId, data)
   - updatePrize(id, data)
   - deletePrize(id)
   - validateTotalPercentage(restaurantId, excludePrizeId?)
   - toggleWheelActive(restaurantId, isActive)

2. Controller prize.controller.ts :
   - GET /api/restaurant/:restaurantId/prizes
   - POST /api/restaurant/:restaurantId/prizes
   - PUT /api/restaurant/:restaurantId/prizes/:id
   - DELETE /api/restaurant/:restaurantId/prizes/:id
   - PUT /api/restaurant/:restaurantId/wheel-active

Validation critique :
- Avant de sauvegarder, vérifier que la somme des % actifs ≤ 100
- Nom unique par restaurant
- Message obligatoire

Middleware : Vérifier que l'admin accède bien à SON restaurant.
```

### 🎲 Étape 7 : API Parcours Client (Public)
```
Crée l'API pour le parcours client :

1. Service client.service.ts :
   - getOrCreateClient(restaurantId, formData) [avec déduplication]
   - getClientById(id)
   - searchClients(restaurantId, query)

2. Service participation.service.ts :
   - spinWheel(restaurantId, clientId)
   - getParticipationsByClient(clientId)
   - expireOldParticipations() [pour le cron]

3. Service analytics.service.ts :
   - trackEvent(restaurantId, eventType, clientId?, participationId?)
   - getAnalytics(restaurantId, startDate, endDate)

4. Controller public.controller.ts :
   - GET /api/r/:slug [infos restaurant]
   - POST /api/r/:slug/track/visit
   - POST /api/r/:slug/track/google-click
   - POST /api/r/:slug/participate [formulaire + spin]

Implémente la logique de tirage de la roue exactement comme spécifié :
- Tirage aléatoire entre 0 et 100
- Si tombe dans un lot actif → WIN
- Si tombe dans la zone restante → LOSE
- Créer Participation avec expires_at = won_at + 7 jours

Implémente la déduplication client :
- Chercher par téléphone d'abord
- Si existe : update email si différent
- Sinon : créer nouveau client
```

### 📊 Étape 8 : API Dashboard & Stats (Admin Restaurant)
```
Crée les endpoints de statistiques :

1. Service dashboard.service.ts :
   - getDashboardStats(restaurantId, startDate, endDate)
   - getVisitsCount(restaurantId, startDate, endDate)
   - getGoogleClicksCount(...)
   - getFormSubmitsCount(...)
   - getSpinsCount(...)
   - getPrizesDistribution(...)
   - getPrizesStatus(...) [à récupérer/récupérés/expirés]

2. Controller dashboard.controller.ts :
   - GET /api/restaurant/:restaurantId/dashboard?period=7d

Retourne un objet JSON avec toutes les stats demandées.
Filtre par période : today, 7d, 30d, ou custom (startDate/endDate).
```

### 🧾 Étape 9 : API Mode Caisse (Staff)
```
Crée les endpoints pour le mode caisse :

1. Service caisse.service.ts :
   - searchClients(restaurantId, query) [téléphone/email/prénom/nom]
   - getClientPrizes(clientId, restaurantId)
   - claimPrize(participationId, staffId)

2. Controller caisse.controller.ts :
   - GET /api/caisse/search?q=...
   - GET /api/caisse/client/:id/prizes
   - PUT /api/caisse/participation/:id/claim

Règles :
- Retourner uniquement les lots status=A_RECUPERER et non expirés
- Masquer partiellement téléphone et email (06** ** ** 42)
- Vérifier que le staff appartient bien au restaurant
- Lors du claim : status → RECUPERE, claimed_at → now
```

### 📄 Étape 10 : Export CSV
```
Crée l'endpoint d'export CSV pour l'admin restaurant :

1. Service export.service.ts :
   - exportClientsCSV(restaurantId)
   - exportParticipationsCSV(restaurantId)

2. Controller export.controller.ts :
   - GET /api/restaurant/:restaurantId/export/clients.csv
   - GET /api/restaurant/:restaurantId/export/participations.csv

Format CSV pour clients :
telephone,email,prenom,nom,ville,tranche_age,date_creation,consentement

Format CSV pour participations :
date,client_telephone,lot,statut,date_expiration,date_recuperation
```

### ⏰ Étape 11 : Cron Job Expiration
```
Crée un cron job pour expirer automatiquement les lots :

1. Fichier cron/expirePrizes.cron.ts :
   - Lance toutes les heures
   - Appelle participation.service.expireOldParticipations()
   - Log les expirations

2. Configure node-cron dans le server.ts principal

Logique :
UPDATE participations 
SET status = 'EXPIRE' 
WHERE status = 'A_RECUPERER' 
AND expires_at < NOW()
```

### 🎨 Étape 12 : Frontend - Setup & Layout
```
Crée la structure frontend React + TypeScript :

1. Setup Vite + React + TypeScript + Tailwind CSS
2. Setup React Router avec les routes :
   - /r/:slug (public)
   - /login
   - /admin/* (super-admin)
   - /restaurant/:id/* (admin restaurant)
   - /caisse (staff)

3. Composants de layout :
   - PublicLayout (pour /r/:slug)
   - AdminLayout (sidebar + header)
   - CaisseLayout (simplifié)

4. Setup React Query pour les requêtes API
5. Setup Zustand pour le state global (auth user)
6. Créer un service api.ts avec axios configuré (interceptors JWT)

Inclus un système de thème avec variables CSS pour les couleurs.
```

### 🌐 Étape 13 : Frontend - Parcours Client
```
Crée les 4 écrans du parcours client :

1. pages/public/RestaurantHome.tsx :
   - Fetch infos restaurant par slug
   - Afficher nom + bouton Google avis
   - Tracker la visite (analytics)
   - Bouton "Continuer" → navigate vers formulaire

2. pages/public/Form.tsx :
   - React Hook Form + Zod validation
   - Champs : téléphone*, email*, prénom, nom, ville, tranche_age
   - Checkbox consentement RGPD*
   - Lien politique confidentialité
   - Submit → POST /api/r/:slug/participate

3. pages/public/Wheel.tsx :
   - Animation de roue (canvas ou lib)
   - Segments colorés selon les lots actifs
   - Bouton "Lancer"
   - Animation de rotation
   - Transition vers résultat

4. pages/public/Result.tsx :
   - Si WIN : afficher lot + message + expiration
   - Si LOSE : message dommage
   - Pas d'URL partageable (juste session)

Design mobile-first, boutons touch-friendly (min 44px).
```

### 🔐 Étape 14 : Frontend - Authentification
```
Crée les pages d'authentification :

1. pages/auth/Login.tsx :
   - Formulaire email + password
   - Submit → POST /api/auth/login
   - Stocker token + user dans Zustand
   - Rediriger selon rôle

2. pages/auth/ForgotPassword.tsx
3. pages/auth/ResetPassword.tsx

4. Composant ProtectedRoute.tsx :
   - Vérifier token présent
   - Vérifier rôle autorisé
   - Rediriger vers /login si non auth

5. Hook useAuth.ts :
   - login(email, password)
   - logout()
   - user state
   - isAuthenticated
```

### 👑 Étape 15 : Frontend - Super-Admin
```
Crée les pages super-admin :

1. pages/admin/Restaurants.tsx :
   - Liste des restaurants (tableau)
   - Bouton "Créer restaurant"
   - Actions : éditer, supprimer
   - Modal de création/édition

2. pages/admin/Users.tsx :
   - Liste des utilisateurs
   - Filtres par rôle
   - Bouton "Créer utilisateur"
   - Modal de création avec :
     * Email, password, rôle
     * Select restaurant (si ADMIN_RESTAURANT ou STAFF)

Design avec Tailwind, utilise lucide-react pour les icônes.
```

### 🏢 Étape 16 : Frontend - Admin Restaurant
```
Crée les pages admin restaurant :

1. pages/restaurant/Dashboard.tsx :
   - Sélecteur de période (7d, 30d, custom)
   - Cartes de stats (visites, clics, formulaires, spins)
   - Graphique répartition lots (recharts)
   - Graphique gains par statut

2. pages/restaurant/Prizes.tsx :
   - Toggle "Roue active"
   - Liste des lots (tableau)
   - Colonnes : nom, %, message, actif
   - Validation en temps réel : somme ≤ 100
   - Alert si somme > 100

3. pages/restaurant/Clients.tsx :
   - Barre de recherche + filtres
   - Tableau avec pagination
   - Clic → fiche client (modal ou page)
   - Bouton "Export CSV"

4. components/ClientDetail.tsx :
   - Infos client (lecture seule)
   - Historique participations
   - Liste des lots par statut
```

### 🛒 Étape 17 : Frontend - Mode Caisse
```
Crée l'interface mode caisse :

1. pages/caisse/CaisseMode.tsx :
   - Input recherche avec debounce
   - GET /api/caisse/search?q=...
   - Liste résultats :
     * Nom/prénom
     * Téléphone masqué (06** ** ** 42)
     * Email masqué
     * Badge "X lots à récupérer"
   - Clic → afficher détail

2. components/ClientPrizes.tsx :
   - Liste lots non expirés
   - Cartes par lot :
     * Nom du lot
     * Date gagné + date expiration
     * Bouton "Marquer récupéré"
   - Confirmation avant claim

Design simplifié, gros boutons, lisible de loin.
```

### 🎨 Étape 18 : Composant Roue Interactive
```
Crée un composant réutilisable de roue :

components/SpinWheel.tsx :
- Props : prizes (liste avec name, percentage, color)
- État : isSpinning, result
- Méthode spin() :
  * Animation rotation (3-5 secondes)
  * Calcul du segment gagnant
  * Callback onResult(prize | null)

Utilise Canvas API ou SVG pour le dessin.
Segments colorés automatiquement (générer couleurs).
Animation fluide avec requestAnimationFrame.

Ajoute un son de rotation (optionnel) avec Web Audio API.
```

### 🐛 Étape 19 : Tests & Debugging
```
Crée des tests pour les parties critiques :

1. backend/tests/services/client.service.test.ts :
   - Test déduplication par téléphone
   - Test update email si différent
   - Test création si nouveau téléphone

2. backend/tests/services/participation.service.test.ts :
   - Test tirage roue respecte les %
   - Test LOSE implicite si somme < 100
   - Test erreur si somme > 100

3. backend/tests/services/prize.service.test.ts :
   - Test validation pourcentages

Lance les tests avec jest ou vitest.
Corrige les bugs détectés.
```

### 📱 Étape 20 : Optimisations & Polish
```
Finalise le projet :

1. Optimisations :
   - Ajoute des index manquants en DB si nécessaire
   - Optimise les requêtes N+1 (include Prisma)
   - Ajoute du cache pour les infos restaurant
   - Compression gzip pour l'API

2. UX :
   - Loading spinners partout
   - Messages toast pour success/error
   - Animations transitions de page
   - Feedback visuel boutons

3. Sécurité :
   - Rate limiting sur routes publiques
   - Validation stricte inputs
   - Sanitization données
   - CORS configuré correctement

4. Documentation :
   - README.md avec setup instructions
   - Postman collection pour l'API
   - Variables d'environnement (.env.example)
```

---

## 🎯 Prompt de Démarrage MAINTENANT

Copie-colle ceci dans Cursor :

```
✅ Le schéma Prisma est prêt.

Passe maintenant à l'Étape 2 :

Génère et applique la migration Prisma initiale avec :
npx prisma migrate dev --name init

Puis crée un fichier prisma/seed.ts pour initialiser :
- 1 super-admin (email: admin@platform.com, password: Admin123!)
- 2 restaurants de test :
  * "Le Bistrot Gourmand" (slug: bistrot-gourmand)
  * "La Trattoria" (slug: trattoria)
- 1 admin par restaurant (admin-bistrot@test.com, admin-trattoria@test.com)
- 1 staff par restaurant (staff-bistrot@test.com, staff-trattoria@test.com)
- 3 lots par restaurant avec pourcentages qui totalisent 80% :
  * Café offert (30%)
  * Dessert offert (25%)
  * -10% prochaine commande (25%)

Configure également le script dans package.json.
```

---

## ✅ Checklist Finale Avant Mise en Production

- [ ] Toutes les routes API sont protégées
- [ ] Isolation multi-tenant vérifiée
- [ ] Tests des règles métier critiques
- [ ] Responsive mobile testé
- [ ] RGPD : consentement + politique confidentialité
- [ ] Expiration lots fonctionne (cron)
- [ ] Export CSV opérationnel
- [ ] Validation pourcentages roue
- [ ] Masquage données sensibles en caisse
- [ ] Messages d'erreur clairs
- [ ] Documentation API
- [ ] Variables d'environnement configurées
- [ ] Backup DB configuré
- [ ] Monitoring de base

---

**Note importante :** Ce projet est une V1 simplifiée. Beaucoup de fonctionnalités avancées sont volontairement exclues pour permettre une livraison rapide. Garde une architecture propre pour faciliter les évolutions futures.