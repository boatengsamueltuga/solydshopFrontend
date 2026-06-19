import toast from "react-hot-toast";

const confirmToast = (message, onConfirm) => {
    toast(
        (t) => (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)", fontFamily: "var(--font-body)" }}>{message}</span>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            padding: "5px 14px",
                            borderRadius: "var(--r-sm)",
                            border: "1px solid var(--border)",
                            background: "transparent",
                            color: "var(--text-2)",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontFamily: "var(--font-body)",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            onConfirm();
                        }}
                        style={{
                            padding: "5px 14px",
                            borderRadius: "var(--r-sm)",
                            border: "none",
                            background: "var(--error)",
                            color: "var(--bg)",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            fontFamily: "var(--font-body)",
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ),
        { duration: Infinity }
    );
};

export default confirmToast;
