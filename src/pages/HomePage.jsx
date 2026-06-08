import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import api from "../api/api";

import toast from "react-hot-toast";

import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure
} from "../features/product/productSlice";

import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Container,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";

import SearchIcon        from "@mui/icons-material/Search";
import ShoppingCartIcon  from "@mui/icons-material/ShoppingCart";
import StorefrontIcon    from "@mui/icons-material/Storefront";
import FilterAltOffIcon  from "@mui/icons-material/FilterAltOff";

/*
|----------------------------------------------------------
| Skeleton placeholder shown while loading
|----------------------------------------------------------
*/

const SkeletonCard = () => (
    <Card elevation={2} sx={{ borderRadius: 3, display: "flex", flexDirection: "column" }}>
        <Skeleton variant="rectangular" height={45} />
        <CardContent sx={{ flexGrow: 1, p: 1 }}>
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="65%" />
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="rounded" width={60} height={18} sx={{ mt: 0.3 }} />
        </CardContent>
        <CardActions sx={{ p: 1.5, pt: 0 }}>
            <Skeleton variant="rounded" width="100%" height={32} />
        </CardActions>
    </Card>
);

/*
|----------------------------------------------------------
| Page component
|----------------------------------------------------------
*/

const HomePage = () => {

    const dispatch = useDispatch();

    const { products, loading, error } = useSelector((state) => state.product);

    const { user } = useSelector((state) => state.auth);

    const [keyword,    setKeyword]    = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);

    /*
    |----------------------------------------------------------
    | Fetch helpers
    |----------------------------------------------------------
    */

    const fetchCategories = async () => {
        try {
            const response = await api.get("/public/categories");
            setCategories(response.data.content);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchProducts = async (
        searchKeyword      = keyword,
        selectedCategoryId = categoryId
    ) => {
        dispatch(fetchProductsStart());
        try {
            let url = "/public/products?";
            if (searchKeyword.trim() !== "")   url += `keyword=${searchKeyword}&`;
            if (selectedCategoryId !== "")      url += `categoryId=${selectedCategoryId}`;
            const response = await api.get(url);
            dispatch(fetchProductsSuccess(response.data.content));
        } catch (error) {
            dispatch(fetchProductsFailure(error.message));
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => fetchProducts(), 400);
        return () => clearTimeout(timeout);
    }, [keyword, categoryId]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") fetchProducts();
    };

    const handleAddToCart = async (productId) => {
        try {
            const xsrfToken = document.cookie
                .split("; ")
                .find(row => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1];

            await api.post(
                `/cart/${user.userId}/items`,
                { productId, quantity: 1 },
                { headers: { "X-XSRF-TOKEN": xsrfToken } }
            );

            toast.success("Product added to cart");

        } catch (error) {
            console.log(error);
            toast.error("Failed to add product to cart");
        }
    };

    const clearFilters = () => {
        setKeyword("");
        setCategoryId("");
    };

    const hasActiveFilters = keyword.trim() !== "" || categoryId !== "";

    /*
    |----------------------------------------------------------
    | Error state
    |----------------------------------------------------------
    */

    if (error) {
        return (
            <Box sx={{ p: 6, textAlign: "center" }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>

            {/* ── Hero ── */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                    color: "white",
                    py: { xs: 7, md: 11 },
                    px: 3,
                    textAlign: "center",
                }}
            >
                <StorefrontIcon sx={{ fontSize: { xs: 52, md: 68 }, mb: 2, opacity: 0.9 }} />

                <Typography
                    variant="h3"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
                >
                    Find What You Need
                </Typography>

                <Typography
                    variant="h6"
                    sx={{ opacity: 0.82, maxWidth: 560, mx: "auto", fontWeight: 400 }}
                >
                    Premium heavy equipment parts &amp; machinery — built for performance
                </Typography>
            </Box>

            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>

                {/* ── Search & Filter bar ── */}
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 3 },
                        mb: 5,
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { md: "center" },
                        gap: 2,
                    }}
                >
                    <TextField
                        placeholder="Search products..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 2 }}
                    />

                    <FormControl size="small" sx={{ flex: 1, minWidth: 180 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            label="Category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                    {cat.categoryName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={() => fetchProducts()}
                        startIcon={<SearchIcon />}
                        sx={{ px: 4, py: 1, borderRadius: 2, flexShrink: 0 }}
                    >
                        Search
                    </Button>
                </Paper>

                {/* ── Results header ── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        {loading
                            ? "Searching…"
                            : `${products.length} Product${products.length !== 1 ? "s" : ""} Found`}
                    </Typography>

                    {hasActiveFilters && !loading && (
                        <Button
                            size="small"
                            color="inherit"
                            onClick={clearFilters}
                            startIcon={<FilterAltOffIcon />}
                            sx={{ color: "text.secondary" }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Box>

                {/* ── Product Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>

                ) : products.length === 0 ? (
                    <Box sx={{ py: 12, textAlign: "center" }}>
                        <StorefrontIcon sx={{ fontSize: 72, color: "text.disabled", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No products found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                            Try adjusting your search or clearing filters
                        </Typography>
                    </Box>

                ) : (
                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                        {products.map((product) => (
                            <Card
                                key={product.productId}
                                elevation={2}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="45"
                                    image={product.imageUrl}
                                    alt={product.productName}
                                    sx={{ objectFit: "cover" }}
                                />

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
                                            display: "-webkit-box",
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            mb: 0.4,
                                        }}
                                    >
                                        {product.description}
                                    </Typography>

                                    <Typography
                                        fontWeight="bold"
                                        color="success.main"
                                        sx={{ fontSize: { xs: "0.82rem", md: "0.9rem" }, mb: 0.4 }}
                                    >
                                        ${Number(product.price).toLocaleString()}
                                    </Typography>

                                    <Chip
                                        label={product.quantity > 0 ? "In Stock" : "Out of Stock"}
                                        color={product.quantity > 0 ? "success" : "error"}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: "0.58rem", height: 18 }}
                                    />
                                </CardContent>

                                <CardActions sx={{ p: 1, pt: 0 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={<ShoppingCartIcon sx={{ fontSize: "0.8rem !important" }} />}
                                        disabled={product.quantity === 0}
                                        onClick={() => handleAddToCart(product.productId)}
                                        sx={{
                                            borderRadius: 2,
                                            py: 0.4,
                                            fontSize: { xs: "0.6rem", md: "0.68rem" },
                                            textTransform: "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </div>
                )}

            </Container>

        </Box>
    );
};

export default HomePage;
