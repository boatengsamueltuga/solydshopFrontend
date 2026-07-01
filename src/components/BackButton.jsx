import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";

export default function BackButton({ style = {} }) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                display:     "inline-flex",
                alignItems:  "center",
                gap:         "5px",
                background:  "none",
                border:      "none",
                cursor:      "pointer",
                color:       "var(--text-3)",
                fontFamily:  "var(--font-body)",
                fontSize:    "12px",
                fontWeight:  600,
                letterSpacing: "0.04em",
                padding:     "0",
                lineHeight:  1,
                transition:  "color 0.15s",
                ...style,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
        >
            <ArrowBackOutlinedIcon style={{ fontSize: 14 }} />
            Back
        </button>
    );
}
