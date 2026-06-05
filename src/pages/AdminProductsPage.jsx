import { useEffect, useState } from "react";

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
    Grid,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    InputLabel,
    FormControl,
} from "@mui/material";

import VisibilityIcon  from "@mui/icons-material/Visibility";
import EditIcon        from "@mui/icons-material/Edit";
import DeleteIcon      from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon       from "@mui/icons-material/Close";

import api from "../api/api";

import Loader from "../components/Loader";

import toast from "react-hot-toast";

const AdminProductsPage = () => {

    const [products,   setProducts]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);

    const [isFormOpen,        setIsFormOpen]        = useState(false);
    const [editingProductId,  setEditingProductId]  = useState(null);

    const [selectedProduct,   setSelectedProduct]   = useState(null);
    const [isViewOpen,        setIsViewOpen]         = useState(false);

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
        imageUrl:    "",
        price:       "",
        quantity:    "",
        categoryId:  "",
    });

    const resetForm = () => {
        setProductForm({
            productName: "",
            description: "",
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
                serverMsg.toLowerCase().includes("integrity")  ||
                serverMsg.toLowerCase().includes("foreign key")||
                serverMsg.toLowerCase().includes("constraint") ||
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
            width: isMobile ? 70 : 100,
            renderCell: (params) => (
                <img
                    src={params.row.imageUrl}
                    alt={params.row.productName}
                    className={`${isMobile ? "w-10 h-10" : "w-14 h-14"} object-cover rounded`}
                />
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
            minWidth: 180,
            flex: 1,
        }] : []),

        {
            field: "price",
            headerName: "Price",
            width: isMobile ? 80 : 120,
            renderCell: (params) => (
                <span className="font-bold text-green-700">
                    ${params.row.price}
                </span>
            ),
        },

        {
            field: "quantity",
            headerName: "Stock",
            width: isMobile ? 70 : 100,
        },

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 130 : 160,
            renderCell: (params) => (
                <div className="flex gap-1 items-center h-full">

                    <Tooltip title="View product" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleViewProduct(params.row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit product" arrow>
                        <IconButton size="small" color="warning" onClick={() => handleEditProduct(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete product" arrow>
                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(params.row)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                </div>
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
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Loader />
                <p className="text-2xl font-semibold mt-4">Loading products...</p>
            </div>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen w-full overflow-x-hidden">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">

                <h1 className="text-3xl md:text-5xl font-bold">
                    Product Management
                </h1>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    sx={{ alignSelf: { xs: "flex-start", md: "auto" } }}
                >
                    Create Product
                </Button>

            </div>

            <div
                className="bg-white rounded-xl shadow overflow-x-auto min-w-0"
                style={{ height: isMobile ? 450 : 600, width: "100%" }}
            >
                <DataGrid
                    rows={products}
                    columns={columns}
                    disableRowSelectionOnClick
                    getRowId={(row) => row.productId}
                    getRowHeight={() => "auto"}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    sx={{
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            fontSize: isMobile ? "12px" : "16px",
                        },
                        "& .MuiDataGrid-cell": {
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "4px 6px" : "8px 10px",
                        },
                    }}
                />
            </div>

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
                        {/* Header */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 3,
                                py: 2,
                                borderBottom: "1px solid #e5e7eb",
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                Product Details
                            </Typography>

                            <IconButton size="small" onClick={() => setIsViewOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Body — two columns */}
                        <DialogContent sx={{ p: 0 }}>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>

                                {/* Left — image */}
                                <Box
                                    sx={{
                                        width: { xs: "100%", sm: "42%" },
                                        minHeight: { xs: 220, sm: 320 },
                                        bgcolor: "#f3f4f6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        p: 2,
                                        flexShrink: 0,
                                    }}
                                >
                                    <img
                                        src={selectedProduct.imageUrl}
                                        alt={selectedProduct.productName}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 280,
                                            objectFit: "contain",
                                        }}
                                    />
                                </Box>

                                {/* Right — details */}
                                <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>

                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        color="text.primary"
                                        sx={{ wordBreak: "break-word", lineHeight: 1.3 }}
                                    >
                                        {selectedProduct.productName}
                                    </Typography>

                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        ${Number(selectedProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </Typography>

                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        <Chip
                                            label={selectedProduct.quantity > 0
                                                ? `In Stock: ${selectedProduct.quantity}`
                                                : "Out of Stock"}
                                            color={selectedProduct.quantity > 0 ? "success" : "error"}
                                            variant="filled"
                                        />

                                        {selectedProduct.categoryName && (
                                            <Chip
                                                label={selectedProduct.categoryName}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>

                                    <Divider />

                                    <Box>
                                        <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                            Description
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                                            {selectedProduct.description}
                                        </Typography>
                                    </Box>

                                </Box>

                            </Box>
                        </DialogContent>

                        {/* Actions */}
                        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", gap: 1 }}>
                            <Button
                                onClick={() => setIsViewOpen(false)}
                                variant="outlined"
                                color="inherit"
                            >
                                Close
                            </Button>

                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    setIsViewOpen(false);
                                    handleEditProduct(selectedProduct);
                                }}
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
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
                    {editingProductId ? "Edit Product" : "Create Product"}
                </MuiDialogTitle>

                <DialogContent sx={{ pt: 3, overflow: "visible" }}>

                    <Grid container spacing={2}>

                        {/* Product Name */}
                        <Grid item xs={12} sm={7}>
                            <TextField
                                label="Product Name"
                                size="small"
                                fullWidth
                                value={productForm.productName}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, productName: e.target.value })
                                }
                            />
                        </Grid>

                        {/* Price */}
                        <Grid item xs={6} sm={2.5}>
                            <TextField
                                label="Price"
                                size="small"
                                type="number"
                                fullWidth
                                value={productForm.price}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, price: e.target.value })
                                }
                            />
                        </Grid>

                        {/* Quantity */}
                        <Grid item xs={6} sm={2.5}>
                            <TextField
                                label="Qty"
                                size="small"
                                type="number"
                                fullWidth
                                value={productForm.quantity}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, quantity: e.target.value })
                                }
                            />
                        </Grid>

                        {/* Category */}
                        <Grid item xs={12} sx={{ width: "70%" }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    label="Category"
                                    value={productForm.categoryId}
                                    onChange={(e) =>
                                        setProductForm({ ...productForm, categoryId: e.target.value })
                                    }
                                >
                                    <MenuItem value=""><em>Select category</em></MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.categoryId} value={String(cat.categoryId)}>
                                            {cat.categoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Image Upload */}
                        <Grid item xs={12} sx={{ width: "35%" }}>
                            <input
                                type="file"
                                id="productImageInput"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                onClick={() => document.getElementById("productImageInput").click()}
                                sx={{ height: "40px" }}
                            >
                                {productForm.imageUrl ? "Change Image" : "Upload Image"}
                            </Button>
                        </Grid>

                        {/* Image preview — to the right of the button */}
                        {productForm.imageUrl && (
                            <Grid item xs={12} sx={{ width: "60%" }}>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 90,
                                        borderRadius: 2,
                                        border: "1px solid #e5e7eb",
                                        bgcolor: "#f3f4f6",
                                        overflow: "hidden",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        p: 0.5,
                                    }}
                                >
                                    <img
                                        src={productForm.imageUrl}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 80,
                                            objectFit: "contain",
                                            display: "block",
                                        }}
                                    />
                                </Box>
                            </Grid>
                        )}

                        {/* Description */}
                        <Grid item xs={12} sx={{ width: "100%" }}>
                            <TextField
                                label="Description"
                                size="small"
                                fullWidth
                                multiline
                                rows={5}
                                value={productForm.description}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, description: e.target.value })
                                }
                            />
                        </Grid>

                    </Grid>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>

                    <Button
                        onClick={() => { resetForm(); setIsFormOpen(false); }}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSaveProduct}
                        variant="contained"
                        color="primary"
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
                <MuiDialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
                    Delete Product
                </MuiDialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{" "}
                        <strong>{productToDelete?.productName}</strong>?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined" color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>

            </MuiDialog>

        </div>
    );
};

export default AdminProductsPage;
