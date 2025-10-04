-- =====================================================
-- MIGRAÇÃO: Sistema de Roles Seguro (v2)
-- Objetivo: Separar roles em tabela dedicada para evitar escalação de privilégios
-- =====================================================

-- 1. Criar enum para roles (usando os roles existentes do sistema)
CREATE TYPE public.app_role AS ENUM ('DIRETORIA', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função SECURITY DEFINER para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Criar função auxiliar para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  LIMIT 1
$$;

-- 6. Migrar dados existentes da tabela profiles para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::text::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Remover função antiga user_has_role COM CASCADE (remove policies dependentes)
DROP FUNCTION IF EXISTS public.user_has_role(user_role) CASCADE;

-- 8. Criar nova função user_has_role que usa app_role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), required_role) OR public.has_role(auth.uid(), 'DIRETORIA');
$$;

-- 9. Atualizar função get_current_user_role para usar user_roles
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 10. Atualizar trigger de criação de usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Extrair role do metadata ou usar PROFESSOR como padrão
  user_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::app_role,
    'PROFESSOR'::app_role
  );

  -- Criar perfil
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );

  -- Criar role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 11. RECRIAR TODAS AS POLÍTICAS RLS USANDO A NOVA FUNÇÃO

-- Schools
CREATE POLICY "Only DIRETORIA can manage schools" 
ON public.schools 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role));

-- Students
CREATE POLICY "DIRETORIA and SECRETARIA can manage students" 
ON public.students 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Teachers
CREATE POLICY "DIRETORIA and SECRETARIA can manage teachers" 
ON public.teachers 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Financial Records
CREATE POLICY "DIRETORIA and FINANCEIRO can view financial records" 
ON public.financial_records 
FOR SELECT 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role));

CREATE POLICY "DIRETORIA and FINANCEIRO can manage financial records" 
ON public.financial_records 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role));

-- Attendance
CREATE POLICY "Teachers can view attendance for their assignments" 
ON public.attendance 
FOR SELECT 
USING (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR 
  (user_has_role('PROFESSOR'::app_role) AND teacher_assignment_id IN (
    SELECT ta.id FROM teacher_assignments ta 
    JOIN teachers t ON ta.teacher_id = t.id 
    JOIN profiles p ON t.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ))
);

CREATE POLICY "Teachers can manage attendance for their assignments" 
ON public.attendance 
FOR ALL 
USING (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR 
  (user_has_role('PROFESSOR'::app_role) AND teacher_assignment_id IN (
    SELECT ta.id FROM teacher_assignments ta 
    JOIN teachers t ON ta.teacher_id = t.id 
    JOIN profiles p ON t.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ))
);

-- Academic Years
CREATE POLICY "DIRETORIA and SECRETARIA can manage academic years" 
ON public.academic_years 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Classes
CREATE POLICY "DIRETORIA and SECRETARIA can manage classes" 
ON public.classes 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Turmas
CREATE POLICY "DIRETORIA and SECRETARIA can manage turmas" 
ON public.turmas 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Subjects
CREATE POLICY "DIRETORIA and SECRETARIA can manage subjects" 
ON public.subjects 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Student Enrollments
CREATE POLICY "DIRETORIA and SECRETARIA can manage enrollments" 
ON public.student_enrollments 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Teacher Assignments
CREATE POLICY "DIRETORIA and SECRETARIA can manage teacher assignments" 
ON public.teacher_assignments 
FOR ALL 
USING (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role));

-- Storage Policies (student photos)
CREATE POLICY "Allow DIRETORIA and SECRETARIA to upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-photos' AND
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

CREATE POLICY "Allow DIRETORIA and SECRETARIA to update student photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-photos' AND
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

CREATE POLICY "Allow DIRETORIA and SECRETARIA to delete student photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-photos' AND
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

-- 12. Criar políticas RLS para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin pode gerenciar todos os roles"
ON public.user_roles
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email') = 'admin@reviva.mz')
WITH CHECK ((auth.jwt() ->> 'email') = 'admin@reviva.mz');

-- 13. Marcar coluna role como deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead. Will be removed in future migration.';