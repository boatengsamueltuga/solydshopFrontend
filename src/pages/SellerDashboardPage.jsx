import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../api/api";
import toast from "react-hot-toast";

import SellerLayout from "../components/layouts/SellerLayout";
import DataTable from "../components/common/DataTable";

import Chip            from "@mui/material/Chip";
import Tooltip         from "@mui/material/Tooltip";
import IconButton      from "@mui/material/IconButton";
import TextField       from "@mui/material/TextField";
import InputAdornment  from "@mui/material/InputAdornment";
import EditOutlinedIcon    from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon   from "@mui/icons-material/DeleteOutlined";
import SearchIcon          from "@mui/icons-material/Search";
import ClearIcon           from "@mui/icons-material/Clear";
import RefreshIcon         from "@mui/icons-material/Refresh";
import WarningAmberIcon    from "@mui/icons-material/WarningAmber";

import { HiCube } from "react-icons/hi";

/* ── Status badge styles (shared with admin) ── */
const STATUS_STYLE = {
    PENDING_REVIEW: { label: "Pending Review", color: "#d97706", bg: "rgba(217,119,6,0.12)",   border: "rgba(217,119,6,0.35)"   },
    ACTIVE:         { label: "Active",          color: "#059669", bg: "rgba(5,150,105,0.12)",   border: "rgba(5,150,105,0.35)"   },
    REJECTED:       { label: "Rejected",        color: "#dc2626", bg: "rgba(220,38,38,0.12)",   border: "rgba(220,38,38,0.35)"   },
    SUSPENDED:      { label: "Suspended",       color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)"  },
    ARCHIVED:       { label: "Archived",        color: "#71717a", bg: "rgba(113,113,122,0.1)",  border: "rgba(113,113,122,0.3)"  },
};

const STATUS_TOOLTIP = {
    PENDING_REVIEW: "Awaiting admin review — not yet visible to buyers",
    ACTIVE:         "Live and visible to buyers",
    SUSPENDED:      "Suspended by an admin — not visible to buyers",
    ARCHIVED:       "Archived — no longer available",
};

const StatusBadge = memo(({ status, tooltip }) => {
    const s = STATUS_STYLE[status] || { label: status, color: "#71717a" };
    const tip = tooltip ?? STATUS_TOOLTIP[status] ?? null;
    const badge = (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            width: "fit-content", cursor: tip ? "help" : "default",
        }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: s.color, fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                {s.label}
            </span>
        </span>
    );
    if (tip) {
        return (
            <Tooltip title={tip} arrow placement="top" enterDelay={150}>
                {badge}
            </Tooltip>
        );
    }
    return badge;
});

const getXsrfToken = () =>
    document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

/* ── StatCard ── */
const StatCard = memo(({ label, value, sub, loading }) => (
    <div style={{
        background:   "var(--surface-mid)",
        border:       "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding:      "var(--space-5)",
    }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 var(--space-2)" }}>
            {label}
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2rem", color: "var(--text)", lineHeight: 1, margin: 0 }}>
            {loading ? "—" : value}
        </p>
        {sub && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-4)", marginTop: "var(--space-1)" }}>
                {sub}
            </p>
        )}
    </div>
));

