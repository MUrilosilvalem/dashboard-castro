import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BulkDataRequest {
  unidades?: Array<{
    nome: string;
    codigo: string;
    ativo?: boolean;
  }>;
  atendentes?: Array<{
    nome: string;
    email: string;
    unidade_codigo: string;
    ativo?: boolean;
    data_admissao?: string;
  }>;
  metricas_atendentes?: Array<{
    mes_ano: string;
    unidade_codigo: string;
    atendente_email: string;
    valor_orcamentos_registrados: number;
    valor_orcamentos_convertidos: number;
    qtde_exames_vendidos: number;
    qtde_pacientes_atendidos: number;
    nps: number;
  }>;
  metricas_unidades?: Array<{
    mes_ano: string;
    unidade_codigo: string;
    faturamento_total: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { unidades, atendentes, metricas_atendentes, metricas_unidades }: BulkDataRequest = await req.json()
    
    const results = {
      unidades: { success: 0, errors: [] as string[] },
      atendentes: { success: 0, errors: [] as string[] },
      metricas_atendentes: { success: 0, errors: [] as string[] },
      metricas_unidades: { success: 0, errors: [] as string[] }
    }

    // 1. Inserir Unidades
    if (unidades && unidades.length > 0) {
      try {
        const { data, error } = await supabaseClient
          .from('unidades')
          .upsert(
            unidades.map(u => ({
              nome: u.nome,
              codigo: u.codigo,
              ativo: u.ativo ?? true
            })),
            { onConflict: 'codigo' }
          )
          .select()

        if (error) throw error
        results.unidades.success = data?.length || 0
      } catch (error) {
        results.unidades.errors.push(`Erro ao inserir unidades: ${error.message}`)
      }
    }

    // 2. Inserir Atendentes (após unidades)
    if (atendentes && atendentes.length > 0) {
      try {
        // Buscar IDs das unidades pelos códigos
        const unidadeCodigos = [...new Set(atendentes.map(a => a.unidade_codigo))]
        const { data: unidadesData, error: unidadesError } = await supabaseClient
          .from('unidades')
          .select('id, codigo')
          .in('codigo', unidadeCodigos)

        if (unidadesError) throw unidadesError

        const unidadeMap = new Map(unidadesData?.map(u => [u.codigo, u.id]) || [])

        const atendentesData = atendentes
          .filter(a => unidadeMap.has(a.unidade_codigo))
          .map(a => ({
            nome: a.nome,
            email: a.email,
            unidade_id: unidadeMap.get(a.unidade_codigo)!,
            ativo: a.ativo ?? true,
            data_admissao: a.data_admissao || new Date().toISOString().split('T')[0]
          }))

        const { data, error } = await supabaseClient
          .from('atendentes')
          .upsert(atendentesData, { onConflict: 'email' })
          .select()

        if (error) throw error
        results.atendentes.success = data?.length || 0
      } catch (error) {
        results.atendentes.errors.push(`Erro ao inserir atendentes: ${error.message}`)
      }
    }

    // 3. Inserir Métricas de Unidades
    if (metricas_unidades && metricas_unidades.length > 0) {
      try {
        // Buscar IDs das unidades
        const unidadeCodigos = [...new Set(metricas_unidades.map(m => m.unidade_codigo))]
        const { data: unidadesData, error: unidadesError } = await supabaseClient
          .from('unidades')
          .select('id, codigo')
          .in('codigo', unidadeCodigos)

        if (unidadesError) throw unidadesError

        const unidadeMap = new Map(unidadesData?.map(u => [u.codigo, u.id]) || [])

        const metricasData = metricas_unidades
          .filter(m => unidadeMap.has(m.unidade_codigo))
          .map(m => ({
            mes_ano: m.mes_ano,
            unidade_id: unidadeMap.get(m.unidade_codigo)!,
            faturamento_total: m.faturamento_total
          }))

        const { data, error } = await supabaseClient
          .from('metricas_unidades')
          .upsert(metricasData, { onConflict: 'mes_ano,unidade_id' })
          .select()

        if (error) throw error
        results.metricas_unidades.success = data?.length || 0
      } catch (error) {
        results.metricas_unidades.errors.push(`Erro ao inserir métricas de unidades: ${error.message}`)
      }
    }

    // 4. Inserir Métricas de Atendentes
    if (metricas_atendentes && metricas_atendentes.length > 0) {
      try {
        // Buscar IDs das unidades e atendentes
        const unidadeCodigos = [...new Set(metricas_atendentes.map(m => m.unidade_codigo))]
        const atendenteEmails = [...new Set(metricas_atendentes.map(m => m.atendente_email))]

        const [unidadesResult, atendentesResult] = await Promise.all([
          supabaseClient.from('unidades').select('id, codigo').in('codigo', unidadeCodigos),
          supabaseClient.from('atendentes').select('id, email').in('email', atendenteEmails)
        ])

        if (unidadesResult.error) throw unidadesResult.error
        if (atendentesResult.error) throw atendentesResult.error

        const unidadeMap = new Map(unidadesResult.data?.map(u => [u.codigo, u.id]) || [])
        const atendenteMap = new Map(atendentesResult.data?.map(a => [a.email, a.id]) || [])

        const metricasData = metricas_atendentes
          .filter(m => unidadeMap.has(m.unidade_codigo) && atendenteMap.has(m.atendente_email))
          .map(m => ({
            mes_ano: m.mes_ano,
            unidade_id: unidadeMap.get(m.unidade_codigo)!,
            atendente_id: atendenteMap.get(m.atendente_email)!,
            valor_orcamentos_registrados: m.valor_orcamentos_registrados,
            valor_orcamentos_convertidos: m.valor_orcamentos_convertidos,
            qtde_exames_vendidos: m.qtde_exames_vendidos,
            qtde_pacientes_atendidos: m.qtde_pacientes_atendidos,
            nps: m.nps
          }))

        const { data, error } = await supabaseClient
          .from('metricas_atendentes')
          .upsert(metricasData, { onConflict: 'mes_ano,unidade_id,atendente_id' })
          .select()

        if (error) throw error
        results.metricas_atendentes.success = data?.length || 0
      } catch (error) {
        results.metricas_atendentes.errors.push(`Erro ao inserir métricas de atendentes: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Importação concluída',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na importação:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})