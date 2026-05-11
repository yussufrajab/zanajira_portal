import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import SkeletonCard from '../../../components/SkeletonCard';

export default function SystemConfig() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/admin/config').then(r => setConfig(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put('/admin/config', config);
      setSuccessMsg('Mipangilio imehifadhiwa kikamilifu.');
    } catch {
      setErrorMsg('Imeshindwa kuhifadhi mipangilio.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Mipangilio ya Mfumo</h1>
        </div>
        <SkeletonCard variant="profile-section" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mipangilio ya Mfumo</h1>
        <p className="page-subtitle">Dhibiti mipangilio ya programu</p>
      </div>

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-danger">{errorMsg}</div>}

      <div className="card p-6">
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="label">{key.replace(/_/g, ' ')}</label>
              <input
                type="text"
                value={value}
                onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                className="input"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Inahifadhi...' : 'Hifadhi Mipangilio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}