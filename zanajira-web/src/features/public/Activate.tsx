import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/api';

export default function Activate() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage('Kiungo hakifanyi kazi.'); return; }
    api.get(`/auth/activate/${token}`)
      .then(r => { setStatus('success'); setMessage(r.data.message); })
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.error ?? 'Uhalalishaji umeshindwa.'); });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="absolute inset-0 hero-pattern opacity-[0.03] pointer-events-none" />
      <div className="relative w-full max-w-[420px] animate-scale-in">
        <div className="card p-8 text-center" style={{ boxShadow: 'var(--shadow-modal)' }}>
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <svg className="animate-spin h-12 w-12 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-text-secondary font-body mt-4">Inakagua akaunti yako...</p>
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A4E" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Akaunti yako imefunguliwa!</h2>
              <p className="text-text-secondary text-sm font-body mb-6">{message}</p>
              <Link to="/login" className="btn-primary w-full h-12 inline-flex items-center justify-center">
                Ingia Sasa
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-danger-light flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B03030" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Uhalalishaji Umeshindwa</h2>
              <p className="text-text-secondary text-sm font-body mb-6">{message}</p>
              <Link to="/register" className="btn-primary w-full h-12 inline-flex items-center justify-center">
                Omba Kiungo Kipya
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}