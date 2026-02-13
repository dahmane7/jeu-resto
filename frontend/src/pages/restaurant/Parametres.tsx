import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Save } from 'lucide-react';
import NavigationTabs from '../../components/NavigationTabs';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../api/client';

interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  google_review_url: string;
  wheel_active: boolean;
}

export default function Parametres() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!restaurantId || !token) return;
    apiFetch<RestaurantInfo>(`/api/restaurants/${restaurantId}`, { token })
      .then((data) => {
        setRestaurant(data);
        setGoogleReviewUrl(data.google_review_url || '');
      })
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false));
  }, [restaurantId, token]);

  const handleSave = () => {
    if (!restaurantId || !token) return;
    setSaving(true);
    setMessage(null);
    apiFetch(`/api/restaurants/${restaurantId}`, {
      method: 'PATCH',
      body: JSON.stringify({ google_review_url: googleReviewUrl.trim() }),
      token,
    })
      .then(() => {
        setMessage({ type: 'success', text: 'URL enregistrée. Le bouton « Laisser un avis Google » pointera vers cette adresse.' });
      })
      .catch(() => setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' }))
      .finally(() => setSaving(false));
  };

  if (loading || !restaurant) {
    return (
      <div>
        <NavigationTabs restaurantId={restaurantId!} />
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <NavigationTabs restaurantId={restaurantId!} />
      <div className="max-w-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Lien avis Google
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          URL vers laquelle le bouton « Laisser un avis Google » redirige les clients sur la page publique (ex. page Google de ton établissement).
        </p>
        <div className="space-y-3">
          <label htmlFor="google_review_url" className="block text-sm font-medium text-gray-700">
            URL de la page Google Avis
          </label>
          <input
            id="google_review_url"
            type="url"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
