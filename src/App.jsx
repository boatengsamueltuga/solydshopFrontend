import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

function StripeFloatingHider() {
    const { pathname } = useLocation();
    useEffect(() => {
        if (pathname === "/checkout") return;
        const hide = () => {
            document.querySelectorAll("iframe").forEach(iframe => {
                const src  = iframe.src  || "";
                const name = iframe.name || "";
                if (src.includes("stripe") || name.toLowerCase().includes("stripe")) {
                    iframe.style.setProperty("display", "none", "important");
                    const p = iframe.parentElement;
                    if (p && p !== document.body && p.parentElement === document.body) {
                        p.style.setProperty("display", "none", "important");
                    }
                }
            });
            Array.from(document.body.children).forEach(el => {
                if (el.id === "root") return;
                const id  = (el.id        || "").toLowerCase();
                const cls = (el.className || "").toLowerCase();
                if (id.includes("stripe") || cls.includes("stripe")) {
                    el.style.setProperty("display", "none", "important");
                }
            });
        };
        hide();
        const t = setTimeout(hide, 800);
        return () => clearTimeout(t);
    }, [pathname]);
    return null;
}

const PageLoader = () => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-4)" }}>Loading…</span>
    </div>
);

import Navbar           from "./components/Navbar";
import ProtectedRoute   from "./components/ProtectedRoute";
import MobileBottomNav  from "./components/navigation/MobileBottomNav";
import Footer           from "./components/Footer";
import ScrollToTop      from "./components/ScrollToTop";

import { restoreUser, setInitialized } from "./features/auth/authSlice";
import api from "./api/api";

const HomePage             = lazy(() => import("./pages/HomePage"));
const LoginPage            = lazy(() => import("./pages/LoginPage"));
const RegisterPage         = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage   = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage    = lazy(() => import("./pages/ResetPasswordPage"));
const CartPage             = lazy(() => import("./pages/CartPage"));
const CheckoutPage         = lazy(() => import("./pages/CheckoutPage"));
const OrdersPage           = lazy(() => import("./pages/OrdersPage"));
const SellerDashboardPage  = lazy(() => import("./pages/SellerDashboardPage"));
const SellerProductFormPage = lazy(() => import("./pages/SellerProductFormPage"));
const NotFoundPage         = lazy(() => import("./pages/NotFoundPage"));
const UserAccountPage      = lazy(() => import("./pages/UserAccountPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const AdminDashboardPage   = lazy(() => import("./pages/AdminDashboardPage"));
const AdminProductsPage    = lazy(() => import("./pages/AdminProductsPage"));
const AdminCategoriesPage  = lazy(() => import("./pages/AdminCategoriesPage"));
const AdminOrdersPage      = lazy(() => import("./pages/AdminOrdersPage"));
const AdminUsersPage       = lazy(() => import("./pages/AdminUsersPage"));
const ProductDetailPage    = lazy(() => import("./pages/ProductDetailPage"));
const AboutPage            = lazy(() => import("./pages/AboutPage"));
const TermsPage            = lazy(() => import("./pages/TermsPage"));
const PrivacyPage          = lazy(() => import("./pages/PrivacyPage"));
const SupportPage          = lazy(() => import("./pages/SupportPage"));
const ContactPage          = lazy(() => import("./pages/ContactPage"));

const NO_FOOTER_PREFIXES = ["/admin", "/seller", "/login", "/register", "/forgot-password", "/reset-password"];

function App() {

    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const showFooter = !NO_FOOTER_PREFIXES.some(p => pathname.startsWith(p));

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await api.get("/auth/me");
                dispatch(restoreUser(response.data));
            } catch {
                // no active session — expected for unauthenticated users
            } finally {
                dispatch(setInitialized());
            }
        };
        restoreSession();
    }, [dispatch]);

    return (
        <div className="app-root-body">

            <StripeFloatingHider />
            <ScrollToTop />

            <Navbar />

            <Suspense fallback={<PageLoader />}>
                <Routes>

                    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

                    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />

                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

                    <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={["ROLE_SELLER"]}><SellerDashboardPage /></ProtectedRoute>} />
                    <Route path="/seller/products/new" element={<ProtectedRoute allowedRoles={["ROLE_SELLER"]}><SellerProductFormPage /></ProtectedRoute>} />
                    <Route path="/seller/products/:id/edit" element={<ProtectedRoute allowedRoles={["ROLE_SELLER"]}><SellerProductFormPage /></ProtectedRoute>} />

                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboardPage /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminProductsPage /></ProtectedRoute>} />
                    <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminCategoriesPage /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminOrdersPage /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminUsersPage /></ProtectedRoute>} />

                    <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />

                    <Route path="/login"           element={<LoginPage />} />
                    <Route path="/register"        element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password"  element={<ResetPasswordPage />} />

                    <Route path="/account" element={<ProtectedRoute><UserAccountPage /></ProtectedRoute>} />

                    <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

                    <Route path="/about"   element={<AboutPage />} />
                    <Route path="/terms"   element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    <Route path="*" element={<NotFoundPage />} />

                </Routes>
            </Suspense>

            {showFooter && <Footer />}

            <MobileBottomNav />

        </div>
    );
}

export default App;
