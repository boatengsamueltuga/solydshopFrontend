import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

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

import VisibilityIcon        from "@mui/icons-material/Visibility";
import EditIcon              from "@mui/icons-material/Edit";
import DeleteIcon            from "@mui/icons-material/Delete";
import CloudUploadIcon       from "@mui/icons-material/CloudUpload";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import SearchIcon            from "@mui/icons-material/Search";
import ClearIcon             from "@mui/icons-material/Clear";
import RefreshIcon           from "@mui/icons-material/Refresh";

import api          from "../api/api";
import toast        from "react-hot-toast";
import AdminLayout  from "../components/layouts/AdminLayout";
import SheetPanel   from "../components/common/SheetPanel";
import PageBanner   from "../components/common/PageBanner";

import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";

/* ── MonoTag ── */
const MonoTag = memo(({ value }) =>
    value ? (
        <span style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "12px",
            color:         "var(--accent)",
            background:    "var(--accent-subtle)",
            border:        "1px solid var(--accent-border)",
            borderRadius:  "var(--r-sm)",
            padding:       "1px 5px",
            letterSpacing: "0.03em",
        }}>
            {value}
        </span>
    ) : (
        <span style={{ color: "var(--text-4)", fontSize: "13px" }}>—</span>
    ));

/* ── AdminProductsPage ── */
const AdminProductsPage = () => {

    const [products,   setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);

    const [isFormOpen,        setIsFormOpen]        = useState(false);
    const [editingProductId,  setEditingProductId]  = useState(null);
    const [isViewOpen,        setIsViewOpen]        = useState(false);
    const [selectedProduct,   setSelectedProduct]   = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete,   setProductToDelete]   = useState(null);

    const [search, setSearch] = useState("");

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const [productForm, setProductForm] = useState({
        productName: "",
        description: "",
        modelNumber: "",
        partNumber:  "",
        imageUrl:    "",
        price:       "",
        quantity:    "",
        categoryId:  "",
    });

    const resetForm = () => {
        setProductForm({ productName: "", description: "", modelNumber: "", partNumber: "", imageUrl: "", price: "", quantity: "", categoryId: "" });
        setEditingProductId(null);
    };

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchProducts = useCallback(async () => {
        try {
            const res = await api.get("/public/products");
            setProducts(res.data.content);
        } catch {
            toast.error("Unable to load products. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get("/public/categories");
            setCategories(res.data.content);
        } catch {
            // categories are non-critical
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
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(p =>
            p.productName?.toLowerCase().includes(q)  ||
            p.categoryName?.toLowerCase().includes(q) ||
            p.modelNumber?.toLowerCase().includes(q)  ||
            p.partNumber?.toLowerCase().includes(q)
        );
    }, [products, search]);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleViewProduct = useCallback((product) => {
        setSelectedProduct(product);
        setIsViewOpen(true);
    }, []);

    const handleEditProduct = useCallback((product) => {
        setEditingProductId(product.productId);
        setProductForm({
            productName: product.productName,
            description: product.description,
            modelNumber: product.modelNumber || "",
            partNumber:  product.partNumber  || "",
            imageUrl:    product.imageUrl,
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
            toast.success(`"${productToDelete.productName}" has been deleted.`);
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post("/upload", formData, {
                headers: {
                    "X-XSRF-TOKEN": document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1],
                },
            });
            setProductForm((prev) => ({ ...prev, imageUrl: res.data }));
            toast.success("Image uploaded successfully.");
        } catch {
            toast.error("Image upload failed. Please try again.");
        }
    };

    const handleSaveProduct = async () => {
        if (!productForm.productName || !productForm.description || !productForm.imageUrl || !productForm.price || !productForm.quantity || !productForm.categoryId) {
            toast.error("Please fill in all required fields before saving.");
            return;
        }
        const payload = {
            productName: productForm.productName,
            description: productForm.description,
            modelNumber: productForm.modelNumber || null,
            partNumber:  productForm.partNumber  || null,
            imageUrl:    productForm.imageUrl,
            price:       Number(productForm.price),
            quantity:    Number(productForm.quantity),
            categoryId:  Number(productForm.categoryId),
        };
        try {
            if (editingProductId) {
                await api.put(`/admin/products/${editingProductId}`, payload);
                toast.success(`"${productForm.productName}" updated successfully.`);
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

    /*
    |----------------------------------------------------------
    | DataGrid columns
    |----------------------------------------------------------
    */

    const columns = useMemo(() => [
        {
            field: "image",
            headerName: "Image",
            width: 80,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <Box
                        component="img"
                        src={params.row.imageUrl}
                        alt={params.row.productName}
                        sx={{ width: 44, height: 44, objectFit: "cover", borderRadius: "var(--r-sm)" }}
                    />
                </Box>
            ),
        },
        {
            field: "productName",
            headerName: "Product Name",
            minWidth: isMobile ? 140 : 220,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)", fontSize: "13px", maxWidth: "100%", display: "block" }}>
                    {params.row.productName}
                </span>
            ),
        },
        ...(!isMobile ? [{
            field: "categoryName",
            headerName: "Category",
            minWidth: 130,
            flex: 0.8,
            renderCell: (params) => (
                <span style={{ color: "var(--text-2)", fontSize: "13px" }}>{params.row.categoryName || "—"}</span>
            ),
        }] : []),
        ...(!isMobile ? [{
            field: "modelNumber",
            headerName: "Model No.",
            minWidth: 120,
            renderCell: (params) => <MonoTag value={params.row.modelNumber} />,
        }] : []),
        ...(!isMobile ? [{
            field: "partNumber",
            headerName: "Part No.",
            minWidth: 120,
            renderCell: (params) => <MonoTag value={params.row.partNumber} />,
        }] : []),
        {
            field: "price",
            headerName: "Price",
            width: isMobile ? 80 : 110,
            renderCell: (params) => (
                <span style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
                    ${Number(params.row.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            field: "quantity",
            headerName: "Stock",
            width: 90,
            renderCell: (params) => (
                <Chip
                    label={params.row.quantity > 0 ? params.row.quantity : "Out"}
                    size="small"
                    variant="outlined"
                    sx={{
                        fontFamily:  "var(--font-mono)",
                        fontWeight:  700,
                        fontSize:    "0.7rem",
                        color:       params.row.quantity > 0 ? "var(--success)" : "var(--error)",
                        borderColor: params.row.quantity > 0 ? "var(--success)" : "var(--error)",
                    }}
                />
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 100 : 130,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="View" arrow>
                        <IconButton size="small" onClick={() => handleViewProduct(params.row)}
                            sx={{ color: "var(--info)", "&:hover": { background: "var(--info-subtle)" } }}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                        <IconButton size="small" onClick={() => handleEditProduct(params.row)}
                            sx={{ color: "var(--warning)", "&:hover": { background: "var(--warning-subtle)" } }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <IconButton size="small" onClick={() => handleDeleteProduct(params.row)}
                            sx={{ color: "var(--error)", "&:hover": { background: "var(--error-subtle)" } }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [isMobile, handleViewProduct, handleEditProduct, handleDeleteProduct]);

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (
        <AdminLayout title="Products">

            {/* ── Page banner ── */}
            <div style={{ marginTop: "-24px", marginLeft: "-24px", marginRight: "-24px", marginBottom: "var(--space-4)" }}>
                <PageBanner
                    title="Products"
                    subtitle="Manage the product catalog"
                    icon={<InventoryOutlinedIcon sx={{ fontSize: 20 }} />}
                    action={
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCircleOutlinedIcon />}
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                        >
                            Create Product
                        </Button>
                    }
                />
            </div>

            {/* ── Search ── */}
            <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-3)",
                marginBottom: "var(--space-4)",
                flexWrap:     "wrap",
            }}>
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
                        endAdornment: (
                            <InputAdornment position="end" sx={{ visibility: search ? "visible" : "hidden" }}>
                                <IconButton size="small" onClick={() => setSearch("")} edge="end">
                                    <ClearIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 280, flex: 1, maxWidth: 480 }}
                />
                <Tooltip title="Refresh" arrow>
                    <IconButton
                        onClick={() => { setLoading(true); fetchProducts(); fetchCategories(); }}
                        sx={{ color: "var(--text-3)", "&:hover": { color: "var(--accent)", background: "var(--accent-subtle)" } }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                {[
                    { label: "Total",        value: products.length },
                    { label: "In Stock",     value: products.filter(p => p.quantity > 0).length },
                    { label: "Out of Stock", value: products.filter(p => p.quantity === 0).length },
                ].map(({ label, value }) => (
                    <div key={label} style={{
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "var(--space-2)",
                        padding:      "var(--space-2) var(--space-3)",
                        background:   "var(--surface-mid)",
                        border:       "1px solid var(--border)",
                        borderRadius: "var(--r-sm)",
                    }}>
                        <span style={{ color: "var(--text-3)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
                        <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>{value}</span>
                    </div>
                ))}
            </div>

            {/* ── DataGrid ── */}
            <div style={{
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                overflow:     "hidden",
            }}>
                <DataGrid
                    rows={filteredProducts}
                    columns={columns}
                    disableRowSelectionOnClick
                    getRowId={(row) => row.productId}
                    rowHeight={56}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    style={{ height: isMobile ? 450 : 620, width: "100%", border: "none" }}
                />
            </div>

            {/* ── View Product SheetPanel ── */}
            <SheetPanel
                open={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                title="Product Details"
                subtitle={selectedProduct?.productName}
                footer={
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            onClick={() => setIsViewOpen(false)}
                            variant="outlined"
                            sx={{ textTransform: "none", minWidth: 88 }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<EditIcon />}
                            onClick={() => { setIsViewOpen(false); handleEditProduct(selectedProduct); }}
                            sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}
                        >
                            Edit Product
                        </Button>
                    </Stack>
                }
            >
                {selectedProduct && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box sx={{
                            width:          200,
                            height:         200,
                            margin:         "0 auto",
                            background:     "var(--surface-high)",
                            border:         "1px solid var(--border)",
                            borderRadius:   "var(--r-md)",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            overflow:       "hidden",
                            flexShrink:     0,
                        }}>
                            <Box component="img" src={selectedProduct.imageUrl} alt={selectedProduct.productName}
                                sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: "var(--success)", fontFamily: "var(--font-mono)" }}>
                                ${Number(selectedProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Typography>
                            <Chip
                                label={selectedProduct.quantity > 0 ? `In Stock: ${selectedProduct.quantity}` : "Out of Stock"}
                                size="small"
                                variant="outlined"
                                sx={{
                                    color:       selectedProduct.quantity > 0 ? "var(--success)" : "var(--error)",
                                    borderColor: selectedProduct.quantity > 0 ? "var(--success)" : "var(--error)",
                                    fontFamily:  "var(--font-mono)",
                                    fontWeight:  700,
                                }}
                            />
                            {selectedProduct.categoryName && (
                                <Chip label={selectedProduct.categoryName} size="small" variant="outlined"
                                    sx={{ color: "var(--accent)", borderColor: "var(--accent-border)" }} />
                            )}
                        </Box>

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
            <SheetPanel
                open={isFormOpen}
                onClose={() => { resetForm(); setIsFormOpen(false); }}
                title={editingProductId ? "Edit Product" : "Create Product"}
                subtitle={editingProductId ? `Editing product #${editingProductId}` : "Fill in all required fields"}
                width={560}
                footer={
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            onClick={() => { resetForm(); setIsFormOpen(false); }}
                            variant="outlined"
                            sx={{ textTransform: "none", minWidth: 88 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProduct}
                            variant="contained"
                            color={editingProductId ? "warning" : "primary"}
                            startIcon={editingProductId ? <EditIcon /> : <AddCircleOutlinedIcon />}
                            sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}
                        >
                            {editingProductId ? "Update Product" : "Create Product"}
                        </Button>
                    </Stack>
                }
            >
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

                    <TextField
                        label="Product Name"
                        size="small"
                        fullWidth
                        value={productForm.productName}
                        onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                        sx={{ gridColumn: "1 / -1" }}
                    />

                    <TextField
                        label="Price"
                        size="small"
                        type="number"
                        fullWidth
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />

                    <TextField
                        label="Quantity"
                        size="small"
                        type="number"
                        fullWidth
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    />

                    <FormControl size="small" fullWidth sx={{ gridColumn: "1 / -1" }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            value={productForm.categoryId}
                            onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                            MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                        >
                            <MenuItem value=""><em>Select category</em></MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={String(cat.categoryId)}>
                                    {cat.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Model Number"
                        size="small"
                        fullWidth
                        placeholder="e.g. CAT 320D"
                        value={productForm.modelNumber}
                        onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                    />

                    <TextField
                        label="Part Number"
                        size="small"
                        fullWidth
                        placeholder="e.g. 3066T-1234"
                        value={productForm.partNumber}
                        onChange={(e) => setProductForm({ ...productForm, partNumber: e.target.value })}
                    />

                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <input type="file" id="adminProductImgInput" hidden accept="image/*" onChange={handleImageUpload} />
                        <Stack direction="row" alignItems="center" flexWrap="wrap">
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => document.getElementById("adminProductImgInput").click()}
                                sx={{ textTransform: "none" }}
                            >
                                {productForm.imageUrl ? "Change Image" : "Upload Image"}
                            </Button>
                            {productForm.imageUrl && (
                                <Chip label="Image uploaded" size="small" variant="outlined"
                                    sx={{ color: "var(--success)", borderColor: "var(--success)", ml: "16px" }} />
                            )}
                        </Stack>
                    </Box>

                    {productForm.imageUrl && (
                        <Box sx={{
                            gridColumn:     "1 / -1",
                            height:         90,
                            background:     "var(--surface-high)",
                            border:         "1px solid var(--border)",
                            borderRadius:   "var(--r-sm)",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            overflow:       "hidden",
                        }}>
                            <Box component="img" src={productForm.imageUrl} alt="Preview"
                                sx={{ maxHeight: 80, maxWidth: 120, objectFit: "contain" }} />
                        </Box>
                    )}

                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <TextField
                            label="Description"
                            size="small"
                            fullWidth
                            multiline
                            rows={4}
                            value={productForm.description}
                            onChange={(e) => {
                                if (e.target.value.length <= 1000)
                                    setProductForm({ ...productForm, description: e.target.value });
                            }}
                            inputProps={{ maxLength: 1000 }}
                        />
                        <Typography variant="caption" sx={{
                            display:   "block",
                            textAlign: "right",
                            mt:        0.5,
                            color:     productForm.description.length >= 900 ? "error.main" : "var(--text-3)",
                        }}>
                            {productForm.description.length} / 1000
                        </Typography>
                    </Box>

                </Box>
            </SheetPanel>

            {/* ── Delete Confirmation ── */}
            <MuiDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>Delete Product</MuiDialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{productToDelete?.productName}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        variant="outlined"
                        sx={{ textTransform: "none", minWidth: 88 }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ textTransform: "none", fontWeight: 700, ml: "32px" }}>Delete</Button>
                </DialogActions>
            </MuiDialog>

        </AdminLayout>
    );
};

export default AdminProductsPage;
