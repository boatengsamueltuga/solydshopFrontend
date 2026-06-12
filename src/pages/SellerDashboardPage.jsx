import { useEffect, useState } from "react";

import api from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import CloudUploadIcon        from "@mui/icons-material/CloudUpload";
import AddCircleOutlineIcon   from "@mui/icons-material/AddCircleOutlined";
import EditOutlinedIcon       from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon      from "@mui/icons-material/DeleteOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ImageOutlinedIcon      from "@mui/icons-material/ImageOutlined";
import CloseIcon              from "@mui/icons-material/Close";
import InventoryOutlinedIcon  from "@mui/icons-material/InventoryOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

const getStockChip = (qty) => {
    if (qty === 0)  return { label: "Out of Stock",      color: "error"   };
    if (qty <= 5)   return { label: `Low Stock · ${qty}`, color: "warning" };
    return              { label: `In Stock · ${qty}`,   color: "success" };
};

const SellerDashboardPage = () => {

    const [products,         setProducts]         = useState([]);
    const [categories,       setCategories]       = useState([]);
    const [loading,          setLoading]          = useState(true);
    const [actionLoading,    setActionLoading]    = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [selectedFile,     setSelectedFile]     = useState(null);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const [formData, setFormData] = useState({
        productName: "",
        description: "",
        modelNumber: "",
        partNumber:  "",
        imageUrl:    "",
        price:       "",
        quantity:    "",
        categoryId:  "",
    });

    // Extract XSRF token from cookies
    const getXsrfToken = () =>
        document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

    // Fetch categories for dropdown
    const fetchCategories = async () => {
        try {
            const response = await api.get("/public/categories?pageSize=1000");
            setCategories(response.data.content);
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch seller products
    const fetchProducts = async () => {
        try {
            const response = await api.get("/seller/products");
            setProducts(response.data.content);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Handle text input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle image file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image must be 10 MB or smaller.");
            e.target.value = "";
            return;
        }
        setSelectedFile(file);
    };

    // Create or update product
    const handleSubmit = async (e) => {

        e.preventDefault();

        setActionLoading(true);

        try {

            let imageUrl = formData.imageUrl;

            // Upload image to Cloudinary
            if (selectedFile) {

                const uploadFormData = new FormData();

                uploadFormData.append("file", selectedFile);

                const uploadResponse = await api.post("/upload", uploadFormData, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });

                imageUrl = uploadResponse.data;
            }

            const productData = {
                productName: formData.productName,
                description: formData.description,
                modelNumber: formData.modelNumber || null,
                partNumber:  formData.partNumber  || null,
                imageUrl,
                price:      Number(formData.price),
                quantity:   Number(formData.quantity),
                categoryId: Number(formData.categoryId),
            };

            if (editingProductId) {

                await api.put(`/seller/products/${editingProductId}`, productData, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });

                toast.success("Product updated successfully");

            } else {

                await api.post("/seller/products", productData, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });

                toast.success("Product created successfully");
            }

            setFormData({ productName: "", description: "", modelNumber: "", partNumber: "", imageUrl: "", price: "", quantity: "", categoryId: "" });
            setSelectedFile(null);
            setEditingProductId(null);

            await fetchProducts();

        } catch (error) {

            console.log(error);

        } finally {

            setActionLoading(false);
        }
    };

    // Populate form for editing
    const handleEdit = (product) => {
        setEditingProductId(product.productId);
        setFormData({
            productName: product.productName,
            description: product.description,
            modelNumber: product.modelNumber || "",
            partNumber:  product.partNumber  || "",
            imageUrl:    product.imageUrl,
            price:       product.price,
            quantity:    product.quantity,
            categoryId:  String(product.categoryId || ""),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Cancel edit mode
    const handleCancelEdit = () => {
        setEditingProductId(null);
        setSelectedFile(null);
        setFormData({ productName: "", description: "", modelNumber: "", partNumber: "", imageUrl: "", price: "", quantity: "", categoryId: "" });
    };

    // Delete product
    const handleDelete = async (productId) => {

        setActionLoading(true);

        try {

            await api.delete(`/seller/products/${productId}`, {
                headers: { "X-XSRF-TOKEN": getXsrfToken() },
            });

            toast.success("Product deleted");

            await fetchProducts();

        } catch (error) {

            console.log(error);

        } finally {

            setActionLoading(false);
        }
    };

    /*
    |----------------------------------------------------------
    | Loading
    |----------------------------------------------------------
    */

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, bgcolor: "grey.50" }}>
                <Loader />
                <Typography variant="h6" color="text.secondary">Loading dashboard...</Typography>
            </Box>
        );
    }

    const previewSrc = selectedFile
        ? URL.createObjectURL(selectedFile)
        : formData.imageUrl || null;

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (
        <>
        <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>

            {/* ── Banner ── */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #004d40 0%, #00695c 55%, #00897b 100%)",
                    color: "white",
                    px: { xs: 3, sm: 5, md: 8 },
                    py: { xs: 4, md: 6 },
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56 }}>
                        <StorefrontOutlinedIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
                            Seller Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                            Manage your products and inventory
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Paper elevation={0} sx={{ px: 3, py: 1.75, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, color: "white", minWidth: 150 }}>
                        <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                            Total Products
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">{products.length}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ px: 3, py: 1.75, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, color: "white", minWidth: 150 }}>
                        <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                            In Stock Items
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {products.filter((p) => p.quantity > 0).length}
                        </Typography>
                    </Paper>
                </Stack>
            </Box>

            {/* ── Content ── */}
            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>

                {/* ── Action Loading Bar ── */}
                {actionLoading && (
                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "info.light",
                            bgcolor: "#e3f2fd",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={20} thickness={5} />
                        <Typography variant="body2" fontWeight={600} color="info.dark">
                            Processing product changes...
                        </Typography>
                    </Paper>
                )}

                {/* ── Product Form ── */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: editingProductId ? "warning.light" : "divider",
                        overflow: "hidden",
                        mb: 5,
                    }}
                >

                    {/* Form header accent */}
                    <Box sx={{ height: 4, bgcolor: editingProductId ? "warning.main" : "primary.main" }} />

                    <CardContent sx={{ px: { xs: 3, md: 5 }, py: { xs: 3, md: 4 } }}>

                        {/* Form Title */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar sx={{ bgcolor: editingProductId ? "warning.main" : "primary.main", width: 40, height: 40 }}>
                                    {editingProductId
                                        ? <EditOutlinedIcon sx={{ fontSize: 20 }} />
                                        : <AddCircleOutlineIcon sx={{ fontSize: 20 }} />
                                    }
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                                        {editingProductId ? "Edit Product" : "Add New Product"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {editingProductId
                                            ? `Editing product #${editingProductId}`
                                            : "Fill in the details below to list a new product"}
                                    </Typography>
                                </Box>
                            </Stack>

                            {editingProductId && (
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<CloseIcon />}
                                    onClick={handleCancelEdit}
                                    sx={{ textTransform: "none", borderRadius: 2 }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 2.5,
                            }}
                        >

                            {/* Product Name */}
                            <TextField
                                label="Product Name"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                disabled={actionLoading}
                                required
                                fullWidth
                                size="medium"
                            />

                            {/* Price */}
                            <TextField
                                label="Price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                disabled={actionLoading}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">$</InputAdornment>
                                    ),
                                }}
                            />

                            {/* Quantity */}
                            <TextField
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
                                disabled={actionLoading}
                                required
                                fullWidth
                            />

                            {/* Category */}
                            <FormControl fullWidth disabled={actionLoading}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    label="Category"
                                    onChange={handleChange}
                                    MenuProps={{
                                        PaperProps: {
                                            style: { maxHeight: 240, overflow: "auto" },
                                        },
                                        sx: {
                                            "& .MuiPaper-root": {
                                                maxHeight: "240px !important",
                                                overflow: "auto !important",
                                            },
                                            "& .MuiMenuItem-root.Mui-selected": {
                                                backgroundColor: "#1976d2 !important",
                                                color: "#fff !important",
                                            },
                                            "& .MuiMenuItem-root.Mui-selected:hover": {
                                                backgroundColor: "#1565c0 !important",
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value=""><em>Select a category</em></MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                            {cat.categoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Model Number */}
                            <TextField
                                label="Model Number"
                                name="modelNumber"
                                value={formData.modelNumber}
                                onChange={handleChange}
                                disabled={actionLoading}
                                fullWidth
                                placeholder="e.g. CAT 320D"
                            />

                            {/* Part Number */}
                            <TextField
                                label="Part Number"
                                name="partNumber"
                                value={formData.partNumber}
                                onChange={handleChange}
                                disabled={actionLoading}
                                fullWidth
                                placeholder="e.g. 3066T-1234"
                            />

                            {/* Image Upload — full width */}
                            <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1} display="block" sx={{ mb: 1.25 }}>
                                    Product Image
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        disabled={actionLoading}
                                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                                    >
                                        {selectedFile ? "Change Image" : "Upload Image"}
                                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                    </Button>
                                    {selectedFile && (
                                        <Chip
                                            icon={<CheckCircleOutlineIcon />}
                                            label={selectedFile.name}
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                            onDelete={() => setSelectedFile(null)}
                                        />
                                    )}
                                </Stack>
                            </Box>

                            {/* Image Preview — full width */}
                            {previewSrc && (
                                <Box sx={{ gridColumn: { md: "1 / -1" }, display: "flex", justifyContent: "center" }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            width: { xs: "100%", sm: 320 },
                                            height: 200,
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={previewSrc}
                                            alt="Preview"
                                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        <Chip
                                            label="Preview"
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                left: 8,
                                                bgcolor: "rgba(0,0,0,0.55)",
                                                color: "white",
                                                fontWeight: 700,
                                                fontSize: "0.7rem",
                                            }}
                                        />
                                    </Paper>
                                </Box>
                            )}

                            {/* Description — full width */}
                            <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                                <TextField
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 1000)
                                            setFormData({ ...formData, description: e.target.value });
                                    }}
                                    disabled={actionLoading}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    inputProps={{ maxLength: 1000 }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        textAlign: "right",
                                        mt: 0.5,
                                        color: formData.description.length >= 900 ? "error.main" : "text.disabled",
                                    }}
                                >
                                    {formData.description.length} / 1000
                                </Typography>
                            </Box>

                            {/* Submit */}
                            <Box sx={{ gridColumn: { md: "1 / -1" }, display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color={editingProductId ? "warning" : "primary"}
                                    size="large"
                                    disabled={actionLoading}
                                    startIcon={
                                        actionLoading
                                            ? <CircularProgress size={18} color="inherit" />
                                            : editingProductId
                                                ? <EditOutlinedIcon />
                                                : <AddCircleOutlineIcon />
                                    }
                                    sx={{
                                        py: 1.25,
                                        px: 4,
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        textTransform: "none",
                                        borderRadius: 2,
                                        minWidth: 200,
                                    }}
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : editingProductId
                                            ? "Update Product"
                                            : "Create Product"}
                                </Button>
                            </Box>

                        </Box>
                    </CardContent>
                </Card>

                {/* ── My Products ── */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                My Products
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {products.length} product{products.length !== 1 ? "s" : ""} listed
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                {/* ── Empty State ── */}
                {products.length === 0 ? (

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            py: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            bgcolor: "white",
                        }}
                    >
                        <Avatar sx={{ width: 88, height: 88, bgcolor: "#e0f2f1", mb: 3 }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 44, color: "success.dark" }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                            No products yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.7 }}>
                            Use the form above to add your first product listing.
                        </Typography>
                    </Paper>

                ) : (

                    /* ── Product Grid ── */
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(3, 1fr)",
                                md: "repeat(4, 1fr)",
                                lg: "repeat(5, 1fr)",
                                xl: "repeat(6, 1fr)",
                            },
                            gap: 2,
                        }}
                    >
                        {products.map((product) => (

                            <Card
                                key={product.productId}
                                elevation={2}
                                sx={{
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                                    "&:hover .qv-overlay": { opacity: 1 },
                                }}
                            >

                                {/* Product Image + Quick View overlay */}
                                <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "grey.50", p: 0.5 }}>
                                    {product.imageUrl ? (
                                        <Box
                                            component="img"
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, display: "block" }}
                                        />
                                    ) : (
                                        <Box sx={{ width: 80, height: 80, bgcolor: "grey.100", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <ImageOutlinedIcon sx={{ fontSize: 28, color: "text.disabled" }} />
                                        </Box>
                                    )}
                                    <Box
                                        className="qv-overlay"
                                        sx={{
                                            position: "absolute",
                                            inset: 0,
                                            bgcolor: "rgba(0,0,0,0.45)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            opacity: 0,
                                            transition: "opacity 0.2s ease",
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            onClick={() => setQuickViewProduct(product)}
                                            sx={{
                                                bgcolor: "white",
                                                color: "text.primary",
                                                fontWeight: 700,
                                                fontSize: "0.6rem",
                                                textTransform: "none",
                                                borderRadius: 2,
                                                px: 1.5,
                                                py: 0.4,
                                                minWidth: 0,
                                                "&:hover": { bgcolor: "grey.100" },
                                            }}
                                        >
                                            Quick View
                                        </Button>
                                    </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1, p: 1, pb: "4px !important" }}>

                                    <Typography
                                        sx={{
                                            fontSize: { xs: "0.72rem", md: "0.8rem" },
                                            fontWeight: 600,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            lineHeight: 1.25,
                                            mb: 0.3,
                                            color: "text.primary",
                                        }}
                                    >
                                        {product.productName}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: { xs: "0.63rem", md: "0.7rem" },
                                            color: "text.secondary",
                                            mb: 0.4,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {product.description}
                                    </Typography>

                                    {product.modelNumber && (
                                        <Typography sx={{ fontSize: "0.6rem", color: "text.disabled", mb: 0.2 }}>
                                            Model: {product.modelNumber}
                                        </Typography>
                                    )}
                                    {product.partNumber && (
                                        <Typography sx={{ fontSize: "0.6rem", color: "text.disabled", mb: 0.2 }}>
                                            Part #: {product.partNumber}
                                        </Typography>
                                    )}

                                    <Typography
                                        fontWeight="bold"
                                        color="success.main"
                                        sx={{ fontSize: { xs: "0.82rem", md: "0.9rem" }, mb: 0.4 }}
                                    >
                                        ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </Typography>

                                    <Chip
                                        label={product.quantity > 0 ? "In Stock" : "Out of Stock"}
                                        color={product.quantity > 0 ? "success" : "error"}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: "0.58rem", height: 18 }}
                                    />

                                </CardContent>

                                <CardActions sx={{ p: 1, pt: 0, gap: 0.5 }}>
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        fullWidth
                                        startIcon={<EditOutlinedIcon sx={{ fontSize: "0.8rem !important" }} />}
                                        onClick={() => handleEdit(product)}
                                        disabled={actionLoading}
                                        sx={{
                                            borderRadius: 2,
                                            py: 0.4,
                                            fontSize: { xs: "0.6rem", md: "0.68rem" },
                                            textTransform: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        fullWidth
                                        startIcon={<DeleteOutlineIcon sx={{ fontSize: "0.8rem !important" }} />}
                                        onClick={() => handleDelete(product.productId)}
                                        disabled={actionLoading}
                                        sx={{
                                            borderRadius: 2,
                                            py: 0.4,
                                            fontSize: { xs: "0.6rem", md: "0.68rem" },
                                            textTransform: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </CardActions>

                            </Card>

                        ))}

                    </Box>

                )}

            </Container>

        </Box>

        {/* ── Quick View Modal ── */}
        <Dialog
            open={Boolean(quickViewProduct)}
            onClose={() => setQuickViewProduct(null)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
            {quickViewProduct && (
                <>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
                        <Typography variant="h6" fontWeight="bold">Quick View</Typography>
                        <IconButton size="small" onClick={() => setQuickViewProduct(null)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <DialogContent sx={{ p: 0 }}>
                        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>

                            {/* Image */}
                            <Box sx={{ width: { xs: "100%", sm: "35%" }, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center", p: 1.5, minHeight: 220, flexShrink: 0 }}>
                                <Box component="img" src={quickViewProduct.imageUrl} alt={quickViewProduct.productName} sx={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
                            </Box>

                            {/* Details */}
                            <Box sx={{ flex: 1, p: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
                                {quickViewProduct.categoryName && (
                                    <Chip label={quickViewProduct.categoryName} size="small" color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />
                                )}

                                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.3, wordBreak: "break-word" }}>
                                    {quickViewProduct.productName}
                                </Typography>

                                {(quickViewProduct.modelNumber || quickViewProduct.partNumber) && (
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {quickViewProduct.modelNumber && (
                                            <Chip label={`Model: ${quickViewProduct.modelNumber}`} size="small" variant="outlined" />
                                        )}
                                        {quickViewProduct.partNumber && (
                                            <Chip label={`Part #: ${quickViewProduct.partNumber}`} size="small" variant="outlined" />
                                        )}
                                    </Stack>
                                )}

                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                    ${Number(quickViewProduct.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </Typography>

                                <Chip
                                    label={quickViewProduct.quantity > 0 ? `In Stock · ${quickViewProduct.quantity} units` : "Out of Stock"}
                                    color={quickViewProduct.quantity > 0 ? "success" : "error"}
                                    variant="filled"
                                    sx={{ alignSelf: "flex-start" }}
                                />

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                        Description
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7, wordBreak: "break-word", overflowWrap: "break-word", maxHeight: 100, overflowY: "auto", pr: 0.5 }}>
                                        {quickViewProduct.description}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="warning"
                                    fullWidth
                                    startIcon={<EditOutlinedIcon />}
                                    onClick={() => { setQuickViewProduct(null); handleEdit(quickViewProduct); }}
                                    sx={{ mt: "auto", borderRadius: 2, fontWeight: 700, textTransform: "none", py: 0.8 }}
                                >
                                    Edit Product
                                </Button>
                            </Box>

                        </Box>
                    </DialogContent>
                </>
            )}
        </Dialog>
        </>
    );
};

export default SellerDashboardPage;
