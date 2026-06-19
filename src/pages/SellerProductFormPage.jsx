import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import api from "../api/api";
import toast from "react-hot-toast";

import SellerLayout from "../components/layouts/SellerLayout";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

const EMPTY_FORM = {
    productName: "",
    description: "",
    modelNumber: "",
    partNumber:  "",
    imageUrl:    "",
    price:       "",
    quantity:    "",
    categoryId:  "",
};

const SellerProductFormPage = () => {

    const { id }      = useParams();
    const navigate    = useNavigate();
    const location    = useLocation();
    const isEdit      = Boolean(id);

    const [formData,    setFormData]    = useState(EMPTY_FORM);
    const [categories,  setCategories]  = useState([]);
    const [loading,     setLoading]     = useState(isEdit);
    const [saving,      setSaving]      = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const getXsrfToken = () =>
        document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

    /* ── Load categories ── */
    useEffect(() => {
        api.get("/public/categories?pageSize=1000")
            .then(r => setCategories(r.data.content ?? []))
            .catch(() => {});
    }, []);

    /* ── Load product for editing ── */
    useEffect(() => {
        if (!isEdit) return;
        const stateProduct = location.state?.product;
        if (stateProduct) {
            populateForm(stateProduct);
            setLoading(false);
        } else {
            api.get(`/public/products/${id}`)
                .then(r => { populateForm(r.data); setLoading(false); })
                .catch(() => { toast.error("Product not found"); navigate("/seller/dashboard"); });
        }
    }, [id]);

    const populateForm = (p) => {
        setFormData({
            productName: p.productName || "",
            description: p.description || "",
            modelNumber: p.modelNumber || "",
            partNumber:  p.partNumber  || "",
            imageUrl:    p.imageUrl    || "",
            price:       p.price       || "",
            quantity:    p.quantity    || "",
            categoryId:  String(p.categoryId || ""),
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "description" && value.length > 1000) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let imageUrl = formData.imageUrl;
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append("file", selectedFile);
                const uploadRes = await api.post("/upload", uploadData, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });
                imageUrl = uploadRes.data;
            }

            const payload = {
                productName: formData.productName,
                description: formData.description,
                modelNumber: formData.modelNumber || null,
                partNumber:  formData.partNumber  || null,
                imageUrl,
                price:      Number(formData.price),
                quantity:   Number(formData.quantity),
                categoryId: Number(formData.categoryId),
            };

            if (isEdit) {
                await api.put(`/seller/products/${id}`, payload, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });
                toast.success("Product updated");
            } else {
                await api.post("/seller/products", payload, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });
                toast.success("Product created");
            }

            navigate("/seller/dashboard");

        } catch {
            toast.error("Failed to save product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const previewSrc = selectedFile
        ? URL.createObjectURL(selectedFile)
        : formData.imageUrl || null;

    const pageTitle = isEdit ? "Edit Product" : "Add Product";

    /* ── Loading state ── */
    if (loading) {
        return (
            <SellerLayout title={pageTitle}>
                <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-16)" }}>
                    <CircularProgress sx={{ color: "var(--accent)" }} />
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout title={pageTitle}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: "var(--space-6)" }}>
                <button
                    onClick={() => navigate("/seller/dashboard")}
                    style={{
                        display: "flex", alignItems: "center", gap: "var(--space-2)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "13px",
                        padding: 0, marginBottom: "var(--space-4)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                >
                    ← Back to Dashboard
                </button>

                <h1 style={{
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: "var(--text-2xl)", color: "var(--text)",
                    margin: 0, letterSpacing: "-0.01em",
                }}>
                    {isEdit ? "EDIT PRODUCT" : "ADD PRODUCT"}
                </h1>
                {isEdit && (
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-3)", marginTop: "var(--space-1)" }}>
                        Product #{id}
                    </p>
                )}
            </div>

            {/* ── Form panel ── */}
            <div style={{
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderTop:    `3px solid ${isEdit ? "oklch(0.78 0.17 75)" : "var(--accent)"}`,
                borderRadius: "var(--r-md)",
                padding:      "var(--space-6)",
                maxWidth:     "760px",
            }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: "var(--space-4)",
                    }}
                >

                    {/* Product Name */}
                    <TextField
                        label="Product Name"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        required fullWidth size="small"
                        disabled={saving}
                    />

                    {/* Price */}
                    <TextField
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required fullWidth size="small"
                        disabled={saving}
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />

                    {/* Quantity */}
                    <TextField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        required fullWidth size="small"
                        disabled={saving}
                    />

                    {/* Category */}
                    <FormControl fullWidth size="small" disabled={saving}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="categoryId"
                            value={formData.categoryId}
                            label="Category"
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>Select a category</em></MenuItem>
                            {categories.map(cat => (
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
                        fullWidth size="small"
                        disabled={saving}
                        placeholder="e.g. CAT 320D"
                    />

                    {/* Part Number */}
                    <TextField
                        label="Part Number"
                        name="partNumber"
                        value={formData.partNumber}
                        onChange={handleChange}
                        fullWidth size="small"
                        disabled={saving}
                        placeholder="e.g. 3066T-1234"
                    />

                    {/* Image Upload — full width */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                disabled={saving}
                                size="small"
                                sx={{ textTransform: "none", fontWeight: 600 }}
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
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <div style={{
                                width: "200px", height: "150px",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--r-md)",
                                overflow: "hidden",
                            }}>
                                <img src={previewSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>
                        </Box>
                    )}

                    {/* Description — full width */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline rows={3}
                            fullWidth size="small"
                            disabled={saving}
                            inputProps={{ maxLength: 1000 }}
                            helperText={`${formData.description.length} / 1000`}
                            FormHelperTextProps={{
                                sx: {
                                    textAlign: "right",
                                    color: formData.description.length >= 900 ? "error.main" : "text.disabled",
                                },
                            }}
                        />
                    </Box>

                    {/* Actions — full width */}
                    <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={() => navigate("/seller/dashboard")}
                            disabled={saving}
                            style={{
                                padding: "var(--space-2) var(--space-5)",
                                background: "none", border: "1px solid var(--border)",
                                borderRadius: "var(--r-md)", color: "var(--text-2)",
                                fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 500,
                                cursor: saving ? "not-allowed" : "pointer",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                display: "flex", alignItems: "center", gap: "var(--space-2)",
                                padding: "var(--space-2) var(--space-6)",
                                background: saving ? "var(--border)" : "var(--accent)",
                                border: "none", borderRadius: "var(--r-md)",
                                color: "var(--bg)", fontFamily: "var(--font-body)",
                                fontSize: "14px", fontWeight: 700,
                                cursor: saving ? "not-allowed" : "pointer",
                            }}
                        >
                            {saving && <CircularProgress size={14} sx={{ color: "var(--bg)" }} />}
                            {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
                        </button>
                    </Box>

                </Box>
            </div>

        </SellerLayout>
    );
};

export default SellerProductFormPage;
