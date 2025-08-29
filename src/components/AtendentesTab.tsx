import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';

interface Atendente {
  id: string;
  nome: string;
  email: string;
  unidade_id: string;
  ativo: boolean;
  data_admissao: string;
  created_at: string;
  updated_at: string;
  unidades?: { nome: string };
}

interface Unidade {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
}

const AtendentesTab: React.FC = () => {
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    unidade_id: '',
    ativo: true,
    data_admissao: new Date().toISOString().split('T')[0]
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [atendentesData, unidadesData] = await Promise.all([
        DashboardService.fetchAtendentes(),
        DashboardService.fetchUnidades()
      ]);
      setAtendentes(atendentesData);
      setUnidades(unidadesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.nome.trim() || !formData.email.trim() || !formData.unidade_id) {
      setMessage({ type: 'error', text: 'Nome, email e unidade são obrigatórios' });
      return;
    }

    setActionLoading('add');
    try {
      await DashboardService.insertAtendente(formData);
      setMessage({ type: 'success', text: 'Atendente adicionado com sucesso!' });
      setFormData({
        nome: '',
        email: '',
        unidade_id: '',
        ativo: true,
        data_admissao: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao adicionar atendente:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar atendente' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Atendente>) => {
    setActionLoading(id);
    try {
      await DashboardService.updateAtendente(id, updates);
      setMessage({ type: 'success', text: 'Atendente atualizado com sucesso!' });
      setEditingId(null);
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar atendente:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar atendente' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este atendente?')) return;

    setActionLoading(id);
    try {
      await DashboardService.deleteAtendente(id);
      setMessage({ type: 'success', text: 'Atendente excluído com sucesso!' });
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir atendente:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir atendente' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Atendentes</h2>
            <p className="text-sm text-gray-600">Cadastre e gerencie os atendentes por unidade</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Atendente
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Atendente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={formData.unidade_id}
                onChange={(e) => setFormData({ ...formData, unidade_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma unidade</option>
                {unidades.filter(u => u.ativo).map(unidade => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
              <input
                type="date"
                value={formData.data_admissao}
                onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Atendente ativo</span>
            </label>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleAdd}
              disabled={actionLoading === 'add'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  nome: '',
                  email: '',
                  unidade_id: '',
                  ativo: true,
                  data_admissao: new Date().toISOString().split('T')[0]
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Atendentes List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {atendentes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendente cadastrado</h3>
            <p className="text-gray-600">Adicione seu primeiro atendente para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admissão
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {atendentes.map((atendente) => (
                  <tr key={atendente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {atendente.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {atendente.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {atendente.unidades?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        atendente.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {atendente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(atendente.data_admissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(atendente.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(atendente.id)}
                          disabled={actionLoading === atendente.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este atendente?')) return;

    setActionLoading(id);
    try {
      await DashboardService.deleteAtendente(id);
      setMessage({ type: 'success', text: 'Atendente excluído com sucesso!' });
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir atendente:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir atendente' });
    } finally {
      setActionLoading(null);
    }
  }
};

export default AtendentesTab;