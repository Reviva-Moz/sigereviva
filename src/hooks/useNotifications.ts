import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  link?: string;
}

// Hook para buscar notificações do usuário
export function useNotifications() {
  const { user } = useAuth();
  
  return useSupabaseQuery<Notification[]>(
    ['notifications', user?.id],
    async () => {
      if (!user) {
        return { data: [], error: null };
      }

      // Simular notificações (já que não temos tabela ainda)
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user.id,
          title: 'Novo Educando Matriculado',
          message: 'João Silva foi matriculado na 10ª A.',
          type: 'success',
          read: false,
          created_at: new Date().toISOString(),
          link: '/students',
        },
        {
          id: '2',
          user_id: user.id,
          title: 'Pagamento Vencido',
          message: 'Maria Costa tem pagamento vencido há 5 dias.',
          type: 'warning',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          link: '/financeiro',
        },
        {
          id: '3',
          user_id: user.id,
          title: 'Relatório Mensal Disponível',
          message: 'O relatório de desempenho de Novembro está pronto.',
          type: 'info',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          link: '/relatorios',
        },
      ];

      return { data: mockNotifications, error: null };
    },
    { enabled: !!user }
  );
}

// Hook para marcar notificação como lida
export function useMarkAsRead() {
  return useSupabaseMutation<Notification, string>(
    async (id) => {
      // Simular marcação como lida
      return { data: null as any, error: null };
    },
    {
      invalidateQueries: [['notifications']],
    }
  );
}

// Hook para deletar notificação
export function useDeleteNotification() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      // Simular deleção
      return { data: null as any, error: null };
    },
    {
      invalidateQueries: [['notifications']],
    }
  );
}
