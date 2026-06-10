import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import api from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import LockOutlinedIcon    from "@mui/icons-material/LockOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";

/*
|----------------------------------------------------------
| Inner form — must be rendered inside <Elements>
|----------------------------------------------------------
*/
const CheckoutForm = ({ totalPrice, userId }) => {
    const stripe   = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [paying,       setPaying]       = useState(false);
    const [paymentError, setPaymentError] = useState("");

    const getXsrfToken = () =>
        document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setPaying(true);
        setPaymentError("");

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setPaymentError(submitError.message);
            setPaying(false);
            return;
        }

        try {
            const intentRes = await api.post("/payment/create-payment-intent", {
                amount:   Math.round(totalPrice * 100),
                currency: "usd",
            });

            const clientSecret = intentRes.data.clientSecret;

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                redirect: "if_required",
            });

            if (confirmError) {
                setPaymentError(confirmError.message);
                setPaying(false);
                return;
            }

            await api.post(
                `/order/${userId}/checkout`,
                {},
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );

            toast.success("Payment successful! Order placed.");
            window.location.href = "/orders";

        } catch (err) {
            console.error(err);
            toast.error("Payment failed. Please try again.");
            setPaymentError("Something went wrong. Please try again.");
            setPaying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            <Box sx={{ mb: 3 }}>
                <PaymentElement />
            </Box>

            {paymentError && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                    {paymentError}
                </Typography>
            )}

            <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                size="large"
                disabled={!stripe || paying}
                startIcon={paying
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
                {paying ? "Processing..." : `Pay $${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            </Button>

        </form>
    );
};

/*
|----------------------------------------------------------
| Page wrapper — fetches cart total, then renders Elements
|----------------------------------------------------------
*/
const CheckoutPage = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
        []
    );

    const [totalPrice, setTotalPrice] = useState(null);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        if (!user?.userId) return;
        api.get(`/cart/${user.userId}`)
            .then(res => setTotalPrice(Number(res.data.totalPrice ?? 0)))
            .catch(() => toast.error("Could not load cart"))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 2, bgcolor: "grey.50" }}>
                <Loader />
                <Typography variant="h6" color="text.secondary">Preparing checkout...</Typography>
            </Box>
        );
    }

    if (!totalPrice || totalPrice === 0) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "grey.50" }}>
                <Typography variant="h6" color="text.secondary">Your cart is empty.</Typography>
            </Box>
        );
    }

    const elementsOptions = {
        mode:               "payment",
        amount:             Math.round(totalPrice * 100),
        currency:           "usd",
        paymentMethodTypes: ["card"],
    };

    return (
        <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>

            {/* Banner */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
                    color: "white",
                    px: { xs: 3, sm: 5, md: 8 },
                    py: { xs: 4, md: 6 },
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.15)", width: 56, height: 56 }}>
                        <PaymentOutlinedIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
                            Checkout
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
                            Complete your purchase securely with Stripe
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>

                {/* Back to cart */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/cart")}
                    sx={{ mb: 3, textTransform: "none", color: "text.secondary", fontWeight: 600 }}
                >
                    Back to Cart
                </Button>

                <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>

                    {/* Accent bar */}
                    <Box sx={{ height: 4, bgcolor: "success.main" }} />

                    <Box sx={{ p: 3 }}>

                        {/* Order total summary */}
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Order Summary
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                            <Typography variant="body2" fontWeight={600}>
                                ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">Shipping</Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">Free</Typography>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                                ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Stack>

                        <Divider sx={{ mb: 3 }} />

                        {/* Stripe payment form */}
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Payment Details
                        </Typography>

                        <Elements stripe={stripePromise} options={elementsOptions}>
                            <CheckoutForm totalPrice={totalPrice} userId={user.userId} />
                        </Elements>

                    </Box>
                </Paper>

            </Container>
        </Box>
    );
};

export default CheckoutPage;
