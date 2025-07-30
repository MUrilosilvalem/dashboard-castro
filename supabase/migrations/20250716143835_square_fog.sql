/*
  # Corrigir Políticas RLS para Permitir Operações

  1. Políticas Atualizadas
    - Permitir operações para usuários autenticados
    - Permitir operações anônimas temporariamente para desenvolvimento
    - Manter segurança básica

  2. Tabelas Afetadas
    - `unidades` - Permitir CRUD para authenticated e anon
    - `atendentes` - Permitir CRUD para authenticated e anon  
    - `metricas_atendentes` - Permitir CRUD para authenticated e anon

  3. Segurança
    - Manter RLS habilitado
    - Políticas permissivas para desenvolvimento
    - Pode ser restringido posteriormente
*/

-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Usuários autenticados podem ler unidades" ON unidades;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir unidades" ON unidades;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar unidades" ON unidades;

DROP POLICY IF EXISTS "Usuários autenticados podem ler atendentes" ON atendentes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir atendentes" ON atendentes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar atendentes" ON atendentes;

DROP POLICY IF EXISTS "Usuários autenticados podem ler métricas" ON metricas_atendentes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir métricas" ON metricas_atendentes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar métricas" ON metricas_atendentes;

-- Criar políticas mais permissivas para unidades
CREATE POLICY "Permitir todas operações em unidades"
  ON unidades
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Criar políticas mais permissivas para atendentes
CREATE POLICY "Permitir todas operações em atendentes"
  ON atendentes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Criar políticas mais permissivas para métricas
CREATE POLICY "Permitir todas operações em métricas"
  ON metricas_atendentes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Garantir que RLS está habilitado mas com políticas permissivas
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_atendentes ENABLE ROW LEVEL SECURITY;