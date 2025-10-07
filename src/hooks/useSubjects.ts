import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Subject = Tables<'subjects'>;
type SubjectInsert = TablesInsert<'subjects'>;
type SubjectUpdate = TablesUpdate<'subjects'>;

// Hook para buscar todas as disciplinas
export function useSubjects() {
  return useSupabaseQuery(
    ['subjects'],
    async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('subject_name', { ascending: true });
      
      return { data, error };
    }
  );
}

// Hook para buscar uma disciplina específica
export function useSubject(id: string) {
  return useSupabaseQuery(
    ['subject', id],
    async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },
    { enabled: !!id }
  );
}

// Hook para criar disciplina
export function useCreateSubject() {
  return useSupabaseMutation<Subject, SubjectInsert>(
    async (subjectData) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subjectData)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['subjects']],
    }
  );
}

// Hook para atualizar disciplina
export function useUpdateSubject() {
  return useSupabaseMutation<Subject, { id: string; updates: SubjectUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['subjects']],
    }
  );
}

// Hook para deletar disciplina
export function useDeleteSubject() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['subjects']],
    }
  );
}
