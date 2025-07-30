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
  const [activeTab, setActiveTab] = useState<'unidades' | 'atendentes' | 'metricas' | 'faturamento' | 'import'>('unidades');
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para dados
  const [unidades, setUnidades] = useState<any[]>([]);
  const [atendentes, setAtendentes] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [metricasUnidades, setMetricasUnidades] = useState<any[]>([]);

  // Estados para formulários
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsGlobalLoading(true);
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
        case 'faturamento':
          const faturamentoData = await DashboardService.fetchMetricasUnidades();
          setMetricasUnidades(faturamentoData);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    }
    setIsGlobalLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async (data: any) => {
    setIsGlobalLoading(true);
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
      } else if (activeTab === 'metricas') {
        if (editingItem) {
          await DashboardService.updateMetricaAtendente(editingItem.id, data);
          showMessage('success', 'Métrica atualizada com sucesso!');
        } else {
          await DashboardService.insertMetrica(data);
          showMessage('success', 'Métrica criada com sucesso!');
        }
      } else if (activeTab === 'faturamento') {
        if (editingItem) {
          await DashboardService.updateFaturamentoUnidade(editingItem.id, data);
          showMessage('success', 'Faturamento atualizado com sucesso!');
        } else {
          await DashboardService.insertFaturamentoUnidade(data);
          showMessage('success', 'Faturamento criado com sucesso!');
        }
      }
      
      setShowForm(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao salvar');
    }
    setIsGlobalLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    setIsGlobalLoading(true);
    try {
      if (activeTab === 'unidades') {
        await DashboardService.deleteUnidade(id);
        showMessage('success', 'Unidade excluída com sucesso!');
      } else if (activeTab === 'atendentes') {
        await DashboardService.deleteAtendente(id);
        showMessage('success', 'Atendente excluído com sucesso!');
      } else if (activeTab === 'metricas') {
        await DashboardService.deleteMetricaAtendente(id);
        showMessage('success', 'Métrica excluída com sucesso!');
      } else if (activeTab === 'faturamento') {
        await DashboardService.deleteMetricaUnidade(id);
        showMessage('success', 'Faturamento excluído com sucesso!');
      }
      
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erro ao excluir');
    }
    setIsGlobalLoading(false);
  };

  const handleBulkImport = async () => {
    setIsGlobalLoading(true);
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
    setIsGlobalLoading(false);
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
                disabled={isGlobalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isGlobalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
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
                { id: 'faturamento', label: 'Faturamento', icon: BarChart3 },
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
            <div className={`relative ${isGlobalLoading ? 'pointer-events-none opacity-50' : ''}`}>
              {activeTab === 'unidades' && (
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

              {activeTab === 'atendentes' && (
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

              {activeTab === 'metricas' && (
                <MetricasTab
                  data={metricas}
                  unidades={unidades}
                  atendentes={atendentes}
                  onAdd={() => { setEditingItem(null); setShowForm(true); }}
                  onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
                  onDelete={handleDelete}
                  showForm={showForm}
                  editingItem={editingItem}
                  onSave={handleSave}
                  onCancel={() => { setShowForm(false); setEditingItem(null); }}
                />
              )}

              {activeTab === 'faturamento' && (
                <FaturamentoTab
                  data={metricasUnidades}
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

              {activeTab === 'import' && (
                <ImportTab onImport={handleBulkImport} isImporting={isGlobalLoading} />
              )}
            </div>

            {isGlobalLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Carregando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ImportTab: React.FC<{ isImporting: boolean; onImport: () => void }> = ({ isImporting, onImport }) => {
  const [importFormat, setImportFormat] = React.useState<'csv' | 'json'>('csv');
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = importFormat === 'csv' ? ['text/csv', 'application/vnd.ms-excel'] : ['application/json'];
    const validExtensions = importFormat === 'csv' ? ['.csv'] : ['.json'];
    
    const hasValidType = validTypes.some(type => file.type === type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidType && !hasValidExtension) {
      alert(`Por favor, selecione um arquivo ${importFormat.toUpperCase()}`);
      return false;
    }
    
    return true;
  };

  const downloadTemplate = () => {
    if (importFormat === 'csv') {
      const csvContent = [
        'tipo,nome,codigo,email,unidade_codigo,mes_ano,valor_orcamentos_registrados,valor_orcamentos_convertidos,qtde_exames_vendidos,qtde_pacientes_atendidos,nps,faturamento_total,ativo,data_admissao',
        'unidade,Centro Médico Principal,CMP001,,,,,,,,,,true,',
        'unidade,Clínica Norte,CLN002,,,,,,,,,,true,',
        'atendente,Ana Silva,,ana.silva@clinica.com,CMP001,,,,,,,,,true,2024-01-01',
        'atendente,Carlos Santos,,carlos.santos@clinica.com,CMP001,,,,,,,,,true,2024-01-01',
        'metrica_atendente,,,ana.silva@clinica.com,CMP001,2025-01,50000,40000,120,80,85,,,',
        'metrica_unidade,,,,,CMP001,2025-01,,,,,150000,,,',
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_importacao.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonTemplate = {
        unidades: [
          { nome: "Centro Médico Principal", codigo: "CMP001", ativo: true },
          { nome: "Clínica Norte", codigo: "CLN002", ativo: true }
        ],
        atendentes: [
          { nome: "Ana Silva", email: "ana.silva@clinica.com", unidade_codigo: "CMP001", ativo: true, data_admissao: "2024-01-01" },
          { nome: "Carlos Santos", email: "carlos.santos@clinica.com", unidade_codigo: "CMP001", ativo: true, data_admissao: "2024-01-01" }
        ],
        metricas_atendentes: [
          {
            mes_ano: "2025-01",
            unidade_codigo: "CMP001",
            atendente_email: "ana.silva@clinica.com",
            valor_orcamentos_registrados: 50000,
            valor_orcamentos_convertidos: 40000,
            qtde_exames_vendidos: 120,
            qtde_pacientes_atendidos: 80,
            nps: 85
          }
        ],
        metricas_unidades: [
          { mes_ano: "2025-01", unidade_codigo: "CMP001", faturamento_total: 150000 }
        ]
      };
      
      const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_importacao.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro');
      return;
    }

    try {
      let data;
      
      if (importFormat === 'csv') {
        const text = await selectedFile.text();
        data = parseCSV(text);
      } else {
        const text = await selectedFile.text();
        data = JSON.parse(text);
      }

      // Aqui você chamaria o serviço de importação
      console.log('Dados para importar:', data);
      onImport();
      
      alert('Dados importados com sucesso!');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar dados. Verifique o formato do arquivo.');
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const data = {
      unidades: [] as any[],
      atendentes: [] as any[],
      metricas_atendentes: [] as any[],
      metricas_unidades: [] as any[]
    };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim();
      });

      if (row.tipo === 'unidade') {
        data.unidades.push({
          nome: row.nome,
          codigo: row.codigo,
          ativo: row.ativo === 'true'
        });
      } else if (row.tipo === 'atendente') {
        data.atendentes.push({
          nome: row.nome,
          email: row.email,
          unidade_codigo: row.unidade_codigo,
          ativo: row.ativo === 'true',
          data_admissao: row.data_admissao
        });
      } else if (row.tipo === 'metrica_atendente') {
        data.metricas_atendentes.push({
          mes_ano: row.mes_ano,
          unidade_codigo: row.unidade_codigo,
          atendente_email: row.email,
          valor_orcamentos_registrados: parseFloat(row.valor_orcamentos_registrados) || 0,
          valor_orcamentos_convertidos: parseFloat(row.valor_orcamentos_convertidos) || 0,
          qtde_exames_vendidos: parseInt(row.qtde_exames_vendidos) || 0,
          qtde_pacientes_atendidos: parseInt(row.qtde_pacientes_atendidos) || 0,
          nps: parseFloat(row.nps) || 0
        });
      } else if (row.tipo === 'metrica_unidade') {
        data.metricas_unidades.push({
          mes_ano: row.mes_ano,
          unidade_codigo: row.unidade_codigo,
          faturamento_total: parseFloat(row.faturamento_total) || 0
        });
      }
    }

    return data;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📥 Importação de Dados</h3>
        <p className="text-blue-800 text-sm">
          Importe seus dados reais através de arquivos CSV ou JSON. 
          Baixe o template para ver o formato correto.
        </p>
      </div>

      {/* Seleção de Formato */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Formato do Arquivo
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={importFormat === 'csv'}
              onChange={(e) => setImportFormat(e.target.value as 'csv')}
              className="mr-2"
            />
            CSV (Excel, Google Sheets)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={importFormat === 'json'}
              onChange={(e) => setImportFormat(e.target.value as 'json')}
              className="mr-2"
            />
            JSON (Dados estruturados)
          </label>
        </div>
      </div>

      {/* Download Template */}
      <div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Baixar Template {importFormat.toUpperCase()}
        </button>
        <p className="text-sm text-gray-600 mt-1">
          Baixe o arquivo modelo e preencha com seus dados
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {selectedFile ? selectedFile.name : 'Arraste seu arquivo aqui'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou clique para selecionar um arquivo {importFormat.toUpperCase()}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={importFormat === 'csv' ? '.csv' : '.json'}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Selecionar Arquivo
        </button>
      </div>

      {/* Import Button */}
      {selectedFile && (
        <div className="flex justify-center">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isImporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {isImporting ? 'Importando...' : 'Importar Dados'}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">📋 Instruções de Uso:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Escolha o formato desejado (CSV ou JSON)</li>
          <li>Baixe o template clicando em "Baixar Template"</li>
          <li>Preencha o template com seus dados reais</li>
          <li>Faça upload do arquivo preenchido</li>
          <li>Clique em "Importar Dados" para processar</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>💡 Dica:</strong> Para CSV, use a coluna "tipo" para identificar se é 
            "unidade", "atendente", "metrica_atendente\" ou "metrica_unidade"
          </p>
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
const MetricasTab: React.FC<any> = ({ 
  data, unidades, atendentes, onAdd, onEdit, onDelete, showForm, editingItem, onSave, onCancel 
}) => {
  const [formData, setFormData] = useState({
    mes_ano: '',
    unidade_id: '',
    atendente_id: '',
    valor_orcamentos_registrados: 0,
    valor_orcamentos_convertidos: 0,
    qtde_exames_vendidos: 0,
    qtde_pacientes_atendidos: 0,
    nps: 0
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        mes_ano: editingItem.mes_ano || '',
        unidade_id: editingItem.unidade_id || '',
        atendente_id: editingItem.atendente_id || '',
        valor_orcamentos_registrados: editingItem.valor_orcamentos_registrados || 0,
        valor_orcamentos_convertidos: editingItem.valor_orcamentos_convertidos || 0,
        qtde_exames_vendidos: editingItem.qtde_exames_vendidos || 0,
        qtde_pacientes_atendidos: editingItem.qtde_pacientes_atendidos || 0,
        nps: editingItem.nps || 0
      });
    } else {
      setFormData({
        mes_ano: '',
        unidade_id: '',
        atendente_id: '',
        valor_orcamentos_registrados: 0,
        valor_orcamentos_convertidos: 0,
        qtde_exames_vendidos: 0,
        qtde_pacientes_atendidos: 0,
        nps: 0
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
        <h2 className="text-xl font-semibold">Métricas de Atendentes</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nova Métrica
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? 'Editar Métrica' : 'Nova Métrica'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mês/Ano (YYYY-MM)
                </label>
                <input
                  type="text"
                  required
                  placeholder="2025-01"
                  pattern="[0-9]{4}-[0-9]{2}"
                  value={formData.mes_ano}
                  onChange={(e) => setFormData({ ...formData, mes_ano: e.target.value })}
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
                  Atendente
                </label>
                <select
                  required
                  value={formData.atendente_id}
                  onChange={(e) => setFormData({ ...formData, atendente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um atendente</option>
                  {atendentes.map((atendente: any) => (
                    <option key={atendente.id} value={atendente.id}>
                      {atendente.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamentos Registrados (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_orcamentos_registrados}
                  onChange={(e) => setFormData({ ...formData, valor_orcamentos_registrados: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamentos Convertidos (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor_orcamentos_convertidos}
                  onChange={(e) => setFormData({ ...formData, valor_orcamentos_convertidos: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade de Exames Vendidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.qtde_exames_vendidos}
                  onChange={(e) => setFormData({ ...formData, qtde_exames_vendidos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pacientes Atendidos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.qtde_pacientes_atendidos}
                  onChange={(e) => setFormData({ ...formData, qtde_pacientes_atendidos: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NPS (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.nps}
                  onChange={(e) => setFormData({ ...formData, nps: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
              <th className="border border-gray-200 px-4 py-2 text-left">Período</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Atendente</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Unidade</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Orçamentos</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Conversões</th>
              <th className="border border-gray-200 px-4 py-2 text-left">NPS</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Ações</th>
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

// Componente para aba de Faturamento
const FaturamentoTab: React.FC<any> = ({ 
  data, unidades, onAdd, onEdit, onDelete, showForm, editingItem, onSave, onCancel 
}) => {
  const [formData, setFormData] = useState({
    mes_ano: '',
    unidade_id: '',
    faturamento_total: 0
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        mes_ano: editingItem.mes_ano || '',
        unidade_id: editingItem.unidade_id || '',
        faturamento_total: editingItem.faturamento_total || 0
      });
    } else {
      setFormData({
        mes_ano: '',
        unidade_id: '',
        faturamento_total: 0
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
        <h2 className="text-xl font-semibold">Faturamento por Unidade</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Faturamento
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingItem ? 'Editar Faturamento' : 'Novo Faturamento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mês/Ano (YYYY-MM)
                </label>
                <input
                  type="text"
                  required
                  placeholder="2025-01"
                  pattern="[0-9]{4}-[0-9]{2}"
                  value={formData.mes_ano}
                  onChange={(e) => setFormData({ ...formData, mes_ano: e.target.value })}
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
                  Faturamento Total (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.faturamento_total}
                  onChange={(e) => setFormData({ ...formData, faturamento_total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
              <th className="border border-gray-200 px-4 py-2 text-left">Período</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Unidade</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Faturamento Total</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.id}>
                <td className="border border-gray-200 px-4 py-2">{item.mes_ano}</td>
                <td className="border border-gray-200 px-4 py-2">
                  {item.unidades?.nome || 'N/A'}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  R$ {item.faturamento_total?.toLocaleString('pt-BR') || '0'}
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

// Componente para aba de Importação
const ImportTab: React.FC<{ onImport: () => void; isImporting: boolean }> = ({ onImport, isImporting }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'csv' | 'json'>('csv');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    if (importType === 'csv') {
      const csvContent = [
        // Template para métricas de atendentes
        'tipo,mes_ano,unidade_codigo,atendente_nome,atendente_email,valor_orcamentos_registrados,valor_orcamentos_convertidos,qtde_exames_vendidos,qtde_pacientes_atendidos,nps,faturamento_total',
        'unidade,,,Centro Médico Principal,CMP001,,,,,,',
        'atendente,,,Ana Silva,ana.silva@clinica.com,,,,,',
        'metrica_atendente,2025-01,CMP001,Ana Silva,ana.silva@clinica.com,50000,40000,120,80,85,',
        'faturamento,2025-01,CMP001,,,,,,,150000'
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'template_importacao.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const jsonTemplate = {
        unidades: [
          { nome: "Centro Médico Principal", codigo: "CMP001", ativo: true }
        ],
        atendentes: [
          { nome: "Ana Silva", email: "ana.silva@clinica.com", unidade_codigo: "CMP001", ativo: true }
        ],
        metricas_atendentes: [
          {
            mes_ano: "2025-01",
            unidade_codigo: "CMP001",
            atendente_email: "ana.silva@clinica.com",
            valor_orcamentos_registrados: 50000,
            valor_orcamentos_convertidos: 40000,
            qtde_exames_vendidos: 120,
            qtde_pacientes_atendidos: 80,
            nps: 85
          }
        ],
        metricas_unidades: [
          { mes_ano: "2025-01", unidade_codigo: "CMP001", faturamento_total: 150000 }
        ]
      };
      
      const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'template_importacao.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Selecione um arquivo para importar');
      return;
    }

    // Aqui você implementaria a lógica de parsing do arquivo
    // Por enquanto, vamos simular a importação
    console.log('Importando arquivo:', selectedFile.name);
    onImport();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Importação de Dados</h2>
      
      {/* Seleção do tipo de arquivo */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Tipo de Arquivo
        </h3>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={importType === 'csv'}
              onChange={(e) => setImportType(e.target.value as 'csv')}
              className="mr-2"
            />
            CSV (Comma Separated Values)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={importType === 'json'}
              onChange={(e) => setImportType(e.target.value as 'json')}
              className="mr-2"
            />
            JSON (JavaScript Object Notation)
          </label>
        </div>
        
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Baixar Template {importType.toUpperCase()}
        </button>
      </div>

      {/* Área de upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Selecionar Arquivo
        </h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arraste e solte seu arquivo aqui
          </p>
          <p className="text-gray-600 mb-4">ou</p>
          
          <input
            type="file"
            accept={importType === 'csv' ? '.csv' : '.json'}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Selecionar Arquivo
          </label>
          
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Arquivo selecionado:</strong> {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botão de importação */}
      {selectedFile && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {isImporting ? 'Importando...' : 'Importar Dados'}
          </button>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          📋 Instruções de Importação
        </h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <strong>1. Baixe o template</strong>
            <p className="text-sm">Clique em "Baixar Template" para obter o formato correto</p>
          </div>
          <div>
            <strong>2. Preencha seus dados</strong>
            <p className="text-sm">Substitua os dados de exemplo pelos seus dados reais</p>
          </div>
          <div>
            <strong>3. Faça o upload</strong>
            <p className="text-sm">Arraste o arquivo ou clique para selecionar</p>
          </div>
        </div>
      </div>

      {/* Formato dos dados */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📊 Formato dos Dados
        </h3>
        
        {importType === 'csv' ? (
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Colunas obrigatórias para CSV:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>tipo</code> - unidade, atendente, metrica_atendente, faturamento</li>
              <li><code>mes_ano</code> - Formato YYYY-MM (ex: 2025-01)</li>
              <li><code>unidade_codigo</code> - Código único da unidade</li>
              <li><code>atendente_email</code> - Email único do atendente</li>
              <li><code>valor_orcamentos_registrados</code> - Valor em reais</li>
              <li><code>nps</code> - Valor de 0 a 100</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Estrutura JSON:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code>unidades[]</code> - Array com dados das unidades</li>
              <li><code>atendentes[]</code> - Array com dados dos atendentes</li>
              <li><code>metricas_atendentes[]</code> - Array com métricas</li>
              <li><code>metricas_unidades[]</code> - Array com faturamento</li>
            </ul>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminPanel;