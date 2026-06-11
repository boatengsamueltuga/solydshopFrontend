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

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1628645419184-26a1f2757340?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1580901369227-308f6f40bdeb?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1583024011792-b165975b52f5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1523848309072-c199db53f137?auto=format&fit=crop&w=1920&q=80",
];

const HomePage = () => {

    const dispatch = useDispatch();

    const { products, loading, error } = useSelector((state) => state.product);

    const { user } = useSelector((state) => state.auth);

    const [keyword,    setKeyword]    = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [heroIndex,  setHeroIndex]  = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    /*
    |----------------------------------------------------------
    | Fetch helpers
    |----------------------------------------------------------
    */

    const fetchCategories = async () => {
        try {
            const response = await api.get("/public/categories?pageSize=1000");
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
                    position: "relative",
                    overflow: "hidden",
                    color: "white",
                    py: { xs: 6, md: 10 },
                    px: 3,
                    textAlign: "center",
                }}
            >
                {/* Slideshow background layers */}
                {HERO_IMAGES.map((img, i) => (
                    <Box
                        key={img}
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url('${img}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: i === heroIndex ? 1 : 0,
                            transition: "opacity 1.2s ease-in-out",
                            zIndex: 0,
                        }}
                    />
                ))}
                {/* Dark overlay */}
                <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.55)", zIndex: 1 }} />

                <Box sx={{ position: "relative", zIndex: 2, maxWidth: 780, mx: "auto" }}>

                    {/* Eyebrow label */}
                    <Typography
                        sx={{
                            display: "inline-block",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: 3,
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.7)",
                            mb: 2,
                        }}
                    >
                        Heavy Equipment Parts &amp; Supplies
                    </Typography>

                    {/* Headline */}
                    <Typography
                        component="h1"
                        sx={{
                            fontSize: { xs: "2.4rem", md: "3.8rem" },
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: -1,
                            mb: 2.5,
                            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        }}
                    >
                        The Parts That<br />
                        <Box component="span" sx={{ color: "#facc15" }}>Power Industry</Box>
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            fontSize: { xs: "1rem", md: "1.15rem" },
                            color: "rgba(255,255,255,0.82)",
                            maxWidth: 560,
                            mx: "auto",
                            lineHeight: 1.7,
                            mb: 4,
                            fontWeight: 400,
                        }}
                    >
                        Source genuine components for excavators, bulldozers, cranes &amp; more.
                        Built for demanding sites — delivered with speed and precision.
                    </Typography>

                    {/* Feature highlights */}
                    <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1.5, md: 2.5 }, flexWrap: "wrap" }}>
                        {[
                            { icon: "✔", label: "Genuine OEM Parts" },
                            { icon: "⚡", label: "Fast Delivery" },
                            { icon: "🛡", label: "Quality Guaranteed" },
                        ].map(({ icon, label }) => (
                            <Box
                                key={label}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.8,
                                    px: 2,
                                    py: 0.8,
                                    borderRadius: 2,
                                    bgcolor: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                <Typography sx={{ fontSize: "0.85rem" }}>{icon}</Typography>
                                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: 0.3 }}>
                                    {label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
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
                            MenuProps={{
                                PaperProps: {
                                    style: { maxHeight: 240, overflow: "auto" },
                                },
                                sx: {
                                    "& .MuiPaper-root": {
                                        maxHeight: "240px !important",
                                        overflow: "auto !important",
                                    },
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
                        mb: 4,
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                width: 5,
                                height: 46,
                                bgcolor: "primary.main",
                                borderRadius: 1,
                                flexShrink: 0,
                            }}
                        />
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                color="text.primary"
                                sx={{ lineHeight: 1.2, letterSpacing: -0.3 }}
                            >
                                Browse the Catalog
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                                In-stock parts — ready to ship to your job site
                            </Typography>
                        </Box>
                    </Box>

                    {hasActiveFilters && !loading && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={clearFilters}
                            startIcon={<FilterAltOffIcon />}
                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Box>

                {/* ── Product Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
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
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
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
