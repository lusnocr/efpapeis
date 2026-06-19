import { supabase } from '../lib/supabase';

// Auth (simples, senha local)
export const api = {
  login: async (password) => {
    const validPassword = import.meta.env.VITE_APP_PASSWORD;
    if (password === validPassword) {
      return { success: true };
    }
    throw new Error('Senha incorreta');
  },

  // Clientes
  getClientes: async () => {
    const { data, error } = await supabase.from('clientes').select('*').order('nome');
    if (error) throw new Error(error.message);
    return data || [];
  },
  createCliente: async (data) => {
    const { data: result, error } = await supabase.from('clientes').insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  },
  updateCliente: async ({ id, ...data }) => {
    const { error } = await supabase.from('clientes').update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },
  deleteCliente: async (id) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Produtos
  getProdutos: async () => {
    const { data, error } = await supabase.from('produtos').select('*').order('nome');
    if (error) throw new Error(error.message);
    return data || [];
  },
  createProduto: async (data) => {
    const { data: result, error } = await supabase.from('produtos').insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  },
  updateProduto: async ({ id, ...data }) => {
    const { error } = await supabase.from('produtos').update(data).eq('id', id);
    if (error) throw new Error(error.message);
  },
  deleteProduto: async (id) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Ordens de Serviço
  getOrdens: async () => {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*, itens_os(*)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(os => ({ ...os, itens: os.itens_os || [] }));
  },
  createOrdem: async ({ itens, ...osData }) => {
    // Gerar número sequencial
    const { count } = await supabase.from('ordens_servico').select('*', { count: 'exact', head: true });
    const numero = String((count || 0) + 1).padStart(5, '0');

    const { data: os, error } = await supabase
      .from('ordens_servico')
      .insert({ ...osData, numero, data_criacao: new Date().toLocaleDateString('pt-BR') })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (itens && itens.length > 0) {
      const validItens = itens.filter(it => it.produto_nome || it.descricao_item);
      if (validItens.length > 0) {
        const { error: itensError } = await supabase.from('itens_os').insert(
          validItens.map(it => ({ ...it, os_id: os.id }))
        );
        if (itensError) throw new Error(itensError.message);
      }
    }
    return os;
  },
  updateOrdem: async ({ id, itens, itens_os, ...osData }) => {
    const { error } = await supabase.from('ordens_servico').update(osData).eq('id', id);
    if (error) throw new Error(error.message);

    if (itens !== undefined) {
      // Remove itens antigos e re-insere
      await supabase.from('itens_os').delete().eq('os_id', id);
      const validItens = (itens || []).filter(it => it.produto_nome || it.descricao_item);
      if (validItens.length > 0) {
        const { error: itensError } = await supabase.from('itens_os').insert(
          validItens.map(({ id: _id, os_id: _osId, ...it }) => ({ ...it, os_id: id }))
        );
        if (itensError) throw new Error(itensError.message);
      }
    }
  },
  deleteOrdem: async (id) => {
    await supabase.from('itens_os').delete().eq('os_id', id);
    const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
