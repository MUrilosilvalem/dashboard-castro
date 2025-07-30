import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber, getPercentageChange } from '../utils/dataUtils';

interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  color: string;
  type: 'currency' | 'number';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  icon,
  color,
  type
}) => {
  const formatValue = (val: number) => {
    return type === 'currency' ? formatCurrency(val) : formatNumber(val);
  };

  const percentageChange = previousValue !== undefined ? getPercentageChange(value, previousValue) : null;

  const getTrendIcon = () => {
    if (percentageChange === null || percentageChange === 0) {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
    return percentageChange > 0 
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (percentageChange === null || percentageChange === 0) return 'text-gray-500';
    return percentageChange > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          </div>
        </div>
        
        {percentageChange !== null && (
          <div className="text-right">
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {Math.abs(percentageChange).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs. período anterior</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;