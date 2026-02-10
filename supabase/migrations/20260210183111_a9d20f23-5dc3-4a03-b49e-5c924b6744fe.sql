-- Allow users to delete their own requisitions (any status)
CREATE POLICY "Users can delete their own requisitions"
ON public.requisicoes
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.id = requisicoes.solicitante_id
  )
);
