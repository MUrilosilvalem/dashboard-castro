import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  anonymous?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar usuário atual
    const checkUser = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user ? { id: user.id, email: user.email || '' } : null);
        } else {
          // Sem Supabase configurado - permitir acesso anônimo
          setUser(null);
        }
      } catch (error) {
        console.log('Erro ao verificar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escutar mudanças de autenticação
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
          } else {
            setUser(null);
          }
          
          if (event === 'SIGNED_OUT') {
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
        setUser({ id: data.user.id, email: data.user.email || '' });
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
      throw new Error('Supabase não configurado');
    }

    setAuthLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
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
    isAnonymous: user?.anonymous || false
  };
};