import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../lib/api';

const schema = z.object({
  email: z.string().email('Barua pepe si sahihi'),
  password: z.string()
    .min(8, 'Angalau herufi 8')
    .regex(/[a-zA-Z]/, 'Lazima kuwa na herufi')
    .regex(/[0-9]/, 'Lazima kuwa na nambari')
    .regex(/[^a-zA-Z0-9]/, 'Lazima kuwa na ishara'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Maneno ya siri hayalingani',
  path: ['confirm_password'],
});
type FormData = z.infer<typeof schema>;

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

/* ── Password strength meter ── */
function PasswordStrength({ password }: { password: string }) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasLength = password.length >= 8;
  const score = [hasLength, hasLetter, hasNumber, hasSymbol].filter(Boolean).length;

  const bars = [
    { color: score >= 1 ? (score <= 1 ? 'bg-danger' : score <= 2 ? 'bg-warning' : 'bg-success') : 'bg-border' },
    { color: score >= 2 ? (score <= 2 ? 'bg-warning' : 'bg-success') : 'bg-border' },
    { color: score >= 3 ? 'bg-success' : 'bg-border' },
  ];

  const label = score <= 1 ? 'Dhaifu' : score <= 2 ? 'Wastani' : 'Nzuri';
  const labelColor = score <= 1 ? 'text-danger' : score <= 2 ? 'text-warning' : 'text-success';

  const checks = [
    { ok: hasLength, label: 'Angalau herufi 8' },
    { ok: hasLetter, label: 'Herufi (A-Z)' },
    { ok: hasNumber, label: 'Nambari (0-9)' },
    { ok: hasSymbol, label: 'Ishara (!@#...)' },
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {bars.map((b, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-pill ${b.color} transition-colors duration-300`} />
        ))}
        <span className={`text-xs font-body ml-2 ${labelColor}`}>{password && label}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`text-xs font-body flex items-center gap-1 ${c.ok ? 'text-success' : 'text-text-muted'}`}>
            {c.ok ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/></svg>
            )}
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await api.post('/auth/register', data);
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Usajili umeshindwa. Jaribu tena.');
    }
  };

  /* ── Success state ── */
  if (success) {
    return (
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
                {/* Gold star */}
                <path d="M60 5 L63 15 L73 15 L65 21 L68 31 L60 25 L52 31 L55 21 L47 15 L57 15Z" fill="#C0932A" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Angalia Barua Pepe Yako!</h2>
            <p className="text-text-secondary text-sm font-body mb-6">
              Tumetuma kiungo cha kuhalalisha akaunti yako kwenye barua pepe yako. Bonyeza kiungo hicho ili kuweza kuingia.
            </p>
            <Link to="/login" className="btn-primary w-full h-12 inline-flex items-center justify-center">
              Ingia Sasa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="absolute inset-0 hero-pattern opacity-[0.03] pointer-events-none" />

      <div className="relative w-full max-w-[420px] animate-scale-in">
        <div className="card p-8" style={{ boxShadow: 'var(--shadow-modal)' }}>
          {/* Emblem + heading */}
          <div className="flex flex-col items-center mb-8">
            <Emblem />
            <h1 className="font-display text-[28px] font-bold text-text-primary mt-4">Unda Akaunti</h1>
            <p className="text-text-secondary text-sm font-body mt-1">Jisajili kwenye ZanAjira</p>
          </div>

          {error && (
            <div className="alert-danger mb-5 animate-fade-in" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="input-group">
              <input
                id="reg-email"
                type="email"
                placeholder=" "
                {...register('email')}
                className={`input-field peer ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              <label htmlFor="reg-email" className="input-label input-label-required">Barua Pepe</label>
              {errors.email && <p className="text-xs text-danger mt-1 font-body">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="input-group">
                <input
                  id="reg-password"
                  type="password"
                  placeholder=" "
                  {...register('password')}
                  className={`input-field peer ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <label htmlFor="reg-password" className="input-label input-label-required">Neno la Siri</label>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                id="reg-confirm"
                type="password"
                placeholder=" "
                {...register('confirm_password')}
                className={`input-field peer ${errors.confirm_password ? 'input-error' : ''}`}
                autoComplete="new-password"
              />
              <label htmlFor="reg-confirm" className="input-label input-label-required">Thibitisha Neno la Siri</label>
              {errors.confirm_password && <p className="text-xs text-danger mt-1 font-body">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full h-12">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                  Inaunda...
                </span>
              ) : 'Unda Akaunti'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted font-body">au</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-text-secondary font-body">
            Tayari una akaunti?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Ingia</Link>
          </p>
        </div>
      </div>
    </div>
  );
}