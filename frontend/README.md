# Frontend - Jeu Resto

Interface utilisateur React pour la plateforme QR Avis Google + Roue.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

1. Copier `.env.example` vers `.env`
2. Vérifier que `VITE_API_URL` pointe vers votre backend

### Développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5173`

### Build

```bash
npm run build
```

## 📁 Structure

```
src/
  components/     # Composants réutilisables
  pages/          # Pages de l'application
  hooks/          # Hooks React personnalisés
  services/       # Services API
  store/          # État global (Zustand)
  types/          # Types TypeScript
```

## 🎨 Styling

Le projet utilise Tailwind CSS pour le styling.

## 🔧 Technologies

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
