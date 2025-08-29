/*
  # Sistema de administração e aprovação de usuários

  1. Novas Tabelas
    - `admin_users` - Usuários administradores
      - `id` (uuid, primary key)
      - `email` (text, email único)
      - `is_super_admin` (boolean, super administrador)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `pending_users` - Usuários aguardando aprovação
      - `id` (uuid, primary key)
      - `email` (text, email único)
      - `status` (text, pending/approved/rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `approved_users` - Usuários aprovados para registro
      - `id` (uuid, primary key)
      - `email` (text, email único)
      - `approved` (boolean, status de aprovação)
      - `approved_at` (timestamp, data de aprovação)
      - `registered` (boolean, se já criou conta)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Índices
    - Índices para consultas por email e status
    - Índices para administradores

  3. Segurança
    - Enable RLS em todas as tabelas
    - Políticas para controle de acesso
*/

-- Tabela de usuários administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_super_admin ON admin_users(is_super_admin);

-- Função específica para trigger de admin_users
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at em admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Tabela de usuários pendentes
CREATE TABLE IF NOT EXISTS pending_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para pending_users
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_status ON pending_users(status);

-- Trigger para updated_at em pending_users
CREATE TRIGGER update_pending_users_updated_at
  BEFORE UPDATE ON pending_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabela de usuários aprovados
CREATE TABLE IF NOT EXISTS approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved boolean DEFAULT true,
  approved_at timestamptz DEFAULT now(),
  registered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para approved_users
CREATE INDEX IF NOT EXISTS idx_approved_users_email ON approved_users(email);
CREATE INDEX IF NOT EXISTS idx_approved_users_approved ON approved_users(approved);

-- Trigger para updated_at em approved_users
CREATE TRIGGER update_approved_users_updated_at
  BEFORE UPDATE ON approved_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_users
CREATE POLICY "Allow public read for admin verification"
  ON admin_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage admins"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (email = email() OR EXISTS (SELECT 1 FROM users WHERE users.email::text = email()))
  WITH CHECK (email = email() OR EXISTS (SELECT 1 FROM users WHERE users.email::text = email()));

-- Políticas para pending_users
CREATE POLICY "Permitir leitura de usuários pendentes"
  ON pending_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir inserção de usuários pendentes"
  ON pending_users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de usuários pendentes"
  ON pending_users
  FOR UPDATE
  TO public
  USING (true);

-- Políticas para approved_users
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