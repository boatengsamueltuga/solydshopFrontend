import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import {
    Box,
    Button,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import SyncIcon       from "@mui/icons-material/Sync";
import SearchIcon     from "@mui/icons-material/Search";
import ClearIcon      from "@mui/icons-material/Clear";
import RefreshIcon    from "@mui/icons-material/Refresh";

import api          from "../api/api";
import { fmtCurrency, fmtPrice } from "../utils/format";
import toast        from "react-hot-toast";
import AdminLayout  from "../components/layouts/AdminLayout";
import SheetPanel   from "../components/common/SheetPanel";
import PageBanner   from "../components/common/PageBanner";
import BackButton   from "../components/BackButton";

import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";

/* ── Constants ── */
const ALL_STATUSES = ["ALL", "PAYMENT_PENDING", "PAYMENT_FAILED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// Statuses admin can set — payment transitions are automatic via Stripe webhook
const ADMIN_SETTABLE = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLE = {
    PAYMENT_PENDING: { color: "var(--warning)",  bg: "var(--warning-subtle)"  },
    PAYMENT_FAILED:  { color: "var(--error)",    bg: "var(--error-subtle)"    },
    PAID:            { color: "var(--success)",  bg: "var(--success-subtle)"  },
    PROCESSING:      { color: "var(--info)",     bg: "var(--info-subtle)"     },
    SHIPPED:         { color: "var(--accent)",   bg: "var(--accent-subtle)"   },
    DELIVERED:       { color: "var(--success)",  bg: "var(--success-subtle)"  },
    CANCELLED:       { color: "var(--error)",    bg: "var(--error-subtle)"    },
};

/* ── StatusBadge ── */
const StatusBadge = memo(({ status }) => {
    const s = STATUS_STYLE[status] ?? { color: "var(--text-3)", bg: "var(--surface-mid)" };
    return (
        <span style={{
            display:       "inline-block",
            padding:       "2px 8px",
            borderRadius:  "var(--r-sm)",
            background:    s.bg,
            color:         s.color,
            fontSize:      "11px",
            fontWeight:    600,
            fontFamily:    "var(--font-mono)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
        }}>
            {status}
        </span>
    );
});

/* ── AdminOrdersPage ── */
const AdminOrdersPage = () => {

    const [orders,        setOrders]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isSheetOpen,   setIsSheetOpen]   = useState(false);
    const [newStatus,     setNewStatus]     = useState("");
    const [activeTab,     setActiveTab]     = useState("ALL");
    const [search,        setSearch]        = useState("");

    const [isMobile,  setIsMobile]  = useState(window.innerWidth < 600);
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const h = () => {
            setIsMobile(window.innerWidth < 600);
            setIsCompact(window.innerWidth < 1100);
        };
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get("/order/admin");
            const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, []);

    /*
    |----------------------------------------------------------
    | Filtered rows + tab counts
    |----------------------------------------------------------
    */

    const tabCounts = useMemo(() => {
        const counts = { ALL: orders.length };
        ALL_STATUSES.slice(1).forEach(s => {
            counts[s] = orders.filter(o => o.status === s).length;
        });
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        let result = activeTab === "ALL" ? orders : orders.filter(o => o.status === activeTab);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(o =>
                String(o.orderId).includes(q) ||
                o.customerName?.toLowerCase().includes(q) ||
                o.customerEmail?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [orders, activeTab, search]);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleViewOrder = useCallback((order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsSheetOpen(true);
    }, []);

    const handleUpdateStatus = async () => {
        try {
            // Fix 5: PAID orders being cancelled must go through the refund endpoint
            if (newStatus === "CANCELLED" && selectedOrder.status === "PAID") {
                await api.post(`/payment/admin/refund-and-cancel/${selectedOrder.orderId}`);
                toast.success("Order refunded and cancelled.");
            } else {
                await api.put(`/order/${selectedOrder.orderId}/status?status=${newStatus}`);
                toast.success("Order status updated successfully.");
            }
            fetchOrders();
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        } catch {
            toast.error("Failed to update order status.");
        }
    };

    /*
    |----------------------------------------------------------
    | DataGrid columns
    |----------------------------------------------------------
    */

    const columns = useMemo(() => [
        {
            field: "orderId",
            headerName: "Order",
            width: 90,
            renderCell: (params) => (
                <span style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                    #{params.row.orderId}
                </span>
            ),
        },
        {
            field: "customerName",
            headerName: "Customer",
            minWidth: isMobile ? 120 : 160,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)", fontSize: "13px", maxWidth: "100%", display: "block" }}>
                    {params.row.customerName}
                </span>
            ),
        },
        ...(!isCompact ? [{
            field: "customerEmail",
            headerName: "Email",
            minWidth: 180,
            flex: 1.2,
            renderCell: (params) => (
                <span style={{ color: "var(--text-2)", fontSize: "13px" }}>{params.row.customerEmail}</span>
            ),
        }] : []),
        {
            field: "totalAmount",
            headerName: "Total",
            width: isMobile ? 90 : 120,
            renderCell: (params) => (
                <span style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
                    {fmtCurrency(params.row.totalAmount)}
                </span>
            ),
        },
        ...(!isMobile ? [{
            field: "status",
            headerName: "Status",
            width: 140,
            renderCell: (params) => <StatusBadge status={params.row.status} />,
        }] : []),
        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 80 : 110,
            renderCell: (params) => (
                <Tooltip title="View order" arrow>
                    <IconButton
                        size="small"
                        onClick={() => handleViewOrder(params.row)}
                        sx={{ color: "var(--accent)", "&:hover": { background: "var(--accent-subtle)" } }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ], [isMobile, isCompact, handleViewOrder]);

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (
        <AdminLayout title="Admin Panel">

            <BackButton style={{ marginBottom: "var(--space-4)" }} />

            {/* ── Page banner ── */}
            <div style={{ marginTop: "-24px", marginLeft: "-24px", marginRight: "-24px", marginBottom: "var(--space-5)" }}>
                <PageBanner
                    title="Orders"
                    subtitle="View and update customer orders"
                    icon={<ListAltOutlinedIcon sx={{ fontSize: 20 }} />}
                />
            </div>

            {/* ── Status tabs ── */}
            <div style={{
                display:      "flex",
                gap:          "4px",
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding:      "4px",
                marginBottom: "var(--space-4)",
                overflowX:    "auto",
                flexWrap:     "nowrap",
            }}>
                {ALL_STATUSES.map(tab => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding:       "6px 12px",
                                borderRadius:  "var(--r-sm)",
                                border:        "none",
                                background:    isActive ? "var(--surface-high)" : "transparent",
                                color:         isActive ? "var(--text)" : "var(--text-3)",
                                fontFamily:    "var(--font-body)",
                                fontSize:      "12px",
                                fontWeight:    isActive ? 600 : 400,
                                cursor:        "pointer",
                                whiteSpace:    "nowrap",
                                borderBottom:  isActive ? "2px solid var(--accent)" : "2px solid transparent",
                                transition:    "all var(--duration-fast)",
                                display:       "flex",
                                alignItems:    "center",
                                gap:           "6px",
                                flexShrink:    0,
                            }}
                        >
                            {tab}
                            <span style={{
                                fontSize:      "10px",
                                padding:       "1px 5px",
                                borderRadius:  "var(--r-pill)",
                                background:    isActive ? "var(--accent-subtle)" : "var(--surface-hover)",
                                color:         isActive ? "var(--accent)" : "var(--text-4)",
                                fontFamily:    "var(--font-mono)",
                                fontWeight:    700,
                            }}>
                                {tabCounts[tab] ?? 0}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Search ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                <TextField
                    size="small"
                    placeholder="Search by order ID, customer name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "var(--text-3)", fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 280, flex: 1, maxWidth: 480 }}
                />
                {search && (
                    <Tooltip title="Clear search" arrow>
                        <IconButton
                            size="small"
                            onClick={() => setSearch("")}
                            sx={{ color: "var(--text-3)", "&:hover": { color: "var(--error)", background: "var(--error-subtle)" } }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Refresh" arrow>
                    <IconButton
                        onClick={() => { setLoading(true); fetchOrders(); }}
                        sx={{ color: "var(--text-3)", "&:hover": { color: "var(--accent)", background: "var(--accent-subtle)" } }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* ── DataGrid ── */}
            <div style={{
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                overflow:     "hidden",
            }}>
                <DataGrid
                    rows={filteredOrders}
                    columns={columns}
                    getRowId={(row) => row.orderId}
                    rowHeight={56}
                    disableRowSelectionOnClick
                    loading={loading}
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    style={{ height: isMobile ? 450 : 600, width: "100%", border: "none" }}
                />
            </div>

            {/* ── Order Detail SheetPanel ── */}
            <SheetPanel
                open={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={`Order #${selectedOrder?.orderId}`}
                subtitle={selectedOrder ? `${selectedOrder.customerName} · ${selectedOrder.customerEmail}` : ""}
                footer={
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            onClick={() => setIsSheetOpen(false)}
                            variant="outlined"
                            sx={{ textTransform: "none", minWidth: 88 }}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            variant="contained"
                            color="success"
                            startIcon={<SyncIcon />}
                            sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}
                        >
                            Update Status
                        </Button>
                    </Stack>
                }
            >
                {selectedOrder && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                        {/* Customer info card */}
                        <Box sx={{
                            background:   "var(--surface-high)",
                            border:       "1px solid var(--border)",
                            borderTop:    "3px solid var(--accent)",
                            borderRadius: "var(--r-md)",
                            p:            2,
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Customer</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--text)", mt: 0.25 }}>
                                        {selectedOrder.customerName}
                                    </Typography>
                                </Box>
                                <StatusBadge status={selectedOrder.status} />
                            </Box>

                            <Divider sx={{ mb: 1.5 }} />

                            <Stack spacing={0.75}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--text)", minWidth: 70 }}>Email</Typography>
                                    <Typography variant="body2" sx={{ color: "var(--accent)" }}>{selectedOrder.customerEmail}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--text)", minWidth: 70 }}>Shipping</Typography>
                                    <Typography variant="body2" sx={{ color: "var(--text-2)", fontStyle: selectedOrder.shippingAddress ? "normal" : "italic" }}>
                                        {selectedOrder.shippingAddress || "Address not provided"}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--text)" }}>Order Total</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--success)", fontFamily: "var(--font-mono)" }}>
                                    {fmtPrice(selectedOrder.totalAmount)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Status update */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Update Status</InputLabel>
                            <Select
                                label="Update Status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                            >
                                {ADMIN_SETTABLE.map(s => (
                                    <MenuItem key={s} value={s}>
                                        <StatusBadge status={s} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider />

                        {/* Order items */}
                        <Box>
                            <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, display: "block", mb: 1.5 }}>
                                Items ({selectedOrder.items?.length})
                            </Typography>

                            <Stack spacing={0} sx={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                                {selectedOrder.items?.map((item, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            display:        "flex",
                                            justifyContent: "space-between",
                                            alignItems:     { xs: "flex-start", sm: "center" },
                                            flexDirection:  { xs: "column", sm: "row" },
                                            gap:            1,
                                            px:             2,
                                            py:             1.5,
                                            background:     i % 2 === 0 ? "var(--surface-high)" : "var(--surface-mid)",
                                            borderTop:      i > 0 ? "1px solid var(--border-subtle)" : "none",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--text)" }}>{item.productName}</Typography>
                                            <Typography variant="caption" sx={{ color: "var(--text-3)" }}>
                                                Qty: <strong style={{ color: "var(--accent)" }}>{item.quantity}</strong>
                                                {" · "}Unit: <strong style={{ color: "var(--success)" }}>{fmtPrice(item.price)}</strong>
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--success)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                                            {fmtPrice(item.price * item.quantity)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>

                    </Box>
                )}
            </SheetPanel>

        </AdminLayout>
    );
};

export default AdminOrdersPage;
