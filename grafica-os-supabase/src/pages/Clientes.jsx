import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, User, Phone, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

const EMPTY = {
  nome: '', cpf_cnpj: '', email: '', telefone: '', celular: '',
  endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
};

function Modal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { if (open) setForm(initial || EMPTY); }, [open, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome.trim()) { toast('Nome é obrigatório', 'error'); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{initial?.id ? 'Editar Cliente' : 'Novo Cliente'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="section-divider">Dados do Cliente</div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Nome / Razão Social <span>*</span></label>
              <input className="form-control" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome completo ou razão social" />
            </div>
            <div className="form-group">
              <label className="form-label">CPF / CNPJ</label>
              <input className="form-control" value={form.cpf_cnpj} onChange={e => set('cpf_cnpj', e.target.value)} placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-control" value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(00) 0000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Celular / WhatsApp</label>
              <input className="form-control" value={form.celular} onChange={e => set('celular', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>

          <div className="section-divider">Endereço</div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">CEP</label>
              <input className="form-control" value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-control" value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="">Selecione...</option>
                {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Logradouro</label>
              <input className="form-control" value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua, Avenida..." />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Número</label>
              <input className="form-control" value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" />
            </div>
            <div className="form-group">
              <label className="form-label">Complemento</label>
              <input className="form-control" value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto, sala..." />
            </div>
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input className="form-control" value={form.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input className="form-control" value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Cidade" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const load = () => api.getClientes().then(setClientes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.cpf_cnpj || '').includes(search) ||
    (c.celular || '').includes(search)
  );

  const handleSave = async (form) => {
    if (editing?.id) {
      await api.updateCliente({ ...form, id: editing.id });
      toast('Cliente atualizado!', 'success');
    } else {
      await api.createCliente(form);
      toast('Cliente cadastrado!', 'success');
    }
    load();
  };

  const handleDelete = async (id, nome) => {
    if (!confirm(`Excluir o cliente "${nome}"?`)) return;
    await api.deleteCliente(id);
    toast('Cliente excluído', 'success');
    load();
  };

  return (
    <Layout title="Clientes">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Clientes</h1>
          <p>{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={15} />
          Novo Cliente
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={15} />
            <input className="form-control" placeholder="Buscar por nome, CPF/CNPJ ou celular..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</p>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <User size={48} />
              <h3>Nenhum cliente encontrado</h3>
              <p>{search ? 'Tente outro termo de busca' : 'Cadastre o primeiro cliente'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>CPF / CNPJ</th>
                  <th>Contato</th>
                  <th>Cidade / UF</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.nome}</strong>
                      {c.email && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>}
                    </td>
                    <td>{c.cpf_cnpj || '—'}</td>
                    <td>
                      {c.celular && <div>{c.celular}</div>}
                      {c.telefone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.telefone}</div>}
                    </td>
                    <td>{c.cidade ? `${c.cidade}${c.estado ? ` / ${c.estado}` : ''}` : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(c); setModal(true); }}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(c.id, c.nome)}>
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
