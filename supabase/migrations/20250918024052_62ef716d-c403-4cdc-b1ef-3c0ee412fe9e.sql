-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('student-photos', 'student-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Create RLS policies for student photos bucket
CREATE POLICY "Allow authenticated users to view student photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'student-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow DIRETORIA and SECRETARIA to upload student photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'student-photos' AND (user_has_role('DIRETORIA') OR user_has_role('SECRETARIA')));

CREATE POLICY "Allow DIRETORIA and SECRETARIA to update student photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'student-photos' AND (user_has_role('DIRETORIA') OR user_has_role('SECRETARIA')));

CREATE POLICY "Allow DIRETORIA and SECRETARIA to delete student photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'student-photos' AND (user_has_role('DIRETORIA') OR user_has_role('SECRETARIA')));

-- Add indexes for better performance on students table
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON students(student_number);

-- Create function to generate student number automatically
CREATE OR REPLACE FUNCTION generate_student_number(school_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;