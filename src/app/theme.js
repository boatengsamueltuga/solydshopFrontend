import { createTheme } from '@mui/material/styles';

/* ═══════════════════════════════════════════════════════════════════════════
   SolydShop MUI Theme
   Palette uses sRGB hex (MUI's colorManipulator cannot parse oklch at
   JS-evaluation time). styleOverrides use oklch directly since those values
   go straight to CSS without JS color processing.

   Hex values are accurate conversions of the matching tokens.css oklch values.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Color map (oklch → sRGB hex) ─────────────────────────────────────────
   --bg              oklch(0.10 0.012 58)  →  #191510
   --surface         oklch(0.15 0.014 58)  →  #24190f
   --surface-mid     oklch(0.20 0.016 58)  →  #302114
   --surface-high    oklch(0.26 0.018 58)  →  #402d1b
   --surface-hover   oklch(0.30 0.018 58)  →  #4a3520
   --border-subtle   oklch(0.24 0.016 58)  →  #3a2818
   --border          oklch(0.32 0.018 58)  →  #543d27
   --text            oklch(0.94 0.008 58)  →  #ede9e4
   --text-2          oklch(0.72 0.012 58)  →  #b5b0a8
   --text-3          oklch(0.52 0.010 58)  →  #837d76
   --accent          oklch(0.67 0.115 55)  →  #c87940
   --accent-hi       oklch(0.74 0.130 55)  →  #d8904a
   --accent-lo       oklch(0.54 0.095 55)  →  #a05e2c
   --success         oklch(0.63 0.10  160) →  #2a9e7a
   --success-subtle  oklch(0.18 0.04  160) →  #0c2820
   --warning         oklch(0.72 0.10  78)  →  #c7a020
   --warning-subtle  oklch(0.18 0.04  78)  →  #27220b
   --error           oklch(0.54 0.14  28)  →  #bf3628
   --error-subtle    oklch(0.18 0.05  28)  →  #2c0e0c
   --info            oklch(0.62 0.09  230) →  #3a7fbc
   --info-subtle     oklch(0.18 0.04  230) →  #0d1e2e
   ────────────────────────────────────────────────────────────────────────── */

