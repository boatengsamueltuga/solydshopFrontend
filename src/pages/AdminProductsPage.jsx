import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { DataGrid, useGridApiRef } from "@mui/x-data-grid";

import {
    Box,
    Button,
    Chip,
    Dialog as MuiDialog,
    DialogTitle as MuiDialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Divider,
    IconButton,
    InputAdornment,
    InputLabel,
    FormControl,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import VisibilityIcon            from "@mui/icons-material/Visibility";
import EditIcon                  from "@mui/icons-material/Edit";
import DeleteIcon                from "@mui/icons-material/Delete";
import CloudUploadIcon           from "@mui/icons-material/CloudUpload";
import AddCircleOutlinedIcon     from "@mui/icons-material/AddCircleOutlined";
import SearchIcon                from "@mui/icons-material/Search";
import ClearIcon                 from "@mui/icons-material/Clear";
import RefreshIcon               from "@mui/icons-material/Refresh";
import InventoryOutlinedIcon     from "@mui/icons-material/InventoryOutlined";

import api         from "../api/api";
import { fmtCurrency, fmtPrice } from "../utils/format";
import toast       from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import SheetPanel  from "../components/common/SheetPanel";
import PageBanner  from "../components/common/PageBanner";
import BackButton  from "../components/BackButton";

/* ── Status badge styles ── */
const STATUS_STYLE = {
    PENDING_REVIEW: { label: "Pending Review", color: "#d97706", bg: "rgba(217,119,6,0.12)",   border: "rgba(217,119,6,0.35)"   },
    ACTIVE:         { label: "Active",          color: "#059669", bg: "rgba(5,150,105,0.12)",   border: "rgba(5,150,105,0.35)"   },
    REJECTED:       { label: "Rejected",        color: "#dc2626", bg: "rgba(220,38,38,0.12)",   border: "rgba(220,38,38,0.35)"   },
    SUSPENDED:      { label: "Suspended",       color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.35)"  },
    ARCHIVED:       { label: "Archived",        color: "#71717a", bg: "rgba(113,113,122,0.1)",  border: "rgba(113,113,122,0.3)"  },
};

const StatusBadge = memo(({ status }) => {
    const s = STATUS_STYLE[status] || { label: status, color: "#71717a" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: s.color, fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                {s.label}
            </span>
        </span>
    );
});

const MonoTag = memo(({ value }) =>
    value ? (
        <span style={{
            fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)",
            background: "var(--accent-subtle)", border: "1px solid var(--accent-border)",
            borderRadius: "var(--r-sm)", padding: "1px 5px", letterSpacing: "0.03em",
        }}>{value}</span>
    ) : (
        <span style={{ color: "var(--text-4)", fontSize: "13px" }}>—</span>
    ));

/* ── All status options — admin can set any product to any status ── */
const ALL_STATUS_OPTIONS = Object.entries(STATUS_STYLE).map(([value, s]) => ({ value, ...s }));

const AdminStatusSelect = memo(({ product, onReject, onRefresh }) => {
    const [loading, setLoading] = useState(false);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        if (newStatus === product.status) return;
        if (newStatus === "REJECTED") {
            onReject(product);
            return;
        }
        setLoading(true);
        try {
            await api.post(`/admin/products/${product.productId}/force-status`, { status: newStatus });
            const label = STATUS_STYLE[newStatus]?.label || newStatus;
            toast.success(`"${product.productName}" → ${label}`);
            onRefresh();
        } catch {
            toast.error("Failed to update product status.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Select
            value={product.status}
            onChange={handleChange}
            disabled={loading}
            size="small"
            renderValue={() => <StatusBadge status={product.status} />}
            sx={{
                height: 28, width: "fit-content",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": { padding: "0 22px 0 0 !important", display: "flex", alignItems: "center" },
                "& .MuiSelect-icon": { right: 0 },
            }}
        >
            {ALL_STATUS_OPTIONS.map(opt => (
                <MenuItem
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.value === product.status}
                    sx={{ gap: 1.5, opacity: opt.value === product.status ? 0.5 : 1 }}
                >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: opt.value === product.status ? "var(--text-3)" : opt.color }}>
                        {opt.label}{opt.value === product.status ? "  ✓" : opt.value === "REJECTED" ? "…" : ""}
                    </span>
                </MenuItem>
            ))}
        </Select>
    );
});

