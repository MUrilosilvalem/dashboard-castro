/*
  # Criação das tabelas de métricas

  1. Novas Tabelas
    - `metricas_unidades` - Métricas mensais por unidade
      - `id` (uuid, primary key)
      - `mes_ano` (text, formato YYYY-MM)
      - `unidade_id` (uuid, referência para unidades)
      - `faturamento_total` (numeric, faturamento da unidade)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `metricas_atendentes` - Métricas mensais por atendente
      - `id` (uuid, primary key)
      - `mes_ano` (text, formato YYYY-MM)
      - `unidade_id` (uuid, referência para unidades)
      - `atendente_id` (uuid, referência para atendentes)
      - `faturamento_total` (numeric, faturamento individual)
      - `valor_orcamentos_registrados` (numeric)
      - `valor_orcamentos_convertidos` (numeric)
      - `qtde_exames_vendidos` (integer)
      - `qtde_pacientes_atendidos` (integer)
      - `tkm_paciente` (numeric, calculado)
      - `nps` (numeric, nota de satisfação)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Índices
    - Índices compostos para consultas por período e unidade
    - Índices únicos para evitar duplicatas

  3. Segurança
    - Enable RLS em todas as tabelas
    - Políticas permissivas para acesso público
*/

-- Tabela de métricas por unidade
CREATE TABLE IF NOT EXISTS metricas_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_ano text NOT NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  faturamento_total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mes_ano, unidade_id)
);

-- Índices para métricas de unidades
CREATE INDEX IF NOT EXISTS idx_metricas_unidades_mes_ano ON metricas_unidades(mes_ano);
CREATE INDEX IF NOT EXISTS idx_metricas_unidades_unidade ON metricas_unidades(unidade_id);

-- Trigger para updated_at em métricas de unidades
CREATE TRIGGER update_metricas_unidades_updated_at
  BEFORE UPDATE ON metricas_unidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de métricas por atendente
CREATE TABLE IF NOT EXISTS metricas_atendentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_ano text NOT NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  atendente_id uuid REFERENCES atendentes(id) ON DELETE CASCADE,
  faturamento_total numeric DEFAULT 0,
  valor_orcamentos_registrados numeric DEFAULT 0,
  valor_orcamentos_convertidos numeric DEFAULT 0,
  qtde_exames_vendidos integer DEFAULT 0,
  qtde_pacientes_atendidos integer DEFAULT 0,
  tkm_paciente numeric DEFAULT 0,
  nps numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mes_ano, unidade_id, atendente_id)
);

-- Índices para métricas de atendentes
CREATE INDEX IF NOT EXISTS idx_metricas_mes_ano ON metricas_atendentes(mes_ano);
CREATE INDEX IF NOT EXISTS idx_metricas_unidade ON metricas_atendentes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_metricas_atendente ON metricas_atendentes(atendente_id);

-- Trigger para updated_at em métricas de atendentes
CREATE TRIGGER update_metricas_updated_at
  BEFORE UPDATE ON metricas_atendentes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE metricas_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_atendentes ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Permitir todas operações em métricas de unidades"
  ON metricas_unidades
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todas operações em métricas"
  ON metricas_atendentes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);