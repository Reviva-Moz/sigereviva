-- Fix 1: Remove deprecated role column from profiles table
-- This prevents privilege escalation through inconsistent role data

-- First, update the handle_new_user trigger to NOT set profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Extract role from metadata or use PROFESSOR as default
  user_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::app_role,
    'PROFESSOR'::app_role
  );

  -- Create profile WITHOUT role column
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );

  -- Create role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the deprecated role column entirely
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Fix 2: Tighten profiles insert policy
-- Remove overly permissive service role policy and add validation

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Only allow inserts from authenticated users creating their own profile
-- OR from the trigger function (which uses security definer)
CREATE POLICY "Users can create own profile via trigger"
ON public.profiles FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Fix 3: Already fixed in previous migration (students RLS)
-- The students table now has proper RLS restricting teacher access to their assigned turmas

-- Fix 4: Add comment for manual Supabase configuration reminder
COMMENT ON TABLE public.profiles IS 'SECURITY NOTE: Enable Leaked Password Protection in Supabase Dashboard (Auth > Configuration > Password Settings)';
