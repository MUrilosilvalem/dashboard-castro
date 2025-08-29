import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';

interface Unidade {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const UnidadesTab: React.FC = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    ativo: true
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const data = await DashboardService.fetchUnidades();
      setUnidades(data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar unidades' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.nome.trim() || !formData.codigo.trim()) {
      setMessage({ type: 'error', text: 'Nome e código são obrigatórios' });
      return;
    }

    setActionLoading('add');
    try {
      await DashboardService.insertUnidade(formData);
      setMessage({ type: 'success', text: 'Unidade adicionada com sucesso!' });
      setFormData({ nome: '', codigo: '', ativo: true });
      setShowAddForm(false);
      await loadUnidades();
    } catch (error) {
      console.error('Erro ao adicionar unidade:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar unidade' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Unidade>) => {
    setActionLoading(id);
    try {
      await DashboardService.updateUnidade(id, updates);
      setMessage({ type: 'success', text: 'Unidade atualizada com sucesso!' });
      setEditingId(null);
      await loadUnidades();
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar unidade' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;

    setActionLoading(id);
    try {
      await DashboardService.deleteUnidade(id);
      setMessage({ type: 'success', text: 'Unidade excluída com sucesso!' });
      await loadUnidades();
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir unidade' });
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
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Unidades</h2>
            <p className="text-sm text-gray-600">Cadastre e gerencie as unidades de atendimento</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Unidade
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova Unidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da unidade"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Código único"
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
              <span className="text-sm text-gray-700">Unidade ativa</span>
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
                setFormData({ nome: '', codigo: '', ativo: true });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Unidades List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {unidades.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma unidade cadastrada</h3>
            <p className="text-gray-600">Adicione sua primeira unidade para começar.</p>
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
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unidades.map((unidade) => (
                  <tr key={unidade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {unidade.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unidade.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        unidade.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {unidade.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(unidade.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(unidade.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(unidade.id)}
                          disabled={actionLoading === unidade.id}
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
};

export default UnidadesTab;