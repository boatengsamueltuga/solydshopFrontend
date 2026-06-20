import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess } from "../features/auth/authSlice";
import api from "../api/api";
import { HiMenu, HiX, HiChevronDown, HiUser, HiClipboardList, HiLogout } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";

// ── Design tokens ────────────────────────────────────────────
const C = {
    bg:          "#fefae0",   /* --bg            */
    border:      "#bccf98",   /* --border        */
    primary:     "#d4a373",   /* --accent        */
    text:        "#3a2010",   /* --text          */
    textMuted:   "#8a6440",   /* --text-3        */
    surfaceHigh: "#ccd5ae",   /* --surface-high  */
    btnBg:       "#d4a373",   /* --accent        */
    btnText:     "#3a2010",   /* dark text on caramel */
};

const Navbar = () => {
    const navigate   = useNavigate();
    const location   = useLocation();
    const dispatch   = useDispatch();

    const [menuOpen,     setMenuOpen]     = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount,    setCartCount]    = useState(0);
    const dropdownRef = useRef(null);

    const { isAuthenticated, user } = useSelector((s) => s.auth);

    const isAdmin  = user?.roles?.includes("ROLE_ADMIN");
    const isSeller = user?.roles?.includes("ROLE_SELLER");
    const roleLabel = isAdmin ? "Admin" : isSeller ? "Seller" : "Buyer";
    const roleColor = isAdmin ? "#8a1c12" : isSeller ? "#7a4e0a" : C.btnBg;

    const isActive = (path) => location.pathname === path;
    const initials  = user?.email?.[0]?.toUpperCase() ?? "U";

    // Fetch cart count on mount and on each navigation
    useEffect(() => {
        if (!isAuthenticated || !user?.userId) { setCartCount(0); return; }
        api.get(`/cart/${user.userId}`)
            .then(res => {
                const items = res.data?.items ?? [];
                setCartCount(items.reduce((s, i) => s + i.quantity, 0));
            })
            .catch(() => {});
    }, [isAuthenticated, user?.userId, location.pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [dropdownOpen]);

    const handleLogout = async () => {
        setDropdownOpen(false);
        try {
            await api.post("/auth/logout");
            dispatch(logoutSuccess());
            navigate("/login");
        } catch {
            // best-effort — clear local state regardless
        }
    };

    const closeMenu = () => setMenuOpen(false);

    // ── Desktop nav link ─────────────────────────────────────
    const NavLink = ({ to, children }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                style={{
                    fontSize:      "14px",
                    fontWeight:    500,
                    letterSpacing: "0.01em",
                    color:         active ? C.text : C.textMuted,
                    textDecoration:"none",
                    paddingBottom: active ? "4px" : "6px",
                    borderBottom:  active ? `2px solid ${C.primary}` : "2px solid transparent",
                    transition:    "color 0.15s, border-color 0.15s",
                    fontFamily:    "Inter, sans-serif",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = C.text; }}
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
                        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                            <span style={{ fontSize: "24px", fontWeight: 700, color: C.primary, fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}>
                                SolydShop
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <NavLink to="/">Home</NavLink>
                            {isAuthenticated && <NavLink to="/orders">Orders</NavLink>}
                            {isSeller        && <NavLink to="/seller/dashboard">Seller</NavLink>}
                            {isAdmin         && <NavLink to="/admin/dashboard">Admin</NavLink>}
                        </nav>
                    </div>

                    {/* ── Right: Cart + Account ───────────────────── */}
                    <div className="hidden md:flex items-center gap-3">

                        {/* Cart icon with badge */}
                        <button
                            onClick={() => navigate("/cart")}
                            aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"}
                            style={{ position: "relative", color: C.textMuted, background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", borderRadius: "8px", transition: "color 0.15s" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = C.text}
                            onMouseLeave={(e) => e.currentTarget.style.color = C.textMuted}
                        >
                            <FaShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span style={{
                                    position:   "absolute",
                                    top:        "-3px",
                                    right:      "-4px",
                                    minWidth:   "17px",
                                    height:     "17px",
                                    borderRadius: "9px",
                                    background: C.primary,
                                    color:      C.text,
                                    fontSize:   "10px",
                                    fontWeight: 700,
                                    fontFamily: "Inter, sans-serif",
                                    display:    "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding:    "0 4px",
                                    border:     `1.5px solid ${C.bg}`,
                                    lineHeight: 1,
                                }}>
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </button>

                        {/* Auth section */}
                        {isAuthenticated ? (

                            /* Account dropdown */
                            <div ref={dropdownRef} style={{ position: "relative" }}>
                                <button
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    aria-label="Account menu"
                                    aria-expanded={dropdownOpen}
                                    style={{
                                        display:      "flex",
                                        alignItems:   "center",
                                        gap:          "6px",
                                        background:   "none",
                                        border:       `1px solid ${dropdownOpen ? C.primary : C.border}`,
                                        borderRadius: "10px",
                                        padding:      "4px 10px 4px 4px",
                                        cursor:       "pointer",
                                        transition:   "border-color 0.15s",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = C.primary}
                                    onMouseLeave={(e) => { if (!dropdownOpen) e.currentTarget.style.borderColor = C.border; }}
                                >
                                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: roleColor, color: "#fff", fontSize: "12px", fontWeight: 700, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {initials}
                                    </div>
                                    <span style={{ fontSize: "13px", fontWeight: 500, color: C.text, fontFamily: "Inter, sans-serif", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {user?.email?.split("@")[0]}
                                    </span>
                                    <HiChevronDown size={14} style={{ color: C.textMuted, transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
                                </button>

                                {dropdownOpen && (
                                    <div style={{
                                        position:     "absolute",
                                        top:          "calc(100% + 8px)",
                                        right:        0,
                                        width:        "220px",
                                        background:   C.bg,
                                        border:       `1px solid ${C.border}`,
                                        borderRadius: "10px",
                                        boxShadow:    "0 8px 24px rgba(58,32,16,0.12)",
                                        overflow:     "hidden",
                                        zIndex:       200,
                                    }}>
                                        {/* Email + role */}
                                        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                                            <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: C.text, fontFamily: "Inter, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {user?.email}
                                            </p>
                                            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "4px", background: roleColor, color: "#fff", fontSize: "10px", fontWeight: 700, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                {roleLabel}
                                            </span>
                                        </div>

                                        {/* Links */}
                                        <div style={{ padding: "6px 0" }}>
                                            {[
                                                { to: "/account", label: "My Account", Icon: HiUser },
                                                { to: "/orders",  label: "My Orders",  Icon: HiClipboardList },
                                            ].map(({ to, label, Icon }) => (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    onClick={() => setDropdownOpen(false)}
                                                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 16px", fontSize: "13px", color: C.textMuted, textDecoration: "none", fontFamily: "Inter, sans-serif", transition: "background 0.12s, color 0.12s" }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceHigh; e.currentTarget.style.color = C.text; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; }}
                                                >
                                                    <Icon size={15} style={{ flexShrink: 0 }} />
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Logout */}
                                        <div style={{ borderTop: `1px solid ${C.border}`, padding: "6px 0" }}>
                                            <button
                                                onClick={handleLogout}
                                                style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 16px", fontSize: "13px", color: "var(--error)", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left", transition: "background 0.12s" }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHigh}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                            >
                                                <HiLogout size={15} style={{ flexShrink: 0 }} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                    <p className="text-xs" style={{ color: C.textMuted }}>{roleLabel}</p>
                                </div>
                            </div>
                        )}

                        {/* Mobile links */}
                        {[
                            { to: "/",                   label: "Home",             show: true },
                            { to: "/cart",               label: "Cart",             show: isAuthenticated },
                            { to: "/orders",             label: "Orders",           show: isAuthenticated },
                            { to: "/account",            label: "My Account",       show: isAuthenticated },
                            { to: "/seller/dashboard",   label: "Seller Dashboard", show: isSeller },
                            { to: "/admin/dashboard",    label: "Admin Dashboard",  show: isAdmin },
                        ].filter((l) => l.show).map((l) => (
                            <Link
                                key={l.to}
                                to={l.to}
                                onClick={closeMenu}
                                className="py-2.5 text-sm font-medium transition-colors"
                                style={{ color: isActive(l.to) ? C.text : C.textMuted, textDecoration: "none" }}
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
                                style={{ color: "var(--error)", background: "none", border: "none", cursor: "pointer" }}
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
