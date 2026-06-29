import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';

/* ── Empty / no-results overlay ─────────────────────────────── */

const EmptyOverlay = ({ message = 'No records found' }) => (
  <Box
    sx={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100%',
      minHeight:      120,
    }}
  >
    <Typography
      sx={{
        fontFamily: 'var(--font-body)',
        fontSize:   '0.875rem',
        color:      'var(--text-3)',
      }}
    >
      {message}
    </Typography>
  </Box>
);

/* ── DataTable ───────────────────────────────────────────────── */

const DEFAULT_PAGE_SIZES = [5, 10, 25];

/**
 * DataTable — branded MUI DataGrid wrapper used across all admin and seller pages.
 *
 * Props:
 *   rows            — array (required)
 *   columns         — array (required)
 *   getRowId        — function (optional) — e.g. (row) => row.productId; defaults to row.id
 *   loading         — boolean (optional)
 *   pageSize        — number (optional, default 10)
 *   pageSizeOptions — number[] (optional, default [5, 10, 25])
 *   emptyMessage    — string (optional) — shown when rows is empty
 *   toolbar         — React node (optional) — rendered in a bar above the grid (search, filters)
 *   ...rest         — forwarded to DataGrid (onRowClick, sortModel, columnVisibilityModel, etc.)
 */
const DataTable = ({
  rows,
  columns,
  getRowId,
  loading = false,
  pageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  emptyMessage = 'No records found',
  toolbar,
  sx: sxProp,
  paginationModel,
  onPaginationModelChange,
  ...rest
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--surface)',
        border:          '1px solid var(--border)',
        borderRadius:    'var(--r-md)',
        overflowX:       'auto',
        overflowY:       'hidden',
      }}
    >
      {/* Optional toolbar: search box, filter chips, etc. */}
      {toolbar && (
        <Box
          sx={{
            padding:         'var(--space-3) var(--space-4)',
            borderBottom:    '1px solid var(--border)',
            backgroundColor: 'var(--surface-mid)',
          }}
        >
          {toolbar}
        </Box>
      )}

      <DataGrid
        {...rest}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        loading={loading}
        autoHeight
        rowHeight={56}
        disableRowSelectionOnClick
        pageSizeOptions={pageSizeOptions}
        {...(paginationModel
          ? { paginationModel, onPaginationModelChange }
          : { initialState: { pagination: { paginationModel: { pageSize } }, ...rest.initialState } }
        )}
        slots={{
          noRowsOverlay:    EmptyOverlay,
          noResultsOverlay: EmptyOverlay,
          ...rest.slots,
        }}
        slotProps={{
          noRowsOverlay:    { message: emptyMessage },
          noResultsOverlay: { message: emptyMessage },
          ...rest.slotProps,
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-virtualScroller': { minHeight: 120 },
          '& .MuiDataGrid-row:hover': { backgroundColor: 'var(--surface-hover)' },
          '& .MuiDataGrid-row.Mui-hovered': { backgroundColor: 'var(--surface-hover)' },
          ...sxProp,
        }}
      />
    </Box>
  );
};

export default DataTable;
