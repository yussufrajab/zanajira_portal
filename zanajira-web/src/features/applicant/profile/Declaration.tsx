import { useState } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';

export default function Declaration() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) { toast.warning('Lazima ukubali tamko.'); return; }
    setLoading(true);
    try {
      await api.post('/applicants/me/declaration', { accepted: true });
      toast.success('Tamko limewasilishwa kikamilifu.');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuwasilisha tamko.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Tamko</h1>
        <p className="page-subtitle">Thibitisha ukweli wa taarifa zako</p>
      </div>

      <div className="card p-6">
        <div className="alert-warning mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warning flex-shrink-0 mt-0.5">
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Taarifa Muhimu</p>
            <p className="text-sm mt-0.5">
              Kwa kuwasilisha tamko hili, unathibitisha kuwa taarifa zote zilizotolewa kwenye wasifu wako ni kamili, sahihi, na za kweli.
              Kutoa taarifa za uongo kunaweza kusababisha kuzuiliwa kwenye mchakato wa uajiri au kuondolewa kwenye kazi kama zitagundulika baada ya kupata kazi.
              Tamko hili lina nguvu ya kisheria na ni sawa na sahihi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm text-text-secondary font-body">
              Ninatangaza kuwa taarifa zote zilizotolewa kwenye wasifu wangu ni za kweli, kamili, na sahihi kwa ujuzi wangu.
              Ninaelewa matokeo ya kutoa taarifa za uongo.
            </span>
          </label>
          <button type="submit" disabled={loading || !accepted} className="btn-primary">
            {loading ? 'Inawasilisha...' : 'Wasilisha Tamko'}
          </button>
        </form>
      </div>
    </div>
  );
}