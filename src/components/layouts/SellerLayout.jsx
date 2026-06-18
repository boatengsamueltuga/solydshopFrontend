import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import AppLayout from './AppLayout';
import AppSidebar from '../navigation/AppSidebar';
import TopBar from '../navigation/TopBar';

const NAVBAR_HEIGHT = 80;

const SellerLayout = ({ title = 'Seller', children }) => {
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
        className="seller-sidebar-desktop"
      >
        <AppSidebar variant="seller" />
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
        className="seller-sidebar-mobile"
      >
        <AppSidebar variant="seller" />
      </Drawer>

      {/* ── Main content column ── */}
      <div
        className="seller-main-col"
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
            position:   'sticky',
            top:        0,
            zIndex:     'var(--z-sticky)',
            flexShrink: 0,
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
          .seller-sidebar-desktop { display: none !important; }
          .seller-main-col { margin-left: 0 !important; }
        }
        @media (min-width: 768px) {
          .seller-sidebar-mobile { display: none !important; }
        }
      `}</style>

    </AppLayout>
  );
};

export default SellerLayout;
