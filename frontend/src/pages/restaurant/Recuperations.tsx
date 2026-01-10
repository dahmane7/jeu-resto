import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Phone, Mail, Gift, CheckCircle, Clock, XCircle, Copy, Check } from 'lucide-react';
import NavigationTabs from '../../components/NavigationTabs';

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
  prize: Prize;
  claim_code: string;
  won_at: string;
  expires_at: string;
  status: 'A_RECUPERER' | 'RECUPERE' | 'EXPIRE';
  claimed_at?: string;
}

// Données mockées pour la démo (correspondent aux clients de la page Clients)
const mockClients: Client[] = [
  {
    id: '1',
    phone: '0612345678',
    email: 'jean.dupont@email.com',
    first_name: 'Jean',
    last_name: 'Dupont',
  },
  {
    id: '2',
    phone: '0698765432',
    email: 'marie.martin@email.com',
    first_name: 'Marie',
    last_name: 'Martin',
  },
  {
    id: '3',
    phone: '0654321098',
    email: 'pierre.durand@email.com',
    first_name: 'Pierre',
    last_name: 'Durand',
  },
];

const mockParticipations: Participation[] = [
  // Jean Dupont - 2 lots à récupérer
  {
    id: '1',
    prize: {
      id: '1',
      name: 'Café offert',
      message: 'Félicitations ! Profitez de votre café gratuit !',
    },
    claim_code: 'JDP-123-CAF',
    won_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'A_RECUPERER',
  },
  {
    id: '2',
    prize: {
      id: '3',
      name: '-10% sur la commande',
      message: 'Félicitations ! Profitez de votre réduction !',
    },
    claim_code: '929-TBE-Y8C',
    won_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'A_RECUPERER',
  },
  // Marie Martin - 1 lot à récupérer
  {
    id: '3',
    prize: {
      id: '2',
      name: 'Dessert offert',
      message: 'Bravo ! Choisissez votre dessert préféré !',
    },
    claim_code: 'MMT-456-DES',
    won_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'A_RECUPERER',
  },
  // Pierre Durand - 2 lots (1 à récupérer, 1 déjà récupéré)
  {
    id: '4',
    prize: {
      id: '1',
      name: 'Café offert',
      message: 'Félicitations ! Profitez de votre café gratuit !',
    },
    claim_code: 'PDD-789-CAF',
    won_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'A_RECUPERER',
  },
  {
    id: '5',
    prize: {
      id: '2',
      name: 'Dessert offert',
      message: 'Bravo ! Choisissez votre dessert préféré !',
    },
    claim_code: 'PDD-321-DES',
    won_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'RECUPERE',
    claimed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function Recuperations() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientParticipations, setClientParticipations] = useState<Participation[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Récupérer les participations récupérées depuis localStorage
  const getClaimedParticipations = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem('claimed_participations');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  };

  // Sauvegarder une participation comme récupérée dans localStorage
  const saveClaimedParticipation = (participationId: string) => {
    if (typeof window === 'undefined') return;
    const claimed = getClaimedParticipations();
    claimed.add(participationId);
    localStorage.setItem('claimed_participations', JSON.stringify(Array.from(claimed)));
  };

  // Appliquer les statuts récupérés depuis localStorage aux participations mockées
  const applyClaimedStatus = (participations: Participation[]): Participation[] => {
    const claimedIds = getClaimedParticipations();
    return participations.map(p => {
      if (claimedIds.has(p.id)) {
        return {
          ...p,
          status: 'RECUPERE' as const,
          claimed_at: p.claimed_at || new Date().toISOString(),
        };
      }
      return p;
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSelectedClient(null);
      setClientParticipations([]);
      return;
    }

    const query = searchQuery.trim();
    const queryUpper = query.toUpperCase();
    const queryLower = query.toLowerCase();

    // Détecter si c'est un code de réclamation (format XXX-XXX-XXX ou variations)
    // Pattern flexible pour accepter 2-4 caractères par section (ex: MMT-456-DES, 929-TBE-Y8C)
    const codePattern = /^[A-Z0-9]{2,4}-[A-Z0-9]{2,4}-[A-Z0-9]{2,4}$/i;
    const isClaimCode = codePattern.test(query);

    if (isClaimCode) {
      // Normaliser le code recherché
      const normalizedQuery = queryUpper.replace(/\s/g, '');
      
      // Debug: afficher les codes disponibles
      console.log('🔍 Recherche du code:', normalizedQuery);
      console.log('📋 Codes disponibles:', mockParticipations.map(p => p.claim_code));
      
      // Rechercher la participation par code (comparaison insensible à la casse)
      const participationByCode = mockParticipations.find((p) => {
        const normalizedCode = p.claim_code.toUpperCase().replace(/\s/g, '');
        const matches = normalizedCode === normalizedQuery;
        if (matches) {
          console.log('✅ Code trouvé:', p.claim_code);
        }
        return matches;
      });
      
      console.log('🎯 Résultat:', participationByCode ? 'TROUVÉ' : 'NON TROUVÉ');

      if (participationByCode) {
        // Trouver le client associé selon le code
        let client = mockClients[0]; // Par défaut
        const codeUpper = participationByCode.claim_code.toUpperCase();
        
        // Association des codes aux clients
        if (codeUpper === 'JDP-123-CAF' || codeUpper === '929-TBE-Y8C') {
          client = mockClients[0]; // Jean Dupont
        } else if (codeUpper === 'MMT-456-DES') {
          client = mockClients[1]; // Marie Martin
        } else if (codeUpper === 'PDD-789-CAF' || codeUpper === 'PDD-321-DES') {
          client = mockClients[2]; // Pierre Durand
        }
        
        // S'assurer que le client est bien défini
        if (!client) {
          client = mockClients[0]; // Fallback
        }
        
        // Appliquer le statut récupéré depuis localStorage
        const participationWithStatus = applyClaimedStatus([participationByCode])[0];
        
        setSelectedClient(client);
        setClientParticipations([participationWithStatus]);
        return;
      }
      
      // Si le code n'est pas trouvé dans les participations, essayer quand même de trouver le client
      // Cela peut arriver si le code a été généré mais pas encore enregistré
      console.warn('Code non trouvé dans les participations:', normalizedQuery);
      
      // Si le code n'est pas trouvé, afficher le message d'erreur
      console.warn('Code non trouvé:', normalizedQuery, 'Codes disponibles:', mockParticipations.map(p => p.claim_code));
      setSelectedClient(null);
      setClientParticipations([]);
      return;
    }

    // Recherche par téléphone ou email
    const client = mockClients.find(
      (c) =>
        c.phone.replace(/\s/g, '').includes(queryLower.replace(/\s/g, '')) ||
        c.email.toLowerCase().includes(queryLower)
    );

    if (client) {
      setSelectedClient(client);
      let clientParticipationsList: Participation[] = [];
      
      if (client.id === '1') {
        clientParticipationsList = mockParticipations.filter(
          (p) => p.claim_code === 'JDP-123-CAF' || p.claim_code === '929-TBE-Y8C'
        );
      } else if (client.id === '2') {
        clientParticipationsList = mockParticipations.filter(
          (p) => p.claim_code === 'MMT-456-DES'
        );
      } else if (client.id === '3') {
        clientParticipationsList = mockParticipations.filter(
          (p) => p.claim_code === 'PDD-789-CAF' || p.claim_code === 'PDD-321-DES'
        );
      }
      
      // Appliquer les statuts récupérés depuis localStorage
      const participationsWithStatus = applyClaimedStatus(clientParticipationsList);
      
      setClientParticipations(participationsWithStatus);
    } else {
      setSelectedClient(null);
      setClientParticipations([]);
    }
  };

  const handleClaimPrize = (participationId: string) => {
    // Sauvegarder dans localStorage pour persister entre les recherches
    saveClaimedParticipation(participationId);
    
    // Mettre à jour l'état local
    setClientParticipations((prev) =>
      prev.map((p) =>
        p.id === participationId
          ? {
              ...p,
              status: 'RECUPERE' as const,
              claimed_at: new Date().toISOString(),
            }
          : p
      )
    );
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Récupérations</h1>
      <p className="text-gray-600 mb-8">
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
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Rechercher
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
                            {participation.prize.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {participation.prize.message}
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
                          {participation.prize.name}
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
