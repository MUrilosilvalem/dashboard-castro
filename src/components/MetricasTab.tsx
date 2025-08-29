import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { formatCurrency } from '../utils/dataUtils';

interface MetricaAtendente {
  id: string;
  mes_ano: string;
  unidade_id: string;
  atendente_id: string;
  valor_orcamentos_registrados: number;
  valor_orcamentos_convertidos: number;
  qtde_exames_vendidos: number;
  qtde_pacientes_atendidos: number;
  nps: number;
  created_at: string;
  updated_at: string;
  unidades?: { nome: string };
  atendentes?: { nome: string };
}

interface MetricaUnidade {
  id: string;
  mes_ano: string;
  unidade_id: string;
  faturamento_total: number;
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

interface Atendente {
  id: string;
  nome: string;
  email: string;
  unidade_id: string;
  ativo: boolean;
}

const MetricasTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'atendentes' | 'unidades'>('atendentes');
  const [metricasAtendentes, setMetricasAtendentes] = useState<MetricaAtendente[]>([]);
  const [metricasUnidades, setMetricasUnidades] = useState<MetricaUnidade[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formDataAtendente, setFormDataAtendente] = useState({
    mes_ano: new Date().toISOString().slice(0, 7),
    unidade_id: '',
    atendente_id: '',
    valor_orcamentos_registrados: 0,
    valor_orcamentos_convertidos: 0,
    qtde_exames_vendidos: 0,
    qtde_pacientes_atendidos: 0,
    nps: 0
  });

