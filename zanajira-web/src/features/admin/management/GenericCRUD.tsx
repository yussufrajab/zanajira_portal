import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

interface Column {
  key: string;
  label: string;
}

interface Props {
  title: string;
  endpoint: string;
  columns: Column[];
  createFields: { key: string; label: string; type?: string; required?: boolean }[];
}

export default function GenericCRUD({ title, endpoint, columns, createFields }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get(endpoint)
      .then(r => setData(r.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [endpoint]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.post(endpoint, form);
      setSuccessMsg('Imehifadhiwa kikamilifu.');
      setShowForm(false);
      setForm({});
      load();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error ?? 'Imeshindwa kuhifadhi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Futa rekodi hii?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      load();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">Dhibiti {title.toLowerCase()}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
          {showForm ? 'Ghairi' : '+ Ongeza Mpya'}
        </button>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-danger">{errorMsg}</div>}

      {showForm && (
        <div className="card p-6">
          <h2 className="section-heading mb-4">Ongeza {title} Mpya</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {createFields.map(f => (
              <div key={f.key}>
                <label className={`label ${f.required ? 'label-required' : ''}`}>{f.label}</label>
                {f.type === 'number' ? (
                  <input
                    type="number"
                    required={f.required}
                    value={form[f.key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <input
                    type={f.type ?? 'text'}
                    required={f.required}
                    value={form[f.key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="input"
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary btn-sm">
                {saving ? 'Inahifadhi...' : 'Hifadhi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(c => <th key={c.key}>{c.label}</th>)}
                <th className="text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody>
              <SkeletonCard variant="table-row" count={5} />
            </tbody>
          </table>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          illustration="no-data"
          title={`Hakuna ${title.toLowerCase()}`}
          description={`Bado hakuna ${title.toLowerCase()} zilizohifadhiwa.`}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(c => <th key={c.key}>{c.label}</th>)}
                <th className="text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {columns.map(c => (
                    <td key={c.key}>{String(row[c.key] ?? '')}</td>
                  ))}
                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-xs text-danger font-medium hover:underline font-body"
                    >
                      Futa
                    </button>
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