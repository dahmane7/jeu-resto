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

## 🎬 Prompt de Démarrage pour Cursor

```
Je démarre le développement d'une plateforme multi-restaurants.
Structure du projet :

/project-root
  /backend
    /src
      /controllers
      /routes
      /middleware
      /services
      /utils
      /prisma
  /frontend
    /src
      /components
      /pages
      /hooks
      /services
      /store
      /types

Commence par :
1. Créer le schéma Prisma complet avec tous les modèles
2. Setup de l'authentification JWT
3. Créer les routes API de base pour l'auth

Respecte scrupuleusement les règles métier du document, 
notamment la déduplication client par téléphone.
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