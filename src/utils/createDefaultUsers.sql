-- Script para criar usuários padrão no Supabase
-- Execute este script no SQL Editor do Supabase após configurar as tabelas

-- 1. Primeiro, criar bucket para anexos no Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anexos', 'anexos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir uploads no bucket anexos
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'Anyone can upload anexos',
  'anexos',
  'true',
  'true'
) ON CONFLICT DO NOTHING;

-- 3. Permitir downloads no bucket anexos
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
VALUES (
  'Anyone can view anexos',
  'anexos',
  'true',
  'true'
) ON CONFLICT DO NOTHING;

-- 4. Criar alguns departamentos exemplo
INSERT INTO departamentos (nome, orcamento_mensal)
VALUES 
  ('Tecnologia da Informação', 50000.00),
  ('Recursos Humanos', 15000.00),
  ('Financeiro', 25000.00),
  ('Marketing', 30000.00),
  ('Operações', 40000.00)
ON CONFLICT DO NOTHING;

-- 5. Criar alguns fornecedores exemplo
INSERT INTO fornecedores (nome, cnpj, email, telefone, categoria, ativo)
VALUES 
  ('Tech Solutions Ltda', '12.345.678/0001-90', 'contato@techsolutions.com', '(11) 1234-5678', 'Tecnologia', true),
  ('Office Supplies Co', '98.765.432/0001-10', 'vendas@officesupplies.com', '(11) 8765-4321', 'Material de Escritório', true),
  ('Clean Services', '11.222.333/0001-44', 'admin@cleanservices.com', '(11) 2222-3333', 'Limpeza', true),
  ('Security Systems', '44.555.666/0001-77', 'info@securitysystems.com', '(11) 5555-6666', 'Segurança', true)
ON CONFLICT DO NOTHING;

-- IMPORTANTE: Os usuários admin e padrão devem ser criados pela interface de administração
-- ou através do painel do Supabase Auth, pois envolvem criação de contas de autenticação

-- Após criar os usuários no Supabase Auth, você pode atualizar seus profiles:

-- Para o usuário admin (substitua 'USER_ID_ADMIN' pelo ID real do usuário criado):
-- UPDATE profiles 
-- SET nome = 'Administrador do Sistema', 
--     departamento = 'Tecnologia da Informação',
--     cargo = 'Administrador',
--     role = 'admin'
-- WHERE id = 'USER_ID_ADMIN';

-- Para o usuário padrão (substitua 'USER_ID_USER' pelo ID real do usuário criado):
-- UPDATE profiles 
-- SET nome = 'Usuário Teste', 
--     departamento = 'Tecnologia da Informação',
--     cargo = 'Analista',
--     role = 'solicitante'
-- WHERE id = 'USER_ID_USER';

-- Instruções para criar os usuários:
-- 1. Vá para o painel do Supabase
-- 2. Acesse Authentication > Users
-- 3. Clique em "Add user"
-- 4. Crie um usuário admin com email: admin@empresa.com, senha: Admin123!
-- 5. Crie um usuário padrão com email: usuario@empresa.com, senha: User123!
-- 6. Execute os comandos UPDATE acima substituindo os IDs corretos