import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PendingUser } from '../types';

export class UserApprovalService {
  static async fetchPendingUsers(): Promise<PendingUser[]> {
    try {
      if (!isSupabaseConfigured) {
        console.log('Supabase não configurado - retornando lista vazia');
        return [];
      }

      console.log('Buscando usuários pendentes...');
      const { data, error } = await supabase
        .from('pending_users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários pendentes:', error);
        throw error;
      }
      
      console.log('Usuários pendentes encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      return [];
    }
  }

  static async approveUser(email: string): Promise<void> {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      // Adicionar à lista de aprovados
      const { error: approveError } = await supabase
        .from('approved_users')
        .upsert({
          email,
          approved: true,
          approved_at: new Date().toISOString(),
          registered: false
        }, { onConflict: 'email' });

      if (approveError) throw approveError;

      // Atualizar status na tabela de pendentes
      const { error: updateError } = await supabase
        .from('pending_users')
        .update({ status: 'approved' })
        .eq('email', email);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      throw error;
    }
  }

  static async rejectUser(email: string): Promise<void> {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      // Atualizar status na tabela de pendentes
      const { error } = await supabase
        .from('pending_users')
        .update({ status: 'rejected' })
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      throw error;
    }
  }

  static async fetchApprovedUsers() {
    try {
      if (!isSupabaseConfigured) {
        return [];
      }

      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .order('approved_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários aprovados:', error);
      return [];
    }
  }

  static async removeApprovedUser(email: string): Promise<void> {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await supabase
        .from('approved_users')
        .delete()
        .eq('email', email);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover usuário aprovado:', error);
      throw error;
    }
  }
}