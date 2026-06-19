import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Package } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

const EMPTY = { nome: '', descricao: '', unidade: 'un', preco: '', ativo: 'true' };

const UNIDADES = ['un', 'cx', 'pct', 'rma', 'kg', 'g', 'm', 'm²', 'folha', 'bloco', 'bobina'];

function Modal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { if (open) setForm(initial || EMPTY); }, [open, initial]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome.trim()) { toast('Nome é obrigatório', 'error'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">{initial?.id ? 'Editar Produto' : 'Novo Produto'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nome do produto <span>*</span></label>
            <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Cartão de Visita Couchê 250g" />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea className="form-control" value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descrição técnica, especificações..." rows={3} />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Unidade</label>
              <select className="form-control" value={form.unidade} onChange={e => set('unidade', e.target.value)}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Preço unitário (R$)</label>
              <input className="form-control" type="number" step="0.01" min="0" value={form.preco} onChange={e => set('preco', e.target.value)} placeholder="0,00" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.ativo} onChange={e => set('ativo', e.target.value)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const load = () => api.getProdutos().then(setProdutos).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    if (editing?.id) {
      await api.updateProduto({ ...form, id: editing.id });
      toast('Produto atualizado!', 'success');
    } else {
      await api.createProduto(form);
      toast('Produto cadastrado!', 'success');
    }
    load();
  };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Excluir o produto "${nome}"?`)) return;
    await api.deleteProduto(id);
    toast('Produto excluído', 'success');
    load();
  };

  return (
    <Layout title="Produtos">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Produtos</h1>
          <p>{produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={15} />
          Novo Produto
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={15} />
            <input className="form-control" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</p>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>Nenhum produto encontrado</h3>
              <p>{search ? 'Tente outro termo' : 'Cadastre o primeiro produto'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Unidade</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nome}</strong>
                      {p.descricao && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.descricao}</div>}
                    </td>
                    <td>{p.unidade}</td>
                    <td style={{ fontWeight: 600 }}>
                      {parseFloat(p.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td>
                      <span className={`badge ${p.ativo === 'true' ? 'badge-entregue' : 'badge-cancelado'}`}>
                        {p.ativo === 'true' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(p); setModal(true); }}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(p.id, p.nome)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} onSave={handleSave} initial={editing} />
    </Layout>
  );
}
