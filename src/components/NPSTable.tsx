import React from 'react';
import { Star } from 'lucide-react';
import { AtendentesData } from '../types';

interface NPSTableProps {
  data: AtendentesData[];
}

const NPSTable: React.FC<NPSTableProps> = ({ data }) => {
  const processData = () => {
    const atendenteData = data.reduce((acc, item) => {
      if (!acc[item.atendente]) {
        acc[item.atendente] = { total: 0, count: 0 };
      }
      acc[item.atendente].total += item.nps;
      acc[item.atendente].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(atendenteData)
      .map(([atendente, { total, count }]) => ({
        atendente,
        nps: total / count
      }))
      .sort((a, b) => b.nps - a.nps);
  };

  const tableData = processData();

  const getNPSColor = (nps: number) => {
    if (nps >= 70) return 'text-green-600 bg-green-50';
    if (nps >= 50) return 'text-yellow-600 bg-yellow-50';
    if (nps >= 0) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getNPSLabel = (nps: number) => {
    if (nps >= 70) return 'Excelente';
    if (nps >= 50) return 'Bom';
    if (nps >= 0) return 'Regular';
    return 'Crítico';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">NPS por Atendente</h3>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Atendente
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                NPS
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((item, index) => (
              <tr key={item.atendente} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.atendente}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNPSColor(item.nps)}`}>
                    {item.nps.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {getNPSLabel(item.nps)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NPSTable;