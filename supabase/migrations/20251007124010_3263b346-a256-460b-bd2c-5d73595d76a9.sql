-- Remove all existing policies first to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on anexos
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'anexos' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.anexos';
    END LOOP;
    
    -- Drop all policies on itens_requisicao
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'itens_requisicao' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.itens_requisicao';
    END LOOP;
    
    -- Drop all policies on profiles  
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Drop all policies on requisicoes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'requisicoes' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.requisicoes';
    END LOOP;
    
    -- Drop all policies on log_auditoria except the two readonly ones
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'log_auditoria' AND schemaname = 'public' 
              AND policyname NOT IN ('Admins and approvers can view audit logs', 'System can create audit logs'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.log_auditoria';
    END LOOP;
END $$;

-- ANEXOS: Create comprehensive policies with admin full access
CREATE POLICY "Admins have full access to attachments"
ON public.anexos FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own attachments"
ON public.anexos FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = anexos.uploaded_by)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.id = anexos.uploaded_by)
);

CREATE POLICY "Approvers can view all attachments"
ON public.anexos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'aprovador'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = anexos.requisicao_id AND p.id = r.solicitante_id
  )
);

-- ITENS_REQUISICAO: Create comprehensive policies with admin full access
CREATE POLICY "Admins have full access to requisition items"
ON public.itens_requisicao FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage items in draft requisitions"
ON public.itens_requisicao FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id 
    AND p.id = r.solicitante_id AND r.status = 'rascunho'
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id 
    AND p.id = r.solicitante_id AND r.status = 'rascunho'
  )
);

CREATE POLICY "Users can view items of accessible requisitions"
ON public.itens_requisicao FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'aprovador'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id AND p.id = r.solicitante_id
  )
);

-- PROFILES: Create comprehensive policies with admin full access
CREATE POLICY "Admins can do everything with profiles"
ON public.profiles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Approvers can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'aprovador'::app_role)
);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- REQUISICOES: Create comprehensive policies with admin full access
CREATE POLICY "Admins have full access to requisitions"
ON public.requisicoes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Approvers can view and update requisitions"
ON public.requisicoes FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'aprovador'::app_role) OR
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = requisicoes.solicitante_id)
);

CREATE POLICY "Approvers can update requisitions for approval"
ON public.requisicoes FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'aprovador'::app_role) AND status IN ('pendente', 'aprovada', 'rejeitada'))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'aprovador'::app_role) AND status IN ('pendente', 'aprovada', 'rejeitada'))
);

CREATE POLICY "Users can create requisitions"
ON public.requisicoes FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = requisicoes.solicitante_id)
);

CREATE POLICY "Users can update their own draft requisitions"
ON public.requisicoes FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = requisicoes.solicitante_id 
    AND requisicoes.status = 'rascunho'
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = requisicoes.solicitante_id 
    AND requisicoes.status = 'rascunho'
  )
);

-- LOG_AUDITORIA: Give admins full access
CREATE POLICY "Admins have full access to audit logs"
ON public.log_auditoria FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));