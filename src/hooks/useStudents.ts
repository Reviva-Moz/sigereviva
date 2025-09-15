import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types/database';
import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';

// Hook to fetch all students
export function useStudents() {
  return useSupabaseQuery<Student[]>(
    ['students'],
    async () => {
      return await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
    }
  );
}

// Hook to fetch a single student
export function useStudent(id: string) {
  return useSupabaseQuery<Student>(
    ['students', id],
    async () => {
      return await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
    },
    { enabled: !!id }
  );
}

// Hook to create a new student
export function useCreateStudent() {
  return useSupabaseMutation<Student, Omit<Student, 'id' | 'created_at' | 'updated_at'>>(
    async (newStudent) => {
      return await supabase
        .from('students')
        .insert([newStudent])
        .select()
        .single();
    },
    {
      invalidateQueries: [['students']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
}

// Hook to update a student
export function useUpdateStudent() {
  return useSupabaseMutation<Student, { id: string; updates: Partial<Student> }>(
    async ({ id, updates }) => {
      return await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    {
      invalidateQueries: [['students']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
}

// Hook to delete a student
export function useDeleteStudent() {
  return useSupabaseMutation<null, string>(
    async (id) => {
      return await supabase
        .from('students')
        .delete()
        .eq('id', id);
    },
    {
      invalidateQueries: [['students']],
      onSuccess: () => {
        // Success handled by mutation hook
      }
    }
  );
}