export const solydTheme = createTheme({

  /* ── Palette ─────────────────────────────────────────────────────────── */
  palette: {
    mode: 'dark',

    background: {
      default: '#191510',   /* --bg      */
      paper:   '#24190f',   /* --surface */
    },

    primary: {
      main:         '#c87940',   /* --accent    */
      dark:         '#a05e2c',   /* --accent-lo */
      light:        '#d8904a',   /* --accent-hi */
      contrastText: '#191510',   /* --bg        */
    },

    secondary: {
      main:         '#402d1b',   /* --surface-high  */
      dark:         '#302114',   /* --surface-mid   */
      light:        '#4a3520',   /* --surface-hover */
      contrastText: '#ede9e4',   /* --text          */
    },

    success: {
      main:         '#2a9e7a',   /* --success        */
      dark:         '#207a5e',
      light:        '#3bbf94',
      contrastText: '#ede9e4',
    },

    warning: {
      main:         '#c7a020',   /* --warning        */
      dark:         '#9c7c18',
      light:        '#d8b53a',
      contrastText: '#191510',
    },

    error: {
      main:         '#bf3628',   /* --error          */
      dark:         '#8f2820',
      light:        '#d45444',
      contrastText: '#ede9e4',
    },

    info: {
      main:         '#3a7fbc',   /* --info           */
      dark:         '#2c628f',
      light:        '#5799d0',
      contrastText: '#ede9e4',
    },

    text: {
      primary:   '#ede9e4',   /* --text   */
      secondary: '#b5b0a8',   /* --text-2 */
      disabled:  '#837d76',   /* --text-3 */
    },

    divider: '#543d27',         /* --border */

    action: {
      active:             '#ede9e4',
      hover:              '#302114',   /* --surface-mid  */
      hoverOpacity:       0.08,
      selected:           '#402d1b',   /* --surface-high */
      selectedOpacity:    0.12,
      disabled:           '#837d76',   /* --text-3       */
      disabledBackground: '#302114',
      focus:              '#302114',
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

    /* Paper — suppress MUI's default gradient overlay in dark mode */
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },

    /* Card — surface-high, 1px border, 4px radius */
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'oklch(0.26 0.018 58)',
          border:          '1px solid oklch(0.32 0.018 58)',
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

    /* OutlinedInput — dark card bg, copper focus border */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'oklch(0.26 0.018 58)',
          borderRadius:    '3px',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'oklch(0.67 0.115 55)',
            borderWidth: '1px',
          },
        },
        notchedOutline: { borderColor: 'oklch(0.32 0.018 58)' },
      },
    },

    /* InputLabel — copper on focus */
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: 'oklch(0.67 0.115 55)' },
        },
      },
    },

    /* Dialog — dark panel, 1px border */
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'oklch(0.15 0.014 58)',
          border:          '1px solid oklch(0.32 0.018 58)',
          borderRadius:    '4px',
        },
      },
    },

    /* MenuItem — themed hover and selected states */
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected':       { backgroundColor: 'oklch(0.26 0.018 58)' },
          '&.Mui-selected:hover': { backgroundColor: 'oklch(0.30 0.018 58)' },
          '&:hover':              { backgroundColor: 'oklch(0.20 0.016 58)' },
        },
      },
    },

    /* Select dropdown icon */
    MuiSelect: {
      styleOverrides: {
        icon: { color: 'oklch(0.72 0.012 58)' },
      },
    },

    /* Divider */
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'oklch(0.32 0.018 58)' },
      },
    },

    /* Tooltip — dark surface panel */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'oklch(0.26 0.018 58)',
          border:          '1px solid oklch(0.32 0.018 58)',
          borderRadius:    '3px',
          fontSize:        '0.75rem',
          color:           'oklch(0.94 0.008 58)',
        },
      },
    },

    /* Avatar — surface-high bg */
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: 'oklch(0.26 0.018 58)',
          color:           'oklch(0.72 0.012 58)',
        },
      },
    },

    /* Stepper — used on Orders page */
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: 'oklch(0.32 0.018 58)',
          '&.Mui-active':    { color: 'oklch(0.67 0.115 55)' },
          '&.Mui-completed': { color: 'oklch(0.67 0.115 55)' },
        },
        text: {
          fill:     'oklch(0.94 0.008 58)',
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

    /* DataGrid — dark headers, IBM Plex Sans column titles */
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border:          'none',
          backgroundColor: 'transparent',

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'oklch(0.15 0.014 58)',
            borderBottom:    '1px solid oklch(0.32 0.018 58)',
          },

          '& .MuiDataGrid-columnHeaderTitle': {
            fontFamily:    "'IBM Plex Sans', system-ui, sans-serif",
            fontWeight:    600,
            fontSize:      '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color:         'oklch(0.72 0.012 58)',
          },

          '& .MuiDataGrid-cell': {
            borderColor: 'oklch(0.24 0.016 58)',
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'oklch(0.20 0.016 58)',
          },

          '& .MuiDataGrid-footerContainer': {
            borderTop:       '1px solid oklch(0.32 0.018 58)',
            backgroundColor: 'oklch(0.15 0.014 58)',
          },

          '& .MuiDataGrid-overlay': {
            backgroundColor: 'oklch(0.15 0.014 58)',
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
          color:         'oklch(0.72 0.012 58)',
          borderColor:   'oklch(0.32 0.018 58)',
        },
        body: {
          borderColor: 'oklch(0.24 0.016 58)',
        },
      },
    },

    /* CircularProgress — default to primary copper */
    MuiCircularProgress: {
      defaultProps: { color: 'primary' },
    },
  },
});
