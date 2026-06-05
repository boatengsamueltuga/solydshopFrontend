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
            width: isMobile ? 60 : 90,
            renderCell: (params) => (
                <Tooltip title="View order" arrow>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewOrder(params.row)}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
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
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {selectedOrder && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid #e5e7eb" }}>
                            <Typography variant="h6" fontWeight="bold">
                                Order #{selectedOrder.orderId}
                            </Typography>
                            <IconButton size="small" onClick={() => setIsDialogOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <DialogContent sx={{ pt: 2 }}>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                                <Typography variant="body2"><strong>Customer:</strong> {selectedOrder.customerName}</Typography>
                                <Typography variant="body2"><strong>Email:</strong> {selectedOrder.customerEmail}</Typography>
                                <Typography variant="body2"><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</Typography>
                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                    Total: ${Number(selectedOrder.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Order Items
                            </Typography>

                            {selectedOrder.items?.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 2,
                                        p: 1.5,
                                        mb: 1,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="bold">{item.productName}</Typography>
                                    <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                                    <Typography variant="body2" color="text.secondary">Unit Price: ${item.price}</Typography>
                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                        Line Total: ${item.price * item.quantity}
                                    </Typography>
                                </Box>
                            ))}

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
