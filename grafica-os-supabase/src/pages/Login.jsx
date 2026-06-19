import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      await login(password);
    } catch {
      toast('Senha incorreta. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <h1>EF COMÉRCIO<br/>DE PAPÉIS LTDA</h1>
          <div className="accent-bar" />
          <p style={{ marginTop: 10 }}>Sistema de Gestão de Pedidos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Senha de acesso</label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                className="form-control"
                placeholder="Digite a senha..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            <Lock size={15} />
            {loading ? 'Entrando...' : 'Acessar sistema'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-light)', marginTop: 24 }}>
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
}
