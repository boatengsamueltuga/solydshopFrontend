import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api    from "../api/api";
import Loader from "../components/Loader";
import toast  from "react-hot-toast";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AddIcon                  from "@mui/icons-material/Add";
import RemoveIcon               from "@mui/icons-material/Remove";
import DeleteOutlineIcon        from "@mui/icons-material/DeleteOutlined";
import StorefrontOutlinedIcon   from "@mui/icons-material/StorefrontOutlined";
import ShoppingBagOutlinedIcon  from "@mui/icons-material/ShoppingBagOutlined";
import InventoryOutlinedIcon    from "@mui/icons-material/InventoryOutlined";
import LockOutlinedIcon         from "@mui/icons-material/LockOutlined";

const CartPage = () => {

    const [cart,          setCart]          = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error,         setError]         = useState("");

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const getXsrfToken = () =>
        document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

    const fetchCart = async () => {
        try {
            const response = await api.get(`/cart/${user.userId}`);
            setCart(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.userId) fetchCart();
    }, [user]);

    const handleIncreaseQuantity = async (productId) => {
        setActionLoading(true);
        try {
            await api.post(
                `/cart/${user.userId}/items`,
                { productId, quantity: 1 },
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (error) {
            console.log(error);
            toast.error("Failed to increase quantity");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecreaseQuantity = async (productId) => {
        setActionLoading(true);
        try {
            await api.put(
                `/cart/${user.userId}/items/${productId}/decrease`,
                {},
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (error) {
            console.log(error);
            toast.error("Failed to decrease quantity");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        setActionLoading(true);
        try {
            await api.delete(
                `/cart/${user.userId}/items/${productId}`,
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            await fetchCart();
        } catch (error) {
            console.log(error);
            toast.error("Failed to remove item");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckout = async () => {
        setActionLoading(true);
        try {
            await api.post(
                `/order/${user.userId}/checkout`,
                {},
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );
            toast.success("Checkout successful");
            await fetchCart();
        } catch (error) {
            console.log(error);
            toast.error("Checkout failed");
        } finally {
            setActionLoading(false);
        }
    };

    /*
    |----------------------------------------------------------
    | Loading / Error
    |----------------------------------------------------------
    */

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, bgcolor: "grey.50" }}>
                <Loader />
                <Typography variant="h6" color="text.secondary">Loading your cart...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "grey.50" }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Box>
        );
    }

    const items      = cart?.items ?? [];
    const totalPrice = Number(cart?.totalPrice ?? 0);
    const itemCount  = items.reduce((sum, i) => sum + i.quantity, 0);

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>

            {/* ── Banner ── */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
                    color: "white",
                    px: { xs: 3, sm: 5, md: 8 },
                    py: { xs: 4, md: 6 },
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: items.length > 0 ? 3 : 0 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56 }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
                            My Cart
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                            {itemCount > 0
                                ? `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`
                                : "Your cart is empty"}
                        </Typography>
                    </Box>
                </Stack>

                {items.length > 0 && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Paper elevation={0} sx={{ px: 3, py: 1.75, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, color: "white", minWidth: 140 }}>
                            <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                                Items
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">{itemCount}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ px: 3, py: 1.75, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 2, color: "white", minWidth: 160 }}>
                            <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                                Subtotal
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Paper>
                    </Stack>
                )}
            </Box>

            {/* ── Content ── */}
            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>

                {/* ── Action Loading Bar ── */}
                {actionLoading && (
                    <Paper elevation={0} sx={{ mb: 3, px: 3, py: 1.5, borderRadius: 2, border: "1px solid", borderColor: "info.light", bgcolor: "#e3f2fd", display: "flex", alignItems: "center", gap: 2 }}>
                        <CircularProgress size={20} thickness={5} />
                        <Typography variant="body2" fontWeight={600} color="info.dark">
                            Updating your cart...
                        </Typography>
                    </Paper>
                )}

                {/* ── Empty State ── */}
                {items.length === 0 ? (

                    <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", py: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", bgcolor: "white" }}>
                        <Avatar sx={{ width: 88, height: 88, bgcolor: "#e8eaf6", mb: 3 }}>
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                            Your cart is empty
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 320, lineHeight: 1.7 }}>
                            Looks like you haven't added anything yet. Start browsing products.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<StorefrontOutlinedIcon />}
                            onClick={() => navigate("/")}
                            sx={{ borderRadius: 2, px: 4, py: 1.25, textTransform: "none", fontWeight: 700, fontSize: "1rem" }}
                        >
                            Browse Products
                        </Button>
                    </Paper>

                ) : (

                    /* ── Two-column layout ── */
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
                            gap: 3,
                            alignItems: "start",
                        }}
                    >

                        {/* ── Cart Items ── */}
                        <Stack spacing={2}>

                            {items.map((item) => (

                                <Card
                                    key={item.productId}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        transition: "box-shadow 0.2s ease",
                                        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: "20px !important" } }}>

                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            alignItems={{ sm: "center" }}
                                            justifyContent="space-between"
                                            gap={2}
                                        >

                                            {/* Left — image + details */}
                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>

                                                <Avatar
                                                    variant="rounded"
                                                    sx={{ width: 64, height: 64, bgcolor: "grey.100", flexShrink: 0 }}
                                                >
                                                    <InventoryOutlinedIcon sx={{ color: "text.disabled", fontSize: 28 }} />
                                                </Avatar>

                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={700}
                                                        sx={{
                                                            background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                                                            WebkitBackgroundClip: "text",
                                                            WebkitTextFillColor: "transparent",
                                                            backgroundClip: "text",
                                                            letterSpacing: 0.2,
                                                        }}
                                                    >
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                                        Unit price: <strong>${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                                                    </Typography>
                                                </Box>

                                            </Stack>

                                            {/* Right — qty controls + price + remove */}
                                            <Stack direction={{ xs: "row" }} alignItems="center" spacing={2} flexWrap="wrap">

                                                {/* Quantity controls */}
                                                <Stack direction="row" alignItems="center" spacing={1}
                                                    sx={{
                                                        border: "1px solid",
                                                        borderColor: "divider",
                                                        borderRadius: 2,
                                                        px: 0.5,
                                                        py: 0.25,
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDecreaseQuantity(item.productId)}
                                                        disabled={actionLoading}
                                                        sx={{ color: "text.secondary" }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>

                                                    <Typography variant="body1" fontWeight={700} sx={{ minWidth: 24, textAlign: "center" }}>
                                                        {item.quantity}
                                                    </Typography>

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleIncreaseQuantity(item.productId)}
                                                        disabled={actionLoading}
                                                        sx={{ color: "primary.main" }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>

                                                {/* Line total */}
                                                <Typography variant="h6" fontWeight="bold" color="success.dark" sx={{ minWidth: 90, textAlign: "right" }}>
                                                    ${(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </Typography>

                                                {/* Remove */}
                                                <IconButton
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    disabled={actionLoading}
                                                    color="error"
                                                    size="small"
                                                    sx={{
                                                        border: "1px solid",
                                                        borderColor: "error.light",
                                                        borderRadius: 1.5,
                                                    }}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>

                                            </Stack>

                                        </Stack>

                                    </CardContent>
                                </Card>

                            ))}

                        </Stack>

                        {/* ── Order Summary ── */}
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                position: { lg: "sticky" },
                                top: { lg: 24 },
                                overflow: "hidden",
                            }}
                        >
                            {/* Summary header accent */}
                            <Box sx={{ height: 4, bgcolor: "success.main" }} />

                            <CardContent sx={{ p: 3 }}>

                                <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2.5 }}>
                                    Order Summary
                                </Typography>

                                <Stack spacing={1.5}>

                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Items ({itemCount})
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Shipping
                                        </Typography>
                                        <Chip label="Free" color="success" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
                                    </Stack>

                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                        Total
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="success.main">
                                        ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Stack>

                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    size="large"
                                    onClick={handleCheckout}
                                    disabled={actionLoading}
                                    startIcon={actionLoading
                                        ? <CircularProgress size={18} color="inherit" />
                                        : <LockOutlinedIcon />
                                    }
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        textTransform: "none",
                                        borderRadius: 2,
                                    }}
                                >
                                    {actionLoading ? "Processing..." : "Proceed to Checkout"}
                                </Button>

                                <Button
                                    variant="text"
                                    fullWidth
                                    startIcon={<ShoppingBagOutlinedIcon />}
                                    onClick={() => navigate("/")}
                                    sx={{ mt: 1.5, textTransform: "none", color: "text.secondary", fontWeight: 600 }}
                                >
                                    Continue Shopping
                                </Button>

                            </CardContent>
                        </Card>

                    </Box>

                )}

            </Container>

        </Box>
    );
};

export default CartPage;
