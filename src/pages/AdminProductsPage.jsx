import { useEffect, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
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
    Paper,
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
import CloseIcon             from "@mui/icons-material/Close";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";

import api    from "../api/api";
import Loader from "../components/Loader";
import toast  from "react-hot-toast";

const AdminProductsPage = () => {

    const [products,   setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);

    const [isFormOpen,       setIsFormOpen]       = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isViewOpen,      setIsViewOpen]       = useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete,   setProductToDelete]   = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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
        setProductForm({
            productName: "",
            description: "",
            modelNumber: "",
            partNumber:  "",
            imageUrl:    "",
            price:       "",
            quantity:    "",
            categoryId:  "",
        });
        setEditingProductId(null);
    };

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchProducts = async () => {
        try {
            const response = await api.get("/public/products");
            setProducts(response.data.content);
        } catch (error) {
            console.log(error);
            toast.error("Unable to load products. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get("/public/categories");
            setCategories(response.data.content);
        } catch (error) {
            console.log(error);
            toast.error("Unable to load categories. Please refresh.");
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setIsViewOpen(true);
    };

    const handleEditProduct = (product) => {
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
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/products/${productToDelete.productId}`);
            toast.success(`"${productToDelete.productName}" has been deleted.`);
            fetchProducts();
        } catch (error) {
            console.log(error);
            const serverMsg = error.response?.data?.message || "";
            const isConstraintError =
                serverMsg.toLowerCase().includes("integrity")   ||
                serverMsg.toLowerCase().includes("foreign key") ||
                serverMsg.toLowerCase().includes("constraint")  ||
                serverMsg.toLowerCase().includes("order");
            toast.error(
                isConstraintError
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
            const response = await api.post("/upload", formData, {
                headers: {
                    "X-XSRF-TOKEN": document.cookie
                        .split("; ")
                        .find(row => row.startsWith("XSRF-TOKEN="))
                        ?.split("=")[1],
                },
            });
            setProductForm((prev) => ({ ...prev, imageUrl: response.data }));
            toast.success("Image uploaded successfully.");
        } catch (error) {
            console.log(error);
            toast.error("Image upload failed. Please try again.");
        }
    };

    const handleSaveProduct = async () => {
        if (
            !productForm.productName ||
            !productForm.description ||
            !productForm.imageUrl    ||
            !productForm.price       ||
            !productForm.quantity    ||
            !productForm.categoryId
        ) {
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
        } catch (error) {
            console.log(error);
            toast.error(
                editingProductId
                    ? "Failed to update product. Please try again."
                    : "Failed to create product. Please try again."
            );
        }
    };

    /*
    |----------------------------------------------------------
    | DataGrid Columns
    |----------------------------------------------------------
    */

    const columns = [

        {
            field: "image",
            headerName: "Image",
            width: isMobile ? 70 : 90,
            renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    <Box
                        component="img"
                        src={params.row.imageUrl}
                        alt={params.row.productName}
                        sx={{
                            width:  isMobile ? 36 : 48,
                            height: isMobile ? 36 : 48,
                            objectFit: "cover",
                            borderRadius: 1,
                        }}
                    />
                </Box>
            ),
        },

        {
            field: "productName",
            headerName: "Product Name",
            minWidth: isMobile ? 130 : 220,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                    {params.row.productName}
                </span>
            ),
        },

        ...(!isMobile ? [{
            field: "categoryName",
            headerName: "Category",
            minWidth: 140,
            flex: 1,
        }] : []),

        ...(!isMobile ? [{
            field: "modelNumber",
            headerName: "Model No.",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" color={params.row.modelNumber ? "text.primary" : "text.disabled"}>
                    {params.row.modelNumber || "—"}
                </Typography>
            ),
        }] : []),

        ...(!isMobile ? [{
            field: "partNumber",
            headerName: "Part No.",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" color={params.row.partNumber ? "text.primary" : "text.disabled"}>
                    {params.row.partNumber || "—"}
                </Typography>
            ),
        }] : []),

        {
            field: "price",
            headerName: "Price",
            width: isMobile ? 80 : 110,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold" color="success.dark">
                    ${Number(params.row.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Typography>
            ),
        },

        {
            field: "quantity",
            headerName: "Stock",
            width: isMobile ? 70 : 90,
            renderCell: (params) => (
                <Chip
                    label={params.row.quantity > 0 ? params.row.quantity : "Out"}
                    color={params.row.quantity > 0 ? "success" : "error"}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                />
            ),
        },

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 120 : 140,
            renderCell: (params) => (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ height: "100%" }}>
                    <Tooltip title="View" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleViewProduct(params.row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                        <IconButton size="small" color="warning" onClick={() => handleEditProduct(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(params.row)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    /*
    |----------------------------------------------------------
    | Loading
    |----------------------------------------------------------
    */

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, bgcolor: "grey.50" }}>
                <Loader />
                <Typography variant="h6" color="text.secondary">Loading products...</Typography>
            </Box>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>

            {/* ── Banner ── */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
                    color: "white",
                    px: { xs: 3, sm: 5, md: 8 },
                    py: { xs: 4, md: 5 },
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56 }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
                                Product Management
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                                Manage your full product catalog
                            </Typography>
                        </Box>
                    </Stack>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlinedIcon />}
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        sx={{
                            bgcolor: "white",
                            color: "primary.dark",
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                            "&:hover": { bgcolor: "grey.100" },
                        }}
                    >
                        Create Product
                    </Button>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    {[
                        { label: "Total Products", value: products.length },
                        { label: "In Stock",       value: products.filter(p => p.quantity > 0).length },
                        { label: "Out of Stock",   value: products.filter(p => p.quantity === 0).length },
                    ].map(({ label, value }) => (
                        <Paper
                            key={label}
                            elevation={0}
                            sx={{
                                px: 3, py: 1.75,
                                bgcolor: "rgba(255,255,255,0.12)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: 2,
                                color: "white",
                                minWidth: 140,
                            }}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                                {label}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">{value}</Typography>
                        </Paper>
                    ))}
                </Stack>
            </Box>

            {/* ── Content ── */}
            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                    }}
                >
                    {/* Table header bar */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            bgcolor: "grey.50",
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <InventoryOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                All Products
                            </Typography>
                            <Chip
                                label={products.length}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700, height: 20, fontSize: "0.72rem" }}
                            />
                        </Stack>
                    </Box>

                    <DataGrid
                        rows={products}
                        columns={columns}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.productId}
                        getRowHeight={() => "auto"}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        style={{ height: isMobile ? 450 : 620, width: "100%", border: "none" }}
                        sx={{
                            "& .MuiDataGrid-columnHeaderTitle": {
                                fontWeight: "bold",
                                fontSize: isMobile ? "12px" : "14px",
                            },
                            "& .MuiDataGrid-cell": {
                                fontSize: isMobile ? "12px" : "14px",
                                padding: isMobile ? "4px 6px" : "8px 10px",
                            },
                            "& .MuiDataGrid-row:hover": {
                                bgcolor: "primary.50",
                            },
                        }}
                    />
                </Paper>

            </Container>

            {/* ── View Product Dialog ── */}
            <MuiDialog
                open={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
            >
                {selectedProduct && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 3,
                                py: 2,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                bgcolor: "grey.50",
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">Product Details</Typography>
                            <IconButton size="small" onClick={() => setIsViewOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>

                                <Box
                                    sx={{
                                        width: { xs: "100%", sm: "35%" },
                                        minHeight: { xs: 220, sm: 320 },
                                        bgcolor: "grey.100",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        p: 2,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.productName}
                                        sx={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }}
                                    />
                                </Box>

                                <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ wordBreak: "break-word", lineHeight: 1.3 }}>
                                        {selectedProduct.productName}
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        ${Number(selectedProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        <Chip
                                            label={selectedProduct.quantity > 0 ? `In Stock: ${selectedProduct.quantity}` : "Out of Stock"}
                                            color={selectedProduct.quantity > 0 ? "success" : "error"}
                                            variant="filled"
                                        />
                                        {selectedProduct.categoryName && (
                                            <Chip label={selectedProduct.categoryName} color="primary" variant="outlined" />
                                        )}
                                    </Box>
                                    {(selectedProduct.modelNumber || selectedProduct.partNumber) && (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            {selectedProduct.modelNumber && (
                                                <Box>
                                                    <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                                        Model Number
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>{selectedProduct.modelNumber}</Typography>
                                                </Box>
                                            )}
                                            {selectedProduct.partNumber && (
                                                <Box>
                                                    <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                                        Part Number
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>{selectedProduct.partNumber}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    <Divider />
                                    <Box>
                                        <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                            Description
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                                lineHeight: 1.7,
                                                wordBreak: "break-word",
                                                overflowWrap: "break-word",
                                            }}
                                        >
                                            {selectedProduct.description}
                                        </Typography>
                                    </Box>
                                </Box>

                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
                            <Button onClick={() => setIsViewOpen(false)} variant="outlined" color="inherit">Close</Button>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<EditIcon />}
                                onClick={() => { setIsViewOpen(false); handleEditProduct(selectedProduct); }}
                            >
                                Edit Product
                            </Button>
                        </DialogActions>
                    </>
                )}
            </MuiDialog>

            {/* ── Create / Edit Product Dialog ── */}
            <MuiDialog
                open={isFormOpen}
                onClose={() => { resetForm(); setIsFormOpen(false); }}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {/* Dialog Header */}
                <Box sx={{ height: 4, bgcolor: editingProductId ? "warning.main" : "primary.main" }} />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: editingProductId ? "warning.main" : "primary.main", width: 36, height: 36 }}>
                            {editingProductId ? <EditIcon sx={{ fontSize: 18 }} /> : <AddCircleOutlinedIcon sx={{ fontSize: 18 }} />}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {editingProductId ? "Edit Product" : "Create Product"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {editingProductId ? `Editing product #${editingProductId}` : "Fill in the details below"}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton size="small" onClick={() => { resetForm(); setIsFormOpen(false); }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>

                        <TextField
                            label="Product Name"
                            size="small"
                            fullWidth
                            value={productForm.productName}
                            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
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
                            label="Qty"
                            size="small"
                            type="number"
                            fullWidth
                            value={productForm.quantity}
                            onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                        />

                        <FormControl size="small" fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                label="Category"
                                value={productForm.categoryId}
                                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                MenuProps={{
                                    PaperProps: { style: { maxHeight: 240, overflow: "auto" } },
                                    sx: {
                                        "& .MuiMenuItem-root.Mui-selected": { backgroundColor: "#1976d2 !important", color: "#fff !important" },
                                        "& .MuiMenuItem-root.Mui-selected:hover": { backgroundColor: "#1565c0 !important" },
                                    },
                                }}
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
                            <input type="file" id="productImageInput" hidden accept="image/*" onChange={handleImageUpload} />
                            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={() => document.getElementById("productImageInput").click()}
                                    sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                                >
                                    {productForm.imageUrl ? "Change Image" : "Upload Image"}
                                </Button>
                                {productForm.imageUrl && (
                                    <Chip label="Image uploaded" color="success" variant="outlined" size="small" />
                                )}
                            </Stack>
                        </Box>

                        {productForm.imageUrl && (
                            <Paper
                                variant="outlined"
                                sx={{ gridColumn: "1 / -1", borderRadius: 2, overflow: "hidden", height: 100, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.50" }}
                            >
                                <Box
                                    component="img"
                                    src={productForm.imageUrl}
                                    alt="Preview"
                                    sx={{ maxHeight: 90, maxWidth: "100%", objectFit: "contain" }}
                                />
                            </Paper>
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
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    textAlign: "right",
                                    mt: 0.5,
                                    color: productForm.description.length >= 900 ? "error.main" : "text.disabled",
                                }}
                            >
                                {productForm.description.length} / 1000
                            </Typography>
                        </Box>

                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => { resetForm(); setIsFormOpen(false); }} variant="outlined" color="inherit" sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveProduct}
                        variant="contained"
                        color={editingProductId ? "warning" : "primary"}
                        startIcon={editingProductId ? <EditIcon /> : <AddCircleOutlinedIcon />}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        {editingProductId ? "Update Product" : "Create Product"}
                    </Button>
                </DialogActions>

            </MuiDialog>

            {/* ── Delete Confirmation Dialog ── */}
            <MuiDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Delete Product
                </MuiDialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{productToDelete?.productName}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined" color="inherit" sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ textTransform: "none", fontWeight: 700 }}>Delete</Button>
                </DialogActions>
            </MuiDialog>

        </Box>
    );
};

export default AdminProductsPage;
