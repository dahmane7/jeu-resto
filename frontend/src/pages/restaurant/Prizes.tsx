import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Power } from 'lucide-react';
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
    { id: '1', name: 'Café offert', percentage: 30, message: 'Félicitations !', is_active: true },
    { id: '2', name: 'Dessert offert', percentage: 25, message: 'Bravo !', is_active: true },
    { id: '3', name: '-10% sur la commande', percentage: 25, message: 'Profitez de votre réduction !', is_active: true },
  ]);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', percentage: 0, message: '' });

  const totalPercentage = prizes.filter(p => p.is_active).reduce((sum, p) => sum + p.percentage, 0);
  const isValid = totalPercentage <= 100;

  const handleToggleWheel = () => {
    setWheelActive(!wheelActive);
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setFormData({ name: prize.name, percentage: prize.percentage, message: prize.message });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      setPrizes(prizes.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrize) {
      setPrizes(prizes.map(p => p.id === editingPrize.id ? { ...p, ...formData } : p));
    } else {
      setPrizes([...prizes, { id: Date.now().toString(), ...formData, is_active: true }]);
    }
    setShowModal(false);
    setEditingPrize(null);
    setFormData({ name: '', percentage: 0, message: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramétrage Roue</h1>
      </div>

      <NavigationTabs restaurantId={id || ''} />

      {/* Toggle Roue Active */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Roue active</h3>
            <p className="text-sm text-gray-600">Activez ou désactivez la roue pour les clients</p>
          </div>
          <button
            onClick={handleToggleWheel}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              wheelActive ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                wheelActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Validation des pourcentages */}
      {!isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">
            ⚠️ Attention : La somme des pourcentages ({totalPercentage}%) dépasse 100% !
          </p>
        </div>
      )}

      {/* Liste des lots */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Lots de la roue</h2>
          <button
            onClick={() => {
              setEditingPrize(null);
              setFormData({ name: '', percentage: 0, message: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter un lot
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pourcentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actif</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prizes.map((prize) => (
                <tr key={prize.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prize.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prize.percentage}%</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{prize.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${prize.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {prize.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(prize)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(prize.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total : <span className={`font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage}%
            </span>
          </p>
        </div>
      </div>

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPrize ? 'Modifier le lot' : 'Ajouter un lot'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPrize(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
