/*
  # Criar usuário administrador padrão

  1. Tabela de Administradores
    - `admin_users` - Lista de emails com privilégios administrativos
    - Permite múltiplos admins
    - RLS habilitado para segurança

  2. Usuário Admin Padrão
    - Email: admin@dashboard.com
    - Pré-aprovado no sistema
    - Pode gerenciar outros usuários

  3. Segurança
    - RLS em todas as tabelas
    - Políticas específicas para admins
*/

-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_users
CREATE POLICY "Admins podem ver todos os admins"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Super admins podem gerenciar admins"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_super_admin = true
    )
  );

-- Inserir usuário administrador padrão
INSERT INTO admin_users (email, is_super_admin) 
VALUES ('admin@dashboard.com', true)
ON CONFLICT (email) DO NOTHING;

-- Aprovar automaticamente o admin padrão
INSERT INTO approved_users (email, approved, approved_at, registered) 
VALUES ('admin@dashboard.com', true, now(), false)
ON CONFLICT (email) DO UPDATE SET
  approved = true,
  approved_at = COALESCE(approved_users.approved_at, now());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_super_admin ON admin_users(is_super_admin);