import { Link } from "react-router-dom";

const NotFoundPage = () => (
    <div style={{
        minHeight:      "100vh",
        background:     "var(--bg)",
        color:          "var(--text)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontFamily:     "var(--font-body)",
        padding:        "var(--space-6)",
        textAlign:      "center",
    }}>
        <div style={{ maxWidth: "480px" }}>

            <p style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "clamp(6rem, 15vw, 9rem)",
                fontWeight:    700,
                color:         "var(--accent)",
                lineHeight:    1,
                margin:        "0 0 var(--space-6)",
                letterSpacing: "-0.02em",
            }}>
                404
            </p>

            <h1 style={{
                fontFamily:    "var(--font-display)",
                fontWeight:    700,
                fontSize:      "var(--text-2xl)",
                color:         "var(--text)",
                letterSpacing: "-0.01em",
                margin:        "0 0 var(--space-3)",
            }}>
                Page not found
            </h1>

            <p style={{
                fontSize:      "var(--text-sm)",
                color:         "var(--text-3)",
                lineHeight:    1.6,
                marginBottom:  "var(--space-8)",
            }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <Link
                to="/"
                style={{
                    display:       "inline-block",
                    padding:       "var(--space-3) var(--space-6)",
                    background:    "var(--accent)",
                    color:         "var(--text)",
                    textDecoration: "none",
                    borderRadius:  "var(--r-md)",
                    fontFamily:    "var(--font-body)",
                    fontWeight:    700,
                    fontSize:      "var(--text-sm)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
                Back to Home
            </Link>

        </div>
    </div>
);

export default NotFoundPage;
