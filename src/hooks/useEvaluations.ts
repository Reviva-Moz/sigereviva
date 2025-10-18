import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Evaluation {
  id: string;
  student_id: string;
  teacher_assignment_id: string;
  trimester: number;
  grade: number;
  evaluation_type: string;
  evaluation_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  students?: {
    full_name: string;
    student_number: string;
  };
  teacher_assignments?: {
    subjects?: {
      subject_name: string;
    };
  };
}

export function useEvaluations(filters?: {
  trimester?: number;
  subjectId?: string;
  studentId?: string;
}) {
  return useQuery({
    queryKey: ['evaluations', filters],
    queryFn: async () => {
      let query = supabase
        .from('evaluations')
        .select(`
          *,
          students!inner(full_name, student_number),
          teacher_assignments!inner(
            subjects(subject_name)
          )
        `)
        .order('evaluation_date', { ascending: false });

      if (filters?.trimester) {
        query = query.eq('trimester', filters.trimester);
      }

      if (filters?.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Evaluation[];
    },
  });
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (evaluation: {
      student_id: string;
      teacher_assignment_id: string;
      trimester: number;
      grade: number;
      evaluation_type?: string;
      evaluation_date?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('evaluations')
        .insert({
          ...evaluation,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast({
        title: 'Sucesso',
        description: 'Avaliação registada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar avaliação',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Evaluation> & { id: string }) => {
      const { data, error } = await supabase
        .from('evaluations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast({
        title: 'Sucesso',
        description: 'Avaliação atualizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar avaliação',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEvaluation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast({
        title: 'Sucesso',
        description: 'Avaliação eliminada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao eliminar avaliação',
        variant: 'destructive',
      });
    },
  });
}

// Hook para buscar estatísticas de avaliações
export function useEvaluationStats(filters?: { trimester?: number }) {
  return useQuery({
    queryKey: ['evaluation-stats', filters],
    queryFn: async () => {
      let query = supabase
        .from('evaluations')
        .select('grade, trimester');

      if (filters?.trimester) {
        query = query.eq('trimester', filters.trimester);
      }

      const { data, error } = await query;

      if (error) throw error;

      const grades = data?.map(e => e.grade) || [];
      const total = grades.length;
      const average = total > 0 ? grades.reduce((sum, g) => sum + g, 0) / total : 0;
      const passed = grades.filter(g => g >= 10).length;
      const passRate = total > 0 ? (passed / total) * 100 : 0;
      const excellent = grades.filter(g => g >= 16).length;

      return {
        total,
        average,
        passed,
        passRate,
        excellent,
      };
    },
  });
}
