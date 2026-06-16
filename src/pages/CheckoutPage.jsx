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
    TextField,
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
const CheckoutForm = ({ totalPrice, userId, shippingAddress, onEditAddress }) => {
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
                { shippingAddress },
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

            {/* Shipping address summary */}
            <Box
                sx={{
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Ships to
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>
                            {shippingAddress}
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        onClick={onEditAddress}
                        sx={{ ml: 2, textTransform: "none", flexShrink: 0, fontWeight: 600 }}
                    >
                        Edit
                    </Button>
                </Stack>
            </Box>

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
| Address form — step 1
|----------------------------------------------------------
*/
const AddressForm = ({ onContinue }) => {
    const [companyName,  setCompanyName]  = useState("");
    const [contactName,  setContactName]  = useState("");
    const [address1,     setAddress1]     = useState("");
    const [address2,     setAddress2]     = useState("");
    const [city,         setCity]         = useState("");
    const [state,        setState]        = useState("");
    const [zip,          setZip]          = useState("");
    const [country,      setCountry]      = useState("");
    const [phone,        setPhone]        = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !contactName.trim() ||
            !address1.trim()    ||
            !city.trim()        ||
            !state.trim()       ||
            !zip.trim()         ||
            !country.trim()
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        const lines = [];
        if (companyName.trim()) lines.push(companyName.trim());
        lines.push(contactName.trim());
        lines.push(address1.trim());
        if (address2.trim()) lines.push(address2.trim());
        lines.push(`${city.trim()}, ${state.trim()} ${zip.trim()}`);
        lines.push(country.trim());
        if (phone.trim()) lines.push(`Phone: ${phone.trim()}`);
        const formatted = lines.join("\n");

        onContinue(formatted);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Shipping Address
            </Typography>

            <Stack spacing={2}>
                <TextField
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    fullWidth
                    size="small"
                />
                <TextField
                    label="Contact Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    fullWidth
                    size="small"
                    required
                />
                <TextField
                    label="Address Line 1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    fullWidth
                    size="small"
                    required
                />
                <TextField
                    label="Address Line 2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    fullWidth
                    size="small"
                />
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        fullWidth
                        size="small"
                        required
                    />
                    <TextField
                        label="State / Province"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        fullWidth
                        size="small"
                        required
                    />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        label="ZIP / Postal Code"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        fullWidth
                        size="small"
                        required
                    />
                    <TextField
                        label="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        fullWidth
                        size="small"
                        required
                    />
                </Stack>
                <TextField
                    label="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                    size="small"
                />
            </Stack>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                    borderRadius: 2,
                }}
            >
                Continue to Payment →
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

    const [totalPrice,      setTotalPrice]      = useState(null);
    const [loading,         setLoading]         = useState(true);
    const [step,            setStep]            = useState("address");   // "address" | "payment"
    const [shippingAddress, setShippingAddress] = useState("");

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

    const handleAddressContinue = (formatted) => {
        setShippingAddress(formatted);
        setStep("payment");
    };

    const handleEditAddress = () => {
        setStep("address");
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

                        {/* Step 1: Address form */}
                        {step === "address" && (
                            <AddressForm onContinue={handleAddressContinue} />
                        )}

                        {/* Step 2: Stripe payment form */}
                        {step === "payment" && (
                            <>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                    Payment Details
                                </Typography>

                                <Elements stripe={stripePromise} options={elementsOptions}>
                                    <CheckoutForm
                                        totalPrice={totalPrice}
                                        userId={user.userId}
                                        shippingAddress={shippingAddress}
                                        onEditAddress={handleEditAddress}
                                    />
                                </Elements>
                            </>
                        )}

                    </Box>
                </Paper>

            </Container>
        </Box>
    );
};

export default CheckoutPage;
