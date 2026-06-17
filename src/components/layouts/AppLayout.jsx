/**
 * AppLayout — base wrapper shared by all other layouts.
 * Applies the dark background, minimum viewport height, and body font.
 * Every more specific layout (CustomerLayout, AdminLayout, SellerLayout)
 * renders its content inside this shell.
 */
const AppLayout = ({ children }) => {
  return (
    <div
      style={{
        minHeight:       '100vh',
        backgroundColor: 'var(--bg)',
        color:           'var(--text)',
        fontFamily:      'var(--font-body)',
      }}
    >
      {children}
    </div>
  );
};

export default AppLayout;
