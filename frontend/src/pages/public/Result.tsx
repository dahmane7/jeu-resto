import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Frown, Clock, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Prize {
  id: string;
  name: string;
  message?: string;
}

interface Participation {
  id: string;
  claim_code: string | null;
  expires_at: string;
}

export default function Result() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { prize, isWin, participation } = (location.state || {}) as {
    prize: Prize | null;
    isWin: boolean;
    participation?: Participation;
  };

  const claimCode = participation?.claim_code ?? participation?.id ?? '';

  if (!location.state) {
    navigate(`/r/${slug}/form`);
    return null;
  }

  const expirationDate = participation?.expires_at
    ? new Date(participation.expires_at)
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      })();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardClass = 'max-w-md w-full rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden';
  const stars = (
    <>
      <span className="absolute top-6 left-8 text-amber-600/40 text-xl">✦</span>
      <span className="absolute top-8 right-10 text-amber-600/30 text-sm">✦</span>
      <span className="absolute bottom-24 right-12 text-amber-600/25 text-lg">✦</span>
      <span className="absolute bottom-32 left-10 text-amber-600/35 text-sm">✦</span>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {isWin && (prize || claimCode) ? (
        <div className={`${cardClass} bg-amber-400`}>
          {stars}
          <div className="relative">
            <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center justify-center gap-2">
              <span>☕</span>
              FÉLICITATIONS !
              <span>🎉</span>
            </h2>
            <p className="text-gray-800 font-bold text-sm uppercase tracking-wide mb-6">
              Vous avez gagné :
            </p>
            <div className="bg-white rounded-2xl p-6 mb-5 shadow-lg">
              <p className="text-2xl font-black text-rose-600 uppercase">
                {prize?.name ?? 'Lot'}
              </p>
            </div>
            <p className="text-gray-800 text-sm font-medium mb-6">
              Montrez ce résultat à notre personnel
            </p>
            {claimCode && (
              <div className="bg-amber-500/30 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-gray-800 mb-2">Code à présenter :</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-xl font-bold tracking-wider text-gray-900 bg-white/60 px-3 py-2 rounded-lg">
                    {claimCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-white/60 hover:bg-white/80 rounded-lg transition-colors"
                    title="Copier le code"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-700" /> : <Copy className="w-5 h-5 text-gray-700" />}
                  </button>
                </div>
                <p className="text-xs text-gray-700 mt-2 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Valable avant le {expirationDate.toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            <button
              onClick={() => navigate(`/r/${slug}`)}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold uppercase text-lg shadow-lg transition-colors"
            >
              Super !
            </button>
          </div>
        </div>
      ) : (
        <div className={`${cardClass} bg-amber-100`}>
          {stars}
          <div className="relative">
            <div className="mb-6">
              <Frown className="w-16 h-16 text-gray-500 mx-auto mb-3" />
              <h2 className="text-2xl font-black text-gray-900">Dommage...</h2>
            </div>
            <div className="bg-white/80 rounded-2xl p-6 mb-6 shadow-md">
              <p className="text-gray-800 font-medium">
                Tu n'as pas gagné cette fois, mais merci d'avoir participé ! Reviens nous voir pour une nouvelle chance.
              </p>
            </div>
            <button
              onClick={() => navigate(`/r/${slug}`)}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold uppercase shadow-lg transition-colors"
            >
              Super !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
