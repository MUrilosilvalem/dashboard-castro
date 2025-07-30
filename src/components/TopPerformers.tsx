import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { AtendentesData } from '../types';
import { formatCurrency, formatNumber } from '../utils/dataUtils';

interface TopPerformersProps {
  data: AtendentesData[];
}

const TopPerformers: React.FC<TopPerformersProps> = ({ data }) => {
  const calculateTopPerformers = () => {
    const atendenteMetrics = data.reduce((acc, item) => {
      if (!acc[item.atendente]) {
        acc[item.atendente] = {
          faturamento: 0,
          conversao: 0,
          registrados: 0,
          exames: 0,
          tkm: 0,
          nps: 0,
          count: 0
        };
      }
      
      acc[item.atendente].faturamento += item.faturamento_total;
      acc[item.atendente].conversao += item.valor_orcamentos_convertidos;
      acc[item.atendente].registrados += item.valor_orcamentos_registrados;
      acc[item.atendente].exames += item.qtde_exames_vendidos;
      acc[item.atendente].tkm += item.tkm_paciente;
      acc[item.atendente].nps += item.nps;
      acc[item.atendente].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const performers = Object.entries(atendenteMetrics).map(([atendente, metrics]) => ({
      atendente,
      faturamento: metrics.faturamento,
      taxa_conversao: metrics.registrados > 0 ? (metrics.conversao / metrics.registrados) * 100 : 0,
      exames: metrics.exames,
      tkm_medio: metrics.tkm / metrics.count,
      nps_medio: metrics.nps / metrics.count
    }));

    return {
      faturamento: performers.sort((a, b) => b.faturamento - a.faturamento).slice(0, 3),
      conversao: performers.sort((a, b) => b.taxa_conversao - a.taxa_conversao).slice(0, 3),
      nps: performers.sort((a, b) => b.nps_medio - a.nps_medio).slice(0, 3)
    };
  };

  const topPerformers = calculateTopPerformers();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-yellow-50 border-yellow-200';
      case 1:
        return 'bg-gray-50 border-gray-200';
      case 2:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Faturamento */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Maior Faturamento</h4>
          <div className="space-y-2">
            {topPerformers.faturamento.map((performer, index) => (
              <div key={performer.atendente} className={`p-3 rounded-lg border ${getPositionColor(index)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getPositionIcon(index)}
                  <span className="font-medium text-gray-900 text-sm">
                    {performer.atendente.split(' ')[0]}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(performer.faturamento)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Conversão */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Maior Taxa de Conversão</h4>
          <div className="space-y-2">
            {topPerformers.conversao.map((performer, index) => (
              <div key={performer.atendente} className={`p-3 rounded-lg border ${getPositionColor(index)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getPositionIcon(index)}
                  <span className="font-medium text-gray-900 text-sm">
                    {performer.atendente.split(' ')[0]}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {performer.taxa_conversao.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top NPS */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Maior NPS</h4>
          <div className="space-y-2">
            {topPerformers.nps.map((performer, index) => (
              <div key={performer.atendente} className={`p-3 rounded-lg border ${getPositionColor(index)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getPositionIcon(index)}
                  <span className="font-medium text-gray-900 text-sm">
                    {performer.atendente.split(' ')[0]}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {performer.nps_medio.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformers;