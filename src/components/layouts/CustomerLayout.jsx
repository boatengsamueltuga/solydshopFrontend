import AppLayout from './AppLayout';

/**
 * CustomerLayout — for customer-facing pages (/, /cart, /checkout, /orders).
 *
 * Structure:
 *   AppLayout (dark bg, min-h-screen)
 *     [topbar]   ← slot; populated in P1.6 with <TopBar />
 *     <main>     ← centered, max-width --content-max (1440px)
 *       {children}
 *     </main>
 *
 * Props:
 *   topbar   — optional React node; renders above the content area.
 *              When undefined nothing is rendered (existing Navbar in App.jsx
 *              remains the topbar until pages are individually redesigned).
 *   children — page content
 */
const CustomerLayout = ({ topbar, children }) => {
  return (
    <AppLayout>
      {/* TopBar slot — filled by <TopBar /> in P1.6 */}
      {topbar && (
        <div
          style={{
            position:        'sticky',
            top:             0,
            zIndex:          'var(--z-sticky)',
            height:          'var(--topbar-height)',
            backgroundColor: 'var(--surface)',
            borderBottom:    '1px solid var(--border)',
          }}
        >
          {topbar}
        </div>
      )}

      {/* Page content — centered, capped at 1440px */}
      <main
        style={{
          maxWidth: 'var(--content-max)',
          margin:   '0 auto',
          padding:  '0 var(--space-6)',
          width:    '100%',
        }}
      >
        {children}
      </main>
    </AppLayout>
  );
};

export default CustomerLayout;
