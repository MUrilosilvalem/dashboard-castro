import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader2, Plus, Trash2, FileSpreadsheet, Database } from 'lucide-react';
import { BulkImportService } from '../services/bulkImportService';

const BulkImportTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'demo' | 'csv' | 'json'>('csv');
  const [jsonData, setJsonData] = useState('');
  const [csvFiles, setCsvFiles] = useState<{
    unidades?: File;
    atendentes?: File;
    metricas_atendentes?: File;
    metricas_unidades?: File;
  }>({});

  const handleDemoImport = async () => {
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
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Converter tipos baseado no cabeçalho
        if (type === 'metricas_atendentes' || type === 'metricas_unidades') {
          if (['valor_orcamentos_registrados', 'valor_orcamentos_convertidos', 'qtde_exames_vendidos', 'qtde_pacientes_atendidos', 'nps', 'faturamento_total'].includes(header)) {
            obj[header] = parseFloat(value) || 0;
          } else {
            obj[header] = value;
          }
        } else if ((type === 'atendentes' || type === 'unidades') && header === 'ativo') {
          obj[header] = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'sim';
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
"Centro Médico São Paulo","CMSP001",true
"Clínica Zona Norte","CZN002",true
"Unidade Zona Sul","UZS003",true
"Laboratório Centro","LAB004",true
"Clínica Zona Oeste","CZO005",false`,
      
      atendentes: `nome,email,unidade_codigo,ativo,data_admissao
"Maria Silva Santos","maria.santos@empresa.com","CMSP001",true,"2024-01-15"
"João Pedro Oliveira","joao.oliveira@empresa.com","CMSP001",true,"2024-02-01"
"Ana Carolina Lima","ana.lima@empresa.com","CZN002",true,"2024-01-20"
"Carlos Eduardo Costa","carlos.costa@empresa.com","UZS003",true,"2024-03-10"
"Patricia Fernanda Souza","patricia.souza@empresa.com","CZN002",true,"2024-01-05"
"Roberto Silva Junior","roberto.junior@empresa.com","LAB004",true,"2024-02-15"
"Fernanda Alves Pereira","fernanda.pereira@empresa.com","UZS003",false,"2024-01-10"`,
      
      metricas_atendentes: `mes_ano,unidade_codigo,atendente_email,valor_orcamentos_registrados,valor_orcamentos_convertidos,qtde_exames_vendidos,qtde_pacientes_atendidos,nps
"2025-01","CMSP001","maria.santos@empresa.com",85000,68000,180,120,92
"2025-01","CMSP001","joao.oliveira@empresa.com",75000,60000,150,100,88
"2025-01","CZN002","ana.lima@empresa.com",65000,52000,130,90,85
"2025-01","UZS003","carlos.costa@empresa.com",55000,44000,110,75,82
"2025-01","CZN002","patricia.souza@empresa.com",70000,56000,140,95,87
"2025-01","LAB004","roberto.junior@empresa.com",60000,48000,120,80,83
"2024-12","CMSP001","maria.santos@empresa.com",80000,64000,170,115,90
"2024-12","CMSP001","joao.oliveira@empresa.com",70000,56000,140,95,86
"2024-12","CZN002","ana.lima@empresa.com",60000,48000,125,85,83
"2024-12","UZS003","carlos.costa@empresa.com",50000,40000,100,70,80
"2024-12","CZN002","patricia.souza@empresa.com",65000,52000,130,90,85
"2024-12","LAB004","roberto.junior@empresa.com",55000,44000,110,75,81
"2024-11","CMSP001","maria.santos@empresa.com",75000,60000,160,110,88
"2024-11","CMSP001","joao.oliveira@empresa.com",65000,52000,135,90,84
"2024-11","CZN002","ana.lima@empresa.com",55000,44000,120,80,81
"2024-11","UZS003","carlos.costa@empresa.com",45000,36000,95,65,78
"2024-11","CZN002","patricia.souza@empresa.com",60000,48000,125,85,83
"2024-11","LAB004","roberto.junior@empresa.com",50000,40000,105,70,79`,
      
      metricas: `mes_ano,unidade_codigo,atendente_email,valor_orcamentos_registrados,valor_orcamentos_convertidos,qtde_exames_vendidos,qtde_pacientes_atendidos,nps,faturamento_total_unidade
"2025-01","CMSP001","maria.santos@empresa.com",85000,68000,180,120,92,220000
"2025-01","CMSP001","joao.oliveira@empresa.com",75000,60000,150,100,88,220000
"2025-01","CZN002","ana.lima@empresa.com",65000,52000,130,90,85,185000
"2025-01","UZS003","carlos.costa@empresa.com",55000,44000,110,75,82,155000
"2025-01","CZN002","patricia.souza@empresa.com",70000,56000,140,95,87,185000
"2025-01","LAB004","roberto.junior@empresa.com",60000,48000,120,80,83,140000
"2024-12","CMSP001","maria.santos@empresa.com",80000,64000,170,115,90,210000
"2024-12","CMSP001","joao.oliveira@empresa.com",70000,56000,140,95,86,210000
"2024-12","CZN002","ana.lima@empresa.com",60000,48000,125,85,83,175000
"2024-12","UZS003","carlos.costa@empresa.com",50000,40000,100,70,80,145000
"2024-12","CZN002","patricia.souza@empresa.com",65000,52000,130,90,85,175000
"2024-12","LAB004","roberto.junior@empresa.com",55000,44000,110,75,81,130000
"2024-11","CMSP001","maria.santos@empresa.com",75000,60000,160,110,88,200000
"2024-11","CMSP001","joao.oliveira@empresa.com",65000,52000,135,90,84,200000
"2024-11","CZN002","ana.lima@empresa.com",55000,44000,120,80,81,165000
"2024-11","UZS003","carlos.costa@empresa.com",45000,36000,95,65,78,135000
"2024-11","CZN002","patricia.souza@empresa.com",60000,48000,125,85,83,165000
"2024-11","LAB004","roberto.junior@empresa.com",50000,40000,105,70,79,120000`
    };

    const content = templates[type as keyof typeof templates];
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllTemplates = () => {
    ['unidades', 'atendentes', 'metricas'].forEach(type => {
      setTimeout(() => downloadTemplate(type), 100);
    });
  };

  const handleFileChange = (type: string, file: File | null) => {
    setCsvFiles(prev => ({
      ...prev,
      [type]: file || undefined
    }));
  };

  const parseCsvToJson = (csvText: string, type: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Converter tipos baseado no cabeçalho
        if (type === 'metricas') {
          if (['valor_orcamentos_registrados', 'valor_orcamentos_convertidos', 'qtde_exames_vendidos', 'qtde_pacientes_atendidos', 'nps', 'faturamento_total_unidade'].includes(header)) {
            obj[header] = parseFloat(value) || 0;
          } else {
            obj[header] = value;
          }
        } else if ((type === 'atendentes' || type === 'unidades') && header === 'ativo') {
          obj[header] = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'sim';
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
          
          if (type === 'metricas') {
            // Processar arquivo único de métricas
            const metricasData = parseCsvToJson(text, type);
            
            // Separar métricas de atendentes e unidades
            const metricasAtendentes = metricasData.map((item: any) => ({
              mes_ano: item.mes_ano,
              unidade_codigo: item.unidade_codigo,
              atendente_email: item.atendente_email,
              valor_orcamentos_registrados: item.valor_orcamentos_registrados,
              valor_orcamentos_convertidos: item.valor_orcamentos_convertidos,
              qtde_exames_vendidos: item.qtde_exames_vendidos,
              qtde_pacientes_atendidos: item.qtde_pacientes_atendidos,
              nps: item.nps
            }));
            
            // Agrupar faturamento por unidade/mês
            const faturamentoMap = new Map();
            metricasData.forEach((item: any) => {
              const key = `${item.mes_ano}-${item.unidade_codigo}`;
              if (!faturamentoMap.has(key)) {
                faturamentoMap.set(key, {
                  mes_ano: item.mes_ano,
                  unidade_codigo: item.unidade_codigo,
                  faturamento_total: item.faturamento_total_unidade
                });
              }
            });
            
            importData.metricas_atendentes = metricasAtendentes;
            importData.metricas_unidades = Array.from(faturamentoMap.values());
          } else {
            importData[type] = parseCsvToJson(text, type);
          }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Importação de Dados Reais</h2>
          <p className="text-sm text-gray-600">Importe seus dados reais através de arquivos CSV estruturados ou JSON</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Selecione o Método de Importação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setImportMode('csv')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'csv' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileSpreadsheet className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Arquivos CSV</h4>
            <p className="text-sm text-gray-600">Importe dados estruturados em formato CSV (Recomendado)</p>
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
            <p className="text-sm text-gray-600">Importe dados estruturados em formato JSON</p>
          </button>

          <button
            onClick={() => setImportMode('demo')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'demo' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Database className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Dados de Demonstração</h4>
            <p className="text-sm text-gray-600">Importar dados fictícios para testar o sistema</p>
          </button>
        </div>

        {/* CSV Import - Método Principal */}
        {importMode === 'csv' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📊 Importação de Dados Reais via CSV</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Formato obrigatório:</strong> Use exatamente os modelos fornecidos</li>
                <li>• <strong>Codificação:</strong> UTF-8 com vírgula (,) como separador</li>
                <li>• <strong>Cabeçalhos:</strong> Primeira linha deve conter os nomes exatos das colunas</li>
                <li>• <strong>Datas:</strong> Formato YYYY-MM-DD (ex: 2025-01-15)</li>
                <li>• <strong>Períodos:</strong> Formato YYYY-MM (ex: 2025-01)</li>
                <li>• <strong>Valores:</strong> Use ponto (.) para decimais, sem símbolos de moeda</li>
                <li>• <strong>Booleanos:</strong> true/false ou 1/0</li>
                <li>• <strong>Métricas unificadas:</strong> Um único arquivo contém dados de atendentes + faturamento da unidade</li>
              </ul>
            </div>

            {/* Download All Templates */}
            <div className="text-center">
              <button
                onClick={downloadAllTemplates}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Download className="w-5 h-5" />
                Baixar Todos os Modelos CSV
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Baixa os 3 arquivos modelo de uma vez (unidades, atendentes, métricas)
              </p>
            </div>

            {/* Individual Templates and Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Modelos CSV Individuais:
                </h4>
                {[
                  { key: 'unidades', label: 'Unidades', desc: 'Cadastro das unidades de atendimento' },
                  { key: 'atendentes', label: 'Atendentes', desc: 'Cadastro dos atendentes por unidade' },
                  { key: 'metricas', label: 'Métricas Completas', desc: 'Performance dos atendentes + faturamento das unidades' }
                ].map(template => (
                  <div key={template.key} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{template.label}</h5>
                        <p className="text-xs text-gray-600">{template.desc}</p>
                      </div>
                      <button
                        onClick={() => downloadTemplate(template.key)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        <Download className="w-3 h-3" />
                        Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Enviar Seus Arquivos:
                </h4>
                {[
                  { key: 'unidades', label: 'Unidades', required: true },
                  { key: 'atendentes', label: 'Atendentes', required: true },
                  { key: 'metricas', label: 'Métricas Completas', required: false }
                ].map(upload => (
                  <div key={upload.key} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">{upload.label}</span>
                      {upload.required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Obrigatório</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(upload.key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`csv-${upload.key}`}
                      />
                      <label
                        htmlFor={`csv-${upload.key}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded cursor-pointer hover:bg-gray-50 flex-1"
                      >
                        <Upload className="w-4 h-4" />
                        {csvFiles[upload.key as keyof typeof csvFiles]?.name || `Selecionar ${upload.label.toLowerCase()}.csv`}
                      </label>
                      {csvFiles[upload.key as keyof typeof csvFiles] && (
                        <button
                          onClick={() => handleFileChange(upload.key, null)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Ordem de Importação Recomendada:</h4>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li><strong>Unidades</strong> - Cadastre primeiro as unidades</li>
                <li><strong>Atendentes</strong> - Depois os atendentes vinculados às unidades</li>
                <li><strong>Métricas Completas</strong> - Performance dos atendentes + faturamento das unidades em um só arquivo</li>
              </ol>
              <p className="text-xs text-yellow-700 mt-2">
                O arquivo de métricas agora é unificado e contém tanto os dados individuais dos atendentes quanto o faturamento total da unidade.
              </p>
            </div>

            <button
              onClick={handleCsvImport}
              disabled={loading || Object.values(csvFiles).filter(Boolean).length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Importando Dados Reais...' : 'Importar Dados Reais'}
            </button>
          </div>
        )}

        {/* JSON Import */}
        {importMode === 'json' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">📝 Estrutura JSON para Dados Reais:</h4>
              <p className="text-sm text-purple-800 mb-2">Use esta estrutura exata para seus dados reais:</p>
              <pre className="text-xs text-purple-700 bg-purple-100 p-3 rounded overflow-x-auto">
{`{
  "unidades": [
    {
      "nome": "Centro Médico São Paulo",
      "codigo": "CMSP001",
      "ativo": true
    }
  ],
  "atendentes": [
    {
      "nome": "Maria Silva Santos",
      "email": "maria.santos@empresa.com",
      "unidade_codigo": "CMSP001",
      "ativo": true,
      "data_admissao": "2024-01-15"
    }
  ],
  "metricas_atendentes": [
    {
      "mes_ano": "2025-01",
      "unidade_codigo": "CMSP001",
      "atendente_email": "maria.santos@empresa.com",
      "valor_orcamentos_registrados": 85000,
      "valor_orcamentos_convertidos": 68000,
      "qtde_exames_vendidos": 180,
      "qtde_pacientes_atendidos": 120,
      "nps": 92
    }
  ],
  "metricas_unidades": [
    {
      "mes_ano": "2025-01",
      "unidade_codigo": "CMSP001",
      "faturamento_total": 220000
    }
  ]
}`}
              </pre>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cole Seus Dados JSON Reais:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Cole seus dados JSON reais aqui..."
              />
            </div>

            <button
              onClick={handleJsonImport}
              disabled={loading || !jsonData.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Importando Dados Reais...' : 'Importar Dados JSON'}
            </button>
          </div>
        )}

        {/* Demo Data Import */}
        {importMode === 'demo' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">🧪 Dados de Demonstração</h4>
              <p className="text-sm text-orange-800 mb-2">
                Esta opção importa dados fictícios apenas para testar o funcionamento do sistema.
              </p>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• 3 Unidades fictícias</li>
                <li>• 4 Atendentes de exemplo</li>
                <li>• Métricas simuladas dos últimos meses</li>
                <li>• Dados de faturamento por unidade</li>
              </ul>
              <div className="bg-orange-100 border border-orange-300 rounded p-2 mt-3">
                <p className="text-xs text-orange-900 font-medium">
                  ⚠️ ATENÇÃO: Use apenas para testes. Para dados reais, use CSV ou JSON.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDemoImport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              {loading ? 'Importando Demonstração...' : 'Importar Dados de Demonstração'}
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
                      {key.replace('_', ' ').replace('metricas', 'métricas')}
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
                  <div className="bg-red-50 border border-red-200 rounded p-3 max-h-32 overflow-y-auto">
                    {Object.entries(result.results).map(([key, data]: [string, any]) => 
                      data.errors.map((error: string, index: number) => (
                        <p key={`${key}-${index}`} className="text-sm text-red-700">
                          • <strong>{key}:</strong> {error}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  🎉 <strong>Próximo passo:</strong> Volte ao dashboard principal para visualizar seus dados importados!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportTab;
"2025-01","CMSP001",220000
"2025-01","CZN002",185000
"2025-01","UZS003",155000
"2025-01","LAB004",140000
"2025-01","CZO005",0
"2024-12","CMSP001",210000
"2024-12","CZN002",175000
"2024-12","UZS003",145000
"2024-12","LAB004",130000
"2024-12","CZO005",0
"2024-11","CMSP001",200000
"2024-11","CZN002",165000
"2024-11","UZS003",135000
"2024-11","LAB004",120000
"2024-11","CZO005",0`
    };

    const content = templates[type as keyof typeof templates];
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`modelo_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (type: string, file: File | null) => {
    setCsvFiles(prev => ({
      ...prev,
      [type]: file || undefined
    }));
  };

  const downloadAllTemplates = () => {
    ['unidades', 'atendentes', 'metricas_atendentes', 'metricas_unidades'].forEach(type => {
      setTimeout(() => downloadTemplate(type), 100);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Importação de Dados Reais</h2>
          <p className="text-sm text-gray-600">Importe seus dados reais através de arquivos CSV estruturados ou JSON</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Selecione o Método de Importação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setImportMode('csv')}
            className={\`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'csv' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileSpreadsheet className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Arquivos CSV</h4>
            <p className="text-sm text-gray-600">Importe dados estruturados em formato CSV (Recomendado)</p>
          </button>

          <button
            onClick={() => setImportMode('json')}
            className={\`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'json' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Dados JSON</h4>
            <p className="text-sm text-gray-600">Importe dados estruturados em formato JSON</p>
          </button>

          <button
            onClick={() => setImportMode('demo')}
            className={\`p-4 border-2 rounded-lg text-left transition-colors ${
              importMode === 'demo' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Database className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Dados de Demonstração</h4>
            <p className="text-sm text-gray-600">Importar dados fictícios para testar o sistema</p>
          </button>
        </div>

        {/* CSV Import - Método Principal */}
        {importMode === 'csv' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📊 Importação de Dados Reais via CSV</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Formato obrigatório:</strong> Use exatamente os modelos fornecidos</li>
                <li>• <strong>Codificação:</strong> UTF-8 com vírgula (,) como separador</li>
                <li>• <strong>Cabeçalhos:</strong> Primeira linha deve conter os nomes exatos das colunas</li>
                <li>• <strong>Datas:</strong> Formato YYYY-MM-DD (ex: 2025-01-15)</li>
                <li>• <strong>Períodos:</strong> Formato YYYY-MM (ex: 2025-01)</li>
                <li>• <strong>Valores:</strong> Use ponto (.) para decimais, sem símbolos de moeda</li>
                <li>• <strong>Booleanos:</strong> true/false ou 1/0</li>
              </ul>
            </div>

            {/* Download All Templates */}
            <div className="text-center">
              <button
                onClick={downloadAllTemplates}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Download className="w-5 h-5" />
                Baixar Todos os Modelos CSV
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Baixa os 4 arquivos modelo de uma vez
              </p>
            </div>

            {/* Individual Templates and Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Modelos CSV Individuais:
                </h4>
                {[
                  { key: 'unidades', label: 'Unidades', desc: 'Cadastro das unidades de atendimento' },
                  { key: 'atendentes', label: 'Atendentes', desc: 'Cadastro dos atendentes por unidade' },
                  { key: 'metricas_atendentes', label: 'Métricas de Atendentes', desc: 'Performance mensal dos atendentes' },
                  { key: 'metricas_unidades', label: 'Métricas de Unidades', desc: 'Faturamento mensal por unidade' }
                ].map(template => (
                  <div key={template.key} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{template.label}</h5>
                        <p className="text-xs text-gray-600">{template.desc}</p>
                      </div>
                      <button
                        onClick={() => downloadTemplate(template.key)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        <Download className="w-3 h-3" />
                        Baixar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Enviar Seus Arquivos:
                </h4>
                {[
                  { key: 'unidades', label: 'Unidades', required: true },
                  { key: 'atendentes', label: 'Atendentes', required: true },
                  { key: 'metricas_atendentes', label: 'Métricas de Atendentes', required: false },
                  { key: 'metricas_unidades', label: 'Métricas de Unidades', required: false }
                ].map(upload => (
                  <div key={upload.key} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">{upload.label}</span>
                      {upload.required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Obrigatório</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(upload.key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={\`csv-${upload.key}`}
                      />
                      <label
                        htmlFor={\`csv-${upload.key}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded cursor-pointer hover:bg-gray-50 flex-1"
                      >
                        <Upload className="w-4 h-4" />
                        {csvFiles[upload.key as keyof typeof csvFiles]?.name || \`Selecionar ${upload.label.toLowerCase()}.csv`}
                      </label>
                      {csvFiles[upload.key as keyof typeof csvFiles] && (
                        <button
                          onClick={() => handleFileChange(upload.key, null)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Ordem de Importação Recomendada:</h4>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li><strong>Unidades</strong> - Cadastre primeiro as unidades</li>
                <li><strong>Atendentes</strong> - Depois os atendentes vinculados às unidades</li>
                <li><strong>Métricas de Unidades</strong> - Faturamento mensal das unidades</li>
                <li><strong>Métricas de Atendentes</strong> - Performance individual dos atendentes</li>
              </ol>
              <p className="text-xs text-yellow-700 mt-2">
                Você pode importar todos de uma vez ou separadamente seguindo esta ordem.
              </p>
            </div>

            <button
              onClick={handleCsvImport}
              disabled={loading || Object.values(csvFiles).filter(Boolean).length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Importando Dados Reais...' : 'Importar Dados Reais'}
            </button>
          </div>
        )}

        {/* JSON Import */}
        {importMode === 'json' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">📝 Estrutura JSON para Dados Reais:</h4>
              <p className="text-sm text-purple-800 mb-2">Use esta estrutura exata para seus dados reais:</p>
              <pre className="text-xs text-purple-700 bg-purple-100 p-3 rounded overflow-x-auto">
{`{
  "unidades": [
    {
      "nome": "Centro Médico São Paulo",
      "codigo": "CMSP001",
      "ativo": true
    }
  ],
  "atendentes": [
    {
      "nome": "Maria Silva Santos",
      "email": "maria.santos@empresa.com",
      "unidade_codigo": "CMSP001",
      "ativo": true,
      "data_admissao": "2024-01-15"
    }
  ],
  "metricas_atendentes": [
    {
      "mes_ano": "2025-01",
      "unidade_codigo": "CMSP001",
      "atendente_email": "maria.santos@empresa.com",
      "valor_orcamentos_registrados": 85000,
      "valor_orcamentos_convertidos": 68000,
      "qtde_exames_vendidos": 180,
      "qtde_pacientes_atendidos": 120,
      "nps": 92
    }
  ],
  "metricas_unidades": [
    {
      "mes_ano": "2025-01",
      "unidade_codigo": "CMSP001",
      "faturamento_total": 220000
    }
  ]
}`}
              </pre>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cole Seus Dados JSON Reais:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Cole seus dados JSON reais aqui..."
              />
            </div>

            <button
              onClick={handleJsonImport}
              disabled={loading || !jsonData.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Importando Dados Reais...' : 'Importar Dados JSON'}
            </button>
          </div>
        )}

        {/* Demo Data Import */}
        {importMode === 'demo' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">🧪 Dados de Demonstração</h4>
              <p className="text-sm text-orange-800 mb-2">
                Esta opção importa dados fictícios apenas para testar o funcionamento do sistema.
              </p>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• 3 Unidades fictícias</li>
                <li>• 4 Atendentes de exemplo</li>
                <li>• Métricas simuladas dos últimos meses</li>
                <li>• Dados de faturamento por unidade</li>
              </ul>
              <div className="bg-orange-100 border border-orange-300 rounded p-2 mt-3">
                <p className="text-xs text-orange-900 font-medium">
                  ⚠️ ATENÇÃO: Use apenas para testes. Para dados reais, use CSV ou JSON.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleDemoImport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              {loading ? 'Importando Demonstração...' : 'Importar Dados de Demonstração'}
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
                      {key.replace('_', ' ').replace('metricas', 'métricas')}
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
                  <div className="bg-red-50 border border-red-200 rounded p-3 max-h-32 overflow-y-auto">
                    {Object.entries(result.results).map(([key, data]: [string, any]) => 
                      data.errors.map((error: string, index: number) => (
                        <p key={\`${key}-${index}`} className="text-sm text-red-700">
                          • <strong>{key}:</strong> {error}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  🎉 <strong>Próximo passo:</strong> Volte ao dashboard principal para visualizar seus dados importados!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportTab;