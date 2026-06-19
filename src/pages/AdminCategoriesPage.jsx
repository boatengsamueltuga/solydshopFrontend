import { useEffect, useState } from "react";

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
import AddIcon    from "@mui/icons-material/Add";

import api        from "../api/api";
import toast      from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";

/* ── CategoryCard ── */
const CategoryCard = ({ category, onEdit, onDelete }) => (
    <div
        style={{
            background:    "var(--surface-mid)",
            border:        "1px solid var(--border)",
            borderRadius:  "var(--r-md)",
            padding:       "var(--space-4) var(--space-5)",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"space-between",
            gap:           "var(--space-3)",
            transition:    "border-color var(--duration-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-mid)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
        <div>
            <p style={{
                color:       "var(--text)",
                fontWeight:  600,
                fontSize:    "14px",
                marginBottom:"2px",
                lineHeight:  1.3,
                wordBreak:   "break-word",
            }}>
                {category.categoryName}
            </p>
            <p style={{
                color:      "var(--text-4)",
                fontSize:   "11px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.03em",
            }}>
                #{category.categoryId}
            </p>
        </div>

        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            <Tooltip title="Edit" arrow>
                <IconButton
                    size="small"
                    onClick={() => onEdit(category)}
                    sx={{ color: "var(--warning)", "&:hover": { background: "var(--warning-subtle)" } }}
                >
                    <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
                <IconButton
                    size="small"
                    onClick={() => onDelete(category)}
                    sx={{ color: "var(--error)", "&:hover": { background: "var(--error-subtle)" } }}
                >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Tooltip>
        </div>
    </div>
);

/* ── AdminCategoriesPage ── */
const AdminCategoriesPage = () => {

    const [categories,       setCategories]       = useState([]);
    const [loading,          setLoading]          = useState(true);

    const [isCreateOpen,     setIsCreateOpen]     = useState(false);
    const [categoryName,     setCategoryName]     = useState("");

    const [isEditOpen,       setIsEditOpen]       = useState(false);
    const [selectedCatId,    setSelectedCatId]    = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete,  setCategoryToDelete]  = useState(null);

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchCategories = async () => {
        try {
            const res = await api.get("/public/categories?pageSize=1000");
            setCategories(res.data.content);
        } catch (err) {
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
        } catch (err) {
            toast.error("Failed to create category.");
        }
    };

    const openEditDialog = (category) => {
        setSelectedCatId(category.categoryId);
        setEditCategoryName(category.categoryName);
        setIsEditOpen(true);
    };

    const handleUpdateCategory = async () => {
        if (!editCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            await api.put(`/admin/categories/${selectedCatId}`, { categoryName: editCategoryName });
            toast.success("Category updated successfully.");
            fetchCategories();
            setSelectedCatId(null);
            setEditCategoryName("");
            setIsEditOpen(false);
        } catch (err) {
            toast.error("Failed to update category.");
        }
    };

    const handleDeleteCategory = (category) => {
        setCategoryToDelete(category);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/categories/${categoryToDelete.categoryId}`);
            toast.success(`"${categoryToDelete.categoryName}" deleted successfully.`);
            fetchCategories();
        } catch (err) {
            toast.error("Failed to delete category.");
        } finally {
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
        }
    };

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (
        <AdminLayout title="Categories">

            {/* ── Toolbar ── */}
            <div style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "space-between",
                gap:            "var(--space-4)",
                marginBottom:   "var(--space-4)",
                flexWrap:       "wrap",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span style={{ color: "var(--text-3)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                        Total
                    </span>
                    <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "14px" }}>
                        {loading ? "—" : categories.length}
                    </span>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => { setCategoryName(""); setIsCreateOpen(true); }}
                    sx={{ fontWeight: 700 }}
                >
                    Create Category
                </Button>
            </div>

            {/* ── Card Grid ── */}
            {loading ? (
                <p style={{ color: "var(--text-3)", fontSize: "14px" }}>Loading categories…</p>
            ) : categories.length === 0 ? (
                <div style={{
                    textAlign:  "center",
                    padding:    "var(--space-16)",
                    color:      "var(--text-3)",
                    background: "var(--surface-mid)",
                    border:     "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                }}>
                    <p style={{ fontSize: "14px" }}>No categories yet. Create the first one.</p>
                </div>
            ) : (
                <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap:                 "var(--space-3)",
                }}>
                    {categories.map(cat => (
                        <CategoryCard
                            key={cat.categoryId}
                            category={cat}
                            onEdit={openEditDialog}
                            onDelete={handleDeleteCategory}
                        />
                    ))}
                </div>
            )}

            {/* ── Create Category Dialog ── */}
            <MuiDialog
                open={isCreateOpen}
                onClose={() => { setCategoryName(""); setIsCreateOpen(false); }}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", pb: 1 }}>Create Category</MuiDialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="Category Name"
                        fullWidth
                        autoFocus
                        size="small"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => { setCategoryName(""); setIsCreateOpen(false); }} variant="outlined" color="inherit" sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateCategory} variant="contained" color="primary" sx={{ textTransform: "none", fontWeight: 700 }}>
                        Create
                    </Button>
                </DialogActions>
            </MuiDialog>

            {/* ── Edit Category Dialog ── */}
            <MuiDialog
                open={isEditOpen}
                onClose={() => { setSelectedCatId(null); setEditCategoryName(""); setIsEditOpen(false); }}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", pb: 1 }}>Edit Category</MuiDialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="Category Name"
                        fullWidth
                        autoFocus
                        size="small"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory()}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => { setSelectedCatId(null); setEditCategoryName(""); setIsEditOpen(false); }}
                        variant="outlined"
                        color="inherit"
                        sx={{ textTransform: "none" }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateCategory} variant="contained" color="warning" sx={{ textTransform: "none", fontWeight: 700 }}>
                        Update
                    </Button>
                </DialogActions>
            </MuiDialog>

            {/* ── Delete Confirmation ── */}
            <MuiDialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <MuiDialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>Delete Category</MuiDialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{categoryToDelete?.categoryName}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined" color="inherit" sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ textTransform: "none", fontWeight: 700 }}>Delete</Button>
                </DialogActions>
            </MuiDialog>

        </AdminLayout>
    );
};

export default AdminCategoriesPage;
