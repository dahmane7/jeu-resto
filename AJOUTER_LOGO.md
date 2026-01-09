# 🖼️ Comment Ajouter le Logo "Special Thai"

## 📁 Étape 1 : Créer le Dossier

Créez le dossier suivant dans votre projet :

```bash
cd frontend
mkdir -p public/images
```

## 📥 Étape 2 : Ajouter le Logo

1. Placez votre fichier logo dans : `frontend/public/images/`
2. Nommez-le : `special-thai-logo.png` (ou `.jpg`, `.svg`, etc.)

**Structure attendue :**
```
frontend/
  public/
    images/
      special-thai-logo.png  ← Votre logo ici
```

## ✅ Étape 3 : Vérifier

Une fois le logo ajouté, la page `http://localhost:5173/r/restaurant-1` affichera automatiquement votre logo.

## 🎨 Formats Recommandés

- **PNG** : Avec fond transparent (recommandé)
- **SVG** : Pour les logos vectoriels (meilleure qualité)
- **JPG** : Si vous avez un fond coloré

## 📏 Taille Recommandée

- **Largeur** : 200-300px
- **Hauteur** : Proportionnelle (généralement carré ou rectangulaire)
- **Résolution** : 72-150 DPI pour le web

## 🔧 Si le Logo ne s'Affiche pas

1. Vérifiez que le fichier est bien dans `frontend/public/images/`
2. Vérifiez le nom du fichier : `special-thai-logo.png`
3. Vérifiez la console du navigateur (F12) pour des erreurs
4. Si l'image n'existe pas, un placeholder (🍽️) s'affichera automatiquement

## 💡 Alternative : URL Externe

Si votre logo est hébergé ailleurs, vous pouvez aussi utiliser une URL :

```typescript
logo: 'https://votre-domaine.com/logo.png'
```

Modifiez alors dans `RestaurantHome.tsx` :
```typescript
logo: 'https://votre-url.com/logo.png'
```
