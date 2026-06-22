const SolydLogo = ({ size = 32, gearColor = "#3a2010" }) => (
    <svg
        className="solyd-logo"
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, display: "block" }}
    >
        <path
            className="solyd-logo-gear"
            d="M100 20 L115 20 L120 40 A60 60 0 0 1 140 45 L155 35 L165 45 L155 60 A60 60 0 0 1 160 80 L180 85 L180 100 L180 115 L160 120 A60 60 0 0 1 155 140 L165 155 L155 165 L140 155 A60 60 0 0 1 120 160 L115 180 L100 180 L85 180 L80 160 A60 60 0 0 1 60 155 L45 165 L35 155 L45 140 A60 60 0 0 1 40 120 L20 115 L20 100 L20 85 L40 80 A60 60 0 0 1 45 60 L35 45 L45 35 L60 45 A60 60 0 0 1 80 40 L85 20 Z"
            fill={gearColor}
        />
        <path
            d="M130 80 C130 65 115 55 100 55 C85 55 75 65 75 80 C75 95 85 100 100 105 C115 110 130 115 130 130 C130 145 115 155 100 155 C85 155 70 145 70 130"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="100" cy="100" r="12" fill="#FFFFFF" />
    </svg>
);

export default SolydLogo;
