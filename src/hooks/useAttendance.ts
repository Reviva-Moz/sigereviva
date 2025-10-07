import { useSupabaseQuery, useSupabaseMutation } from './useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Attendance = Tables<'attendance'> & {
  student?: Tables<'students'>;
  teacher_assignment?: Tables<'teacher_assignments'>;
};

type AttendanceInsert = TablesInsert<'attendance'>;
type AttendanceUpdate = TablesUpdate<'attendance'>;

// Hook para buscar todas as presenças
export function useAttendance() {
  return useSupabaseQuery(
    ['attendance'],
    async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(*),
          teacher_assignment:teacher_assignments(*)
        `)
        .order('attendance_date', { ascending: false });
      
      return { data, error };
    }
  );
}

// Hook para buscar presenças por estudante
export function useStudentAttendance(studentId: string) {
  return useSupabaseQuery(
    ['attendance', 'student', studentId],
    async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          teacher_assignment:teacher_assignments(*)
        `)
        .eq('student_id', studentId)
        .order('attendance_date', { ascending: false });
      
      return { data, error };
    },
    { enabled: !!studentId }
  );
}

// Hook para buscar presenças por data
export function useAttendanceByDate(date: string) {
  return useSupabaseQuery(
    ['attendance', 'date', date],
    async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(*)
        `)
        .eq('attendance_date', date)
        .order('created_at', { ascending: false });
      
      return { data, error };
    },
    { enabled: !!date }
  );
}

// Hook para criar presença
export function useCreateAttendance() {
  return useSupabaseMutation<Attendance, AttendanceInsert>(
    async (attendanceData) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceData)
        .select(`
          *,
          student:students(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['attendance']],
    }
  );
}

// Hook para atualizar presença
export function useUpdateAttendance() {
  return useSupabaseMutation<Attendance, { id: string; updates: AttendanceUpdate }>(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          student:students(*)
        `)
        .single();
      
      return { data, error };
    },
    {
      invalidateQueries: [['attendance']],
    }
  );
}

// Hook para deletar presença
export function useDeleteAttendance() {
  return useSupabaseMutation<void, string>(
    async (id) => {
      const { data, error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);
      
      return { data, error };
    },
    {
      invalidateQueries: [['attendance']],
    }
  );
}
