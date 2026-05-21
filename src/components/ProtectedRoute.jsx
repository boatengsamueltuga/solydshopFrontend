import { Navigate } from "react-router-dom";

import { useSelector } from "react-redux";

const ProtectedRoute = ({
    children,
    allowedRoles
}) => {

    const {
        user,
        isAuthenticated,
        isInitialized
    } = useSelector(
        (state) => state.auth
    );

    /*
    ---------------------------------------------------------------
    | Wait For Authentication Initialization
    ---------------------------------------------------------------
    */

    if (!isInitialized) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <h1 className="text-2xl font-bold">
                    Loading...
                </h1>

            </div>
        );
    }

    /*
    ---------------------------------------------------------------
    | Redirect Unauthenticated Users
    ---------------------------------------------------------------
    */

    if (!isAuthenticated) {

        return <Navigate to="/login" />;
    }

    /*
    ---------------------------------------------------------------
    | Role-Based Authorization
    ---------------------------------------------------------------
    */

    if (
        allowedRoles &&
        !allowedRoles.some(role =>
            user?.roles?.includes(role)
        )
    ) {

        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;