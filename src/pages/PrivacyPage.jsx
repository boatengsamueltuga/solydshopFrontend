import { Link } from "react-router-dom";

const C = {
    bg:      "var(--bg)",
    surface: "var(--surface)",
    border:  "var(--border)",
    text:    "var(--text)",
    text2:   "var(--text-2)",
    text3:   "var(--text-3)",
    accent:  "var(--accent)",
};

const Clause = ({ title, children }) => (
    <div style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
            {title}
        </p>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: C.text2, lineHeight: 1.7, maxWidth: "70ch", textAlign: "justify" }}>
            {children}
        </div>
    </div>
);

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "var(--topbar-height)" }}>

            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "48px 0 40px" }}>
                <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10">
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "10px" }}>Legal</p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 }}>
                        Privacy Policy
                    </h1>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, marginTop: "8px" }}>
                        Effective date: 1 January 2026 · Last updated: 22 June 2026
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10 py-14">

                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: C.text2, lineHeight: 1.7, maxWidth: "70ch", marginBottom: "40px", textAlign: "justify" }}>
                    SolydShop ("we", "us") is committed to protecting the privacy of your business data. This policy explains
                    what information we collect, how we use it, and your rights regarding that information.
                </p>

                <Clause title="Information We Collect">
                    We collect information you provide when registering (company name, contact name, email, phone, billing
                    address), placing orders (shipping details, payment method tokens), and communicating with support.
                    We also collect usage data automatically — pages visited, search queries, and device/browser information —
                    to improve the platform.
                </Clause>

                <Clause title="How We Use Your Information">
                    We use collected data to process and fulfil orders, send order confirmations and shipping updates,
                    manage your account, provide customer support, and improve our catalog and search experience.
                    We do not sell or rent your personal data to third parties.
                </Clause>

                <Clause title="Data Sharing">
                    We share data only with: (a) suppliers and logistics partners as necessary to fulfil your order;
                    (b) payment processors operating under PCI-DSS compliance; (c) service providers bound by
                    data-processing agreements; and (d) law enforcement when legally required.
                </Clause>

                <Clause title="Cookies and Tracking">
                    SolydShop uses strictly necessary session cookies for authentication and security (HTTP-only, Secure).
                    We do not use third-party advertising trackers. Analytics are processed with anonymised identifiers only.
                </Clause>

                <Clause title="Data Retention">
                    Account data is retained for the duration of your account plus 7 years for legal and tax compliance.
                    You may request deletion of non-essential data at any time; statutory obligations may require us to
                    retain certain records.
                </Clause>

                <Clause title="Your Rights">
                    Depending on your jurisdiction you may have rights to access, correct, port, or erase your personal data.
                    To exercise any right, contact us at the details below. We will respond within 30 days.
                </Clause>

                <Clause title="Security">
                    All data in transit is encrypted via TLS 1.3. Passwords are never stored — authentication uses
                    HTTP-only JWT cookies. We conduct periodic security audits and operate on SOC 2-compliant infrastructure.
                </Clause>

                <Clause title="Contact">
                    <span>
                        Privacy enquiries: call{" "}
                        <a href="tel:5734666199" style={{ color: C.accent, textDecoration: "none" }}>+1 573 466 6199</a>
                        {" "}or visit our{" "}
                        <Link to="/contact" style={{ color: C.accent, textDecoration: "none" }}>Contact Sales</Link> page.
                    </span>
                </Clause>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "28px" }}>
                    <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: C.text3, textDecoration: "none" }}>
                        ← Back to Catalog
                    </Link>
                </div>

            </div>
        </div>
    );
}
