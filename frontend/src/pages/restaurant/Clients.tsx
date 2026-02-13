import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Download, Eye, X, Plus, Trash2, Pencil } from 'lucide-react';
import NavigationTabs from '../../components/NavigationTabs';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../api/client';

interface Client {
  id: string;
  phone: string;
  email: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  age_range?: string;
  created_at: string;
  participations_count: number;
}

export default function Clients() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const { token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    phone: '',
    email: '',
    name: '',
    city: '',
    age_range: '',
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    phone: '',
    email: '',
    first_name: '',
    last_name: '',
    city: '',
    age_range: '',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    phone: '',
    email: '',
    first_name: '',
    last_name: '',
    city: '',
    age_range: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchClients = useCallback(() => {
    if (!restaurantId || !token) return;
    apiFetch<Client[]>(`/api/restaurants/${restaurantId}/clients`, { token })
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [restaurantId, token]);

  useEffect(() => {
    setLoading(true);
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter((client) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      client.phone.includes(q) ||
      client.email.toLowerCase().includes(q) ||
      `${client.first_name ?? ''} ${client.last_name ?? ''}`.toLowerCase().includes(q) ||
      (client.city ?? '').toLowerCase().includes(q) ||
      (client.age_range ?? '').toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Téléphone', 'Email', 'Prénom', 'Nom', 'Ville', 'Tranche d\'âge', 'Date création', 'Participations'];
    const rows = filteredClients.map(client => [
      client.phone,
      client.email,
      client.first_name || '',
      client.last_name || '',
      client.city || '',
      client.age_range || '',
      client.created_at,
      client.participations_count.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      phone: '',
      email: '',
      name: '',
      city: '',
      age_range: '',
    });
  };

  const handleDeleteClient = (clientId: string) => {
    if (!confirm('Supprimer ce client ? Ses participations seront aussi supprimées.')) return;
    if (!restaurantId || !token) return;
    apiFetch(`/api/restaurants/${restaurantId}/clients/${clientId}`, { method: 'DELETE', token })
      .then(() => {
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        if (selectedClient?.id === clientId) setSelectedClient(null);
      })
      .catch(() => {});
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !token || !editingClient) return;
    setEditError(null);
    setEditSubmitting(true);
    apiFetch<Client>(`/api/restaurants/${restaurantId}/clients/${editingClient.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        first_name: editForm.first_name.trim() || undefined,
        last_name: editForm.last_name.trim() || undefined,
        city: editForm.city.trim() || undefined,
        age_range: editForm.age_range || undefined,
      }),
      token,
    })
      .then((updated) => {
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        if (selectedClient?.id === updated.id) setSelectedClient(updated);
        setEditingClient(null);
      })
      .catch((err) => {
        setEditError(err instanceof Error ? err.message : 'Erreur lors de la modification.');
      })
      .finally(() => setEditSubmitting(false));
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || !token) return;
    setAddError(null);
    setAddSubmitting(true);
    apiFetch<Client>(`/api/restaurants/${restaurantId}/clients`, {
      method: 'POST',
      body: JSON.stringify({
        phone: addForm.phone.trim(),
        email: addForm.email.trim(),
        first_name: addForm.first_name.trim() || undefined,
        last_name: addForm.last_name.trim() || undefined,
        city: addForm.city.trim() || undefined,
        age_range: addForm.age_range || undefined,
      }),
      token,
    })
      .then((created) => {
        setClients((prev) => [...prev, created]);
        setShowAddModal(false);
        setAddForm({ phone: '', email: '', first_name: '', last_name: '', city: '', age_range: '' });
      })
      .catch((err) => {
        setAddError(err instanceof Error ? err.message : 'Impossible d\'ajouter le client.');
      })
      .finally(() => setAddSubmitting(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowAddModal(true);
              setAddError(null);
              setAddForm({ phone: '', email: '', first_name: '', last_name: '', city: '', age_range: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un client
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      <NavigationTabs restaurantId={restaurantId || ''} />

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par téléphone, email, nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              showFilters
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtres
          </button>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={filters.phone}
                  onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="06..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="email@..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Prénom ou nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Paris..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tranche d'âge</label>
                <select
                  value={filters.age_range}
                  onChange={(e) => setFilters({ ...filters, age_range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="-18">-18</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} trouvé{filteredClients.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Âge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Chargement des clients...
                  </td>
                </tr>
              ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.first_name} {client.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{client.city || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{client.age_range || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.participations_count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button
                        onClick={() => {
                          setEditingClient(client);
                          setEditForm({
                            phone: client.phone,
                            email: client.email,
                            first_name: client.first_name ?? '',
                            last_name: client.last_name ?? '',
                            city: client.city ?? '',
                            age_range: client.age_range ?? '',
                          });
                          setEditError(null);
                        }}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        title="Modifier le client"
                      >
                        <Pencil className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        title="Supprimer le client"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails Client */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Fiche Client</h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Prénom</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.first_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.last_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ville</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.city || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tranche d'âge</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.age_range || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date d'inscription</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedClient.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Participations</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.participations_count}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter un client */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ajouter un client</h2>
              <button
                onClick={() => { setShowAddModal(false); setAddError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {addError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="client@exemple.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={addForm.first_name}
                    onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={addForm.last_name}
                    onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={addForm.city}
                  onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tranche d'âge</label>
                <select
                  value={addForm.age_range}
                  onChange={(e) => setAddForm((f) => ({ ...f, age_range: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">—</option>
                  <option value="-18">-18</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddError(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addSubmitting ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier un client */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modifier le client</h2>
              <button
                onClick={() => { setEditingClient(null); setEditError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {editError}
              </div>
            )}
            <form onSubmit={handleEditClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="client@exemple.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tranche d'âge</label>
                <select
                  value={editForm.age_range}
                  onChange={(e) => setEditForm((f) => ({ ...f, age_range: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">—</option>
                  <option value="-18">-18</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setEditingClient(null); setEditError(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
