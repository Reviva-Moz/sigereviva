-- SGE REVIVA - Complete Database Schema
-- Phase 1: Foundation and Infrastructure

-- Create custom types and enums
CREATE TYPE public.user_role AS ENUM ('DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR');
CREATE TYPE public.student_status AS ENUM ('ATIVO', 'INATIVO', 'TRANSFERIDO', 'GRADUADO');
CREATE TYPE public.payment_status AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO');
CREATE TYPE public.attendance_status AS ENUM ('PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'ATRASADO');

-- Profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'PROFESSOR',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Schools table for multi-tenancy support
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  director_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Academic years table
CREATE TABLE public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  year_name TEXT NOT NULL, -- e.g., "2024"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Classes table (1ª Classe, 2ª Classe, etc.)
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  class_name TEXT NOT NULL, -- "1ª Classe", "2ª Classe", etc.
  grade_level INTEGER NOT NULL, -- 1, 2, 3, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Turmas table (specific groups within a class)
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  turma_name TEXT NOT NULL, -- "A", "B", "C", etc.
  max_capacity INTEGER DEFAULT 30,
  current_students INTEGER DEFAULT 0,
  classroom TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  subject_name TEXT NOT NULL,
  subject_code TEXT,
  description TEXT,
  weekly_hours INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  employee_number TEXT UNIQUE,
  qualification TEXT,
  specialization TEXT,
  hire_date DATE,
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'ATIVO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  student_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F')),
  id_number TEXT, -- BI number
  phone TEXT,
  email TEXT,
  address TEXT,
  photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  health_info TEXT,
  status student_status DEFAULT 'ATIVO',
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id, student_number)
);

-- Student enrollments (which turma a student is in)
CREATE TABLE public.student_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'ATIVO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id)
);

-- Teacher assignments (which subjects/turmas a teacher teaches)
CREATE TABLE public.teacher_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, turma_id, subject_id, academic_year_id)
);

-- Attendance records
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  teacher_assignment_id UUID REFERENCES public.teacher_assignments(id) ON DELETE CASCADE NOT NULL,
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, teacher_assignment_id, attendance_date)
);

-- Financial records
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  payment_date DATE,
  status payment_status DEFAULT 'PENDENTE',
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = required_role OR public.get_current_user_role() = 'DIRETORIA';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for schools
CREATE POLICY "All authenticated users can view schools" ON public.schools
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only DIRETORIA can manage schools" ON public.schools
  FOR ALL USING (public.user_has_role('DIRETORIA'));

-- RLS Policies for students
CREATE POLICY "All authenticated users can view students" ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage students" ON public.students
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

-- RLS Policies for teachers
CREATE POLICY "All authenticated users can view teachers" ON public.teachers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage teachers" ON public.teachers
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

-- RLS Policies for financial records
CREATE POLICY "DIRETORIA and FINANCEIRO can view financial records" ON public.financial_records
  FOR SELECT USING (public.user_has_role('DIRETORIA') OR public.user_has_role('FINANCEIRO'));

CREATE POLICY "DIRETORIA and FINANCEIRO can manage financial records" ON public.financial_records
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('FINANCEIRO'));

-- RLS Policies for attendance (teachers can only see their assignments)
CREATE POLICY "Teachers can view attendance for their assignments" ON public.attendance
  FOR SELECT USING (
    public.user_has_role('DIRETORIA') OR 
    public.user_has_role('SECRETARIA') OR
    (public.user_has_role('PROFESSOR') AND 
     teacher_assignment_id IN (
       SELECT ta.id FROM public.teacher_assignments ta
       JOIN public.teachers t ON ta.teacher_id = t.id
       JOIN public.profiles p ON t.profile_id = p.id
       WHERE p.user_id = auth.uid()
     ))
  );

CREATE POLICY "Teachers can manage attendance for their assignments" ON public.attendance
  FOR ALL USING (
    public.user_has_role('DIRETORIA') OR 
    public.user_has_role('SECRETARIA') OR
    (public.user_has_role('PROFESSOR') AND 
     teacher_assignment_id IN (
       SELECT ta.id FROM public.teacher_assignments ta
       JOIN public.teachers t ON ta.teacher_id = t.id
       JOIN public.profiles p ON t.profile_id = p.id
       WHERE p.user_id = auth.uid()
     ))
  );

-- Generic policies for other tables (DIRETORIA and SECRETARIA access)
CREATE POLICY "DIRETORIA and SECRETARIA can manage academic years" ON public.academic_years
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

CREATE POLICY "All authenticated can view academic years" ON public.academic_years
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage classes" ON public.classes
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

CREATE POLICY "All authenticated can view classes" ON public.classes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage turmas" ON public.turmas
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

CREATE POLICY "All authenticated can view turmas" ON public.turmas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage subjects" ON public.subjects
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

CREATE POLICY "All authenticated can view subjects" ON public.subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage enrollments" ON public.student_enrollments
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

CREATE POLICY "All authenticated can view enrollments" ON public.student_enrollments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "DIRETORIA and SECRETARIA can manage teacher assignments" ON public.teacher_assignments
  FOR ALL USING (public.user_has_role('DIRETORIA') OR public.user_has_role('SECRETARIA'));

CREATE POLICY "All authenticated can view teacher assignments" ON public.teacher_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'PROFESSOR')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();