import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const heroImg = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1400&auto=format&fit=crop';
const beneficio1Img = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000&auto=format&fit=crop';
const beneficio2Img = 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1000&auto=format&fit=crop';

const CheckIcon: React.FC = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.005 7a1 1 0 01-1.416 0l-3.5-3.5A1 1 0 016.2 8.79l2.79 2.79 6.296-6.29a1 1 0 011.42 0z" />
  </svg>
);

const ChevronIcon: React.FC = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
  </svg>
);

const Brand: React.FC<{ light?: boolean }> = ({ light }) => (
  <Link to="/" className="lp-navbar__brand" aria-label="Contabiliza Ágil — inicio">
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lg-nav-g1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id="lg-nav-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.45" />
        </filter>
        <linearGradient id="lg-nav-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="60%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#lg-nav-g1)" filter="url(#lg-nav-shadow)" />
      <rect x="3" y="3" width="42" height="22" rx="10" fill="url(#lg-nav-shine)" />
      <rect x="28" y="28" width="3.5" height="9" rx="1.5" fill="white" fillOpacity="0.38" />
      <rect x="33" y="23" width="3.5" height="14" rx="1.5" fill="white" fillOpacity="0.38" />
      <rect x="38" y="18" width="3.5" height="19" rx="1.5" fill="white" fillOpacity="0.38" />
      <text x="5" y="32" fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif" fontWeight={800} fontSize="18" fill="white" letterSpacing="-0.5">CA</text>
      <polyline points="28,14 32,10 36,14" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.9" />
      <line x1="32" y1="10" x2="32" y2="18" stroke="white" strokeWidth={2} strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
    <span className="lp-navbar__brand-text">
      <span className={`lp-navbar__brand-main ${light ? 'lp-navbar__brand-main--light' : ''}`}>Contabiliza</span>
      <span className="lp-navbar__brand-agil">Ágil</span>
    </span>
  </Link>
);

const features = [
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    color: 'indigo',
    title: 'Facturación automática',
    desc: 'IVA, ReteFuente e ICA calculados al instante en cada factura.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    color: 'emerald',
    title: 'Reportes en PDF y Excel',
    desc: 'Exporta tus reportes financieros con un solo clic, cuando los necesites.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    color: 'sky',
    title: 'Asistente contable con IA',
    desc: 'Asesoría inteligente sobre IVA, PUC y normativa colombiana, sin salir de la app.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    color: 'amber',
    title: 'Control de cartera',
    desc: 'Gestiona cuentas por cobrar y el estado de tus clientes en tiempo real.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6.13-3.13a4 4 0 10-6.26 0M12 12a4 4 0 100-8 4 4 0 000 8z" />,
    color: 'rose',
    title: 'Gestión de terceros',
    desc: 'Administra clientes y proveedores desde un solo lugar.',
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    color: 'violet',
    title: 'Roles y permisos (RBAC)',
    desc: '4 roles — administrador, contador, analista y auxiliar — cada uno con su nivel de acceso.',
  },
];

const beneficios = [
  'Cumple automáticamente con la normativa tributaria colombiana (IVA, ReteFuente, ICA).',
  'Ahorra horas de trabajo manual con cálculos y reportes automáticos.',
  'Toma mejores decisiones con un asistente contable impulsado por IA.',
  'Protege tu información con roles de acceso y respaldo de datos.',
];

const pasos = [
  { title: 'Regístrate', desc: 'Crea tu cuenta y la de tu empresa en minutos.' },
  { title: 'Configura tu PUC', desc: 'Carga tu Plan Único de Cuentas y tus datos de terceros.' },
  { title: 'Factura y reporta', desc: 'Genera facturas, calcula impuestos y exporta reportes al instante.' },
  { title: 'Crece con confianza', desc: 'Consulta a tu asistente de IA y mantente al día con la normativa.' },
];

