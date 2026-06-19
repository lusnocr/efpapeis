import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, User, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../utils/api';

const STATUS_BADGE = {
  'Aguardando aprovação': 'badge-aguardando',
  'Em produção': 'badge-producao',
  'Pronto para retirada': 'badge-pronto',
  'Entregue': 'badge-entregue',
  'Cancelado': 'badge-cancelado',
};

const STATUS_LIST = ['Todos', 'Aguardando aprovação', 'Em produção', 'Pronto para retirada', 'Entregue', 'Cancelado'];

export default function Ordens() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const navigate = useNavigate();

  useEffect(() => {
    api.getOrdens().then(setOrdens).finally(() => setLoading(false));
  }, []);

  const filtered = ordens
    .filter(o => statusFilter === 'Todos' || o.status === statusFilter)
    .filter(o =>
      o.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
      o.numero?.includes(search) ||
      o.vendedor?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.id - a.id);

  return (
    <Layout title="Ordens de Serviço">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Ordens de Serviço</h1>
          <p>{ordens.filter(o => o.status !== 'Entregue' && o.status !== 'Cancelado').length} OS em aberto</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/ordens/nova')}>
          <Plus size={15} /> Nova OS
        </button>
      </div>

      {/* Filtros de status */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {STATUS_LIST.map(s => {
          const count = s === 'Todos' ? ordens.length : ordens.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={15} />
            <input className="form-control" placeholder="Buscar por cliente, nº OS ou vendedor..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-muted text-sm">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>Nenhuma OS encontrada</h3>
            <p>{search || statusFilter !== 'Todos' ? 'Tente outros filtros' : 'Emita a primeira ordem de serviço'}</p>
            {!search && statusFilter === 'Todos' && (
              <button className="btn btn-primary mt-4" onClick={() => navigate('/ordens/nova')}>
                <Plus size={15} /> Nova OS
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: '8px 16px 16px' }}>
            {filtered.map(os => (
              <div key={os.id} className="os-card" onClick={() => navigate(`/ordens/${os.id}`)}>
                <div className="os-card-left">
                  <div className="os-card-number">OS #{os.numero}</div>
                  <div className="os-card-client">{os.cliente_nome}</div>
                  <div className="os-card-meta flex gap-3">
                    {os.prazo_entrega && (
                      <span className="flex items-center gap-2">
                        <Calendar size={12} />
                        Prazo: {os.prazo_entrega}
                      </span>
                    )}
                    {os.vendedor && (
                      <span className="flex items-center gap-2">
                        <User size={12} />
                        {os.vendedor}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      Itens: {(os.itens || []).length}
                    </span>
                  </div>
                </div>
                <div className="os-card-right">
                  <span className={`badge ${STATUS_BADGE[os.status] || 'badge-aguardando'}`}>
                    {os.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                    {parseFloat(os.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
