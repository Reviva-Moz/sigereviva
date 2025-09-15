// Database types for SGE REVIVA
export type UserRole = 'DIRETORIA' | 'SECRETARIA' | 'FINANCEIRO' | 'PROFESSOR';
export type StudentStatus = 'ATIVO' | 'INATIVO' | 'TRANSFERIDO' | 'GRADUADO';
export type PaymentStatus = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO' | 'ATRASADO';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  director_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  class_name: string;
  grade_level: number;
  created_at: string;
}

export interface Turma {
  id: string;
  class_id: string;
  academic_year_id: string;
  turma_name: string;
  max_capacity: number;
  current_students: number;
  classroom?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  subject_name: string;
  subject_code?: string;
  description?: string;
  weekly_hours: number;
  created_at: string;
}

export interface Teacher {
  id: string;
  profile_id: string;
  school_id: string;
  employee_number?: string;
  qualification?: string;
  specialization?: string;
  hire_date?: string;
  salary?: number;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Student {
  id: string;
  school_id: string;
  student_number: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  id_number?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  photo_url?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  health_info?: string | null;
  status: StudentStatus;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  turma_id: string;
  academic_year_id: string;
  enrollment_date: string;
  status: string;
  created_at: string;
  student?: Student;
  turma?: Turma;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  turma_id: string;
  subject_id: string;
  academic_year_id: string;
  created_at: string;
  teacher?: Teacher;
  turma?: Turma;
  subject?: Subject;
}

export interface Attendance {
  id: string;
  student_id: string;
  teacher_assignment_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  notes?: string;
  recorded_by: string;
  created_at: string;
  student?: Student;
  teacher_assignment?: TeacherAssignment;
}

export interface FinancialRecord {
  id: string;
  student_id: string;
  academic_year_id: string;
  description: string;
  amount: number;
  due_date?: string;
  payment_date?: string;
  status: PaymentStatus;
  payment_method?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  student?: Student;
}