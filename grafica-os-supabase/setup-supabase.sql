-- =============================================
-- EF COMÉRCIO DE PAPÉIS LTDA — Setup Supabase
-- Execute isso no SQL Editor do Supabase
-- =============================================

-- Tabela de Clientes
create table clientes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  cpf_cnpj text,
  email text,
  telefone text,
  celular text,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  created_at timestamptz default now()
);

-- Tabela de Produtos
create table produtos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  descricao text,
  unidade text default 'un',
  preco numeric(10,2) default 0,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Tabela de Ordens de Serviço
create table ordens_servico (
  id uuid default gen_random_uuid() primary key,
  numero text not null,
  cliente_id uuid references clientes(id),
  cliente_nome text not null,
  vendedor text,
  data_criacao text,
  prazo_entrega text,
  status text default 'Aguardando aprovação',
  forma_pagamento text,
  valor_total numeric(10,2) default 0,
  observacoes text,
  arte_aprovada text default 'Não',
  created_at timestamptz default now()
);

-- Tabela de Itens da OS
create table itens_os (
  id uuid default gen_random_uuid() primary key,
  os_id uuid references ordens_servico(id) on delete cascade,
  produto_id uuid,
  produto_nome text,
  quantidade numeric(10,3) default 1,
  preco_unitario numeric(10,2) default 0,
  subtotal numeric(10,2) default 0,
  descricao_item text,
  created_at timestamptz default now()
);

-- =============================================
-- Políticas de acesso (RLS)
-- Permite leitura e escrita com a chave anon
-- =============================================
alter table clientes enable row level security;
alter table produtos enable row level security;
alter table ordens_servico enable row level security;
alter table itens_os enable row level security;

create policy "allow_all_clientes" on clientes for all using (true) with check (true);
create policy "allow_all_produtos" on produtos for all using (true) with check (true);
create policy "allow_all_ordens" on ordens_servico for all using (true) with check (true);
create policy "allow_all_itens" on itens_os for all using (true) with check (true);