  const [formDataUnidade, setFormDataUnidade] = useState({
    mes_ano: new Date().toISOString().slice(0, 7),
    unidade_id: '',
    faturamento_total: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricasAtendentesData, metricasUnidadesData, unidadesData, atendentesData] = await Promise.all([
        DashboardService.fetchMetricasAtendentes(),
        DashboardService.fetchMetricasUnidades(),
        DashboardService.fetchUnidades(),
        DashboardService.fetchAtendentes()
      ]);
      
      setMetricasAtendentes(metricasAtendentesData);
      setMetricasUnidades(metricasUnidadesData);
      setUnidades(unidadesData);
      setAtendentes(atendentesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetricaAtendente = async () => {
    if (!formDataAtendente.mes_ano || !formDataAtendente.unidade_id || !formDataAtendente.atendente_id) {
      setMessage({ type: 'error', text: 'Mês/ano, unidade e atendente são obrigatórios' });
      return;
    }

    setActionLoading('add');
    try {
      await DashboardService.insertMetrica(formDataAtendente);
      setMessage({ type: 'success', text: 'Métrica de atendente adicionada com sucesso!' });
      setFormDataAtendente({
        mes_ano: new Date().toISOString().slice(0, 7),
        unidade_id: '',
        atendente_id: '',
        valor_orcamentos_registrados: 0,
        valor_orcamentos_convertidos: 0,
        qtde_exames_vendidos: 0,
        qtde_pacientes_atendidos: 0,
        nps: 0
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao adicionar métrica:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar métrica' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMetricaUnidade = async () => {
    if (!formDataUnidade.mes_ano || !formDataUnidade.unidade_id) {
      setMessage({ type: 'error', text: 'Mês/ano e unidade são obrigatórios' });
      return;
    }

    setActionLoading('add');
    try {
      await DashboardService.insertFaturamentoUnidade(formDataUnidade);
      setMessage({ type: 'success', text: 'Métrica de unidade adicionada com sucesso!' });
      setFormDataUnidade({
        mes_ano: new Date().toISOString().slice(0, 7),
        unidade_id: '',
        faturamento_total: 0
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao adicionar métrica:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar métrica' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMetricaAtendente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta métrica?')) return;

    setActionLoading(id);
    try {
      await DashboardService.deleteMetricaAtendente(id);
      setMessage({ type: 'success', text: 'Métrica excluída com sucesso!' });
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir métrica:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir métrica' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMetricaUnidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta métrica?')) return;

    setActionLoading(id);
    try {
      await DashboardService.deleteMetricaUnidade(id);
      setMessage({ type: 'success', text: 'Métrica excluída com sucesso!' });
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir métrica:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir métrica' });
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
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Métricas</h2>
            <p className="text-sm text-gray-600">Adicione e gerencie métricas de performance</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Métrica
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

      {/* Sub Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('atendentes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'atendentes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Métricas de Atendentes
          </button>
          <button
            onClick={() => setActiveSubTab('unidades')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'unidades'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Métricas de Unidades
          </button>
        </nav>
      </div>

      {/* Add Forms */}
      {showAddForm && activeSubTab === 'atendentes' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Métrica de Atendente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
              <input
                type="month"
                value={formDataAtendente.mes_ano}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, mes_ano: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={formDataAtendente.unidade_id}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, unidade_id: e.target.value, atendente_id: '' })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Atendente</label>
              <select
                value={formDataAtendente.atendente_id}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, atendente_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!formDataAtendente.unidade_id}
              >
                <option value="">Selecione um atendente</option>
                {atendentes
                  .filter(a => a.ativo && a.unidade_id === formDataAtendente.unidade_id)
                  .map(atendente => (
                    <option key={atendente.id} value={atendente.id}>
                      {atendente.nome}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamentos Registrados</label>
              <input
                type="number"
                value={formDataAtendente.valor_orcamentos_registrados}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, valor_orcamentos_registrados: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamentos Convertidos</label>
              <input
                type="number"
                value={formDataAtendente.valor_orcamentos_convertidos}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, valor_orcamentos_convertidos: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exames Vendidos</label>
              <input
                type="number"
                value={formDataAtendente.qtde_exames_vendidos}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, qtde_exames_vendidos: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes Atendidos</label>
              <input
                type="number"
                value={formDataAtendente.qtde_pacientes_atendidos}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, qtde_pacientes_atendidos: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPS</label>
              <input
                type="number"
                value={formDataAtendente.nps}
                onChange={(e) => setFormDataAtendente({ ...formDataAtendente, nps: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleAddMetricaAtendente}
              disabled={actionLoading === 'add'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormDataAtendente({
                  mes_ano: new Date().toISOString().slice(0, 7),
                  unidade_id: '',
                  atendente_id: '',
                  valor_orcamentos_registrados: 0,
                  valor_orcamentos_convertidos: 0,
                  qtde_exames_vendidos: 0,
                  qtde_pacientes_atendidos: 0,
                  nps: 0
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

      {showAddForm && activeSubTab === 'unidades' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Métrica de Unidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
              <input
                type="month"
                value={formDataUnidade.mes_ano}
                onChange={(e) => setFormDataUnidade({ ...formDataUnidade, mes_ano: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={formDataUnidade.unidade_id}
                onChange={(e) => setFormDataUnidade({ ...formDataUnidade, unidade_id: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Faturamento Total</label>
              <input
                type="number"
                value={formDataUnidade.faturamento_total}
                onChange={(e) => setFormDataUnidade({ ...formDataUnidade, faturamento_total: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={handleAddMetricaUnidade}
              disabled={actionLoading === 'add'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormDataUnidade({
                  mes_ano: new Date().toISOString().slice(0, 7),
                  unidade_id: '',
                  faturamento_total: 0
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

      {/* Content based on active sub-tab */}
      {activeSubTab === 'atendentes' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {metricasAtendentes.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma métrica de atendente</h3>
              <p className="text-gray-600">Adicione métricas para visualizar no dashboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Atendente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orçamentos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exames
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NPS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metricasAtendentes.map((metrica) => (
                    <tr key={metrica.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrica.mes_ano}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metrica.unidades?.nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metrica.atendentes?.nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(metrica.valor_orcamentos_registrados)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metrica.qtde_exames_vendidos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metrica.nps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteMetricaAtendente(metrica.id)}
                          disabled={actionLoading === metrica.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'unidades' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {metricasUnidades.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma métrica de unidade</h3>
              <p className="text-gray-600">Adicione métricas para visualizar no dashboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faturamento Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metricasUnidades.map((metrica) => (
                    <tr key={metrica.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metrica.mes_ano}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metrica.unidades?.nome || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(metrica.faturamento_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteMetricaUnidade(metrica.id)}
                          disabled={actionLoading === metrica.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  async function handleAddMetricaAtendente() {
    if (!formDataAtendente.mes_ano || !formDataAtendente.unidade_id || !formDataAtendente.atendente_id) {
      setMessage({ type: 'error', text: 'Mês/ano, unidade e atendente são obrigatórios' });
      return;
    }

    setActionLoading('add');
    try {
      await DashboardService.insertMetrica(formDataAtendente);
      setMessage({ type: 'success', text: 'Métrica de atendente adicionada com sucesso!' });
      setFormDataAtendente({
        mes_ano: new Date().toISOString().slice(0, 7),
        unidade_id: '',
        atendente_id: '',
        valor_orcamentos_registrados: 0,
        valor_orcamentos_convertidos: 0,
        qtde_exames_vendidos: 0,
        qtde_pacientes_atendidos: 0,
        nps: 0
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao adicionar métrica:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar métrica' });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddMetricaUnidade() {
    if (!formDataUnidade.mes_ano || !formDataUnidade.unidade_id) {
      setMessage({ type: 'error', text: 'Mês/ano e unidade são obrigatórios' });
      return;
    }

    setActionLoading('add');
    try {
      await DashboardService.insertFaturamentoUnidade(formDataUnidade);
      setMessage({ type: 'success', text: 'Métrica de unidade adicionada com sucesso!' });
      setFormDataUnidade({
        mes_ano: new Date().toISOString().slice(0, 7),
        unidade_id: '',
        faturamento_total: 0
      });
      setShowAddForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao adicionar métrica:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar métrica' });
    } finally {
      setActionLoading(null);
    }
  }
};

export default MetricasTab;