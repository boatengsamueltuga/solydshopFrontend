import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiMenu, HiBell, HiHome } from 'react-icons/hi';

/* ── Inline styles ─────────────────────────────────────────────────────── */

const S = {
  bar: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    height:          'var(--topbar-height)',
    padding:         '0 var(--space-6)',
    backgroundColor: 'var(--surface)',
    borderBottom:    '1px solid var(--border)',
  },

  left: {
    display:    'flex',
    alignItems: 'center',
    gap:        'var(--space-3)',
    minWidth:   0,
  },

  menuBtn: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         'var(--space-1)',
    borderRadius:    'var(--r-md)',
    border:          'none',
    backgroundColor: 'transparent',
    color:           'var(--text-3)',
    cursor:          'pointer',
    flexShrink:      0,
    /* visible on mobile only — controlled by parent via CSS or prop */
  },

  title: {
    fontSize:     '0.9375rem',
    fontWeight:   600,
    fontFamily:   'var(--font-display)',
    color:        'var(--text)',
    letterSpacing: '-0.01em',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },

  right: {
    display:    'flex',
    alignItems: 'center',
    gap:        'var(--space-2)',
    flexShrink: 0,
  },

  iconBtn: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           '32px',
    height:          '32px',
    borderRadius:    'var(--r-md)',
    border:          'none',
    backgroundColor: 'transparent',
    color:           'var(--text-3)',
    cursor:          'pointer',
    transition:      `color var(--duration-fast), background-color var(--duration-fast)`,
  },

  avatar: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           '30px',
    height:          '30px',
    borderRadius:    '50%',
    backgroundColor: 'var(--accent-subtle)',
    border:          '1px solid var(--accent-border)',
    color:           'var(--accent)',
    fontSize:        '0.75rem',
    fontWeight:      700,
    fontFamily:      'var(--font-mono)',
    flexShrink:      0,
    cursor:          'default',
    userSelect:      'none',
  },
};

/* ── TopBar ────────────────────────────────────────────────────────────── */

/**
 * TopBar — fixed-height (56px) top bar for admin and seller layouts.
 *
 * Props:
 *   title        — string; page title shown on the left side.
 *                  Defaults to 'SolydShop'.
 *   onMenuClick  — optional callback; fires when the hamburger button is
 *                  clicked (mobile sidebar toggle). When undefined the button
 *                  is still rendered for layout consistency.
 *
 * Placeholders (wired in future phases):
 *   - Notification bell icon (visible, no handler yet)
 *   - User avatar (initials from Redux auth state)
 *   - User dropdown menu (future P3+)
 *
 * Consumed by AdminLayout and SellerLayout via the topbar prop:
 *   <AdminLayout topbar={<TopBar title="Dashboard" />}>
 */
const TopBar = ({ title = 'SolydShop', onMenuClick }) => {
  const { user } = useSelector((s) => s.auth);
  const navigate  = useNavigate();

  const initials   = user?.email?.[0]?.toUpperCase() ?? 'U';
  const isAdmin    = user?.roles?.includes('ROLE_ADMIN');
  const bellTarget = isAdmin ? '/admin/orders' : '/seller/dashboard';

  return (
    <div style={S.bar} role="banner">

      {/* Left: hamburger + home + page title */}
      <div style={S.left}>
        <button
          style={S.menuBtn}
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          <HiMenu size={20} />
        </button>

        <button
          style={S.iconBtn}
          onClick={() => navigate('/')}
          aria-label="Go to home"
          title="Home"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          <HiHome size={18} />
        </button>

        <span style={S.title}>{title}</span>
      </div>

      {/* Right: notifications (placeholder) + user avatar */}
      <div style={S.right}>

        {/* Notification bell */}
        <button
          style={S.iconBtn}
          aria-label="Notifications"
          title={isAdmin ? 'View orders' : 'View dashboard'}
          onClick={() => navigate(bellTarget)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiBell size={18} />
            <span style={{
              position:        'absolute',
              top:             '-2px',
              right:           '-3px',
              width:           '6px',
              height:          '6px',
              borderRadius:    '50%',
              backgroundColor: 'var(--accent)',
              border:          '1.5px solid var(--surface)',
            }} />
          </div>
        </button>

        {/* User avatar — initials, no dropdown yet */}
        <div
          style={S.avatar}
          title={user?.email ?? ''}
          aria-label={`Signed in as ${user?.email ?? 'user'}`}
        >
          {initials}
        </div>

      </div>

    </div>
  );
};

export default TopBar;
