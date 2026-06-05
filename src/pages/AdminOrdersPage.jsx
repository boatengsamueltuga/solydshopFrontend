import { useEffect, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import {
    Button,
    Chip,
    Dialog as MuiDialog,
    DialogTitle as MuiDialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Tooltip,
    Typography,
    Box,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import SyncIcon      from "@mui/icons-material/Sync";
import CloseIcon     from "@mui/icons-material/Close";

import api from "../api/api";

import Loader from "../components/Loader";

import toast from "react-hot-toast";

const STATUS_COLORS = {
    PENDING:    "warning",
    PROCESSING: "info",
    SHIPPED:    "primary",
    DELIVERED:  "success",
    CANCELLED:  "error",
};

const AdminOrdersPage = () => {

    const [orders,        setOrders]        = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDialogOpen,  setIsDialogOpen]  = useState(false);
    const [newStatus,     setNewStatus]     = useState("");

    const [isMobile,  setIsMobile]  = useState(window.innerWidth < 600);
    const [isCompact, setIsCompact] = useState(window.innerWidth < 1100);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
            setIsCompact(window.innerWidth < 1100);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /*
    |----------------------------------------------------------
    | Fetch
    |----------------------------------------------------------
    */

    const fetchOrders = async () => {
        try {
            const response = await api.get("/order/admin");
            setOrders(response.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /*
    |----------------------------------------------------------
    | Handlers
    |----------------------------------------------------------
    */

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsDialogOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await api.put(`/order/${selectedOrder.orderId}/status?status=${newStatus}`);
            toast.success("Order status updated successfully.");
            fetchOrders();
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        } catch (error) {
            console.log(error);
            toast.error("Failed to update order status.");
        }
    };

    /*
    |----------------------------------------------------------
    | DataGrid Columns
    |----------------------------------------------------------
    */

    const columns = [

        {
            field: "orderId",
            headerName: "Order ID",
            width: isMobile ? 75 : 90,
        },

        {
            field: "customerName",
            headerName: "Customer",
            minWidth: isMobile ? 110 : 150,
            flex: 1,
            renderCell: (params) => (
                <span style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                    {params.row.customerName}
                </span>
            ),
        },

        ...(!isCompact ? [{
            field: "customerEmail",
            headerName: "Email",
            minWidth: 180,
            flex: 1.2,
        }] : []),

        {
            field: "totalAmount",
            headerName: "Total",
            width: isMobile ? 80 : 110,
            renderCell: (params) => (
                <span className="font-bold text-green-700">
                    ${Number(params.row.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
            ),
        },

        ...(!isMobile ? [{
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.row.status}
                    color={STATUS_COLORS[params.row.status] || "default"}
                    size="small"
                    variant="filled"
                />
            ),
        }] : []),

        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 80 : 110,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewOrder(params.row)}
                    sx={{ fontSize: isMobile ? "10px" : "12px" }}
                >
                    View
                </Button>
            ),
        },
    ];

    /*
    |----------------------------------------------------------
    | Loading
    |----------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <Loader />
                <p className="text-2xl font-semibold mt-4">Loading orders...</p>
            </div>
        );
    }

    /*
    |----------------------------------------------------------
    | Render
    |----------------------------------------------------------
    */

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen w-full overflow-x-hidden">

            <div className="mb-6 md:mb-10">
                <h1 className="text-3xl md:text-5xl font-bold">Order Management</h1>
            </div>

            <div
                className="bg-white rounded-xl shadow min-w-0"
                style={{ height: isMobile ? 450 : 600, width: "100%" }}
            >
                <DataGrid
                    rows={orders}
                    columns={columns}
                    getRowId={(row) => row.orderId}
                    getRowHeight={() => "auto"}
                    disableRowSelectionOnClick
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            fontSize: isMobile ? "12px" : "14px",
                        },
                        "& .MuiDataGrid-cell": {
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "4px 6px" : "8px 10px",
                        },
                    }}
                />
            </div>

            {/* ── Order Detail Dialog ── */}
            <MuiDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, maxHeight: "85vh" } }}
            >
                {selectedOrder && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "2px solid", borderColor: "primary.main", bgcolor: "#f0f7ff" }}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                Order #{selectedOrder.orderId}
                            </Typography>
                            <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ pt: 2, overflowY: "auto" }}>

                            {/* Customer Info */}
                            <Box
                                sx={{
                                    bgcolor: "#f0f7ff",
                                    border: "1px solid",
                                    borderColor: "primary.light",
                                    borderLeft: "4px solid",
                                    borderLeftColor: "primary.main",
                                    borderRadius: 2,
                                    p: 2,
                                    mb: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.75,
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                    <Box>
                                        <Typography variant="caption" color="primary.main" fontWeight={700} textTransform="uppercase" letterSpacing={1}>Customer</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "1.05rem" }}>{selectedOrder.customerName}</Typography>
                                    </Box>
                                    <Chip
                                        label={selectedOrder.status}
                                        color={STATUS_COLORS[selectedOrder.status] || "default"}
                                        size="small"
                                        sx={{ fontWeight: 700 }}
                                    />
                                </Box>

                                <Divider />

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ minWidth: 65 }}>Email:</Typography>
                                    <Typography variant="body2" color="primary.dark" fontWeight={500}>{selectedOrder.customerEmail}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ minWidth: 65 }}>Shipping:</Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500} fontStyle={!selectedOrder.shippingAddress ? "italic" : "normal"}>
                                        {selectedOrder.shippingAddress || "Address not provided"}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="body2" fontWeight={700} color="text.primary">Order Total</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="success.main">
                                        ${Number(selectedOrder.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Status Update */}
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel sx={{ fontWeight: "bold" }}>Update Status</InputLabel>
                                <Select
                                    label="Update Status"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Divider sx={{ mb: 2 }} />

                            {/* Order Items */}
                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5 }}>
                                Order Items ({selectedOrder.items?.length})
                            </Typography>

                            <Stack divider={<Divider />} sx={{ border: "1px solid", borderColor: "primary.light", borderRadius: 2, overflow: "hidden" }}>
                                {selectedOrder.items?.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: { sm: "center" },
                                            flexDirection: { xs: "column", sm: "row" },
                                            gap: 1,
                                            px: 2,
                                            py: 1.5,
                                            bgcolor: index % 2 === 0 ? "white" : "#f0f7ff",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: "bold", color: "primary.dark" }}>{item.productName}</Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                                                <Typography variant="caption" fontWeight={700} color="text.primary">Qty:</Typography>
                                                <Typography variant="caption" fontWeight={600} color="primary.main">{item.quantity}</Typography>
                                                <Typography variant="caption" color="text.disabled">&nbsp;·&nbsp;</Typography>
                                                <Typography variant="caption" fontWeight={700} color="text.primary">Unit:</Typography>
                                                <Typography variant="caption" fontWeight={600} color="success.main">${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold" color="success.main" sx={{ whiteSpace: "nowrap" }}>
                                            ${Number(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>

                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                            <Button
                                onClick={() => setIsDialogOpen(false)}
                                variant="outlined"
                                color="inherit"
                                startIcon={<CloseIcon />}
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleUpdateStatus}
                                variant="contained"
                                color="success"
                                startIcon={<SyncIcon />}
                            >
                                Update Status
                            </Button>
                        </DialogActions>
                    </>
                )}
            </MuiDialog>

        </div>
    );
};

export default AdminOrdersPage;
