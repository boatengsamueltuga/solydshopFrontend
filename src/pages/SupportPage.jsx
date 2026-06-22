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

const topics = [
    {
        title: "Order Tracking",
        body: "Once your order ships you will receive a tracking number by email. Use the carrier link in that email to check live status. For orders older than 5 business days with no tracking update, call us directly.",
    },
    {
        title: "Returns & Defects",
        body: "Defective or incorrectly shipped parts can be returned within 14 days. Parts must be unused and in original packaging. Open a return by contacting support with your order number and a photo of the defect.",
    },
    {
        title: "Technical Specifications",
        body: "Full datasheets and CAD drawings are available on each product page for registered buyers. If a spec sheet is missing, contact us with the part number — our technical team will source it directly from the OEM.",
    },
    {
        title: "Bulk & Custom Orders",
        body: "For orders exceeding standard catalog quantities or requiring custom tolerances, speak with our procurement team. We can engage directly with OEM factories for made-to-order runs with typical lead times of 4–12 weeks.",
    },
    {
        title: "Account & Billing",
        body: "For invoice queries, net-terms applications, or payment issues, contact our accounts team. Purchase-order billing is available for approved business accounts with a credit assessment.",
    },
    {
        title: "Platform Issues",
        body: "Experiencing a bug, login issue, or checkout error? Use the contact details below and include your browser, device, and a brief description of the problem. We target a 4-hour first response on business days.",
    },
];

export default function SupportPage() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "var(--topbar-height)" }}>

            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "48px 0 40px" }}>
                <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10">
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "10px" }}>Support</p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 }}>
                        Technical Support
                    </h1>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: C.text2, marginTop: "10px", lineHeight: 1.6, maxWidth: "56ch" }}>
                        We're here to keep your operations running. Find answers below or reach our team directly.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-14">

                {/* Contact card */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "24px 28px", marginBottom: "48px", display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
                    <div>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.text3, marginBottom: "6px" }}>Phone Support</p>
                        <a href="tel:5734666199" style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: C.accent, textDecoration: "none" }}>
                            +1 573 466 6199
                        </a>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: C.text3, marginTop: "4px" }}>Mon – Fri, 08:00 – 18:00 CST</p>
                    </div>
                    <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: "32px" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.text3, marginBottom: "6px" }}>Sales Enquiries</p>
                        <Link to="/contact" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: C.accent, textDecoration: "none" }}>
                            Contact Sales →
                        </Link>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: C.text3, marginTop: "4px" }}>Bulk orders, OEM sourcing, net terms</p>
                    </div>
                </div>

                {/* Topics */}
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "16px" }}>
                    Common Topics
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: "48px" }}>
                    {topics.map(({ title, body }) => (
                        <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "18px 20px" }}>
                            <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>{title}</p>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, lineHeight: 1.6, textAlign: "justify" }}>{body}</p>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "28px" }}>
                    <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: C.text3, textDecoration: "none" }}>
                        ← Back to Catalog
                    </Link>
                </div>

            </div>
        </div>
    );
}
