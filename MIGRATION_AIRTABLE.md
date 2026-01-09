# Migration vers Airtable

## ✅ Modifications Effectuées

Le projet a été migré de **PostgreSQL + Prisma** vers **Airtable**.

### Fichiers Modifiés

1. **`backend/package.json`**
   - ❌ Supprimé : `@prisma/client`, `prisma`
   - ✅ Ajouté : `airtable`

2. **`backend/src/utils/airtable.ts`** (NOUVEAU)
   - Service Airtable complet avec méthodes CRUD
   - Mapping automatique des enregistrements
   - Support des filtres et tri

3. **`backend/src/utils/airtable-schema.md`** (NOUVEAU)
   - Documentation complète du schéma Airtable
   - Instructions de configuration
   - Mapping des champs

4. **`backend/src/utils/prisma.ts`**
   - Remplacé par un export vers `airtable.ts`

5. **`backend/src/utils/seed.ts`** (NOUVEAU)
   - Seed adapté pour Airtable
   - Gestion des relations Airtable (arrays)

6. **`backend/src/types/index.ts`** (NOUVEAU)
   - Types TypeScript pour tous les modèles
   - Enums pour les rôles et statuts

7. **`backend/env.example`**
   - ❌ Supprimé : `DATABASE_URL`
   - ✅ Ajouté : `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`

8. **Documentation**
   - `README.md` mis à jour
   - `backend/README.md` mis à jour

## 🔧 Configuration Requise

### 1. Créer les Tables dans Airtable

Suivez les instructions dans `backend/src/utils/airtable-schema.md` pour créer les 6 tables :

- `Restaurants`
- `Users`
- `Clients`
- `Prizes`
- `Participations`
- `Analytics`

### 2. Récupérer les Identifiants

1. **API Key** :
   - Allez sur https://airtable.com/api
   - Sélectionnez votre base
   - Copiez votre API Key

2. **Base ID** :
   - Dans l'URL de votre base : `https://airtable.com/appXXXXXXXXXXXXXX`
   - Le Base ID est la partie après `/app`

### 3. Configurer .env

```env
AIRTABLE_API_KEY=votre_api_key_ici
AIRTABLE_BASE_ID=votre_base_id_ici
JWT_SECRET=votre_jwt_secret
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 📝 Différences Clés avec Prisma

### Relations

**Prisma :**
```typescript
restaurant_id: String
restaurant: Restaurant @relation(...)
```

**Airtable :**
```typescript
restaurant_id: string | string[]  // Array pour les links
```

Les relations Airtable sont stockées comme des arrays d'IDs.

### Requêtes

**Prisma :**
```typescript
await prisma.restaurant.findUnique({ where: { id } })
```

**Airtable :**
```typescript
await airtable.findById(TABLES.RESTAURANTS, id)
```

### Filtres

**Prisma :**
```typescript
await prisma.client.findMany({
  where: { restaurant_id: 'xxx', phone: 'yyy' }
})
```

**Airtable :**
```typescript
await airtable.findMany(TABLES.CLIENTS, {
  filterByFormula: `AND({restaurant_id} = "xxx", {phone} = "yyy")`
})
```

## ⚠️ Limitations Airtable

1. **Rate Limiting** :
   - Plan gratuit : 5 requêtes/seconde
   - Plan Pro : 1200 requêtes/seconde

2. **Limite d'enregistrements** :
   - Plan gratuit : 100 000 enregistrements/table

3. **Pas de transactions** :
   - Les opérations sont atomiques mais pas transactionnelles

4. **Filtres** :
   - Utilisation de formules Airtable (syntaxe spécifique)

## 🚀 Prochaines Étapes

1. Créer les tables dans Airtable
2. Configurer `.env`
3. Installer les dépendances : `npm install`
4. Tester la connexion : `npm run dev`
5. (Optionnel) Lancer le seed : `npm run seed`

## 📚 Ressources

- [Documentation Airtable API](https://airtable.com/api)
- [Airtable SDK npm](https://www.npmjs.com/package/airtable)
- [Schéma détaillé](./backend/src/utils/airtable-schema.md)
