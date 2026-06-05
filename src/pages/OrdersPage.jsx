import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import api from "../api/api";

import Loader from "../components/Loader";

import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
    Paper,
} from "@mui/material";

import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

const STATUS_COLORS = {
    PENDING:    "warning",
    CONFIRMED:  "info",
    PROCESSING: "info",
    SHIPPED:    "secondary",
    DELIVERED:  "success",
    CANCELLED:  "error",
};

const OrdersPage = () => {

    const [orders,  setOrders]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    const { user } = useSelector((state) => state.auth);

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
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, bgcolor: "grey.100" }}>
                <Loader />
                <Typography variant="h6" color="text.secondary">Loading your orders...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "grey.100" }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Box>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <Box sx={{ p: { xs: 2, sm: 3, md: 5 }, bgcolor: "grey.100", minHeight: "100vh" }}>

            {/* ── Header ── */}
            <Box sx={{ mb: { xs: 3, md: 5 } }}>

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" }, color: "text.primary" }}
                >
                    My Orders
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                </Typography>

            </Box>

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
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "grey.100",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        <ShoppingBagOutlinedIcon sx={{ fontSize: 36, color: "text.disabled" }} />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        No orders yet
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Your completed orders will appear here.
                    </Typography>

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
                            }}
                        >

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
                                    gap: 1.5,
                                }}
                            >

                                <Stack direction="row" alignItems="center" spacing={1.5}>

                                    <Box>
                                        <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                                            Order
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                                            #{order.orderId}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={order.status}
                                        color={STATUS_COLORS[order.status] || "default"}
                                        size="small"
                                        sx={{ fontWeight: 700 }}
                                    />

                                </Stack>

                                <Box sx={{ textAlign: { sm: "right" } }}>
                                    <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1} display="block">
                                        Order Total
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="success.main">
                                        ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                            </Box>

                            {/* ── Order Items ── */}
                            <CardContent sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>

                                <Stack divider={<Divider />}>

                                    {order.items.map((item) => (

                                        <Box
                                            key={item.productId}
                                            sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", sm: "row" },
                                                justifyContent: "space-between",
                                                alignItems: { sm: "center" },
                                                gap: 1.5,
                                                py: 2,
                                            }}
                                        >

                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                                    {item.productName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Qty: {item.quantity}
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    textAlign: { sm: "right" },
                                                    bgcolor: "grey.50",
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    borderRadius: 2,
                                                    px: 2.5,
                                                    py: 1.25,
                                                    minWidth: { sm: 140 },
                                                }}
                                            >
                                                <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase" letterSpacing={1} display="block">
                                                    Unit Price
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                                    ${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </Box>

                                        </Box>
                                    ))}

                                </Stack>

                            </CardContent>

                        </Card>
                    ))}

                </Stack>
            )}

        </Box>
    );
};

export default OrdersPage;