const STATUS_OPTIONS = ["ALL", "PENDING_REVIEW", "ACTIVE", "REJECTED", "SUSPENDED", "ARCHIVED"];

/* ── AdminProductsPage ── */
const AdminProductsPage = () => {

    const [products,   setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);

    const location            = useLocation();
    const highlightProductId  = location.state?.highlightProductId ?? null;
    const [statusFilter,     setStatusFilter]     = useState(location.state?.autoFilter ?? "ALL");
    const [search,           setSearch]           = useState("");
    const [paginationModel,  setPaginationModel]  = useState({ page: 0, pageSize: 25 });
    const gridApiRef = useGridApiRef();

    const [isFormOpen,        setIsFormOpen]        = useState(false);
    const [editingProductId,  setEditingProductId]  = useState(null);
    const [isViewOpen,        setIsViewOpen]        = useState(false);
    const [selectedProduct,   setSelectedProduct]   = useState(null);
    const [viewImgIdx,        setViewImgIdx]        = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete,   setProductToDelete]   = useState(null);
    const [rejectDialogOpen,  setRejectDialogOpen]  = useState(false);
    const [productToReject,   setProductToReject]   = useState(null);
    const [rejectReason,      setRejectReason]      = useState("");
    const [actionLoading,     setActionLoading]     = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const [productForm, setProductForm] = useState({
        productName: "", description: "", modelNumber: "",
        partNumber: "", imageUrl: "", image2Url: "", image3Url: "", image4Url: "",
        price: "", quantity: "", categoryId: "",
    });

    const resetForm = () => {
        setProductForm({ productName: "", description: "", modelNumber: "", partNumber: "", imageUrl: "", image2Url: "", image3Url: "", image4Url: "", price: "", quantity: "", categoryId: "" });
        setEditingProductId(null);
    };

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/products?pageSize=1000");
            setProducts(res.data.content ?? []);
        } catch {
            toast.error("Unable to load products. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get("/public/categories?pageSize=1000");
            setCategories(res.data.content ?? []);
        } catch {
            // non-critical
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    /*
    |----------------------------------------------------------
    | Filtered rows
    |----------------------------------------------------------
    */

    const filteredProducts = useMemo(() => {
        let list = products;
        if (statusFilter !== "ALL") {
            list = list.filter(p => p.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.productName?.toLowerCase().includes(q)  ||
                p.categoryName?.toLowerCase().includes(q) ||
                p.modelNumber?.toLowerCase().includes(q)  ||
                p.partNumber?.toLowerCase().includes(q)   ||
                p.sellerName?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [products, statusFilter, search]);

    /* scroll to highlighted product once data loads */
    useEffect(() => {
        if (!highlightProductId || loading || filteredProducts.length === 0) return;
        const idx = filteredProducts.findIndex(p => p.productId === highlightProductId);
        if (idx === -1) return;

        const pageSize = paginationModel.pageSize;
        const targetPage = Math.floor(idx / pageSize);
        setPaginationModel(m => ({ ...m, page: targetPage }));

        /* DataGrid virtualizes rows — use apiRef to scroll within the grid,
           then retry DOM fallback until the row element is painted */
        let timerId;
        let attempts = 0;
        const tryScroll = () => {
            try { gridApiRef.current.scrollToIndexes({ rowIndex: idx }); } catch {}
            const el = document.querySelector(`[data-id="${highlightProductId}"]`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            } else if (++attempts < 8) {
                timerId = setTimeout(tryScroll, 200);
            }
        };
        timerId = setTimeout(tryScroll, 300);
        return () => clearTimeout(timerId);
    }, [highlightProductId, loading, filteredProducts.length]);

    /*
    |----------------------------------------------------------
    | CRUD handlers
    |----------------------------------------------------------
    */

    const handleViewProduct = useCallback((product) => {
        setSelectedProduct(product);
        setViewImgIdx(0);
        setIsViewOpen(true);
    }, []);

    const handleEditProduct = useCallback((product) => {
        setEditingProductId(product.productId);
        setProductForm({
            productName: product.productName,
            description: product.description,
            modelNumber: product.modelNumber || "",
            partNumber:  product.partNumber  || "",
            imageUrl:    product.imageUrl    || "",
            image2Url:   product.image2Url   || "",
            image3Url:   product.image3Url   || "",
            image4Url:   product.image4Url   || "",
            price:       product.price,
            quantity:    product.quantity,
            categoryId:  String(product.categoryId),
        });
        setIsFormOpen(true);
    }, []);

    const handleDeleteProduct = useCallback((product) => {
        setProductToDelete(product);
        setDeleteConfirmOpen(true);
    }, []);

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/products/${productToDelete.productId}`);
            toast.success(`"${productToDelete.productName}" deleted.`);
            fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.message || "";
            const linked = ["integrity", "foreign key", "constraint", "order"].some(k => msg.toLowerCase().includes(k));
            toast.error(linked
                ? `"${productToDelete.productName}" cannot be deleted — it is linked to existing orders.`
                : "Failed to delete product. Please try again."
            );
        } finally {
            setDeleteConfirmOpen(false);
            setProductToDelete(null);
        }
    };

    const getXsrf = () =>
        document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

    const handleImageUploadForSlot = (slot) => async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error("Image must be 10 MB or smaller."); return; }
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/upload", fd, { headers: { "X-XSRF-TOKEN": getXsrf() } });
            const key = ["imageUrl", "image2Url", "image3Url", "image4Url"][slot];
            setProductForm(prev => ({ ...prev, [key]: res.data }));
            toast.success(`Image ${slot + 1} uploaded.`);
        } catch {
            toast.error("Image upload failed.");
        }
    };

    const handleSaveProduct = async () => {
        if (!productForm.productName || !productForm.description || !productForm.price || !productForm.quantity || !productForm.categoryId) {
            toast.error("Please fill in all required fields.");
            return;
        }
        const payload = {
            productName: productForm.productName,
            description: productForm.description,
            modelNumber: productForm.modelNumber || null,
            partNumber:  productForm.partNumber  || null,
            imageUrl:    productForm.imageUrl  || null,
            image2Url:   productForm.image2Url || null,
            image3Url:   productForm.image3Url || null,
            image4Url:   productForm.image4Url || null,
            price:       Number(productForm.price),
            quantity:    Number(productForm.quantity),
            categoryId:  Number(productForm.categoryId),
        };
        try {
            if (editingProductId) {
                await api.put(`/admin/products/${editingProductId}`, payload);
                toast.success(`"${productForm.productName}" updated.`);
            } else {
                await api.post("/admin/products", payload);
                toast.success(`"${productForm.productName}" added to the catalog.`);
            }
            await fetchProducts();
            resetForm();
            setIsFormOpen(false);
        } catch {
            toast.error(editingProductId ? "Failed to update product." : "Failed to create product.");
        }
    };

    const openRejectDialog = useCallback((product) => {
        setProductToReject(product);
        setRejectReason("");
        setRejectDialogOpen(true);
    }, []);

    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a rejection reason.");
            return;
        }
        setActionLoading(true);
        try {
            await api.post(`/admin/products/${productToReject.productId}/force-status`, { status: "REJECTED", rejectionReason: rejectReason });
            toast.success(`"${productToReject.productName}" rejected. Seller has been notified.`);
            fetchProducts();
        } catch {
            toast.error("Failed to reject product.");
        } finally {
            setActionLoading(false);
            setRejectDialogOpen(false);
            setProductToReject(null);
            setRejectReason("");
        }
    };

    /*
    |----------------------------------------------------------
    | DataGrid columns
    |----------------------------------------------------------
    */

    const columns = useMemo(() => [
        {
            field: "image", headerName: "Image", width: 64, sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <Box component="img" src={params.row.imageUrl} alt={params.row.productName}
                        sx={{ width: 40, height: 40, objectFit: "cover", borderRadius: "var(--r-sm)" }} />
                </Box>
            ),
        },
        {
            field: "productName", headerName: "Product", minWidth: isMobile ? 140 : 200, flex: 1,
            renderCell: (params) => (
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {params.row.productName}
                    </p>
                    {params.row.partNumber && (
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", margin: "1px 0 0" }}>
                            {params.row.partNumber}
                        </p>
                    )}
                </div>
            ),
        },
        ...(!isMobile ? [{
            field: "sellerName", headerName: "Seller", width: 140,
            renderCell: (params) => (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: params.row.sellerName ? "var(--text-2)" : "var(--accent)" }}>
                    {params.row.sellerName || "Platform"}
                </span>
            ),
        }] : []),
        {
            field: "status", headerName: "Status", width: 150,
            renderCell: (params) => (
                <AdminStatusSelect
                    product={params.row}
                    onReject={openRejectDialog}
                    onRefresh={fetchProducts}
                />
            ),
        },
        ...(!isMobile ? [{
            field: "categoryName", headerName: "Category", width: 120,
            renderCell: (params) => (
                <span style={{ color: "var(--text-2)", fontSize: "13px" }}>{params.row.categoryName || "—"}</span>
            ),
        }] : []),
        {
            field: "price", headerName: "Price", width: 100,
            renderCell: (params) => (
                <span style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
                    {fmtCurrency(params.row.price)}
                </span>
            ),
        },
        {
            field: "quantity", headerName: "Stock", width: 80,
            renderCell: (params) => (
                <Chip
                    label={params.row.quantity > 0 ? params.row.quantity : "Out"}
                    size="small" variant="outlined"
                    sx={{
                        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.7rem",
                        color:       params.row.quantity > 0 ? "var(--success)" : "var(--error)",
                        borderColor: params.row.quantity > 0 ? "var(--success)" : "var(--error)",
                    }}
                />
            ),
        },
        {
            field: "actions", headerName: "Actions", width: 110, sortable: false,
            renderCell: (params) => {
                const p = params.row;
                return (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Tooltip title="View" arrow>
                            <IconButton size="small" onClick={() => handleViewProduct(p)}
                                sx={{ color: "var(--info)", "&:hover": { background: "var(--info-subtle)" } }}>
                                <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                            <IconButton size="small" onClick={() => handleEditProduct(p)}
                                sx={{ color: "var(--warning)", "&:hover": { background: "var(--warning-subtle)" } }}>
                                <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <IconButton size="small" onClick={() => handleDeleteProduct(p)}
                                sx={{ color: "var(--error)", "&:hover": { background: "var(--error-subtle)" } }}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [isMobile, handleViewProduct, handleEditProduct, handleDeleteProduct, openRejectDialog, fetchProducts]);

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    const pendingCount = products.filter(p => p.status === "PENDING_REVIEW").length;

    return (
        <AdminLayout title="Admin Panel">

            <div style={{ marginTop: "-24px", marginLeft: "-24px", marginRight: "-24px", marginBottom: "var(--space-4)" }}>
                <PageBanner
                    title="Products"
                    subtitle="Manage the product catalog"
                    icon={<InventoryOutlinedIcon sx={{ fontSize: 20 }} />}
                    action={
                        <Button variant="contained" color="primary" startIcon={<AddCircleOutlinedIcon />}
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                            Create Product
                        </Button>
                    }
                />
            </div>

            <BackButton style={{ marginBottom: "var(--space-4)" }} />

            {/* ── Toolbar ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                <TextField
                    size="small"
                    placeholder="Search by name, seller, model or part number…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "var(--text-3)", fontSize: 18 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 260, flex: 1, maxWidth: 400 }}
                />
                {search && (
                    <Tooltip title="Clear search" arrow>
                        <IconButton size="small" onClick={() => setSearch("")}
                            sx={{ color: "var(--text-3)", "&:hover": { color: "var(--error)", background: "var(--error-subtle)" } }}>
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {STATUS_OPTIONS.map(s => (
                            <MenuItem key={s} value={s}>
                                {s === "ALL" ? "All statuses" : STATUS_STYLE[s]?.label || s}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Tooltip title="Refresh" arrow>
                    <IconButton onClick={() => fetchProducts()}
                        sx={{ color: "var(--text-3)", "&:hover": { color: "var(--accent)", background: "var(--accent-subtle)" } }}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                {[
                    { label: "Total",          value: products.length },
                    { label: "Active",         value: products.filter(p => p.status === "ACTIVE").length },
                    { label: "Pending Review", value: pendingCount, highlight: pendingCount > 0 },
                    { label: "Suspended",      value: products.filter(p => p.status === "SUSPENDED").length },
                ].map(({ label, value, highlight }) => (
                    <div key={label} style={{
                        display: "flex", alignItems: "center", gap: "var(--space-2)",
                        padding: "var(--space-2) var(--space-3)",
                        background: highlight ? "var(--warning-subtle)" : "var(--surface-mid)",
                        border: `1px solid ${highlight ? "var(--warning)" : "var(--border)"}`,
                        borderRadius: "var(--r-sm)",
                    }}>
                        <span style={{ color: "var(--text-3)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
                        <span style={{ color: highlight ? "var(--warning)" : "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* ── DataGrid ── */}
            <div style={{ background: "var(--surface-mid)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                <DataGrid
                    apiRef={gridApiRef}
                    rows={filteredProducts}
                    columns={columns}
                    disableRowSelectionOnClick
                    getRowId={(row) => row.productId}
                    rowHeight={56}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    style={{ height: isMobile ? 450 : 620, width: "100%", border: "none" }}
                    getRowClassName={(params) =>
                        params.id === highlightProductId ? "highlighted-row" : ""
                    }
                    sx={{
                        "& .highlighted-row": {
                            background: "rgba(217,119,6,0.12) !important",
                            outline: "2px solid rgba(217,119,6,0.4)",
                            outlineOffset: "-2px",
                        },
                    }}
                />
            </div>

            {/* ── View Product SheetPanel ── */}
            <SheetPanel open={isViewOpen} onClose={() => setIsViewOpen(false)}
                title="Product Details" subtitle={selectedProduct?.productName}
                footer={
                    <Stack direction="row" justifyContent="flex-end">
                        <Button onClick={() => setIsViewOpen(false)} variant="outlined" sx={{ textTransform: "none", minWidth: 88 }}>Close</Button>
                        <Button variant="contained" color="warning" startIcon={<EditIcon />}
                            onClick={() => { setIsViewOpen(false); handleEditProduct(selectedProduct); }}
                            sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}>
                            Edit Product
                        </Button>
                    </Stack>
                }>
                {selectedProduct && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {(() => {
                            const viewSlots = [selectedProduct.imageUrl, selectedProduct.image2Url, selectedProduct.image3Url, selectedProduct.image4Url].filter(Boolean);
                            const viewImg   = viewSlots[viewImgIdx] ?? null;
                            return (
                                <>
                                    {/* Main image */}
                                    <Box sx={{ width: "100%", height: 220, background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                        {viewImg
                                            ? <Box component="img" src={viewImg} alt={selectedProduct.productName} sx={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
                                            : <CloudUploadIcon sx={{ fontSize: 40, color: "var(--text-4)", opacity: 0.3 }} />
                                        }
                                    </Box>
                                    {/* Thumbnail row */}
                                    {viewSlots.length > 1 && (
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            {viewSlots.map((url, i) => (
                                                <Box key={i} component="button" type="button" onClick={() => setViewImgIdx(i)}
                                                    sx={{
                                                        width: 56, height: 56, flexShrink: 0,
                                                        border: `2px solid ${i === viewImgIdx ? "var(--accent)" : "var(--border)"}`,
                                                        borderRadius: "var(--r-sm)", background: "#fff",
                                                        overflow: "hidden", cursor: "pointer", p: 0,
                                                    }}>
                                                    <Box component="img" src={url} alt={`Angle ${i+1}`} sx={{ width: "100%", height: "100%", objectFit: "contain", p: "3px" }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </>
                            );
                        })()}

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: "var(--success)", fontFamily: "var(--font-mono)" }}>
                                {fmtPrice(selectedProduct.price)}
                            </Typography>
                            <StatusBadge status={selectedProduct.status} />
                            {selectedProduct.categoryName && (
                                <Chip label={selectedProduct.categoryName} size="small" variant="outlined"
                                    sx={{ color: "var(--accent)", borderColor: "var(--accent-border)" }} />
                            )}
                        </Box>

                        {selectedProduct.sellerName && (
                            <Box>
                                <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Seller</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, color: "var(--text-2)" }}>
                                    {selectedProduct.sellerName} · {selectedProduct.sellerEmail}
                                </Typography>
                            </Box>
                        )}

                        {selectedProduct.status === "REJECTED" && selectedProduct.rejectionReason && (
                            <Box sx={{ p: 2, background: "var(--error-subtle)", border: "1px solid var(--error)", borderRadius: "var(--r-sm)" }}>
                                <Typography variant="caption" sx={{ color: "var(--error)", fontWeight: 700, textTransform: "uppercase" }}>Rejection Reason</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, color: "var(--text-2)" }}>{selectedProduct.rejectionReason}</Typography>
                            </Box>
                        )}

                        {(selectedProduct.modelNumber || selectedProduct.partNumber) && (
                            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                {selectedProduct.modelNumber && (
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Model</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>{selectedProduct.modelNumber}</Typography>
                                    </Box>
                                )}
                                {selectedProduct.partNumber && (
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Part No.</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>{selectedProduct.partNumber}</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Divider />
                        <Box>
                            <Typography variant="caption" sx={{ color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Description</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7, color: "var(--text-2)", wordBreak: "break-word" }}>
                                {selectedProduct.description}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </SheetPanel>

            {/* ── Create / Edit Product SheetPanel ── */}
            <SheetPanel open={isFormOpen} onClose={() => { resetForm(); setIsFormOpen(false); }}
                title={editingProductId ? "Edit Product" : "Create Platform Product"}
                subtitle={editingProductId ? `Editing product #${editingProductId}` : "Platform products go live immediately"}
                width={560}
                footer={
                    <Stack direction="row" justifyContent="flex-end">
                        <Button onClick={() => { resetForm(); setIsFormOpen(false); }} variant="outlined" sx={{ textTransform: "none", minWidth: 88 }}>Cancel</Button>
                        <Button onClick={handleSaveProduct} variant="contained"
                            color={editingProductId ? "warning" : "primary"}
                            startIcon={editingProductId ? <EditIcon /> : <AddCircleOutlinedIcon />}
                            sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}>
                            {editingProductId ? "Update Product" : "Create Product"}
                        </Button>
                    </Stack>
                }>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <TextField label="Product Name" size="small" fullWidth value={productForm.productName}
                        onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                        sx={{ gridColumn: "1 / -1" }} />
                    <TextField label="Price" size="small" type="number" fullWidth value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                    <TextField label="Quantity" size="small" type="number" fullWidth value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
                    <FormControl size="small" fullWidth sx={{ gridColumn: "1 / -1" }}>
                        <InputLabel>Category</InputLabel>
                        <Select label="Category" value={productForm.categoryId}
                            onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                            MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}>
                            <MenuItem value=""><em>Select category</em></MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={String(cat.categoryId)}>{cat.categoryName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField label="Model Number" size="small" fullWidth placeholder="e.g. CAT 320D"
                        value={productForm.modelNumber}
                        onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })} />
                    <TextField label="Part Number" size="small" fullWidth placeholder="e.g. 3066T-1234"
                        value={productForm.partNumber}
                        onChange={(e) => setProductForm({ ...productForm, partNumber: e.target.value })} />
                    {/* 4-slot image upload grid */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <Typography variant="caption" sx={{ display: "block", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", mb: 1, fontWeight: 600 }}>
                            Product Images <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(up to 4 angles)</span>
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5 }}>
                            {[0, 1, 2, 3].map(i => {
                                const key     = ["imageUrl","image2Url","image3Url","image4Url"][i];
                                const preview = productForm[key];
                                return (
                                    <Box key={i} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        {/* Preview box */}
                                        <Box sx={{
                                            width: "100%", aspectRatio: "1",
                                            border: `1px solid ${preview ? "var(--border)" : "var(--border-subtle)"}`,
                                            borderRadius: "var(--r-sm)",
                                            background: preview ? "#fff" : "var(--surface-high)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            overflow: "hidden", position: "relative",
                                        }}>
                                            {preview ? (
                                                <Box component="img" src={preview} alt={`Angle ${i+1}`}
                                                    sx={{ width: "100%", height: "100%", objectFit: "contain", p: "4px" }} />
                                            ) : (
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, opacity: 0.35 }}>
                                                    <CloudUploadIcon sx={{ fontSize: 20, color: "var(--text-3)" }} />
                                                    <Typography variant="caption" sx={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
                                                        {i === 0 ? "Main" : `Angle ${i+1}`}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {preview && (
                                                <Box component="button" type="button"
                                                    onClick={() => setProductForm(f => ({ ...f, [key]: "" }))}
                                                    sx={{
                                                        position: "absolute", top: "3px", right: "3px",
                                                        width: "18px", height: "18px", borderRadius: "50%",
                                                        background: "rgba(0,0,0,0.55)", border: "none",
                                                        color: "#fff", fontSize: "13px", lineHeight: "1",
                                                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                        p: 0,
                                                    }}
                                                >×</Box>
                                            )}
                                        </Box>
                                        {/* Upload button */}
                                        <Button component="label" variant="outlined" size="small" fullWidth
                                            startIcon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                                            sx={{ textTransform: "none", fontWeight: 600, fontSize: "11px", minWidth: 0 }}>
                                            {preview ? "Change" : i === 0 ? "Main" : `Angle ${i+1}`}
                                            <input type="file" accept="image/*" hidden onChange={handleImageUploadForSlot(i)} />
                                        </Button>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <TextField label="Description" size="small" fullWidth multiline rows={4}
                            value={productForm.description}
                            onChange={(e) => { if (e.target.value.length <= 1000) setProductForm({ ...productForm, description: e.target.value }); }}
                            inputProps={{ maxLength: 1000, style: { overflowX: "hidden", wordBreak: "break-word", whiteSpace: "pre-wrap" } }} />
                        <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 0.5, color: productForm.description.length >= 900 ? "error.main" : "var(--text-3)" }}>
                            {productForm.description.length} / 1000
                        </Typography>
                    </Box>
                </Box>
            </SheetPanel>

            {/* ── Delete Confirmation ── */}
            <MuiDialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <MuiDialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Delete Product</MuiDialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{productToDelete?.productName}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined" sx={{ textTransform: "none", minWidth: 88 }}>Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}>Delete</Button>
                </DialogActions>
            </MuiDialog>

            {/* ── Reject Dialog ── */}
            <MuiDialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <MuiDialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Reject Product</MuiDialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Provide a reason for rejecting <strong>{productToReject?.productName}</strong>. The seller will be notified.
                    </DialogContentText>
                    <TextField
                        autoFocus fullWidth multiline rows={3} size="small"
                        label="Rejection reason"
                        placeholder="e.g. Images are too low resolution. Please upload clearer photos."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)} variant="outlined" sx={{ textTransform: "none", minWidth: 88 }}>Cancel</Button>
                    <Button onClick={confirmReject} variant="contained" color="error" disabled={actionLoading}
                        sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}>
                        Reject &amp; Notify Seller
                    </Button>
                </DialogActions>
            </MuiDialog>

        </AdminLayout>
    );
};

export default AdminProductsPage;
