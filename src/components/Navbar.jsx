import { Link } from "react-router-dom";

const Navbar = () => {

    return (

        <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center">

            <h1 className="text-3xl font-bold">
                SolydShop
            </h1>

            <div className="flex items-center gap-6 text-lg">

                <Link to="/" className="hover:text-blue-400">
                    Home
                </Link>

                <Link to="/login" className="hover:text-blue-400">
                    Login
                </Link>

                <Link to="/register" className="hover:text-blue-400">
                    Register
                </Link>

            </div>

        </nav>
    );
};

export default Navbar;