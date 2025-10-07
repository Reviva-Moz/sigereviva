import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type AcademicYear = Tables<'academic_years'>;
type AcademicYearInsert = TablesInsert<'academic_years'>;
type AcademicYearUpdate = TablesUpdate<'academic_years'>;

// Hook para buscar todos os anos letivos
export function useAcademicYears() {
  return useSupabaseQuery(
    ['academic_years'],
    async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
      
      return { data, error };
    }
  );
}

// Hook para buscar ano letivo atual
export function useCurrentAcademicYear() {
  return useSupabaseQuery(
    ['academic_year', 'current'],
    async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_current', true)
        .single();
      
      return { data, error };
    }
  );
}

// Hook para buscar um ano letivo específico
export function useAcademicYear(id: string) {
  return useSupabaseQuery(
    ['academic_year', id],
    async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    },
    { enabled: !!id }
  );
}

// Hook para criar ano letivo
export function useCreateAcademicYear() {
  return useSupabaseMutation<AcademicYear, AcademicYearInsert>(
    async (yearData) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert(yearData)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['academic_years']],
    }
  );
}

// Hook para atualizar ano letivo
export function useUpdateAcademicYear() {
  return useSupabaseMutation<AcademicYear, { id: string; updates: AcademicYearUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('academic_years')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['academic_years']],
    }
  );
}

// Hook para deletar ano letivo
export function useDeleteAcademicYear() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['academic_years']],
    }
  );
}
