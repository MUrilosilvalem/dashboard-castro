import { useState, useEffect, useMemo } from 'react';
import { AtendentesData, Filters, KPIData } from '../types';
import { getPreviousPeriods } from '../utils/dataUtils';
import { DashboardService } from '../services/dashboardService';
import { isSupabaseConfigured } from '../lib/supabase';

export const useDashboardData = () => {
  const [rawData, setRawData] = useState<AtendentesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    periodo: [],
    unidade: [],
    atendente: []
  });
  const [showAtendentesFilter, setShowAtendentesFilter] = useState(false);
  const [availableOptions, setAvailableOptions] = useState({
    periodos: [] as string[],
    unidades: [] as string[],
    atendentes: [] as string[]
  });

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isSupabaseConfigured) {
          // Usar dados do Supabase
          const [data, options] = await Promise.all([
            DashboardService.fetchAtendentesData(),
            DashboardService.fetchAvailableOptions()
          ]);
          
          setRawData(data);
          setAvailableOptions(options);
        } else {
          // Sem Supabase configurado - dados vazios
          setRawData([]);
          setAvailableOptions({
            periodos: [],
            unidades: [],
            atendentes: []
          });
        }
        
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        // Se for erro de credenciais, mostrar mensagem específica
        if (errorMessage.includes('Invalid authentication credentials') || 
            errorMessage.includes('Credenciais do Supabase inválidas')) {
          setError('Credenciais do Supabase inválidas. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
        } else {
          setError(errorMessage);
        }
        
        // Em caso de erro, dados vazios
        setRawData([]);
        setAvailableOptions({
          periodos: [],
          unidades: [],
          atendentes: []
        });
      }
      
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // Filtrar dados quando filtros mudarem
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      const matchesPeriodo = filters.periodo.length === 0 || filters.periodo.includes(item.mes_ano);
      const matchesUnidade = filters.unidade.length === 0 || filters.unidade.includes(item.unidade);
      const matchesAtendente = filters.atendente.length === 0 || filters.atendente.includes(item.atendente);
      
      return matchesPeriodo && matchesUnidade && matchesAtendente;
    });
  }, [rawData, filters]);

  // Dados do período anterior para comparação
  const previousData = useMemo(() => {
    const previousPeriods = getPreviousPeriods(filters.periodo);
    return rawData.filter(item => {
      const matchesPeriodo = previousPeriods.length === 0 || previousPeriods.includes(item.mes_ano);
      const matchesUnidade = filters.unidade.length === 0 || filters.unidade.includes(item.unidade);
      const matchesAtendente = filters.atendente.length === 0 || filters.atendente.includes(item.atendente);
      
      return matchesPeriodo && matchesUnidade && matchesAtendente;
    });
  }, [rawData, filters]);

  // Calcular KPIs
  const kpiData = useMemo((): KPIData => {
    const current = filteredData.reduce((acc, item) => {
      acc.valor_orcamentos_registrados += item.valor_orcamentos_registrados;
      acc.valor_orcamentos_convertidos += item.valor_orcamentos_convertidos;
      acc.qtde_exames_vendidos += item.qtde_exames_vendidos;
      return acc;
    }, {
      valor_orcamentos_registrados: 0,
      valor_orcamentos_convertidos: 0,
      qtde_exames_vendidos: 0
    });

    const previous = previousData.reduce((acc, item) => {
      acc.valor_orcamentos_registrados += item.valor_orcamentos_registrados;
      acc.valor_orcamentos_convertidos += item.valor_orcamentos_convertidos;
      acc.qtde_exames_vendidos += item.qtde_exames_vendidos;
      return acc;
    }, {
      valor_orcamentos_registrados: 0,
      valor_orcamentos_convertidos: 0,
      qtde_exames_vendidos: 0
    });

    return {
      ...current,
      media_anterior: previous
    };
  }, [filteredData, previousData]);

  return {
    rawData,
    filteredData,
    previousData,
    filters,
    setFilters,
    availableOptions,
    kpiData,
    showAtendentesFilter,
    setShowAtendentesFilter,
    loading,
    error
  };
};