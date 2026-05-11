import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import FileUploadInput from '../../../components/FileUploadInput';
import ProfileProgressBar from '../../../components/ProfileProgressBar';

export default function ApplyFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<any>(null);
  const [completion, setCompletion] = useState(0);
  const [letter, setLetter] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/vacancies/${id}`),
      api.get('/applicants/me/completion'),
    ]).then(([v, c]) => {
      setVacancy(v.data);
      setCompletion(c.data.completion_pct);
    }).catch(() => navigate('/dashboard'));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letter) { setError('Tafadhali pakia barua yako ya maombi.'); return; }
    if (!agreed) { setError('Tafadhali kukubali tamko.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('vacancy_id', id!);
      fd.append('letter', letter);
      await api.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Maombi yameshindwa.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card p-8 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-semibold text-text-primary mb-2">Maombi Yamewasilishwa!</h2>
        <p className="text-text-secondary text-sm mb-6 font-body">Maombi yako yamepokewa. Unaweza kufuata hali yake kwenye Maombi Yangu.</p>
        <button onClick={() => navigate('/applications')} className="btn-primary">Tazama Maombi Yangu</button>
      </div>
    </div>
  );

  if (!vacancy) return (
    <div className="flex justify-center py-20">
      <div className="skeleton w-48 h-8 rounded-lg" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="page-header mb-6">
        <h1 className="page-title">Omba: {vacancy.post_title}</h1>
        <p className="page-subtitle">{vacancy.employer_name}</p>
      </div>

      <div className="card p-6">
        {completion < 70 && (
          <div className="alert-warning mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-warning flex-shrink-0 mt-0.5">
              <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Wasifu Haujakamilika</p>
              <p className="text-sm mt-0.5">Wasifu wako ni {completion}% kamili. Unahitaji angalau 70% ili kuomba.</p>
              <button onClick={() => navigate('/profile/personal')} className="btn-ghost btn-sm mt-2">
                Kamilisha Wasifu
              </button>
            </div>
          </div>
        )}

        {completion >= 70 && (
          <div className="mb-6">
            <ProfileProgressBar pct={completion} />
          </div>
        )}

        {error && <div className="alert-danger mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FileUploadInput
            label="Barua ya Maombi (PDF, max 1MB)"
            accept=".pdf"
            maxSizeMB={1}
            onChange={setLetter}
          />

          <div className="alert-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-info flex-shrink-0 mt-0.5">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Tamko la Maombi</p>
              <p className="text-sm mt-0.5">Ninathibitisha kuwa taarifa zote zilizotolewa kwenye maombi yangu ni za kweli, kamili, na sahihi. Ninaelewa kuwa kutoa taarifa za uongo kunaweza kusababisha kuzuiliwa au kuondolewa kwenye kazi.</p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm text-text-secondary font-body">
              Nimesoma na kukubali tamko la juu
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agreed || completion < 70}
            className="btn-primary w-full"
          >
            {loading ? 'Inawasilisha...' : 'Thibitisha Maombi'}
          </button>
        </form>
      </div>
    </div>
  );
}