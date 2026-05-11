import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  email: z.string().email('Barua pepe si sahihi'),
  password: z.string().min(1, 'Neno la siri linahitajika'),
});
type FormData = z.infer<typeof schema>;

/* ── ZanAjira Emblem (small) ── */
function Emblem() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" stroke="#1B4F72" strokeWidth="2" />
      <polygon points="24,4 44,24 24,44 4,24" stroke="#1B4F72" strokeWidth="1.5" fill="none" />
      <polygon points="24,10 38,24 24,38 10,24" stroke="#1B4F72" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="24" cy="24" r="6" fill="#C0932A" />
      <circle cx="24" cy="24" r="3" fill="#1B4F72" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="#1B4F72" strokeWidth="0.8" opacity="0.3" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="#1B4F72" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data);
      navigate(res.data.role === 'applicant' ? '/dashboard' : '/admin');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Imeshindwa kuingia. Jaribu tena.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      {/* Faint pattern background */}
      <div className="absolute inset-0 hero-pattern opacity-[0.03] pointer-events-none" />

      <div className="relative w-full max-w-[420px] animate-scale-in">
        <div className="card p-8" style={{ boxShadow: 'var(--shadow-modal)' }}>
          {/* Emblem + heading */}
          <div className="flex flex-col items-center mb-8">
            <Emblem />
            <h1 className="font-display text-[28px] font-bold text-text-primary mt-4">Ingia</h1>
            <p className="text-text-secondary text-sm font-body mt-1">Karibu tena kwenye ZanAjira</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert-danger mb-5 animate-fade-in" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email — floating label */}
            <div className="input-group">
              <input
                id="login-email"
                type="email"
                placeholder=" "
                {...register('email')}
                className={`input-field peer ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              <label htmlFor="login-email" className="input-label input-label-required">Barua Pepe</label>
              {errors.email && <p className="text-xs text-danger mt-1 font-body">{errors.email.message}</p>}
            </div>

            {/* Password — floating label + eye toggle */}
            <div className="input-group">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder=" "
                {...register('password')}
                className={`input-field peer pr-12 ${errors.password ? 'input-error' : ''}`}
                autoComplete="current-password"
              />
              <label htmlFor="login-password" className="input-label input-label-required">Neno la Siri</label>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                aria-label={showPass ? 'Ficha neno la siri' : 'Onyesha neno la siri'}
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
              {errors.password && <p className="text-xs text-danger mt-1 font-body">{errors.password.message}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-[13px] text-text-secondary hover:text-primary transition-colors font-body">
                Umesahau neno la siri?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Inaingia...
                </span>
              ) : 'Ingia'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted font-body">au</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-text-secondary font-body">
            Huna akaunti?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Jisajili sasa</Link>
          </p>
        </div>
      </div>
    </div>
  );
}