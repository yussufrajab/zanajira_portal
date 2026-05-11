import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

export default function AdminApplicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (search = '') => {
    setLoading(true);
    api.get(`/admin/applicants${search ? `?q=${search}` : ''}`)
      .then(r => setApplicants(r.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Waombaji</h1>
        <p className="page-subtitle">Tazama na dhibiti waombaji wote</p>
      </div>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tafuta waombaji..."
          className="input max-w-xs"
          onKeyDown={e => e.key === 'Enter' && load(q)}
        />
        <button onClick={() => load(q)} className="btn-primary btn-sm">Tafuta</button>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jina</th><th>Barua Pepe</th><th>ZanID</th><th>Wasifu %</th><th>Hali</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonCard variant="table-row" count={5} />
            </tbody>
          </table>
        </div>
      ) : applicants.length === 0 ? (
        <EmptyState
          illustration="no-applications"
          title="Hakuna waombaji"
          description="Waombaji wataonekana hapa wakati wakijisajili."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jina</th>
                <th>Barua Pepe</th>
                <th>ZanID</th>
                <th>Wasifu %</th>
                <th>Hali</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a: any) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.first_name} {a.last_name}</td>
                  <td className="text-text-secondary">{a.email}</td>
                  <td className="font-mono text-xs text-text-secondary">{a.zanid?.String ?? '-'}</td>
                  <td className="text-text-secondary">{a.completion_pct}%</td>
                  <td>
                    {a.is_active
                      ? <span className="badge-green">Amo</span>
                      : <span className="badge-red">Hajamo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}