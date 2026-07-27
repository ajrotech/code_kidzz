import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Component, ErrorInfo, ReactNode, Suspense, lazy, useEffect, useState } from 'react';
import { navLinks, CONTACT } from './data';
import { clearAdminSession, isAdminAuthenticated } from './lib/storage';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ProjectsPage from './pages/ProjectsPage';
import DemoPage from './pages/DemoPage';
import EnrollmentPage from './pages/EnrollmentPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin dashboard is code-split: public visitors never download its JS.
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Courses and Schools were merged into Services — keep old links/bookmarks working.
function RedirectToServices({ hash = '' }: { hash?: string }) {
  const location = useLocation();
  return <Navigate to={`/services${location.search}${hash}`} replace />;
}

function RedirectToDemo() {
  return <Navigate to="/demo" replace />;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CodeKidzz app error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <section className="section page-intro">
            <span className="eyebrow">Something went wrong</span>
            <h1>This page hit a snag</h1>
            <p>Try reloading the page. If it keeps happening, let us know from the Contact page.</p>
            <button className="primary-btn" onClick={() => window.location.assign('/')}>Back to Home</button>
          </section>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);
  return null;
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminAuth, setAdminAuth] = useState(isAdminAuthenticated());

  const socialEntries = Object.entries(CONTACT.social).filter(([, href]) => href && href !== '#');

  return (
    <div className="app-shell">
      <ScrollToTop />
      <header className="site-header">
        <div
          className="brand"
          onClick={() => navigate('/')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              navigate('/');
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Go to CodeKidzz home"
        >
          <img src="/logo.svg" alt={`${CONTACT.brand} logo`} className="brand-logo" />
          <div>
            <strong>{CONTACT.brand}</strong>
            <p>{CONTACT.tagline}</p>
          </div>
        </div>

        <nav id="primary-navigation" className="nav" aria-label="Primary navigation">
          {navLinks.map((item) => (
            <button
              key={item.label}
              className={location.pathname === item.to ? 'nav-link active' : 'nav-link'}
              onClick={() => navigate(item.to)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="primary-btn header-cta" onClick={() => navigate('/enroll')} aria-label="Enroll Now">Enroll Now</button>
        </div>
      </header>

      <main>
        <ErrorBoundary>
          <Suspense fallback={<div className="page-loading" role="status" aria-live="polite">Loading…</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/courses" element={<RedirectToServices />} />
              <Route path="/schools" element={<RedirectToDemo />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/enroll" element={<EnrollmentPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/admin"
                element={
                  <AdminPage
                    isAuthed={adminAuth}
                    onLogout={() => {
                      clearAdminSession();
                      setAdminAuth(false);
                    }}
                  />
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logo.svg" alt={`${CONTACT.brand} logo`} className="footer-logo" />
            <div>
              <h3>{CONTACT.brand}</h3>
              <p>{CONTACT.tagline}</p>
            </div>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            {navLinks.map((item) => (
              <button key={item.label} className="footer-link" onClick={() => navigate(item.to)}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} {CONTACT.brand}. All rights reserved.</p>
          {socialEntries.length > 0 && (
            <div className="footer-social">
              {socialEntries.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                  {label.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
