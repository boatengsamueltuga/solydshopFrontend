import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  HiTemplate,
  HiCube,
  HiTag,
  HiClipboardList,
  HiUsers,
  HiChartBar,
  HiLogout,
} from 'react-icons/hi';

import api from '../../api/api';
import { logoutSuccess } from '../../features/auth/authSlice';

/* ── Navigation config ─────────────────────────────────────────────────── */

const ADMIN_GROUPS = [
  {
    label: 'OVERVIEW',
    links: [
      { to: '/admin/dashboard',  label: 'Dashboard',  Icon: HiTemplate },
    ],
  },
  {
    label: 'CATALOG',
    links: [
      { to: '/admin/products',   label: 'Products',   Icon: HiCube },
      { to: '/admin/categories', label: 'Categories', Icon: HiTag },
    ],
  },
  {
    label: 'OPERATIONS',
    links: [
      { to: '/admin/orders',     label: 'Orders',     Icon: HiClipboardList },
      { to: '/admin/users',      label: 'Users',      Icon: HiUsers },
    ],
  },
];

const SELLER_GROUPS = [
  {
    label: 'MY STORE',
    links: [
      { to: '/seller/dashboard', label: 'Dashboard',  Icon: HiChartBar },
    ],
  },
];

/* ── Inline styles ─────────────────────────────────────────────────────── */

const S = {
  sidebar: {
    display:         'flex',
    flexDirection:   'column',
    height:          '100%',
    backgroundColor: 'var(--surface)',
    borderRight:     '1px solid var(--border)',
    width:           'var(--sidebar-width)',
  },

  brand: {
    display:      'flex',
    alignItems:   'center',
    gap:          '10px',
    height:       'var(--topbar-height)',
    padding:      '0 var(--space-4)',
    borderBottom: '1px solid var(--border)',
    flexShrink:   0,
  },

  brandName: {
    fontSize:    '1.0625rem',
    fontWeight:  700,
    fontFamily:  'var(--font-display)',
    color:       'var(--accent)',
    letterSpacing: '-0.01em',
    lineHeight:  1,
  },

  badge: {
    fontSize:        '0.6rem',
    fontWeight:      600,
    fontFamily:      'var(--font-mono)',
    color:           'var(--accent)',
    backgroundColor: 'var(--accent-subtle)',
    border:          '1px solid var(--accent-border)',
    borderRadius:    'var(--r-sm)',
    padding:         '1px 5px',
    letterSpacing:   '0.06em',
  },

  nav: {
    flex:      1,
    overflowY: 'auto',
    padding:   'var(--space-4) 0',
  },

  group: {
    marginBottom: 'var(--space-4)',
  },

  groupLabel: {
    fontSize:      '0.625rem',
    fontWeight:    600,
    fontFamily:    'var(--font-body)',
    color:         'var(--text-4)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding:       '0 var(--space-4)',
    marginBottom:  'var(--space-1)',
  },

  /* link styles are applied inline per-link based on active state */

  footer: {
    padding:      'var(--space-3) var(--space-2)',
    borderTop:    '1px solid var(--border)',
    flexShrink:   0,
  },

  logoutBtn: {
    display:         'flex',
    alignItems:      'center',
    gap:             'var(--space-3)',
    width:           '100%',
    padding:         'var(--space-2) var(--space-3)',
    borderRadius:    'var(--r-md)',
    border:          'none',
    backgroundColor: 'transparent',
    cursor:          'pointer',
    color:           'var(--text-3)',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.875rem',
    fontWeight:      500,
    textAlign:       'left',
    transition:      `color var(--duration-fast), background-color var(--duration-fast)`,
  },
};

/* ── SidebarLink ───────────────────────────────────────────────────────── */

const SidebarLink = ({ to, label, Icon }) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             'var(--space-3)',
        padding:         'var(--space-2) var(--space-3)',
        margin:          '1px var(--space-2)',
        borderRadius:    'var(--r-md)',
        textDecoration:  'none',
        fontSize:        '0.875rem',
        fontWeight:      active ? 600 : 400,
        fontFamily:      'var(--font-body)',
        color:           active ? 'var(--accent)' : 'var(--text-2)',
        backgroundColor: active ? 'var(--accent-subtle)' : 'transparent',
        borderLeft:      active ? '2px solid var(--accent)' : '2px solid transparent',
        transition:      `color var(--duration-fast), background-color var(--duration-fast)`,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-2)';
        }
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
      {label}
    </Link>
  );
};

/* ── AppSidebar ────────────────────────────────────────────────────────── */

/**
 * AppSidebar — persistent left navigation panel.
 *
 * Props:
 *   variant — 'admin' | 'seller'
 *             Determines which navigation groups are rendered.
 *             Defaults to 'admin'.
 *
 * Consumed by AdminLayout and SellerLayout via the sidebar prop:
 *   <AdminLayout sidebar={<AppSidebar variant="admin" />}>
 *   <SellerLayout sidebar={<AppSidebar variant="seller" />}>
 */
const AppSidebar = ({ variant = 'admin' }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const isAdmin   = variant === 'admin';
  const groups    = isAdmin ? ADMIN_GROUPS : SELLER_GROUPS;
  const badgeText = isAdmin ? 'ADMIN' : 'SELLER';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      /* logout even if request fails */
    } finally {
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  return (
    <div style={S.sidebar}>

      {/* Brand + role badge */}
      <div style={S.brand}>
        <span style={S.brandName}>SolydShop</span>
        <span style={S.badge}>{badgeText}</span>
      </div>

      {/* Navigation groups */}
      <nav style={S.nav} aria-label={`${badgeText} navigation`}>
        {groups.map((group) => (
          <div key={group.label} style={S.group}>
            <p style={S.groupLabel}>{group.label}</p>
            {group.links.map((link) => (
              <SidebarLink key={link.to} {...link} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: user info + logout */}
      <div style={S.footer}>
        {user && (
          <p
            style={{
              fontSize:   '0.75rem',
              color:      'var(--text-3)',
              fontFamily: 'var(--font-body)',
              padding:    '0 var(--space-3)',
              marginBottom: 'var(--space-2)',
              overflow:   'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.email}
          </p>
        )}

        <button
          style={S.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--error-subtle)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          <HiLogout size={16} style={{ flexShrink: 0 }} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default AppSidebar;
