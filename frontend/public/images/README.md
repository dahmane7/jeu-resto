# 📁 Dossier Images

Placez ici les logos et images des restaurants.

## 📝 Instructions

### Pour ajouter le logo de "Special Thai"

1. Placez votre fichier logo dans ce dossier
2. Nommez-le : `special-thai-logo.png` (ou `.jpg`, `.svg`, etc.)
3. Le code chargera automatiquement l'image

### Formats supportés
- PNG (recommandé avec fond transparent)
- JPG
- SVG (recommandé pour les logos)
- WebP

### Taille recommandée
- Largeur : 200-300px
- Hauteur : proportionnelle
- Format : PNG avec fond transparent ou SVG

### Exemple de structure
```
public/
  images/
    special-thai-logo.png
    special-thai-logo.svg
```

## 🔧 Utilisation dans le code

Le logo est référencé dans `src/pages/public/RestaurantHome.tsx` :

```typescript
logo: '/images/special-thai-logo.png'
```

Les fichiers dans `public/` sont accessibles directement via `/images/...` dans le navigateur.
