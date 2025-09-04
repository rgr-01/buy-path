-- Criar usuários padrão usando as extensões admin do Supabase
-- Primeiro, vamos verificar se a extensão http está disponível
SELECT * FROM pg_available_extensions WHERE name = 'http';

-- Função temporária para criar usuários via Admin API
CREATE OR REPLACE FUNCTION create_demo_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_admin_id uuid;
    user_aprovador_id uuid;
    user_solicitante_id uuid;
BEGIN
    -- Inserir usuários diretamente na tabela auth.users (apenas para demonstração)
    -- NOTA: Em produção, use a Admin API ou dashboard do Supabase
    
    -- Usuário Admin
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@empresa.com',
        crypt('Admin123!', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nome": "Administrador Sistema"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_admin_id;

    -- Criar perfil do admin
    INSERT INTO public.profiles (user_id, nome, email, departamento, cargo, role)
    VALUES (user_admin_id, 'Administrador Sistema', 'admin@empresa.com', 'TI', 'Administrador', 'admin');

    -- Usuário Aprovador
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'aprovador@empresa.com',
        crypt('Aprovador123!', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nome": "Gestor Aprovador"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_aprovador_id;

    -- Criar perfil do aprovador
    INSERT INTO public.profiles (user_id, nome, email, departamento, cargo, role)
    VALUES (user_aprovador_id, 'Gestor Aprovador', 'aprovador@empresa.com', 'Compras', 'Gerente', 'aprovador');

    -- Usuário Solicitante
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'usuario@empresa.com',
        crypt('Usuario123!', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nome": "Usuário Padrão"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_solicitante_id;

    -- Criar perfil do usuário
    INSERT INTO public.profiles (user_id, nome, email, departamento, cargo, role)
    VALUES (user_solicitante_id, 'Usuário Padrão', 'usuario@empresa.com', 'RH', 'Analista', 'solicitante');

    RAISE NOTICE 'Usuários criados com sucesso!';
END;
$$;

-- Executar a função para criar os usuários
SELECT create_demo_users();

-- Remover a função temporária
DROP FUNCTION create_demo_users();