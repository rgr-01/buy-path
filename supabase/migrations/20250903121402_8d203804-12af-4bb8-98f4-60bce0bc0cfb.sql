-- Enable authentication
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  departamento TEXT,
  cargo TEXT,
  role TEXT NOT NULL DEFAULT 'solicitante' CHECK (role IN ('solicitante', 'aprovador', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departamentos table
CREATE TABLE public.departamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  orcamento_mensal DECIMAL(15,2),
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fornecedores table
CREATE TABLE public.fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  categoria TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requisicoes table
CREATE TABLE public.requisicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  solicitante_id UUID NOT NULL REFERENCES public.profiles(id),
  departamento_id UUID REFERENCES public.departamentos(id),
  fornecedor_sugerido_id UUID REFERENCES public.fornecedores(id),
  justificativa TEXT NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'aprovada', 'rejeitada')),
  aprovador_id UUID REFERENCES public.profiles(id),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  observacoes_aprovador TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itens_requisicao table
CREATE TABLE public.itens_requisicao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisicao_id UUID NOT NULL REFERENCES public.requisicoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(15,2) NOT NULL CHECK (preco_unitario >= 0),
  preco_total DECIMAL(15,2) NOT NULL CHECK (preco_total >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anexos table
CREATE TABLE public.anexos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisicao_id UUID NOT NULL REFERENCES public.requisicoes(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo INTEGER,
  tipo_arquivo TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create log_auditoria table
CREATE TABLE public.log_auditoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requisicao_id UUID REFERENCES public.requisicoes(id),
  user_id UUID REFERENCES public.profiles(id),
  acao TEXT NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_requisicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_auditoria ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for departamentos
CREATE POLICY "Users can view all departments" 
ON public.departamentos 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage departments" 
ON public.departamentos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create policies for fornecedores
CREATE POLICY "Users can view active suppliers" 
ON public.fornecedores 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Admins can manage suppliers" 
ON public.fornecedores 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create policies for requisicoes
CREATE POLICY "Users can view requisitions they created or need to approve" 
ON public.requisicoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (
      profiles.id = requisicoes.solicitante_id 
      OR profiles.role IN ('aprovador', 'admin')
    )
  )
);

CREATE POLICY "Users can create requisitions" 
ON public.requisicoes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.id = solicitante_id
  )
);

CREATE POLICY "Users can update their own requisitions in draft" 
ON public.requisicoes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = requisicoes.solicitante_id 
    AND requisicoes.status = 'rascunho'
  )
);

CREATE POLICY "Approvers can update requisitions for approval" 
ON public.requisicoes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('aprovador', 'admin')
    AND requisicoes.status IN ('pendente', 'aprovada', 'rejeitada')
  )
);

-- Create policies for itens_requisicao
CREATE POLICY "Users can view items of accessible requisitions" 
ON public.itens_requisicao 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.requisicoes r
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id
    AND (
      p.id = r.solicitante_id 
      OR p.role IN ('aprovador', 'admin')
    )
  )
);

CREATE POLICY "Users can manage items of their requisitions" 
ON public.itens_requisicao 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.requisicoes r
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE r.id = itens_requisicao.requisicao_id
    AND p.id = r.solicitante_id
    AND r.status = 'rascunho'
  )
);

-- Create policies for anexos
CREATE POLICY "Users can view attachments of accessible requisitions" 
ON public.anexos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.requisicoes r
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE r.id = anexos.requisicao_id
    AND (
      p.id = r.solicitante_id 
      OR p.role IN ('aprovador', 'admin')
    )
  )
);

CREATE POLICY "Users can manage attachments of their requisitions" 
ON public.anexos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.id = anexos.uploaded_by
  )
);

-- Create policies for log_auditoria
CREATE POLICY "Admins and approvers can view audit logs" 
ON public.log_auditoria 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('aprovador', 'admin')
  )
);

CREATE POLICY "System can create audit logs" 
ON public.log_auditoria 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requisicoes_updated_at
  BEFORE UPDATE ON public.requisicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'solicitante'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate requisition codes
CREATE OR REPLACE FUNCTION public.generate_requisicao_codigo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
    NEW.codigo = 'REQ-' || to_char(NOW(), 'YYYY') || '-' || 
                 LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 100000)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic code generation
CREATE TRIGGER generate_requisicao_codigo_trigger
  BEFORE INSERT ON public.requisicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_requisicao_codigo();

-- Create function to update requisition total value
CREATE OR REPLACE FUNCTION public.update_requisicao_valor_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.requisicoes 
  SET valor_total = (
    SELECT COALESCE(SUM(preco_total), 0)
    FROM public.itens_requisicao 
    WHERE requisicao_id = COALESCE(NEW.requisicao_id, OLD.requisicao_id)
  )
  WHERE id = COALESCE(NEW.requisicao_id, OLD.requisicao_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers to update requisition total
CREATE TRIGGER update_valor_total_on_item_insert
  AFTER INSERT ON public.itens_requisicao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_requisicao_valor_total();

CREATE TRIGGER update_valor_total_on_item_update
  AFTER UPDATE ON public.itens_requisicao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_requisicao_valor_total();

CREATE TRIGGER update_valor_total_on_item_delete
  AFTER DELETE ON public.itens_requisicao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_requisicao_valor_total();

-- Insert some initial data
INSERT INTO public.departamentos (nome, orcamento_mensal) VALUES
('Tecnologia da Informação', 50000.00),
('Recursos Humanos', 30000.00),
('Marketing', 25000.00),
('Financeiro', 20000.00),
('Operações', 40000.00);

INSERT INTO public.fornecedores (nome, cnpj, email, telefone, categoria, ativo) VALUES
('Tech Solutions LTDA', '12.345.678/0001-90', 'contato@techsolutions.com', '(11) 9999-1234', 'Tecnologia', true),
('Office Supplies Co.', '98.765.432/0001-10', 'vendas@officesupplies.com', '(11) 8888-5678', 'Material de Escritório', true),
('Services Pro', '11.222.333/0001-44', 'info@servicespro.com', '(11) 7777-9012', 'Serviços', true),
('Hardware Store', '55.666.777/0001-88', 'comercial@hardwarestore.com', '(11) 6666-3456', 'Hardware', true);