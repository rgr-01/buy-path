-- Drop existing restrictive policies and add comprehensive admin access

-- ANEXOS: Give admins full access
DROP POLICY IF EXISTS "Users can manage attachments of their requisitions" ON public.anexos;
DROP POLICY IF EXISTS "Users can view attachments of accessible requisitions" ON public.anexos;

CREATE POLICY "Admins have full access to attachments"
ON public.anexos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage attachments of their requisitions"
ON public.anexos
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.id = anexos.uploaded_by
  )
);

CREATE POLICY "Users can view attachments of accessible requisitions"
ON public.anexos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = anexos.requisicao_id 
    AND (p.id = r.solicitante_id OR p.role IN ('aprovador', 'admin'))
  )
);

-- ITENS_REQUISICAO: Give admins full access
DROP POLICY IF EXISTS "Users can manage items of their requisitions" ON public.itens_requisicao;
DROP POLICY IF EXISTS "Users can view items of accessible requisitions" ON public.itens_requisicao;

CREATE POLICY "Admins have full access to requisition items"
ON public.itens_requisicao
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage items of their requisitions"
ON public.itens_requisicao
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id 
    AND p.id = r.solicitante_id 
    AND r.status = 'rascunho'
  )
);

CREATE POLICY "Users can view items of accessible requisitions"
ON public.itens_requisicao
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM requisicoes r
    JOIN profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id 
    AND (p.id = r.solicitante_id OR p.role IN ('aprovador', 'admin'))
  )
);

-- PROFILES: Give admins full management access
DROP POLICY IF EXISTS "Users can update their own profile (except role)" ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- REQUISICOES: Give admins full access including delete
DROP POLICY IF EXISTS "Approvers can update requisitions for approval" ON public.requisicoes;

CREATE POLICY "Admins have full access to requisitions"
ON public.requisicoes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Approvers can update requisitions for approval"
ON public.requisicoes
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'aprovador'::app_role) AND status IN ('pendente', 'aprovada', 'rejeitada'))
);

-- LOG_AUDITORIA: Give admins full access
CREATE POLICY "Admins have full access to audit logs"
ON public.log_auditoria
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));