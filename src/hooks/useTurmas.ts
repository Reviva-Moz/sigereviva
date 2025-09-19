import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Turma = Tables<'turmas'> & {
  class?: Tables<'classes'>;
  academic_year?: Tables<'academic_years'>;
  enrollments?: (Tables<'student_enrollments'> & {
    student?: Tables<'students'>;
  })[];
};

type TurmaInsert = TablesInsert<'turmas'>;
type TurmaUpdate = TablesUpdate<'turmas'>;

// Hook para buscar todas as turmas
export function useTurmas() {
  return useSupabaseQuery(
    ['turmas'],
    async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          class:classes(*),
          academic_year:academic_years(*),
          enrollments:student_enrollments(
            *,
            student:students(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      return { data, error };
    }
  );
}

// Hook para buscar uma turma específica
export function useTurma(id: string) {
  return useSupabaseQuery(
    ['turma', id],
    async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          class:classes(*),
          academic_year:academic_years(*),
          enrollments:student_enrollments(
            *,
            student:students(*)
          )
        `)
        .eq('id', id)
        .single();
      
      return { data, error };
    },
    { enabled: !!id }
  );
}

// Hook para criar turma
export function useCreateTurma() {
  return useSupabaseMutation<Turma, TurmaInsert>(
    async (turmaData) => {
      const { data, error } = await supabase
        .from('turmas')
        .insert(turmaData)
        .select(`
          *,
          class:classes(*),
          academic_year:academic_years(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['turmas']],
    }
  );
}

// Hook para atualizar turma
export function useUpdateTurma() {
  return useSupabaseMutation<Turma, { id: string; updates: TurmaUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('turmas')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          class:classes(*),
          academic_year:academic_years(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['turmas']],
    }
  );
}

// Hook para deletar turma
export function useDeleteTurma() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['turmas']],
    }
  );
}