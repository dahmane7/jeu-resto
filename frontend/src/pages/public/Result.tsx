import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PartyPopper, Frown, Clock, Gift } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  message?: string;
}

export default function Result() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { prize, isWin } = location.state || { 
    prize: null, 
    isWin: false 
  };

  // Si pas de résultat, rediriger vers le formulaire
  if (!prize && !location.state) {
    navigate(`/r/${slug}/form`);
    return null;
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {isWin && prize ? (
          <>
            {/* Gagné */}
            <div className="mb-6">
              <PartyPopper className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Félicitations !
              </h2>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Tu as gagné :</p>
              <h3 className="text-2xl font-bold text-indigo-600 mb-4">
                {prize.name}
              </h3>
              
              {prize.message ? (
                <p className="text-gray-700 mb-4">{prize.message}</p>
              ) : (
                <p className="text-gray-700 mb-4">
                  Félicitations ! Tu as gagné ce lot.
                </p>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>
                  À récupérer sous 7 jours
                  <br />
                  <span className="font-semibold">
                    avant le {expirationDate.toLocaleDateString('fr-FR')}
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Comment récupérer ton lot ?</strong>
                <br />
                Présente-toi en caisse avec ton téléphone ou email pour récupérer ton gain.
              </p>
            </div>

            <button
              onClick={() => navigate(`/r/${slug}`)}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              Retour à l'accueil
            </button>
          </>
        ) : (
          <>
            {/* Perdu */}
            <div className="mb-6">
              <Frown className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                😔 Dommage...
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 text-lg mb-4">
                Tu n'as pas gagné cette fois, mais merci d'avoir participé !
              </p>
              <p className="text-gray-600">
                Reviens nous voir bientôt pour une nouvelle chance de gagner.
              </p>
            </div>

            <button
              onClick={() => navigate(`/r/${slug}`)}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
