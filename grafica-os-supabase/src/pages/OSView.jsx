import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Printer, Trash2, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

const STATUS_BADGE = {
  'Aguardando aprovação': 'badge-aguardando',
  'Em produção': 'badge-producao',
  'Pronto para retirada': 'badge-pronto',
  'Entregue': 'badge-entregue',
  'Cancelado': 'badge-cancelado',
};

const STATUS_LIST = ['Aguardando aprovação', 'Em produção', 'Pronto para retirada', 'Entregue', 'Cancelado'];

export default function OSView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [os, setOs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    api.getOrdens().then(ordens => {
      const found = ordens.find(o => o.id === id);
      setOs(found || null);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Excluir esta OS?')) return;
    await api.deleteOrdem(id);
    toast('OS excluída', 'success');
    navigate('/ordens');
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = { ...os, status: newStatus };
      await api.updateOrdem(updated);
      setOs(updated);
      toast(`Status atualizado: ${newStatus}`, 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('os-print-area');
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>OS #${os.numero}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0; }
        .header h1 { font-size: 22px; }
        .header .sub { opacity: .6; font-size: 11px; margin-bottom: 6px; }
        .header .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        .header .field label { font-size: 10px; opacity: .5; text-transform: uppercase; }
        .header .field p { font-weight: 600; font-size: 13px; }
        .body { border: 1px solid #e2e5ee; border-top: none; border-radius: 0 0 8px 8px; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #666; background: #f7f8fc; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e5ee; }
        .total { text-align: right; padding: 12px; background: #f7f8fc; border-radius: 6px; font-size: 18px; font-weight: 700; color: #e94560; }
        .section-title { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #666; margin: 16px 0 8px; }
        .obs { background: #f7f8fc; padding: 12px; border-radius: 6px; font-size: 12px; color: #444; }
        .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; }
        .sign-area { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .sign-line { border-top: 1px solid #ccc; padding-top: 6px; text-align: center; font-size: 11px; color: #666; }
      </style>
      </head><body>
      <div class="header">
        <div class="sub">EF COMÉRCIO DE PAPÉIS LTDA</div>
        <h1>Ordem de Serviço #${os.numero}</h1>
        <div class="grid">
          <div class="field"><label>Cliente</label><p>${os.cliente_nome}</p></div>
          <div class="field"><label>Status</label><p><span class="badge">${os.status}</span></p></div>
          <div class="field"><label>Data de emissão</label><p>${os.data_criacao}</p></div>
          <div class="field"><label>Prazo de entrega</label><p>${os.prazo_entrega || '—'}</p></div>
          <div class="field"><label>Forma de pagamento</label><p>${os.forma_pagamento || '—'}</p></div>
          <div class="field"><label>Vendedor</label><p>${os.vendedor || '—'}</p></div>
        </div>
      </div>
      <div class="body">
        <div class="section-title">Itens do pedido</div>
        <table>
          <thead><tr><th>Produto / Descrição</th><th>Qtd</th><th>Preço unit.</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${(os.itens || []).map(it => `<tr>
              <td>${it.produto_nome}${it.descricao_item ? '<br/><small style="color:#666">' + it.descricao_item + '</small>' : ''}</td>
              <td>${it.quantidade}</td>
              <td>${parseFloat(it.preco_unitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>${parseFloat(it.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="total">TOTAL: ${parseFloat(os.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
        ${os.observacoes ? `<div class="section-title">Observações</div><div class="obs">${os.observacoes}</div>` : ''}
        <div class="sign-area">
          <div class="sign-line">Assinatura do cliente</div>
          <div class="sign-line">EF Comércio de Papéis Ltda</div>
        </div>
        <div class="footer">EF Comércio de Papéis Ltda • OS #${os.numero} emitida em ${os.data_criacao}</div>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (loading) return <Layout title="OS"><p style={{ padding: 40, textAlign: 'center' }}>Carregando...</p></Layout>;
  if (!os) return <Layout title="OS"><p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>OS não encontrada.</p></Layout>;

  const total = (os.itens || []).reduce((acc, it) => acc + parseFloat(it.subtotal || 0), 0);

  return (
    <Layout title={`OS #${os.numero}`}>
      <div className="page-header no-print">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/ordens')}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <h1>Ordem de Serviço <span className="os-number">#{os.numero}</span></h1>
          <p>Emitida em {os.data_criacao}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handlePrint}><Printer size={15} /> Imprimir</button>
          <button className="btn btn-secondary" onClick={() => navigate(`/ordens/${id}/editar`)}><Pencil size={15} /> Editar</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Status rápido */}
      <div className="card mb-4 no-print">
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Atualizar status:</span>
            {STATUS_LIST.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${os.status === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange(s)}
                disabled={updatingStatus || os.status === s}
              >
                {os.status === s && <CheckCircle size={13} />}
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="os-print-area">
        {/* Header */}
        <div className="card mb-4" style={{ overflow: 'hidden' }}>
          <div className="os-view-header">
            <div className="os-view-company">EF COMÉRCIO DE PAPÉIS LTDA</div>
            <div className="os-view-number">OS #{os.numero}</div>
            <div className="os-view-grid">
              <div className="os-view-field">
                <label>Cliente</label>
                <p>{os.cliente_nome}</p>
              </div>
              <div className="os-view-field">
                <label>Status</label>
                <p><span className={`badge ${STATUS_BADGE[os.status] || ''}`}>{os.status}</span></p>
              </div>
              <div className="os-view-field">
                <label>Data de emissão</label>
                <p>{os.data_criacao}</p>
              </div>
              <div className="os-view-field">
                <label>Prazo de entrega</label>
                <p>{os.prazo_entrega || '—'}</p>
              </div>
              <div className="os-view-field">
                <label>Forma de pagamento</label>
                <p>{os.forma_pagamento || '—'}</p>
              </div>
              <div className="os-view-field">
                <label>Vendedor</label>
                <p>{os.vendedor || '—'}</p>
              </div>
              <div className="os-view-field">
                <label>Arte aprovada</label>
                <p>{os.arte_aprovada || 'Não'}</p>
              </div>
            </div>
          </div>

          {/* Itens */}
          <div style={{ padding: '20px 24px' }}>
            <div className="section-divider">Itens do pedido</div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Produto / Descrição</th>
                    <th>Qtd</th>
                    <th>Preço unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(os.itens || []).length === 0 ? (
                    <tr><td colSpan={4} style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum item</td></tr>
                  ) : (os.itens || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{it.produto_nome}</strong>
                        {it.descricao_item && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{it.descricao_item}</div>}
                      </td>
                      <td>{it.quantidade}</td>
                      <td>{parseFloat(it.preco_unitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td style={{ fontWeight: 700 }}>{parseFloat(it.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="total-row">
              <span className="total-label">TOTAL DA OS</span>
              <span className="total-value">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>

            {os.observacoes && (
              <div style={{ marginTop: 20 }}>
                <div className="section-divider">Observações</div>
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 13.5, lineHeight: 1.6 }}>
                  {os.observacoes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
