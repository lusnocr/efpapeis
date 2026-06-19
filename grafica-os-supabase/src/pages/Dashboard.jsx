import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Package, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../utils/api';

const STATUS_BADGE = {
  'Aguardando aprovação': 'badge-aguardando',
  'Em produção': 'badge-producao',
  'Pronto para retirada': 'badge-pronto',
  'Entregue': 'badge-entregue',
  'Cancelado': 'badge-cancelado',
};

export default function Dashboard() {
  const [ordens, setOrdens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getOrdens(), api.getClientes(), api.getProdutos()])
      .then(([o, c, p]) => { setOrdens(o); setClientes(c); setProdutos(p); })
      .finally(() => setLoading(false));
  }, []);

  const abertas = ordens.filter(o => o.status !== 'Entregue' && o.status !== 'Cancelado');
  const prontas = ordens.filter(o => o.status === 'Pronto para retirada');
  const hoje = new Date().toLocaleDateString('pt-BR');
  const recentes = [...ordens].sort((a, b) => b.id - a.id).slice(0, 6);

  const faturamento = ordens
    .filter(o => o.status !== 'Cancelado')
    .reduce((acc, o) => acc + parseFloat(o.valor_total || 0), 0);

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Visão Geral</h1>
          <p>Resumo das operações da EF Comércio de Papéis</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/ordens/nova')}>
          <FileText size={15} />
          Nova OS
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-soft)' }}>
            <FileText size={20} color="var(--accent)" />
          </div>
          <div>
            <div className="stat-value">{abertas.length}</div>
            <div className="stat-label">OS em aberto</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--purple-soft)' }}>
            <AlertCircle size={20} color="var(--purple)" />
          </div>
          <div>
            <div className="stat-value">{prontas.length}</div>
            <div className="stat-label">Prontas para retirada</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-soft)' }}>
            <Users size={20} color="var(--success)" />
          </div>
          <div>
            <div className="stat-value">{clientes.length}</div>
            <div className="stat-label">Clientes cadastrados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-soft)' }}>
            <TrendingUp size={20} color="var(--gold)" />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="stat-label">Faturamento total</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Últimas Ordens de Serviço</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ordens')}>
            Ver todas
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>Carregando...</p>
          ) : recentes.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>Nenhuma OS ainda</h3>
              <p>Crie a primeira ordem de serviço</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/ordens/nova')}>Nova OS</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nº OS</th>
                    <th>Cliente</th>
                    <th>Prazo</th>
                    <th>Valor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map(os => (
                    <tr key={os.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/ordens/${os.id}`)}>
                      <td><span className="os-number">#{os.numero}</span></td>
                      <td><strong>{os.cliente_nome}</strong></td>
                      <td>{os.prazo_entrega || '—'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {parseFloat(os.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[os.status] || 'badge-aguardando'}`}>
                          {os.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
