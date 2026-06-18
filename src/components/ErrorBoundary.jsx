import { Component } from "react";

class ErrorBoundary extends Component {

    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight:      "100vh",
                    background:     "var(--bg, #0D1117)",
                    color:          "var(--text, #e6edf3)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontFamily:     "var(--font-body, system-ui, sans-serif)",
                    padding:        "24px",
                    textAlign:      "center",
                }}>
                    <div style={{ maxWidth: "520px" }}>

                        <p style={{
                            fontFamily:    "var(--font-mono, monospace)",
                            fontSize:      "11px",
                            fontWeight:    600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color:         "var(--error, #f87171)",
                            marginBottom:  "16px",
                        }}>
                            Application Error
                        </p>

                        <h1 style={{
                            fontFamily:    "var(--font-display, system-ui, sans-serif)",
                            fontWeight:    700,
                            fontSize:      "1.5rem",
                            letterSpacing: "-0.01em",
                            margin:        "0 0 12px",
                        }}>
                            Something went wrong
                        </h1>

                        <p style={{
                            fontSize:     "0.875rem",
                            color:        "var(--text-3, #8b949e)",
                            lineHeight:   1.6,
                            marginBottom: "24px",
                        }}>
                            An unexpected error occurred. Reload the page to continue.
                        </p>

                        {this.state.error?.message && (
                            <div style={{
                                background:    "var(--surface-mid, #161b22)",
                                border:        "1px solid var(--border, #30363d)",
                                borderRadius:  "4px",
                                padding:       "12px 16px",
                                fontFamily:    "var(--font-mono, monospace)",
                                fontSize:      "12px",
                                color:         "var(--text-3, #8b949e)",
                                textAlign:     "left",
                                marginBottom:  "24px",
                                wordBreak:     "break-word",
                            }}>
                                {this.state.error.message}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding:       "10px 28px",
                                background:    "var(--accent, oklch(0.67 0.115 55))",
                                color:         "var(--bg, #0D1117)",
                                border:        "none",
                                borderRadius:  "4px",
                                fontFamily:    "var(--font-body, system-ui, sans-serif)",
                                fontWeight:    700,
                                fontSize:      "0.875rem",
                                cursor:        "pointer",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }}
                        >
                            Reload Page
                        </button>

                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
