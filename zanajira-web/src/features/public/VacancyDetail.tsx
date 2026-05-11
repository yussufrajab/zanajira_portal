import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import SkeletonCard from '../../components/SkeletonCard';

interface Vacancy {
  id: string;
  post_title: string;
  num_posts: number;
  employer_name: string;
  location: string;
  qualifications: string;
  duties: string;
  salary_scale: string;
  closing_date: string;
  status: string;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/* ── Arched section card ── */
function ArchSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 animate-fade-up">
      <div className="arch-header">{title}</div>
      <div className="card border-t-0 rounded-t-none p-5">
        <div className="prose prose-sm max-w-none text-text-primary font-body leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VacancyDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vacancies/${id}`)
      .then(r => setVacancy(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10"><SkeletonCard /><SkeletonCard /></div>;
  if (!vacancy) return null;

  const days = daysUntil(vacancy.closing_date);
  const closingSoon = days >= 0 && days <= 7;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-body text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Nyumbani</Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="text-text-muted">Nafasi za Kazi</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="text-text-primary font-medium truncate max-w-xs">{vacancy.post_title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Left column (70%) ── */}
        <div className="flex-1 min-w-0 lg:w-[70%]">
          {/* Title block */}
          <div className="mb-6 animate-fade-up">
            <h1 className="font-display text-3xl sm:text-[32px] font-bold text-text-primary leading-tight">
              {vacancy.post_title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="badge-gold">{vacancy.employer_name}</span>
              {vacancy.location && (
                <span className="text-sm text-text-secondary font-body">📌 {vacancy.location}</span>
              )}
            </div>
            {/* Gold divider */}
            <div className="divider-gold mt-4" />
          </div>

          {/* Arched sections */}
          {vacancy.qualifications && (
            <ArchSection title="Sifa Zinazohitajika">
              {vacancy.qualifications}
            </ArchSection>
          )}

          {vacancy.duties && (
            <ArchSection title="Majukumu na Wajibu">
              {vacancy.duties}
            </ArchSection>
          )}

          {vacancy.salary_scale && (
            <ArchSection title="Kiwango cha Mshahara">
              {vacancy.salary_scale}
            </ArchSection>
          )}
        </div>

        {/* ── Right sidebar (30%) ── */}
        <div className="lg:w-[30%] flex-shrink-0">
          <div className="card p-6 lg:sticky lg:top-24 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            {/* Posts available */}
            <div className="text-center mb-5">
              <div className="font-display text-4xl font-bold text-accent">{vacancy.num_posts}</div>
              <div className="text-sm text-text-secondary font-body mt-1">
                {vacancy.num_posts === 1 ? 'Nafasi' : 'Nafasi'} Zinazopatikana
              </div>
            </div>

            <div className="divider" />

            {/* Closing date */}
            <div className="py-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary font-body">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Mwisho wa Maombi:</span>
                <span className="font-semibold text-text-primary">
                  {new Date(vacancy.closing_date).toLocaleDateString()}
                </span>
              </div>
              {days >= 0 && (
                <div className={`mt-2 text-xs font-body font-medium ${closingSoon ? 'text-danger' : 'text-text-secondary'}`}>
                  {closingSoon ? `⚠ Inafunga baada ya siku ${days}` : `Inafunga baada ya siku ${days}`}
                </div>
              )}
            </div>

            {closingSoon && (
              <div className="alert-warning mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Inafunga hivi karibuni!</span>
              </div>
            )}

            <div className="divider" />

            {/* Employer */}
            <div className="py-3">
              <div className="text-xs text-text-muted font-body uppercase tracking-wider mb-1">Mwajiri</div>
              <div className="text-sm font-medium text-text-primary font-body">{vacancy.employer_name}</div>
            </div>

            {/* CTA button */}
            <div className="mt-4">
              {user?.role === 'applicant' ? (
                <Link to={`/apply/${vacancy.id}`} className="btn-primary w-full h-12 flex items-center justify-center text-base">
                  Omba Sasa
                </Link>
              ) : (
                <Link to="/register" className="btn-primary w-full h-12 flex items-center justify-center text-base">
                  Jisajili Kuomba
                </Link>
              )}
            </div>

            {/* Ghost actions */}
            <div className="flex justify-center gap-4 mt-3">
              <button className="btn-ghost-muted btn-sm text-xs" title="Share">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
              <button className="btn-ghost-muted btn-sm text-xs" title="Bookmark">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                Bookmark
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}