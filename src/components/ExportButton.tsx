import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { AtendentesData } from '../types';
import { formatCurrency, formatNumber } from '../utils/dataUtils';

interface ExportButtonProps {
  data: AtendentesData[];
  filters: any;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, filters }) => {
  const exportToCSV = () => {
    const headers = [
      'Mês/Ano',
      'Unidade',
      'Atendente',
      'Faturamento Total',
      'Orçamentos Registrados',
      'Orçamentos Convertidos',
      'Exames Vendidos',
      'TKM Paciente',
      'NPS'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.mes_ano,
        row.unidade,
        row.atendente,
        row.faturamento_total,
        row.valor_orcamentos_registrados,
        row.valor_orcamentos_convertidos,
        row.qtde_exames_vendidos,
        row.tkm_paciente,
        row.nps
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_atendentes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSummary = () => {
    const summary = data.reduce((acc, item) => {
      acc.faturamento_total += item.faturamento_total;
      acc.valor_orcamentos_registrados += item.valor_orcamentos_registrados;
      acc.valor_orcamentos_convertidos += item.valor_orcamentos_convertidos;
      acc.qtde_exames_vendidos += item.qtde_exames_vendidos;
      acc.tkm_total += item.tkm_paciente;
      acc.nps_total += item.nps;
      acc.count += 1;
      return acc;
    }, {
      faturamento_total: 0,
      valor_orcamentos_registrados: 0,
      valor_orcamentos_convertidos: 0,
      qtde_exames_vendidos: 0,
      tkm_total: 0,
      nps_total: 0,
      count: 0
    });

    const summaryData = [
      ['Métrica', 'Valor'],
      ['Faturamento Total', formatCurrency(summary.faturamento_total)],
      ['Orçamentos Registrados', formatCurrency(summary.valor_orcamentos_registrados)],
      ['Orçamentos Convertidos', formatCurrency(summary.valor_orcamentos_convertidos)],
      ['Taxa de Conversão', `${((summary.valor_orcamentos_convertidos / summary.valor_orcamentos_registrados) * 100).toFixed(1)}%`],
      ['Exames Vendidos', formatNumber(summary.qtde_exames_vendidos)],
      ['TKM Médio', formatCurrency(summary.tkm_total / summary.count)],
      ['NPS Médio', (summary.nps_total / summary.count).toFixed(1)],
      ['Registros Analisados', formatNumber(summary.count)]
    ];

    const csvContent = summaryData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resumo_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Exportar Dados
      </button>
      <button
        onClick={exportSummary}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Exportar Resumo
      </button>
    </div>
  );
};

export default ExportButton;