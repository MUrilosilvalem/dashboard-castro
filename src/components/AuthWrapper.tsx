import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar usuário atual
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.log('Erro ao verificar usuário:', error);
        // Se não conseguir verificar, permitir acesso anônimo
        setUser({ anonymous: true });
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') {
          setUser({ anonymous: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        setUser(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          alert('Conta criada com sucesso!');
        }
      }
      
      setShowAuth(false);
      setFormData({ email: '', password: '' });
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      setError(error.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser({ anonymous: true });
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const skipAuth = () => {
    setUser({ anonymous: true });
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário e não está mostrando auth, mostrar opções
  if (!user && !showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso ao Dashboard</h2>
            <p className="text-gray-600">Escolha como deseja acessar o sistema</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowAuth(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <User className="w-5 h-5" />
              Fazer Login / Criar Conta
            </button>
            
            <button
              onClick={skipAuth}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Continuar sem Login
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            O login permite salvar dados permanentemente. Sem login, os dados são temporários.
          </p>
        </div>
      </div>
    );
  }

  // Mostrar formulário de autenticação
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Fazer Login' : 'Criar Conta'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Entre com suas credenciais' : 'Crie uma nova conta'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sua senha"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Fazer login'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={skipAuth}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Continuar sem login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuário autenticado ou anônimo - mostrar conteúdo
  return (
    <div>
      {/* Header de autenticação */}
      {user && !user.anonymous && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <User className="w-4 h-4" />
              <span>Logado como: {user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-green-700 hover:text-green-900"
            >
              Sair
            </button>
          </div>
        </div>
      )}
      
      {user && user.anonymous && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <Lock className="w-4 h-4" />
              <span>Modo anônimo - Dados podem não ser salvos permanentemente</span>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm text-yellow-700 hover:text-yellow-900"
            >
              Fazer Login
            </button>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default AuthWrapper;