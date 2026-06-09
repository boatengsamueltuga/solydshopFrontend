import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

import Loader from "../components/Loader";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";

import ShoppingBagOutlinedIcon   from "@mui/icons-material/ShoppingBagOutlined";
import ReceiptLongOutlinedIcon   from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlinedIcon   from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon        from "@mui/icons-material/CancelOutlined";
import InventoryOutlinedIcon     from "@mui/icons-material/InventoryOutlined";
import StorefrontOutlinedIcon    from "@mui/icons-material/StorefrontOutlined";

const STATUS_COLORS = {
    PENDING:    "warning",
    CONFIRMED:  "info",
    PROCESSING: "info",
    SHIPPED:    "primary",
    DELIVERED:  "success",
    CANCELLED:  "error",
};

const ORDER_STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

const getActiveStep = (status) => {
    const map = { PENDING: 0, CONFIRMED: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3 };
    return map[status] ?? 0;
};

const ACCENT_COLORS = {
    DELIVERED:  "#2e7d32",
    CANCELLED:  "#c62828",
    SHIPPED:    "#1565c0",
    PROCESSING: "#0277bd",
    CONFIRMED:  "#01579b",
    PENDING:    "#e65100",
};

const OrdersPage = () => {

    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const response = await api.get(`/order/${user.userId}`);

                setOrders(response.data);

            } catch (error) {

                console.log(error);

                setError("Unable to load orders. Please try again.");

            } finally {

                setLoading(false);
            }
        };

        if (user?.userId) fetchOrders();

    }, [user]);

    /*
    |----------------------------------------------------------
    | Loading / Error
    |----------------------------------------------------------
    */

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, bgcolor: "grey.50" }}>
                <Loader />
                <Typography variant="h6" color="text.secondary">Loading your orders...</Typography>
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

    /*
    |----------------------------------------------------------
    | Derived
    |----------------------------------------------------------
    */

    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>

            {/* ── Page Banner ── */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
                    color: "white",
                    px: { xs: 3, sm: 5, md: 8 },
                    py: { xs: 4, md: 6 },
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: orders.length > 0 ? 3 : 0 }}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56 }}>
                        <ShoppingBagOutlinedIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
                            My Orders
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                            Track and manage your purchases
                        </Typography>
                    </Box>
                </Stack>

                {orders.length > 0 && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>

                        <Paper
                            elevation={0}
                            sx={{
                                px: 3,
                                py: 1.75,
                                bgcolor: "rgba(255,255,255,0.12)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: 2,
                                color: "white",
                                minWidth: 140,
                            }}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                                Total Orders
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">{orders.length}</Typography>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                px: 3,
                                py: 1.75,
                                bgcolor: "rgba(255,255,255,0.12)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: 2,
                                color: "white",
                                minWidth: 180,
                            }}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.75, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>
                                Total Spent
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Paper>

                    </Stack>
                )}
            </Box>

            {/* ── Content ── */}
            <Box sx={{ px: { xs: 2, sm: 4, md: 8 }, py: { xs: 3, md: 5 } }}>

                {/* ── Empty State ── */}
                {orders.length === 0 ? (

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            py: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            bgcolor: "white",
                        }}
                    >
                        <Avatar sx={{ width: 88, height: 88, bgcolor: "#e8eaf6", mb: 3 }}>
                            <ShoppingBagOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />
                        </Avatar>

                        <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                            No orders yet
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 320, lineHeight: 1.7 }}>
                            Looks like you haven't placed any orders yet. Start shopping to see your orders here.
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<StorefrontOutlinedIcon />}
                            onClick={() => navigate("/")}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.25,
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "1rem",
                            }}
                        >
                            Start Shopping
                        </Button>
                    </Paper>

                ) : (

                    <Stack spacing={3}>

                        {orders.map((order) => (

                            <Card
                                key={order.orderId}
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                    bgcolor: "white",
                                    transition: "box-shadow 0.2s ease",
                                    "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.08)" },
                                }}
                            >

                                {/* ── Status Accent Bar ── */}
                                <Box sx={{ height: 4, bgcolor: ACCENT_COLORS[order.status] || "grey.400" }} />

                                {/* ── Order Header ── */}
                                <Box
                                    sx={{
                                        px: { xs: 2.5, md: 4 },
                                        py: { xs: 2, md: 2.5 },
                                        bgcolor: "grey.50",
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "space-between",
                                        alignItems: { sm: "center" },
                                        gap: 2,
                                    }}
                                >

                                    <Stack direction="row" alignItems="center" spacing={2}>

                                        <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                                            <ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />
                                        </Avatar>

                                        <Box>
                                            <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                                Order
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                                                #{order.orderId}
                                            </Typography>
                                            {order.createdAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                                </Typography>
                                            )}
                                        </Box>

                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2.5} flexWrap="wrap">

                                        <Chip
                                            label={order.status}
                                            color={STATUS_COLORS[order.status] || "default"}
                                            size="medium"
                                            sx={{ fontWeight: 700, px: 0.5, fontSize: "0.8rem" }}
                                        />

                                        <Box sx={{ textAlign: "right" }}>
                                            <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1} display="block">
                                                Order Total
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                                ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </Typography>
                                        </Box>

                                    </Stack>

                                </Box>

                                {/* ── Status Stepper ── */}
                                {order.status !== "CANCELLED" ? (
                                    <Box
                                        sx={{
                                            px: { xs: 2, md: 5 },
                                            py: 2.5,
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "white",
                                        }}
                                    >
                                        <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
                                            {ORDER_STEPS.map((label) => (
                                                <Step key={label}>
                                                    <StepLabel
                                                        sx={{
                                                            "& .MuiStepLabel-label": {
                                                                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                                                fontWeight: 600,
                                                            },
                                                        }}
                                                    >
                                                        {label}
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            px: { xs: 2.5, md: 4 },
                                            py: 1.5,
                                            bgcolor: "#fff5f5",
                                            borderBottom: "1px solid #fecaca",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <CancelOutlinedIcon sx={{ color: "error.main", fontSize: 18 }} />
                                        <Typography variant="body2" color="error.main" fontWeight={600}>
                                            This order was cancelled.
                                        </Typography>
                                    </Box>
                                )}

                                {/* ── Order Items ── */}
                                <CardContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.5, pb: "20px !important" }}>

                                    <Typography
                                        variant="overline"
                                        color="text.disabled"
                                        fontWeight={700}
                                        letterSpacing={1.5}
                                    >
                                        {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
                                    </Typography>

                                    <Stack divider={<Divider />} sx={{ mt: 1 }}>

                                        {order.items.map((item) => (

                                            <Box
                                                key={item.productId}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    py: 1.75,
                                                }}
                                            >

                                                <Stack direction="row" alignItems="center" spacing={1.75}>

                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            bgcolor: "grey.100",
                                                            color: "text.secondary",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <InventoryOutlinedIcon fontSize="small" />
                                                    </Avatar>

                                                    <Box>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight={700}
                                                            sx={{
                                                                background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                                                                WebkitBackgroundClip: "text",
                                                                WebkitTextFillColor: "transparent",
                                                                backgroundClip: "text",
                                                                letterSpacing: 0.2,
                                                                fontSize: "0.95rem",
                                                            }}
                                                        >
                                                            {item.productName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Qty: {item.quantity}&nbsp;&nbsp;·&nbsp;&nbsp;
                                                            ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })} each
                                                        </Typography>
                                                    </Box>

                                                </Stack>

                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    color="success.dark"
                                                    sx={{ whiteSpace: "nowrap" }}
                                                >
                                                    ${Number(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </Typography>

                                            </Box>

                                        ))}

                                    </Stack>

                                    {/* ── Total Footer ── */}
                                    <Box
                                        sx={{
                                            mt: 2,
                                            pt: 2,
                                            borderTop: "2px dashed",
                                            borderColor: "divider",
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                            Order Total:
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="success.main">
                                            ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>

                                </CardContent>

                            </Card>

                        ))}

                    </Stack>

                )}

            </Box>

        </Box>
    );
};

export default OrdersPage;
