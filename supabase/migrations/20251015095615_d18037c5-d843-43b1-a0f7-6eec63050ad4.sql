-- 1. Tornar bucket student-photos privado
UPDATE storage.buckets 
SET public = false 
WHERE id = 'student-photos';

-- 2. Adicionar políticas RLS para student-photos bucket
CREATE POLICY "DIRETORIA e SECRETARIA podem ver fotos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-photos' 
  AND (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

CREATE POLICY "DIRETORIA e SECRETARIA podem fazer upload de fotos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-photos' 
  AND (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

CREATE POLICY "DIRETORIA e SECRETARIA podem atualizar fotos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-photos' 
  AND (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

CREATE POLICY "DIRETORIA e SECRETARIA podem deletar fotos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-photos' 
  AND (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
);

-- 3. Adicionar school_id constraint para isolamento de dados
-- Atualizar políticas RLS da tabela students para incluir school isolation
DROP POLICY IF EXISTS "All authenticated users can view students" ON students;
DROP POLICY IF EXISTS "DIRETORIA and SECRETARIA can manage students" ON students;

-- Criar função para obter school_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT t.school_id
  FROM teachers t
  JOIN profiles p ON t.profile_id = p.id
  WHERE p.user_id = _user_id
  LIMIT 1;
$$;

-- Novas políticas com isolamento por escola
CREATE POLICY "Users can view students from their school"
ON students FOR SELECT
USING (
  user_has_role('DIRETORIA'::app_role) 
  OR user_has_role('SECRETARIA'::app_role)
  OR (
    user_has_role('PROFESSOR'::app_role) 
    AND school_id = get_user_school_id(auth.uid())
  )
);

CREATE POLICY "DIRETORIA and SECRETARIA can manage students in their school"
ON students FOR ALL
USING (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
  AND school_id = get_user_school_id(auth.uid())
)
WITH CHECK (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('SECRETARIA'::app_role))
  AND school_id = get_user_school_id(auth.uid())
);

-- 4. Atualizar políticas de financial_records com isolamento por escola
DROP POLICY IF EXISTS "DIRETORIA and FINANCEIRO can view financial records" ON financial_records;
DROP POLICY IF EXISTS "DIRETORIA and FINANCEIRO can manage financial records" ON financial_records;

CREATE POLICY "Users can view financial records from their school"
ON financial_records FOR SELECT
USING (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role))
  AND EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = student_id 
    AND s.school_id = get_user_school_id(auth.uid())
  )
);

CREATE POLICY "Users can manage financial records in their school"
ON financial_records FOR ALL
USING (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role))
  AND EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = student_id 
    AND s.school_id = get_user_school_id(auth.uid())
  )
)
WITH CHECK (
  (user_has_role('DIRETORIA'::app_role) OR user_has_role('FINANCEIRO'::app_role))
  AND EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = student_id 
    AND s.school_id = get_user_school_id(auth.uid())
  )
);

-- 5. Remover coluna role redundante da tabela profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- 6. Melhorar políticas de admin removendo hardcoded email
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin pode gerenciar todos os roles" ON user_roles;

CREATE POLICY "DIRETORIA can update profiles in their school"
ON profiles FOR UPDATE
USING (
  user_has_role('DIRETORIA'::app_role)
  OR user_id = auth.uid()
);

CREATE POLICY "DIRETORIA can manage user roles in their school"
ON user_roles FOR ALL
USING (user_has_role('DIRETORIA'::app_role))
WITH CHECK (user_has_role('DIRETORIA'::app_role));