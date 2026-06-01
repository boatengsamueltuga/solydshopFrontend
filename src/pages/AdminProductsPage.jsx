import { useEffect, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import { Button } from "@mui/material";

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
                "Failed to load products"
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
                "Failed to load categories"
            );
        }
    };

    useEffect(() => {

        fetchProducts();

        fetchCategories();

    }, []);

    const handleDeleteProduct = async (productId) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
        return;
    }

    try {

        await api.delete(
            `/admin/products/${productId}`
        );

        toast.success(
            "Product deleted successfully"
        );

        fetchProducts();

    } catch (error) {

        console.log(error);

        toast.error(
            "Failed to delete product"
        );
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
        width: isMobile ? 130 : 220,

        renderCell: (params) => (

            <div className="flex gap-1 items-center">

                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{
                        minWidth: isMobile ? 40 : 60,
                        fontSize: isMobile ? "10px" : "11px",
                        padding: isMobile ? "3px 6px" : "4px 8px"
                    }}
                    onClick={() =>
                        handleViewProduct(
                            params.row
                        )
                    }
                >
                    View
                </Button>

                <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    sx={{
                        minWidth: isMobile ? 40 : 60,
                        fontSize: isMobile ? "10px" : "11px",
                        padding: isMobile ? "3px 6px" : "4px 8px"
                    }}
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
                    sx={{
                        minWidth: isMobile ? 40 : 70,
                        fontSize: isMobile ? "10px" : "11px",
                        padding: isMobile ? "3px 6px" : "4px 8px"
                    }}
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

    <div className="p-4 md:p-10 bg-gray-100 min-h-screen">
       <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">

           <h1 className="text-3xl md:text-5xl font-bold">
                Product Management
            </h1>

            <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() =>
                    setIsCreateProductOpen(true)
                }
            >
                Create Product
            </Button>

        </div>

            <div
            className="bg-white rounded-xl shadow overflow-x-auto"
            style={{
                height: isMobile ? 450 : 600,
                width: "100%"
            }}
         >

           <DataGrid
                rows={products}
                columns={columns}
                disableRowSelectionOnClick
                getRowId={(row) => row.productId}
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
                        fontSize: isMobile ? "12px" : "16px"
                    },
                    "& .MuiDataGrid-cell": {
                        fontSize: isMobile ? "12px" : "14px",
                        padding: isMobile ? "4px 6px" : "8px 10px"
                    }
                }}
            />

        </div>
{/* Create Product Dialog */}
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

                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/40" />

                {/* Modal Container */}
                <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">

                    <DialogPanel className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

                        <DialogTitle className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">

                            {
                                    editingProductId
                                        ? "Edit Product"
                                        : "Create Product"
                                }

                        </DialogTitle>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Product Name */}
                            <input
                                type="text"
                                placeholder="Product Name"
                                value={productForm.productName}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        productName: e.target.value
                                    })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            />

                            {/* Price */}
                            <input
                                type="number"
                                placeholder="Price"
                                value={productForm.price}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        price: e.target.value
                                    })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            />

                            {/* Quantity */}
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={productForm.quantity}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        quantity: e.target.value
                                    })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            />

                           {/* Upload Product Image */}
                            <div>

                                <input
                                    type="file"
                                    id="productImageInput"
                                    hidden
                                    accept="image/*"
                                    onChange={async (e) => {

                                        const file = e.target.files[0];

                                        if (!file) {

                                            return;
                                        }

                                        try {

                                            const formData =
                                                new FormData();

                                            formData.append(
                                                "file",
                                                file
                                            );

                                            const response =
                                                await api.post(
                                                    "/upload",
                                                    formData,
                                                    {
                                                        headers: {
                                                            "X-XSRF-TOKEN":
                                                                document.cookie
                                                                    .split("; ")
                                                                    .find(row =>
                                                                        row.startsWith(
                                                                            "XSRF-TOKEN="
                                                                        )
                                                                    )
                                                                    ?.split("=")[1]
                                                        }
                                                    }
                                                );

                                            const imageUrl =
                                                response.data;

                                            setProductForm({

                                                ...productForm,

                                                imageUrl
                                            });

                                            toast.success(
                                                "Image uploaded successfully"
                                            );

                                        } catch (error) {

                                            console.log(error);

                                            toast.error(
                                                "Image upload failed"
                                            );
                                        }
                                    }}
                                />

                                <button
                                    type="button"
                                    className="border border-gray-300 rounded-lg p-4 bg-gray-100 hover:bg-gray-200 text-left w-full"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                "productImageInput"
                                            )
                                            .click()
                                    }
                                >
                                    Upload Product Image
                                </button>

                            </div>
                              {/* Uploaded Product Image Preview */}
                                    {
                                        productForm.imageUrl && (

                                            <div className="md:col-span-2 flex justify-center">

                                                <div className="w-72 h-48 border rounded-lg overflow-hidden bg-gray-100">

                                                    <img
                                                        src={productForm.imageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />

                                                </div>

                                            </div>
                                        )
                                    }
                            {/* Category Dropdown */}
                            <select
                                value={productForm.categoryId}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        categoryId: e.target.value
                                    })
                                }
                                className="border border-gray-300 rounded-lg p-4"
                            >

                                <option value="">
                                    Select Category
                                </option>

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

                        {/* Description */}
                        <textarea
                            placeholder="Product Description"
                            value={productForm.description}
                            onChange={(e) =>
                                setProductForm({
                                    ...productForm,
                                    description: e.target.value
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 h-32 sm:h-40"
                        />

                        {/* Dialog Actions */}
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
                               {
                                    editingProductId
                                        ? "Update Product"
                                        : "Create Product"
                                }
                            </button>

                        </div>

                    </DialogPanel>

                </div>

            </Dialog>
    </div>
);

};

export default AdminProductsPage;
