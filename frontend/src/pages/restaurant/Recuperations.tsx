import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Phone, Mail, Gift, CheckCircle, Clock, XCircle, Copy, Check } from 'lucide-react';
import NavigationTabs from '../../components/NavigationTabs';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../api/client';

interface Client {
  id: string;
  phone: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Prize {
  id: string;
  name: string;
  message: string;
}

interface Participation {
  id: string;
  prize: Prize | null;
  claim_code: string;
  won_at: string;
  expires_at: string;
  status: 'A_RECUPERER' | 'RECUPERE' | 'EXPIRE';
  claimed_at?: string;
  client?: Client | null;
}

export default function Recuperations() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientParticipations, setClientParticipations] = useState<Participation[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim() || !restaurantId || !token) {
      setSelectedClient(null);
      setClientParticipations([]);
      return;
    }
    setSearching(true);
    apiFetch<Participation[]>(`/api/restaurants/${restaurantId}/participations?search=${encodeURIComponent(searchQuery.trim())}`, { token })
      .then((list) => {
        setClientParticipations(list);
        const first = list[0];
        setSelectedClient(first?.client ?? null);
      })
      .catch(() => {
        setSelectedClient(null);
        setClientParticipations([]);
      })
      .finally(() => setSearching(false));
  };

  const handleClaimPrize = (participationId: string) => {
    if (!restaurantId || !token) return;
    apiFetch(`/api/restaurants/${restaurantId}/participations/${participationId}/claim`, {
      method: 'PATCH',
      token,
    })
      .then(() => {
        setClientParticipations((prev) =>
          prev.map((p) =>
            p.id === participationId
              ? { ...p, status: 'RECUPERE' as const, claimed_at: new Date().toISOString() }
              : p
          )
        );
      })
      .catch(() => {});
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const pendingParticipations = clientParticipations.filter(
    (p) => p.status === 'A_RECUPERER'
  );
  const claimedParticipations = clientParticipations.filter(
    (p) => p.status === 'RECUPERE'
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Gestion des Récupérations</h1>
      <p className="text-white mb-8">
        Recherchez un client et validez la récupération de ses gains
      </p>

      <NavigationTabs restaurantId={restaurantId || ''} />

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Rechercher par téléphone, email ou code de réclamation (ex: ABC-123-XYZ)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {searching ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          💡 Vous pouvez rechercher par numéro de téléphone, email ou code de réclamation
        </p>
      </div>

      {/* Résultats */}
      {selectedClient && (
        <div className="space-y-6">
          {/* Informations client */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-semibold text-gray-900">{selectedClient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{selectedClient.email}</p>
                </div>
              </div>
              {selectedClient.first_name && (
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-semibold text-gray-900">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lots à récupérer */}
          {pendingParticipations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-indigo-600" />
                  Lots à récupérer ({pendingParticipations.length})
                </h2>
              </div>
              <div className="space-y-4">
                {pendingParticipations.map((participation) => {
                  const daysLeft = getDaysUntilExpiry(participation.expires_at);
                  const isExpiringSoon = daysLeft <= 2;
                  const isExpired = daysLeft < 0;

                  return (
                    <div
                      key={participation.id}
                      className={`border-2 rounded-lg p-4 ${
                        isExpired
                          ? 'border-red-300 bg-red-50'
                          : isExpiringSoon
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {participation.prize?.name ?? 'Lot'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {participation.prize?.message ?? ''}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Gagné le {formatDate(participation.won_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  isExpired
                                    ? 'text-red-600'
                                    : isExpiringSoon
                                    ? 'text-orange-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {isExpired
                                  ? '⚠️ Expiré'
                                  : daysLeft > 0
                                  ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                                  : 'Expiré'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Code de réclamation */}
                      <div className="bg-white rounded-lg p-3 mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Code de réclamation</p>
                          <code className="text-lg font-bold text-indigo-600">
                            {participation.claim_code}
                          </code>
                        </div>
                        <button
                          onClick={() => handleCopyCode(participation.claim_code)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copier le code"
                        >
                          {copiedCode === participation.claim_code ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Bouton valider */}
                      <button
                        onClick={() => handleClaimPrize(participation.id)}
                        disabled={isExpired}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isExpired ? 'Lot expiré' : 'Marquer comme récupéré'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lots déjà récupérés */}
          {claimedParticipations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Lots déjà récupérés ({claimedParticipations.length})
              </h2>
              <div className="space-y-3">
                {claimedParticipations.map((participation) => (
                  <div
                    key={participation.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {participation.prize?.name ?? 'Lot'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Code : <code className="font-mono">{participation.claim_code}</code>
                        </p>
                        <p className="text-sm text-gray-600">
                          Récupéré le{' '}
                          {participation.claimed_at
                            ? formatDate(participation.claimed_at)
                            : 'N/A'}
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aucun lot en attente */}
          {pendingParticipations.length === 0 && claimedParticipations.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Ce client n'a aucun lot à récupérer ou déjà récupéré.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Message si aucun résultat */}
      {!selectedClient && searchQuery && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Aucun client trouvé avec cette recherche.
            <br />
            <span className="text-sm text-gray-500">
              Vérifiez le numéro de téléphone, l'email ou le code de réclamation.
            </span>
          </p>
        </div>
      )}

      {/* Message d'aide initial */}
      {!selectedClient && !searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Comment utiliser cette page ?
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Recherchez un client par son numéro de téléphone ou son email</li>
            <li>Ou recherchez directement par code de réclamation (ex: ABC-123-XYZ)</li>
            <li>Une fois le client trouvé, vous verrez tous ses gains en attente</li>
            <li>Cliquez sur "Marquer comme récupéré" pour valider la récupération d'un gain</li>
          </ul>
        </div>
      )}
    </div>
  );
}
