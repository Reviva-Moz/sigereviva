import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Teacher = Tables<'teachers'> & {
  profile?: Tables<'profiles'>;
};

type TeacherInsert = TablesInsert<'teachers'>;
type TeacherUpdate = TablesUpdate<'teachers'>;

// Hook para buscar todos os professores
export function useTeachers() {
  return useSupabaseQuery(
    ['teachers'],
    async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      return { data, error };
    }
  );
}

// Hook para buscar um professor específico
export function useTeacher(id: string) {
  return useSupabaseQuery(
    ['teacher', id],
    async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', id)
        .single();
      
      return { data, error };
    },
    { enabled: !!id }
  );
}

// Hook para criar professor
export function useCreateTeacher() {
  return useSupabaseMutation<Teacher, TeacherInsert>(
    async (teacherData) => {
      const { data, error } = await supabase
        .from('teachers')
        .insert(teacherData)
        .select(`
          *,
          profile:profiles(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['teachers']],
    }
  );
}

// Hook para atualizar professor
export function useUpdateTeacher() {
  return useSupabaseMutation<Teacher, { id: string; updates: TeacherUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          profile:profiles(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['teachers']],
    }
  );
}

// Hook para deletar professor
export function useDeleteTeacher() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['teachers']],
    }
  );
}