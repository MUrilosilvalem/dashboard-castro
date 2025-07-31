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
      if (!isSupabaseConfigured || !email) {
        return { isAdmin: false, isSuperAdmin: false };
      }

      // Admin padrão
      if (email === 'admin@dashboard.com') {
        return { isAdmin: true, isSuperAdmin: true };
      }

      const [isAdmin, isSuperAdmin] = await Promise.all([
        AdminService.isUserAdmin(email).catch(() => false),
        AdminService.isUserSuperAdmin(email).catch(() => false)
      ]);
      
      return { isAdmin, isSuperAdmin };
    } catch (error) {
      console.error('Erro ao verificar status admin:', error);
      return { isAdmin: false, isSuperAdmin: false };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (user?.email) {
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
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      mounted = false;
    };
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
      setError('Supabase não configurado - modo demonstração');
      return;
    }

    setAuthLoading(true);
    setError(null);

    try {
      // Admin padrão - criar conta diretamente
      if (credentials.email === 'admin@dashboard.com') {
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
      let isApproved = false;
      try {
        const { data: approvedUsers, error: checkError } = await supabase
          .from('approved_users')
          .select('email, approved')
          .eq('email', credentials.email)
          .maybeSingle();

        if (checkError) {
          console.warn('Erro ao verificar aprovação:', checkError);
          isApproved = false;
        } else if (approvedUsers?.approved) {
          isApproved = true;
        } else {
          isApproved = false;
        }
      } catch (approvalError) {
        console.warn('Erro ao verificar aprovação:', approvalError);
        isApproved = false;
      }

      if (!isApproved) {
        // Adicionar à lista de usuários pendentes
        try {
          const { error: pendingError } = await supabase
            .from('pending_users')
            .upsert({
              email: credentials.email,
              status: 'pending'
            }, { onConflict: 'email' });
          
          if (pendingError) {
            console.error('Erro ao adicionar usuário pendente:', pendingError);
          }
        } catch (pendingError) {
          console.warn('Erro ao adicionar usuário pendente:', pendingError);
        }

        setError('Cadastro realizado! Aguarde aprovação do administrador para fazer login.');
        return;
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
      setUser(null);
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