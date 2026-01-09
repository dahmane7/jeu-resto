import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Power, AlertCircle, CheckCircle } from 'lucide-react';
import NavigationTabs from '../../components/NavigationTabs';

interface Prize {
  id: string;
  name: string;
  percentage: number;
  message: string;
  is_active: boolean;
}

export default function Prizes() {
  const { id } = useParams<{ id: string }>();
  const [wheelActive, setWheelActive] = useState(true);
  const [prizes, setPrizes] = useState<Prize[]>([
    {
      id: '1',
      name: 'Café offert',
      percentage: 30,
      message: 'Félicitations ! Vous avez gagné un café offert.',
      is_active: true,
    },
    {
      id: '2',
      name: 'Dessert offert',
      percentage: 25,
      message: 'Félicitations ! Vous avez gagné un dessert offert.',
      is_active: true,
    },
    {
      id: '3',
      name: '-10% prochaine commande',
      percentage: 25,
      message: 'Félicitations ! Vous avez gagné une réduction de 10% sur votre prochaine commande.',
      is_active: true,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 0,
    message: '',
    is_active: true,
  });

  // Calculer le total des pourcentages actifs
  const totalPercentage = prizes
    .filter(p => p.is_active)
    .reduce((sum, p) => sum + p.percentage, 0);

  const isValid = totalPercentage <= 100;
  const remainingPercentage = 100 - totalPercentage;

  const handleOpenModal = (prize?: Prize) => {
    if (prize) {
      setEditingPrize(prize);
      setFormData({
        name: prize.name,
        percentage: prize.percentage,
        message: prize.message,
        is_active: prize.is_active,
      });
    } else {
      setEditingPrize(null);
      setFormData({
        name: '',
        percentage: 0,
        message: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPrize(null);
    setFormData({
      name: '',
      percentage: 0,
      message: '',
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPrize) {
      // Modifier un lot existant
      setPrizes(prizes.map(p => 
        p.id === editingPrize.id 
          ? { ...p, ...formData }
          : p
      ));
    } else {
      // Créer un nouveau lot
      const newPrize: Prize = {
        id: Date.now().toString(),
        ...formData,
      };
      setPrizes([...prizes, newPrize]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (prizeId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      setPrizes(prizes.filter(p => p.id !== prizeId));
    }
  };

  const togglePrizeActive = (prizeId: string) => {
    setPrizes(prizes.map(p => 
      p.id === prizeId 
        ? { ...p, is_active: !p.is_active }
        : p
    ));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Paramétrage Roue
      </h1>

      <NavigationTabs restaurantId={id || ''} />

      {/* Toggle Roue Active */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Roue active</h3>
            <p className="text-sm text-gray-500 mt-1">
              Activez ou désactivez la roue pour ce restaurant
            </p>
          </div>
          <button
            onClick={() => setWheelActive(!wheelActive)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${wheelActive ? 'bg-indigo-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${wheelActive ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Validation des pourcentages */}
      <div className={`p-4 rounded-lg mb-6 ${
        isValid 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className={`font-medium ${
              isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              Total des pourcentages actifs : {totalPercentage.toFixed(1)}%
            </p>
            {isValid ? (
              <p className="text-sm text-green-700 mt-1">
                {remainingPercentage > 0 
                  ? `${remainingPercentage.toFixed(1)}% restants (zone "perdu")`
                  : 'Total à 100% - Configuration parfaite !'
                }
              </p>
            ) : (
              <p className="text-sm text-red-700 mt-1">
                La somme des pourcentages ne peut pas dépasser 100%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bouton Ajouter */}
      <div className="mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter un lot
        </button>
      </div>

      {/* Liste des lots */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pourcentage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prizes.map((prize) => (
              <tr key={prize.id} className={!prize.is_active ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{prize.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{prize.percentage}%</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-md truncate">
                    {prize.message}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePrizeActive(prize.id)}
                    className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                      ${prize.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    `}
                  >
                    <Power className={`w-3 h-3 ${prize.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    {prize.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(prize)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPrize ? 'Modifier le lot' : 'Ajouter un lot'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du lot *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Café offert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pourcentage (0-100) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pourcentage de chance de gagner ce lot
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message personnalisé *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Message affiché au client s'il gagne ce lot"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Lot actif
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {editingPrize ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
