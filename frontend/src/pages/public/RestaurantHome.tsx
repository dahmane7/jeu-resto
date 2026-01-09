import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

export default function RestaurantHome() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Données mockées du restaurant (sera remplacé par l'API plus tard)
  const restaurantData = {
    name: 'Special Thai',
    google_review_url: 'https://g.page/r/CahcgXGyq2K6EBM/review',
    wheel_active: true,
    logo: '/images/specialthai-logo.png', // Chemin vers le logo
  };

  const handleGoogleClick = () => {
    // Ouvrir Google dans un nouvel onglet
    window.open(restaurantData.google_review_url, '_blank');
  };

  const handleContinue = () => {
    if (!restaurantData.wheel_active) {
      alert('La roue est actuellement désactivée.');
      return;
    }
    navigate(`/r/${slug}/form`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src={restaurantData.logo}
            alt={`Logo ${restaurantData.name}`}
            className="h-24 w-auto object-contain max-w-full"
            onError={(e) => {
              // Fallback si l'image n'existe pas : afficher un placeholder
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center';
              fallback.innerHTML = '<span class="text-2xl">🍽️</span>';
              target.parentElement?.appendChild(fallback);
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          {restaurantData.name}
        </h1>
        <p className="text-gray-300 mb-8">
          Merci de nous laisser un avis !
        </p>

        {/* Bouton Google Avis */}
        <button
          onClick={handleGoogleClick}
          className="w-full mb-6 px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <Star className="w-6 h-6 fill-current" />
          Laisser un avis Google
        </button>

        <p className="text-sm text-gray-400 mb-6">
          Après avoir laissé ton avis, reviens ici pour jouer à la roue de la fortune !
        </p>

        {/* Bouton Continuer */}
        <button
          onClick={handleContinue}
          disabled={!restaurantData.wheel_active}
          className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          J'ai laissé mon avis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
