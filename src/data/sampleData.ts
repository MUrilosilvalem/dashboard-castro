import { AtendentesData } from '../types';

// Dados de exemplo para demonstração do dashboard
export const sampleData: AtendentesData[] = [
  // Janeiro 2025
  {
    mes_ano: "2025-01",
    unidade: "Centro Médico Principal",
    atendente: "Ana Silva",
    faturamento_total: 45000,
    valor_orcamentos_registrados: 50000,
    valor_orcamentos_convertidos: 40000,
    qtde_exames_vendidos: 120,
    qtde_pacientes_atendidos: 80,
    tkm_exame: 375,
    tkm_paciente: 562.5,
    nps: 85,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z"
  },
  {
    mes_ano: "2025-01",
    unidade: "Centro Médico Principal",
    atendente: "Carlos Santos",
    faturamento_total: 38000,
    valor_orcamentos_registrados: 45000,
    valor_orcamentos_convertidos: 35000,
    qtde_exames_vendidos: 100,
    qtde_pacientes_atendidos: 70,
    tkm_exame: 380,
    tkm_paciente: 542.8,
    nps: 78,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z"
  },
  {
    mes_ano: "2025-01",
    unidade: "Clínica Norte",
    atendente: "Maria Oliveira",
    faturamento_total: 42000,
    valor_orcamentos_registrados: 40000,
    valor_orcamentos_convertidos: 32000,
    qtde_exames_vendidos: 90,
    qtde_pacientes_atendidos: 65,
    tkm_exame: 466.7,
    tkm_paciente: 646.2,
    nps: 82,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z"
  },
  {
    mes_ano: "2025-01",
    unidade: "Unidade Sul",
    atendente: "João Costa",
    faturamento_total: 35000,
    valor_orcamentos_registrados: 35000,
    valor_orcamentos_convertidos: 28000,
    qtde_exames_vendidos: 85,
    qtde_pacientes_atendidos: 60,
    tkm_exame: 411.8,
    tkm_paciente: 583.3,
    nps: 75,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z"
  },
  {
    mes_ano: "2025-01",
    unidade: "Clínica Norte",
    atendente: "Patricia Lima",
    faturamento_total: 40000,
    valor_orcamentos_registrados: 38000,
    valor_orcamentos_convertidos: 30000,
    qtde_exames_vendidos: 95,
    qtde_pacientes_atendidos: 68,
    tkm_exame: 421.1,
    tkm_paciente: 588.2,
    nps: 80,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z"
  },

  // Dezembro 2024
  {
    mes_ano: "2024-12",
    unidade: "Centro Médico Principal",
    atendente: "Ana Silva",
    faturamento_total: 42000,
    valor_orcamentos_registrados: 48000,
    valor_orcamentos_convertidos: 38000,
    qtde_exames_vendidos: 115,
    qtde_pacientes_atendidos: 75,
    tkm_exame: 365.2,
    tkm_paciente: 560,
    nps: 83,
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z"
  },
  {
    mes_ano: "2024-12",
    unidade: "Centro Médico Principal",
    atendente: "Carlos Santos",
    faturamento_total: 36000,
    valor_orcamentos_registrados: 42000,
    valor_orcamentos_convertidos: 33000,
    qtde_exames_vendidos: 95,
    qtde_pacientes_atendidos: 65,
    tkm_exame: 378.9,
    tkm_paciente: 553.8,
    nps: 76,
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z"
  },
  {
    mes_ano: "2024-12",
    unidade: "Clínica Norte",
    atendente: "Maria Oliveira",
    faturamento_total: 39000,
    valor_orcamentos_registrados: 37000,
    valor_orcamentos_convertidos: 29000,
    qtde_exames_vendidos: 88,
    qtde_pacientes_atendidos: 62,
    tkm_exame: 443.2,
    tkm_paciente: 629,
    nps: 79,
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z"
  },
  {
    mes_ano: "2024-12",
    unidade: "Unidade Sul",
    atendente: "João Costa",
    faturamento_total: 33000,
    valor_orcamentos_registrados: 33000,
    valor_orcamentos_convertidos: 26000,
    qtde_exames_vendidos: 80,
    qtde_pacientes_atendidos: 55,
    tkm_exame: 412.5,
    tkm_paciente: 600,
    nps: 72,
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z"
  },
  {
    mes_ano: "2024-12",
    unidade: "Clínica Norte",
    atendente: "Patricia Lima",
    faturamento_total: 37000,
    valor_orcamentos_registrados: 35000,
    valor_orcamentos_convertidos: 27000,
    qtde_exames_vendidos: 90,
    qtde_pacientes_atendidos: 63,
    tkm_exame: 411.1,
    tkm_paciente: 587.3,
    nps: 77,
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z"
  },

  // Novembro 2024
  {
    mes_ano: "2024-11",
    unidade: "Centro Médico Principal",
    atendente: "Ana Silva",
    faturamento_total: 40000,
    valor_orcamentos_registrados: 46000,
    valor_orcamentos_convertidos: 36000,
    qtde_exames_vendidos: 110,
    qtde_pacientes_atendidos: 72,
    tkm_exame: 363.6,
    tkm_paciente: 555.6,
    nps: 81,
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z"
  },
  {
    mes_ano: "2024-11",
    unidade: "Centro Médico Principal",
    atendente: "Carlos Santos",
    faturamento_total: 34000,
    valor_orcamentos_registrados: 40000,
    valor_orcamentos_convertidos: 31000,
    qtde_exames_vendidos: 92,
    qtde_pacientes_atendidos: 62,
    tkm_exame: 369.6,
    tkm_paciente: 548.4,
    nps: 74,
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z"
  },
  {
    mes_ano: "2024-11",
    unidade: "Clínica Norte",
    atendente: "Maria Oliveira",
    faturamento_total: 37000,
    valor_orcamentos_registrados: 35000,
    valor_orcamentos_convertidos: 27000,
    qtde_exames_vendidos: 85,
    qtde_pacientes_atendidos: 58,
    tkm_exame: 435.3,
    tkm_paciente: 637.9,
    nps: 78,
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z"
  },
  {
    mes_ano: "2024-11",
    unidade: "Unidade Sul",
    atendente: "João Costa",
    faturamento_total: 31000,
    valor_orcamentos_registrados: 31000,
    valor_orcamentos_convertidos: 24000,
    qtde_exames_vendidos: 75,
    qtde_pacientes_atendidos: 52,
    tkm_exame: 413.3,
    tkm_paciente: 596.2,
    nps: 70,
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z"
  }
];

export const getAvailableOptions = () => {
  const periodos = [...new Set(sampleData.map(item => item.mes_ano))].sort().reverse();
  const unidades = [...new Set(sampleData.map(item => item.unidade))].sort();
  const atendentes = [...new Set(sampleData.map(item => item.atendente))].sort();

  return { periodos, unidades, atendentes };
};