import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

export default function VacancyApplicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/admin/vacancies/${id}/applicants`)
      .then(r => setApplicants(r.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (appId: string, status: string) => {
    await api.put(`/admin/applications/${appId}/status`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Link to="/admin/vacancies" className="text-sm text-text-secondary hover:text-primary font-body transition-colors">
          &larr; Nafasi za Kazi
        </Link>
        <h1 className="page-title">Waombaji</h1>
        <p className="page-subtitle">Waombaji kwa nafasi hii</p>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jina</th><th>Barua Pepe</th><th>ZanID</th><th>Wasifu %</th><th>Tarehe</th><th>Hali</th><th className="text-right">Vitendo</th>
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
          title="Hakuna waombaji bado"
          description="Waombaji wataonekana hapa wakati maombi yanapopokelewa."
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
                <th>Tarehe ya Kuomba</th>
                <th>Hali</th>
                <th className="text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a: any) => (
                <tr key={a.application_id}>
                  <td className="font-medium">{a.first_name} {a.last_name}</td>
                  <td className="text-text-secondary">{a.email}</td>
                  <td className="font-mono text-xs text-text-secondary">{a.zanid?.String ?? '-'}</td>
                  <td className="text-text-secondary">{a.completion_pct}%</td>
                  <td className="text-text-secondary">{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '-'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => updateStatus(a.application_id, 'shortlisted')} className="btn-ghost-muted btn-sm text-success">Chagua</button>
                      <button onClick={() => updateStatus(a.application_id, 'in_progress')} className="btn-ghost-muted btn-sm text-warning">Inaendelea</button>
                      <button onClick={() => updateStatus(a.application_id, 'rejected')} className="btn-ghost-muted btn-sm text-danger">Kataa</button>
                      <button onClick={() => updateStatus(a.application_id, 'placed')} className="btn-ghost-muted btn-sm text-info">Weka</button>
                    </div>
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