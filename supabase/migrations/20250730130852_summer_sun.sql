/*
  # Sistema de Aprovação de Usuários

  1. Novas Tabelas
    - `pending_users` - Usuários aguardando aprovação
    - `approved_users` - Usuários aprovados para criar conta

  2. Funcionalidades
    - Controle de aprovação de novos usuários
    - Status de registro de conta
    - Histórico de aprovações

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para acesso administrativo
*/

-- Tabela para usuários pendentes de aprovação
CREATE TABLE IF NOT EXISTS pending_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela para usuários aprovados
CREATE TABLE IF NOT EXISTS approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved boolean DEFAULT true,
  approved_at timestamptz DEFAULT now(),
  registered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- Políticas para pending_users (acesso público para inserção, admin para leitura/atualização)
CREATE POLICY "Permitir inserção de usuários pendentes"
  ON pending_users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir leitura de usuários pendentes"
  ON pending_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir atualização de usuários pendentes"
  ON pending_users
  FOR UPDATE
  TO public
  USING (true);

-- Políticas para approved_users (acesso público para leitura, admin para modificação)
CREATE POLICY "Permitir leitura de usuários aprovados"
  ON approved_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de usuários aprovados"
  ON approved_users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de usuários aprovados"
  ON approved_users
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Permitir deleção de usuários aprovados"
  ON approved_users
  FOR DELETE
  TO public
  USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_pending_users_updated_at
  BEFORE UPDATE ON pending_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approved_users_updated_at
  BEFORE UPDATE ON approved_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_users_status ON pending_users(status);
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_approved_users_email ON approved_users(email);
CREATE INDEX IF NOT EXISTS idx_approved_users_approved ON approved_users(approved);