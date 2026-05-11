import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';

/* ── Navigation groups ── */
const navGroups = [
  {
    heading: 'OVERVIEW',
    items: [{ to: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }],
  },
  {
    heading: 'RECRUITMENT',
    items: [
      { to: '/admin/vacancies', label: 'Vacancies', icon: 'M21 13v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8M16 2l4 4-4 4M8 6h12' },
      { to: '/admin/applicants', label: 'Applicants', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z' },
    ],
  },
  {
    heading: 'USERS',
    items: [
      { to: '/admin/staff', label: 'Staff Management', icon: 'M12 4.354a4 4 0 00-6.222 5.166l6.222 6.222 6.222-6.222A4 4 0 0012 4.354z' },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    ],
  },
  {
    heading: 'REFERENCE DATA',
    items: [
      { to: '/admin/academic-levels', label: 'Academic Levels', icon: 'M12 14l9-5-9-5-9 5 9 5z' },
      { to: '/admin/academic-institutions', label: 'Institutions', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M7 5h10' },
      { to: '/admin/academic-programmes', label: 'Programmes', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20' },
      { to: '/admin/computer-skills', label: 'Computer Skills', icon: 'M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM8 22h8M12 18v4' },
      { to: '/admin/professional-courses', label: 'Prof. Courses', icon: 'M12 15a6 6 0 100-12 6 6 0 000 12zM8.21 13.89L7 23l5-3 5 3-1.21-9.11' },
    ],
  },
  {
    heading: 'ADMIN TOOLS',
    items: [
      { to: '/admin/employers', label: 'Employers', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
      { to: '/admin/secretariats', label: 'Secretariats', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z' },
      { to: '/admin/permits', label: 'Permits', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { to: '/admin/key-matrices', label: 'Key Matrices', icon: 'M4 4h16v16H4zM4 9h16M9 4v16' },
      { to: '/admin/schemes-of-service', label: 'Schemes of Service', icon: 'M3 3v18h18' },
    ],
  },
  {
    heading: 'SYSTEM',
    items: [{ to: '/admin/config', label: 'System Configuration', icon: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z' }],
  },
];

/* ── White emblem for dark sidebar ── */
function WhiteEmblem() {
  return (
    <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" stroke="white" strokeWidth="2" />
      <polygon points="24,4 44,24 24,44 4,24" stroke="white" strokeWidth="1.5" fill="none" />
      <polygon points="24,10 38,24 24,38 10,24" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="24" cy="24" r="6" fill="#C0932A" />
      <circle cx="24" cy="24" r="3" fill="white" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="white" strokeWidth="0.8" opacity="0.3" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="white" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!user || !['admin', 'staff'].includes(user.role)) {
      navigate('/login');
    }
  }, [user]);

  const initials = user ? ((user as any).first_name?.[0] || '') + ((user as any).last_name?.[0] || '') || user.email[0].toUpperCase() : '?';

  /* Build breadcrumb from current path */
  const currentPath = location.pathname;
  const currentPageLabel = navGroups
    .flatMap(g => g.items)
    .find(item => currentPath === item.to || currentPath.startsWith(item.to + '/'))?.label ?? 'Admin Portal';

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-[#1A2940] text-[#C8D8E8] transition-all duration-300 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
        style={{ height: '100vh', position: 'sticky', top: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <WhiteEmblem />
          {!sidebarCollapsed && (
            <div className="leading-tight overflow-hidden">
              <span className="font-display text-white font-bold text-lg">ZanAjira</span>
              <span className="block text-[10px] text-[#C0932A] uppercase tracking-[0.2em] font-body">Admin Portal</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map(group => (
            <div key={group.heading} className="mb-4">
              {!sidebarCollapsed && (
                <div className="px-4 mb-1">
                  <span className="text-[11px] text-[#5A7394] uppercase tracking-[0.15em] font-bold font-body">{group.heading}</span>
                </div>
              )}
              {group.items.map(item => {
                const isActive = currentPath === item.to || currentPath.startsWith(item.to + '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={isActive ? 'admin-nav-link-active' : 'admin-nav-link'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d={item.icon} />
                    </svg>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold font-body flex-shrink-0">
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium font-body truncate">{user?.email}</p>
                <span className="text-[10px] text-accent uppercase tracking-wider font-body">
                  {user?.role}
                </span>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={logout} className="text-[#5A7394] hover:text-danger transition-colors" aria-label="Logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-nav">
          <div className="flex items-center justify-between px-6 h-[60px]">
            {/* Left: breadcrumb */}
            <div className="flex items-center gap-3">
              {/* Collapse toggle (desktop) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex btn-icon text-text-secondary hover:text-primary"
                aria-label="Toggle sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <span className="text-sm text-text-secondary font-body">{currentPageLabel}</span>
            </div>

            {/* Right: search + notifications */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-background border border-border rounded-pill px-3 py-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9BB2C9" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm font-body text-text-primary placeholder:text-text-muted ml-2 w-40"
                />
              </div>
              <button className="btn-icon text-text-secondary hover:text-primary relative" aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#1A2940] text-white flex items-center justify-center text-sm font-semibold font-body">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}