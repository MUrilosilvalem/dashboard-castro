/*
  # Criação das tabelas para Dashboard de Atendentes

  1. Novas Tabelas
    - `unidades`
      - `id` (uuid, primary key)
      - `nome` (text, nome da unidade)
      - `codigo` (text, código único da unidade)
      - `ativo` (boolean, se a unidade está ativa)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `atendentes`
      - `id` (uuid, primary key)
      - `nome` (text, nome completo do atendente)
      - `email` (text, email do atendente)
      - `unidade_id` (uuid, referência à unidade)
      - `ativo` (boolean, se o atendente está ativo)
      - `data_admissao` (date, data de admissão)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `metricas_atendentes`
      - `id` (uuid, primary key)
      - `mes_ano` (text, formato "YYYY-MM")
      - `unidade_id` (uuid, referência à unidade)
      - `atendente_id` (uuid, referência ao atendente)
      - `faturamento_total` (numeric, faturamento total do mês)
      - `valor_orcamentos_registrados` (numeric, valor total de orçamentos registrados)
      - `valor_orcamentos_convertidos` (numeric, valor total de orçamentos convertidos)
      - `qtde_exames_vendidos` (integer, quantidade de exames vendidos)
      - `tkm_paciente` (numeric, ticket médio por paciente)
      - `nps` (numeric, Net Promoter Score)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. View Agregada
    - `vw_atendentes_aggregado` - View que replica a estrutura mencionada no contexto

  3. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados lerem e modificarem dados
    - Índices para otimização de consultas

  4. Dados de Exemplo
    - Inserção de dados de exemplo para demonstração
*/

-- Criar tabela de unidades
CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text UNIQUE NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de atendentes
CREATE TABLE IF NOT EXISTS atendentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  data_admissao date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de métricas dos atendentes
CREATE TABLE IF NOT EXISTS metricas_atendentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_ano text NOT NULL,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  atendente_id uuid REFERENCES atendentes(id) ON DELETE CASCADE,
  faturamento_total numeric DEFAULT 0,
  valor_orcamentos_registrados numeric DEFAULT 0,
  valor_orcamentos_convertidos numeric DEFAULT 0,
  qtde_exames_vendidos integer DEFAULT 0,
  tkm_paciente numeric DEFAULT 0,
  nps numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mes_ano, unidade_id, atendente_id)
);

-- Criar view agregada (vw_atendentes_aggregado)
CREATE OR REPLACE VIEW vw_atendentes_aggregado AS
SELECT 
  ma.mes_ano,
  u.nome as unidade,
  a.nome as atendente,
  ma.faturamento_total,
  ma.valor_orcamentos_registrados,
  ma.valor_orcamentos_convertidos,
  ma.qtde_exames_vendidos,
  ma.tkm_paciente,
  ma.nps,
  ma.created_at,
  ma.updated_at
FROM metricas_atendentes ma
JOIN unidades u ON ma.unidade_id = u.id
JOIN atendentes a ON ma.atendente_id = a.id
WHERE u.ativo = true AND a.ativo = true
ORDER BY ma.mes_ano DESC, u.nome, a.nome;

-- Habilitar RLS
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_atendentes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para unidades
CREATE POLICY "Usuários autenticados podem ler unidades"
  ON unidades
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir unidades"
  ON unidades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar unidades"
  ON unidades
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas de segurança para atendentes
CREATE POLICY "Usuários autenticados podem ler atendentes"
  ON atendentes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir atendentes"
  ON atendentes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar atendentes"
  ON atendentes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas de segurança para métricas
CREATE POLICY "Usuários autenticados podem ler métricas"
  ON metricas_atendentes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir métricas"
  ON metricas_atendentes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar métricas"
  ON metricas_atendentes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_metricas_mes_ano ON metricas_atendentes(mes_ano);
CREATE INDEX IF NOT EXISTS idx_metricas_unidade ON metricas_atendentes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_metricas_atendente ON metricas_atendentes(atendente_id);
CREATE INDEX IF NOT EXISTS idx_atendentes_unidade ON atendentes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidades_ativo ON unidades(ativo);
CREATE INDEX IF NOT EXISTS idx_atendentes_ativo ON atendentes(ativo);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_unidades_updated_at 
  BEFORE UPDATE ON unidades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atendentes_updated_at 
  BEFORE UPDATE ON atendentes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metricas_updated_at 
  BEFORE UPDATE ON metricas_atendentes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();