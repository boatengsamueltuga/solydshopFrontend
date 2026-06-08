import toast from "react-hot-toast";

const confirmToast = (message, onConfirm) => {
    toast(
        (t) => (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{message}</span>
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            padding: "5px 14px",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.25)",
                            background: "transparent",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "13px",
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
                            borderRadius: "6px",
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
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
