import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';

const PROFICIENCY_LEVELS = ['Bora', 'Nzuri', 'Kawaida', 'Dhaifu'] as const;
type Proficiency = typeof PROFICIENCY_LEVELS[number];

interface LanguageEntry {
  id?: string;
  language: string;
  speaking: Proficiency;
  reading: Proficiency;
  writing: Proficiency;
}

export default function LanguageProficiency() {
  const [entries, setEntries] = useState<LanguageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newLang, setNewLang] = useState('');
  const [speaking, setSpeaking] = useState<Proficiency>('Kawaida');
  const [reading, setReading] = useState<Proficiency>('Kawaida');
  const [writing, setWriting] = useState<Proficiency>('Kawaida');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/applicants/me/languages')
      .then(r => setEntries(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newLang.trim()) { toast.warning('Jina la lugha linahitajika.'); return; }
    setSaving(true);
    try {
      await api.post('/applicants/me/languages', {
        language: newLang,
        speaking,
        reading,
        writing,
      });
      toast.success('Lugha imeongezwa kikamilifu.');
      const r = await api.get('/applicants/me/languages');
      setEntries(r.data.data ?? []);
      setNewLang('');
      setSpeaking('Kawaida');
      setReading('Kawaida');
      setWriting('Kawaida');
      setShowForm(false);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuongeza.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Futa lugha hii?')) return;
    try {
      await api.delete(`/applicants/me/languages/${id}`);
      setEntries(prev => prev.filter(e => String((e as any).id) !== id));
      toast.success('Lugha imefutwa.');
    } catch {
      toast.error('Imeshindwa kufuta.');
    }
  };

  const PillGroup = ({ label, value, onChange }: { label: string; value: Proficiency; onChange: (v: Proficiency) => void }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted w-16 font-body">{label}</span>
      <div className="flex gap-1.5">
        {PROFICIENCY_LEVELS.map(level => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={value === level ? 'prof-pill-active' : 'prof-pill-inactive'}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Ujuzi wa Lugha</h1>
          <p className="page-subtitle">Ongeza lugha unazozungumza</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
          {showForm ? 'Ghairi' : '+ Ongeza Lugha'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="section-heading mb-4">Ongeza Lugha Mpya</h2>
          <div className="space-y-4">
            <div>
              <label className="label label-required">Jina la Lugha</label>
              <input
                type="text"
                value={newLang}
                onChange={e => setNewLang(e.target.value)}
                className="input"
                placeholder="Kiswahili, Kiingereza, Kiarabu..."
              />
            </div>
            <div className="space-y-2">
              <PillGroup label="Kuzungumza" value={speaking} onChange={setSpeaking} />
              <PillGroup label="Kusoma" value={reading} onChange={setReading} />
              <PillGroup label="Kuandika" value={writing} onChange={setWriting} />
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
          title="Hakuna lugha iliyoongezwa"
          description="Ongeza lugha unazozungumza ili zionekane hapa."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any, i: number) => (
            <div key={entry.id ?? i} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-text-primary mb-3">{entry.language}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-16 font-body">Kuzungumza</span>
                      <span className="badge-blue">{entry.speaking}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-16 font-body">Kusoma</span>
                      <span className="badge-blue">{entry.reading}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-16 font-body">Kuandika</span>
                      <span className="badge-blue">{entry.writing}</span>
                    </div>
                  </div>
                </div>
                {entry.id && (
                  <button onClick={() => handleDelete(String(entry.id))} className="text-xs text-danger font-medium hover:underline font-body flex-shrink-0">
                    Futa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}