import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import SkeletonCard from '../../../components/SkeletonCard';

export default function CVPreview() {
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applicants/me/cv')
      .then(r => setCv(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Muhtasari wa CV</h1>
        </div>
        <SkeletonCard variant="profile-section" count={4} />
      </div>
    );
  }

  if (!cv) return null;

  const p = cv.personal ?? {};

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Muhtasari wa CV</h1>
          <p className="page-subtitle">Tazama muhtasari wa wasifu wako</p>
        </div>
        <button onClick={() => window.print()} className="btn-accent btn-sm no-print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
          </svg>
          Chapisha CV
        </button>
      </div>

      <div id="cv-print" className="card p-8 max-w-[820px] mx-auto relative space-y-6 print:shadow-none print:border-0">
        {/* Watermark */}
        <div className="watermark no-print">
          <span>ZanAjira</span>
        </div>

        {/* Header */}
        <div className="border-b border-border pb-4">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-light border-2 border-primary/20 flex items-center justify-center text-primary text-2xl font-display flex-shrink-0">
              {p.FirstName?.[0]}{p.LastName?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-text-primary">{p.FirstName} {p.LastName}</h2>
              <p className="text-text-secondary text-sm font-body mt-0.5">{p.Nationality} | {p.Sex}</p>
              {p.ZanID?.Valid && <p className="font-mono text-xs text-text-muted mt-1 bg-primary-light/50 inline-block px-2 py-0.5 rounded-pill">ZanID: {p.ZanID.String}</p>}
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="divider-gold" />

        {/* Languages */}
        {cv.languages?.length > 0 && (
          <section>
            <h3 className="section-heading mb-3">Ujuzi wa Lugha</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lugha</th><th>Kuzungumza</th><th>Kusoma</th><th>Kuandika</th>
                </tr>
              </thead>
              <tbody>
                {cv.languages.map((l: any, i: number) => (
                  <tr key={i}>
                    <td className="font-medium">{l.language}</td>
                    <td>{l.speaking}</td>
                    <td>{l.reading}</td>
                    <td>{l.writing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Academic */}
        {cv.academic?.length > 0 && (
          <section>
            <h3 className="section-heading mb-3">Elimu</h3>
            <div className="space-y-3">
              {cv.academic.map((a: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-background">
                  <p className="font-medium text-text-primary">{a.level}</p>
                  <p className="text-sm text-text-secondary font-body">{a.country} | {a.year_from?.Int32}–{a.year_to?.Int32} | GPA: {a.gpa}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {cv.experience?.length > 0 && (
          <section>
            <h3 className="section-heading mb-3">Uzoefu wa Kazi</h3>
            <div className="space-y-3">
              {cv.experience.map((e: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-background">
                  <p className="font-medium text-text-primary">{e.job_title} — {e.organization}</p>
                  <p className="text-sm text-text-secondary font-body">
                    {e.start_date?.Time ? new Date(e.start_date.Time).getFullYear() : ''} –{' '}
                    {e.is_current ? 'Sasa' : (e.end_date?.Time ? new Date(e.end_date.Time).getFullYear() : '')}
                  </p>
                  {e.duties && <p className="text-sm text-text-primary mt-1 font-body">{e.duties}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Computer Skills */}
        {cv.computer_skills?.length > 0 && (
          <section>
            <h3 className="section-heading mb-3">Ujuzi wa Kompyuta</h3>
            <div className="flex flex-wrap gap-2">
              {cv.computer_skills.map((s: any, i: number) => (
                <span key={i} className="badge-blue">{s.skill}: {s.proficiency}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}