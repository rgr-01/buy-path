
-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow public read access to logos
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');

-- Allow authenticated users to update/delete logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- Create empresa_config table for company settings
CREATE TABLE public.empresa_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  nome_empresa TEXT NOT NULL DEFAULT 'Minha Empresa Ltda',
  cnpj TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read config
CREATE POLICY "Authenticated users can read config"
ON public.empresa_config
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify config
CREATE POLICY "Admins can insert config"
ON public.empresa_config
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update config"
ON public.empresa_config
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Trigger for updated_at
CREATE TRIGGER update_empresa_config_updated_at
BEFORE UPDATE ON public.empresa_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.empresa_config (nome_empresa) VALUES ('Minha Empresa Ltda');
