-- Corrige o search_path das funções conforme requerimentos de segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'PROFESSOR')
  );
  RETURN NEW;
END;
$$;

-- Criar usuários de teste para login
-- Usuário admin: admin@sge.mz / password: 123456
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sge.mz',
  crypt('123456', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrador SGE","role":"DIRETORIA"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- Usuário professor: professor@sge.mz / password: 123456
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'professor@sge.mz',
  crypt('123456', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Professor de Teste","role":"PROFESSOR"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;