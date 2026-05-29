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

const AdminCategoriesPage = () => {

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isCreateCategoryOpen, setIsCreateCategoryOpen] =
        useState(false);

    const [categoryName, setCategoryName] =
        useState("");

    const [isEditCategoryOpen, setIsEditCategoryOpen] =
        useState(false);

    const [selectedCategoryId, setSelectedCategoryId] =
        useState(null);

    const [editCategoryName, setEditCategoryName] =
        useState("");

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

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchCategories();

    }, []);

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

    const openEditCategoryDialog = (category) => {

        setSelectedCategoryId(
            category.categoryId
        );

        setEditCategoryName(
            category.categoryName
        );

        setIsEditCategoryOpen(true);
    };

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

    if (loading) {

        return (

            <div className="min-h-screen flex flex-col justify-center items-center">

                <Loader />

                <p className="text-2xl font-semibold mt-4">
                    Loading categories...
                </p>

            </div>
        );
    }

    return (

        <div className="p-10 bg-gray-100 min-h-screen">

            <div className="flex justify-between items-center mb-10">

                <h1 className="text-5xl font-bold">
                    Category Management
                </h1>

                <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                        setIsCreateCategoryOpen(true)
                    }
                >
                    Create Category
                </Button>

            </div>

            <div
                className="bg-white rounded-xl shadow"
                style={{
                    height: 500,
                    width: "100%"
                }}
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
            {/* Create Category Dialog */}
            <Dialog
                open={isCreateCategoryOpen}
                onClose={() => {

                    setCategoryName("");

                    setIsCreateCategoryOpen(false);
                }}
                className="relative z-50"
            >

                <div className="fixed inset-0 bg-black/40" />

                <div className="fixed inset-0 flex items-center justify-center p-4">

                    <DialogPanel className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">

                        <DialogTitle className="text-3xl font-bold mb-6">

                            Create Category

                        </DialogTitle>

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

            {/* Edit Category Dialog */}
            <Dialog
                open={isEditCategoryOpen}
                onClose={() => {

                    setSelectedCategoryId(null);

                    setEditCategoryName("");

                    setIsEditCategoryOpen(false);
                }}
                className="relative z-50"
            >

                <div className="fixed inset-0 bg-black/40" />

                <div className="fixed inset-0 flex items-center justify-center p-4">

                    <DialogPanel className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">

                        <DialogTitle className="text-3xl font-bold mb-6">

                            Edit Category

                        </DialogTitle>

                        <input
                            type="text"
                            placeholder="Enter category name"
                            value={editCategoryName}
                            onChange={(e) =>
                                setEditCategoryName(
                                    e.target.value
                                )
                            }
                            className="w-full border border-gray-300 rounded-lg p-4 text-lg mb-6"
                        />

                        <div className="flex justify-end gap-4">

                            <button
                                onClick={() => {

                                    setSelectedCategoryId(null);

                                    setEditCategoryName("");

                                    setIsEditCategoryOpen(false);
                                }}
                                className="px-6 py-3 rounded-lg bg-gray-300 font-semibold"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdateCategory}
                                className="px-6 py-3 rounded-lg bg-yellow-500 text-white font-semibold"
                            >
                                Update
                            </button>

                        </div>

                    </DialogPanel>

                </div>

            </Dialog>
        </div>
    );
};

export default AdminCategoriesPage;