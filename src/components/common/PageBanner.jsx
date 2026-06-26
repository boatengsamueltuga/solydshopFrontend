import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * PageBanner — consistent page header used across admin, seller, and customer pages.
 *
 * Props:
 *   title     — string (required) — main heading
 *   subtitle  — string (optional) — secondary line below title
 *   icon      — React node (optional) — icon rendered in accent-tinted box, e.g. <InventoryOutlinedIcon sx={{ fontSize: 20 }} />
 *   action    — React node (optional) — rendered right-aligned, e.g. a <Button>
 *   children  — React node (optional) — rendered below the title row, e.g. stat pills
 */
const PageBanner = ({ title, subtitle, icon, action, children }) => {
  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        backgroundColor: 'var(--surface-mid)',
        borderBottom:    '1px solid var(--border)',
        px: { xs: 3, sm: 5, md: 8 },
        py: { xs: 3, md: 4 },
      }}
    >
      {/* Title row: [icon + text] ... [action] */}
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        sx={{ mb: children ? 3 : 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>

          {/* Icon container */}
          {icon && (
            <Box
              sx={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                width:           40,
                height:          40,
                borderRadius:    'var(--r-md)',
                backgroundColor: 'var(--accent-subtle)',
                border:          '1px solid var(--accent-border)',
                color:           'var(--text-2)',
                flexShrink:      0,
              }}
            >
              {icon}
            </Box>
          )}

          {/* Title + subtitle */}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              sx={{
                fontFamily:    'var(--font-display)',
                fontWeight:    700,
                fontSize:      { xs: '1.125rem', md: '1.375rem' },
                lineHeight:    1.2,
                letterSpacing: '-0.01em',
                color:         'var(--text)',
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                component="p"
                sx={{
                  fontFamily: 'var(--font-body)',
                  fontSize:   '0.8125rem',
                  color:      'var(--text-3)',
                  mt:         0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Optional right-side action (e.g. Create button) */}
        {action && <Box sx={{ flexShrink: 0, ml: '24px' }}>{action}</Box>}
      </Stack>

      {/* Optional extra content below (stat pills, filters, etc.) */}
      {children}
    </Box>
  );
};

export default PageBanner;
