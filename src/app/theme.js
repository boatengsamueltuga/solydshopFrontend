import { createTheme } from '@mui/material/styles';

/* ═══════════════════════════════════════════════════════════════════════════
   SolydShop MUI Theme — light / sage & caramel
   Palette uses sRGB hex (MUI's colorManipulator cannot parse oklch at
   JS-evaluation time). styleOverrides use oklch directly since those values
   go straight to CSS without JS color processing.

   Hex values are accurate conversions of the matching tokens.css oklch values.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Color map (oklch → sRGB hex) ─────────────────────────────────────────
   --bg              oklch(0.98 0.018 96)   →  #fefae0
   --surface         oklch(0.95 0.025 81)   →  #faedcd
   --surface-mid     oklch(0.93 0.038 106)  →  #e9edc9
   --surface-high    oklch(0.84 0.056 119)  →  #ccd5ae
   --surface-hover   oklch(0.79 0.058 119)  →  #b7cc94
   --border-subtle   oklch(0.90 0.040 110)  →  #d0e0b0
   --border          oklch(0.82 0.056 116)  →  #bccf98
   --text            oklch(0.22 0.045 55)   →  #3a2010
   --text-2          oklch(0.38 0.045 55)   →  #5e3a1a
   --text-3          oklch(0.56 0.040 55)   →  #8a6440
   --accent          oklch(0.73 0.100 63)   →  #d4a373
   --accent-hi       oklch(0.80 0.090 63)   →  #e4be96
   --accent-lo       oklch(0.62 0.100 63)   →  #bc8852
   --success         oklch(0.40 0.14 150)   →  #1a5e3c
   --warning         oklch(0.50 0.14 75)    →  #7a4e0a
   --error           oklch(0.44 0.16 28)    →  #8a1c12
   --info            oklch(0.44 0.12 248)   →  #1c3d88
   ────────────────────────────────────────────────────────────────────────── */

