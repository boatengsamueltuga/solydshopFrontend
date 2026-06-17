import AppLayout from './AppLayout';

/**
 * AdminLayout — for all /admin/* pages.
 *
 * Structure:
 *   AppLayout (dark bg, min-h-screen)
 *     <div> (flex row, full height)
 *       <aside>   ← sidebar slot; populated in P1.6 with <AppSidebar />
 *         {sidebar}
 *       </aside>
 *       <div> (flex column, fills remaining width)
 *         <div>   ← topbar slot; populated in P1.6 with <TopBar />
 *           {topbar}
 *         </div>
 *         <main>  ← scrollable page content
 *           {children}
 *         </main>
 *       </div>
 *     </div>
 *
 * Props:
 *   sidebar  — optional React node; renders as the left sidebar.
 *              When undefined no sidebar column is rendered and the content
 *              takes full width (safe default until P1.6).
 *   topbar   — optional React node; renders as the top bar above content.
 *              When undefined no topbar is rendered.
 *   children — page content
 */
const AdminLayout = ({ sidebar, topbar, children }) => {
  return (
    <AppLayout>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar slot — filled by <AppSidebar variant="admin" /> in P1.6 */}
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
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            minWidth:       0,   /* prevent flex overflow */
            overflow:       'hidden',
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
              flex:       1,
              overflowY:  'auto',
              padding:    'var(--space-6)',
            }}
          >
            {children}
          </main>
        </div>

      </div>
    </AppLayout>
  );
};

export default AdminLayout;
