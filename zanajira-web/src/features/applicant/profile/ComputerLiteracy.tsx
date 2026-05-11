import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

const PROFICIENCY_LEVELS = ['Bora', 'Nzuri', 'Kawaida', 'Dhaifu'] as const;
type Proficiency = typeof PROFICIENCY_LEVELS[number];

export default function ComputerLiteracy() {
  const [entries, setEntries] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState<Proficiency>('Kawaida');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/applicants/me/computer-skills'),
      api.get('/admin/computer-skills'),
    ]).then(([skills, available]) => {
      setEntries(skills.data.data ?? []);
      setAvailableSkills(available.data.data ?? []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!selectedSkill) { toast.warning('Chagua ujuzi.'); return; }
    setSaving(true);
    try {
      await api.post('/applicants/me/computer-skills', {
        skill_id: selectedSkill,
        proficiency,
      });
      toast.success('Ujuzi wa kompyuta umeongezwa kikamilifu.');
      const r = await api.get('/applicants/me/computer-skills');
      setEntries(r.data.data ?? []);
      setSelectedSkill('');
      setProficiency('Kawaida');
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuongeza.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Futa ujuzi huu?')) return;
    try {
      await api.delete(`/applicants/me/computer-skills/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Ujuzi umefutwa.');
    } catch {
      toast.error('Imeshindwa kufuta.');
    }
  };

  const profBadgeMap: Record<string, string> = {
    'Bora': 'badge-green',
    'Nzuri': 'badge-blue',
    'Kawaida': 'badge-amber',
    'Dhaifu': 'badge-gray',
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Ujuzi wa Kompyuta</h1>
          <p className="page-subtitle">Ongeza ujuzi wako wa kompyuta</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
          {showForm ? 'Ghairi' : '+ Ongeza Ujuzi'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="section-heading mb-4">Ongeza Ujuzi Mpya wa Kompyuta</h2>
          <div className="space-y-4">
            <div>
              <label className="label label-required">Ujuzi</label>
              <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="select">
                <option value="">Chagua ujuzi...</option>
                {availableSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Uwezo</label>
              <div className="flex gap-1.5 mt-1">
                {PROFICIENCY_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProficiency(level)}
                    className={proficiency === level ? 'prof-pill-active' : 'prof-pill-inactive'}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} disabled={saving} className="btn-primary btn-sm">
              {saving ? 'Inahifadhi...' : 'Hifadhi'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonCard variant="profile-section" count={3} />
      ) : entries.length === 0 ? (
        <EmptyState
          illustration="no-data"
          title="Hakuna ujuzi wa kompyuta"
          description="Ongeza ujuzi wako wa kompyuta ili uonekane hapa."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map((entry: any) => (
            <div key={entry.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary font-display font-bold text-sm flex-shrink-0">
                  {(entry.skill_name ?? entry.skill)?.[0]?.toUpperCase() ?? 'C'}
                </div>
                <div>
                  <p className="font-medium text-text-primary text-sm">{entry.skill_name ?? entry.skill}</p>
                  <span className={`${profBadgeMap[entry.proficiency] ?? 'badge-gray'} mt-1`}>
                    {entry.proficiency}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(entry.id)} className="text-xs text-danger font-medium hover:underline font-body flex-shrink-0">
                Futa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}