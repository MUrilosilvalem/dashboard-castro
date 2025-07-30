import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminService } from '../services/adminService';

interface User {
  id: string;
  email: string;
  anonymous?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = async (email: string) => {
    try {
      const [isAdmin, isSuperAdmin] = await Promise.all([
        AdminService.isUserAdmin(email),
        AdminService.isUserSuperAdmin(email)
      ]);
      return { isAdmin, isSuperAdmin };
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      return { isAdmin: false, isSuperAdmin: false };
    }
  };

  useEffect(() => {
    // Verificar usuário atual
    const checkUser = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.email) {
            const { isAdmin, isSuperAdmin } = await checkAdminStatus(user.email);
            setUser({ 
              id: user.id, 
              email: user.email,
              isAdmin,
              isSuperAdmin
            });
          } else {
            setUser(null);
          }
        } else {
          // Sem Supabase configurado - definir usuário anônimo
          setUser({ id: 'anonymous', email: 'anonymous', anonymous: true });
        }
      } catch (error) {
        console.log('Erro ao verificar usuário:', error);
        // Em caso de erro, permitir acesso anônimo
        setUser({ id: 'anonymous', email: 'anonymous', anonymous: true });
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            if (session?.user && session.user.email) {
              const { isAdmin, isSuperAdmin } = await checkAdminStatus(session.user.email);
              setUser({ 
                id: session.user.id, 
                email: session.user.email,
                isAdmin,
                isSuperAdmin
              });
            } else {
              setUser(null);
            }
            
            if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          } catch (error) {
            console.error('Erro no auth state change:', error);
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado');
    }

    setAuthLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const email = data.user.email || '';
        const { isAdmin, isSuperAdmin } = await checkAdminStatus(email);
        setUser({ 
          id: data.user.id, 
          email,
          isAdmin,
          isSuperAdmin
        });
      }
    } catch (error: any) {
      console.error('Erro de login:', error);
      setError(error.message || 'Erro no login');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (credentials: { email: string; password: string }) => {
    if (!isSupabaseConfigured) {
      // Modo offline - simular aprovação pendente
      setError('Cadastro realizado! Aguarde aprovação do administrador.');
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      // Verificar se é o admin padrão
      if (credentials.email === 'admin@dashboard.com') {
        // Admin padrão - criar conta diretamente
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser({ 
            id: data.user.id, 
            email: data.user.email || '',
            isAdmin: true,
            isSuperAdmin: true
          });
        }
        return;
      }

      // Para outros usuários, verificar aprovação
      try {
        const { data: approvedUsers, error: checkError } = await supabase
          .from('approved_users')
          .select('email, approved')
          .eq('email', credentials.email)
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        // Se não está na lista ou não foi aprovado
        if (!approvedUsers || !approvedUsers.approved) {
          // Adicionar à lista de usuários pendentes
          const { error: pendingError } = await supabase
            .from('pending_users')
            .upsert({
              email: credentials.email,
              status: 'pending'
            }, { onConflict: 'email' });

          if (pendingError) throw pendingError;

          setError('Cadastro realizado! Aguarde aprovação do administrador para fazer login.');
          return;
        }
      } catch (approvalError) {
        console.error('Erro ao verificar aprovação:', approvalError);
        // Se houver erro na verificação, permitir cadastro direto
      }

      // Criar conta
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const email = data.user.email || '';
        const { isAdmin, isSuperAdmin } = await checkAdminStatus(email);
        setUser({ 
          id: data.user.id, 
          email,
          isAdmin,
          isSuperAdmin
        });
      }
    } catch (error: any) {
      console.error('Erro de registro:', error);
      setError(error.message || 'Erro no registro');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const loginAnonymously = () => {
    setUser({ id: 'anonymous', email: 'anonymous', anonymous: true });
  };

  return {
    user,
    loading,
    authLoading,
    error,
    login,
    register,
    logout,
    loginAnonymously,
    isAuthenticated: !!user,
    isAnonymous: user?.anonymous || false,
    isAdmin: user?.isAdmin || false,
    isSuperAdmin: user?.isSuperAdmin || false
  };
};