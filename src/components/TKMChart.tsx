import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AtendentesData } from '../types';
import { formatCurrency } from '../utils/dataUtils';

interface TKMChartProps {
  data: AtendentesData[];
}

const TKMChart: React.FC<TKMChartProps> = ({ data }) => {
  const processData = () => {
    const atendenteData = data.reduce((acc, item) => {
      if (!acc[item.atendente]) {
        acc[item.atendente] = { total: 0, count: 0 };
      }
      acc[item.atendente].total += item.tkm_paciente;
      acc[item.atendente].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(atendenteData)
      .map(([atendente, { total, count }]) => ({
        atendente,
        tkm: total / count
      }))
      .sort((a, b) => b.tkm - a.tkm)
      .slice(0, 8); // Top 8 atendentes
  };

  const chartData = processData();
  const maxTKM = Math.max(...chartData.map(d => d.tkm));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">TKM por Paciente (Média)</h3>
      </div>

      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={item.atendente} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 truncate">
              {item.atendente.split(' ')[0]}
            </div>
            <div className="flex-1 relative">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${(item.tkm / maxTKM) * 100}%`
                  }}
                />
              </div>
              {index < 5 && (
                <div className="absolute right-2 top-0 text-xs text-gray-700 font-medium">
                  {formatCurrency(item.tkm)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TKMChart;