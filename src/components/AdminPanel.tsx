import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, BarChart3, Upload, UserCheck, Settings, Shield } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { BulkImportService } from '../services/bulkImportService';
import { AdminService } from '../services/adminService';
import BulkImportTab from './BulkImportTab';
import { useAuth } from '../hooks/useAuth';
import UserApprovalTab from './UserApprovalTab';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'unidades' | 'atendentes' | 'metricas' | 'bulk' | 'approval' | 'admins'>('unidades');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para dados
  const [unidades, setUnidades] = useState<any[]>([]);
  const [atendentes, setAtendentes] = useState<any[]>([]);
  const [metricasAtendentes, setMetricasAtendentes] = useState<any[]>([]);
  const [metricasUnidades, setMetricasUnidades] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Estados para formulários
  const [unidadeForm, setUnidadeForm] = useState({ nome: '', codigo: '', ativo: true });
  const [atendenteForm, setAtendenteForm] = useState({ nome: '', email: '', unidade_id: '', ativo: true, data_admissao: '' });
  const [metricaForm, setMetricaForm] = useState({
    mes_ano: '',
    unidade_id: '',
    atendente_id: '',
    valor_orcamentos_registrados: 0,
    valor_orcamentos_convertidos: 0,
    qtde_exames_vendidos: 0,
    qtde_pacientes_atendidos: 0,
    nps: 0
  });
  const [faturamentoForm, setFaturamentoForm] = useState({
    mes_ano: '',
    unidade_id: '',
    faturamento_total: 0
  });
  const [adminForm, setAdminForm] = useState({ email: '', isSuperAdmin: false });

  // Estados para edição
  const [editingUnidade, setEditingUnidade] = useState<any>(null);
  const [editingAtendente, setEditingAtendente] = useState<any>(null);
  const [editingMetrica, setEditingMetrica] = useState<any>(null);
  const [editingFaturamento, setEditingFaturamento] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unidadesData, atendentesData, metricasAtendentesData, metricasUnidadesData, adminUsersData] = await Promise.all([
        DashboardService.fetchUnidades(),
        DashboardService.fetchAtendentes(),
        DashboardService.fetchMetricasAtendentes(),
        DashboardService.fetchMetricasUnidades(),
        AdminService.fetchAdminUsers()
      ]);

      setUnidades(unidadesData);
      setAtendentes(atendentesData);
      setMetricasAtendentes(metricasAtendentesData);
      setMetricasUnidades(metricasUnidadesData);
      setAdminUsers(adminUsersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handlers para Unidades
  const handleUnidadeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUnidade) {
        await DashboardService.updateUnidade(editingUnidade.id, unidadeForm);
        showMessage('success', 'Unidade atualizada com sucesso!');
        setEditingUnidade(null);
      } else {
        await DashboardService.insertUnidade(unidadeForm);
        showMessage('success', 'Unidade criada com sucesso!');
      }
      setUnidadeForm({ nome: '', codigo: '', ativo: true });
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar unidade');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta unidade?')) return;
    
    setLoading(true);
    try {
      await DashboardService.deleteUnidade(id);
      showMessage('success', 'Unidade deletada com sucesso!');
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao deletar unidade');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Atendentes
  const handleAtendenteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAtendente) {
        await DashboardService.updateAtendente(editingAtendente.id, atendenteForm);
        showMessage('success', 'Atendente atualizado com sucesso!');
        setEditingAtendente(null);
      } else {
        await DashboardService.insertAtendente(atendenteForm);
        showMessage('success', 'Atendente criado com sucesso!');
      }
      setAtendenteForm({ nome: '', email: '', unidade_id: '', ativo: true, data_admissao: '' });
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar atendente');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAtendente = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este atendente?')) return;
    
    setLoading(true);
    try {
      await DashboardService.deleteAtendente(id);
      showMessage('success', 'Atendente deletado com sucesso!');
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao deletar atendente');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Métricas
  const handleMetricaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMetrica) {
        await DashboardService.updateMetricaAtendente(editingMetrica.id, metricaForm);
        showMessage('success', 'Métrica atualizada com sucesso!');
        setEditingMetrica(null);
      } else {
        await DashboardService.insertMetrica(metricaForm);
        showMessage('success', 'Métrica criada com sucesso!');
      }
      setMetricaForm({
        mes_ano: '',
        unidade_id: '',
        atendente_id: '',
        valor_orcamentos_registrados: 0,
        valor_orcamentos_convertidos: 0,
        qtde_exames_vendidos: 0,
        qtde_pacientes_atendidos: 0,
        nps: 0
      });
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar métrica');
    } finally {
      setLoading(false);
    }
  };

  const handleFaturamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingFaturamento) {
        await DashboardService.updateFaturamentoUnidade(editingFaturamento.id, faturamentoForm);
        showMessage('success', 'Faturamento atualizado com sucesso!');
        setEditingFaturamento(null);
      } else {
        await DashboardService.insertFaturamentoUnidade(faturamentoForm);
        showMessage('success', 'Faturamento criado com sucesso!');
      }
      setFaturamentoForm({ mes_ano: '', unidade_id: '', faturamento_total: 0 });
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar faturamento');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Bulk Import
  const handleBulkImport = async () => {
    setLoading(true);
    try {
      const sampleData = BulkImportService.generateSampleData();
      const result = await BulkImportService.importBulkData(sampleData);
      
      if (result.success) {
        showMessage('success', 'Dados de exemplo importados com sucesso!');
        await loadData();
      } else {
        showMessage('error', 'Erro na importação: ' + result.message);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Erro na importação');
    } finally {
      setLoading(false);
    }
  };

  // Handlers para Admins
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AdminService.addAdminUser(adminForm.email, adminForm.isSuperAdmin);
      showMessage('success', 'Admin adicionado com sucesso!');
      setAdminForm({ email: '', isSuperAdmin: false });
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao adicionar admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm('Tem certeza que deseja remover este admin?')) return;
    
    setLoading(true);
    try {
      await AdminService.removeAdminUser(email);
      showMessage('success', 'Admin removido com sucesso!');
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao remover admin');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'unidades':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Unidades</h2>
                <p className="text-sm text-gray-600">Adicione e gerencie as unidades de atendimento</p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleUnidadeSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={unidadeForm.nome}
                    onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome da unidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={unidadeForm.codigo}
                    onChange={(e) => setUnidadeForm({ ...unidadeForm, codigo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Código único"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={unidadeForm.ativo}
                      onChange={(e) => setUnidadeForm({ ...unidadeForm, ativo: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingUnidade ? 'Atualizar' : 'Criar'}
                </button>
                {editingUnidade && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUnidade(null);
                      setUnidadeForm({ nome: '', codigo: '', ativo: true });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Lista */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {unidades.map((unidade) => (
                      <tr key={unidade.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{unidade.nome}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{unidade.codigo}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            unidade.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {unidade.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingUnidade(unidade);
                              setUnidadeForm({
                                nome: unidade.nome,
                                codigo: unidade.codigo,
                                ativo: unidade.ativo
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUnidade(unidade.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'atendentes':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Atendentes</h2>
                <p className="text-sm text-gray-600">Adicione e gerencie os atendentes por unidade</p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleAtendenteSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAtendente ? 'Editar Atendente' : 'Novo Atendente'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={atendenteForm.nome}
                    onChange={(e) => setAtendenteForm({ ...atendenteForm, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={atendenteForm.email}
                    onChange={(e) => setAtendenteForm({ ...atendenteForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    required
                    value={atendenteForm.unidade_id}
                    onChange={(e) => setAtendenteForm({ ...atendenteForm, unidade_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma unidade</option>
                    {unidades.filter(u => u.ativo).map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
                  <input
                    type="date"
                    value={atendenteForm.data_admissao}
                    onChange={(e) => setAtendenteForm({ ...atendenteForm, data_admissao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={atendenteForm.ativo}
                      onChange={(e) => setAtendenteForm({ ...atendenteForm, ativo: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ativo</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingAtendente ? 'Atualizar' : 'Criar'}
                </button>
                {editingAtendente && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAtendente(null);
                      setAtendenteForm({ nome: '', email: '', unidade_id: '', ativo: true, data_admissao: '' });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Lista */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {atendentes.map((atendente) => (
                      <tr key={atendente.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{atendente.nome}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{atendente.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {atendente.unidades?.nome || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            atendente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {atendente.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingAtendente(atendente);
                              setAtendenteForm({
                                nome: atendente.nome,
                                email: atendente.email,
                                unidade_id: atendente.unidade_id,
                                ativo: atendente.ativo,
                                data_admissao: atendente.data_admissao
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteAtendente(atendente.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'metricas':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Métricas</h2>
                <p className="text-sm text-gray-600">Adicione métricas de performance dos atendentes e faturamento das unidades</p>
              </div>
            </div>

            {/* Tabs para Métricas */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-purple-500 text-purple-600 font-medium text-sm">
                  Métricas de Atendentes
                </button>
              </nav>
            </div>

            {/* Formulário Métricas Atendentes */}
            <form onSubmit={handleMetricaSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMetrica ? 'Editar Métrica' : 'Nova Métrica de Atendente'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
                  <input
                    type="month"
                    required
                    value={metricaForm.mes_ano}
                    onChange={(e) => setMetricaForm({ ...metricaForm, mes_ano: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    required
                    value={metricaForm.unidade_id}
                    onChange={(e) => setMetricaForm({ ...metricaForm, unidade_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma unidade</option>
                    {unidades.filter(u => u.ativo).map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atendente</label>
                  <select
                    required
                    value={metricaForm.atendente_id}
                    onChange={(e) => setMetricaForm({ ...metricaForm, atendente_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um atendente</option>
                    {atendentes
                      .filter(a => a.ativo && (!metricaForm.unidade_id || a.unidade_id === metricaForm.unidade_id))
                      .map((atendente) => (
                        <option key={atendente.id} value={atendente.id}>{atendente.nome}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamentos Registrados (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={metricaForm.valor_orcamentos_registrados}
                    onChange={(e) => setMetricaForm({ ...metricaForm, valor_orcamentos_registrados: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamentos Convertidos (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={metricaForm.valor_orcamentos_convertidos}
                    onChange={(e) => setMetricaForm({ ...metricaForm, valor_orcamentos_convertidos: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exames Vendidos</label>
                  <input
                    type="number"
                    min="0"
                    value={metricaForm.qtde_exames_vendidos}
                    onChange={(e) => setMetricaForm({ ...metricaForm, qtde_exames_vendidos: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes Atendidos</label>
                  <input
                    type="number"
                    min="0"
                    value={metricaForm.qtde_pacientes_atendidos}
                    onChange={(e) => setMetricaForm({ ...metricaForm, qtde_pacientes_atendidos: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NPS</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={metricaForm.nps}
                    onChange={(e) => setMetricaForm({ ...metricaForm, nps: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {editingMetrica ? 'Atualizar' : 'Criar'}
                </button>
                {editingMetrica && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMetrica(null);
                      setMetricaForm({
                        mes_ano: '',
                        unidade_id: '',
                        atendente_id: '',
                        valor_orcamentos_registrados: 0,
                        valor_orcamentos_convertidos: 0,
                        qtde_exames_vendidos: 0,
                        qtde_pacientes_atendidos: 0,
                        nps: 0
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Formulário Faturamento Unidades */}
            <form onSubmit={handleFaturamentoSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingFaturamento ? 'Editar Faturamento' : 'Novo Faturamento de Unidade'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
                  <input
                    type="month"
                    required
                    value={faturamentoForm.mes_ano}
                    onChange={(e) => setFaturamentoForm({ ...faturamentoForm, mes_ano: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    required
                    value={faturamentoForm.unidade_id}
                    onChange={(e) => setFaturamentoForm({ ...faturamentoForm, unidade_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma unidade</option>
                    {unidades.filter(u => u.ativo).map((unidade) => (
                      <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faturamento Total (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={faturamentoForm.faturamento_total}
                    onChange={(e) => setFaturamentoForm({ ...faturamentoForm, faturamento_total: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editingFaturamento ? 'Atualizar' : 'Criar'}
                </button>
                {editingFaturamento && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaturamento(null);
                      setFaturamentoForm({ mes_ano: '', unidade_id: '', faturamento_total: 0 });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Lista de Métricas */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Métricas Cadastradas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atendente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orçamentos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exames</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NPS</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metricasAtendentes.map((metrica) => (
                      <tr key={metrica.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{metrica.mes_ano}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{metrica.unidades?.nome}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{metrica.atendentes?.nome}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          R$ {metrica.valor_orcamentos_convertidos?.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{metrica.qtde_exames_vendidos}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{metrica.nps}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingMetrica(metrica);
                              setMetricaForm({
                                mes_ano: metrica.mes_ano,
                                unidade_id: metrica.unidade_id,
                                atendente_id: metrica.atendente_id,
                                valor_orcamentos_registrados: metrica.valor_orcamentos_registrados,
                                valor_orcamentos_convertidos: metrica.valor_orcamentos_convertidos,
                                qtde_exames_vendidos: metrica.qtde_exames_vendidos,
                                qtde_pacientes_atendidos: metrica.qtde_pacientes_atendidos,
                                nps: metrica.nps
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja deletar esta métrica?')) {
                                try {
                                  await DashboardService.deleteMetricaAtendente(metrica.id);
                                  showMessage('success', 'Métrica deletada com sucesso!');
                                  await loadData();
                                } catch (error: any) {
                                  showMessage('error', error.message || 'Erro ao deletar métrica');
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lista de Faturamento */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Faturamento por Unidade</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metricasUnidades.map((faturamento) => (
                      <tr key={faturamento.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{faturamento.mes_ano}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{faturamento.unidades?.nome}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          R$ {faturamento.faturamento_total?.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingFaturamento(faturamento);
                              setFaturamentoForm({
                                mes_ano: faturamento.mes_ano,
                                unidade_id: faturamento.unidade_id,
                                faturamento_total: faturamento.faturamento_total
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja deletar este faturamento?')) {
                                try {
                                  await DashboardService.deleteMetricaUnidade(faturamento.id);
                                  showMessage('success', 'Faturamento deletado com sucesso!');
                                  await loadData();
                                } catch (error: any) {
                                  showMessage('error', error.message || 'Erro ao deletar faturamento');
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'bulk':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Importação em Massa</h2>
                <p className="text-sm text-gray-600">Importe dados de exemplo para testar o dashboard</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dados de Exemplo</h3>
              <p className="text-gray-600 mb-6">
                Clique no botão abaixo para importar dados de exemplo que incluem:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
                <li>3 unidades de atendimento</li>
                <li>4 atendentes distribuídos pelas unidades</li>
                <li>Métricas de performance dos últimos meses</li>
                <li>Dados de faturamento por unidade</li>
              </ul>
              <button
                onClick={handleBulkImport}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                {loading ? 'Importando...' : 'Importar Dados de Exemplo'}
              </button>
            </div>
          </div>
        );

      case 'approval':
        return <UserApprovalTab />;

      case 'admins':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Gerenciar Administradores</h2>
                <p className="text-sm text-gray-600">Adicione e gerencie usuários administradores</p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleAdminSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Administrador</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin@exemplo.com"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminForm.isSuperAdmin}
                      onChange={(e) => setAdminForm({ ...adminForm, isSuperAdmin: e.target.checked })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Super Administrador</span>
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Adicionar Admin
                </button>
              </div>
            </form>

            {/* Lista */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {adminUsers.map((admin) => (
                      <tr key={admin.email}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.is_super_admin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.is_super_admin ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {admin.email !== 'admin@dashboard.com' && (
                            <button
                              onClick={() => handleRemoveAdmin(admin.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remover
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Gerencie dados e configurações do dashboard</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Mensagem */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('unidades')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unidades'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Unidades
              </div>
            </button>
            <button
              onClick={() => setActiveTab('atendentes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'atendentes'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Atendentes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('metricas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'metricas'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Métricas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importação
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approval')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approval'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Aprovação de Usuários
              </div>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admins'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Administradores
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Conteúdo */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;