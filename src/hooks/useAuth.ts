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
  const [loading, setLoading] = useState(true); // Start with true
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
    const initAuth = async () => {
      try {
        setLoading(true);
        
        if (!isSupabaseConfigured) {
          setUser({ id: 'anonymous', email: 'anonymous', anonymous: true });
          return;
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          setUser(null);
          return;
        }

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
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Auth state change listener
    let subscription: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(
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
          } catch (error) {
            console.error('Auth state change error:', error);
            setUser(null);
          }
        }
      );
      subscription = data.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
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
      setError('Cadastro realizado! Aguarde aprovação do administrador.');
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

        if (!checkError && approvedUsers?.approved) {
          isApproved = true;
        }
      } catch (approvalError) {
        console.warn('Erro ao verificar aprovação, permitindo cadastro:', approvalError);
        isApproved = true; // Em caso de erro, permitir cadastro
      }

      if (!isApproved) {
        // Adicionar à lista de usuários pendentes
        try {
          await supabase
            .from('pending_users')
            .upsert({
              email: credentials.email,
              status: 'pending'
            }, { onConflict: 'email' });
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
      setUser(null); // Forçar logout mesmo com erro
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