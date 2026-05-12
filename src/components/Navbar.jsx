import { Link, useNavigate } from "react-router-dom";

import {
    useSelector,
    useDispatch
} from "react-redux";

import {
    logoutSuccess
} from "../features/auth/authSlice";

import api from "../api/api";

const Navbar = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const { isAuthenticated } = useSelector(
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

    return (

        <nav className="bg-gray-950 text-white px-10 py-6 flex justify-between items-center">

            <h1 className="text-5xl font-bold">
                SolydShop
            </h1>

            <div className="flex gap-10 text-2xl">

                <Link to="/">
                    Home
                </Link>

                {!isAuthenticated && (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

                {isAuthenticated && (

                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                )}

            </div>

        </nav>
    );
};

export default Navbar;