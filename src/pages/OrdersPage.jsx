import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import api from "../api/api";

import Loader from "../components/Loader";

import { FaShoppingBag } from "react-icons/fa";

import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

const STATUS_COLORS = {
    PENDING:   "warning",
    CONFIRMED: "info",
    SHIPPED:   "secondary",
    DELIVERED: "success",
    CANCELLED: "error",
};

const CARD_ACCENTS = [
    { border: "#38bdf8", price: "#38bdf8", badge: "#0c4a6e", badgeText: "#7dd3fc" },
    { border: "#a78bfa", price: "#a78bfa", badge: "#2e1065", badgeText: "#c4b5fd" },
    { border: "#fb923c", price: "#fb923c", badge: "#431407", badgeText: "#fdba74" },
    { border: "#34d399", price: "#34d399", badge: "#022c22", badgeText: "#6ee7b7" },
    { border: "#f472b6", price: "#f472b6", badge: "#4a044e", badgeText: "#f9a8d4" },
];

const OrdersPage = () => {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const { user } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const response = await api.get(
                    `/order/${user.userId}`
                );

                setOrders(response.data);

            } catch (error) {

                console.log(error);

                setError("Unable to load orders");

            } finally {

                setLoading(false);
            }
        };

        if (user?.userId) {

            fetchOrders();
        }

    }, [user]);

    if (loading) {

        return (

            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    bgcolor: "#030712",
                }}
            >

                <Loader />

                <Typography variant="h6" sx={{ color: "#6b7280" }}>
                    Loading your orders...
                </Typography>

            </Box>
        );
    }

    if (error) {

        return (

            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "#030712",
                }}
            >

                <Typography variant="h6" color="error">
                    {error}
                </Typography>

            </Box>
        );
    }

    return (

        <Box
            sx={{
                p: { xs: 2, md: 5 },
                bgcolor: "#030712",
                minHeight: "100vh",
            }}
        >

            {/* Page Header */}
            <Box sx={{ mb: { xs: 4, md: 6 } }}>

                <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                        fontSize: { xs: "2rem", md: "3rem" },
                        color: "#f9fafb",
                        letterSpacing: "-0.5px",
                    }}
                >
                    My Orders
                </Typography>

                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        mt: 1.5,
                        px: 2,
                        py: 0.5,
                        bgcolor: "#111827",
                        borderRadius: 10,
                        border: "1px solid #1f2937",
                    }}
                >
                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500 }}>
                        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                    </Typography>
                </Box>

            </Box>

            {orders.length === 0 ? (

                <Card
                    sx={{
                        borderRadius: 3,
                        bgcolor: "#0f172a",
                        border: "1px solid #1e293b",
                        boxShadow: "none",
                    }}
                >

                    <CardContent
                        sx={{
                            py: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >

                        <Box
                            sx={{
                                width: 96,
                                height: 96,
                                borderRadius: "50%",
                                bgcolor: "#1e293b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 3,
                            }}
                        >
                            <FaShoppingBag style={{ fontSize: 40, color: "#475569" }} />
                        </Box>

                        <Typography variant="h5" fontWeight="bold" sx={{ color: "#e2e8f0" }}>
                            No orders yet
                        </Typography>

                        <Typography variant="body1" sx={{ mt: 1, color: "#475569" }}>
                            Your completed orders will appear here.
                        </Typography>

                    </CardContent>

                </Card>

            ) : (

                <Stack spacing={3}>

                    {orders.map((order, orderIndex) => {

                        const accent = CARD_ACCENTS[orderIndex % CARD_ACCENTS.length];

                        return (

                            <Card
                                key={order.orderId}
                                sx={{
                                    borderRadius: 3,
                                    bgcolor: "#0f172a",
                                    border: "1px solid #1e293b",
                                    borderTop: `3px solid ${accent.border}`,
                                    boxShadow: `0 0 24px 0 ${accent.border}18`,
                                    overflow: "hidden",
                                }}
                            >

                                {/* Order Header */}
                                <Box
                                    sx={{
                                        px: { xs: 2.5, md: 4 },
                                        py: { xs: 2, md: 2.5 },
                                        bgcolor: "#0a0f1e",
                                        borderBottom: "1px solid #1e293b",
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "space-between",
                                        alignItems: { sm: "center" },
                                        gap: 2,
                                    }}
                                >

                                    <Stack direction="row" alignItems="center" spacing={2}>

                                        <Box>

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "#475569",
                                                    textTransform: "uppercase",
                                                    letterSpacing: 1.5,
                                                    fontWeight: 600,
                                                    display: "block",
                                                }}
                                            >
                                                Order
                                            </Typography>

                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                sx={{ color: accent.border }}
                                            >
                                                #{order.orderId}
                                            </Typography>

                                        </Box>

                                        <Chip
                                            label={order.status}
                                            color={STATUS_COLORS[order.status] || "default"}
                                            size="small"
                                            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                                        />

                                    </Stack>

                                    <Box sx={{ textAlign: { sm: "right" } }}>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#475569",
                                                textTransform: "uppercase",
                                                letterSpacing: 1.5,
                                                fontWeight: 600,
                                                display: "block",
                                            }}
                                        >
                                            Order Total
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            sx={{ color: accent.border }}
                                        >
                                            ${Number(order.totalAmount).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </Typography>

                                    </Box>

                                </Box>

                                {/* Order Items */}
                                <CardContent sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>

                                    <Stack>

                                        {order.items.map((item, index) => (

                                            <Box key={item.productId}>

                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: { xs: "column", sm: "row" },
                                                        justifyContent: "space-between",
                                                        alignItems: { sm: "center" },
                                                        gap: 2,
                                                        py: 2,
                                                    }}
                                                >

                                                    {/* Product Info */}
                                                    <Box>

                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={700}
                                                            sx={{ color: "#e2e8f0" }}
                                                        >
                                                            {item.productName}
                                                        </Typography>

                                                        <Box
                                                            sx={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                mt: 0.75,
                                                                px: 1.5,
                                                                py: 0.25,
                                                                bgcolor: accent.badge,
                                                                borderRadius: 10,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                fontWeight={700}
                                                                sx={{ color: accent.badgeText }}
                                                            >
                                                                Qty: {item.quantity}
                                                            </Typography>
                                                        </Box>

                                                    </Box>

                                                    {/* Unit Price */}
                                                    <Box
                                                        sx={{
                                                            textAlign: { sm: "right" },
                                                            bgcolor: "#0a0f1e",
                                                            border: `1px solid ${accent.border}`,
                                                            borderRadius: 2,
                                                            px: 2.5,
                                                            py: 1.25,
                                                            minWidth: 150,
                                                            boxShadow: `0 0 12px 0 ${accent.border}30`,
                                                        }}
                                                    >

                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: accent.badgeText,
                                                                textTransform: "uppercase",
                                                                letterSpacing: 1.2,
                                                                fontWeight: 700,
                                                                display: "block",
                                                            }}
                                                        >
                                                            Unit Price
                                                        </Typography>

                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            sx={{ color: accent.border }}
                                                        >
                                                            ${Number(item.price).toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </Typography>

                                                    </Box>

                                                </Box>

                                                {index < order.items.length - 1 && (
                                                    <Divider sx={{ borderColor: "#1e293b" }} />
                                                )}

                                            </Box>
                                        ))}

                                    </Stack>

                                </CardContent>

                            </Card>
                        );
                    })}

                </Stack>
            )}

        </Box>
    );
};

export default OrdersPage;
