import { Link } from "react-router-dom";
import SolydLogo from "./SolydLogo";

export default function Footer() {
    return (
        <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10" style={{ textAlign: "left" }}>

                {/* Three-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ paddingTop: "40px", paddingBottom: "32px" }}>

                    {/* Brand */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                            <SolydLogo size={28} />
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>SolydShop</span>
                        </div>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-3)", marginTop: "6px", lineHeight: 1.55, maxWidth: "30ch" }}>
                            B2B industrial procurement for heavy machinery components and assemblies.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "12px" }}>
                            Platform
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                                { label: "Catalog",           to: "/"                 },
                                { label: "My Orders",         to: "/orders"           },
                                { label: "My Account",        to: "/account"          },
                                { label: "Seller Dashboard",  to: "/seller/dashboard" },
                                { label: "About",             to: "/about"            },
                            ].map(({ label, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-3)", textDecoration: "none", transition: "color var(--duration-fast)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "12px" }}>
                            Legal & Support
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {[
                                { label: "Terms of Service",  to: "/terms"   },
                                { label: "Privacy Policy",    to: "/privacy" },
                                { label: "Technical Support", to: "/support" },
                                { label: "Contact Sales",     to: "/contact" },
                            ].map(({ label, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-3)", textDecoration: "none", transition: "color var(--duration-fast)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop:      "1px solid var(--border)",
                    paddingTop:     "16px",
                    paddingBottom:  "20px",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    flexWrap:       "wrap",
                    gap:            "12px",
                }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-4)", letterSpacing: "0.04em", margin: 0 }}>
                        © {new Date().getFullYear()} SolydShop Industrial Procurement
                    </p>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        style={{
                            display:       "flex",
                            alignItems:    "center",
                            gap:           "6px",
                            padding:       "6px 14px",
                            background:    "transparent",
                            border:        "1px solid var(--border)",
                            borderRadius:  "var(--r-sm)",
                            color:         "var(--text-3)",
                            fontFamily:    "var(--font-mono)",
                            fontSize:      "11px",
                            fontWeight:    600,
                            letterSpacing: "0.04em",
                            cursor:        "pointer",
                            transition:    "border-color var(--duration-fast), color var(--duration-fast)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.color = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-3)";
                        }}
                    >
                        ↑ Back to Top
                    </button>
                </div>

            </div>
        </footer>
    );
}
