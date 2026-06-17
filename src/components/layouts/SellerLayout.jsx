import AppLayout from './AppLayout';

/**
 * SellerLayout — for all /seller/* pages.
 *
 * Structure mirrors AdminLayout exactly (sidebar + topbar + content).
 * Kept as a separate component so seller-specific overrides
 * (different sidebar links, different accent color in future) can be
 * applied here without affecting AdminLayout.
 *
 * Props:
 *   sidebar  — optional React node; populated in P1.6 with <AppSidebar variant="seller" />
 *   topbar   — optional React node; populated in P1.6 with <TopBar />
 *   children — page content
 */
const SellerLayout = ({ sidebar, topbar, children }) => {
  return (
    <AppLayout>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar slot — filled by <AppSidebar variant="seller" /> in P1.6 */}
        {sidebar && (
          <aside
            style={{
              width:           'var(--sidebar-width)',
              flexShrink:      0,
              backgroundColor: 'var(--surface)',
              borderRight:     '1px solid var(--border)',
              position:        'sticky',
              top:             0,
              height:          '100vh',
              overflowY:       'auto',
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Right column: topbar + scrollable content */}
        <div
          style={{
            flex:          1,
            display:       'flex',
            flexDirection: 'column',
            minWidth:      0,
            overflow:      'hidden',
          }}
        >
          {/* TopBar slot — filled by <TopBar /> in P1.6 */}
          {topbar && (
            <div
              style={{
                height:          'var(--topbar-height)',
                flexShrink:      0,
                backgroundColor: 'var(--surface)',
                borderBottom:    '1px solid var(--border)',
                position:        'sticky',
                top:             0,
                zIndex:          'var(--z-sticky)',
              }}
            >
              {topbar}
            </div>
          )}

          {/* Scrollable page content */}
          <main
            style={{
              flex:      1,
              overflowY: 'auto',
              padding:   'var(--space-6)',
            }}
          >
            {children}
          </main>
        </div>

      </div>
    </AppLayout>
  );
};

export default SellerLayout;
