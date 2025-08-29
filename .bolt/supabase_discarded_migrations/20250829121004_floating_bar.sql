/*
  # Criação das tabelas base do sistema

  1. Novas Tabelas
    - `unidades` - Unidades de atendimento
      - `id` (uuid, primary key)
      - `nome` (text, nome da unidade)
      - `codigo` (text, código único)
      - `ativo` (boolean, status ativo/inativo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `atendentes` - Atendentes por unidade
      - `id` (uuid, primary key)
      - `nome` (text, nome completo)
      - `email` (text, email único)
      - `unidade_id` (uuid, referência para unidades)
      - `ativo` (boolean, status ativo/inativo)
      - `data_admissao` (date, data de admissão)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Índices
    - Índices para otimizar consultas por status ativo
    - Índices únicos para códigos e emails

  3. Segurança
    - Enable RLS em todas as tabelas
    - Políticas permissivas para acesso público (desenvolvimento)
*/

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela de unidades
CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text UNIQUE NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para unidades
CREATE INDEX IF NOT EXISTS idx_unidades_ativo ON unidades(ativo);

-- Trigger para updated_at em unidades
CREATE TRIGGER update_unidades_updated_at
  BEFORE UPDATE ON unidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de atendentes
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

-- Índices para atendentes
CREATE INDEX IF NOT EXISTS idx_atendentes_unidade ON atendentes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_atendentes_ativo ON atendentes(ativo);

-- Trigger para updated_at em atendentes
CREATE TRIGGER update_atendentes_updated_at
  BEFORE UPDATE ON atendentes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendentes ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento
CREATE POLICY "Permitir todas operações em unidades"
  ON unidades
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir todas operações em atendentes"
  ON atendentes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);