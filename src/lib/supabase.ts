import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se o Supabase está configurado
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key'
);

// Criar cliente Supabase real ou mock
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Cliente mock para quando Supabase não está configurado
function createMockClient() {
  const mockResponse = { data: [], error: null };
  
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    upsert: () => mockQuery,
    in: () => mockQuery,
    eq: () => mockQuery,
    order: () => mockQuery,
    then: (resolve: any) => resolve(mockResponse)
  };
  
  return {
    from: () => mockQuery,
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
}

export type Database = {
  public: {
    Tables: {
      unidades: {
        Row: {
          id: string;
          nome: string;
          codigo: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          codigo: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          codigo?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      atendentes: {
        Row: {
          id: string;
          nome: string;
          email: string;
          unidade_id: string;
          ativo: boolean;
          data_admissao: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          unidade_id: string;
          ativo?: boolean;
          data_admissao?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          unidade_id?: string;
          ativo?: boolean;
          data_admissao?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      metricas_atendentes: {
        Row: {
          id: string;
          mes_ano: string;
          unidade_id: string;
          atendente_id: string;
          valor_orcamentos_registrados: number;
          valor_orcamentos_convertidos: number;
          qtde_exames_vendidos: number;
          qtde_pacientes_atendidos: number;
          nps: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mes_ano: string;
          unidade_id: string;
          atendente_id: string;
          valor_orcamentos_registrados?: number;
          valor_orcamentos_convertidos?: number;
          qtde_exames_vendidos?: number;
          qtde_pacientes_atendidos?: number;
          nps?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mes_ano?: string;
          unidade_id?: string;
          atendente_id?: string;
          valor_orcamentos_registrados?: number;
          valor_orcamentos_convertidos?: number;
          qtde_exames_vendidos?: number;
          qtde_pacientes_atendidos?: number;
          nps?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      metricas_unidades: {
        Row: {
          id: string;
          mes_ano: string;
          unidade_id: string;
          faturamento_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mes_ano: string;
          unidade_id: string;
          faturamento_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mes_ano?: string;
          unidade_id?: string;
          faturamento_total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      vw_atendentes_aggregado: {
        Row: {
          mes_ano: string;
          unidade: string;
          atendente: string;
          faturamento_total: number;
          valor_orcamentos_registrados: number;
          valor_orcamentos_convertidos: number;
          qtde_exames_vendidos: number;
          qtde_pacientes_atendidos: number;
          tkm_exame: number;
          tkm_paciente: number;
          nps: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};