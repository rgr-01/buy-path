-- Criar usuários padrão para teste
-- IMPORTANTE: Execute estes comandos no Supabase SQL Editor, pois a criação de usuários auth requer privilégios especiais

-- Primeiro, vamos inserir dados de exemplo para departamentos e fornecedores
INSERT INTO public.departamentos (nome, orcamento_mensal) VALUES 
('TI', 50000.00),
('RH', 25000.00),
('Financeiro', 100000.00),
('Compras', 75000.00)
ON CONFLICT DO NOTHING;

INSERT INTO public.fornecedores (nome, cnpj, email, telefone, categoria, endereco) VALUES 
('Tech Supplies Ltda', '12.345.678/0001-90', 'contato@techsupplies.com', '(11) 99999-1111', 'Tecnologia', 'Rua da Tecnologia, 123 - São Paulo, SP'),
('Office Pro Equipamentos', '98.765.432/0001-10', 'vendas@officepro.com', '(11) 88888-2222', 'Escritório', 'Av. Comercial, 456 - São Paulo, SP'),
('Material Express', '11.222.333/0001-44', 'pedidos@materialexpress.com', '(11) 77777-3333', 'Material de Escritório', 'Rua dos Suprimentos, 789 - São Paulo, SP')
ON CONFLICT DO NOTHING;

-- INSTRUÇÕES PARA CRIAR USUÁRIOS:
-- 1. Acesse o Supabase Dashboard > Authentication > Users
-- 2. Clique em "Add user" e crie os seguintes usuários:

-- USUÁRIO ADMIN:
-- Email: admin@empresa.com
-- Password: Admin123!
-- Após criar, copie o UUID do usuário e execute:
-- UPDATE public.profiles SET role = 'admin', nome = 'Administrador Sistema', departamento = 'TI', cargo = 'Administrador' WHERE email = 'admin@empresa.com';

-- USUÁRIO APROVADOR:
-- Email: aprovador@empresa.com  
-- Password: Aprovador123!
-- Após criar, copie o UUID do usuário e execute:
-- UPDATE public.profiles SET role = 'aprovador', nome = 'Gestor Aprovador', departamento = 'Compras', cargo = 'Gerente' WHERE email = 'aprovador@empresa.com';

-- USUÁRIO SOLICITANTE:
-- Email: usuario@empresa.com
-- Password: Usuario123!
-- Após criar, copie o UUID do usuário e execute:
-- UPDATE public.profiles SET role = 'solicitante', nome = 'Usuário Padrão', departamento = 'RH', cargo = 'Analista' WHERE email = 'usuario@empresa.com';

-- Comentário: Os perfis serão criados automaticamente pelo trigger handle_new_user() quando os usuários fizerem login pela primeira vez