import React from 'react';
import { BarChart3 } from 'lucide-react';
import { AtendentesData } from '../types';
import { formatCurrency } from '../utils/dataUtils';

interface FaturamentoChartProps {
  data: AtendentesData[];
  type: 'month' | 'atendente';
}

const FaturamentoChart: React.FC<FaturamentoChartProps> = ({ data, type }) => {
  const processData = () => {
    if (type === 'month') {
      const monthlyData = data.reduce((acc, item) => {
        if (!acc[item.mes_ano]) {
          acc[item.mes_ano] = 0;
        }
        acc[item.mes_ano] += item.faturamento_total;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, value]) => ({ label: month, value }));
    } else {
      const atendenteData = data.reduce((acc, item) => {
        if (!acc[item.atendente]) {
          acc[item.atendente] = 0;
        }
        acc[item.atendente] += item.faturamento_total;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(atendenteData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Top 10 atendentes
        .map(([atendente, value]) => ({ label: atendente, value }));
    }
  };

  const chartData = processData();
  const maxValue = Math.max(...chartData.map(d => d.value));

  const formatMonthLabel = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    try {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('pt-BR', { year: '2-digit', month: 'short' });
    } catch {
      return monthYear; // Fallback para formato original
    }
  };

  const formatLabel = (label: string) => {
    return type === 'month' ? formatMonthLabel(label) : label.split(' ')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Faturamento por {type === 'month' ? 'Mês' : 'Atendente'}
        </h3>
      </div>

      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 truncate">
              {formatLabel(item.label)}
            </div>
            <div className="flex-1 relative">
              <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-md"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`
                  }}
                />
              </div>
              {index < 5 && (
                <div className="absolute right-2 top-1 text-xs text-white font-medium">
                  {formatCurrency(item.value)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaturamentoChart;