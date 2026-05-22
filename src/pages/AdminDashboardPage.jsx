import { useEffect, useState } from "react";

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
    Button
} from "@mui/material";

import {
    Dialog,
    DialogPanel,
    DialogTitle
} from "@headlessui/react";

import api from "../api/api";

import Loader from "../components/Loader";

import toast from "react-hot-toast";

const AdminDashboardPage = () => {

    /*
    ---------------------------------------------------------------
    | State Management
    ---------------------------------------------------------------
    */

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

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

    useEffect(() => {

        fetchProducts();

        fetchCategories();

    }, []);

    /*
    ---------------------------------------------------------------
    | Delete Product
    ---------------------------------------------------------------
    */

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

    /*
    ---------------------------------------------------------------
    | Delete Category
    ---------------------------------------------------------------
    */

    const handleDeleteCategory = async (categoryId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) {

            return;
        }

        try {

            await api.delete(
                `/admin/categories/${categoryId}`
            );

            toast.success(
                "Category deleted successfully"
            );

            fetchCategories();

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to delete category"
            );
        }
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

            /*
            -------------------------------------------------------
            | Refresh Categories
            -------------------------------------------------------
            */

            fetchCategories();

            /*
            -------------------------------------------------------
            | Reset Form
            -------------------------------------------------------
            */

            setCategoryName("");

            /*
            -------------------------------------------------------
            | Close Dialog
            -------------------------------------------------------
            */

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
    | Product Table Columns
    ---------------------------------------------------------------
    */

    const columns = [

        {
            field: "image",
            headerName: "Image",
            width: 120,

            renderCell: (params) => (

                <img
                    src={params.row.imageUrl}
                    alt={params.row.productName}
                    className="w-16 h-16 object-cover rounded"
                />
            )
        },

        {
            field: "productName",
            headerName: "Product Name",
            width: 250
        },

        {
            field: "price",
            headerName: "Price",
            width: 120,

            renderCell: (params) => (

                <span className="font-bold text-green-700">
                    ${params.row.price}
                </span>
            )
        },

        {
            field: "quantity",
            headerName: "Stock",
            width: 120
        },

        {
            field: "actions",
            headerName: "Actions",
            width: 250,

            renderCell: (params) => (

                <div className="flex gap-3 mt-2">

                    <Button
                        variant="contained"
                        color="warning"
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
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

        {
            field: "categoryId",
            headerName: "ID",
            width: 120
        },

        {
            field: "categoryName",
            headerName: "Category Name",
            width: 300
        },

        {
            field: "actions",
            headerName: "Actions",
            width: 250,

            renderCell: (params) => (

                <div className="flex gap-3 mt-2">

                    <Button
                        variant="contained"
                        color="warning"
                    >
                        Edit
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
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

        <div className="p-10 bg-gray-100 min-h-screen">

            {/* Dashboard Header */}
            <div className="mb-12">

                <h1 className="text-5xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>

                <p className="text-xl text-gray-600 mt-4">
                    Platform Management Overview
                </p>

            </div>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">

                {/* Products Card */}
                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-lg text-gray-500">
                                Products
                            </p>

                            <h2 className="text-4xl font-bold mt-3">
                                {products.length}
                            </h2>

                        </div>

                        <FaBoxOpen className="text-5xl text-blue-600" />

                    </div>

                </div>

                {/* Categories Card */}
                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-lg text-gray-500">
                                Categories
                            </p>

                            <h2 className="text-4xl font-bold mt-3">
                                {categories.length}
                            </h2>

                        </div>

                        <FaTags className="text-5xl text-green-600" />

                    </div>

                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-lg text-gray-500">
                                Orders
                            </p>

                            <h2 className="text-4xl font-bold mt-3">
                                0
                            </h2>

                        </div>

                        <FaShoppingCart className="text-5xl text-yellow-500" />

                    </div>

                </div>

                {/* Users Card */}
                <div className="bg-white rounded-xl shadow p-6">

                    <div className="flex justify-between items-center">

                        <div>

                            <p className="text-lg text-gray-500">
                                Users
                            </p>

                            <h2 className="text-4xl font-bold mt-3">
                                0
                            </h2>

                        </div>

                        <FaUsers className="text-5xl text-purple-600" />

                    </div>

                </div>

            </div>

            {/* Quick Actions */}
            <div>

                <h2 className="text-4xl font-bold mb-8 text-gray-900">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Manage Products */}
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl font-bold text-xl shadow">

                        Manage Products

                    </button>

                    {/* Create Category */}
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() =>
                            setIsCreateCategoryOpen(true)
                        }
                    >
                        Create Category
                    </Button>

                    {/* Manage Orders */}
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-xl font-bold text-xl shadow">

                        Manage Orders

                    </button>

                    {/* Manage Users */}
                    <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl font-bold text-xl shadow">

                        Manage Users

                    </button>

                </div>

            </div>

            {/* Admin Products Section */}
            <div className="mt-16">

                <h2 className="text-4xl font-bold mb-8 text-gray-900">
                    All Products
                </h2>

                <div
                    className="bg-white rounded-xl shadow"
                    style={{ height: 600, width: "100%" }}
                >

                    <DataGrid
                        rows={products}
                        columns={columns}
                        getRowId={(row) => row.productId}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5
                                }
                            }
                        }}
                    />

                </div>

            </div>

            {/* Admin Categories Section */}
            <div className="mt-20">

                <h2 className="text-4xl font-bold mb-8 text-gray-900">
                    All Categories
                </h2>

                <div
                    className="bg-white rounded-xl shadow"
                    style={{ height: 450, width: "100%" }}
                >

                    <DataGrid
                        rows={categories}
                        columns={categoryColumns}
                        getRowId={(row) => row.categoryId}
                        pageSizeOptions={[5, 10]}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5
                                }
                            }
                        }}
                    />

                </div>

            </div>

            {/* Create Category Dialog */}
            <Dialog
                open={isCreateCategoryOpen}
                onClose={() => {

                    setCategoryName("");

                    setIsCreateCategoryOpen(false);
                }}
                className="relative z-50"
            >

                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/40" />

                {/* Modal Container */}
                <div className="fixed inset-0 flex items-center justify-center p-4">

                    <DialogPanel className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">

                        <DialogTitle className="text-3xl font-bold mb-6">

                            Create Category

                        </DialogTitle>

                        {/* Category Name Input */}
                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={categoryName}
                            onChange={(e) =>
                                setCategoryName(
                                    e.target.value
                                )
                            }
                            className="w-full border border-gray-300 rounded-lg p-4 text-lg mb-6"
                        />

                        {/* Dialog Actions */}
                        <div className="flex justify-end gap-4">

                            <button
                                 onClick={() => {

                                    setCategoryName("");

                                    setIsCreateCategoryOpen(false);
                                }}
                                className="px-6 py-3 rounded-lg bg-gray-300 font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateCategory}
                                className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold"
                            >
                                Create
                            </button>

                        </div>

                    </DialogPanel>

                </div>

            </Dialog>

        </div>
    );
};

export default AdminDashboardPage;