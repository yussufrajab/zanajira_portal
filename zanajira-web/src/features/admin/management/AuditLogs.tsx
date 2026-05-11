import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs').then(r => setLogs(r.data.data ?? [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Logi za Ukaguzi</h1>
        <p className="page-subtitle">Shughuli za mfumo na ufuatiliaji wa mabadiliko</p>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tarehe</th><th>Mtumiaji</th><th>Kitendo</th><th>Rasilimali</th><th>IP</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonCard variant="table-row" count={8} />
            </tbody>
          </table>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          illustration="no-results"
          title="Hakuna logi za ukaguzi"
          description="Logi za ukaguzi zitaonekana hapa wakati shughuli zikifanyika."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tarehe</th>
                <th>Mtumiaji</th>
                <th>Kitendo</th>
                <th>Rasilimali</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id}>
                  <td className="text-xs text-text-secondary">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '-'}</td>
                  <td className="font-medium">{l.user_email?.String ?? 'Mfumo'}</td>
                  <td className="font-mono text-xs">{l.action}</td>
                  <td className="text-xs text-text-secondary">{l.resource}</td>
                  <td className="text-xs text-text-secondary font-mono">{l.ip_address?.String ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}