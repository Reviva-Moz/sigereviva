-- Add trigger to create profile automatically on signup
create extension if not exists pgcrypto;

-- Ensure trigger exists to populate profiles from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow only admin@reviva.mz to update any profile (manage roles)
-- Keep existing policies; this adds an extra, stricter admin-only capability
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND polname = 'Admin can update any profile'
  ) THEN
    CREATE POLICY "Admin can update any profile"
    ON public.profiles
    FOR UPDATE
    USING ((auth.jwt() ->> 'email') = 'admin@reviva.mz')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@reviva.mz');
  END IF;
END $$;
