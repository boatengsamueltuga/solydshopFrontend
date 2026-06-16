import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaBoxOpen,
    FaUsers,
    FaShoppingCart,
    FaTags
} from "react-icons/fa";

import {
    DataGrid
} from "@mui/x-data-grid";

import {
    Button,
    Box,
    Dialog as MuiDialog,
    DialogTitle as MuiDialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
} from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import api from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import confirmToast from "../utils/confirmToast";

const AdminDashboardPage = () => {
    
const navigate = useNavigate();
    /*
    ---------------------------------------------------------------
    | State Management
    ---------------------------------------------------------------
    */

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [orders, setOrders] = useState([]);

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    /*
    ---------------------------------------------------------------
    | Create Category Dialog State
    ---------------------------------------------------------------
    */

    const [isCreateCategoryOpen, setIsCreateCategoryOpen] =
        useState(false);

    const [categoryName, setCategoryName] =
        useState("");

    /*
    ---------------------------------------------------------------
    | Edit Category Dialog State
    ---------------------------------------------------------------
    */

    const [isEditCategoryOpen, setIsEditCategoryOpen] =
        useState(false);

    const [selectedCategoryId, setSelectedCategoryId] =
        useState(null);

    const [editCategoryName, setEditCategoryName] =
        useState("");

        /*
    ---------------------------------------------------------------
    | Create Product Dialog State
    ---------------------------------------------------------------
    */

    const [isCreateProductOpen, setIsCreateProductOpen] =
        useState(false);

    const [productForm, setProductForm] =
        useState({

            productName: "",

            description: "",

            imageUrl: "",

            price: "",

            quantity: "",

            categoryId: ""
        });


           /*
    ---------------------------------------------------------------
    | Edit Product State
    ---------------------------------------------------------------
    */

    const [editingProductId, setEditingProductId] =
        useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    /*
    ---------------------------------------------------------------
    | Fetch Products
    ---------------------------------------------------------------
    */

    const fetchProducts = async () => {

        try {

            const response = await api.get(
                "/public/products"
            );

            setProducts(
                response.data.content
            );

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to load products"
            );

        } finally {

            setLoading(false);
        }
    };

    /*
    ---------------------------------------------------------------
    | Fetch Categories
    ---------------------------------------------------------------
    */

    const fetchCategories = async () => {

        try {

            const response = await api.get(
                "/public/categories"
            );

            setCategories(
                response.data.content
            );

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to load categories"
            );
        }
    };

    /*
    ---------------------------------------------------------------
    | Initial Dashboard Data Loading
    ---------------------------------------------------------------
    */

    const fetchOrders = async () => {

        try {

            const response = await api.get("/order/admin");

            setOrders(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    const fetchUsers = async () => {

        try {

            const response = await api.get("/admin/users");

            setUsers(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    useEffect(() => {

        fetchProducts();

        fetchCategories();

        fetchOrders();

        fetchUsers();

    }, []);

    /*
    ---------------------------------------------------------------
    | Delete Product
    ---------------------------------------------------------------
    */

    const handleDeleteProduct = (productId) => {
        confirmToast("Delete this product? This cannot be undone.", async () => {
            try {
                await api.delete(`/admin/products/${productId}`);
                toast.success("Product deleted successfully");
                fetchProducts();
            } catch (error) {
                console.log(error);
                toast.error("Failed to delete product");
            }
        });
    };

    /*
    ---------------------------------------------------------------
    | Delete Category
    ---------------------------------------------------------------
    */

    const handleDeleteCategory = (categoryId) => {
        confirmToast("Delete this category? This cannot be undone.", async () => {
            try {
                await api.delete(`/admin/categories/${categoryId}`);
                toast.success("Category deleted successfully");
                fetchCategories();
            } catch (error) {
                console.log(error);
                toast.error("Failed to delete category");
            }
        });
    };

    /*
    ---------------------------------------------------------------
    | Create Category
    ---------------------------------------------------------------
    */

    const handleCreateCategory = async () => {

        if (!categoryName.trim()) {

            toast.error(
                "Category name is required"
            );

            return;
        }

        try {

            await api.post(
                "/admin/categories",
                {
                    categoryName
                }
            );

            toast.success(
                "Category created successfully"
            );

            fetchCategories();

            setCategoryName("");

            setIsCreateCategoryOpen(false);

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to create category"
            );
        }
    };

    /*
    ---------------------------------------------------------------
    | Open Edit Category Dialog
    ---------------------------------------------------------------
    */

    const openEditCategoryDialog = (category) => {

        setSelectedCategoryId(
            category.categoryId
        );

        setEditCategoryName(
            category.categoryName
        );

        setIsEditCategoryOpen(true);
    };

    /*
    ---------------------------------------------------------------
    | Update Category
    ---------------------------------------------------------------
    */

    const handleUpdateCategory = async () => {

        if (!editCategoryName.trim()) {

            toast.error(
                "Category name is required"
            );

            return;
        }

        try {

            await api.put(
                `/admin/categories/${selectedCategoryId}`,
                {
                    categoryName: editCategoryName
                }
            );

            toast.success(
                "Category updated successfully"
            );

            fetchCategories();

            setSelectedCategoryId(null);

            setEditCategoryName("");

            setIsEditCategoryOpen(false);

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to update category"
            );
        }
    };

        /*
    ---------------------------------------------------------------
    | Create Product
    ---------------------------------------------------------------
    */

    const handleCreateProduct = async () => {

        if (
            !productForm.productName ||
            !productForm.description ||
            !productForm.imageUrl ||
            !productForm.price ||
            !productForm.quantity ||
            !productForm.categoryId
        ) {

            toast.error(
                "All product fields are required"
            );

            return;
        }

        try {
                if (editingProductId) {

                await api.put(
                    `/admin/products/${editingProductId}`,
                    {
                        productName:
                            productForm.productName,

                        description:
                            productForm.description,

                        imageUrl:
                            productForm.imageUrl,

                        price:
                            Number(productForm.price),

                        quantity:
                            Number(productForm.quantity),

                        categoryId:
                            Number(productForm.categoryId)
                    }
                );

                toast.success(
                    "Product updated successfully"
                );

            } else {

                await api.post(
                    "/admin/products",
                    {
                        productName:
                            productForm.productName,

                        description:
                            productForm.description,

                        imageUrl:
                            productForm.imageUrl,

                        price:
                            Number(productForm.price),

                        quantity:
                            Number(productForm.quantity),

                        categoryId:
                            Number(productForm.categoryId)
                    }
                );

                toast.success(
                    "Product created successfully"
                );
            }
                    

            await fetchProducts();

            setProductForm({

                productName: "",

                description: "",

                imageUrl: "",

                price: "",

                quantity: "",

                categoryId: ""
            });
            setEditingProductId(null);
            setIsCreateProductOpen(false);

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to create product"
            );
        }
    };

        /*
    ---------------------------------------------------------------
    | Image Upload
    ---------------------------------------------------------------
    */

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

    /*
    ---------------------------------------------------------------
    | Open Edit Product Dialog
    ---------------------------------------------------------------
    */

    const handleEditProduct = (product) => {

        setEditingProductId(
            product.productId
        );

        setProductForm({

            productName:
                product.productName,

            description:
                product.description,

            imageUrl:
                product.imageUrl,

            price:
                product.price,

            quantity:
                product.quantity,

            categoryId:
            String(product.categoryId)
        });
        console.log(product);
        setIsCreateProductOpen(true);
    };
    /*
    ---------------------------------------------------------------
    | Product Table Columns
    ---------------------------------------------------------------
    */

    const columns = [

        {
            field: "image",
            headerName: "Image",
            width: isMobile ? 70 : 120,

            renderCell: (params) => (

                <img
                    src={params.row.imageUrl}
                    alt={params.row.productName}
                    className={`${isMobile ? "w-10 h-10" : "w-14 h-14"} object-cover rounded`}
                />
            )
        },

        {
            field: "productName",
            headerName: "Product Name",
            minWidth: isMobile ? 120 : 200,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                    {params.row.productName}
                </span>
            ),
        },

        {
            field: "price",
            headerName: "Price",
            width: isMobile ? 80 : 120,

            renderCell: (params) => (

                <span className="font-bold text-green-700">
                    ${params.row.price}
                </span>
            )
        },

        ...(!isMobile ? [{
            field: "quantity",
            headerName: "Stock",
            width: 100
        }] : []),

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 150 : 220,

            renderCell: (params) => (

                <div className="flex gap-2 mt-2">

                    <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        sx={{ minWidth: isMobile ? 40 : 60, fontSize: isMobile ? "10px" : "13px" }}
                        onClick={() =>
                            handleEditProduct(
                                params.row
                            )
                        }
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ minWidth: isMobile ? 50 : 70, fontSize: isMobile ? "10px" : "13px" }}
                        onClick={() =>
                            handleDeleteProduct(
                                params.row.productId
                            )
                        }
                    >
                        Delete
                    </Button>

                </div>
            )
        }
    ];

    /*
    ---------------------------------------------------------------
    | Category Table Columns
    ---------------------------------------------------------------
    */

    const categoryColumns = [

        ...(!isMobile ? [{
            field: "categoryId",
            headerName: "ID",
            width: 80
        }] : []),

        {
            field: "categoryName",
            headerName: "Category Name",
            minWidth: 150,
            flex: 1
        },

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 150 : 220,

            renderCell: (params) => (

                <div className="flex gap-2 mt-2">

                    <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        sx={{ minWidth: isMobile ? 40 : 60, fontSize: isMobile ? "10px" : "13px" }}
                        onClick={() =>
                            openEditCategoryDialog(
                                params.row
                            )
                        }
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ minWidth: isMobile ? 50 : 70, fontSize: isMobile ? "10px" : "13px" }}
                        onClick={() =>
                            handleDeleteCategory(
                                params.row.categoryId
                            )
                        }
                    >
                        Delete
                    </Button>

                </div>
            )
        }
    ];

    /*
    ---------------------------------------------------------------
    | Loading Screen
    ---------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="min-h-screen flex flex-col justify-center items-center">

                <Loader />

                <p className="text-2xl font-semibold mt-4">
                    Loading admin dashboard...
                </p>

            </div>
        );
    }

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen">

            {/* Dashboard Header */}
            <div className="mb-8 md:mb-12">

                <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>

                <p className="text-base md:text-xl text-gray-600 mt-2 md:mt-4">
                    Platform Management Overview
                </p>

            </div>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-14">

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm md:text-lg text-gray-500">Products</p>
                            <h2 className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">{products.length}</h2>
                        </div>
                        <FaBoxOpen className="text-3xl md:text-5xl text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm md:text-lg text-gray-500">Categories</p>
                            <h2 className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">{categories.length}</h2>
                        </div>
                        <FaTags className="text-3xl md:text-5xl text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm md:text-lg text-gray-500">Orders</p>
                            <h2 className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">{orders.length}</h2>
                        </div>
                        <FaShoppingCart className="text-3xl md:text-5xl text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm md:text-lg text-gray-500">Users</p>
                            <h2 className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">{users.length}</h2>
                        </div>
                        <FaUsers className="text-3xl md:text-5xl text-purple-600" />
                    </div>
                </div>

            </div>

            {/* Quick Actions */}
            <div>

                <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-gray-900">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">

                    <Button variant="contained" color="primary" size="large"
                        sx={{ py: { xs: 1.5, md: 2 }, fontSize: { xs: "0.75rem", md: "0.95rem" } }}
                        onClick={() => navigate("/admin/products")}>
                        Manage Products
                    </Button>

                    <Button variant="contained" color="success" size="large"
                        sx={{ py: { xs: 1.5, md: 2 }, fontSize: { xs: "0.75rem", md: "0.95rem" } }}
                        onClick={() => navigate("/admin/categories")}>
                        Manage Categories
                    </Button>

                    <Button variant="contained" color="warning" size="large"
                        sx={{ py: { xs: 1.5, md: 2 }, fontSize: { xs: "0.75rem", md: "0.95rem" } }}
                        onClick={() => navigate("/admin/orders")}>
                        Manage Orders
                    </Button>

                    <Button variant="contained" size="large"
                        sx={{ py: { xs: 1.5, md: 2 }, fontSize: { xs: "0.75rem", md: "0.95rem" }, backgroundColor: "#9333ea", "&:hover": { backgroundColor: "#7e22ce" } }}
                        onClick={() => navigate("/admin/users")}>
                        Manage Users
                    </Button>

                </div>

            </div>

            {/* Admin Products Section */}
            <div className="mt-8 md:mt-16">

                <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-gray-900">
                    All Products
                </h2>

                <div
                    className="bg-white rounded-xl shadow overflow-x-auto min-w-0"
                    style={{ height: isMobile ? 450 : 600, width: "100%" }}
                >

                    <DataGrid
                        rows={products}
                        columns={columns}
                        getRowId={(row) => row.productId}
                        getRowHeight={() => "auto"}
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5
                                }
                            }
                        }}
                        sx={{
                            "& .MuiDataGrid-columnHeaderTitle": {
                                fontWeight: "bold",
                                fontSize: isMobile ? "12px" : "14px"
                            },
                            "& .MuiDataGrid-cell": {
                                fontSize: isMobile ? "12px" : "14px",
                                padding: isMobile ? "4px 6px" : "8px 10px"
                            }
                        }}
                    />

                </div>

            </div>

            {/* ── Create / Edit Product Dialog ── */}
            <MuiDialog
                open={isCreateProductOpen}
                onClose={() => {
                    setIsCreateProductOpen(false);
                    setEditingProductId(null);
                    setProductForm({ productName: "", description: "", imageUrl: "", price: "", quantity: "", categoryId: "" });
                }}
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
                                onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
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
                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
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
                                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                            />
                        </Grid>

                        {/* Category */}
                        <Grid item xs={12} sx={{ width: "70%" }}>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    label="Category"
                                    value={productForm.categoryId}
                                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                    MenuProps={{
                                        PaperProps: {
                                            style: { maxHeight: 240, overflow: "auto" },
                                        },
                                        sx: {
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
                                id="dashboardProductImageInput"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                                onClick={() => document.getElementById("dashboardProductImageInput").click()}
                                sx={{ height: "40px" }}
                            >
                                {productForm.imageUrl ? "Change Image" : "Upload Image"}
                            </Button>
                        </Grid>

                        {/* Image preview */}
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
                                        style={{ maxWidth: "100%", maxHeight: 80, objectFit: "contain", display: "block" }}
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
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => {
                            setIsCreateProductOpen(false);
                            setEditingProductId(null);
                            setProductForm({ productName: "", description: "", imageUrl: "", price: "", quantity: "", categoryId: "" });
                        }}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateProduct}
                        variant="contained"
                        color="primary"
                    >
                        {editingProductId ? "Update Product" : "Create Product"}
                    </Button>
                </DialogActions>
            </MuiDialog>

        </div>
    );
};

export default AdminDashboardPage;