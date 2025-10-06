-- Step 1: Create enum type for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'aprovador', 'solicitante');

-- Step 2: Create user_roles table with proper structure
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 6: Create helper function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'aprovador') THEN 'aprovador'
    ELSE 'solicitante'
  END
$$;

-- Step 7: RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 8: Update profiles RLS policies to use new role system
DROP POLICY IF EXISTS "Admins and approvers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Admins and approvers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'aprovador')
);

CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 9: Drop the unused and insecure profiles_basic view
DROP VIEW IF EXISTS public.profiles_basic;

-- Step 10: Restrict supplier data access
DROP POLICY IF EXISTS "Users can view active suppliers" ON public.fornecedores;

CREATE POLICY "Aprovadores and admins can view suppliers"
ON public.fornecedores
FOR SELECT
TO authenticated
USING (
  ativo = true AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'aprovador')
  )
);

-- Step 11: Restrict department budget data (keep department names visible)
DROP POLICY IF EXISTS "Users can view all departments" ON public.departamentos;

CREATE POLICY "Users can view department names only"
ON public.departamentos
FOR SELECT
TO authenticated
USING (true);

-- Step 12: Update requisicoes policies to use new role system
DROP POLICY IF EXISTS "Approvers can update requisitions for approval" ON public.requisicoes;
DROP POLICY IF EXISTS "Users can view requisitions they created or need to approve" ON public.requisicoes;

CREATE POLICY "Approvers can update requisitions for approval"
ON public.requisicoes
FOR UPDATE
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'aprovador')) AND
  status IN ('pendente', 'aprovada', 'rejeitada')
);

CREATE POLICY "Users can view requisitions they created or need to approve"
ON public.requisicoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (
      profiles.id = requisicoes.solicitante_id OR
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'aprovador')
    )
  )
);

-- Step 13: Update audit log policies
DROP POLICY IF EXISTS "Admins and approvers can view audit logs" ON public.log_auditoria;

CREATE POLICY "Admins and approvers can view audit logs"
ON public.log_auditoria
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'aprovador')
);

-- Step 14: Update departamentos admin policy
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departamentos;

CREATE POLICY "Admins can manage departments"
ON public.departamentos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 15: Update fornecedores admin policy  
DROP POLICY IF EXISTS "Admins can manage suppliers" ON public.fornecedores;

CREATE POLICY "Admins can manage suppliers"
ON public.fornecedores
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));