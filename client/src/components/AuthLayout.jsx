import { IconLogo } from './Icons.jsx';

// Two-column frame shared by the Sign in and Register pages.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <section className="auth-hero" aria-hidden="true">
        <div className="brand brand-large">
          <IconLogo size={26} />
          <span>ShotList</span>
        </div>

        <div className="slate">
          <div className="slate-bar" />
          <div className="slate-grid">
            <div>
              <small>PROD.</small>
              <strong>Your next film</strong>
            </div>
            <div>
              <small>SCENE</small>
              <strong>01</strong>
            </div>
            <div>
              <small>SHOT</small>
              <strong>01</strong>
            </div>
            <div>
              <small>TAKE</small>
              <strong>01</strong>
            </div>
          </div>
        </div>

        <div className="hero-copy">
          <h2>Plan every shot before you roll camera.</h2>
          <p>Projects, shot lists and camera notes in one quiet, focused workspace.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="brand auth-mobile-brand">
            <IconLogo size={22} />
            <span>ShotList</span>
          </div>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </section>
    </div>
  );
}
