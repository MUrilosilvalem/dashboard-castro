import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { AtendentesData } from '../types';
import { formatCurrency } from '../utils/dataUtils';

interface ConversionChartProps {
  data: AtendentesData[];
}

const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
  const processData = () => {
    const atendenteData = data.reduce((acc, item) => {
      if (!acc[item.atendente]) {
        acc[item.atendente] = {
          registrados: 0,
          convertidos: 0
        };
      }
      acc[item.atendente].registrados += item.valor_orcamentos_registrados;
      acc[item.atendente].convertidos += item.valor_orcamentos_convertidos;
      return acc;
    }, {} as Record<string, { registrados: number; convertidos: number }>);

    return Object.entries(atendenteData)
      .map(([atendente, { registrados, convertidos }]) => ({
        atendente,
        registrados,
        convertidos,
        taxa: registrados > 0 ? (convertidos / registrados) * 100 : 0
      }))
      .sort((a, b) => b.taxa - a.taxa)
      .slice(0, 8);
  };

  const chartData = processData();
  const maxTaxa = Math.max(...chartData.map(d => d.taxa));

  const getTaxaColor = (taxa: number) => {
    if (taxa >= 80) return 'from-green-500 to-green-600';
    if (taxa >= 60) return 'from-blue-500 to-blue-600';
    if (taxa >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Taxa de Conversão por Atendente</h3>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.atendente} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {item.atendente.split(' ')[0]}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {item.taxa.toFixed(1)}%
              </span>
            </div>
            <div className="relative">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getTaxaColor(item.taxa)} transition-all duration-700 ease-out rounded-full`}
                  style={{
                    width: `${(item.taxa / maxTaxa) * 100}%`
                  }}
                />
              </div>
              {index < 3 && (
                <div className="mt-1 text-xs text-gray-500">
                  {formatCurrency(item.convertidos)} / {formatCurrency(item.registrados)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionChart;