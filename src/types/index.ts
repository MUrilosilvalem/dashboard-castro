export interface AtendentesData {
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
}

export interface Filters {
  periodo: string[];
  unidade: string[];
  atendente: string[];
}

export interface KPIData {
  valor_orcamentos_registrados: number;
  valor_orcamentos_convertidos: number;
  qtde_exames_vendidos: number;
  media_anterior?: {
    valor_orcamentos_registrados: number;
    valor_orcamentos_convertidos: number;
    qtde_exames_vendidos: number;
  };
}

export interface PendingUser {
  id: string;
  email: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}