export const solydTheme = createTheme({

  /* ── Palette ─────────────────────────────────────────────────────────── */
  palette: {
    mode: 'light',

    background: {
      default: '#fefae0',   /* --bg      */
      paper:   '#faedcd',   /* --surface */
    },

    primary: {
      main:         '#d4a373',   /* --accent    */
      dark:         '#bc8852',   /* --accent-lo */
      light:        '#e4be96',   /* --accent-hi */
      contrastText: '#3a2010',   /* --text (dark on caramel) */
    },

    secondary: {
      main:         '#ccd5ae',   /* --surface-high  */
      dark:         '#b7cc94',   /* --surface-hover */
      light:        '#e9edc9',   /* --surface-mid   */
      contrastText: '#3a2010',   /* --text          */
    },

    success: {
      main:         '#1a5e3c',   /* --success        */
      dark:         '#144830',
      light:        '#237850',
      contrastText: '#fefae0',
    },

    warning: {
      main:         '#7a4e0a',   /* --warning        */
      dark:         '#5e3c06',
      light:        '#9e6812',
      contrastText: '#fefae0',
    },

    error: {
      main:         '#8a1c12',   /* --error          */
      dark:         '#6c140e',
      light:        '#a8301e',
      contrastText: '#fefae0',
    },

    info: {
      main:         '#1c3d88',   /* --info           */
      dark:         '#142e6c',
      light:        '#2a52a8',
      contrastText: '#fefae0',
    },

    text: {
      primary:   '#3a2010',   /* --text   */
      secondary: '#5e3a1a',   /* --text-2 */
      disabled:  '#8a6440',   /* --text-3 */
    },

    divider: '#bccf98',         /* --border */

    action: {
      active:             '#3a2010',
      hover:              '#e9edc9',   /* --surface-mid  */
      hoverOpacity:       0.08,
      selected:           '#ccd5ae',   /* --surface-high */
      selectedOpacity:    0.12,
      disabled:           '#8a6440',   /* --text-3       */
      disabledBackground: '#e9edc9',
      focus:              '#e9edc9',
      focusOpacity:       0.12,
    },
  },

  /* ── Typography ──────────────────────────────────────────────────────── */
  typography: {
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",

    h1: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600 },

    button: {
      fontFamily:    "'IBM Plex Sans', system-ui, sans-serif",
      fontWeight:    600,
      textTransform: 'none',
    },
  },

  /* ── Shape ───────────────────────────────────────────────────────────── */
  shape: { borderRadius: 4 },

  /* ── Component overrides ─────────────────────────────────────────────── */
  components: {

    /* Paper — no gradient overlay */
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },

    /* Card — sage surface-high, sage border, 4px radius */
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'oklch(0.84 0.056 119)',
          border:          '1px solid oklch(0.82 0.056 116)',
          borderRadius:    '4px',
        },
      },
    },

    /* Button — flat, no text-transform, IBM Plex Sans 600 */
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          fontFamily:    "'IBM Plex Sans', system-ui, sans-serif",
          fontWeight:    600,
          textTransform: 'none',
          borderRadius:  '4px',
          letterSpacing: '0.01em',
        },
        outlined: {
          /* Light mode: full-opacity caramel border — more visible than default 50% */
          '--variant-outlinedBorder': '#d4a373',
          '--variant-outlinedColor':  'oklch(0.38 0.045 55)',

          /* Dark mode: slate-400 border (#94A3B8) — 5.5:1 contrast on navy */
          '[data-theme="dark"] &': {
            '--variant-outlinedBorder': '#94A3B8',
            '--variant-outlinedColor':  '#CBD5E1',
          },
          '[data-theme="dark"] &:hover': {
            '--variant-outlinedBorder': '#D4A373',
            '--variant-outlinedBg':     'rgba(212, 163, 115, 0.12)',
            '--variant-outlinedColor':  '#F8FAFC',
          },
        },
      },
    },

    /* IconButton — square corners */
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: '4px' },
      },
    },

    /* Chip — IBM Plex Mono, tight radius */
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily:   "'IBM Plex Mono', monospace",
          fontSize:     '0.7rem',
          fontWeight:   500,
          borderRadius: '3px',
        },
      },
    },

    /* OutlinedInput — sage bg, caramel focus border */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'oklch(0.84 0.056 119)',
          borderRadius:    '3px',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'oklch(0.73 0.100 63)',
            borderWidth: '1px',
          },
        },
        notchedOutline: { borderColor: 'oklch(0.82 0.056 116)' },
      },
    },

    /* InputLabel — caramel on focus */
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: 'oklch(0.73 0.100 63)' },
        },
      },
    },

    /* Dialog — surface panel bg, sage border */
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'oklch(0.95 0.025 81)',
          border:          '1px solid oklch(0.82 0.056 116)',
          borderRadius:    '4px',
        },
      },
    },

    /* MenuItem — themed hover and selected states */
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected':       { backgroundColor: 'oklch(0.84 0.056 119)' },
          '&.Mui-selected:hover': { backgroundColor: 'oklch(0.79 0.058 119)' },
          '&:hover':              { backgroundColor: 'oklch(0.93 0.038 106)' },
        },
      },
    },

    /* Select dropdown icon */
    MuiSelect: {
      styleOverrides: {
        icon: { color: 'oklch(0.38 0.045 55)' },
      },
    },

    /* Divider */
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'oklch(0.82 0.056 116)' },
      },
    },

    /* Tooltip — dark brown bg for contrast on light surfaces */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'oklch(0.22 0.045 55)',
          borderRadius:    '3px',
          fontSize:        '0.75rem',
          color:           'oklch(0.98 0.018 96)',
        },
      },
    },

    /* Avatar — caramel bg */
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: 'oklch(0.73 0.100 63)',
          color:           'oklch(0.22 0.045 55)',
        },
      },
    },

    /* Stepper — used on Orders page */
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: 'oklch(0.82 0.056 116)',
          '&.Mui-active':    { color: 'oklch(0.73 0.100 63)' },
          '&.Mui-completed': { color: 'oklch(0.73 0.100 63)' },
        },
        text: {
          fill:     'oklch(0.22 0.045 55)',
          fontSize: '0.7rem',
        },
      },
    },

    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize:   '0.75rem',
        },
      },
    },

    /* DataGrid — sage-tinted headers, IBM Plex Sans column titles */
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border:          'none',
          backgroundColor: 'transparent',

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'oklch(0.93 0.038 106)',
            borderBottom:    '1px solid oklch(0.82 0.056 116)',
          },

          '& .MuiDataGrid-columnHeaderTitle': {
            fontFamily:    "'IBM Plex Sans', system-ui, sans-serif",
            fontWeight:    600,
            fontSize:      '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color:         'oklch(0.38 0.045 55)',
          },

          '& .MuiDataGrid-cell': {
            borderColor: 'oklch(0.90 0.040 110)',
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'oklch(0.93 0.038 106)',
          },

          '& .MuiDataGrid-footerContainer': {
            borderTop:       '1px solid oklch(0.82 0.056 116)',
            backgroundColor: 'oklch(0.93 0.038 106)',
          },

          '& .MuiDataGrid-overlay': {
            backgroundColor: 'oklch(0.93 0.038 106)',
          },
        },
      },
    },

    /* TableCell — used on some admin pages */
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily:    "'IBM Plex Sans', system-ui, sans-serif",
          fontWeight:    600,
          fontSize:      '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color:         'oklch(0.38 0.045 55)',
          borderColor:   'oklch(0.82 0.056 116)',
        },
        body: {
          borderColor: 'oklch(0.90 0.040 110)',
        },
      },
    },

    /* CircularProgress — default to primary caramel */
    MuiCircularProgress: {
      defaultProps: { color: 'primary' },
    },
  },
});
