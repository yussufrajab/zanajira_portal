import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';
import FileUploadInput from '../../../components/FileUploadInput';

const entrySchema = z.object({
  level_id: z.string().min(1, 'Kiwango kinahitajika'),
  institution_id: z.string().min(1, 'Taasisi inahitajika'),
  programme_id: z.string().optional(),
  country: z.string().optional(),
  year_from: z.string().min(1, 'Mwaka wa kuanza unahitajika'),
  year_to: z.string().optional(),
  gpa: z.string().optional(),
});
type EntryData = z.infer<typeof entrySchema>;

export default function AcademicQualifications() {
  const [entries, setEntries] = useState<any[]>([]);
  const [levels, setLevels] = useState<{ id: string; name: string }[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<EntryData>({
    resolver: zodResolver(entrySchema),
  });

  useEffect(() => {
    Promise.all([
      api.get('/applicants/me/academic'),
      api.get('/admin/academic-levels'),
      api.get('/admin/academic-institutions'),
    ]).then(([acad, lvls, insts]) => {
      setEntries(acad.data.data ?? []);
      setLevels(lvls.data.data ?? []);
      setInstitutions(insts.data.data ?? []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: EntryData) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (certificateFile) fd.append('certificate', certificateFile);
      await api.post('/applicants/me/academic', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Elimu imeongezwa kikamilifu.');
      setShowForm(false);
      setCertificateFile(null);
      reset();
      const r = await api.get('/applicants/me/academic');
      setEntries(r.data.data ?? []);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuongeza.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Futa elimu hii?')) return;
    try {
      await api.delete(`/applicants/me/academic/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Elimu imefutwa.');
    } catch {
      toast.error('Imeshindwa kufuta.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Elimu</h1>
          <p className="page-subtitle">Ongeza elimu yako ya shule</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
          {showForm ? 'Ghairi' : '+ Ongeza Elimu'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="section-heading mb-4">Ongeza Elimu Mpya</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label label-required">Kiwango</label>
                <select {...register('level_id')} className="select">
                  <option value="">Chagua kiwango...</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                {errors.level_id && <p className="text-xs text-danger mt-1">{errors.level_id.message}</p>}
              </div>
              <div>
                <label className="label label-required">Taasisi</label>
                <select {...register('institution_id')} className="select">
                  <option value="">Chagua taasisi...</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                {errors.institution_id && <p className="text-xs text-danger mt-1">{errors.institution_id.message}</p>}
              </div>
              <div>
                <label className="label">Nchi</label>
                <input {...register('country')} className="input" placeholder="Tanzania" />
              </div>
              <div>
                <label className="label">GPA / Alama</label>
                <input {...register('gpa')} className="input" placeholder="3.5" />
              </div>
              <div>
                <label className="label label-required">Mwaka wa Kuanza</label>
                <input {...register('year_from')} type="number" className="input" placeholder="2018" />
                {errors.year_from && <p className="text-xs text-danger mt-1">{errors.year_from.message}</p>}
              </div>
              <div>
                <label className="label">Mwaka wa Kuhitimu</label>
                <input {...register('year_to')} type="number" className="input" placeholder="2022" />
              </div>
            </div>

            <FileUploadInput
              label="Cheti cha Elimu (PDF, max 2MB)"
              accept=".pdf"
              maxSizeMB={2}
              onChange={setCertificateFile}
            />

            <button type="submit" disabled={isSubmitting} className="btn-primary btn-sm">
              {isSubmitting ? 'Inahifadhi...' : 'Hifadhi'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <SkeletonCard variant="profile-section" count={3} />
      ) : entries.length === 0 ? (
        <EmptyState
          illustration="no-data"
          title="Hakuna elimu iliyoongezwa"
          description="Ongeza elimu yako ya shule ili ionekane hapa."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <div key={entry.id} className="card p-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-text-primary">{entry.level_name ?? entry.level}</p>
                <p className="text-sm text-text-secondary font-body mt-0.5">{entry.institution_name ?? entry.institution} | {entry.country}</p>
                <p className="text-xs text-text-muted font-body mt-0.5">
                  {entry.year_from?.Int32 ?? entry.year_from}–{entry.year_to?.Int32 ?? entry.year_to ?? 'Sasa'}
                  {entry.gpa ? ` | GPA: ${entry.gpa}` : ''}
                </p>
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