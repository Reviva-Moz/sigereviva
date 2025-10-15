-- 1. Restringir acesso de professores aos estudantes apenas das suas turmas
DROP POLICY IF EXISTS "Users can view students from their school" ON students;

CREATE POLICY "Users can view students based on role and assignment"
ON students FOR SELECT
USING (
  user_has_role('DIRETORIA'::app_role) 
  OR user_has_role('SECRETARIA'::app_role)
  OR (
    user_has_role('PROFESSOR'::app_role) 
    AND id IN (
      SELECT se.student_id 
      FROM student_enrollments se
      JOIN teacher_assignments ta ON se.turma_id = ta.turma_id
      WHERE ta.id IN (
        SELECT assignment_id 
        FROM get_teacher_assignment_ids(auth.uid())
      )
    )
  )
);

-- 2. Proteger informação salarial dos professores
DROP POLICY IF EXISTS "All authenticated users can view teachers" ON teachers;

-- Política para ver informações básicas (sem salário)
CREATE POLICY "Authenticated users can view teacher basic info"
ON teachers FOR SELECT
USING (
  auth.role() = 'authenticated'::text
);

-- Função para retornar dados de professor com controle de acesso ao salário
CREATE OR REPLACE FUNCTION public.get_teacher_data(_teacher_id uuid)
RETURNS TABLE (
  id uuid,
  profile_id uuid,
  school_id uuid,
  employee_number text,
  qualification text,
  specialization text,
  hire_date date,
  status text,
  salary numeric,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se for DIRETORIA ou FINANCEIRO, retorna com salário
  IF user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role) THEN
    RETURN QUERY
    SELECT t.id, t.profile_id, t.school_id, t.employee_number, 
           t.qualification, t.specialization, t.hire_date, t.status,
           t.salary, t.created_at, t.updated_at
    FROM teachers t
    WHERE t.id = _teacher_id;
  ELSE
    -- Para outros usuários, retorna NULL no campo salary
    RETURN QUERY
    SELECT t.id, t.profile_id, t.school_id, t.employee_number, 
           t.qualification, t.specialization, t.hire_date, t.status,
           NULL::numeric as salary, t.created_at, t.updated_at
    FROM teachers t
    WHERE t.id = _teacher_id;
  END IF;
END;
$$;

-- 3. Restringir acesso aos telefones dos perfis por escola
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

CREATE POLICY "Users can view profiles in their school"
ON profiles FOR SELECT
USING (
  user_id = auth.uid()
  OR user_has_role('DIRETORIA'::app_role)
  OR (
    user_has_role('SECRETARIA'::app_role)
    AND id IN (
      SELECT t.profile_id 
      FROM teachers t 
      WHERE t.school_id = get_user_school_id(auth.uid())
    )
  )
);

-- 4. Restringir acesso às informações de escolas
DROP POLICY IF EXISTS "All authenticated users can view schools" ON schools;

CREATE POLICY "Users can view their own school"
ON schools FOR SELECT
USING (
  user_has_role('DIRETORIA'::app_role) 
  OR id = get_user_school_id(auth.uid())
);

-- 5. Adicionar school_id aos financial_records para isolamento direto
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS school_id uuid;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_financial_records_school_id 
ON financial_records(school_id);

-- Atualizar registos existentes com school_id dos estudantes
UPDATE financial_records fr
SET school_id = s.school_id
FROM students s
WHERE fr.student_id = s.id
AND fr.school_id IS NULL;

-- Atualizar políticas de financial_records com validação direta
DROP POLICY IF EXISTS "Users can view financial records from their school" ON financial_records;
DROP POLICY IF EXISTS "Users can manage financial records in their school" ON financial_records;

CREATE POLICY "Users can view financial records in their school"
ON financial_records FOR SELECT
USING (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role))
  AND school_id = get_user_school_id(auth.uid())
);

CREATE POLICY "Users can manage financial records in their school"
ON financial_records FOR ALL
USING (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role))
  AND school_id = get_user_school_id(auth.uid())
)
WITH CHECK (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role))
  AND school_id = get_user_school_id(auth.uid())
);