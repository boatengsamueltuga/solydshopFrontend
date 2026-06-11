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
    TextField,
    Tooltip,
} from "@mui/material";

import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../api/api";

import Loader from "../components/Loader";

import toast from "react-hot-toast";

const AdminCategoriesPage = () => {

    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);

    const [isCreateOpen,  setIsCreateOpen]  = useState(false);
    const [categoryName,  setCategoryName]  = useState("");

    const [isEditOpen,          setIsEditOpen]          = useState(false);
    const [selectedCategoryId,  setSelectedCategoryId]  = useState(null);
    const [editCategoryName,    setEditCategoryName]    = useState("");

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete,  setCategoryToDelete]  = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchCategories = async () => {
        try {
            const response = await api.get("/public/categories?pageSize=1000");
            setCategories(response.data.content);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleDeleteCategory = (category) => {
        setCategoryToDelete(category);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/categories/${categoryToDelete.categoryId}`);
            toast.success(`"${categoryToDelete.categoryName}" deleted successfully.`);
            fetchCategories();
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete category.");
        } finally {
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            await api.post("/admin/categories", { categoryName });
            toast.success("Category created successfully.");
            fetchCategories();
            setCategoryName("");
            setIsCreateOpen(false);
        } catch (error) {
            console.log(error);
        }
    };

    const openEditDialog = (category) => {
        setSelectedCategoryId(category.categoryId);
        setEditCategoryName(category.categoryName);
        setIsEditOpen(true);
    };

    const handleUpdateCategory = async () => {
        if (!editCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            await api.put(`/admin/categories/${selectedCategoryId}`, { categoryName: editCategoryName });
            toast.success("Category updated successfully.");
            fetchCategories();
            setSelectedCategoryId(null);
            setEditCategoryName("");
            setIsEditOpen(false);
        } catch (error) {
            console.log(error);
        }
    };

    /*
    |----------------------------------------------------------
    | DataGrid Columns
    |----------------------------------------------------------
    */

    const columns = [

        ...(!isMobile ? [{
            field: "categoryId",
            headerName: "ID",
            width: 80,
        }] : []),

        {
            field: "categoryName",
            headerName: "Category Name",
            minWidth: 150,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                    {params.row.categoryName}
                </span>
            ),
        },

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 90 : 120,
            renderCell: (params) => (
                <div className="flex gap-1 items-center h-full">

                    <Tooltip title="Edit category" arrow>
                        <IconButton size="small" color="warning" onClick={() => openEditDialog(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete category" arrow>
                        <IconButton size="small" color="error" onClick={() => handleDeleteCategory(params.row)}>
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
                <p className="text-2xl font-semibold mt-4">Loading categories...</p>
            </div>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-10">

                <h1 className="text-3xl md:text-5xl font-bold">
                    Category Management
                </h1>

                <Button
                    variant="contained"
                    color="success"
                    sx={{ alignSelf: "flex-start", width: "fit-content" }}
                    onClick={() => setIsCreateOpen(true)}
                >
                    Create Category
                </Button>

            </div>

            <div
                className="bg-white rounded-xl shadow overflow-x-auto min-w-0"
                style={{ height: isMobile ? 420 : 500, width: "100%" }}
            >
                <DataGrid
                    rows={categories}
                    columns={columns}
                    getRowId={(row) => row.categoryId}
                    getRowHeight={() => "auto"}
                    disableRowSelectionOnClick
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    sx={{
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            fontSize: isMobile ? "12px" : "14px",
                        },
                        "& .MuiDataGrid-cell": {
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "4px 6px" : "8px 10px",
                        },
                    }}
                />
            </div>

            {/* ── Create Category Dialog ── */}
            <MuiDialog
                open={isCreateOpen}
                onClose={() => { setCategoryName(""); setIsCreateOpen(false); }}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
                    Create Category
                </MuiDialogTitle>

                <DialogContent sx={{ pt: 3, overflow: "visible" }}>
                    <TextField
                        label="Category Name"
                        fullWidth
                        autoFocus
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => { setCategoryName(""); setIsCreateOpen(false); }}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleCreateCategory} variant="contained" color="success">
                        Create
                    </Button>
                </DialogActions>
            </MuiDialog>

            {/* ── Edit Category Dialog ── */}
            <MuiDialog
                open={isEditOpen}
                onClose={() => { setSelectedCategoryId(null); setEditCategoryName(""); setIsEditOpen(false); }}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
                    Edit Category
                </MuiDialogTitle>

                <DialogContent sx={{ pt: 3, overflow: "visible" }}>
                    <TextField
                        label="Category Name"
                        fullWidth
                        autoFocus
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory()}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => { setSelectedCategoryId(null); setEditCategoryName(""); setIsEditOpen(false); }}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateCategory} variant="contained" color="warning">
                        Update
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
                    Delete Category
                </MuiDialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete{" "}
                        <strong>{categoryToDelete?.categoryName}</strong>?
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

export default AdminCategoriesPage;
