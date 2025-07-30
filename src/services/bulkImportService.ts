interface BulkDataRequest {
  unidades?: Array<{
    nome: string;
    codigo: string;
    ativo?: boolean;
  }>;
  atendentes?: Array<{
    nome: string;
    email: string;
    unidade_codigo: string;
    ativo?: boolean;
    data_admissao?: string;
  }>;
  metricas_atendentes?: Array<{
    mes_ano: string;
    unidade_codigo: string;
    atendente_email: string;
    valor_orcamentos_registrados: number;
    valor_orcamentos_convertidos: number;
    qtde_exames_vendidos: number;
    qtde_pacientes_atendidos: number;
    nps: number;
  }>;
  metricas_unidades?: Array<{
    mes_ano: string;
    unidade_codigo: string;
    faturamento_total: number;
  }>;
}

interface BulkImportResult {
  success: boolean;
  message: string;
  results: {
    unidades: { success: number; errors: string[] };
    atendentes: { success: number; errors: string[] };
    metricas_atendentes: { success: number; errors: string[] };
    metricas_unidades: { success: number; errors: string[] };
  };
}

export class BulkImportService {
  static async importBulkData(data: BulkDataRequest): Promise<BulkImportResult> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulk-data-import`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro na importação em massa:', error);
      throw new Error(`Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  static generateSampleData(): BulkDataRequest {
    return {
      unidades: [
        { nome: "Centro Médico Principal", codigo: "CMP001", ativo: true },
        { nome: "Clínica Norte", codigo: "CLN002", ativo: true },
        { nome: "Unidade Sul", codigo: "UNS003", ativo: true }
      ],
      atendentes: [
        { nome: "Ana Silva", email: "ana.silva@clinica.com", unidade_codigo: "CMP001", ativo: true },
        { nome: "Carlos Santos", email: "carlos.santos@clinica.com", unidade_codigo: "CMP001", ativo: true },
        { nome: "Maria Oliveira", email: "maria.oliveira@clinica.com", unidade_codigo: "CLN002", ativo: true },
        { nome: "João Costa", email: "joao.costa@clinica.com", unidade_codigo: "UNS003", ativo: true }
      ],
      metricas_unidades: [
        { mes_ano: "2025-01", unidade_codigo: "CMP001", faturamento_total: 150000 },
        { mes_ano: "2025-01", unidade_codigo: "CLN002", faturamento_total: 120000 },
        { mes_ano: "2025-01", unidade_codigo: "UNS003", faturamento_total: 100000 },
        { mes_ano: "2024-12", unidade_codigo: "CMP001", faturamento_total: 140000 },
        { mes_ano: "2024-12", unidade_codigo: "CLN002", faturamento_total: 110000 },
        { mes_ano: "2024-12", unidade_codigo: "UNS003", faturamento_total: 95000 }
      ],
      metricas_atendentes: [
        {
          mes_ano: "2025-01",
          unidade_codigo: "CMP001",
          atendente_email: "ana.silva@clinica.com",
          valor_orcamentos_registrados: 50000,
          valor_orcamentos_convertidos: 40000,
          qtde_exames_vendidos: 120,
          qtde_pacientes_atendidos: 80,
          nps: 85
        },
        {
          mes_ano: "2025-01",
          unidade_codigo: "CMP001",
          atendente_email: "carlos.santos@clinica.com",
          valor_orcamentos_registrados: 45000,
          valor_orcamentos_convertidos: 35000,
          qtde_exames_vendidos: 100,
          qtde_pacientes_atendidos: 70,
          nps: 78
        },
        {
          mes_ano: "2025-01",
          unidade_codigo: "CLN002",
          atendente_email: "maria.oliveira@clinica.com",
          valor_orcamentos_registrados: 40000,
          valor_orcamentos_convertidos: 32000,
          qtde_exames_vendidos: 90,
          qtde_pacientes_atendidos: 65,
          nps: 82
        },
        {
          mes_ano: "2025-01",
          unidade_codigo: "UNS003",
          atendente_email: "joao.costa@clinica.com",
          valor_orcamentos_registrados: 35000,
          valor_orcamentos_convertidos: 28000,
          qtde_exames_vendidos: 85,
          qtde_pacientes_atendidos: 60,
          nps: 75
        }
      ]
    };
  }

  static validateData(data: BulkDataRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar unidades
    if (data.unidades) {
      data.unidades.forEach((unidade, index) => {
        if (!unidade.nome?.trim()) {
          errors.push(`Unidade ${index + 1}: Nome é obrigatório`);
        }
        if (!unidade.codigo?.trim()) {
          errors.push(`Unidade ${index + 1}: Código é obrigatório`);
        }
      });
    }

    // Validar atendentes
    if (data.atendentes) {
      data.atendentes.forEach((atendente, index) => {
        if (!atendente.nome?.trim()) {
          errors.push(`Atendente ${index + 1}: Nome é obrigatório`);
        }
        if (!atendente.email?.trim() || !atendente.email.includes('@')) {
          errors.push(`Atendente ${index + 1}: Email válido é obrigatório`);
        }
        if (!atendente.unidade_codigo?.trim()) {
          errors.push(`Atendente ${index + 1}: Código da unidade é obrigatório`);
        }
      });
    }

    // Validar métricas de atendentes
    if (data.metricas_atendentes) {
      data.metricas_atendentes.forEach((metrica, index) => {
        if (!metrica.mes_ano?.match(/^\d{4}-\d{2}$/)) {
          errors.push(`Métrica Atendente ${index + 1}: Formato de mês/ano inválido (use YYYY-MM)`);
        }
        if (!metrica.unidade_codigo?.trim()) {
          errors.push(`Métrica Atendente ${index + 1}: Código da unidade é obrigatório`);
        }
        if (!metrica.atendente_email?.trim()) {
          errors.push(`Métrica Atendente ${index + 1}: Email do atendente é obrigatório`);
        }
        if (metrica.valor_orcamentos_registrados < 0) {
          errors.push(`Métrica Atendente ${index + 1}: Valor de orçamentos registrados deve ser positivo`);
        }
      });
    }

    // Validar métricas de unidades
    if (data.metricas_unidades) {
      data.metricas_unidades.forEach((metrica, index) => {
        if (!metrica.mes_ano?.match(/^\d{4}-\d{2}$/)) {
          errors.push(`Métrica Unidade ${index + 1}: Formato de mês/ano inválido (use YYYY-MM)`);
        }
        if (!metrica.unidade_codigo?.trim()) {
          errors.push(`Métrica Unidade ${index + 1}: Código da unidade é obrigatório`);
        }
        if (metrica.faturamento_total < 0) {
          errors.push(`Métrica Unidade ${index + 1}: Faturamento deve ser positivo`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }
}