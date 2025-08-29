import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { BulkImportService } from '../services/bulkImportService';

const BulkImportTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'sample' | 'csv' | 'json'>('sample');
  const [jsonData, setJsonData] = useState('');
  const [csvFiles, setCsvFiles] = useState<{
    unidades?: File;
    atendentes?: File;
    metricas_atendentes?: File;
    metricas_unidades?: File;
  }>({});

  const handleSampleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const sampleData = BulkImportService.generateSampleData();
      const result = await BulkImportService.importBulkData(sampleData);
      setResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro na importação');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = JSON.parse(jsonData);
      const validation = BulkImportService.validateData(data);
      
      if (!validation.valid) {
        throw new Error(`Dados inválidos:\n${validation.errors.join('\n')}`);
      }

      const result = await BulkImportService.importBulkData(data);
      setResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro na importação');
    } finally {
      setLoading(false);
    }
  };

  const parseCsvToJson = (csvText: string, type: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const obj: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Remove aspas se existirem
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        // Converter números
        if (type === 'metricas_atendentes' || type === 'metricas_unidades') {
          if (['valor_orcamentos_registrados', 'valor_orcamentos_convertidos', 'qtde_exames_vendidos', 'qtde_pacientes_atendidos', 'nps', 'faturamento_total'].includes(header)) {
            obj[header] = parseFloat(value) || 0;
          } else {
            obj[header] = value;
          }
        } else if (type === 'atendentes' && header === 'ativo') {
          obj[header] = value.toLowerCase() === 'true' || value === '1';
        } else if (type === 'unidades' && header === 'ativo') {
          obj[header] = value.toLowerCase() === 'true' || value === '1';
        } else {
          obj[header] = value;
        }
      });
      
      data.push(obj);
    }

    return data;
  };

  const handleCsvImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const importData: any = {};

      // Processar cada arquivo CSV
      for (const [type, file] of Object.entries(csvFiles)) {
        if (file) {
          const text = await file.text();
          importData[type] = parseCsvToJson(text, type);
        }
      }

      if (Object.keys(importData).length === 0) {
        throw new Error('Nenhum arquivo CSV foi selecionado');
      }

      const validation = BulkImportService.validateData(importData);
      
      if (!validation.valid) {
        throw new Error(`Dados inválidos:\n${validation.errors.join('\n')}`);
      }

      const result = await BulkImportService.importBulkData(importData);
      setResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro na importação');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (type: string) => {
    const templates = {
      unidades: `nome,codigo,ativo
"Unidade Centro","UC001",true
"Unidade Norte","UN002",true
"Unidade Sul","US003",true
"Unidade Leste","UL004",false`,
      
      atendentes: `nome,email,unidade_codigo,ativo,data_admissao
"Maria Silva","maria.silva@empresa.com","UC001",true,"2024-01-15"
"João Santos","joao.santos@empresa.com","UC001",true,"2024-02-01"
"Ana Costa","ana.costa@empresa.com","UN002",true,"2024-01-20"
"Pedro Lima","pedro.lima@empresa.com","US003",true,"2024-03-10"
"Carla Oliveira","carla.oliveira@empresa.com","UN002",false,"2024-01-05"`,
      
      metricas_atendentes: `mes_ano,unidade_codigo,atendente_email,valor_orcamentos_registrados,valor_orcamentos_convertidos,qtde_exames_vendidos,qtde_pacientes_atendidos,nps
"2025-01","UC001","maria.silva@empresa.com",75000,60000,150,100,88
"2025-01","UC001","joao.santos@empresa.com",65000,50000,130,85,82
"2025-01","UN002","ana.costa@empresa.com",55000,45000,110,75,85
"2025-01","US003","pedro.lima@empresa.com",45000,35000,90,60,78
"2024-12","UC001","maria.silva@empresa.com",70000,55000,140,95,86
"2024-12","UC001","joao.santos@empresa.com",60000,48000,125,80,80
"2024-12","UN002","ana.costa@empresa.com",50000,40000,105,70,83
"2024-12","US003","pedro.lima@empresa.com",42000,33000,85,55,76`,
      
      metricas_unidades: `mes_ano,unidade_codigo,faturamento_total
"2025-01","UC001",180000
"2025-01","UN002",140000
"2025-01","US003",120000
"2024-12","UC001",170000
"2024-12","UN002",135000
"2024-12","US003",115000
"2024-11","UC001",165000
"2024-11","UN002",130000
"2024-11","US003",110000`
    };

    const content = templates[type as keyof typeof templates];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (type: string, file: File | null) => {
    setCsvFiles(prev => ({
      ...prev,
      [type]: file || undefined
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Upload className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Importação de Dados Reais</h2>
          <p className="text-sm text-gray-600">Importe dados reais através de arquivos CSV ou JSON estruturados</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Selecione o Formato dos Dados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setImportMode('sample')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'sample' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Dados de Demonstração</h4>
            <p className="text-sm text-gray-600">Importar dados fictícios para testar o sistema</p>
          </button>

          <button
            onClick={() => setImportMode('csv')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'csv' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Arquivos CSV</h4>
            <p className="text-sm text-gray-600">Importar dados estruturados em formato CSV</p>
          </button>

          <button
            onClick={() => setImportMode('json')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'json' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Dados JSON</h4>
            <p className="text-sm text-gray-600">Importar dados estruturados em formato JSON</p>
          </button>
        </div>

        {/* Sample Data Import */}
        {importMode === 'sample' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">⚠️ Dados de Demonstração Incluem:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 3 Unidades (Centro Médico Principal, Clínica Norte, Unidade Sul)</li>
                <li>• 4 Atendentes distribuídos pelas unidades</li>
                <li>• Métricas fictícias de performance dos últimos meses</li>
                <li>• Dados de faturamento por unidade</li>
                <li>• <strong>ATENÇÃO:</strong> Estes são dados fictícios para demonstração</li>
              </ul>
            </div>
            
            <button
              onClick={handleSampleImport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? 'Importando...' : 'Importar Dados de Demonstração'}
            </button>
          </div>
        )}

        {/* CSV Import */}
        {importMode === 'csv' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">📋 Formato dos Arquivos CSV:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• <strong>Obrigatório:</strong> Baixe os modelos abaixo para ver o formato exato</li>
                <li>• Use vírgula (,) como separador</li>
                <li>• Primeira linha deve conter os cabeçalhos exatos</li>
                <li>• Datas no formato YYYY-MM-DD</li>
                <li>• Valores booleanos: true/false</li>
                <li>• Não altere os nomes das colunas dos templates</li>
              </ul>
            </div>

            {/* Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">📥 Baixar Modelos CSV:</h4>
                {['unidades', 'atendentes', 'metricas_atendentes', 'metricas_unidades'].map(type => (
                  <button
                    key={type}
                    onClick={() => downloadTemplate(type)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg w-full text-left"
                  >
                    <Download className="w-4 h-4" />
                    Modelo {type.replace('_', ' ').replace('metricas', 'métricas')}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">📤 Enviar Seus Arquivos:</h4>
                {['unidades', 'atendentes', 'metricas_atendentes', 'metricas_unidades'].map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)}
                      className="hidden"
                      id={`csv-${type}`}
                    />
                    <label
                      htmlFor={`csv-${type}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1"
                    >
                      <Upload className="w-4 h-4" />
                      {csvFiles[type as keyof typeof csvFiles]?.name || `Selecionar ${type.replace('_', ' ').replace('metricas', 'métricas')}.csv`}
                    </label>
                    {csvFiles[type as keyof typeof csvFiles] && (
                      <button
                        onClick={() => handleFileChange(type, null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCsvImport}
              disabled={loading || Object.values(csvFiles).filter(Boolean).length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Importando...' : 'Importar Arquivos CSV'}
            </button>
          </div>
        )}

        {/* JSON Import */}
        {importMode === 'json' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">📝 Estrutura JSON Obrigatória:</h4>
              <p className="text-sm text-purple-800 mb-2">Use exatamente esta estrutura para seus dados reais:</p>
              <pre className="text-xs text-purple-700 bg-purple-100 p-2 rounded overflow-x-auto">
{`{
  "unidades": [
    {"nome": "Nome da Sua Unidade Real", "codigo": "CODIGO_UNICO", "ativo": true}
  ],
  "atendentes": [
    {"nome": "Nome Real do Atendente", "email": "email@real.com", "unidade_codigo": "CODIGO_UNICO", "ativo": true, "data_admissao": "2024-01-15"}
  ],
  "metricas_atendentes": [
    {"mes_ano": "2025-01", "unidade_codigo": "CODIGO_UNICO", "atendente_email": "email@real.com", "valor_orcamentos_registrados": 50000, "valor_orcamentos_convertidos": 40000, "qtde_exames_vendidos": 120, "qtde_pacientes_atendidos": 80, "nps": 85}
  ],
  "metricas_unidades": [
    {"mes_ano": "2025-01", "unidade_codigo": "CODIGO_UNICO", "faturamento_total": 150000}
  ]
}`}
              </pre>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seus Dados JSON:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Cole seus dados JSON aqui..."
              />
            </div>

            <button
              onClick={handleJsonImport}
              disabled={loading || !jsonData.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Importando...' : 'Importar Seus Dados JSON'}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">❌ Erro na Importação</h4>
              <pre className="text-sm text-red-800 mt-1 whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-3">✅ Dados Importados com Sucesso!</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(result.results).map(([key, data]: [string, any]) => (
                  <div key={key} className="bg-white rounded-lg p-3 border border-green-200">
                    <h5 className="font-medium text-gray-900 capitalize mb-1">
                      {key.replace('_', ' ')}
                    </h5>
                    <p className="text-sm text-green-700">
                      📊 {data.success} registros processados
                    </p>
                    {data.errors.length > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        ❌ {data.errors.length} erros
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {Object.values(result.results).some((data: any) => data.errors.length > 0) && (
                <div className="mt-4">
                  <h5 className="font-medium text-red-900 mb-2">⚠️ Problemas Encontrados:</h5>
                  {Object.entries(result.results).map(([key, data]: [string, any]) => 
                    data.errors.map((error: string, index: number) => (
                      <p key={`${key}-${index}`} className="text-sm text-red-700">
                        • {key}: {error}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportTab;