import { useEffect, useState } from "react";

import { DataGrid } from "@mui/x-data-grid";

import { Button } from "@mui/material";
import {
    Dialog,
    DialogPanel,
    DialogTitle
} from "@headlessui/react";

import api from "../api/api";

import Loader from "../components/Loader";

import toast from "react-hot-toast";

const AdminOrdersPage = () => {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [isOrderDialogOpen, setIsOrderDialogOpen] =
    useState(false);

    const [newStatus, setNewStatus] =
    useState("");

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchOrders = async () => {

        try {

            const response = await api.get(
                "/order/admin"
            );

            setOrders(response.data);

        } catch (error) {

            console.log(error);

            toast.error(
                "Failed to load orders"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchOrders();

    }, []);

     const handleViewOrder = (order) => {

    setSelectedOrder(order);

    setNewStatus(order.status);

    setIsOrderDialogOpen(true);
     };

     const handleUpdateStatus = async () => {

    try {

        await api.put(
            `/order/${selectedOrder.orderId}/status?status=${newStatus}`
        );

        toast.success(
            "Order status updated successfully"
        );

        fetchOrders();

        setSelectedOrder({
            ...selectedOrder,
            status: newStatus
        });

    } catch (error) {

        console.log(error);

        toast.error(
            "Failed to update order status"
        );
    }
};

  const columns = [

    {
        field: "orderId",
        headerName: "Order ID",
        width: isMobile ? 70 : 100
    },

    {
        field: "customerName",
        headerName: "Customer",
        minWidth: isMobile ? 120 : 160,
        flex: 1
    },

    ...(!isMobile ? [{
        field: "customerEmail",
        headerName: "Customer Email",
        minWidth: 180,
        flex: 1.5
    }] : []),

    {
        field: "totalAmount",
        headerName: "Total",
        width: isMobile ? 80 : 120,

        renderCell: (params) => (

            <span className="font-bold text-green-700">
                ${params.row.totalAmount}
            </span>
        )
    },

    ...(!isMobile ? [{
        field: "status",
        headerName: "Status",
        width: 130
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
                sx={{ minWidth: isMobile ? 55 : 70, fontSize: isMobile ? "10px" : "13px" }}
                onClick={() =>
                    handleViewOrder(params.row)
                }
            >
                View
            </Button>
        )
    }
  ];

    if (loading) {

        return (

            <div className="min-h-screen flex flex-col justify-center items-center">

                <Loader />

                <p className="text-2xl font-semibold mt-4">
                    Loading orders...
                </p>

            </div>
        );
    }

    return (

        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

            <div className="mb-6 md:mb-10">

                <h1 className="text-3xl md:text-5xl font-bold">
                    Order Management
                </h1>

            </div>

            <div
                className="bg-white rounded-xl shadow w-full overflow-x-auto min-w-0"
                style={{
                    height: isMobile ? 450 : 600
                }}
>

                <DataGrid
                    rows={orders}
                    columns={columns}
                    getRowId={(row) => row.orderId}
                    pageSizeOptions={[5, 10]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5
                            }
                        }
                    }}
                    sx={{
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            fontSize: isMobile ? "12px" : "14px"
                        },
                        "& .MuiDataGrid-cell": {
                            fontSize: isMobile ? "12px" : "14px",
                            padding: isMobile ? "4px 6px" : "8px 10px"
                        }
                    }}
                />

                        </div>

            <Dialog
                open={isOrderDialogOpen}
                onClose={() =>
                    setIsOrderDialogOpen(false)
                }
                className="relative z-50"
            >

                <div className="fixed inset-0 bg-black/30" />

                <div className="fixed inset-0 flex items-center justify-center p-4">

                    <DialogPanel className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">

                        <DialogTitle className="text-xl md:text-3xl font-bold mb-4 md:mb-6">

                            Order #{selectedOrder?.orderId}

                        </DialogTitle>

                        <div className="space-y-3">

                            <p>
                                <strong>Customer:</strong>{" "}
                                {selectedOrder?.customerName}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedOrder?.customerEmail}
                            </p>

                            <p>
                                <strong>Shipping Address:</strong>{" "}
                                {selectedOrder?.shippingAddress}
                            </p>

                            <div>

                            <p className="font-bold mb-2">
                                Status
                            </p>

                            <select
                                value={newStatus}
                                onChange={(e) =>
                                    setNewStatus(e.target.value)
                                }
                                className="border rounded px-3 py-2 w-full"
                            >

                                <option value="PENDING">
                                    PENDING
                                </option>

                                <option value="PROCESSING">
                                    PROCESSING
                                </option>

                                <option value="SHIPPED">
                                    SHIPPED
                                </option>

                                <option value="DELIVERED">
                                    DELIVERED
                                </option>

                                <option value="CANCELLED">
                                    CANCELLED
                                </option>

                            </select>

                        </div>
                            <p>
                                <strong>Total Amount:</strong>{" "}
                                ${selectedOrder?.totalAmount}
                            </p>

                        </div>

                        <div className="mt-6">

                            <h3 className="text-xl font-bold mb-4">
                                Order Items
                            </h3>

                            {selectedOrder?.items?.map(
                                (item, index) => (

                                    <div
                                        key={index}
                                        className="border rounded-lg p-3 mb-2"
                                    >

                                        <p className="font-semibold">
                                            {item.productName}
                                        </p>

                                        <p>
                                            Quantity: {item.quantity}
                                        </p>

                                        <p>
                                                Unit Price: ${item.price}
                                            </p>

                                            <p>
                                                Line Total: ${item.price * item.quantity}
                                            </p>

                                    </div>
                                )
                            )}

                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">

                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleUpdateStatus}
                        >
                            Update Status
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() =>
                                setIsOrderDialogOpen(false)
                            }
                        >
                            Close
                        </Button>

                    </div>

                    </DialogPanel>

                </div>

            </Dialog>

        </div>
    );
};

export default AdminOrdersPage;