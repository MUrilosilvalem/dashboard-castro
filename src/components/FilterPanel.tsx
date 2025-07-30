import React from 'react';
import { Calendar, Building2, Users, Filter } from 'lucide-react';
import { Filters } from '../types';

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableOptions: {
    periodos: string[];
    unidades: string[];
    atendentes: string[];
  };
  showAtendentesFilter: boolean;
  onToggleAtendentesFilter: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableOptions,
  showAtendentesFilter,
  onToggleAtendentesFilter
}) => {
  const handleFilterChange = (filterType: keyof Filters, values: string[]) => {
    onFiltersChange({
      ...filters,
      [filterType]: values
    });
  };

  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    try {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
    } catch {
      return monthYear; // Fallback para formato original
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtro Período */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Período
          </label>
          <select
            multiple
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ height: '120px' }}
            value={filters.periodo}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterChange('periodo', values);
            }}
          >
            {availableOptions.periodos.map(periodo => (
              <option key={periodo} value={periodo}>
                {formatMonthYear(periodo)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {filters.periodo.length === 0 ? 'Todos os períodos' : `${filters.periodo.length} selecionados`}
          </p>
        </div>

        {/* Filtro Unidade */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4" />
            Unidades
          </label>
          <select
            multiple
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ height: '120px' }}
            value={filters.unidade}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterChange('unidade', values);
            }}
          >
            {availableOptions.unidades.map(unidade => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {filters.unidade.length === 0 ? 'Todas as unidades' : `${filters.unidade.length} selecionadas`}
          </p>
        </div>

        {/* Filtro Atendentes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              Atendentes
            </label>
            <button
              onClick={onToggleAtendentesFilter}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAtendentesFilter ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showAtendentesFilter && (
            <>
              <select
                multiple
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ height: '120px' }}
                value={filters.atendente}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('atendente', values);
                }}
              >
                {availableOptions.atendentes.map(atendente => (
                  <option key={atendente} value={atendente}>
                    {atendente}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {filters.atendente.length === 0 ? 'Todos os atendentes' : `${filters.atendente.length} selecionados`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;