import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import api from "../api/api";

const OrdersPage = () => {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Get authenticated user
    const { user } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const response = await api.get(
                    `/order/${user.userId}`
                );

                setOrders(response.data);

            } catch (error) {

                console.log(error);

                setError("Unable to load orders");

            } finally {

                setLoading(false);
            }
        };

        if (user?.userId) {

            fetchOrders();
        }

    }, [user]);

    if (loading) {

        return (

            <h1 className="text-3xl p-10">
                Loading orders...
            </h1>
        );
    }

    if (error) {

        return (

            <h1 className="text-3xl p-10 text-red-600">
                {error}
            </h1>
        );
    }

    return (

        <div className="p-4 md:p-10 bg-gray-100 min-h-screen">

            <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-10">
                My Orders
            </h1>

            {orders.length === 0 ? (

                <h2 className="text-2xl">
                    No orders found
                </h2>

            ) : (

                <div className="space-y-8">

                    {orders.map((order) => (

                        <div
                            key={order.orderId}
                            className="bg-white p-4 md:p-8 rounded-lg shadow"
                        >

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">

                                <div>

                                    <h2 className="text-xl md:text-3xl font-bold">
                                        Order #{order.orderId}
                                    </h2>

                                    <p className="text-gray-600 mt-2">
                                        Status:
                                        <span className="font-bold ml-2 text-blue-700">
                                            {order.status}
                                        </span>
                                    </p>

                                </div>

                                <h2 className="text-xl md:text-3xl font-bold text-green-700">
                                    ${order.totalAmount}
                                </h2>

                            </div>

                            <div className="space-y-4">

                                {order.items.map((item) => (

                                    <div
                                        key={item.productId}
                                        className="border p-3 md:p-4 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                                    >

                                        <div>

                                            <h3 className="text-lg md:text-2xl font-bold">
                                                {item.productName}
                                            </h3>

                                            <p className="text-gray-600 mt-2">
                                                Quantity: {item.quantity}
                                            </p>

                                        </div>

                                        <p className="text-lg md:text-2xl font-bold text-green-700">
                                            ${item.price}
                                        </p>

                                    </div>
                                ))}

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default OrdersPage;