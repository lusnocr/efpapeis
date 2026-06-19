import { useState, useEffect } from 'react';
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

const VENDEDOR = {
  nome: 'EF COMÉRCIO DE PAPÉIS LTDA',
  endereco: 'Rua Manuel Pitta, 43',
  cep: '02478-000',
  cidade: 'São Paulo – SP',
};

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
    const w = window.open('', '_blank');
    w.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR"><head><meta charset="UTF-8"/><title>OS #${os.numero} — EF Comércio de Papéis</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #1a1a2e; background: white; padding: 28px 32px; }

        /* Topo */
        .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 3px solid #1a1a2e; margin-bottom: 20px; }
        .doc-header-left .company-name { font-size: 15px; font-weight: 800; letter-spacing: .02em; color: #1a1a2e; }
        .doc-header-left .company-address { font-size: 10px; color: #555; margin-top: 4px; line-height: 1.5; }
        .doc-header-right { text-align: right; }
        .doc-header-right .os-label { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #888; }
        .doc-header-right .os-number { font-size: 26px; font-weight: 800; color: #e94560; line-height: 1; margin-top: 2px; }
        .doc-header-right .os-date { font-size: 10px; color: #888; margin-top: 4px; }

        /* Seção de partes */
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e2e5ee; border: 1px solid #e2e5ee; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
        .party { background: white; padding: 14px 16px; }
        .party-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #e94560; margin-bottom: 6px; }
        .party-name { font-size: 13px; font-weight: 700; color: #1a1a2e; }
        .party-detail { font-size: 10px; color: #555; margin-top: 3px; line-height: 1.5; }

        /* Info da OS */
        .os-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e2e5ee; border: 1px solid #e2e5ee; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
        .os-info-cell { background: white; padding: 10px 14px; }
        .os-info-cell label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #999; display: block; margin-bottom: 3px; }
        .os-info-cell p { font-size: 11px; font-weight: 600; color: #1a1a2e; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9.5px; font-weight: 700; background: #fef3c7; color: #92400e; }

        /* Itens */
        .section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #999; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        thead tr { background: #1a1a2e; }
        thead th { padding: 8px 12px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,.8); text-align: left; }
        thead th:last-child { text-align: right; }
        thead th:nth-child(2), thead th:nth-child(3) { text-align: center; }
        tbody tr:nth-child(even) { background: #f7f8fc; }
        tbody td { padding: 8px 12px; font-size: 10.5px; border-bottom: 1px solid #edf0f7; vertical-align: middle; }
        tbody td:last-child { text-align: right; font-weight: 700; }
        tbody td:nth-child(2), tbody td:nth-child(3) { text-align: center; }
        .item-name { font-weight: 600; font-size: 10.5px; }
        .item-desc { font-size: 9.5px; color: #777; margin-top: 2px; }

        /* Total */
        .total-bar { background: #1a1a2e; border-radius: 6px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .total-bar span { font-size: 10px; font-weight: 600; color: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: .08em; }
        .total-bar strong { font-size: 18px; font-weight: 800; color: #fff; }

        /* Obs */
        .obs-box { background: #fffbf0; border: 1px solid #f5e9a0; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; }
        .obs-box p { font-size: 10.5px; color: #555; line-height: 1.6; }

        /* Assinaturas */
        .sign-area { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; padding-top: 36px; border-top: 1px dashed #ccc; }
        .sign-block { text-align: center; }
        .sign-line { border-top: 1px solid #aaa; padding-top: 6px; margin-top: 40px; }
        .sign-line p { font-size: 10px; font-weight: 600; color: #333; }
        .sign-line span { font-size: 9px; color: #888; }

        /* Rodapé */
        .doc-footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #eee; display: flex; justify-content: space-between; }
        .doc-footer span { font-size: 9px; color: #bbb; }

        @page { margin: 16mm; }
      </style>
      </head><body>

      <div class="doc-header">
        <div class="doc-header-left">
          <div class="company-name">EF COMÉRCIO DE PAPÉIS LTDA</div>
          <div class="company-address">
            Rua Manuel Pitta, 43 • CEP 02478-000<br/>
            São Paulo – SP
          </div>
        </div>
        <div class="doc-header-right">
          <div class="os-label">Ordem de Serviço</div>
          <div class="os-number">#${os.numero}</div>
          <div class="os-date">Emitida em ${os.data_criacao}</div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-label">Vendedor</div>
          <div class="party-name">EF COMÉRCIO DE PAPÉIS LTDA</div>
          <div class="party-detail">
            Rua Manuel Pitta, 43 — CEP 02478-000<br/>
            São Paulo – SP
          </div>
        </div>
        <div class="party">
          <div class="party-label">Cliente</div>
          <div class="party-name">${os.cliente_nome}</div>
          <div class="party-detail">&nbsp;</div>
        </div>
      </div>

      <div class="os-info">
        <div class="os-info-cell">
          <label>Prazo de entrega</label>
          <p>${os.prazo_entrega || '—'}</p>
        </div>
        <div class="os-info-cell">
          <label>Forma de pagamento</label>
          <p>${os.forma_pagamento || '—'}</p>
        </div>
        <div class="os-info-cell">
          <label>Arte aprovada</label>
          <p>${os.arte_aprovada || 'Não'}</p>
        </div>
        <div class="os-info-cell">
          <label>Status</label>
          <p><span class="badge">${os.status}</span></p>
        </div>
      </div>

      <div class="section-label">Itens do pedido</div>
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
          ${(os.itens || []).map(it => `
            <tr>
              <td>
                <div class="item-name">${it.produto_nome || '—'}</div>
                ${it.descricao_item ? `<div class="item-desc">${it.descricao_item}</div>` : ''}
              </td>
              <td>${it.quantidade}</td>
              <td>${parseFloat(it.preco_unitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>${parseFloat(it.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-bar">
        <span>Total da OS</span>
        <strong>${parseFloat(os.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
      </div>

      ${os.observacoes ? `
        <div class="section-label">Observações</div>
        <div class="obs-box"><p>${os.observacoes}</p></div>
      ` : ''}

      <div class="sign-area">
        <div class="sign-block">
          <div class="sign-line">
            <p>${os.cliente_nome}</p>
            <span>Assinatura do cliente</span>
          </div>
        </div>
        <div class="sign-block">
          <div class="sign-line">
            <p>EF Comércio de Papéis Ltda</p>
            <span>Responsável</span>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>EF Comércio de Papéis Ltda • Rua Manuel Pitta, 43 • CEP 02478-000 • São Paulo – SP</span>
        <span>OS #${os.numero} • ${os.data_criacao}</span>
      </div>

      </body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
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

      {/* Visualização no sistema */}
      <div className="card mb-4" style={{ overflow: 'hidden' }}>
        {/* Header escuro */}
        <div style={{ background: 'var(--brand)', color: 'white', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, opacity: .5, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Ordem de Serviço</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>#{os.numero}</div>
            <div style={{ fontSize: 11, opacity: .5, marginTop: 4 }}>Emitida em {os.data_criacao}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>EF COMÉRCIO DE PAPÉIS LTDA</div>
            <div style={{ fontSize: 11, opacity: .5, marginTop: 3 }}>Rua Manuel Pitta, 43 • 02478-000 • São Paulo</div>
          </div>
        </div>

        {/* Partes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 24px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--accent)', marginBottom: 6 }}>Vendedor</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>EF Comércio de Papéis Ltda</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Rua Manuel Pitta, 43 — CEP 02478-000</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>São Paulo – SP</div>
          </div>
          <div style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--accent)', marginBottom: 6 }}>Cliente</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{os.cliente_nome}</div>
          </div>
        </div>

        {/* Info cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {[
            { label: 'Prazo de entrega', value: os.prazo_entrega || '—' },
            { label: 'Forma de pagamento', value: os.forma_pagamento || '—' },
            { label: 'Arte aprovada', value: os.arte_aprovada || 'Não' },
            { label: 'Status', value: <span className={`badge ${STATUS_BADGE[os.status] || ''}`}>{os.status}</span> },
          ].map((f, i) => (
            <div key={i} style={{ padding: '12px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Itens */}
        <div style={{ padding: '20px 24px' }}>
          <div className="section-divider">Itens do pedido</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto / Descrição</th>
                  <th style={{ textAlign: 'center' }}>Qtd</th>
                  <th style={{ textAlign: 'center' }}>Preço unit.</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(os.itens || []).length === 0 ? (
                  <tr><td colSpan={4} style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum item</td></tr>
                ) : (os.itens || []).map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{it.produto_nome}</div>
                      {it.descricao_item && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{it.descricao_item}</div>}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 13 }}>{it.quantidade}</td>
                    <td style={{ textAlign: 'center', fontSize: 13 }}>{parseFloat(it.preco_unitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{parseFloat(it.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
            <div style={{ marginTop: 16 }}>
              <div className="section-divider">Observações</div>
              <div style={{ background: '#fffbf0', border: '1px solid #f5e9a0', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: 13, lineHeight: 1.6, color: '#555' }}>
                {os.observacoes}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
