/**
 * AuthLayout — two-column auth shell.
 * Left: brand panel (hidden on mobile). Right: scrollable form area.
 * The global Navbar (80px fixed) floats above this layout.
 */
const AuthLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

    {/* ── Brand panel ── */}
    <div
      className="auth-brand-panel"
      style={{
        width:           '40%',
        flexShrink:      0,
        background:      'var(--surface)',
        borderRight:     '1px solid var(--border)',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'center',
        padding:         'calc(80px + 48px) 40px 48px',
        position:        'relative',
        overflow:        'hidden',
      }}
    >
      {/* Subtle grid overlay */}
      <div style={{
        position:        'absolute',
        inset:           0,
        pointerEvents:   'none',
        opacity:         0.35,
        backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
        backgroundSize:  '32px 32px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Label */}
        <p style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      'var(--text-2xs)',
          fontWeight:    600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:         'var(--text-3)',
          marginBottom:  'var(--space-3)',
        }}>
          Industrial Procurement
        </p>

        {/* Wordmark */}
        <h1 style={{
          fontFamily:    'var(--font-display)',
          fontWeight:    700,
          fontSize:      'clamp(2rem, 3vw, 2.75rem)',
          lineHeight:    1.1,
          letterSpacing: '-0.02em',
          color:         'var(--text)',
          margin:        '0 0 var(--space-6)',
        }}>
          Solyd<span style={{ color: 'var(--accent)' }}>Shop</span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily:    'var(--font-body)',
          fontSize:      'var(--text-sm)',
          color:         'var(--text-2)',
          lineHeight:    1.7,
          maxWidth:      '280px',
          marginBottom:  'var(--space-8)',
        }}>
          The parts catalog built for fleet managers, mechanics, and construction teams.
        </p>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[
            'Real-time inventory across 10,000+ SKUs',
            'Model & part number search precision',
            'Bulk ordering for fleet operations',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{
                width:      '6px',
                height:     '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize:   'var(--text-sm)',
                color:      'var(--text-3)',
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Footer rule */}
        <div style={{
          marginTop:   'var(--space-10)',
          paddingTop:  'var(--space-6)',
          borderTop:   '1px solid var(--border)',
        }}>
          <span style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      'var(--text-2xs)',
            fontWeight:    600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color:         'var(--text-3)',
          }}>
            Trusted by professionals
          </span>
        </div>

      </div>
    </div>

    {/* ── Form panel ── */}
    <div
      className="auth-form-panel"
      style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'calc(80px + var(--space-8)) var(--space-6) var(--space-8)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {children}
      </div>
    </div>

    <style>{`
      @media (max-width: 767px) {
        .auth-brand-panel { display: none !important; }
      }
    `}</style>

  </div>
);

export default AuthLayout;
