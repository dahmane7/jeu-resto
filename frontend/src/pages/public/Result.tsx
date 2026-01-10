import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PartyPopper, Frown, Clock, Gift, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Prize {
  id: string;
  name: string;
  message?: string;
}

// Fonction pour générer un code unique
function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclut les caractères ambigus
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}-${part3}`;
}

export default function Result() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [claimCode, setClaimCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const { prize, isWin } = location.state || { 
    prize: null, 
    isWin: false 
  };

  // Générer un code unique si le client a gagné
  useEffect(() => {
    if (isWin && prize) {
      // Générer ou récupérer le code depuis le localStorage (pour éviter de le régénérer)
      const storedCode = localStorage.getItem(`claim_code_${slug}_${prize.id}`);
      if (storedCode) {
        setClaimCode(storedCode);
      } else {
        const newCode = generateClaimCode();
        setClaimCode(newCode);
        localStorage.setItem(`claim_code_${slug}_${prize.id}`, newCode);
      }
    }
  }, [isWin, prize, slug]);

  // Si pas de résultat, rediriger vers le formulaire
  if (!prize && !location.state) {
    navigate(`/r/${slug}/form`);
    return null;
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

            {/* Code de réclamation */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
              <p className="text-sm mb-3 font-semibold">Ton code de réclamation :</p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <code className="text-3xl font-bold tracking-wider bg-white/20 px-4 py-2 rounded-lg">
                  {claimCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Copier le code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-300" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs opacity-90">
                📸 Prends une capture d'écran ou copie ce code
                <br />
                Présente-le en caisse avec ton téléphone ou email
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>Comment récupérer ton lot ?</strong>
                <br />
                1. Présente-toi en caisse avec ce code
                <br />
                2. Donne ton téléphone ou email
                <br />
                3. Le staff validera ta réclamation
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
