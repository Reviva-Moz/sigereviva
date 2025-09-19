import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type StudentEnrollment = Tables<'student_enrollments'> & {
  student?: Tables<'students'>;
  turma?: Tables<'turmas'> & {
    class?: Tables<'classes'>;
  };
  academic_year?: Tables<'academic_years'>;
};

type EnrollmentInsert = TablesInsert<'student_enrollments'>;
type EnrollmentUpdate = TablesUpdate<'student_enrollments'>;

// Hook para buscar todas as matrículas
export function useEnrollments() {
  return useSupabaseQuery(
    ['enrollments'],
    async () => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          student:students(*),
          turma:turmas(
            *,
            class:classes(*)
          ),
          academic_year:academic_years(*)
        `)
        .order('created_at', { ascending: false });
      
      return { data, error };
    }
  );
}

// Hook para buscar matrículas de um estudante
export function useStudentEnrollments(studentId: string) {
  return useSupabaseQuery(
    ['enrollments', 'student', studentId],
    async () => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          turma:turmas(
            *,
            class:classes(*)
          ),
          academic_year:academic_years(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    },
    { enabled: !!studentId }
  );
}

// Hook para buscar matrículas de uma turma
export function useTurmaEnrollments(turmaId: string) {
  return useSupabaseQuery(
    ['enrollments', 'turma', turmaId],
    async () => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          student:students(*),
          academic_year:academic_years(*)
        `)
        .eq('turma_id', turmaId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    },
    { enabled: !!turmaId }
  );
}

// Hook para criar matrícula
export function useCreateEnrollment() {
  return useSupabaseMutation<StudentEnrollment, EnrollmentInsert>(
    async (enrollmentData) => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .insert(enrollmentData)
        .select(`
          *,
          student:students(*),
          turma:turmas(
            *,
            class:classes(*)
          ),
          academic_year:academic_years(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['enrollments'], ['turmas']],
    }
  );
}

// Hook para atualizar matrícula
export function useUpdateEnrollment() {
  return useSupabaseMutation<StudentEnrollment, { id: string; updates: EnrollmentUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          student:students(*),
          turma:turmas(
            *,
            class:classes(*)
          ),
          academic_year:academic_years(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['enrollments'], ['turmas']],
    }
  );
}

// Hook para deletar matrícula
export function useDeleteEnrollment() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('student_enrollments')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['enrollments'], ['turmas']],
    }
  );
}