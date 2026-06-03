import { useEffect, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import {
    Button,
    Dialog as MuiDialog,
    DialogTitle as MuiDialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Tooltip,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    Dialog,
    DialogPanel,
    DialogTitle
} from "@headlessui/react";

import api from "../api/api";

import Loader from "../components/Loader";

import toast from "react-hot-toast";

const AdminProductsPage = () => {

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isCreateProductOpen, setIsCreateProductOpen] =
        useState(false);

    const [editingProductId, setEditingProductId] =
        useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [isViewProductOpen, setIsViewProductOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Delete confirmation dialog state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [productForm, setProductForm] =
        useState({

            productName: "",

            description: "",

            imageUrl: "",

            price: "",

            quantity: "",

            categoryId: ""
        });

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
                "Unable to load products. Please refresh."
            );

        } finally {

            setLoading(false);
        }
    };

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
                "Unable to load categories. Please refresh."
            );
        }
    };

    useEffect(() => {

        fetchProducts();

        fetchCategories();

    }, []);

    // Open the delete confirmation dialog
    const handleDeleteProduct = (product) => {

        setProductToDelete(product);

        setDeleteConfirmOpen(true);
    };

    // Confirmed delete
    const confirmDelete = async () => {

        try {

            await api.delete(
                `/admin/products/${productToDelete.productId}`
            );

            toast.success(
                `"${productToDelete.productName}" has been deleted.`
            );

            fetchProducts();

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to delete product. Please try again."
            );

        } finally {

            setDeleteConfirmOpen(false);

            setProductToDelete(null);
        }
    };

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

        setIsCreateProductOpen(true);
    };

    const handleViewProduct = (product) => {

        setSelectedProduct(product);

        setIsViewProductOpen(true);
    };

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
                "Please fill in all required fields before saving."
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
                    `"${productForm.productName}" updated successfully.`
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
                    `"${productForm.productName}" added to the catalog.`
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
                editingProductId
                    ? "Failed to update product. Please try again."
                    : "Failed to create product. Please try again."
            );
        }
    };

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
            )
        },

        {
            field: "productName",
            headerName: "Product Name",
            minWidth: isMobile ? 120 : 220,
            flex: 1
        },

        ...(!isMobile ? [{
            field: "categoryName",
            headerName: "Category",
            minWidth: 180,
            flex: 1
        }] : []),

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
            width: 100,
        }] : []),

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 130 : 160,

            renderCell: (params) => (

                <div className="flex gap-1 items-center h-full">

                    <Tooltip title="View product" arrow>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewProduct(params.row)}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit product" arrow>
                        <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleEditProduct(params.row)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete product" arrow>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProduct(params.row)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                </div>
            )
        }

    ];

    if (loading) {

        return (

            <div className="min-h-screen flex flex-col justify-center items-center">

                <Loader />

                <p className="text-2xl font-semibold mt-4">
                    Loading products...
                </p>

            </div>
        );
    }

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen w-full overflow-x-hidden">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">

                <h1 className="text-3xl md:text-5xl font-bold">
                    Product Management
                </h1>

                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ alignSelf: { xs: "flex-start", md: "auto" } }}
                    onClick={() => setIsCreateProductOpen(true)}
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
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 5 }
                        }
                    }}
                    sx={{
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            fontSize: isMobile ? "12px" : "16px"
                        },
                        "& .MuiDataGrid-cell": {
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "4px 6px" : "8px 10px"
                        }
                    }}
                />

            </div>

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

                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>

                </DialogActions>

            </MuiDialog>

            {/* ── Create / Edit Product Dialog ── */}
            <Dialog
                open={isCreateProductOpen}
                onClose={() => {

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
                }}
                className="relative z-50"
            >

                <div className="fixed inset-0 bg-black/40" />

                <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">

                    <DialogPanel className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

                        <DialogTitle className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">
                            {editingProductId ? "Edit Product" : "Create Product"}
                        </DialogTitle>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <input
                                type="text"
                                placeholder="Product Name"
                                value={productForm.productName}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, productName: e.target.value })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            />

                            <input
                                type="number"
                                placeholder="Price"
                                value={productForm.price}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, price: e.target.value })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            />

                            <input
                                type="number"
                                placeholder="Quantity"
                                value={productForm.quantity}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, quantity: e.target.value })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            />

                            <div>

                                <input
                                    type="file"
                                    id="productImageInput"
                                    hidden
                                    accept="image/*"
                                    onChange={async (e) => {

                                        const file = e.target.files[0];

                                        if (!file) return;

                                        try {

                                            const formData = new FormData();

                                            formData.append("file", file);

                                            const response = await api.post(
                                                "/upload",
                                                formData,
                                                {
                                                    headers: {
                                                        "X-XSRF-TOKEN":
                                                            document.cookie
                                                                .split("; ")
                                                                .find(row => row.startsWith("XSRF-TOKEN="))
                                                                ?.split("=")[1]
                                                    }
                                                }
                                            );

                                            setProductForm({ ...productForm, imageUrl: response.data });

                                            toast.success("Image uploaded successfully.");

                                        } catch (error) {

                                            console.log(error);

                                            toast.error("Image upload failed. Please try again.");
                                        }
                                    }}
                                />

                                <button
                                    type="button"
                                    className="border border-gray-300 rounded-lg p-4 bg-gray-100 hover:bg-gray-200 text-left w-full"
                                    onClick={() =>
                                        document.getElementById("productImageInput").click()
                                    }
                                >
                                    Upload Product Image
                                </button>

                            </div>

                            {productForm.imageUrl && (

                                <div className="md:col-span-2 flex justify-center">

                                    <div className="w-72 h-48 border rounded-lg overflow-hidden bg-gray-100">

                                        <img
                                            src={productForm.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />

                                    </div>

                                </div>
                            )}

                            <select
                                value={productForm.categoryId}
                                onChange={(e) =>
                                    setProductForm({ ...productForm, categoryId: e.target.value })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            >

                                <option value="">Select Category</option>

                                {categories.map((category) => (

                                    <option
                                        key={category.categoryId}
                                        value={category.categoryId}
                                    >
                                        {category.categoryName}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <textarea
                            placeholder="Product Description"
                            value={productForm.description}
                            onChange={(e) =>
                                setProductForm({ ...productForm, description: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 h-32 sm:h-40"
                        />

                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">

                            <button
                                onClick={() => {

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
                                }}
                                className="px-6 py-3 rounded-lg bg-gray-300 font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateProduct}
                                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold"
                            >
                                {editingProductId ? "Update Product" : "Create Product"}
                            </button>

                        </div>

                    </DialogPanel>

                </div>

            </Dialog>

        </div>
    );
};

export default AdminProductsPage;
