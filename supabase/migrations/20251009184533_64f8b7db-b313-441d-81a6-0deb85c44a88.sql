-- Insert admin and aprovador roles for existing users
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('c202ff68-d485-4509-a797-e723fe830df4', 'admin'),
  ('bd188f3e-56f8-4a10-b68a-0f0314dee515', 'aprovador')
ON CONFLICT (user_id, role) DO NOTHING;