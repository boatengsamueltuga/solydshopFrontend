import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
    useSelector,
    useDispatch
} from "react-redux";

import {
    logoutSuccess
} from "../features/auth/authSlice";

import api from "../api/api";

import { HiMenu, HiX } from "react-icons/hi";

import {
    FaHome,
    FaShoppingCart,
    FaBoxOpen,
    FaStore,
    FaUserShield,
    FaSignInAlt,
    FaUserPlus,
    FaSignOutAlt,
} from "react-icons/fa";

import { Avatar, Button, IconButton, Tooltip } from "@mui/material";

const getRoleColor = (roles) => {
    if (roles?.includes("ROLE_ADMIN"))  return "#d32f2f";
    if (roles?.includes("ROLE_SELLER")) return "#ed6c02";
    return "#1976d2";
};

const getRoleLabel = (roles) => {
    if (roles?.includes("ROLE_ADMIN"))  return "Admin";
    if (roles?.includes("ROLE_SELLER")) return "Seller";
    return "User";
};

const Navbar = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen] = useState(false);

    const {
        isAuthenticated,
        user
    } = useSelector(
        (state) => state.auth
    );

    const handleLogout = async () => {

        try {

            await api.post("/auth/logout");

            dispatch(logoutSuccess());

            navigate("/login");

        } catch (error) {

            console.log(error);

            alert("Logout failed");
        }
    };

    const closeMenu = () => setMenuOpen(false);

    const navLinkSx = {
        color: "white",
        textTransform: "none",
        fontSize: "1rem",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
    };

    const logoutSx = {
        color: "white",
        textTransform: "none",
        fontSize: "1rem",
        borderColor: "rgba(255,255,255,0.5)",
        "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" }
    };

    const mobileNavLinkSx = {
        color: "white",
        textTransform: "none",
        fontSize: "1rem",
        justifyContent: "flex-start",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
    };

    return (

        <nav className="bg-gray-950 text-white px-6 md:px-10 py-4 md:py-6">

            <div className="flex justify-between items-center">

                <Link to="/" className="flex items-center gap-2 text-white no-underline hover:opacity-80 transition-opacity">
                    <FaStore className="text-2xl md:text-4xl" />
                    <h1 className="text-3xl md:text-5xl font-bold">
                        SolydShop
                    </h1>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-2">

                    <Button component={Link} to="/" sx={navLinkSx} startIcon={<FaHome />}>
                        Home
                    </Button>

                    {isAuthenticated && (
                        <Button component={Link} to="/cart" sx={navLinkSx} startIcon={<FaShoppingCart />}>
                            Cart
                        </Button>
                    )}

                    {isAuthenticated && (
                        <Button component={Link} to="/orders" sx={navLinkSx} startIcon={<FaBoxOpen />}>
                            Orders
                        </Button>
                    )}

                    {user?.roles?.includes("ROLE_SELLER") && (
                        <Button component={Link} to="/seller/dashboard" sx={navLinkSx} startIcon={<FaStore />}>
                            Seller Dashboard
                        </Button>
                    )}

                    {user?.roles?.includes("ROLE_ADMIN") && (
                        <Button component={Link} to="/admin/dashboard" sx={navLinkSx} startIcon={<FaUserShield />}>
                            Admin Dashboard
                        </Button>
                    )}

                    {!isAuthenticated && (
                        <>
                            <Button component={Link} to="/login" sx={navLinkSx} startIcon={<FaSignInAlt />}>
                                Login
                            </Button>

                            <Button
                                component={Link}
                                to="/register"
                                variant="contained"
                                startIcon={<FaUserPlus />}
                                sx={{ textTransform: "none", fontSize: "1rem" }}
                            >
                                Register
                            </Button>
                        </>
                    )}

                    {isAuthenticated && (
                        <Tooltip
                            title={`${user?.email} · ${getRoleLabel(user?.roles)}`}
                            arrow
                        >
                            <Avatar
                                sx={{
                                    bgcolor: getRoleColor(user?.roles),
                                    width: 38,
                                    height: 38,
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    cursor: "default",
                                    ml: 1,
                                }}
                            >
                                {user?.email?.[0]?.toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    )}

                    {isAuthenticated && (
                        <Button variant="outlined" onClick={handleLogout} sx={logoutSx} startIcon={<FaSignOutAlt />}>
                            Logout
                        </Button>
                    )}

                </div>

                {/* Hamburger button — mobile only */}
                <IconButton
                    className="md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                    sx={{ color: "white", display: { md: "none" } }}
                >
                    {menuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
                </IconButton>

            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="flex flex-col pt-4 pb-2 border-t border-gray-700 mt-4 md:hidden">

                    {isAuthenticated && (
                        <div className="flex items-center gap-3 px-2 pb-3 mb-1 border-b border-gray-700">
                            <Avatar
                                sx={{
                                    bgcolor: getRoleColor(user?.roles),
                                    width: 40,
                                    height: 40,
                                    fontSize: "1.1rem",
                                    fontWeight: "bold",
                                }}
                            >
                                {user?.email?.[0]?.toUpperCase()}
                            </Avatar>
                            <div>
                                <p className="text-white text-sm font-semibold leading-tight">{user?.email}</p>
                                <p className="text-gray-400 text-xs">{getRoleLabel(user?.roles)}</p>
                            </div>
                        </div>
                    )}

                    <Button component={Link} to="/" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaHome />}>
                        Home
                    </Button>

                    {isAuthenticated && (
                        <Button component={Link} to="/cart" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaShoppingCart />}>
                            Cart
                        </Button>
                    )}

                    {isAuthenticated && (
                        <Button component={Link} to="/orders" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaBoxOpen />}>
                            Orders
                        </Button>
                    )}

                    {user?.roles?.includes("ROLE_SELLER") && (
                        <Button component={Link} to="/seller/dashboard" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaStore />}>
                            Seller Dashboard
                        </Button>
                    )}

                    {user?.roles?.includes("ROLE_ADMIN") && (
                        <Button component={Link} to="/admin/dashboard" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaUserShield />}>
                            Admin Dashboard
                        </Button>
                    )}

                    {!isAuthenticated && (
                        <>
                            <Button component={Link} to="/login" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaSignInAlt />}>
                                Login
                            </Button>

                            <Button component={Link} to="/register" onClick={closeMenu} sx={mobileNavLinkSx} startIcon={<FaUserPlus />}>
                                Register
                            </Button>
                        </>
                    )}

                    {isAuthenticated && (
                        <Button
                            onClick={() => { handleLogout(); closeMenu(); }}
                            sx={{ ...mobileNavLinkSx, color: "#f87171" }}
                            startIcon={<FaSignOutAlt />}
                        >
                            Logout
                        </Button>
                    )}

                </div>
            )}

        </nav>
    );
};

export default Navbar;
