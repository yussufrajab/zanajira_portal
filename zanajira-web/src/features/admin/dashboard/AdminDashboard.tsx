import { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../lib/api';

interface Stats {
  total_applicants: number;
  new_applicants: number;
  in_progress: number;
  placements: number;
  employers: { employer: string; count: number }[];
}

/* ── Count-up animation ── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let current = 0;
    const step = target / (duration / 16);
    const run = () => {
      current += step;
      if (current >= target) { setValue(target); return; }
      setValue(Math.floor(current));
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [target, duration]);
  return value;
}

function StatCard({ label, value, icon, color, delay }: { label: string; value: number; icon: string; color: string; delay: number }) {
  const counted = useCountUp(value);
  return (
    <div
      className="card p-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary font-body mb-1">{label}</p>
          <p className="text-[40px] font-extrabold font-body leading-none" style={{ color }}>{counted.toLocaleString()}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, color }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── Custom Recharts tooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="card p-3 shadow-modal text-sm font-body">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-accent">{payload[0].value} waombaji</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-6 h-32 skeleton rounded-card" />)}
        </div>
        <div className="card p-6 h-80 skeleton rounded-card" />
      </div>
    );
  }
  if (!stats) return null;

  const cards = [
    { label: 'Jumla ya Waombaji', value: stats.total_applicants, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z', color: '#1B4F72' },
    { label: 'Wapya (Siku 30)', value: stats.new_applicants, icon: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7V3M9 6l3-3 3 3M15 11h.01', color: '#C0932A' },
    { label: 'Inaendelea', value: stats.in_progress, icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83', color: '#C07A10' },
    { label: 'Waliowekwa', value: stats.placements, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#1A7A4E' },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="page-title">Dashibodi</h1>
        <p className="page-subtitle">Muhtasari wa maombi na waombaji</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} delay={i * 100} />
        ))}
      </div>

      {/* Bar chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">Maombi kwa Mwajiri</h2>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stats.employers} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2EAF4" />
            <XAxis dataKey="employer" tick={{ fill: '#5A7394', fontSize: 11, fontFamily: 'DM Sans' }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fill: '#5A7394', fontSize: 11, fontFamily: 'DM Sans' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#1B4F72" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Employers table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-text-primary">Waajiri wa Sasa</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mwajiri</th>
              <th className="text-right">Waombaji</th>
            </tr>
          </thead>
          <tbody>
            {stats.employers.map((e, i) => (
              <tr key={i}>
                <td className="font-medium">{e.employer}</td>
                <td className="text-right">
                  <span className="badge-primary">{e.count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}