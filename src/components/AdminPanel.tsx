import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, Users, BarChart3, Upload, Download, Receipt } from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { BulkImportService } from '../services/bulkImportService';

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
  data_admissao: string;
  unidades?: { nome: string };
}

interface MetricaForm {
  mes_ano: string;
  unidade_id: string;
  atendente_id: string;
  valor_orcamentos_registrados: number;
  valor_orcamentos_convertidos: number;
  qtde_exames_vendidos: number;
  qtde_pacientes_atendidos: number;
  nps: number;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unidades' | 'atendentes' | 'metricas' | 'faturamento' | 'gerenciar' | 'import'>('unidades');
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [metricasAtendentes, setMetricasAtendentes] = useState<any[]>([]);
  const [metricasUnidades, setMetricasUnidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  // Estados para formulários
  const [unidadeForm, setUnidadeForm] = useState({ nome: '', codigo: '', ativo: true });
  const [atendenteForm, setAtendenteForm] = useState({ 
    nome: '', 
    email: '', 
    unidade_id: '', 
    ativo: true, 
    data_admissao: new Date().toISOString().split('T')[0] 
  });
  const [faturamentoForm, setFaturamentoForm] = useState({
    mes_ano: new Date().toISOString().slice(0, 7),
    unidade_id: '',
    faturamento_total: 0
  });
  const [metricaForm, setMetricaForm] = useState<MetricaForm>({
    mes_ano: new Date().toISOString().slice(0, 7),
    unidade_id: '',
    atendente_id: '',
    valor_orcamentos_registrados: 0,
    valor_orcamentos_convertidos: 0,
    qtde_exames_vendidos: 0,
    qtde_pacientes_atendidos: 0,
    nps: 0
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'unidades') {
        const data = await DashboardService.fetchUnidades();
        console.log('Unidades carregadas:', data);
        setUnidades(data);
      } else if (activeTab === 'atendentes') {
        const data = await DashboardService.fetchAtendentes();
        console.log('Atendentes carregados:', data);
        setAtendentes(data);
      } else if (activeTab === 'faturamento') {
        // Carregar unidades para o select
        const unidadesData = await DashboardService.fetchUnidades();
        setUnidades(unidadesData);
        
        // Carregar métricas de unidades
        const metricasUnidadeData = await DashboardService.fetchMetricasUnidades();
        setMetricasUnidades(metricasUnidadeData);
      } else if (activeTab === 'gerenciar') {
        // Carregar métricas de atendentes
        const metricasAtendenteData = await DashboardService.fetchMetricasAtendentes();
        setMetricasAtendentes(metricasAtendenteData);
        
        // Carregar métricas de unidades
        const metricasUnidadeData = await DashboardService.fetchMetricasUnidades();
        setMetricasUnidades(metricasUnidadeData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error instanceof Error && error.message.includes('Missing Supabase')) {
        // Não mostrar erro se Supabase não estiver configurado
        setUnidades([]);
        setAtendentes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUnidade = async () => {
    if (!unidadeForm.nome || !unidadeForm.codigo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      console.log('Tentando salvar unidade:', unidadeForm);
      
      if (editingItem) {
        const result = await DashboardService.updateUnidade(editingItem.id, unidadeForm);
        console.log('Unidade atualizada:', result);
      } else {
        const result = await DashboardService.insertUnidade(unidadeForm);
        console.log('Unidade inserida:', result);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setUnidadeForm({ nome: '', codigo: '', ativo: true });
      await loadData();
      alert('Unidade salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Missing Supabase')) {
          alert('❌ ERRO: Supabase não está configurado!\n\nPor favor:\n1. Clique no botão "Connect to Supabase" no topo da página\n2. Configure sua conta Supabase\n3. Tente novamente');
        } else if (error.message.includes('duplicate key')) {
          alert('❌ ERRO: Já existe uma unidade com este código!\n\nPor favor, use um código diferente.');
        } else if (error.message.includes('row-level security') || error.message.includes('401')) {
          alert('❌ ERRO: Problema de autenticação!\n\nSolução:\n1. Faça login no sistema\n2. Ou execute a migração para corrigir as políticas RLS\n3. Tente novamente');
        } else {
          alert(`❌ ERRO ao salvar unidade:\n\n${error.message}`);
        }
      } else {
        alert('❌ ERRO desconhecido ao salvar unidade');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAtendente = async () => {
    if (!atendenteForm.nome || !atendenteForm.email || !atendenteForm.unidade_id) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      if (editingItem) {
        await DashboardService.updateAtendente(editingItem.id, atendenteForm);
      } else {
        await DashboardService.insertAtendente(atendenteForm);
      }
      setShowForm(false);
      setEditingItem(null);
      setAtendenteForm({ nome: '', email: '', unidade_id: '', ativo: true, data_admissao: new Date().toISOString().split('T')[0] });
      await loadData();
      alert('Atendente salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar atendente:', error);
      if (error instanceof Error && error.message.includes('Missing Supabase')) {
        alert('Erro: Supabase não está configurado. Clique no botão "Connect to Supabase" no topo da página.');
      } else {
        alert(`Erro ao salvar atendente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetrica = async () => {
    if (!metricaForm.mes_ano || !metricaForm.unidade_id || !metricaForm.atendente_id) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      if (editingItem) {
        await DashboardService.updateMetricaAtendente(editingItem.id, {
          mes_ano: metricaForm.mes_ano,
          unidade_id: metricaForm.unidade_id,
          atendente_id: metricaForm.atendente_id,
          valor_orcamentos_registrados: metricaForm.valor_orcamentos_registrados,
          valor_orcamentos_convertidos: metricaForm.valor_orcamentos_convertidos,
          qtde_exames_vendidos: metricaForm.qtde_exames_vendidos,
          qtde_pacientes_atendidos: metricaForm.qtde_pacientes_atendidos,
          nps: metricaForm.nps
        });
      } else {
        await DashboardService.insertMetrica(metricaForm);
      }
      setShowForm(false);
      setEditingItem(null);
      setMetricaForm({
        mes_ano: new Date().toISOString().slice(0, 7),
        unidade_id: '',
        atendente_id: '',
        faturamento_total: 0,
        valor_orcamentos_registrados: 0,
        valor_orcamentos_convertidos: 0,
        qtde_exames_vendidos: 0,
        qtde_pacientes_atendidos: 0,
        tkm_paciente: 0,
        nps: 0
      });
      alert(editingItem ? 'Métrica atualizada com sucesso!' : 'Métrica salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar métrica:', error);
      alert(`Erro ao salvar métrica: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaturamento = async () => {
    if (!faturamentoForm.mes_ano || !faturamentoForm.unidade_id || faturamentoForm.faturamento_total <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      if (editingItem) {
        await DashboardService.updateFaturamentoUnidade(editingItem.id, faturamentoForm);
      } else {
        await DashboardService.insertFaturamentoUnidade(faturamentoForm);
      }
      setShowForm(false);
      setEditingItem(null);
      setFaturamentoForm({
        mes_ano: new Date().toISOString().slice(0, 7),
        unidade_id: '',
        faturamento_total: 0
      });
      alert('Faturamento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
      alert(`Erro ao salvar faturamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMetricaAtendente = (metrica: any) => {
    setEditingItem(metrica);
    setMetricaForm({
      mes_ano: metrica.mes_ano,
      unidade_id: metrica.unidade_id,
      atendente_id: metrica.atendente_id,
      valor_orcamentos_registrados: metrica.valor_orcamentos_registrados || 0,
      valor_orcamentos_convertidos: metrica.valor_orcamentos_convertidos || 0,
      qtde_exames_vendidos: metrica.qtde_exames_vendidos || 0,
      qtde_pacientes_atendidos: metrica.qtde_pacientes_atendidos || 0,
      nps: metrica.nps || 0
    });
    setActiveTab('metricas');
    setShowForm(true);
  };

  const handleDeleteMetricaAtendente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta métrica de atendente?')) return;
    
    try {
      setLoading(true);
      await DashboardService.deleteMetricaAtendente(id);
      await loadData();
      alert('Métrica de atendente excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir métrica de atendente:', error);
      alert(`Erro ao excluir métrica de atendente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMetricaUnidade = (metrica: any) => {
    setEditingItem(metrica);
    setFaturamentoForm({
      mes_ano: metrica.mes_ano,
      unidade_id: metrica.unidade_id,
      faturamento_total: metrica.faturamento_total || 0
    });
    setActiveTab('faturamento');
    setShowForm(true);
  };

  const handleDeleteMetricaUnidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta métrica de unidade?')) return;
    
    try {
      setLoading(true);
      await DashboardService.deleteMetricaUnidade(id);
      await loadData();
      alert('Métrica de unidade excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir métrica de unidade:', error);
      alert(`Erro ao excluir métrica de unidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUnidade = (unidade: Unidade) => {
    setEditingItem(unidade);
    setUnidadeForm({ nome: unidade.nome, codigo: unidade.codigo, ativo: unidade.ativo });
    setShowForm(true);
  };

  const handleDeleteUnidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;
    
    try {
      setLoading(true);
      await DashboardService.deleteUnidade(id);
      await loadData();
      alert('Unidade excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      alert(`Erro ao excluir unidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAtendente = (atendente: Atendente) => {
    setEditingItem(atendente);
    setAtendenteForm({
      nome: atendente.nome,
      email: atendente.email,
      unidade_id: atendente.unidade_id,
      ativo: atendente.ativo,
      data_admissao: atendente.data_admissao
    });
    setShowForm(true);
  };

  const handleDeleteAtendente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este atendente?')) return;
    
    try {
      setLoading(true);
      await DashboardService.deleteAtendente(id);
      await loadData();
      alert('Atendente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir atendente:', error);
      alert(`Erro ao excluir atendente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaturamento = (faturamento: any) => {
    setEditingItem(faturamento);
    setFaturamentoForm({
      mes_ano: faturamento.mes_ano,
      unidade_id: faturamento.unidade_id,
      faturamento_total: faturamento.faturamento_total
    });
    setShowForm(true);
  };

  const handleDeleteFaturamento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este faturamento?')) return;
    
    try {
      setLoading(true);
      await DashboardService.deleteMetricaUnidade(id);
      await loadData();
      alert('Faturamento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir faturamento:', error);
      alert(`Erro ao excluir faturamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportTemplate = () => {
    const template = [
      ['mes_ano', 'unidade_codigo', 'atendente_email', 'faturamento_total', 'valor_orcamentos_registrados', 'valor_orcamentos_convertidos', 'qtde_exames_vendidos', 'tkm_paciente', 'nps'],
      ['2025-01', 'CENTRO', 'ana.silva@empresa.com', '50000', '75000', '60000', '150', '300', '85']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_metricas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderUnidadesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Gerenciar Unidades</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Unidade
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            {editingItem ? 'Editar Unidade' : 'Nova Unidade'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={unidadeForm.nome}
                onChange={(e) => setUnidadeForm({ ...unidadeForm, nome: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Centro Médico Principal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                value={unidadeForm.codigo}
                onChange={(e) => setUnidadeForm({ ...unidadeForm, codigo: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="CENTRO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={unidadeForm.ativo ? 'true' : 'false'}
                onChange={(e) => setUnidadeForm({ ...unidadeForm, ativo: e.target.value === 'true' })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveUnidade}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {unidades.map((unidade) => (
              <tr key={unidade.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{unidade.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{unidade.codigo}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    unidade.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {unidade.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditUnidade(unidade)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUnidade(unidade.id)}
                      className="text-red-600 hover:text-red-800"
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
    </div>
  );

  const renderAtendentesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Gerenciar Atendentes</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Atendente
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium text-gray-800 mb-4">Novo Atendente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={atendenteForm.nome}
                onChange={(e) => setAtendenteForm({ ...atendenteForm, nome: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ana Silva Santos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={atendenteForm.email}
                onChange={(e) => setAtendenteForm({ ...atendenteForm, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ana.silva@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={atendenteForm.unidade_id}
                onChange={(e) => setAtendenteForm({ ...atendenteForm, unidade_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((unidade) => (
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveAtendente}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {atendentes.map((atendente) => (
              <tr key={atendente.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{atendente.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{atendente.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{atendente.unidades?.nome}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    atendente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {atendente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditAtendente(atendente)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAtendente(atendente.id)}
                      className="text-red-600 hover:text-red-800"
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
    </div>
  );

  const renderMetricasTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Inserir Métricas</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Métrica
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium text-gray-800 mb-4">Nova Métrica</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
              <input
                type="month"
                value={metricaForm.mes_ano}
                onChange={(e) => setMetricaForm({ ...metricaForm, mes_ano: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={metricaForm.unidade_id}
                onChange={(e) => setMetricaForm({ ...metricaForm, unidade_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Atendente</label>
              <select
                value={metricaForm.atendente_id}
                onChange={(e) => setMetricaForm({ ...metricaForm, atendente_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um atendente</option>
                {atendentes
                  .filter(a => !metricaForm.unidade_id || a.unidade_id === metricaForm.unidade_id)
                  .map((atendente) => (
                    <option key={atendente.id} value={atendente.id}>{atendente.nome}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamentos Registrados (R$)</label>
              <input
                type="number"
                value={metricaForm.valor_orcamentos_registrados}
                onChange={(e) => setMetricaForm({ ...metricaForm, valor_orcamentos_registrados: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="75000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orçamentos Convertidos (R$)</label>
              <input
                type="number"
                value={metricaForm.valor_orcamentos_convertidos}
                onChange={(e) => setMetricaForm({ ...metricaForm, valor_orcamentos_convertidos: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="60000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Exames</label>
              <input
                type="number"
                value={metricaForm.qtde_exames_vendidos}
                onChange={(e) => setMetricaForm({ ...metricaForm, qtde_exames_vendidos: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Pacientes</label>
              <input
                type="number"
                value={metricaForm.qtde_pacientes_atendidos}
                onChange={(e) => setMetricaForm({ ...metricaForm, qtde_pacientes_atendidos: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPS</label>
              <input
                type="number"
                min="-100"
                max="100"
                value={metricaForm.nps}
                onChange={(e) => setMetricaForm({ ...metricaForm, nps: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="85"
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Cálculos Automáticos:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <strong>TKM Exame:</strong> R$ {metricaForm.qtde_exames_vendidos > 0 ? (metricaForm.valor_orcamentos_convertidos / metricaForm.qtde_exames_vendidos).toFixed(2) : '0,00'}
              </div>
              <div>
                <strong>TKM Paciente:</strong> R$ {metricaForm.qtde_pacientes_atendidos > 0 ? (metricaForm.valor_orcamentos_convertidos / metricaForm.qtde_pacientes_atendidos).toFixed(2) : '0,00'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveMetrica}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFaturamentoTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Gerenciar Faturamento por Unidade</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Faturamento
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            {editingItem ? 'Editar Faturamento' : 'Novo Faturamento'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês/Ano</label>
              <input
                type="month"
                value={faturamentoForm.mes_ano}
                onChange={(e) => setFaturamentoForm({ ...faturamentoForm, mes_ano: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={faturamentoForm.unidade_id}
                onChange={(e) => setFaturamentoForm({ ...faturamentoForm, unidade_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((unidade) => (
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
                value={faturamentoForm.faturamento_total}
                onChange={(e) => setFaturamentoForm({ ...faturamentoForm, faturamento_total: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="150000.00"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveFaturamento}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingItem(null);
                setFaturamentoForm({
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metricasUnidades.map((metrica) => (
              <tr key={metrica.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{metrica.mes_ano}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{metrica.unidades?.nome || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrica.faturamento_total || 0)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditFaturamento(metrica)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFaturamento(metrica.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {metricasUnidades.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum faturamento cadastrado ainda.</p>
            <p className="text-sm">Clique em "Novo Faturamento" para começar.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGerenciarTab = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-800">Gerenciar Métricas</h3>
      
      {/* Métricas de Atendentes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-medium text-gray-700">Métricas de Atendentes</h4>
          <span className="text-sm text-gray-500">{metricasAtendentes.length} registros</span>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atendente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orç. Registrados</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orç. Convertidos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtde Exames</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtde Pacientes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TKM Exame</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TKM Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NPS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metricasAtendentes.map((metrica) => (
                <tr key={metrica.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{metrica.mes_ano}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{metrica.unidades?.nome || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{metrica.atendentes?.nome || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrica.valor_orcamentos_registrados || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrica.valor_orcamentos_convertidos || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{metrica.qtde_exames_vendidos || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{metrica.qtde_pacientes_atendidos || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      metrica.qtde_exames_vendidos > 0 ? (metrica.valor_orcamentos_convertidos || 0) / metrica.qtde_exames_vendidos : 0
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      metrica.qtde_pacientes_atendidos > 0 ? (metrica.valor_orcamentos_convertidos || 0) / metrica.qtde_pacientes_atendidos : 0
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{metrica.nps || 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditMetricaAtendente(metrica)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMetricaAtendente(metrica.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
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
      </div>

      {/* Faturamento por Unidade */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-md font-medium text-gray-700">Faturamento por Unidade</h4>
          <span className="text-sm text-gray-500">{metricasUnidades.length} registros</span>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês/Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metricasUnidades.map((metrica) => (
                <tr key={metrica.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{metrica.mes_ano}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{metrica.unidades?.nome || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrica.faturamento_total || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditMetricaUnidade(metrica)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMetricaUnidade(metrica.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Excluir"
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
      </div>
    </div>
  );

  const renderImportTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Upload className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Importação em Massa</h3>
        </div>

        <div className="space-y-6">
          {/* Opções de Importação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Dados de Exemplo</h4>
              <p className="text-sm text-gray-600 mb-4">
                Importar dados de exemplo para testar o sistema
              </p>
              <button
                onClick={() => handleBulkImport(true)}
                disabled={bulkImportLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkImportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Importar Dados de Exemplo
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 opacity-50">
              <h4 className="font-medium text-gray-900 mb-2">Upload de Arquivo</h4>
              <p className="text-sm text-gray-600 mb-4">
                Importar dados via arquivo JSON (em breve)
              </p>
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Em Breve
              </button>
            </div>
          </div>

          {/* Resultado da Importação */}
          {bulkImportResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Resultado da Importação</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Unidades:</span>
                  <span className="ml-1 text-green-600">{bulkImportResult.results.unidades.success}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Atendentes:</span>
                  <span className="ml-1 text-green-600">{bulkImportResult.results.atendentes.success}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Métricas Atend.:</span>
                  <span className="ml-1 text-green-600">{bulkImportResult.results.metricas_atendentes.success}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Faturamento:</span>
                  <span className="ml-1 text-green-600">{bulkImportResult.results.metricas_unidades.success}</span>
                </div>
              </div>
            </div>
          )}

          {/* Documentação da API */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📋 Formato da API</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Endpoint:</strong> <code className="bg-gray-200 px-2 py-1 rounded">/functions/v1/bulk-data-import</code></p>
              <p><strong>Método:</strong> POST</p>
              <p><strong>Estrutura JSON:</strong></p>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto mt-2">
{`{
  "unidades": [
    { "nome": "Centro Médico", "codigo": "CM001", "ativo": true }
  ],
  "atendentes": [
    { 
      "nome": "Ana Silva", 
      "email": "ana@clinica.com", 
      "unidade_codigo": "CM001" 
    }
  ],
  "metricas_unidades": [
    { 
      "mes_ano": "2025-01", 
      "unidade_codigo": "CM001", 
      "faturamento_total": 150000 
    }
  ],
  "metricas_atendentes": [
    {
      "mes_ano": "2025-01",
      "unidade_codigo": "CM001",
      "atendente_email": "ana@clinica.com",
      "valor_orcamentos_registrados": 50000,
      "valor_orcamentos_convertidos": 40000,
      "qtde_exames_vendidos": 120,
      "qtde_pacientes_atendidos": 80,
      "nps": 85
    }
  ]
}`}
              </pre>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-800">Template CSV</h4>
          <div>
            <button
              onClick={exportTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Baixar Template
            </button>
          </div>
          <div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h4 className="text-md font-medium text-gray-800 mb-4">Importar CSV</h4>
            <p className="text-sm text-gray-600 mb-4">
              Selecione um arquivo CSV com as métricas para importar.
            </p>
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Importar Dados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <BarChart3 className="w-4 h-4" />
              Voltar ao Dashboard
            </button>
          </div>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Gerenciar unidades, atendentes e métricas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'unidades', label: 'Unidades', icon: Building2 },
                { id: 'atendentes', label: 'Atendentes', icon: Users },
                { id: 'metricas', label: 'Métricas', icon: BarChart3 },
                { id: 'faturamento', label: 'Faturamento', icon: Receipt },
                { id: 'import', label: 'Importar', icon: Upload },
                { id: 'gerenciar', label: 'Gerenciar', icon: Edit },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando...</p>
          </div>
        ) : (
          <>
            {activeTab === 'unidades' && renderUnidadesTab()}
            {activeTab === 'atendentes' && renderAtendentesTab()}
            {activeTab === 'metricas' && renderMetricasTab()}
            {activeTab === 'faturamento' && renderFaturamentoTab()}
            {activeTab === 'import' && renderImportTab()}
            {activeTab === 'gerenciar' && renderGerenciarTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;