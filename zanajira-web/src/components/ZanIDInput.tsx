import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';

interface ZanIDProfile {
  zanid: string;
  first_name: string;
  last_name: string;
  sex: string;
  date_of_birth: string;
  nationality: string;
}

interface Props {
  onFetch: (profile: ZanIDProfile) => void;
  defaultValue?: string;
}

export default function ZanIDInput({ onFetch, defaultValue = '' }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!/^\d{9}$/.test(value)) {
      if (status !== 'idle') setStatus('idle');
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setStatus('loading');
      setErrorMsg('');
      try {
        const { data } = await api.get(`/zanid/${value}`);
        setStatus('success');
        onFetch(data);
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e.response?.data?.error ?? 'ZanID haikupatikana au huduma haipo.');
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  const borderColor = {
    idle:    'border-border focus:border-primary',
    loading: 'border-primary/60',
    success: 'border-success',
    error:   'border-danger',
  }[status];

  const iconEl = {
    idle:    null,
    loading: <span className="animate-spin text-primary text-sm">⟳</span>,
    success: <span className="text-success text-sm">✓</span>,
    error:   <span className="text-danger text-sm">✗</span>,
  }[status];

  return (
    <div className="w-full">
      <label className="label label-required">ZanID (Nambari ya Kitambulisho)</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value.replace(/\D/g, '').slice(0, 9))}
          placeholder="123456789"
          maxLength={9}
          className={`input font-mono text-lg tracking-widest pr-10 transition-all duration-200 ${borderColor}
            ${status === 'success' ? 'bg-success-light/30' : ''}
            ${status === 'error' ? 'bg-danger-light/30' : ''}
          `}
        />
        {iconEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {iconEl}
          </div>
        )}
      </div>

      {status === 'idle' && (
        <p className="text-xs text-text-muted mt-1.5 font-body">Ingiza nambari 9 za ZanID yako</p>
      )}
      {status === 'loading' && (
        <p className="text-xs text-primary mt-1.5 font-body animate-pulse-soft">
          Inatafuta taarifa kutoka ZanID...
        </p>
      )}
      {status === 'success' && (
        <p className="text-xs text-success mt-1.5 font-body font-medium">
          ✓ Taarifa zimepatikana na zimejazwa kiotomatiki
        </p>
      )}
      {status === 'error' && (
        <p className="text-xs text-danger mt-1.5 font-body">⚠ {errorMsg}</p>
      )}
    </div>
  );
}
