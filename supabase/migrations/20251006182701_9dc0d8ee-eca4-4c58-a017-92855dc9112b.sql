-- Create profiles for users that don't have one yet
INSERT INTO public.profiles (user_id, email, nome, role, departamento, cargo)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'nome', au.email),
  'solicitante',
  au.raw_user_meta_data->>'departamento',
  au.raw_user_meta_data->>'cargo'
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;