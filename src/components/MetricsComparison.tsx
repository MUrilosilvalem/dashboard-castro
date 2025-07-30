import React from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AtendentesData } from '../types';
import { formatCurrency, formatNumber } from '../utils/dataUtils';

interface MetricsComparisonProps {
  data: AtendentesData[];
  previousData: AtendentesData[];
}

const MetricsComparison: React.FC<MetricsComparisonProps> = ({ data, previousData }) => {
  const calculateMetrics = (dataset: AtendentesData[]) => {
    return dataset.reduce((acc, item) => {
      acc.faturamento += item.faturamento_total;
      acc.orcamentos_registrados += item.valor_orcamentos_registrados;
      acc.orcamentos_convertidos += item.valor_orcamentos_convertidos;
      acc.exames += item.qtde_exames_vendidos;
      acc.tkm_total += item.tkm_paciente;
      acc.nps_total += item.nps;
      acc.count += 1;
      return acc;
    }, {
      faturamento: 0,
      orcamentos_registrados: 0,
      orcamentos_convertidos: 0,
      exames: 0,
      tkm_total: 0,
      nps_total: 0,
      count: 0
    });
  };

  const current = calculateMetrics(data);
  const previous = calculateMetrics(previousData);

  const metrics = [
    {
      label: 'Faturamento Total',
      current: current.faturamento,
      previous: previous.faturamento,
      format: 'currency'
    },
    {
      label: 'Taxa de Conversão',
      current: current.orcamentos_registrados > 0 ? (current.orcamentos_convertidos / current.orcamentos_registrados) * 100 : 0,
      previous: previous.orcamentos_registrados > 0 ? (previous.orcamentos_convertidos / previous.orcamentos_registrados) * 100 : 0,
      format: 'percentage'
    },
    {
      label: 'TKM Médio',
      current: current.count > 0 ? current.tkm_total / current.count : 0,
      previous: previous.count > 0 ? previous.tkm_total / previous.count : 0,
      format: 'currency'
    },
    {
      label: 'NPS Médio',
      current: current.count > 0 ? current.nps_total / current.count : 0,
      previous: previous.count > 0 ? previous.nps_total / previous.count : 0,
      format: 'number'
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toFixed(1);
      default:
        return formatNumber(value);
    }
  };

  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const variation = ((current - previous) / previous) * 100;
    return { value: Math.abs(variation), isPositive: variation >= 0 };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Comparação com Período Anterior</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const variation = getVariation(metric.current, metric.previous);
          
          return (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-600">{metric.label}</h4>
                <div className={`flex items-center gap-1 ${variation.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {variation.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">
                    {variation.value.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-bold text-gray-900">
                  {formatValue(metric.current, metric.format)}
                </div>
                <div className="text-sm text-gray-500">
                  Anterior: {formatValue(metric.previous, metric.format)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsComparison;