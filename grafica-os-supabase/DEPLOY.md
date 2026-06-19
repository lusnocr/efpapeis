# 🚀 Guia de Deploy — EF Comércio de Papéis LTDA (Supabase)

## Arquitetura (bem simples!)

```
Netlify (Frontend React)
        │
        ▼
Supabase (Banco de dados PostgreSQL gratuito)
```

Sem funções serverless, sem Google Cloud. Só dois serviços gratuitos.

---

## PASSO 1 — Criar conta e projeto no Supabase

1. Acesse supabase.com e crie uma conta gratuita
2. Clique em "New project"
   - Nome: ef-papeis
   - Senha do banco: crie uma senha forte (guarde em algum lugar)
   - Região: South America (São Paulo)
3. Aguarde o projeto ser criado (~1 minuto)

---

## PASSO 2 — Criar as tabelas

1. No painel do Supabase, clique em "SQL Editor" no menu lateral
2. Clique em "New query"
3. Cole todo o conteúdo do arquivo setup-supabase.sql
4. Clique em "Run" (ou Ctrl+Enter)
5. Você verá "Success" — as 4 tabelas foram criadas

---

## PASSO 3 — Pegar as credenciais do Supabase

1. No painel, vá em Settings > API
2. Anote dois valores:
   - Project URL: algo como https://xyzabc.supabase.co
   - anon public key: uma chave longa começando com eyJ...

---

## PASSO 4 — Deploy no Netlify

### Opção A: Upload direto (mais fácil, sem precisar do GitHub)

1. Acesse netlify.com e crie uma conta gratuita
2. Na página inicial, vá em Sites > Add new site > Deploy manually
3. Antes, faça o build local:
   npm install
   npm run build
4. Arraste a pasta dist/ gerada para a área de upload do Netlify

### Opção B: Via GitHub

1. Suba o projeto no GitHub
2. No Netlify: Add new site > Import an existing project
3. Build command: npm run build | Publish directory: dist

---

## PASSO 5 — Configurar variáveis de ambiente no Netlify

Vá em Site configuration > Environment variables > Add variable

VITE_SUPABASE_URL       = Project URL do passo 3
VITE_SUPABASE_ANON_KEY  = anon public key do passo 3
VITE_APP_PASSWORD       = a senha que você quer usar para entrar no sistema

Depois de adicionar: Deploys > Trigger deploy > Deploy site

---

## PASSO 6 — Acessar o sistema

Acesse a URL do seu site no Netlify e faça login com a senha definida em VITE_APP_PASSWORD.

Pronto!

---

## Custos

Netlify Free:    R$ 0,00/mês
Supabase Free:   R$ 0,00/mês (500MB, 50k req/dia)
Total:           R$ 0,00/mês

---

## Ver os dados

No painel do Supabase, clique em "Table Editor" para ver e editar os dados
como se fosse uma planilha.
