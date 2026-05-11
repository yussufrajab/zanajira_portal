import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';

interface Vacancy {
  id: string;
  post_title: string;
  num_posts: number;
  employer_name: string;
  closing_date: string;
  location: string;
  salary_scale: string;
}

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start = 0;
    const step = target / (duration / 16);
    const run = () => {
      start += step;
      if (start >= target) { setValue(target); return; }
      setValue(Math.floor(start));
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [target, duration]);
  return value;
}

function StatPill({ value, label, delay }: { value: number; label: string; delay: number }) {
  const counted = useCountUp(value);
  return (
    <div
      className="bg-white/95 backdrop-blur-sm rounded-card px-5 py-3 text-center shadow-lg animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="font-display text-2xl font-bold text-accent">{counted.toLocaleString()}</div>
      <div className="text-xs text-primary font-body font-medium mt-0.5">{label}</div>
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function VacancyList() {
  const { t } = useTranslation();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 9;

  const fetchVacancies = useCallback(async (q = '', p = 1) => {
    setLoading(true);
    try {
      const endpoint = q ? `/vacancies/search?q=${encodeURIComponent(q)}&page=${p}` : `/vacancies?page=${p}`;
      const { data } = await api.get(endpoint);
      setVacancies(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(Math.max(1, Math.ceil((data.total ?? 0) / perPage)));
    } catch {
      setVacancies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVacancies(search, page); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVacancies(search, 1);
  };

  return (
    <div>
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative hero-pattern overflow-hidden" style={{ minHeight: '480px', background: 'linear-gradient(135deg, #1B4F72 0%, #163D5A 50%, #0F2D45 100%)' }}>
        {/* Gold scallop arch at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background arch-bottom" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center" style={{ minHeight: '440px' }}>
          {/* Staggered animations */}
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-tight tracking-tight animate-fade-up drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            Karibu ZanAjira
          </h1>
          <p
            className="mt-3 text-white text-base sm:text-lg font-body max-w-xl animate-fade-up drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
            style={{ animationDelay: '150ms', animationFillMode: 'both' }}
          >
            Tafuta na Omba Nafasi za Kazi za Serikali ya Zanzibar
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mt-6 w-full max-w-xl animate-fade-up"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <div className="flex bg-white rounded-pill shadow-lg overflow-hidden">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tafuta nafasi za kazi..."
                className="flex-1 px-6 py-3.5 text-sm font-body text-text-primary bg-transparent border-none outline-none placeholder:text-text-secondary"
              />
              <button type="submit" className="btn-primary rounded-none px-8 py-3.5 text-sm">
                {t('common.search', 'Tafuta')}
              </button>
            </div>
          </form>

          {/* Stats */}
          <div
            className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-up"
            style={{ animationDelay: '450ms', animationFillMode: 'both' }}
          >
            <StatPill value={51167} label="Waliojisajili" delay={0} />
            <StatPill value={13} label="Nafasi Wazi" delay={100} />
            <StatPill value={23} label="Waajiri" delay={200} />
          </div>
        </div>
      </section>

      {/* ════════════════ VACANCY LISTING ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Section heading */}
        <div className="mb-8">
          <h2 className="section-heading">Nafasi za Kazi Zilizopo</h2>
          <p className="text-text-secondary text-sm font-body mt-2">
            {total} {total === 1 ? 'nafasi' : 'nafasi'} zilizopo
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vacancies.length === 0 ? (
          <EmptyState
            illustration="no-vacancies"
            title="Hakuna Nafasi za Kazi"
            description="Kwa sasa hakuna nafasi za kazi zinazopatikana. Tengeneza wasifu wako uwe tayari."
            ctaLabel="Tengeneza Wasifu"
            ctaOnClick={() => window.location.href = '/register'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacancies.map((v, idx) => {
              const days = daysUntil(v.closing_date);
              const closingSoon = days >= 0 && days <= 7;
              return (
                <div
                  key={v.id}
                  className="card-hover group animate-fade-up"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  {/* Left gold accent on hover */}
                  <div className="relative p-5 flex flex-col gap-3">
                    {/* Closing soon banner */}
                    {closingSoon && (
                      <div className="absolute top-0 right-4 -translate-y-1/2">
                        <span className="badge-amber">Inafunga Hivi Karibuni</span>
                      </div>
                    )}

                    {/* Employer */}
                    <p className="text-[11px] font-body font-semibold uppercase tracking-wider text-accent truncate">
                      {v.employer_name}
                    </p>

                    {/* Title */}
                    <h3 className="font-display text-lg font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {v.post_title}
                    </h3>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-secondary font-body">
                      {v.location && <span>📌 {v.location}</span>}
                      <span>🗓 {new Date(v.closing_date).toLocaleDateString()}</span>
                      <span className="font-medium text-primary">{v.num_posts} {v.num_posts === 1 ? 'post' : 'posts'}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-auto pt-2">
                      <Link to={`/vacancies/${v.id}`} className="btn-ghost-muted btn-sm flex-1 text-center">
                        Maelezo Zaidi
                      </Link>
                      <Link to={`/vacancies/${v.id}`} className="btn-primary btn-sm flex-1 text-center">
                        Omba
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost-muted btn-sm"
            >
              &larr; Awali
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`btn-sm rounded-pill px-3 py-1.5 text-sm font-body transition-colors ${
                  page === i + 1
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost-muted btn-sm"
            >
              Mbele &rarr;
            </button>
          </div>
        )}
      </section>
    </div>
  );
}