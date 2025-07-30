import { supabase, isSupabaseConfigured } from '../lib/supabase';

export class AdminService {
  static async isUserAdmin(email: string): Promise<boolean> {
    try {
      if (!isSupabaseConfigured || !email) {
        return false;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro no serviço de admin:', error);
      return false;
    }
  }

  static async isUserSuperAdmin(email: string): Promise<boolean> {
    try {
      if (!isSupabaseConfigured || !email) {
        return false;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('email', email)
        .eq('is_super_admin', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar super admin:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro no serviço de super admin:', error);
      return false;
    }
  }

  static async fetchAdminUsers() {
    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
      return [];
    }
  }

  static async addAdminUser(email: string, isSuperAdmin: boolean = false) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      // Primeiro, aprovar o usuário
      await supabase
        .from('approved_users')
        .upsert({
          email,
          approved: true,
          approved_at: new Date().toISOString(),
          registered: false
        }, { onConflict: 'email' });

      // Depois, adicionar como admin
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email,
          is_super_admin: isSuperAdmin
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar admin:', error);
      throw error;
    }
  }

  static async removeAdminUser(email: string) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover admin:', error);
      throw error;
    }
  }

  static async updateAdminUser(email: string, updates: { is_super_admin?: boolean }) {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('email', email)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar admin:', error);
      throw error;
    }
  }
}