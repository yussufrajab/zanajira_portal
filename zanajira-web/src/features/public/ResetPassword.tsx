import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Maneno ya siri hayalingani'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: params.get('token'), password, confirm_password: confirm });
      navigate('/login?reset=1');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Kuweka upya kumeshindwa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="absolute inset-0 hero-pattern opacity-[0.03] pointer-events-none" />
      <div className="relative w-full max-w-[420px] animate-scale-in">
        <div className="card p-8" style={{ boxShadow: 'var(--shadow-modal)' }}>
          <div className="flex flex-col items-center mb-8">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="23" stroke="#1B4F72" strokeWidth="2" />
              <polygon points="24,4 44,24 24,44 4,24" stroke="#1B4F72" strokeWidth="1.5" fill="none" />
              <circle cx="24" cy="24" r="6" fill="#C0932A" />
              <circle cx="24" cy="24" r="3" fill="#1B4F72" />
            </svg>
            <h1 className="font-display text-[28px] font-bold text-text-primary mt-4">Weka Neno la Siri Jipya</h1>
            <p className="text-text-secondary text-sm font-body mt-1">Chagua neno la siri jipya kwa akaunti yako</p>
          </div>

          {error && (
            <div className="alert-danger mb-5 animate-fade-in" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <input
                id="reset-pass"
                type="password"
                placeholder=" "
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field peer"
                required
                autoComplete="new-password"
              />
              <label htmlFor="reset-pass" className="input-label input-label-required">Neno la Siri Jipya</label>
            </div>

            <div className="input-group">
              <input
                id="reset-confirm"
                type="password"
                placeholder=" "
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input-field peer"
                required
                autoComplete="new-password"
              />
              <label htmlFor="reset-confirm" className="input-label input-label-required">Thibitisha Neno la Siri</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-12">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Inahifadhi...
                </span>
              ) : 'Hifadhi Neno la Siri'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}