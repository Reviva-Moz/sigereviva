import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Class = Tables<'classes'>;
type ClassInsert = TablesInsert<'classes'>;
type ClassUpdate = TablesUpdate<'classes'>;

// Hook para buscar todas as classes
export function useClasses() {
  return useSupabaseQuery(
    ['classes'],
    async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('grade_level', { ascending: true });
      
      return { data, error };
    }
  );
}

// Hook para buscar uma classe específica
export function useClass(id: string) {
  return useSupabaseQuery(
    ['class', id],
    async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },
    { enabled: !!id }
  );
}

// Hook para criar classe
export function useCreateClass() {
  return useSupabaseMutation<Class, ClassInsert>(
    async (classData) => {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['classes']],
    }
  );
}

// Hook para atualizar classe
export function useUpdateClass() {
  return useSupabaseMutation<Class, { id: string; updates: ClassUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['classes']],
    }
  );
}

// Hook para deletar classe
export function useDeleteClass() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['classes']],
    }
  );
}