import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { BulkImportService } from '../services/bulkImportService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminPanelProps {
  onBack?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'unidades' | 'atendentes' | 'metricas' | 'import'>('unidades');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para dados
  const [unidades, setUnidades] = useState<any[]>([]);
  const [atendentes, setAtendentes] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any[]>([]);

  // Estados para formulários
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'unidades':
          const unidadesData = await DashboardService.fetchUnidades();
          setUnidades(unidadesData);
          break;
        case 'atendentes':
          const atendentesData = await DashboardService.fetchAtendentes();
          setAtendentes(atendentesData);
          break;
        case 'metricas':
          const metricasData = await DashboardService.fetchMetricasAtendentes();
          setMetricas(metricasData);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async (data: any) => {
    setLoading(true);
    try {
      if (activeTab === 'unidades') {
        if (editingItem) {
          await DashboardService.updateUnidade(editingItem.id, data);
          showMessage('success', 'Unidade atualizada com sucesso!');
        } else {
          await DashboardService.insertUnidade(data);
          showMessage('success', 'Unidade criada com sucesso!');
        }
      } else if (activeTab === 'atendentes') {
        if (editingItem) {
          await DashboardService.updateAtendente(editingItem.id, data);
          showMessage('success', 'Atendente atualizado com sucesso!');
        } else {
          await DashboardService.insertAtendente(data);
          showMessage('success', 'Atendente criado com sucesso!');
        }
      }
      
      setShowForm(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    setLoading(true);
    try {
      if (activeTab === 'unidades') {
        await DashboardService.deleteUnidade(id);
        showMessage('success', 'Unidade excluída com sucesso!');
      } else if (activeTab === 'atendentes') {
        await DashboardService.deleteAtendente(id);
        showMessage('success', 'Atendente excluído com sucesso!');
      }
      
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao excluir');
    }
    setLoading(false);
  };

  const handleBulkImport = async () => {
    setLoading(true);
    try {
      const sampleData = BulkImportService.generateSampleData();
      const result = await BulkImportService.importBulkData(sampleData);
      
      if (result.success) {
        showMessage('success', 'Dados de exemplo importados com sucesso!');
        loadData();
      } else {
        showMessage('error', result.message || 'Erro na importação');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Erro na importação');
    }
    setLoading(false);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Supabase Não Configurado
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Para usar o painel administrativo, você precisa configurar o Supabase primeiro. 
              Configure as variáveis de ambiente no arquivo .env:
            </p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-8 text-left">
              <code className="text-sm">
                VITE_SUPABASE_URL=https://seu-projeto.supabase.co<br/>
                VITE_SUPABASE_ANON_KEY=sua-chave-anonima
              </code>
            </div>
            
            <p className="text-sm text-gray-500">
              Após configurar, recarregue a página para acessar o painel administrativo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleBulkImport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Importar Dados de Exemplo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'unidades', label: 'Unidades', icon: Building2 },
                { id: 'atendentes', label: 'Atendentes', icon: Users },
                { id: 'metricas', label: 'Métricas', icon: BarChart3 },
                { id: 'import', label: 'Importação', icon: Upload }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
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

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Carregando...</span>
              </div>
            )}

            {!loading && activeTab === 'unidades' && (
              <UnidadesTab
                data={unidades}
                onAdd={() => { setEditingItem(null); setShowForm(true); }}
                onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
                onDelete={handleDelete}
                showForm={showForm}
                editingItem={editingItem}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingItem(null); }}
              />
            )}

            {!loading && activeTab === 'atendentes' && (
              <AtendentesTab
                data={atendentes}
                unidades={unidades}
                onAdd={() => { setEditingItem(null); setShowForm(true); }}
                onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
                onDelete={handleDelete}
                showForm={showForm}
                editingItem={editingItem}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditingItem(null); }}
              />
            )}

            {!loading && activeTab === 'metricas' && (
              <MetricasTab data={metricas} />
            )}

            {!loading && activeTab === 'import' && (
              <ImportTab onImport={handleBulkImport} loading={loading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para aba de Unidades
const UnidadesTab: React.FC<any> = ({ 
  data, onAdd, onEdit, onDelete, showForm, editingItem, onSave, onCancel 
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    ativo: true
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        nome: editingItem.nome || '',
        codigo: editingItem.codigo || '',
        ativo: editingItem.ativo ?? true
      });
    } else {
      setFormData({ nome: '', codigo: '', ativo: true });
    }
  }, [editingItem, showForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gerenciar Unidades</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Unidade
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? 'Editar Unidade' : 'Nova Unidade'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Unidade
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="ativo" className="text-sm text-gray-700">
                Unidade ativa
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Nome</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Código</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id}>
                <td className="border border-gray-200 px-4 py-2">{item.nome}</td>
                <td className="border border-gray-200 px-4 py-2">{item.codigo}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-red-600 hover:text-red-800"
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
};

