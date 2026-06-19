import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess } from "../features/auth/authSlice";
import api from "../api/api";
import { HiMenu, HiX } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";

// ── Design tokens ────────────────────────────────────────────
const C = {
    bg:          "#1B2A3D",
    border:      "#2D4263",
    primary:     "#8ed5ff",
    text:        "#dee3e8",
    textMuted:   "#bdc8d1",
    surfaceHigh: "#243447",
    btnBg:       "#38bdf8",
    btnText:     "#003a57",
};

const Navbar = () => {
    const navigate   = useNavigate();
    const location   = useLocation();
    const dispatch   = useDispatch();
    const [menuOpen, setMenuOpen] = useState(false);

    const { isAuthenticated, user } = useSelector((s) => s.auth);

    const isAdmin  = user?.roles?.includes("ROLE_ADMIN");
    const isSeller = user?.roles?.includes("ROLE_SELLER");

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            dispatch(logoutSuccess());
            navigate("/login");
        } catch {
            // logout is best-effort; clear local state regardless
        }
    };

    const closeMenu = () => setMenuOpen(false);

    const initials = user?.email?.[0]?.toUpperCase() ?? "U";

    const roleColor = isAdmin ? "#ef4444" : isSeller ? "#f97316" : C.btnBg;

    // ── Desktop link helper ──────────────────────────────────
    const NavLink = ({ to, children }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    color: active ? C.primary : C.textMuted,
                    textDecoration: "none",
                    paddingBottom: active ? "4px" : "6px",
                    borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
                    transition: "color 0.15s, border-color 0.15s",
                    fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = C.primary; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = C.textMuted; }}
            >
                {children}
            </Link>
        );
    };

    return (
        <>
            {/* ── Fixed Header ──────────────────────────────────── */}
            <header
                className="fixed top-0 left-0 right-0 z-50 w-full"
                style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}
            >
                <div
                    className="flex justify-between items-center w-full mx-auto h-20"
                    style={{ maxWidth: "1440px", padding: "0 40px" }}
                >
                    {/* ── Left: Logo + Nav links ──────────────────── */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link
                            to="/"
                            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
                        >
                            <span
                                style={{
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    color: C.primary,
                                    fontFamily: "Inter, sans-serif",
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                SolydShop
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink to="/">Home</NavLink>

                            {isAuthenticated && <NavLink to="/cart">Cart</NavLink>}
                            {isAuthenticated && <NavLink to="/orders">Orders</NavLink>}
                            {isSeller        && <NavLink to="/seller/dashboard">Seller</NavLink>}
                            {isAdmin         && <NavLink to="/admin/dashboard">Admin</NavLink>}
                        </nav>
                    </div>

                    {/* ── Right: Search + Cart + User ─────────────── */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Cart icon */}
                        <button
                            onClick={() => navigate("/cart")}
                            className="relative transition-colors hover:opacity-80"
                            style={{ color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                        >
                            <FaShoppingCart size={20} />
                        </button>

                        {/* Auth: avatar or login/register */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div
                                    title={`${user?.email}`}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-default flex-shrink-0"
                                    style={{ background: roleColor, color: "#fff", border: `1px solid ${C.border}` }}
                                >
                                    {initials}
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium transition-colors hover:opacity-80"
                                    style={{ color: C.textMuted, background: "none", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.primary)}
                                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    style={{ fontSize: "14px", fontWeight: 500, color: C.textMuted, textDecoration: "none", fontFamily: "Inter, sans-serif" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-bold rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
                                    style={{ background: C.btnBg, color: C.btnText, textDecoration: "none", fontFamily: "Inter, sans-serif" }}
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ── Mobile: hamburger ───────────────────────── */}
                    <button
                        className="md:hidden p-2 rounded-lg transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{ color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}
                    >
                        {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                    </button>
                </div>

                {/* ── Mobile dropdown ──────────────────────────────── */}
                {menuOpen && (
                    <div
                        className="md:hidden flex flex-col px-6 pb-4 gap-1"
                        style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}
                    >
                        {/* User info */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-3 py-3 mt-1" style={{ borderBottom: `1px solid ${C.border}` }}>
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ background: roleColor, color: "#fff" }}
                                >
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: C.text }}>{user?.email}</p>
                                    <p className="text-xs" style={{ color: C.textMuted }}>
                                        {isAdmin ? "Admin" : isSeller ? "Seller" : "User"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Mobile links */}
                        {[
                            { to: "/",                   label: "Home",             show: true },
                            { to: "/cart",               label: "Cart",             show: isAuthenticated },
                            { to: "/orders",             label: "Orders",           show: isAuthenticated },
                            { to: "/seller/dashboard",   label: "Seller Dashboard", show: isSeller },
                            { to: "/admin/dashboard",    label: "Admin Dashboard",  show: isAdmin },
                        ].filter((l) => l.show).map((l) => (
                            <Link
                                key={l.to}
                                to={l.to}
                                onClick={closeMenu}
                                className="py-2.5 text-sm font-medium transition-colors"
                                style={{ color: isActive(l.to) ? C.primary : C.textMuted, textDecoration: "none" }}
                            >
                                {l.label}
                            </Link>
                        ))}

                        {!isAuthenticated ? (
                            <div className="flex gap-3 mt-2">
                                <Link to="/login"    onClick={closeMenu} className="flex-1 text-center py-2 text-sm rounded-lg" style={{ border: `1px solid ${C.border}`, color: C.textMuted, textDecoration: "none" }}>Login</Link>
                                <Link to="/register" onClick={closeMenu} className="flex-1 text-center py-2 text-sm font-bold rounded-lg" style={{ background: C.btnBg, color: C.btnText, textDecoration: "none" }}>Register</Link>
                            </div>
                        ) : (
                            <button
                                onClick={() => { handleLogout(); closeMenu(); }}
                                className="mt-2 py-2.5 text-sm text-left transition-colors"
                                style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer" }}
                            >
                                Logout
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* ── Spacer so content doesn't hide under fixed nav ── */}
            <div style={{ height: "80px" }} />
        </>
    );
};

export default Navbar;
