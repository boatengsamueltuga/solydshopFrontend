import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "../../features/auth/authSlice";
import api from "../../api/api";
import { HiHome, HiClipboardList, HiUser } from "react-icons/hi";
import { FaShoppingCart } from "react-icons/fa";

const NavTab = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            flex:           1,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "3px",
            background:     "none",
            border:         "none",
            cursor:         "pointer",
            padding:        "6px 0",
            color:          active ? "var(--accent)" : "var(--text-3)",
            transition:     "color var(--duration-fast)",
            minHeight:      "44px",
        }}
    >
        <Icon style={{ fontSize: "20px" }} />
        <span style={{
            fontSize:   "10px",
            fontFamily: "var(--font-body)",
            fontWeight: active ? 600 : 400,
            lineHeight: 1,
        }}>
            {label}
        </span>
    </button>
);

const MobileBottomNav = () => {
    const location            = useLocation();
    const navigate            = useNavigate();
    const dispatch            = useDispatch();
    const { isAuthenticated } = useSelector((s) => s.auth);

    const path = location.pathname;

    if (
        !isAuthenticated           ||
        path.startsWith("/admin")  ||
        path.startsWith("/seller") ||
        path === "/login"          ||
        path === "/register"       ||
        path.startsWith("/forgot") ||
        path.startsWith("/reset")
    ) return null;

    const handleLogout = async () => {
        try { await api.post("/auth/signout"); } catch (e) { console.log(e); }
        dispatch(logoutSuccess());
        navigate("/login");
    };

    return (
        <>
            <nav
                className="mobile-bottom-nav"
                style={{
                    position:   "fixed",
                    bottom:     0,
                    left:       0,
                    right:      0,
                    height:     "64px",
                    background: "var(--surface)",
                    borderTop:  "1px solid var(--border)",
                    zIndex:     "var(--z-sticky)",
                }}
            >
                <NavTab icon={HiHome}        label="Home"    active={path === "/"}        onClick={() => navigate("/")}       />
                <NavTab icon={FaShoppingCart} label="Cart"    active={path === "/cart"}    onClick={() => navigate("/cart")}   />
                <NavTab icon={HiClipboardList} label="Orders" active={path === "/orders"}  onClick={() => navigate("/orders")} />
                <NavTab icon={HiUser}        label="Account"  active={false}              onClick={handleLogout}              />
            </nav>
            <style>{`
                .mobile-bottom-nav { display: none !important; }
                @media (max-width: 767px) {
                    .mobile-bottom-nav { display: flex !important; }
                    .app-root-body { padding-bottom: 64px; }
                }
            `}</style>
        </>
    );
};

export default MobileBottomNav;
