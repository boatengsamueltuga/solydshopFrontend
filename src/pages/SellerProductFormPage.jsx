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
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const EMPTY_FORM = {
    productName: "",
    description: "",
    modelNumber: "",
    partNumber:  "",
    imageUrl:    "",
    image2Url:   "",
    image3Url:   "",
    image4Url:   "",
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
    const [saving,        setSaving]        = useState(false);
    const [selectedFile,  setSelectedFile]  = useState(null);
    const [selectedFile2, setSelectedFile2] = useState(null);
    const [selectedFile3, setSelectedFile3] = useState(null);
    const [selectedFile4, setSelectedFile4] = useState(null);

    const stateProduct     = location.state?.product;
    const isRejected       = isEdit && stateProduct?.status === "REJECTED";
    const rejectionReason  = stateProduct?.rejectionReason || null;

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
            image2Url:   p.image2Url   || "",
            image3Url:   p.image3Url   || "",
            image4Url:   p.image4Url   || "",
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

    const handleFileChange = (slot) => (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image must be 10 MB or smaller.");
            e.target.value = "";
            return;
        }
        const setters = [setSelectedFile, setSelectedFile2, setSelectedFile3, setSelectedFile4];
        setters[slot](file);
    };

    const uploadFile = async (file) => {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const res = await api.post("/upload", uploadData, {
            headers: { "X-XSRF-TOKEN": getXsrfToken() },
        });
        return res.data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const [imageUrl, image2Url, image3Url, image4Url] = await Promise.all([
                selectedFile  ? uploadFile(selectedFile)  : Promise.resolve(formData.imageUrl  || null),
                selectedFile2 ? uploadFile(selectedFile2) : Promise.resolve(formData.image2Url || null),
                selectedFile3 ? uploadFile(selectedFile3) : Promise.resolve(formData.image3Url || null),
                selectedFile4 ? uploadFile(selectedFile4) : Promise.resolve(formData.image4Url || null),
            ]);

            const payload = {
                productName: formData.productName,
                description: formData.description,
                modelNumber: formData.modelNumber || null,
                partNumber:  formData.partNumber  || null,
                imageUrl:    imageUrl  || null,
                image2Url:   image2Url || null,
                image3Url:   image3Url || null,
                image4Url:   image4Url || null,
                price:      Number(formData.price),
                quantity:   Number(formData.quantity),
                categoryId: Number(formData.categoryId),
            };

            if (isEdit) {
                await api.put(`/seller/products/${id}`, payload, {
                    headers: { "X-XSRF-TOKEN": getXsrfToken() },
                });
                toast.success(isRejected
                    ? "Product resubmitted — the admin will review it shortly"
                    : "Product updated");
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

    const previews = [
        selectedFile  ? URL.createObjectURL(selectedFile)  : formData.imageUrl  || null,
        selectedFile2 ? URL.createObjectURL(selectedFile2) : formData.image2Url || null,
        selectedFile3 ? URL.createObjectURL(selectedFile3) : formData.image3Url || null,
        selectedFile4 ? URL.createObjectURL(selectedFile4) : formData.image4Url || null,
    ];
    const imageFiles   = [selectedFile, selectedFile2, selectedFile3, selectedFile4];
    const imageSetters = [setSelectedFile, setSelectedFile2, setSelectedFile3, setSelectedFile4];

    const pageTitle = isRejected ? "Fix & Resubmit" : isEdit ? "Edit Product" : "Add Product";

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

            {/* ── Rejection reason banner ── */}
            {isRejected && (
                <Alert
                    severity="error"
                    sx={{ mb: 3, maxWidth: "760px", "& .MuiAlert-message": { width: "100%" } }}
                >
                    <AlertTitle sx={{ fontWeight: 700 }}>This product was rejected by an admin</AlertTitle>
                    {rejectionReason
                        ? <><strong>Reason:</strong> {rejectionReason}</>
                        : "No reason was provided."}
                    <p style={{ margin: "8px 0 0", fontSize: "13px", opacity: 0.85 }}>
                        Fix the issues above, then click <strong>Fix &amp; Resubmit</strong>.
                        Your product will automatically go back into the admin review queue.
                    </p>
                </Alert>
            )}

            {/* ── Form panel ── */}
            <div style={{
                background:   "var(--surface-mid)",
                border:       "1px solid var(--border)",
                borderTop:    `3px solid ${isEdit ? "var(--accent-lo)" : "var(--accent)"}`,
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

                    {/* Product Images — 4 slots, full width */}
                    <Box sx={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "var(--space-3)", fontFamily: "var(--font-body)" }}>
                            Product Images <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, opacity: 0.7 }}>(up to 4 angles)</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                                    {/* Preview box */}
                                    <div style={{
                                        width: "100%",
                                        aspectRatio: "1",
                                        border: `1px solid ${previews[i] ? "var(--border)" : "var(--border-subtle)"}`,
                                        borderRadius: "var(--r-md)",
                                        overflow: "hidden",
                                        background: previews[i] ? "#fff" : "var(--surface-high)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                    }}>
                                        {previews[i] ? (
                                            <img src={previews[i]} alt={`Angle ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }} />
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: 0.35 }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                                    <circle cx="8.5" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                                                    <path d="M2 15l5-5 4 4 3-3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
                                                    {i === 0 ? "Main" : `Angle ${i + 1}`}
                                                </span>
                                            </div>
                                        )}
                                        {/* Remove badge */}
                                        {(imageFiles[i] || (i === 0 ? formData.imageUrl : i === 1 ? formData.image2Url : i === 2 ? formData.image3Url : formData.image4Url)) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    imageSetters[i](null);
                                                    const key = ["imageUrl","image2Url","image3Url","image4Url"][i];
                                                    setFormData(f => ({ ...f, [key]: "" }));
                                                }}
                                                style={{
                                                    position: "absolute", top: "4px", right: "4px",
                                                    width: "20px", height: "20px", borderRadius: "50%",
                                                    background: "rgba(0,0,0,0.55)", border: "none",
                                                    color: "#fff", fontSize: "14px", lineHeight: "1",
                                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    {/* Upload button */}
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        disabled={saving}
                                        size="small"
                                        sx={{ textTransform: "none", fontWeight: 600, fontSize: "12px" }}
                                        fullWidth
                                    >
                                        {imageFiles[i] ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> : (i === 0 ? "Main" : `Angle ${i + 1}`)}
                                        <input type="file" accept="image/*" hidden onChange={handleFileChange(i)} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Box>

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
                            inputProps={{ maxLength: 1000, style: { overflowX: "hidden", wordBreak: "break-word", whiteSpace: "pre-wrap" } }}
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
                                color: "var(--text)", fontFamily: "var(--font-body)",
                                fontSize: "14px", fontWeight: 700,
                                cursor: saving ? "not-allowed" : "pointer",
                            }}
                        >
                            {saving && <CircularProgress size={14} sx={{ color: "var(--text)" }} />}
                            {saving ? "Saving…" : isRejected ? "Fix & Resubmit" : isEdit ? "Update Product" : "Create Product"}
                        </button>
                    </Box>

                </Box>
            </div>

        </SellerLayout>
    );
};

export default SellerProductFormPage;
