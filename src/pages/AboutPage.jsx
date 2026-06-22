import { Link } from "react-router-dom";
import SolydLogo from "../components/SolydLogo";

const C = {
    bg:      "var(--bg)",
    surface: "var(--surface)",
    border:  "var(--border)",
    text:    "var(--text)",
    text2:   "var(--text-2)",
    text3:   "var(--text-3)",
    accent:  "var(--accent)",
};

const Section = ({ label, children }) => (
    <section style={{ marginBottom: "48px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "12px" }}>
            {label}
        </p>
        {children}
    </section>
);

export default function AboutPage() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "var(--topbar-height)" }}>

            {/* Hero banner */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 0 48px" }}>
                <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10">
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                        <SolydLogo size={44} />
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
                            About SolydShop
                        </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: C.text2, lineHeight: 1.65, maxWidth: "60ch" }}>
                        The B2B procurement portal built for heavy-industry operators who can't afford downtime.
                        We connect verified OEM suppliers with fleet operators, contractors, and maintenance teams worldwide.
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-16">

                <Section label="Our Mission">
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: C.text2, lineHeight: 1.7, maxWidth: "65ch" }}>
                        Heavy machinery stops production when parts fail. SolydShop exists to eliminate that risk.
                        We aggregate 24,000+ verified industrial components — bearings, hydraulics, drive systems,
                        structural assemblies — from 500+ OEM-certified brands, all under one procurement portal.
                        Every part ships within 48 hours. Every supplier is ISO 9001 audited before listing.
                    </p>
                </Section>

                <Section label="What We Offer">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: "OEM-Verified Catalog",    body: "Every listing is sourced from certified OEM suppliers. No grey-market, no substitutes without disclosure." },
                            { title: "B2B Procurement Portal",  body: "Bulk ordering, purchase-order workflows, and net-terms billing designed for professional buyers." },
                            { title: "48h Global Dispatch",     body: "Air and freight logistics partnerships ensure same-day pick-pack and next-business-day dispatch on stocked items." },
                            { title: "ISO 9001 Quality Gate",   body: "All fulfillment partners maintain ISO 9001:2015 certification. Quality certificates available on every shipment." },
                        ].map(({ title, body }) => (
                            <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "20px 22px" }}>
                                <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>{title}</p>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, lineHeight: 1.6 }}>{body}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section label="Trusted By">
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: C.text2, lineHeight: 1.7, maxWidth: "65ch", marginBottom: "16px" }}>
                        Fleet operators, site maintenance managers, and procurement directors across mining, construction,
                        and heavy transport rely on SolydShop for critical-path components from brands including
                        Komatsu, Caterpillar, Hitachi, Volvo CE, Liebherr, and Doosan.
                    </p>
                </Section>

                <Section label="Contact Us">
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "24px 26px", maxWidth: "480px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div>
                                <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.text3, marginBottom: "4px" }}>Sales & Procurement</p>
                                <a href="tel:5734666199" style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: C.accent, textDecoration: "none", letterSpacing: "0.01em" }}>
                                    +1 573 466 6199
                                </a>
                            </div>
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "12px" }}>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, lineHeight: 1.55 }}>
                                    Mon – Fri, 08:00 – 18:00 CST. For technical support, visit our{" "}
                                    <Link to="/support" style={{ color: C.accent, textDecoration: "none" }}>support page</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "32px" }}>
                    <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: C.text3, textDecoration: "none" }}>
                        ← Back to Catalog
                    </Link>
                </div>

            </div>
        </div>
    );
}
