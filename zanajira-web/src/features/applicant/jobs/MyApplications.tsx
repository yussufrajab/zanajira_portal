import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

interface Application {
  id: string;
  post_title: string;
  employer_name: string;
  applied_at: string;
  closing_date: string;
  status: string;
  salary_scale: string;
}

export default function MyApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/applications/me')
      .then(r => setApps(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Maombi Yangu</h1>
        <p className="page-subtitle">Fuata hali ya maombi yako ya kazi</p>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nafasi</th><th>Mwajiri</th><th>Tarehe ya Kuomba</th><th>Inafungwa</th><th>Hali</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonCard variant="table-row" count={5} />
            </tbody>
          </table>
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          illustration="no-applications"
          title="Bado huna maombi"
          description="Omba nafasi za kazi ili zionekane hapa."
          ctaLabel="Tazama Nafasi"
          ctaOnClick={() => navigate('/dashboard')}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nafasi</th>
                <th>Mwajiri</th>
                <th>Tarehe ya Kuomba</th>
                <th>Inafungwa</th>
                <th>Hali</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(a => (
                <tr key={a.id}>
                  <td className="font-medium">{a.post_title}</td>
                  <td className="text-text-secondary">{a.employer_name}</td>
                  <td className="text-text-secondary">{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td className="text-text-secondary">{new Date(a.closing_date).toLocaleDateString()}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}