/*
  # Criação da view agregada para o dashboard

  1. Nova View
    - `vw_atendentes_aggregado` - View que combina dados de todas as tabelas
      - Dados dos atendentes com suas unidades
      - Métricas de performance
      - Cálculos automáticos (TKM por exame)
      - Dados formatados para o dashboard

  2. Funcionalidades
    - JOIN entre todas as tabelas relacionadas
    - Cálculos automáticos de TKM
    - Dados prontos para consumo pelo frontend
*/

-- View agregada para o dashboard
CREATE OR REPLACE VIEW vw_atendentes_aggregado AS
SELECT 
  ma.mes_ano,
  u.nome as unidade,
  a.nome as atendente,
  COALESCE(mu.faturamento_total, ma.faturamento_total, 0) as faturamento_total,
  ma.valor_orcamentos_registrados,
  ma.valor_orcamentos_convertidos,
  ma.qtde_exames_vendidos,
  ma.qtde_pacientes_atendidos,
  -- Calcular TKM por exame
  CASE 
    WHEN ma.qtde_exames_vendidos > 0 
    THEN COALESCE(mu.faturamento_total, ma.faturamento_total, 0) / ma.qtde_exames_vendidos 
    ELSE 0 
  END as tkm_exame,
  -- TKM por paciente (usar o valor direto ou calcular)
  CASE 
    WHEN ma.tkm_paciente > 0 THEN ma.tkm_paciente
    WHEN ma.qtde_pacientes_atendidos > 0 
    THEN COALESCE(mu.faturamento_total, ma.faturamento_total, 0) / ma.qtde_pacientes_atendidos 
    ELSE 0 
  END as tkm_paciente,
  ma.nps,
  ma.created_at,
  ma.updated_at
FROM metricas_atendentes ma
JOIN atendentes a ON ma.atendente_id = a.id
JOIN unidades u ON ma.unidade_id = u.id
LEFT JOIN metricas_unidades mu ON ma.mes_ano = mu.mes_ano AND ma.unidade_id = mu.unidade_id
WHERE a.ativo = true AND u.ativo = true
ORDER BY ma.mes_ano DESC, u.nome, a.nome;