const SellerDashboardPage = () => {

    const navigate  = useNavigate();
    const location  = useLocation();
    const [highlightProductId, setHighlightProductId] = useState(location.state?.highlightProductId ?? null);
    const [products,  setProducts]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [deleting,  setDeleting]  = useState(false);
    const [search,    setSearch]    = useState("");

    const fetchProducts = useCallback(async () => {
        try {
            const res = await api.get("/seller/products?pageSize=1000");
            setProducts(res.data.content ?? []);
        } catch {
            // non-critical
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = useCallback(async (product) => {
        if (!window.confirm(`Delete "${product.productName}"?`)) return;
        setDeleting(true);
        try {
            await api.delete(`/seller/products/${product.productId}`, {
                headers: { "X-XSRF-TOKEN": getXsrfToken() },
            });
            toast.success("Product deleted");
            await fetchProducts();
        } catch {
            toast.error("Failed to delete product");
        } finally {
            setDeleting(false);
        }
    }, [fetchProducts]);

    /* ── Search filter ── */
    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(p =>
            p.productName?.toLowerCase().includes(q)  ||
            p.categoryName?.toLowerCase().includes(q) ||
            p.modelNumber?.toLowerCase().includes(q)  ||
            p.partNumber?.toLowerCase().includes(q)
        );
    }, [products, search]);

    /* ── Computed stats ── */
    const inStockCount    = products.filter(p => p.quantity > 0).length;
    const pendingCount    = products.filter(p => p.status === "PENDING_REVIEW").length;
    const rejectedCount   = products.filter(p => p.status === "REJECTED").length;
    const activeCount     = products.filter(p => p.status === "ACTIVE").length;
    const catalogValue    = products.filter(p => p.status === "ACTIVE")
                                    .reduce((sum, p) => sum + (p.price * p.quantity), 0);

    const formatCompact = (n) => {
        if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
        return `$${n.toLocaleString("en-US")}`;
    };

    /* ── DataTable columns ── */
    const columns = useMemo(() => [
        {
            field:    "imageUrl",
            headerName: "",
            width:    56,
            sortable: false,
            renderCell: ({ value, row }) => (
                <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "var(--r-sm)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    {value
                        ? <img src={value} alt={row.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        : <HiCube style={{ color: "var(--text-4)", fontSize: "18px" }} />
                    }
                </div>
            ),
        },
        {
            field:    "productName",
            headerName: "Product",
            flex:     1,
            minWidth: 180,
            renderCell: ({ row }) => (
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.productName}
                    </p>
                    {row.partNumber && (
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", margin: "2px 0 0" }}>
                            {row.partNumber}
                        </p>
                    )}
                </div>
            ),
        },
        {
            field:    "categoryName",
            headerName: "Category",
            width:    130,
            renderCell: ({ value }) => (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-2)" }}>
                    {value || "—"}
                </span>
            ),
        },
        {
            field:    "modelNumber",
            headerName: "Model",
            width:    120,
            renderCell: ({ value }) => value
                ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-2)" }}>{value}</span>
                : <span style={{ color: "var(--text-4)", fontSize: "12px" }}>—</span>,
        },
        {
            field:    "status",
            headerName: "Status",
            width:    155,
            renderCell: ({ row }) => (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: "4px", padding: "6px 0", minWidth: 0 }}>
                    <StatusBadge
                        status={row.status}
                        tooltip={row.status === "REJECTED" && row.rejectionReason
                            ? `Rejected: ${row.rejectionReason}`
                            : undefined}
                    />
                    {row.status === "REJECTED" && row.rejectionReason && (
                        <span style={{
                            fontSize: "11px", color: "#dc2626",
                            fontFamily: "var(--font-body)", lineHeight: 1.35,
                            overflow: "hidden", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            wordBreak: "break-word", maxWidth: "130px",
                        }}>
                            {row.rejectionReason}
                        </span>
                    )}
                </div>
            ),
        },
        {
            field:    "price",
            headerName: "Price",
            width:    110,
            renderCell: ({ value }) => (
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>
                    ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            field:    "quantity",
            headerName: "Stock",
            width:    130,
            renderCell: ({ value }) => {
                if (value === 0)  return <Chip label="Out of Stock"    color="error"   size="small" variant="outlined" sx={{ fontFamily: "var(--font-mono)", fontSize: "10px", height: "20px" }} />;
                if (value <= 5)   return <Chip label={`Low · ${value}`} color="warning" size="small" variant="outlined" sx={{ fontFamily: "var(--font-mono)", fontSize: "10px", height: "20px" }} />;
                return                   <Chip label={`In Stock · ${value}`} color="success" size="small" variant="outlined" sx={{ fontFamily: "var(--font-mono)", fontSize: "10px", height: "20px" }} />;
            },
        },
        {
            field:    "actions",
            headerName: "Actions",
            width:    90,
            sortable: false,
            renderCell: ({ row }) => {
                const locked = row.status === "SUSPENDED" || row.status === "ARCHIVED";
                const editTitle = locked
                    ? `This product is ${row.status.toLowerCase()} and cannot be edited`
                    : row.status === "REJECTED"
                    ? "Edit and resubmit for review"
                    : "Edit";
                return (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <Tooltip title={editTitle} arrow>
                            <span>
                                <IconButton
                                    size="small"
                                    disabled={locked}
                                    onClick={() => navigate(`/seller/products/${row.productId}/edit`, { state: { product: row } })}
                                    sx={{ color: locked ? "var(--text-4)" : "var(--accent)", borderRadius: "var(--r-sm)", "&:hover": { background: "var(--accent-subtle)" } }}
                                >
                                    <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(row)}
                                disabled={deleting}
                                sx={{ color: "var(--error)", borderRadius: "var(--r-sm)", "&:hover": { background: "var(--error-subtle)" } }}
                            >
                                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                );
            },
        },
    ], [navigate, handleDelete, deleting]);

    return (
        <SellerLayout title="Seller Dashboard">

            {/* ── Rejected products alert banner ── */}
            {!loading && rejectedCount > 0 && (
                <div style={{
                    display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--error-subtle)", border: "1px solid var(--error)",
                    borderRadius: "var(--r-md)", marginBottom: "var(--space-5)",
                }}>
                    <WarningAmberIcon sx={{ color: "var(--error)", fontSize: 18, flexShrink: 0, mt: "1px" }} />
                    <div>
                        <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "13px", color: "var(--error)", margin: 0 }}>
                            {rejectedCount} product{rejectedCount > 1 ? "s" : ""} rejected
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-2)", margin: "2px 0 0" }}>
                            Hover the Rejected badge to see the reason. Edit the product to fix the issue and resubmit for review.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Stats row ── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "var(--space-4)",
                marginBottom: "var(--space-8)",
            }}>
                <StatCard label="Total Products" value={products.length} loading={loading} />
                <StatCard label="Active"          value={activeCount}    loading={loading} />
                <StatCard
                    label="Pending Review"
                    value={pendingCount}
                    sub={pendingCount > 0 ? "awaiting admin approval" : "none pending"}
                    loading={loading}
                />
                <StatCard
                    label="In Stock"
                    value={inStockCount}
                    sub={`${products.length - inStockCount} out of stock`}
                    loading={loading}
                />
                <StatCard
                    label="Active Value"
                    value={formatCompact(catalogValue)}
                    sub="active products · price × qty"
                    loading={loading}
                />
            </div>

            {/* ── Section header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                        My Products
                    </h2>
                    {!loading && (
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                            {products.length} {products.length === 1 ? "product" : "products"} listed
                        </p>
                    )}
                </div>
                <button
                    onClick={() => navigate("/seller/products/new")}
                    style={{
                        display: "flex", alignItems: "center", gap: "var(--space-2)",
                        padding: "var(--space-2) var(--space-4)",
                        background: "var(--accent)", border: "none", borderRadius: "var(--r-md)",
                        color: "var(--text)", fontFamily: "var(--font-body)", fontSize: "13px",
                        fontWeight: 700, cursor: "pointer",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    + Add Product
                </button>
            </div>

            {/* ── Search ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                <TextField
                    size="small"
                    placeholder="Search by name, category, model or part number…"
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
                        onClick={() => { setLoading(true); fetchProducts(); }}
                        sx={{ color: "var(--text-3)", "&:hover": { color: "var(--accent)", background: "var(--accent-subtle)" } }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* ── DataTable ── */}
            <DataTable
                rows={filteredProducts}
                columns={columns}
                getRowId={row => row.productId}
                loading={loading}
                pageSize={10}
                getRowHeight={({ model }) =>
                    model.status === "REJECTED" && model.rejectionReason ? 76 : 56
                }
                getRowClassName={(params) =>
                    params.id === highlightProductId ? "highlighted-row" : ""
                }
                sx={{
                    "& .highlighted-row": {
                        background: "rgba(220,38,38,0.1) !important",
                        outline: "2px solid rgba(220,38,38,0.35)",
                        outlineOffset: "-2px",
                    },
                }}
                emptyMessage="No products listed yet. Click 'Add Product' to get started."
            />

        </SellerLayout>
    );
};

export default SellerDashboardPage;
