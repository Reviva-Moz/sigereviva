import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type School = Tables<'schools'>;
type SchoolInsert = TablesInsert<'schools'>;
type SchoolUpdate = TablesUpdate<'schools'>;

// Hook para buscar todas as escolas
export function useSchools() {
  return useSupabaseQuery(
    ['schools'],
    async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true });
      
      return { data, error };
    }
  );
}

// Hook para buscar uma escola específica
export function useSchool(id: string) {
  return useSupabaseQuery(
    ['school', id],
    async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },
    { enabled: !!id }
  );
}

// Hook para criar escola
export function useCreateSchool() {
  return useSupabaseMutation<School, SchoolInsert>(
    async (schoolData) => {
      const { data, error } = await supabase
        .from('schools')
        .insert(schoolData)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['schools']],
    }
  );
}

// Hook para atualizar escola
export function useUpdateSchool() {
  return useSupabaseMutation<School, { id: string; updates: SchoolUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['schools']],
    }
  );
}

// Hook para deletar escola
export function useDeleteSchool() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['schools']],
    }
  );
}
