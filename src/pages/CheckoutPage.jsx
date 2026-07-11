import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import api  from "../api/api";
import toast from "react-hot-toast";
import { fmtPrice } from "../utils/format";

import { Button, Stack, TextField } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { CircularProgress } from "@mui/material";
import { HiArrowLeft, HiCheckCircle, HiCube } from "react-icons/hi";

/* Some iOS WebKit builds paint the browser's autofill highlight in a
   way that ignores the CSS box-shadow override in index.css entirely.
   index.css attaches a no-op animation to the :-webkit-autofill state
   so we can detect the exact moment autofill fires here and force the
   correct colors directly via JS, which isn't at the mercy of the
   CSS cascade the way the pure-CSS override is. */
const handleAutofillAnimation = (e) => {
    const el = e.target;
    if (e.animationName === "onAutoFillStart") {
        el.style.setProperty("background-color", "var(--surface-high)", "important");
        el.style.setProperty("color", "var(--text)", "important");
        el.style.setProperty("-webkit-text-fill-color", "var(--text)", "important");
    } else if (e.animationName === "onAutoFillCancel") {
        el.style.removeProperty("background-color");
        el.style.removeProperty("color");
        el.style.removeProperty("-webkit-text-fill-color");
    }
};

/* ── Progress step indicator ── */
const StepIndicator = ({ step }) => {
    const steps = ["Shipping", "Payment"];
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-4) var(--space-6)", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            {steps.map((label, i) => {
                const idx    = i + 1;
                const active = idx === step;
                const done   = idx < step;
                return (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <div style={{
                            width:          "24px",
                            height:         "24px",
                            borderRadius:   "50%",
                            border:         `2px solid ${active || done ? "var(--accent)" : "var(--border)"}`,
                            background:     done ? "var(--accent)" : active ? "var(--accent-subtle)" : "transparent",
                            color:          done ? "var(--text)" : active ? "var(--text-2)" : "var(--text-4)",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            fontSize:       "11px",
                            fontFamily:     "var(--font-mono)",
                            fontWeight:     700,
                            flexShrink:     0,
                        }}>
                            {done ? <HiCheckCircle style={{ fontSize: 14 }} /> : idx}
                        </div>
                        <span style={{
                            fontSize:   "13px",
                            fontFamily: "var(--font-body)",
                            fontWeight: active ? 600 : 400,
                            color:      active ? "var(--text)" : done ? "var(--text-2)" : "var(--text-4)",
                        }}>
                            {label}
                        </span>
                        {i < steps.length - 1 && (
                            <div style={{ width: "32px", height: "1px", background: "var(--border-mid)", margin: "0 var(--space-2)" }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/*
|----------------------------------------------------------
| Inner payment form — rendered inside <Elements>
|----------------------------------------------------------
*/
const CheckoutForm = ({ totalPrice, shippingAddress, onEditAddress, hasBlockedItems, onUnavailableItem }) => {
    const stripe   = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [paying,       setPaying]       = useState(false);
    const [paymentError, setPaymentError] = useState("");

    const getXsrfToken = () =>
        document.cookie.split("; ").find(r => r.startsWith("XSRF-TOKEN="))?.split("=")[1];

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
            // Single server call: validates cart, reserves inventory, computes total, creates PI
            const checkoutRes = await api.post(
                "/payment/checkout",
                { shippingAddress },
                { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
            );

            const { clientSecret, orderId } = checkoutRes.data;

            const { error: confirmError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                redirect: "if_required",
            });

            if (confirmError) {
                // Order is PAYMENT_PENDING — webhook will set PAYMENT_FAILED
                setPaymentError(confirmError.message);
                setPaying(false);
                return;
            }

            toast.success("Payment submitted! Your order is being processed.");
            navigate(`/order-confirmation?orderId=${orderId}`);

        } catch (err) {
            const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
            // "X" is no longer available — surface via the structured blocked-items UI,
            // not as a generic inline error, so the customer has a clear path forward.
            const unavailableMatch = msg.match(/"(.+?)" is no longer available/i);
            if (unavailableMatch) {
                onUnavailableItem(unavailableMatch[1]);
            } else {
                setPaymentError(msg);
            }
            setPaying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            {/* Shipping address summary */}
            <div style={{
                background:    "var(--surface-high)",
                border:        "1px solid var(--border)",
                borderTop:     "3px solid var(--accent)",
                borderRadius:  "var(--r-md)",
                padding:       "var(--space-4)",
                marginBottom:  "var(--space-5)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
                    <div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: "0 0 var(--space-1)" }}>
                            Ships to
                        </p>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)", margin: 0, whiteSpace: "pre-line", lineHeight: 1.6 }}>
                            {shippingAddress}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onEditAddress}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--text-2)", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: "4px 10px", flexShrink: 0, transition: "border-color var(--duration-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                        Edit
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: "var(--space-5)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "var(--space-3)" }}>
                    Payment Details
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                    <LockOutlinedIcon sx={{ fontSize: 13, color: "var(--text-3)" }} />
                    <span style={{ fontSize: "12px", color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Secured by Stripe</span>
                </div>
                <PaymentElement />
            </div>

            {paymentError && (
                <p style={{ color: "var(--error)", fontSize: "13px", marginBottom: "var(--space-3)", fontFamily: "var(--font-body)" }}>
                    {paymentError}
                </p>
            )}

            <div style={{ paddingTop: "var(--space-4)", borderTop: "1px solid var(--border)", marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)" }}>
                        Order Total
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "22px", color: "var(--text)" }}>
                        {fmtPrice(totalPrice)}
                    </span>
                </div>
                <button
                    type="submit"
                    disabled={!stripe || paying || hasBlockedItems}
                    style={{
                        width:         "100%",
                        padding:       "var(--space-4)",
                        background:    !stripe || paying || hasBlockedItems ? "var(--border)" : "var(--accent)",
                        color:         "var(--text)",
                        border:        "none",
                        borderRadius:  "var(--r-md)",
                        fontFamily:    "var(--font-body)",
                        fontWeight:    700,
                        fontSize:      "14px",
                        cursor:        !stripe || paying || hasBlockedItems ? "not-allowed" : "pointer",
                        display:       "flex",
                        alignItems:    "center",
                        justifyContent:"center",
                        gap:           "var(--space-2)",
                        letterSpacing: "0.02em",
                    }}
                >
                    {paying ? (
                        <>
                            <CircularProgress size={14} sx={{ color: "var(--text)" }} />
                            Processing…
                        </>
                    ) : (
                        <>
                            <LockOutlinedIcon sx={{ fontSize: 14 }} />
                            Pay {fmtPrice(totalPrice)} →
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

/*
|----------------------------------------------------------
| Address form — step 1
|----------------------------------------------------------
*/
const AddressForm = ({ onContinue, hasBlockedItems }) => {
    const [companyName, setCompanyName] = useState("");
    const [contactName, setContactName] = useState("");
    const [address1,    setAddress1]    = useState("");
    const [address2,    setAddress2]    = useState("");
    const [city,        setCity]        = useState("");
    const [state,       setState]       = useState("");
    const [zip,         setZip]         = useState("");
    const [country,     setCountry]     = useState("");
    const [phone,       setPhone]       = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!contactName.trim() || !address1.trim() || !city.trim() || !state.trim() || !zip.trim() || !country.trim()) {
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
        onContinue(lines.join("\n"));
    };

    return (
        <form onSubmit={handleSubmit}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "var(--space-4)" }}>
                Shipping Details
            </p>
            <Stack spacing={2}>
                <TextField label="Company Name"        value={companyName} onChange={(e) => setCompanyName(e.target.value)} fullWidth size="small" inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                <TextField label="Contact Name *"      value={contactName} onChange={(e) => setContactName(e.target.value)} fullWidth size="small" required inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                <TextField label="Address Line 1 *"    value={address1}    onChange={(e) => setAddress1(e.target.value)}    fullWidth size="small" required inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                <TextField label="Address Line 2"      value={address2}    onChange={(e) => setAddress2(e.target.value)}    fullWidth size="small" inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                <Stack direction="row" spacing={2}>
                    <TextField label="City *"           value={city}        onChange={(e) => setCity(e.target.value)}        fullWidth size="small" required inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                    <TextField label="State / Province *" value={state}     onChange={(e) => setState(e.target.value)}       fullWidth size="small" required inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField label="ZIP / Postal Code *" value={zip}     onChange={(e) => setZip(e.target.value)}         fullWidth size="small" required inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                    <TextField label="Country *"        value={country}     onChange={(e) => setCountry(e.target.value)}     fullWidth size="small" required inputProps={{ onAnimationStart: handleAutofillAnimation }} />
                </Stack>
                <TextField label="Phone (optional)"    value={phone}       onChange={(e) => setPhone(e.target.value)}       fullWidth size="small" inputProps={{ onAnimationStart: handleAutofillAnimation }} />
            </Stack>

            <button
                type="submit"
                disabled={hasBlockedItems}
                style={{
                    width:         "100%",
                    padding:       "var(--space-4)",
                    background:    hasBlockedItems ? "var(--border)" : "var(--accent)",
                    color:         "var(--text)",
                    border:        "none",
                    borderRadius:  "var(--r-md)",
                    fontFamily:    "var(--font-body)",
                    fontWeight:    700,
                    fontSize:      "14px",
                    cursor:        hasBlockedItems ? "not-allowed" : "pointer",
                    marginTop:     "var(--space-5)",
                    letterSpacing: "0.02em",
                }}
            >
                Continue to Payment →
            </button>
        </form>
    );
};

/*
|----------------------------------------------------------
| Page wrapper
|----------------------------------------------------------
*/
const CheckoutPage = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const stripePromise = useMemo(
        () => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
        []
    );

    const [cart,            setCart]            = useState(null);
    const [loading,         setLoading]         = useState(true);
    const [step,            setStep]            = useState("address");
    const [shippingAddress, setShippingAddress] = useState("");
    const [blockedItems,    setBlockedItems]    = useState([]);

    /* Body class lets CSS hide Stripe's injected Link button everywhere except checkout */
    useEffect(() => {
        document.body.classList.add("solyd-in-checkout");
        return () => document.body.classList.remove("solyd-in-checkout");
    }, []);

    useEffect(() => {
        if (!user?.userId) return;
        api.get(`/cart/${user.userId}`)
            .then(res => setCart(res.data))
            .catch(() => toast.error("Could not load cart"))
            .finally(() => setLoading(false));
    }, [user]);

    /* Pre-flight: check every cart item's current status as soon as cart loads */
    useEffect(() => {
        if (!cart?.items?.length) return;
        (async () => {
            const blocked = [];
            await Promise.allSettled(
                cart.items.map(async (item) => {
                    try {
                        const { data } = await api.get(`/public/products/${item.productId}`);
                        if (data?.status && data.status !== "ACTIVE") {
                            blocked.push({ id: item.productId, name: item.productName });
                        }
                    } catch { /* backend will also validate at order creation time */ }
                })
            );
            if (blocked.length) setBlockedItems(blocked);
        })();
    }, [cart]);

    /* Called by CheckoutForm when the backend rejects an item at payment time */
    const handleUnavailableItem = useCallback((name) => {
        setBlockedItems(prev =>
            prev.some(b => b.name === name) ? prev : [...prev, { id: null, name }]
        );
    }, []);

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
            <div className="solyd-spinner" />
            <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Preparing checkout…</p>
            <style>{`@keyframes solyd-spin { to { transform: rotate(360deg); } } .solyd-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: solyd-spin 0.8s linear infinite; }`}</style>
        </div>
    );

    const totalPrice = Number(cart?.totalPrice ?? 0);
    const cartItems  = cart?.items ?? [];

    if (!totalPrice || totalPrice === 0) return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)" }}>Your cart is empty.</p>
        </div>
    );

    const elementsOptions = {
        mode:               "payment",
        amount:             Math.round(totalPrice * 100),
        currency:           "usd",
        paymentMethodTypes: ["card"],
        wallets:            { applePay: "never", googlePay: "never" },
        appearance: {
            theme: "night",
            variables: {
                colorPrimary:    "#D4A373",
                colorBackground: "#1C2541",
                colorText:       "#F8FAFC",
                colorDanger:     "#c0392b",
                fontFamily:      "'IBM Plex Sans', system-ui, sans-serif",
                borderRadius:    "4px",
            },
        },
    };

    const stepNum = step === "address" ? 1 : 2;

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "var(--font-body)" }}>

            {/* ── Page Header ── */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "var(--space-6) var(--space-8)" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
                    CHECKOUT
                </h1>
            </div>

            {/* ── Step Indicator ── */}
            <StepIndicator step={stepNum} />

            {/* ── Content ── */}
            <div style={{ maxWidth: "960px", margin: "0 auto", padding: "var(--space-6)" }}>

                {/* Back link */}
                <button
                    onClick={() => step === "payment" ? setStep("address") : navigate("/cart")}
                    style={{
                        background:  "none",
                        border:      "none",
                        cursor:      "pointer",
                        color:       "var(--text-3)",
                        fontFamily:  "var(--font-body)",
                        fontSize:    "13px",
                        display:     "flex",
                        alignItems:  "center",
                        gap:         "var(--space-2)",
                        padding:     0,
                        marginBottom:"var(--space-5)",
                        transition:  "color var(--duration-fast)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.textDecoration = "underline"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.textDecoration = "none"; }}
                >
                    <HiArrowLeft style={{ fontSize: 14 }} />
                    {step === "payment" ? "Back to Shipping" : "Back to Cart"}
                </button>

                {/* ── Two-column layout ── */}
                <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-6)" }}>

                    {/* ── Form column ── */}
                    <div>

                        {/* Unavailable items alert — shown on both steps */}
                        {blockedItems.length > 0 && (
                            <div style={{
                                background:   "var(--error-subtle)",
                                border:       "1px solid var(--error)",
                                borderLeft:   "4px solid var(--error)",
                                borderRadius: "var(--r-md)",
                                padding:      "var(--space-4) var(--space-5)",
                                marginBottom: "var(--space-5)",
                            }}>
                                <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "14px", color: "var(--error)", margin: "0 0 var(--space-2)" }}>
                                    {blockedItems.length === 1
                                        ? "1 item in your cart is no longer available"
                                        : `${blockedItems.length} items in your cart are no longer available`}
                                </p>
                                <ul style={{ margin: "0 0 var(--space-3)", paddingLeft: "var(--space-5)" }}>
                                    {blockedItems.map((b, i) => (
                                        <li key={i} style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--error)", margin: "2px 0" }}>
                                            "{b.name}" has been removed from sale
                                        </li>
                                    ))}
                                </ul>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-2)", margin: "0 0 var(--space-3)" }}>
                                    Remove {blockedItems.length === 1 ? "this item" : "these items"} from your cart to continue with your order.
                                </p>
                                <button
                                    onClick={() => navigate("/cart")}
                                    style={{
                                        background:   "var(--error)",
                                        color:        "#fff",
                                        border:       "none",
                                        borderRadius: "var(--r-sm)",
                                        padding:      "var(--space-2) var(--space-4)",
                                        fontFamily:   "var(--font-body)",
                                        fontSize:     "13px",
                                        fontWeight:   700,
                                        cursor:       "pointer",
                                    }}
                                >
                                    Return to Cart →
                                </button>
                            </div>
                        )}

                        <div style={{
                            background:   "var(--surface-mid)",
                            border:       "1px solid var(--border)",
                            borderRadius: "var(--r-md)",
                            padding:      "var(--space-6)",
                        }}>
                            {step === "address" && (
                                <AddressForm
                                    hasBlockedItems={blockedItems.length > 0}
                                    onContinue={(formatted) => { setShippingAddress(formatted); setStep("payment"); }}
                                />
                            )}

                            {step === "payment" && (
                                <Elements stripe={stripePromise} options={elementsOptions}>
                                    <CheckoutForm
                                        totalPrice={totalPrice}
                                        shippingAddress={shippingAddress}
                                        onEditAddress={() => setStep("address")}
                                        hasBlockedItems={blockedItems.length > 0}
                                        onUnavailableItem={handleUnavailableItem}
                                    />
                                </Elements>
                            )}
                        </div>
                    </div>

                    {/* ── Order Summary column ── */}
                    <div className="checkout-summary" style={{ alignSelf: "start" }}>
                        <div style={{
                            background:   "var(--surface-mid)",
                            border:       "1px solid var(--border)",
                            borderRadius: "var(--r-md)",
                            overflow:     "hidden",
                        }}>
                            <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border)" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", margin: 0 }}>
                                    Your Order
                                </p>
                            </div>

                            <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                                {cartItems.map((item, i) => (
                                    <div
                                        key={item.productId ?? i}
                                        style={{
                                            display:       "flex",
                                            alignItems:    "center",
                                            gap:           "var(--space-3)",
                                            padding:       "var(--space-3) 0",
                                            borderBottom:  i < cartItems.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                        }}
                                    >
                                        <div style={{ width: "36px", height: "36px", background: "var(--surface-high)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                            ) : (
                                                <HiCube style={{ fontSize: "16px", color: "var(--text-4)" }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {item.productName}
                                            </p>
                                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)", margin: 0 }}>
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 600, color: "var(--text)", flexShrink: 0 }}>
                                            {fmtPrice(Number(item.price) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)" }}>
                                    Total
                                </span>
                                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "18px", color: "var(--text)" }}>
                                    {fmtPrice(totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes solyd-spin { to { transform: rotate(360deg); } }
                .solyd-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: solyd-spin 0.8s linear infinite; }
                @media (min-width: 768px) {
                    .checkout-grid { grid-template-columns: 3fr 2fr !important; }
                    .checkout-summary { position: sticky; top: 24px; }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;