// Componente para aba de Atendentes
const AtendentesTab: React.FC<any> = ({ 
  data, unidades, onAdd, onEdit, onDelete, showForm, editingItem, onSave, onCancel 
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    unidade_id: '',
    ativo: true,
    data_admissao: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        nome: editingItem.nome || '',
        email: editingItem.email || '',
        unidade_id: editingItem.unidade_id || '',
        ativo: editingItem.ativo ?? true,
        data_admissao: editingItem.data_admissao || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        unidade_id: '',
        ativo: true,
        data_admissao: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingItem, showForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gerenciar Atendentes</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Atendente
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? 'Editar Atendente' : 'Novo Atendente'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <select
                  required
                  value={formData.unidade_id}
                  onChange={(e) => setFormData({ ...formData, unidade_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma unidade</option>
                  {unidades.map((unidade: any) => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Admissão
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_admissao}
                  onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo-atendente"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="ativo-atendente" className="text-sm text-gray-700">
                Atendente ativo
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Nome</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Unidade</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id}>
                <td className="border border-gray-200 px-4 py-2">{item.nome}</td>
                <td className="border border-gray-200 px-4 py-2">{item.email}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {item.unidades?.nome || 'N/A'}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-1 text-red-600 hover:text-red-800"
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
};

// Componente para aba de Métricas
const MetricasTab: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Métricas de Atendentes</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Período</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Atendente</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Unidade</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Orçamentos</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Conversões</th>
              <th className="border border-gray-200 px-4 py-2 text-left">NPS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id}>
                <td className="border border-gray-200 px-4 py-2">{item.mes_ano}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {item.atendentes?.nome || 'N/A'}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {item.unidades?.nome || 'N/A'}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  R$ {item.valor_orcamentos_registrados?.toLocaleString('pt-BR') || '0'}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  R$ {item.valor_orcamentos_convertidos?.toLocaleString('pt-BR') || '0'}
                </td>
                <td className="border border-gray-200 px-4 py-2">{item.nps || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente para aba de Importação
const ImportTab: React.FC<{ onImport: () => void; loading: boolean }> = ({ onImport, loading }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Importação de Dados</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          Importar Dados de Exemplo
        </h3>
        <p className="text-blue-800 mb-4">
          Esta função irá importar um conjunto completo de dados de exemplo, incluindo:
        </p>
        <ul className="list-disc list-inside text-blue-800 mb-6 space-y-1">
          <li>3 Unidades de exemplo</li>
          <li>4 Atendentes distribuídos pelas unidades</li>
          <li>Métricas de performance dos últimos meses</li>
          <li>Dados de faturamento por unidade</li>
        </ul>
        
        <button
          onClick={onImport}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? 'Importando...' : 'Importar Dados de Exemplo'}
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">
          ⚠️ Atenção
        </h3>
        <p className="text-yellow-800">
          A importação irá sobrescrever dados existentes com os mesmos códigos/emails. 
          Certifique-se de fazer backup dos dados importantes antes de prosseguir.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;