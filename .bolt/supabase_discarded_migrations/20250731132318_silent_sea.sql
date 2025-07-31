/*
  # Criação completa do banco de dados

  1. Tabelas principais
    - `unidades` - Unidades de atendimento
    - `atendentes` - Atendentes por unidade
    - `metricas_atendentes` - Métricas de performance dos atendentes
    - `metricas_unidades` - Faturamento por unidade
    - `admin_users` - Usuários administradores
    - `pending_users` - Usuários aguardando aprovação
    - `approved_users` - Usuários aprovados

  2. Funções e triggers
    - Função para atualizar updated_at automaticamente
    - Triggers para todas as tabelas

  3. View agregada
    - `vw_atendentes_aggregado` - View principal para o dashboard

  4. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso configuradas
*/

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função específica para admin_users
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
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

-- Trigger para unidades
DROP TRIGGER IF EXISTS update_unidades_updated_at ON unidades;
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
CREATE INDEX IF NOT EXISTS idx_atendentes_ativo ON atendentes(ativo);
CREATE INDEX IF NOT EXISTS idx_atendentes_unidade ON atendentes(unidade_id);

-- Trigger para atendentes
DROP TRIGGER IF EXISTS update_atendentes_updated_at ON atendentes;
CREATE TRIGGER update_atendentes_updated_at
    BEFORE UPDATE ON atendentes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de métricas de unidades
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

-- Trigger para métricas de unidades
DROP TRIGGER IF EXISTS update_metricas_unidades_updated_at ON metricas_unidades;
CREATE TRIGGER update_metricas_unidades_updated_at
    BEFORE UPDATE ON metricas_unidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela de métricas de atendentes
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

-- Trigger para métricas de atendentes
DROP TRIGGER IF EXISTS update_metricas_updated_at ON metricas_atendentes;
CREATE TRIGGER update_metricas_updated_at
    BEFORE UPDATE ON metricas_atendentes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger para admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
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

-- Trigger para pending_users
DROP TRIGGER IF EXISTS update_pending_users_updated_at ON pending_users;
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

-- Trigger para approved_users
DROP TRIGGER IF EXISTS update_approved_users_updated_at ON approved_users;
CREATE TRIGGER update_approved_users_updated_at
    BEFORE UPDATE ON approved_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View agregada principal
CREATE OR REPLACE VIEW vw_atendentes_aggregado AS
SELECT 
    ma.mes_ano,
    u.nome as unidade,
    a.nome as atendente,
    ma.faturamento_total,
    ma.valor_orcamentos_registrados,
    ma.valor_orcamentos_convertidos,
    ma.qtde_exames_vendidos,
    ma.qtde_pacientes_atendidos,
    CASE 
        WHEN ma.qtde_exames_vendidos > 0 
        THEN ma.faturamento_total / ma.qtde_exames_vendidos 
        ELSE 0 
    END as tkm_exame,
    ma.tkm_paciente,
    ma.nps,
    ma.created_at,
    ma.updated_at
FROM metricas_atendentes ma
JOIN unidades u ON ma.unidade_id = u.id
JOIN atendentes a ON ma.atendente_id = a.id
WHERE u.ativo = true AND a.ativo = true;

-- Habilitar RLS em todas as tabelas
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;

-- Políticas para unidades
DROP POLICY IF EXISTS "Permitir todas operações em unidades" ON unidades;
CREATE POLICY "Permitir todas operações em unidades"
    ON unidades FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Políticas para atendentes
DROP POLICY IF EXISTS "Permitir todas operações em atendentes" ON atendentes;
CREATE POLICY "Permitir todas operações em atendentes"
    ON atendentes FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Políticas para métricas de unidades
DROP POLICY IF EXISTS "Permitir todas operações em métricas de unidades" ON metricas_unidades;
CREATE POLICY "Permitir todas operações em métricas de unidades"
    ON metricas_unidades FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Políticas para métricas de atendentes
DROP POLICY IF EXISTS "Permitir todas operações em métricas" ON metricas_atendentes;
CREATE POLICY "Permitir todas operações em métricas"
    ON metricas_atendentes FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Políticas para admin_users
DROP POLICY IF EXISTS "Allow public read for admin verification" ON admin_users;
CREATE POLICY "Allow public read for admin verification"
    ON admin_users FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Only authenticated users can manage admins" ON admin_users;
CREATE POLICY "Only authenticated users can manage admins"
    ON admin_users FOR ALL
    TO authenticated
    USING ((email = email()) OR (EXISTS (SELECT 1 FROM users WHERE users.email::text = email())))
    WITH CHECK ((email = email()) OR (EXISTS (SELECT 1 FROM users WHERE users.email::text = email())));

-- Políticas para pending_users
DROP POLICY IF EXISTS "Permitir inserção de usuários pendentes" ON pending_users;
CREATE POLICY "Permitir inserção de usuários pendentes"
    ON pending_users FOR INSERT
    TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de usuários pendentes" ON pending_users;
CREATE POLICY "Permitir leitura de usuários pendentes"
    ON pending_users FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Permitir atualização de usuários pendentes" ON pending_users;
CREATE POLICY "Permitir atualização de usuários pendentes"
    ON pending_users FOR UPDATE
    TO public
    USING (true);

-- Políticas para approved_users
DROP POLICY IF EXISTS "Permitir inserção de usuários aprovados" ON approved_users;
CREATE POLICY "Permitir inserção de usuários aprovados"
    ON approved_users FOR INSERT
    TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de usuários aprovados" ON approved_users;
CREATE POLICY "Permitir leitura de usuários aprovados"
    ON approved_users FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Permitir atualização de usuários aprovados" ON approved_users;
CREATE POLICY "Permitir atualização de usuários aprovados"
    ON approved_users FOR UPDATE
    TO public
    USING (true);

DROP POLICY IF EXISTS "Permitir deleção de usuários aprovados" ON approved_users;
CREATE POLICY "Permitir deleção de usuários aprovados"
    ON approved_users FOR DELETE
    TO public
    USING (true);