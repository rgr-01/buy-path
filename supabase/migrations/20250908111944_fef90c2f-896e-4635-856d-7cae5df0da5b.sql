-- Remove the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create more restrictive policies for profile access

-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Admins and approvers can view all profiles (they need this for their work)
CREATE POLICY "Admins and approvers can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'aprovador')
);

-- Create a view for limited profile information that regular users can access
CREATE OR REPLACE VIEW public.profiles_basic AS
SELECT 
  id,
  nome,
  role,
  departamento
FROM public.profiles
WHERE 
  -- Users can see their own profile
  user_id = auth.uid()
  OR
  -- Or admins/approvers can see basic info of all users
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'aprovador')
  )
  OR
  -- Or users can see basic info of people in requisitions they're involved with
  EXISTS (
    SELECT 1 FROM public.requisicoes r
    JOIN public.profiles requester ON requester.user_id = auth.uid()
    WHERE (r.solicitante_id = profiles.id OR r.aprovador_id = profiles.id)
    AND (requester.id = r.solicitante_id OR requester.role IN ('admin', 'aprovador'))
  );

-- Grant access to the basic view
GRANT SELECT ON public.profiles_basic TO authenticated;

-- Add RLS to the view as well
ALTER VIEW public.profiles_basic SET (security_barrier = true);

-- Create an audit log entry for this security fix
INSERT INTO public.log_auditoria (acao, detalhes, user_id)
SELECT 
  'SECURITY_UPDATE',
  jsonb_build_object(
    'action', 'Restricted profile access policies',
    'description', 'Fixed security vulnerability where all users could view all employee personal information',
    'changes', 'Implemented role-based access control for profiles table'
  ),
  auth.uid()
WHERE auth.uid() IS NOT NULL;