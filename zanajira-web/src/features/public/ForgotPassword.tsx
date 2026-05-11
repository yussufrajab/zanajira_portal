import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="absolute inset-0 hero-pattern opacity-[0.03] pointer-events-none" />
      <div className="relative w-full max-w-[420px] animate-scale-in">
        <div className="card p-8 text-center" style={{ boxShadow: 'var(--shadow-modal)' }}>
          {/* Envelope illustration */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 120 100" className="w-28 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="30" width="100" height="60" rx="8" fill="#D6E8F7" stroke="#1B4F72" strokeWidth="2" />
              <path d="M10 30 L60 65 L110 30" stroke="#1B4F72" strokeWidth="2" fill="none" />
              <path d="M10 90 L45 60" stroke="#1B4F72" strokeWidth="1.5" opacity="0.4" />
              <path d="M110 90 L75 60" stroke="#1B4F72" strokeWidth="1.5" opacity="0.4" />
              <path d="M60 5 L63 15 L73 15 L65 21 L68 31 L60 25 L52 31 L55 21 L47 15 L57 15Z" fill="#C0932A" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Angalia Barua Pepe Yako</h2>
          <p className="text-text-secondary text-sm font-body mb-6">
            Ikiwa barua pepe hiyo imesajiliwa, tumetuma kiungo cha kuweka upya neno la siri.
          </p>
          <Link to="/login" className="btn-primary w-full h-12 inline-flex items-center justify-center">
            Rudi kwenye Ingia
          </Link>
        </div>
      </div>
    </div>
  );

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
            <h1 className="font-display text-[28px] font-bold text-text-primary mt-4">Kusahau Neno la Siri</h1>
            <p className="text-text-secondary text-sm font-body mt-1">Weka barua pepe yako kupokea kiungo cha kuweka upya</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <input
                id="forgot-email"
                type="email"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field peer"
                required
                autoComplete="email"
              />
              <label htmlFor="forgot-email" className="input-label input-label-required">Barua Pepe</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-12">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Inatuma...
                </span>
              ) : 'Tuma Kiungo'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary font-body mt-6">
            <Link to="/login" className="text-primary font-semibold hover:underline">Rudi kwenye Ingia</Link>
          </p>
        </div>
      </div>
    </div>
  );
}