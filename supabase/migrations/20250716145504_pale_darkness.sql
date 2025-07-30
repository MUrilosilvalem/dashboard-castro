/*
  # Atualizar estrutura das métricas

  1. Alterações na tabela metricas_atendentes
    - Adicionar coluna `qtde_pacientes_atendidos`
    - Remover coluna `faturamento_total` (será calculado por unidade)
    - Remover coluna `tkm_paciente` (será calculado automaticamente)
    - Adicionar coluna `tkm_exame` calculado automaticamente

  2. Nova tabela metricas_unidades
    - `faturamento_total` por unidade/mês
    - Agregação dos dados dos atendentes

  3. Atualizar view agregada
    - Incluir novos campos
    - Calcular TKMs automaticamente

  4. Funções para cálculos automáticos
    - TKM Exame = Orçamentos Convertidos / Qtde Exames
    - TKM Paciente = Orçamentos Convertidos / Qtde Pacientes
*/

-- Adicionar nova coluna para quantidade de pacientes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'metricas_atendentes' AND column_name = 'qtde_pacientes_atendidos'
  ) THEN
    ALTER TABLE metricas_atendentes ADD COLUMN qtde_pacientes_atendidos integer DEFAULT 0;
  END IF;
END $$;

-- Criar tabela para métricas por unidade
CREATE TABLE IF NOT EXISTS metricas_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_ano text NOT NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  faturamento_total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mes_ano, unidade_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE metricas_unidades ENABLE ROW LEVEL SECURITY;

-- Política para métricas de unidades
CREATE POLICY "Permitir todas operações em métricas de unidades"
  ON metricas_unidades
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at na nova tabela
CREATE TRIGGER update_metricas_unidades_updated_at
  BEFORE UPDATE ON metricas_unidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metricas_unidades_mes_ano ON metricas_unidades(mes_ano);
CREATE INDEX IF NOT EXISTS idx_metricas_unidades_unidade ON metricas_unidades(unidade_id);

-- Atualizar view agregada com novos campos e cálculos
DROP VIEW IF EXISTS vw_atendentes_aggregado;

CREATE VIEW vw_atendentes_aggregado AS
SELECT 
  ma.mes_ano,
  u.nome as unidade,
  a.nome as atendente,
  COALESCE(mu.faturamento_total, 0) as faturamento_total,
  ma.valor_orcamentos_registrados,
  ma.valor_orcamentos_convertidos,
  ma.qtde_exames_vendidos,
  ma.qtde_pacientes_atendidos,
  -- TKM Exame = Orçamentos Convertidos / Qtde Exames
  CASE 
    WHEN ma.qtde_exames_vendidos > 0 
    THEN ma.valor_orcamentos_convertidos / ma.qtde_exames_vendidos 
    ELSE 0 
  END as tkm_exame,
  -- TKM Paciente = Orçamentos Convertidos / Qtde Pacientes
  CASE 
    WHEN ma.qtde_pacientes_atendidos > 0 
    THEN ma.valor_orcamentos_convertidos / ma.qtde_pacientes_atendidos 
    ELSE 0 
  END as tkm_paciente,
  ma.nps,
  ma.created_at,
  ma.updated_at
FROM metricas_atendentes ma
JOIN atendentes a ON ma.atendente_id = a.id
JOIN unidades u ON ma.unidade_id = u.id
LEFT JOIN metricas_unidades mu ON ma.mes_ano = mu.mes_ano AND ma.unidade_id = mu.unidade_id
WHERE a.ativo = true AND u.ativo = true;