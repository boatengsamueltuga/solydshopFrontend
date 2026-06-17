import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import AppLayout from './AppLayout';
import AppSidebar from '../navigation/AppSidebar';
import TopBar from '../navigation/TopBar';

const NAVBAR_HEIGHT = 80;

/**
 * AdminLayout — full-page admin shell with persistent sidebar and topbar.
 *
 * Props:
 *   title    — string; page title shown in the TopBar.
 *   children — page content rendered in the scrollable main area.
 *
 * Structure (desktop):
 *   AppLayout (dark bg)
 *     ├── <aside>  — fixed left sidebar (240px), starts below the global Navbar
 *     └── <main>   — content column (margin-left: 240px)
 *                     ├── TopBar (56px, sticky)
 *                     └── scrollable page area
 *
 * Mobile (≤ 767px):
 *   Sidebar becomes a full-height MUI Drawer triggered by TopBar hamburger.
 *   Drawer auto-closes on route change.
 */
const AdminLayout = ({ title = 'Admin', children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <AppLayout>

      {/* ── Desktop sidebar ── */}
      <aside
        style={{
          position:        'fixed',
          top:             `${NAVBAR_HEIGHT}px`,
          left:            0,
          bottom:          0,
          width:           'var(--sidebar-width)',
          zIndex:          'var(--z-sticky)',
          overflowY:       'auto',
          overflowX:       'hidden',
          backgroundColor: 'var(--surface)',
          borderRight:     '1px solid var(--border)',
        }}
        className="admin-sidebar-desktop"
      >
        <AppSidebar variant="admin" />
      </aside>

      {/* ── Mobile sidebar (MUI Drawer) ── */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            top:             `${NAVBAR_HEIGHT}px`,
            height:          `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            backgroundImage: 'none',
            backgroundColor: 'var(--surface)',
            borderRight:     '1px solid var(--border)',
            width:           'var(--sidebar-width)',
          },
        }}
        slotProps={{
          backdrop: {
            sx: { top: `${NAVBAR_HEIGHT}px` },
          },
        }}
        className="admin-sidebar-mobile"
      >
        <AppSidebar variant="admin" />
      </Drawer>

      {/* ── Main content column ── */}
      <div
        className="admin-main-col"
        style={{
          marginLeft:    'var(--sidebar-width)',
          display:       'flex',
          flexDirection: 'column',
          minHeight:     `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        {/* TopBar */}
        <div
          style={{
            position:        'sticky',
            top:             0,
            zIndex:          'var(--z-sticky)',
            flexShrink:      0,
          }}
        >
          <TopBar
            title={title}
            onMenuClick={() => setMobileOpen(true)}
          />
        </div>

        {/* Page content */}
        <main
          style={{
            flex:       1,
            background: 'var(--bg)',
            padding:    'var(--space-6)',
            overflowX:  'hidden',
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-main-col { margin-left: 0 !important; }
        }
        @media (min-width: 768px) {
          .admin-sidebar-mobile { display: none !important; }
        }
      `}</style>

    </AppLayout>
  );
};

export default AdminLayout;
