/*
  # Inserção do administrador padrão

  1. Dados Iniciais
    - Administrador padrão com email admin@dashboard.com
    - Super administrador com todas as permissões
    - Usuário aprovado automaticamente

  2. Configuração
    - Permite login imediato do administrador
    - Configuração inicial do sistema
*/

-- Inserir administrador padrão
INSERT INTO admin_users (email, is_super_admin) 
VALUES ('admin@dashboard.com', true)
ON CONFLICT (email) DO NOTHING;

-- Aprovar administrador padrão
INSERT INTO approved_users (email, approved, approved_at, registered) 
VALUES ('admin@dashboard.com', true, now(), false)
ON CONFLICT (email) DO NOTHING;