# 🐳 Executando o Sistema Compras Pro com Docker

Este guia te ajuda a rodar o sistema localmente usando Docker.

## 📋 Pré-requisitos

- Docker Desktop instalado
- Docker Compose instalado
- Git para clonar o repositório

## 🚀 Execução Rápida

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd compras-pro
```

### 2. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.docker .env

# Edite o arquivo .env com suas configurações do Supabase
nano .env
```

### 3. Execute em modo desenvolvimento
```bash
# Para desenvolvimento (com hot reload)
docker-compose -f docker-compose.dev.yml up --build

# A aplicação estará disponível em: http://localhost:5173
```

### 4. Execute em modo produção
```bash
# Para produção
docker-compose up --build

# A aplicação estará disponível em: http://localhost:3000
```

## 🔧 Comandos Úteis

### Parar os containers
```bash
docker-compose down
```

### Limpar volumes (apaga dados do banco)
```bash
docker-compose down -v
```

### Ver logs dos containers
```bash
# Todos os logs
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f compras-pro-app
```

### Executar comandos dentro do container
```bash
# Entrar no container da aplicação
docker-compose exec compras-pro-app sh

# Executar npm install
docker-compose exec compras-pro-app npm install
```

## 🗄️ Configuração do Banco de Dados

### Opção 1: Supabase Online (Recomendado)
1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis no arquivo `.env`:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### Opção 2: PostgreSQL Local
O docker-compose já inclui um container PostgreSQL local.

## 🔒 Configurações de Segurança

### Para produção, altere:
- Senhas padrão do PostgreSQL
- Chaves do Supabase
- Configurações de CORS

## 🌐 Portas Utilizadas

- **3000**: Aplicação em produção (nginx)
- **5173**: Aplicação em desenvolvimento (Vite)
- **5432**: PostgreSQL
- **3001**: Supabase Studio (opcional)

## 🛠️ Estrutura dos Arquivos Docker

```
├── Dockerfile              # Build de produção
├── Dockerfile.dev          # Build de desenvolvimento  
├── docker-compose.yml      # Orquestração produção
├── docker-compose.dev.yml  # Orquestração desenvolvimento
├── nginx.conf              # Configuração do nginx
├── .dockerignore           # Arquivos ignorados no build
├── .env.docker             # Variáveis de ambiente exemplo
└── DOCKER_README.md        # Este arquivo
```

## 🐛 Resolução de Problemas

### Problema: Porta já em uso
```bash
# Mate processos na porta
sudo lsof -ti:3000 | xargs kill -9
```

### Problema: Permissões no Linux
```bash
# Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
```

### Problema: Banco não conecta
1. Verifique se o container do PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Aguarde alguns segundos para o banco inicializar

## 📱 Testando a aplicação

Após iniciar os containers:

1. Acesse: http://localhost:3000 (produção) ou http://localhost:5173 (dev)
2. Faça login com:
   - **Admin**: admin@compras.com / admin123
   - **Aprovador**: aprovador@compras.com / aprovador123  
   - **Solicitante**: solicitante@compras.com / solicitante123

## 💡 Dicas

- Use o modo desenvolvimento para fazer alterações no código
- Use o modo produção para testes finais
- Mantenha backups dos dados importantes
- Configure SSL para ambientes de produção real

## 🆘 Precisa de ajuda?

Se tiver problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Reinicie os containers: `docker-compose restart`
3. Reconstrua as imagens: `docker-compose up --build`