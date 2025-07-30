import { AtendentesData, Filters } from '../types';

export const generateMockData = (): AtendentesData[] => {
  // Retorna array vazio - dados serão alimentados via painel administrativo
  return [];
};

export const filterData = (data: AtendentesData[], filters: Filters): AtendentesData[] => {
  return data.filter(item => {
    const matchesPeriodo = filters.periodo.length === 0 || filters.periodo.includes(item.mes_ano);
    const matchesUnidade = filters.unidade.length === 0 || filters.unidade.includes(item.unidade);
    const matchesAtendente = filters.atendente.length === 0 || filters.atendente.includes(item.atendente);
    
    return matchesPeriodo && matchesUnidade && matchesAtendente;
  });
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const getLastSixMonths = (): string[] => {
  const months = [];
  // Usar data atual para ter dados mais realistas
  const currentDate = new Date(2025, 11, 1); // Dezembro 2025
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }
  
  return months;
};

export const getPercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getPreviousPeriods = (currentPeriods: string[]): string[] => {
  if (currentPeriods.length === 0) return [];
  
  return currentPeriods.map(period => {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 2, 1); // Mês anterior
    const prevYear = date.getFullYear();
    const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${prevYear}-${prevMonth}`;
  });
};