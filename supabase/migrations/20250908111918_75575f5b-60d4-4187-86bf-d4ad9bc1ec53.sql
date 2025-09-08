-- Remove the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies for profile access

-- 1. Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Admins and approvers can view profiles of users whose requisitions they manage
CREATE POLICY "Admins and approvers can view relevant profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow admins and approvers to view profiles
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'aprovador')
  )
  OR
  -- Allow viewing profiles of users who have requisitions that the current user can access
  EXISTS (
    SELECT 1 FROM public.requisicoes r
    JOIN public.profiles current_user ON current_user.user_id = auth.uid()
    WHERE r.solicitante_id = profiles.id
    AND (
      current_user.role IN ('admin', 'aprovador')
      OR current_user.id = r.solicitante_id
    )
  )
);

-- 3. Limited profile info access for system functionality (like dropdowns)
-- This policy allows viewing only basic info (id, nome, role) for system operations
CREATE POLICY "Limited profile access for system functionality" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to essential fields for authenticated users
  -- This will be enforced at the application level to limit fields returned
  auth.uid() IS NOT NULL
);

-- However, since we can't restrict columns at the RLS level, we need to drop the above
-- and create a more targeted approach
DROP POLICY IF EXISTS "Limited profile access for system functionality" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update the admin/approver policy to use the security definer function
DROP POLICY IF EXISTS "Admins and approvers can view relevant profiles" ON public.profiles;

CREATE POLICY "Admins and approvers can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'aprovador')
);

-- Create a view for limited profile information that can be safely accessed
CREATE OR REPLACE VIEW public.profiles_limited AS
SELECT 
  id,
  nome,
  role,
  departamento
FROM public.profiles
WHERE 
  -- User can see their own full profile
  user_id = auth.uid()
  OR
  -- Or limited info if they're admin/approver
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'aprovador')
  );

-- Grant access to the limited view
GRANT SELECT ON public.profiles_limited TO authenticated;