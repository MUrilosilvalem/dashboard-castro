import React from 'react';
import { BarChart3, FileText, Receipt, Stethoscope, Download, AlertCircle, Loader2, Settings, Building2, Users, User, Lock } from 'lucide-react';
import LoginModal from './components/LoginModal';
import FilterPanel from './components/FilterPanel';
import KPICard from './components/KPICard';
import FaturamentoChart from './components/FaturamentoChart';
import TKMChart from './components/TKMChart';
import NPSTable from './components/NPSTable';
import ConversionChart from './components/ConversionChart';
import MetricsComparison from './components/MetricsComparison';
import ExportButton from './components/ExportButton';
import TopPerformers from './components/TopPerformers';
import AdminPanel from './components/AdminPanel';
import { useDashboardData } from './hooks/useDashboardData';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';

function App() {
  const {
    user,
    loading: authInitialLoading,
    authLoading: loginLoading,
    error: authError,
    login,
    register,
    logout,
    loginAnonymously,
    isAuthenticated,
    isAnonymous,
    isAdmin,
    isSuperAdmin
  } = useAuth();
  
  const [showAdmin, setShowAdmin] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  
  const {
    filteredData,
    previousData,
    filters,
    setFilters,
    availableOptions,
    kpiData,
    showAtendentesFilter,
    setShowAtendentesFilter,
    loading: dashboardLoading,
    error: dashboardError
  } = useDashboardData();

  // Mostrar loading de autenticação
  if (authInitialLoading) {
    console.log('Mostrando tela de loading de autenticação');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Handlers de autenticação
  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials);
      setShowLoginModal(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleRegister = async (credentials: { email: string; password: string }) => {
    try {
      await register(credentials);
      setShowLoginModal(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleAnonymousAccess = () => {
    loginAnonymously();
    setShowLoginModal(false);
  };

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError && !dashboardError.includes('Missing Supabase')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{dashboardError}</p>
          <p className="text-sm text-gray-500 mb-4">
            Verifique se o Supabase está configurado corretamente.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Se não há dados ou Supabase não configurado, mostrar tela de setup
  if (!isAuthenticated && !authInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Interativo de Atendentes</h1>
                  <p className="text-sm text-gray-600">Análise de performance e métricas de vendas</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Status de autenticação */}
                {!isAuthenticated && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-red-800 font-medium">
                      🔒 LOGIN OBRIGATÓRIO
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Faça login para acessar os dados
                    </p>
                  </div>
                )}
                
                {!isSupabaseConfigured && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-yellow-800 font-medium">
                      📊 MODO DEMONSTRAÇÃO
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Configure Supabase para dados reais
                    </p>
                  </div>
                )}
                
                {isSupabaseConfigured && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ SUPABASE CONECTADO
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Dados em tempo real
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <Lock className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acesso Restrito
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Para visualizar os dados do dashboard, você precisa estar autenticado. 
                Faça login ou crie uma conta para continuar.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <User className="w-5 h-5" />
                  Fazer Login
                </button>
                
                <p className="text-sm text-gray-500">
                  Não tem conta? Clique em "Fazer Login" e depois em "Criar Conta"
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de Login */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loginLoading}
          error={authError}
        />
      </div>
    );
  }

  // Se não há dados, mostrar tela de configuração
  if (isAuthenticated && filteredData.length === 0 && !dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Interativo de Atendentes</h1>
                  <p className="text-sm text-gray-600">Análise de performance e métricas de vendas</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isAuthenticated && !isAnonymous && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-green-800 font-medium">
                      <span className="text-sm text-green-800 font-medium flex items-center gap-1">
                        {isSuperAdmin ? '👑' : isAdmin ? '🛡️' : '👤'} 
                        {user?.email?.split('@')[0]}
                        {isSuperAdmin && <span className="text-xs">(Super Admin)</span>}
                        {isAdmin && !isSuperAdmin && <span className="text-xs">(Admin)</span>}
                      </span>
                    </p>
                    <button
                      onClick={logout}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Sair
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => setShowAdmin(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard Pronto para Usar!
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Seu dashboard está configurado e pronto. Para começar a visualizar os dados, 
                você precisa alimentar as informações através do painel administrativo.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Cadastre Unidades</h3>
                  <p className="text-sm text-gray-600">Adicione suas unidades de atendimento</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Adicione Atendentes</h3>
                  <p className="text-sm text-gray-600">Cadastre os atendentes por unidade</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Insira Métricas</h3>
                  <p className="text-sm text-gray-600">Adicione dados de performance mensais</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowAdmin(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Settings className="w-5 h-5" />
                Acessar Painel Administrativo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Interativo de Atendentes</h1>
                <p className="text-sm text-gray-600">Análise de performance e métricas de vendas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
              
              {/* Botão de Login/Status do usuário */}
              {isAuthenticated && !isAnonymous && (
                <div className="flex items-center gap-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-green-800 font-medium">
                      👤 {user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Sair
                  </button>
                </div>
              )}
              
              {!isAuthenticated && (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Settings className="w-5 h-5" />
                  Login
                </button>
              )}
              
              <ExportButton data={filteredData} filters={filters} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filtros */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          availableOptions={availableOptions}
          showAtendentesFilter={showAtendentesFilter}
          onToggleAtendentesFilter={() => setShowAtendentesFilter(!showAtendentesFilter)}
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KPICard
            title="Orçamentos Registrados"
            value={kpiData.valor_orcamentos_registrados}
            previousValue={kpiData.media_anterior?.valor_orcamentos_registrados}
            icon={<FileText className="w-6 h-6" />}
            color="#3B82F6"
            type="currency"
          />
          <KPICard
            title="Orçamentos Convertidos"
            value={kpiData.valor_orcamentos_convertidos}
            previousValue={kpiData.media_anterior?.valor_orcamentos_convertidos}
            icon={<Receipt className="w-6 h-6" />}
            color="#10B981"
            type="currency"
          />
          <KPICard
            title="Exames Vendidos"
            value={kpiData.qtde_exames_vendidos}
            previousValue={kpiData.media_anterior?.qtde_exames_vendidos}
            icon={<Stethoscope className="w-6 h-6" />}
            color="#F59E0B"
            type="number"
          />
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FaturamentoChart data={filteredData} type="month" />
          <FaturamentoChart data={filteredData} type="atendente" />
        </div>

        {/* Top Performers */}
        <div className="mb-6">
          <TopPerformers data={filteredData} />
        </div>

        {/* Gráficos secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TKMChart data={filteredData} />
          <ConversionChart data={filteredData} />
        </div>

        {/* Análises avançadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <NPSTable data={filteredData} />
          <MetricsComparison data={filteredData} previousData={previousData} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Dashboard atualizado em tempo real • Dados agregados da view vw_atendentes_aggregado</p>
        </div>
      </div>
      
      {/* Modal de Login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loginLoading}
        error={authError}
      />
    </div>
  );
}

export default App;