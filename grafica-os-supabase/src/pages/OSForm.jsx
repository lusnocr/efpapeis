import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Printer } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

const STATUS_LIST = ['Aguardando aprovação', 'Em produção', 'Pronto para retirada', 'Entregue', 'Cancelado'];
const PAGAMENTO_LIST = ['A vista', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'Cheque', 'Transferência', 'Parcelado'];

const EMPTY_ITEM = { produto_id: '', produto_nome: '', quantidade: '1', preco_unitario: '', subtotal: '', descricao_item: '' };

export default function OSForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    cliente_id: '', cliente_nome: '',
    vendedor: '',
    prazo_entrega: '',
    status: 'Aguardando aprovação',
    forma_pagamento: '',
    valor_total: '',
    observacoes: '',
    arte_aprovada: 'Não',
  });
  const [itens, setItens] = useState([{ ...EMPTY_ITEM }]);

  useEffect(() => {
    Promise.all([api.getClientes(), api.getProdutos()]).then(([c, p]) => {
      setClientes(c);
      setProdutos(p.filter(x => x.ativo === 'true'));
    }).finally(() => setLoading(false));

    if (isEdit) {
      api.getOrdens().then(ordens => {
        const os = ordens.find(o => o.id === id);
        if (os) {
          const { itens: its, ...rest } = os;
          setForm(rest);
          setItens(its.length > 0 ? its : [{ ...EMPTY_ITEM }]);
        }
      });
    }
  }, [id]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setCliente = (clienteId) => {
    const c = clientes.find(x => x.id === clienteId);
    setField('cliente_id', clienteId);
    setField('cliente_nome', c?.nome || '');
  };

  const setItem = (idx, k, v) => {
    setItens(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [k]: v };
      if (k === 'produto_id') {
        const p = produtos.find(x => x.id === v);
        if (p) {
          next[idx].produto_nome = p.nome;
          next[idx].preco_unitario = p.preco;
          const qty = parseFloat(next[idx].quantidade || 1);
          next[idx].subtotal = (qty * parseFloat(p.preco || 0)).toFixed(2);
        }
      }
      if (k === 'quantidade' || k === 'preco_unitario') {
        const qty = parseFloat(k === 'quantidade' ? v : next[idx].quantidade) || 0;
        const price = parseFloat(k === 'preco_unitario' ? v : next[idx].preco_unitario) || 0;
        next[idx].subtotal = (qty * price).toFixed(2);
      }
      return next;
    });
  };

  const addItem = () => setItens(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItens(prev => prev.filter((_, i) => i !== idx));

  const calcTotal = () => itens.reduce((acc, it) => acc + parseFloat(it.subtotal || 0), 0);

  const handleSave = async () => {
    if (!form.cliente_id) { toast('Selecione um cliente', 'error'); return; }
    const validItens = itens.filter(it => it.produto_nome || it.descricao_item);
    if (validItens.length === 0) { toast('Adicione pelo menos um item', 'error'); return; }

    setSaving(true);
    try {
      const total = calcTotal().toFixed(2);
      const payload = { ...form, valor_total: total, itens: validItens };
      if (isEdit) {
        await api.updateOrdem({ ...payload, id });
        toast('OS atualizada com sucesso!', 'success');
      } else {
        await api.createOrdem(payload);
        toast('OS criada com sucesso!', 'success');
      }
      navigate('/ordens');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const total = calcTotal();

  return (
    <Layout title={isEdit ? 'Editar OS' : 'Nova Ordem de Serviço'}>
      <div className="page-header">
        <div className="page-header-left">
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ordens')}>
              <ArrowLeft size={14} /> Voltar
            </button>
          </div>
          <h1>{isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/ordens')}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} />
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Emitir OS'}
          </button>
        </div>
      </div>

      {/* Dados da OS */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Dados da Ordem de Serviço</span>
        </div>
        <div className="card-body">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Cliente <span>*</span></label>
              <select className="form-control" value={form.cliente_id} onChange={e => setCliente(e.target.value)} disabled={loading}>
                <option value="">Selecione o cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vendedor / Atendente</label>
              <input className="form-control" value={form.vendedor} onChange={e => setField('vendedor', e.target.value)} placeholder="Nome do vendedor" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Prazo de entrega</label>
              <input className="form-control" type="date" value={form.prazo_entrega} onChange={e => setField('prazo_entrega', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setField('status', e.target.value)}>
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Arte aprovada?</label>
              <select className="form-control" value={form.arte_aprovada} onChange={e => setField('arte_aprovada', e.target.value)}>
                <option>Não</option>
                <option>Sim</option>
                <option>Aguardando</option>
              </select>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Forma de pagamento</label>
              <select className="form-control" value={form.forma_pagamento} onChange={e => setField('forma_pagamento', e.target.value)}>
                <option value="">Selecione...</option>
                {PAGAMENTO_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Observações</label>
            <textarea className="form-control" value={form.observacoes} onChange={e => setField('observacoes', e.target.value)} placeholder="Instruções especiais, detalhes do serviço, cores, acabamentos..." rows={3} />
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">Itens do Pedido</span>
          <button className="btn btn-secondary btn-sm" onClick={addItem}>
            <Plus size={14} /> Adicionar item
          </button>
        </div>
        <div className="card-body">
          <div className="items-header">
            <span>Produto / Descrição</span>
            <span>Qtd</span>
            <span>Preço unit. (R$)</span>
            <span>Subtotal</span>
            <span></span>
          </div>
          {itens.map((item, idx) => (
            <div key={idx} className="item-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <select
                  className="form-control"
                  value={item.produto_id}
                  onChange={e => setItem(idx, 'produto_id', e.target.value)}
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                <input
                  className="form-control"
                  style={{ fontSize: 12 }}
                  value={item.descricao_item}
                  onChange={e => setItem(idx, 'descricao_item', e.target.value)}
                  placeholder="Descrição adicional (opcional)"
                />
              </div>
              <input
                className="form-control"
                type="number"
                min="1"
                value={item.quantidade}
                onChange={e => setItem(idx, 'quantidade', e.target.value)}
              />
              <input
                className="form-control"
                type="number"
                step="0.01"
                min="0"
                value={item.preco_unitario}
                onChange={e => setItem(idx, 'preco_unitario', e.target.value)}
                placeholder="0,00"
              />
              <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>
                {parseFloat(item.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={() => removeItem(idx)}
                disabled={itens.length === 1}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div className="total-row">
            <span className="total-label">TOTAL DA OS</span>
            <span className="total-value">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
      </div>

      <div className="flex" style={{ justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/ordens')}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={15} />
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Emitir OS'}
        </button>
      </div>
    </Layout>
  );
}
