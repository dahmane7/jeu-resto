import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { publicFetch } from '../../api/client';

type RestaurantData = {
  id: string;
  name: string;
  google_review_url: string;
  wheel_active: boolean;
  prizes?: { id: string; name: string; percentage: number; message: string }[];
};

export default function RestaurantHome() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    publicFetch<RestaurantData>(`/api/public/r/${slug}`)
      .then((data) => setRestaurantData(data))
      .catch(() => setRestaurantData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug || !restaurantData) return;
    publicFetch(`/api/public/r/${slug}/track/visit`, { method: 'POST' }).catch(() => {});
  }, [slug, restaurantData?.id]);

  const handleGoogleClick = () => {
    if (restaurantData?.google_review_url) {
      window.open(restaurantData.google_review_url, '_blank');
      if (slug) publicFetch(`/api/public/r/${slug}/track/google-click`, { method: 'POST' }).catch(() => {});
    }
  };

  const handleContinue = () => {
    if (!restaurantData) return;
    if (!restaurantData.wheel_active) {
      alert('La roue est actuellement désactivée.');
      return;
    }
    navigate(`/r/${slug}/form`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <p className="text-gray-700">Restaurant non trouvé.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/images/specialthai-logo.png"
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
          disabled={!restaurantData?.wheel_active}
          className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          J'ai laissé mon avis
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