const faqs = [
  { q: '¿Contabiliza Ágil cumple con la normativa colombiana?', a: 'Sí, calculamos IVA, ReteFuente e ICA conforme a la normativa vigente.' },
  { q: '¿Necesito instalar algo?', a: 'No, es 100% web, accede desde cualquier navegador.' },
  { q: '¿Qué roles de usuario soporta?', a: 'Administrador, contador, analista y auxiliar, cada uno con permisos específicos.' },
  { q: '¿Mis datos están seguros?', a: 'Sí, contamos con respaldo de datos y control de acceso por roles.' },
];

/** Envuelve cada hijo directo en un div animado que aparece al hacer scroll (fade-up), respetando prefers-reduced-motion. */
const Reveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lp-animate ${visible ? 'lp-animate--visible' : ''} ${className || ''}`}>
      {children}
    </div>
  );
};

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'Contabiliza Ágil — Contabilidad inteligente para tu PYME';
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lp-page">
      {/* ===================== NAVBAR ===================== */}
      <header className={`lp-navbar ${scrolled ? 'lp-navbar--scrolled' : ''}`}>
        <div className="lp-container lp-navbar__inner">
          <Brand />

          <nav className="lp-navbar__links" aria-label="Navegación principal">
            <a href="#caracteristicas">Características</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#planes">Planes</a>
            <a href="#faq">Preguntas frecuentes</a>
          </nav>

          <div className="lp-navbar__actions">
            <Link to="/app" className="lp-btn lp-btn-primary lp-btn-sm">Iniciar sesión</Link>
            <button
              className={`lp-navbar__toggle ${menuOpen ? 'lp-navbar__toggle--open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls="lp-mobile-menu"
              aria-label="Abrir menú de navegación"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <nav id="lp-mobile-menu" className={`lp-mobile-menu ${menuOpen ? 'lp-mobile-menu--open' : ''}`} aria-label="Navegación móvil">
          <a href="#caracteristicas" onClick={closeMenu}>Características</a>
          <a href="#beneficios" onClick={closeMenu}>Beneficios</a>
          <a href="#como-funciona" onClick={closeMenu}>Cómo funciona</a>
          <a href="#planes" onClick={closeMenu}>Planes</a>
          <a href="#faq" onClick={closeMenu}>Preguntas frecuentes</a>
          <Link to="/app" className="lp-btn lp-btn-primary" onClick={closeMenu}>Iniciar sesión</Link>
        </nav>
      </header>

      <main id="top">
        {/* ===================== HERO ===================== */}
        <section className="lp-hero">
          <div className="lp-hero__decor lp-hero__decor--1" aria-hidden="true"></div>
          <div className="lp-hero__decor lp-hero__decor--2" aria-hidden="true"></div>

          <div className="lp-container lp-hero__inner">
            <div className="lp-hero__copy">
              <span className="lp-badge-pill">✦ Plataforma para PYMES colombianas</span>
              <h1 className="lp-hero__title">Gestiona tu contabilidad de forma inteligente</h1>
              <p className="lp-hero__subtitle">El sistema de gestión contable pensado para PYMES colombianas: factura, calcula impuestos y cumple la normativa sin esfuerzo.</p>
              <div className="lp-hero__cta">
                <Link to="/app" className="lp-btn lp-btn-primary lp-btn-lg">Iniciar sesión</Link>
                <a href="#caracteristicas" className="lp-btn lp-btn-glass lp-btn-lg">Ver características</a>
              </div>
              <div className="lp-hero__trust">
                <svg className="lp-hero__trust-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span>Datos seguros y respaldados · Normativa colombiana</span>
              </div>
            </div>

            <Reveal className="lp-hero__media">
              <img
                src={heroImg}
                alt="Análisis de gráficos financieros para la gestión contable de una empresa"
                width={1400}
                height={933}
                loading="eager"
              />
            </Reveal>
          </div>
        </section>

        {/* ===================== SOCIAL PROOF ===================== */}
        {/* PLACEHOLDER: cifras de ejemplo, reemplazar con datos reales del negocio cuando existan */}
        <section className="lp-social-proof">
          <div className="lp-container lp-social-proof__inner">
            <p className="lp-social-proof__lead">
              Más de 500 PYMES colombianas ya confían en Contabiliza Ágil <small>(cifra referencial de ejemplo)</small>
            </p>
            <div className="lp-social-proof__stats">
              <div className="lp-stat"><span className="lp-stat__num">500+</span><span className="lp-stat__label">Empresas</span></div>
              <div className="lp-stat"><span className="lp-stat__num">98%</span><span className="lp-stat__label">Satisfacción</span></div>
              <div className="lp-stat"><span className="lp-stat__num">24/7</span><span className="lp-stat__label">Soporte</span></div>
            </div>
          </div>
        </section>

        {/* ===================== CARACTERÍSTICAS ===================== */}
        <section id="caracteristicas" className="lp-section" aria-labelledby="lp-caracteristicas-title">
          <div className="lp-container">
            <Reveal className="lp-section__head">
              <span className="lp-section__kicker">Características</span>
              <h2 id="lp-caracteristicas-title" className="lp-section__title">Todo lo que necesitas para llevar tu contabilidad</h2>
              <p className="lp-section__subtitle">Una plataforma completa para que dejes de perseguir hojas de cálculo y empieces a tomar decisiones.</p>
            </Reveal>

            <div className="lp-features-grid">
              {features.map((f) => (
                <Reveal key={f.title} className="lp-feature-card">
                  <div className={`lp-feature-card__icon lp-feature-card__icon--${f.color}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">{f.icon}</svg>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== BENEFICIOS (zig-zag) ===================== */}
        <section id="beneficios" className="lp-section lp-section--alt" aria-labelledby="lp-beneficios-title">
          <div className="lp-container lp-zigzag">
            <Reveal className="lp-zigzag__copy">
              <span className="lp-section__kicker">Beneficios</span>
              <h2 id="lp-beneficios-title" className="lp-section__title">La contabilidad de tu empresa, sin dolores de cabeza</h2>
              <ul className="lp-check-list">
                {beneficios.map((b) => (
                  <li key={b}><CheckIcon />{b}</li>
                ))}
              </ul>
              <Link to="/app" className="lp-btn lp-btn-primary">Comienza ahora</Link>
            </Reveal>
            <Reveal className="lp-zigzag__media">
              <img src={beneficio1Img} alt="Persona gestionando finanzas de su empresa en laptop" width={1000} height={1250} loading="lazy" />
            </Reveal>
          </div>

          <div className="lp-container lp-zigzag lp-zigzag--reverse">
            <Reveal className="lp-zigzag__media">
              <img src={beneficio2Img} alt="Equipo de una PYME trabajando en oficina moderna" width={1000} height={667} loading="lazy" />
            </Reveal>
            <Reveal className="lp-zigzag__copy">
              <span className="lp-section__kicker">Hecho para Colombia</span>
              <h2 className="lp-section__title">Pensado desde cero para PYMES colombianas</h2>
              <p className="lp-section__subtitle" style={{ marginBottom: 0 }}>
                Nada de plantillas genéricas traducidas: los cálculos de impuestos, el PUC y los flujos de trabajo están hechos para la realidad tributaria del país.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ===================== CÓMO FUNCIONA ===================== */}
        <section id="como-funciona" className="lp-section" aria-labelledby="lp-como-funciona-title">
          <div className="lp-container">
            <Reveal className="lp-section__head">
              <span className="lp-section__kicker">Cómo funciona</span>
              <h2 id="lp-como-funciona-title" className="lp-section__title">Empieza en cuatro pasos</h2>
            </Reveal>

            <div className="lp-steps">
              {pasos.map((p, i) => (
                <Reveal key={p.title} className="lp-step">
                  <span className="lp-step__num">{i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== PLANES ===================== */}
        {/* PLACEHOLDER: no hay pricing real definido en el producto; validar con negocio antes de publicar */}
        <section id="planes" className="lp-section lp-section--alt" aria-labelledby="lp-planes-title">
          <div className="lp-container">
            <Reveal className="lp-section__head">
              <span className="lp-section__kicker">Planes</span>
              <h2 id="lp-planes-title" className="lp-section__title">Un plan para cada etapa de tu negocio</h2>
              <p className="lp-section__subtitle">Precios de ejemplo — contáctanos para conocer el plan ideal para tu empresa.</p>
            </Reveal>

            <div className="lp-pricing-grid">
              <Reveal className="lp-price-card">
                <h3>Básico</h3>
                <p className="lp-price-card__desc">Ideal para independientes y negocios que están empezando.</p>
                <p className="lp-price-card__price">Contáctanos</p>
                <ul>
                  <li>Facturación electrónica</li>
                  <li>Cálculo automático de impuestos</li>
                  <li>1 usuario</li>
                </ul>
                <Link to="/app" className="lp-btn lp-btn-outline">Iniciar sesión</Link>
              </Reveal>

              <Reveal className="lp-price-card lp-price-card--featured">
                <span className="lp-price-card__badge">Más popular</span>
                <h3>Profesional</h3>
                <p className="lp-price-card__desc">Para PYMES en crecimiento que necesitan todo el paquete.</p>
                <p className="lp-price-card__price">Contáctanos</p>
                <ul>
                  <li>Todo lo del plan Básico</li>
                  <li>Reportes PDF/Excel y cartera</li>
                  <li>Asistente contable con IA</li>
                  <li>Hasta 5 usuarios con roles</li>
                </ul>
                <Link to="/app" className="lp-btn lp-btn-primary">Empieza gratis</Link>
              </Reveal>

              <Reveal className="lp-price-card">
                <h3>Empresarial</h3>
                <p className="lp-price-card__desc">Para empresas con equipos contables más grandes.</p>
                <p className="lp-price-card__price">Contáctanos</p>
                <ul>
                  <li>Todo lo del plan Profesional</li>
                  <li>Usuarios y roles ilimitados</li>
                  <li>Soporte prioritario</li>
                </ul>
                <Link to="/app" className="lp-btn lp-btn-outline">Iniciar sesión</Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section id="faq" className="lp-section" aria-labelledby="lp-faq-title">
          <div className="lp-container lp-container--narrow">
            <Reveal className="lp-section__head">
              <span className="lp-section__kicker">Preguntas frecuentes</span>
              <h2 id="lp-faq-title" className="lp-section__title">¿Tienes dudas? Aquí las resolvemos</h2>
            </Reveal>

            <Reveal className="lp-faq-list">
              <>
                {faqs.map((f) => (
                  <details key={f.q} className="lp-faq-item">
                    <summary>{f.q} <ChevronIcon /></summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </>
            </Reveal>
          </div>
        </section>

        {/* ===================== CTA FINAL ===================== */}
        <section className="lp-cta-final">
          <Reveal className="lp-container lp-cta-final__inner">
            <h2>Empieza a gestionar tu contabilidad hoy mismo</h2>
            <p>Únete a las PYMES colombianas que ya simplificaron su contabilidad.</p>
            <Link to="/app" className="lp-btn lp-btn-white lp-btn-lg">Iniciar sesión</Link>
          </Reveal>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer__inner">
          <div className="lp-footer__col lp-footer__brand">
            <Brand light />
            <p>Sistema de gestión contable para empresas colombianas.</p>
            <p className="lp-footer__copy">© 2026 Contabiliza Ágil. Todos los derechos reservados.</p>
          </div>

          <div className="lp-footer__col">
            <h4>Producto</h4>
            <a href="#caracteristicas">Características</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#planes">Planes</a>
          </div>

          <div className="lp-footer__col">
            <h4>Legal</h4>
            {/* PLACEHOLDER: no existen páginas legales reales todavía, por eso no son enlaces */}
            <span className="lp-footer__col-disabled">Términos y condiciones</span>
            <span className="lp-footer__col-disabled">Política de privacidad</span>
          </div>

          <div className="lp-footer__col">
            <h4>¿Listo para empezar?</h4>
            <Link to="/app" className="lp-btn lp-btn-primary lp-btn-sm">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
