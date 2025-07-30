import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AtendentesData, Filters } from '../types';

export class DashboardService {
  static async fetchAtendentesData(filters?: Filters): Promise<AtendentesData[]> {
    try {
      // Verificar se o Supabase está configurado
      if (!isSupabaseConfigured) {
        console.warn('Supabase não configurado - retornando dados vazios');
        return [];
      }

      let query = supabase
        .from('vw_atendentes_aggregado')
        .select('*');

      // Aplicar filtros se fornecidos
      if (filters) {
        if (filters.periodo.length > 0) {
          query = query.in('mes_ano', filters.periodo);
        }
        
        if (filters.unidade.length > 0) {
          query = query.in('unidade', filters.unidade);
        }
        
        if (filters.atendente.length > 0) {
          query = query.in('atendente', filters.atendente);
        }
      }

      const { data, error } = await query.order('mes_ano', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dados:', error);
        throw new Error(`Erro ao carregar dados: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de dashboard:', error);
      // Retornar array vazio em caso de erro para evitar crash
      return [];
    }
  }

  static async fetchAvailableOptions() {
    try {
      // Verificar se o Supabase está configurado
      if (!isSupabaseConfigured) {
        console.warn('Supabase não configurado - retornando opções vazias');
        return {
          periodos: [],
          unidades: [],
          atendentes: []
        };
      }

      // Buscar períodos disponíveis
      const { data: periodosData, error: periodosError } = await supabase
        .from('vw_atendentes_aggregado')
        .select('mes_ano')
        .order('mes_ano', { ascending: false });

      if (periodosError) throw periodosError;

      // Buscar unidades disponíveis
      const { data: unidadesData, error: unidadesError } = await supabase
        .from('vw_atendentes_aggregado')
        .select('unidade')
        .order('unidade');

      if (unidadesError) throw unidadesError;

      // Buscar atendentes disponíveis
      const { data: atendentesData, error: atendentesError } = await supabase
        .from('vw_atendentes_aggregado')
        .select('atendente')
        .order('atendente');

      if (atendentesError) throw atendentesError;

      return {
        periodos: [...new Set(periodosData?.map(item => item.mes_ano) || [])],
        unidades: [...new Set(unidadesData?.map(item => item.unidade) || [])],
        atendentes: [...new Set(atendentesData?.map(item => item.atendente) || [])]
      };
    } catch (error) {
      console.error('Erro ao buscar opções disponíveis:', error);
      return {
        periodos: [],
        unidades: [],
        atendentes: []
      };
    }
  }

  static async fetchUnidades() {
    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      return [];
    }
  }

  static async fetchAtendentes(unidadeId?: string) {
    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      let query = supabase
        .from('atendentes')
        .select('*, unidades(nome)')
        .eq('ativo', true);

      if (unidadeId) {
        query = query.eq('unidade_id', unidadeId);
      }

      const { data, error } = await query.order('nome');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error);
      return [];
    }
  }

  static async fetchMetricasAtendentes() {
    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('metricas_atendentes')
        .select(`
          *,
          unidades(nome),
          atendentes(nome)
        `)
        .order('mes_ano', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar métricas de atendentes:', error);
      return [];
    }
  }

  static async fetchMetricasUnidades() {
    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('metricas_unidades')
        .select(`
          *,
          unidades(nome)
        `)
        .order('mes_ano', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar métricas de unidades:', error);
      return [];
    }
  }

  static async insertUnidade(unidade: {
    nome: string;
    codigo: string;
    ativo: boolean;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('unidades')
        .insert(unidade)
        .select();

      if (error) {
        console.error('Erro ao inserir unidade:', error);
        throw new Error(`Erro ao inserir unidade: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de inserção de unidade:', error);
      throw error;
    }
  }

  static async updateUnidade(id: string, updates: {
    nome?: string;
    codigo?: string;
    ativo?: boolean;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('unidades')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar unidade:', error);
        throw new Error(`Erro ao atualizar unidade: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de atualização de unidade:', error);
      throw error;
    }
  }

  static async deleteUnidade(id: string) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar unidade:', error);
        throw new Error(`Erro ao deletar unidade: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no serviço de deleção de unidade:', error);
      throw error;
    }
  }

  static async insertAtendente(atendente: {
    nome: string;
    email: string;
    unidade_id: string;
    ativo: boolean;
    data_admissao: string;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('atendentes')
        .insert(atendente)
        .select();

      if (error) {
        console.error('Erro ao inserir atendente:', error);
        throw new Error(`Erro ao inserir atendente: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de inserção de atendente:', error);
      throw error;
    }
  }

  static async updateAtendente(id: string, updates: {
    nome?: string;
    email?: string;
    unidade_id?: string;
    ativo?: boolean;
    data_admissao?: string;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('atendentes')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar atendente:', error);
        throw new Error(`Erro ao atualizar atendente: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de atualização de atendente:', error);
      throw error;
    }
  }

  static async deleteAtendente(id: string) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await supabase
        .from('atendentes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar atendente:', error);
        throw new Error(`Erro ao deletar atendente: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no serviço de deleção de atendente:', error);
      throw error;
    }
  }

  static async insertMetrica(metrica: {
    mes_ano: string;
    unidade_id: string;
    atendente_id: string;
    valor_orcamentos_registrados: number;
    valor_orcamentos_convertidos: number;
    qtde_exames_vendidos: number;
    qtde_pacientes_atendidos: number;
    nps: number;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('metricas_atendentes')
        .insert(metrica)
        .select();

      if (error) {
        console.error('Erro ao inserir métrica:', error);
        throw new Error(`Erro ao inserir métrica: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de inserção:', error);
      throw error;
    }
  }

  static async insertFaturamentoUnidade(faturamento: {
    mes_ano: string;
    unidade_id: string;
    faturamento_total: number;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('metricas_unidades')
        .upsert(faturamento, { onConflict: 'mes_ano,unidade_id' })
        .select();

      if (error) {
        console.error('Erro ao inserir faturamento:', error);
        throw new Error(`Erro ao inserir faturamento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de inserção de faturamento:', error);
      throw error;
    }
  }

  static async updateFaturamentoUnidade(id: string, updates: {
    mes_ano?: string;
    unidade_id?: string;
    faturamento_total?: number;
  }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('metricas_unidades')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar faturamento:', error);
        throw new Error(`Erro ao atualizar faturamento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de atualização de faturamento:', error);
      throw error;
    }
  }

  static async updateMetrica(id: string, updates: Partial<{
    valor_orcamentos_registrados: number;
    valor_orcamentos_convertidos: number;
    qtde_exames_vendidos: number;
    qtde_pacientes_atendidos: number;
    nps: number;
  }>) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('metricas_atendentes')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar métrica:', error);
        throw new Error(`Erro ao atualizar métrica: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de atualização:', error);
      throw error;
    }
  }

  static async updateMetricaAtendente(id: string, updates: Partial<{
    mes_ano: string;
    unidade_id: string;
    atendente_id: string;
    valor_orcamentos_registrados: number;
    valor_orcamentos_convertidos: number;
    qtde_exames_vendidos: number;
    qtde_pacientes_atendidos: number;
    nps: number;
  }>) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('metricas_atendentes')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erro ao atualizar métrica de atendente:', error);
        throw new Error(`Erro ao atualizar métrica de atendente: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de atualização de métrica de atendente:', error);
      throw error;
    }
  }

  static async deleteMetricaAtendente(id: string) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await supabase
        .from('metricas_atendentes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar métrica de atendente:', error);
      throw error;
    }
  }

  static async deleteMetricaUnidade(id: string) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await supabase
        .from('metricas_unidades')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar métrica de unidade:', error);
      throw error;
    }
  }
}