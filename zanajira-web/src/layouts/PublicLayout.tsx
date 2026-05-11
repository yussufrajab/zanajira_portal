import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

/* ── ZanAjira Emblem SVG ── */
function ZanAjiraEmblem({ className = 'w-10 h-10', white = false }: { className?: string; white?: boolean }) {
  const fill = white ? '#FFFFFF' : '#1B4F72';
  const accent = white ? '#C0932A' : '#C0932A';
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="24" cy="24" r="23" stroke={fill} strokeWidth="2" />
      {/* Inner geometric pattern */}
      <polygon points="24,4 44,24 24,44 4,24" stroke={fill} strokeWidth="1.5" fill="none" />
      <polygon points="24,10 38,24 24,38 10,24" stroke={fill} strokeWidth="1" fill="none" opacity="0.6" />
      {/* Centre star */}
      <circle cx="24" cy="24" r="6" fill={accent} />
      <circle cx="24" cy="24" r="3" fill={fill} />
      {/* Cross lines */}
      <line x1="24" y1="4" x2="24" y2="44" stroke={fill} strokeWidth="0.8" opacity="0.3" />
      <line x1="4" y1="24" x2="44" y2="24" stroke={fill} strokeWidth="0.8" opacity="0.3" />
      <line x1="10" y1="10" x2="38" y2="38" stroke={fill} strokeWidth="0.8" opacity="0.3" />
      <line x1="38" y1="10" x2="10" y2="38" stroke={fill} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

export default function PublicLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Header compress on scroll
  if (typeof window !== 'undefined') {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en');
  const lang = i18n.language === 'en' ? 'EN' : 'SW';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Skip link ── */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-primary text-white px-4 py-2 rounded-pill text-sm font-body">
        Skip to main content
      </a>

      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 bg-surface border-b border-border transition-all duration-300 ${
          scrolled ? 'h-[60px]' : 'h-[68px]'
        }`}
        style={{ borderTop: '4px solid #C0932A' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <ZanAjiraEmblem className="w-10 h-10 flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-display text-xl sm:text-2xl font-bold text-primary group-hover:text-primary-dark transition-colors">
                ZanAjira
              </span>
              <span className="hidden sm:block text-[11px] text-text-muted font-body tracking-wide">
                portal.zanajira.go.tz
              </span>
            </div>
          </Link>

          {/* Center tagline (desktop) */}
          <p className="hidden lg:block text-xl font-bold text-primary font-body uppercase tracking-widest">
            Portal ya Maombi ya Kazi za Serikali
          </p>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-pill border border-border text-xs font-semibold font-body text-text-secondary hover:border-primary hover:text-primary transition-colors"
              aria-label="Switch language"
            >
              <span className={i18n.language === 'en' ? 'text-primary font-bold' : ''}>EN</span>
              <span className="text-text-muted">|</span>
              <span className={i18n.language === 'sw' ? 'text-primary font-bold' : ''}>SW</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="btn-ghost-muted btn-sm">
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
                <button onClick={logout} className="btn-ghost-muted btn-sm text-danger">
                  {t('nav.logout', 'Logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-primary btn-sm">
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link to="/register" className="btn-ghost btn-sm hidden sm:inline-flex">
                  {t('nav.register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden btn-icon text-primary"
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-border bg-surface animate-fade-in">
            <nav className="flex flex-col p-4 gap-2">
              <button onClick={toggleLang} className="text-sm text-text-secondary text-left px-3 py-2 rounded-lg hover:bg-primary-light">
                {lang === 'EN' ? 'Badilisha kwa Kiswahili' : 'Switch to English'}
              </button>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-sm text-text-primary px-3 py-2 rounded-lg hover:bg-primary-light" onClick={() => setMobileOpen(false)}>
                    {t('nav.dashboard', 'Dashboard')}
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-danger text-left px-3 py-2 rounded-lg hover:bg-danger-light">
                    {t('nav.logout', 'Logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                    {t('nav.login', 'Sign In')}
                  </Link>
                  <Link to="/register" className="btn-ghost text-center" onClick={() => setMobileOpen(false)}>
                    {t('nav.register', 'Register')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#1A2940] text-[#C8D8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          {/* Emblem */}
          <div className="flex justify-center mb-6">
            <ZanAjiraEmblem className="w-12 h-12" white />
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm font-body">
            {/* About */}
            <div>
              <h3 className="font-display text-white font-semibold mb-3">Kuhusu ZanAjira</h3>
              <p className="leading-relaxed text-[#8BA3BE]">
                ZanAjira ni mfumo wa kidijitali wa kuomba nafasi za kazi za serikali
                katika Zanzibar. Unalenga kuboresha uhalali na uwazi katika mchakato
                wa kuajiri wa Serikali ya Mapinduzi ya Zanzibar.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display text-white font-semibold mb-3">Viungo Haraka</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-accent transition-colors">Nafasi za Kazi</Link></li>
                <li><Link to="/login" className="hover:text-accent transition-colors">Ingia kwenye Akaunti</Link></li>
                <li><Link to="/register" className="hover:text-accent transition-colors">Jisajili</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display text-white font-semibold mb-3">Wasiliana Nasi</h3>
              <ul className="space-y-2 text-[#8BA3BE]">
                <li>info@zanajira.go.tz</li>
                <li>habari@zanajira.go.tz</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-[#8BA3BE] font-body">
            &copy; 2026 Civil Service Commission, Revolutionary Government of Zanzibar &nbsp;|&nbsp; Developed by eGaz &nbsp;|&nbsp; Version 1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}