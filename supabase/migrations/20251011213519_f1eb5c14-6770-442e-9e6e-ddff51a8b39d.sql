-- Fix 1: Add explicit INSERT policies for profiles table
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can create own profile once"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid())
);

-- Fix 2: Create security definer function for teacher assignment validation
-- This replaces the complex subquery in RLS policies
CREATE OR REPLACE FUNCTION public.get_teacher_assignment_ids(_user_id uuid)
RETURNS TABLE(assignment_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ta.id
  FROM teacher_assignments ta
  JOIN teachers t ON ta.teacher_id = t.id
  JOIN profiles p ON t.profile_id = p.id
  WHERE p.user_id = _user_id;
$$;

-- Update attendance RLS policies to use the new function
DROP POLICY IF EXISTS "Teachers can manage attendance for their assignments" ON attendance;
DROP POLICY IF EXISTS "Teachers can view attendance for their assignments" ON attendance;

CREATE POLICY "Teachers can manage attendance for their assignments"
ON attendance
FOR ALL
USING (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR
  (user_has_role('PROFESSOR'::app_role) AND 
   teacher_assignment_id IN (SELECT assignment_id FROM get_teacher_assignment_ids(auth.uid())))
);

CREATE POLICY "Teachers can view attendance for their assignments"
ON attendance
FOR SELECT
USING (
  user_has_role('DIRETORIA'::app_role) OR 
  user_has_role('SECRETARIA'::app_role) OR
  (user_has_role('PROFESSOR'::app_role) AND 
   teacher_assignment_id IN (SELECT assignment_id FROM get_teacher_assignment_ids(auth.uid())))
);

-- Fix 3: Restrict profile phone visibility to same school or admin roles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

CREATE POLICY "Authenticated users can view profiles"
ON profiles
FOR SELECT
USING (
  -- Users can see their own profile with phone
  user_id = auth.uid() OR
  -- DIRETORIA can see all profiles
  user_has_role('DIRETORIA'::app_role) OR
  user_has_role('SECRETARIA'::app_role)
  -- Note: For school-level isolation, we'd need to add school_id to profiles
  -- This is a simplified version that restricts to admin roles
);

-- Fix 4: Fix search_path for generate_student_number function
CREATE OR REPLACE FUNCTION public.generate_student_number(school_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    year_code TEXT;
    sequence_num INTEGER;
    student_number TEXT;
BEGIN
    -- Get current year last 2 digits
    year_code := RIGHT(EXTRACT(year FROM CURRENT_DATE)::TEXT, 2);
    
    -- Get next sequence number for this school and year
    SELECT COALESCE(MAX(
        CASE 
            WHEN student_number ~ '^[0-9]{2}[0-9]{4}$' 
            THEN CAST(SUBSTRING(student_number FROM 3 FOR 4) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO sequence_num
    FROM students 
    WHERE school_id = school_id_param 
    AND student_number LIKE year_code || '%';
    
    -- Format as YYNNNN (e.g., 250001)
    student_number := year_code || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN student_number;
END;
$function$;