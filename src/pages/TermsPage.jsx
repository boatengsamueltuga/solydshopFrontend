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

const Clause = ({ num, title, children }) => (
    <div style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
            {num}. {title}
        </p>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: C.text2, lineHeight: 1.7, maxWidth: "70ch", textAlign: "justify" }}>
            {children}
        </div>
    </div>
);

export default function TermsPage() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, paddingTop: "var(--topbar-height)" }}>

            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "48px 0 40px" }}>
                <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10">
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text3, marginBottom: "10px" }}>Legal</p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 }}>
                        Terms of Service
                    </h1>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: C.text3, marginTop: "8px" }}>
                        Effective date: 1 January 2026 · Last updated: 22 June 2026
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10 py-14">

                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: C.text2, lineHeight: 1.7, maxWidth: "70ch", marginBottom: "40px", textAlign: "justify" }}>
                    These Terms of Service govern your access to and use of SolydShop ("Platform"), a global marketplace
                    for buying and selling heavy machinery parts and industrial components. They apply to all users —
                    buyers, sellers, and visitors — worldwide. By creating an account or transacting on the Platform
                    you agree to be bound by these terms.
                </p>

                <Clause num={1} title="Eligibility">
                    The Platform is open to individuals and businesses transacting in an industrial or commercial capacity.
                    By registering you confirm that you are at least 18 years old and, where acting on behalf of a company,
                    that you have authority to bind that company to these terms. SolydShop serves users in over 150 countries;
                    you are responsible for ensuring your use of the Platform complies with the laws of your jurisdiction.
                </Clause>

                <Clause num={2} title="Account Registration">
                    You must provide accurate, current, and complete information during registration. You are responsible
                    for maintaining the confidentiality of your login credentials and for all activity under your account.
                    SolydShop reserves the right to suspend or terminate accounts that provide false information, engage
                    in fraudulent activity, or otherwise violate these terms.
                </Clause>

                <Clause num={3} title="Buying on SolydShop">
                    When you place an order you enter into a direct contract with the seller, not with SolydShop. SolydShop
                    acts as the marketplace facilitator only. All orders are subject to seller confirmation and stock
                    availability. Prices are set by sellers and displayed exclusive of applicable taxes and freight costs
                    unless stated otherwise. Payment is processed securely through SolydShop at the time of order.
                    Buyers are responsible for verifying that parts are suitable for their intended application before purchase.
                </Clause>

                <Clause num={4} title="Selling on SolydShop">
                    To list parts for sale you must register as a seller and maintain accurate, truthful product listings.
                    Sellers warrant that all listed items are genuine, accurately described, and legally available for sale
                    in their country of origin. Counterfeit, stolen, or misrepresented parts are strictly prohibited and
                    will result in immediate account termination and referral to relevant authorities. SolydShop charges
                    a platform fee on completed transactions; the current fee schedule is published in your Seller Dashboard.
                    Sellers are solely responsible for fulfilment, export compliance, and any applicable taxes on their sales.
                </Clause>

                <Clause num={5} title="Shipping and Delivery">
                    Sellers are responsible for dispatching orders within the timeframe stated on their listing.
                    International shipments must comply with the export regulations of the country of origin and the
                    import regulations of the destination country. SolydShop is not liable for delays caused by customs
                    clearance, carrier disruptions, or force majeure events. Title and risk of loss transfer to the buyer
                    upon handover to the carrier.
                </Clause>

                <Clause num={6} title="Returns and Disputes">
                    Buyers may raise a dispute within 14 days of delivery if items are defective, not as described, or
                    not received. SolydShop will mediate disputes between buyers and sellers. Sellers must respond to
                    dispute notices within 5 business days. Where a valid claim is upheld, SolydShop may issue a refund
                    to the buyer and recover the amount from the seller's pending balance. Items returned must be unused
                    and in original packaging unless the return is due to seller error.
                </Clause>

                <Clause num={7} title="Prohibited Items and Conduct">
                    The following are prohibited on SolydShop: counterfeit or grey-market parts presented as OEM;
                    parts subject to international trade sanctions; hazardous materials without proper certification;
                    and any conduct intended to manipulate prices, reviews, or search rankings. Violations may result
                    in immediate suspension, forfeiture of pending balances, and legal action.
                </Clause>

                <Clause num={8} title="Intellectual Property">
                    All Platform content produced by SolydShop — including design, code, and editorial text — is the
                    property of SolydShop and may not be reproduced without written permission. Sellers retain ownership
                    of their product images and descriptions but grant SolydShop a non-exclusive licence to display
                    that content on the Platform for the duration their listing is active.
                </Clause>

                <Clause num={9} title="Limitation of Liability">
                    SolydShop operates as a marketplace facilitator and is not a party to transactions between buyers
                    and sellers. To the maximum extent permitted by law, SolydShop's aggregate liability for any claim
                    shall not exceed the fees paid by the claimant to SolydShop in the 12 months preceding the claim.
                    SolydShop is not liable for indirect, consequential, or punitive damages.
                </Clause>

                <Clause num={10} title="Governing Law">
                    These terms are governed by the laws of the State of Missouri, United States, without regard to
                    conflict-of-law principles. Users outside the United States agree that disputes will be resolved
                    by binding arbitration in Missouri, except where prohibited by local mandatory law.
                </Clause>

                <Clause num={11} title="Contact">
                    <span>
                        For questions about these terms contact our team at{" "}
                        <a href="tel:5734666199" style={{ color: C.accent, textDecoration: "none" }}>+1 573 466 6199</a>
                        {" "}or visit our{" "}
                        <Link to="/contact" style={{ color: C.accent, textDecoration: "none" }}>Contact page</Link>.
                    </span>
                </Clause>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "28px" }}>
                    <Link to="/" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: C.text3, textDecoration: "none" }}>
                        ← Back to Marketplace
                    </Link>
                </div>

            </div>
        </div>
    );
}
