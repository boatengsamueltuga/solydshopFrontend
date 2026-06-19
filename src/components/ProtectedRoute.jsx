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
            <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)" }}>
                <div style={{ width: "28px", height: "28px", border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "solyd-spin 0.8s linear infinite" }} />
                <p style={{ color: "var(--text-3)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading…</p>
                <style>{`@keyframes solyd-spin { to { transform: rotate(360deg); } }`}</style>
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