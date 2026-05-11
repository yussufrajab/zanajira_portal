import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import SkeletonCard from '../../../components/SkeletonCard';
import EmptyState from '../../../components/EmptyState';
import FileUploadInput from '../../../components/FileUploadInput';

const schema = z.object({
  job_title: z.string().min(1, 'Jina la kazi linahitajika'),
  organization: z.string().min(1, 'Shirika linahitajika'),
  start_date: z.string().min(1, 'Tarehe ya kuanza inahitajika'),
  end_date: z.string().optional(),
  is_current: z.boolean().optional(),
  duties: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function WorkExperience() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [appointmentLetter, setAppointmentLetter] = useState<File | null>(null);
  const toast = useToast();

  const { register, handleSubmit, watch, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const isCurrent = watch('is_current');

  useEffect(() => {
    api.get('/applicants/me/experience')
      .then(r => setEntries(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)); });
      if (appointmentLetter) fd.append('appointment_letter', appointmentLetter);
      await api.post('/applicants/me/experience', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uzoefu wa kazi umeongezwa kikamilifu.');
      setShowForm(false);
      setAppointmentLetter(null);
      reset();
      const r = await api.get('/applicants/me/experience');
      setEntries(r.data.data ?? []);
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Imeshindwa kuongeza.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Futa uzoefu huu wa kazi?')) return;
    try {
      await api.delete(`/applicants/me/experience/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Uzoefu wa kazi umefutwa.');
    } catch {
      toast.error('Imeshindwa kufuta.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Uzoefu wa Kazi</h1>
          <p className="page-subtitle">Ongeza historia yako ya kazi</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm">
          {showForm ? 'Ghairi' : '+ Ongeza Kazi'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="section-heading mb-4">Ongeza Uzoefu Mpya wa Kazi</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label label-required">Jina la Kazi</label>
                <input {...register('job_title')} className="input" placeholder="Afisa wa Fedha" />
                {errors.job_title && <p className="text-xs text-danger mt-1">{errors.job_title.message}</p>}
              </div>
              <div>
                <label className="label label-required">Shirika</label>
                <input {...register('organization')} className="input" placeholder="Wizara ya Fedha" />
                {errors.organization && <p className="text-xs text-danger mt-1">{errors.organization.message}</p>}
              </div>
              <div>
                <label className="label label-required">Tarehe ya Kuanza</label>
                <input {...register('start_date')} type="date" className="input" />
                {errors.start_date && <p className="text-xs text-danger mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="label">Tarehe ya Kumaliza</label>
                <input {...register('end_date')} type="date" className="input" disabled={isCurrent} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" {...register('is_current')} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-text-secondary font-body">Hii ni kazi yangu ya sasa</span>
            </label>

            <div>
              <label className="label">Majukumu</label>
              <textarea {...register('duties')} className="textarea" placeholder="Eleza majukumu yako..." />
            </div>

            <FileUploadInput
              label="Barua ya Uteuzi (PDF, max 2MB)"
              accept=".pdf"
              maxSizeMB={2}
              onChange={setAppointmentLetter}
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
          title="Hakuna uzoefu wa kazi"
          description="Ongeza historia yako ya kazi ili ionekane hapa."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <div key={entry.id} className="card p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-text-primary">{entry.job_title}</p>
                  {entry.is_current && <span className="badge-green">Sasa</span>}
                </div>
                <p className="text-sm text-text-secondary font-body">{entry.organization}</p>
                <p className="text-xs text-text-muted font-body mt-0.5">
                  {entry.start_date ? new Date(entry.start_date).toLocaleDateString() : ''} – {entry.is_current ? 'Sasa' : (entry.end_date ? new Date(entry.end_date).toLocaleDateString() : '')}
                </p>
                {entry.duties && <p className="text-sm text-text-primary font-body mt-2 line-clamp-2">{entry.duties}</p>}
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