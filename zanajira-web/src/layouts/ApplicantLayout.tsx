import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import ProfileProgressBar from '../components/ProfileProgressBar';

/* ── Navigation items with Lucide-style icons ── */
const profileLinks = [
  { to: '/profile/personal',      label: 'Taarifa za Kibinafsi',   icon: 'user' },
  { to: '/profile/contact',       label: 'Taarifa za Mawasiliano', icon: 'map-pin' },
  { to: '/profile/academic',      label: 'Sifa za Kielimu',       icon: 'graduation-cap' },
  { to: '/profile/professional',  label: 'Sifa za Kitaaluma',     icon: 'award' },
  { to: '/profile/language',      label: 'Uwezo wa Lugha',        icon: 'globe' },
  { to: '/profile/experience',    label: 'Uzoefu wa Kazi',        icon: 'briefcase' },
  { to: '/profile/training',      label: 'Mafunzo na Warsha',     icon: 'book-open' },
  { to: '/profile/computer',      label: 'Uwezo wa Kompyuta',     icon: 'monitor' },
  { to: '/profile/referees',      label: 'Wapitishaji',           icon: 'users' },
  { to: '/profile/attachments',   label: 'Viambatisho',           icon: 'paperclip' },
  { to: '/profile/declaration',   label: 'Tamko',                 icon: 'file-check' },
  { to: '/profile/cv',            label: 'Muhtasari wa CV',        icon: 'file-text' },
];

/* ── Simple SVG icon component ── */
function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const icons: Record<string, string> = {
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
    'map-pin': 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z',
    'graduation-cap': 'M22 10L12 5 2 10l10 5 10-5zM6 12v6c0 2 4 4 6 4s6-2 6-4v-6M22 10v10',
    award: 'M12 15a6 6 0 100-12 6 6 0 000 12zM8.21 13.89L7 23l5-3 5 3-1.21-9.11',
    globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z',
    briefcase: 'M2 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
    'book-open': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z',
    monitor: 'M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM8 22h8M12 18v4',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    paperclip: 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
    'file-check': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4',
    'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
    'file-text-alt': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
    vacancies: 'M21 13v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8M16 2l4 4-4 4M8 6h12',
    applications: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4',
    logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
    'chevron-left': 'M15 18l-6-6 6-6',
    menu: 'M3 12h18M3 6h18M3 18h18',
    x: 'M18 6L6 18M6 6l12 12',
  };
  const d = icons[name] || icons.menu;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* ── Circular progress ring ── */
function ProgressRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const isReady = pct >= 70;
  const color = isReady ? '#1B4F72' : '#C07A10';
  const innerColor = isReady ? '#1A7A4E' : '#C07A10';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2EAF4" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isReady ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={innerColor} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <span className="text-sm font-bold font-body" style={{ color: innerColor }}>{pct}%</span>
        )}
      </div>
    </div>
  );
}

export default function ApplicantLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [completion, setCompletion] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/applicants/me/completion')
      .then(r => setCompletion(r.data.completion_pct))
      .catch(() => {});
  }, [location.pathname]);

  const initials = user ? ((user as any).first_name?.[0] || '') + ((user as any).last_name?.[0] || '') || user.email[0].toUpperCase() : '?';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-nav">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden btn-icon text-primary"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <Icon name="x" size={22} /> : <Icon name="menu" size={22} />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary font-body">
              <Link to="/dashboard" className="hover:text-primary transition-colors">Nyumbani</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="text-text-primary font-medium truncate max-w-[200px]">
                {profileLinks.find(l => location.pathname.startsWith(l.to))?.label || 'Wasifu'}
              </span>
            </div>
          </div>

          {/* Center: progress bar (desktop) */}
          <div className="hidden md:block w-[200px]">
            <ProfileProgressBar pct={completion} compact />
          </div>

          {/* Right: nav links */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 text-sm font-body text-text-secondary hover:text-primary transition-colors">
              <Icon name="vacancies" size={16} /> Nafasi
            </Link>
            <Link to="/applications" className="hidden sm:flex items-center gap-1.5 text-sm font-body text-text-secondary hover:text-primary transition-colors">
              <Icon name="applications" size={16} /> Maombi
            </Link>
            {/* Avatar dropdown */}
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold font-body">
                {initials}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-card shadow-modal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-text-primary font-body truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link to="/change-password" className="block px-3 py-2 text-sm text-text-secondary hover:bg-primary-light hover:text-primary rounded-lg transition-colors font-body">
                    Badilisha Neno la Siri
                  </Link>
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg transition-colors font-body">
                    Toka
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 border-r border-border bg-surface h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          {/* Avatar + progress ring */}
          <div className="flex flex-col items-center pt-6 pb-4 px-4">
            <div className="relative mb-3">
              <ProgressRing pct={completion} size={80} />
            </div>
            <p className="text-sm font-semibold text-text-primary font-body">
              {(user as any)?.first_name || ''} {(user as any)?.last_name || ''}
            </p>
            <p className="text-xs text-text-muted font-mono">
              {(user as any)?.zanid || '---'}
            </p>
          </div>

          <div className="divider mx-4" />

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {profileLinks.map(link => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                >
                  <Icon name={link.icon} size={16} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3 space-y-1">
            <Link to="/dashboard" className="nav-link-inactive">
              <Icon name="vacancies" size={16} />
              <span>Nafasi za Kazi</span>
            </Link>
            <button onClick={logout} className="nav-link-inactive w-full text-danger hover:text-danger">
              <Icon name="logout" size={16} />
              <span>Toka</span>
            </button>
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-surface shadow-modal overflow-y-auto animate-slide-in-left">
              {/* Same content as desktop sidebar */}
              <div className="flex flex-col items-center pt-6 pb-4 px-4">
                <div className="relative mb-3">
                  <ProgressRing pct={completion} size={80} />
                </div>
                <p className="text-sm font-semibold text-text-primary font-body">
                  {(user as any)?.first_name || ''} {(user as any)?.last_name || ''}
                </p>
                <p className="text-xs text-text-muted font-mono">
                  {(user as any)?.zanid || '---'}
                </p>
              </div>
              <div className="divider mx-4" />
              <nav className="px-3 py-2 space-y-0.5">
                {profileLinks.map(link => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setSidebarOpen(false)}
                      className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                    >
                      <Icon name={link.icon} size={16} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-border p-3">
                <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="nav-link-inactive">
                  <Icon name="vacancies" size={16} /> Nafasi za Kazi
                </Link>
                <button onClick={() => { logout(); setSidebarOpen(false); }} className="nav-link-inactive w-full text-danger">
                  <Icon name="logout" size={16} /> Toka
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 lg:px-8">
          <Outlet context={{ completion, setCompletion }} />
        </main>
      </div>
    </div>
  );
}