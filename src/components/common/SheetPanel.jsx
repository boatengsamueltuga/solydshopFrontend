import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { HiX } from 'react-icons/hi';

const SHEET_WIDTH = 480;

/**
 * SheetPanel — right-slide panel replacing center MUI Dialog for CRUD and detail views.
 *
 * Props:
 *   open      — boolean (required) — controls visibility
 *   onClose   — function (required) — called on backdrop click, Escape, or close button
 *   title     — string (required)
 *   subtitle  — string (optional)
 *   children  — React node — scrollable body content
 *   footer    — React node (optional) — sticky footer, e.g. action buttons
 *   width     — number (optional) — panel width in px, default 480
 */
const SheetPanel = ({ open, onClose, title, subtitle, children, footer, width = SHEET_WIDTH }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width:           { xs: '100%', sm: width },
          backgroundColor: 'var(--surface)',
          backgroundImage: 'none',
          borderLeft:      '1px solid var(--border)',
          display:         'flex',
          flexDirection:   'column',
          overflowX:       'hidden',
        },
      }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0,0,0,0.5)' },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display:         'flex',
          alignItems:      'flex-start',
          justifyContent:  'space-between',
          gap:             2,
          padding:         'var(--space-5) var(--space-6)',
          borderBottom:    '1px solid var(--border)',
          flexShrink:      0,
          backgroundColor: 'var(--surface)',
          position:        'sticky',
          top:             0,
          zIndex:          1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
            sx={{
              fontFamily:    'var(--font-display)',
              fontWeight:    700,
              fontSize:      '1rem',
              color:         'var(--text)',
              lineHeight:    1.2,
              letterSpacing: '-0.01em',
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
                mt:         0.5,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close panel"
          sx={{
            flexShrink:   0,
            mt:           '-2px',
            color:        'var(--text-3)',
            borderRadius: 'var(--r-md)',
            '&:hover': {
              backgroundColor: 'var(--surface-hover)',
              color:           'var(--text)',
            },
          }}
        >
          <HiX size={18} />
        </IconButton>
      </Box>

      {/* ── Scrollable body ── */}
      <Box
        sx={{
          flex:      1,
          overflowY: 'auto',
          padding:   'var(--space-6)',
        }}
      >
        {children}
      </Box>

      {/* ── Sticky footer (action buttons) ── */}
      {footer && (
        <Box
          sx={{
            flexShrink:      0,
            padding:         'var(--space-4) var(--space-6)',
            borderTop:       '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            position:        'sticky',
            bottom:          0,
          }}
        >
          {footer}
        </Box>
      )}
    </Drawer>
  );
};

export default SheetPanel;
