import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import api from "../api/api";

const CartPage = () => {

    const [cart, setCart] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Get authenticated user
    const { user } = useSelector(
        (state) => state.auth
    );

    // Added reusable XSRF token helper
    const getXsrfToken = () => {

        return document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
    };

    // Added reusable cart fetch
    const fetchCart = async () => {

        try {

            const response = await api.get(
                `/cart/${user.userId}`
            );

            setCart(response.data);

        } catch (error) {

            console.log(error);

            setError("Failed to load cart");

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (user?.userId) {

            fetchCart();
        }

    }, [user]);

    // Added increase quantity handler
    const handleIncreaseQuantity = async (productId) => {

        try {

            await api.post(
                `/cart/${user.userId}/items`,
                {
                    productId: productId,
                    quantity: 1
                },
                {
                    headers: {
                        "X-XSRF-TOKEN": getXsrfToken()
                    }
                }
            );

            fetchCart();

        } catch (error) {

            console.log(error);

            alert("Failed to increase quantity");
        }
    };

    // Added decrease quantity handler
    const handleDecreaseQuantity = async (productId) => {

        try {

            await api.put(
                `/cart/${user.userId}/items/${productId}/decrease`,
                {},
                {
                    headers: {
                        "X-XSRF-TOKEN": getXsrfToken()
                    }
                }
            );

            fetchCart();

        } catch (error) {

            console.log(error);

            alert("Failed to decrease quantity");
        }
    };

    // Added remove item handler
    const handleRemoveItem = async (productId) => {

        try {

            await api.delete(
                `/cart/${user.userId}/items/${productId}`,
                {
                    headers: {
                        "X-XSRF-TOKEN": getXsrfToken()
                    }
                }
            );

            // Refresh cart after delete
            fetchCart();

        } catch (error) {

            console.log(error);

            alert("Failed to remove item");
        }
    };

    if (loading) {

        return (

            <h1 className="text-3xl p-10">
                Loading cart...
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

        <div className="p-10 bg-gray-100 min-h-screen">

            <h1 className="text-5xl font-bold mb-10">
                My Cart
            </h1>

            {cart?.items?.length === 0 ? (

                <h2 className="text-2xl">
                    Cart is empty
                </h2>

            ) : (

                <div className="space-y-6">

                    {cart?.items?.map((item) => (

                        <div
                            key={item.productId}
                            className="bg-white p-6 rounded-lg shadow flex justify-between items-center"
                        >

                            <div>

                                <h2 className="text-2xl font-bold">
                                    {item.productName}
                                </h2>

                                <div className="flex items-center gap-4 mt-4">

                                    {/* Decrease Button */}
                                    <button
                                        onClick={() =>
                                            handleDecreaseQuantity(item.productId)
                                        }
                                        className="bg-gray-300 px-4 py-2 rounded font-bold"
                                    >
                                        -
                                    </button>

                                    <span className="text-xl font-bold">
                                        {item.quantity}
                                    </span>

                                    {/* Increase Button */}
                                    <button
                                        onClick={() =>
                                            handleIncreaseQuantity(item.productId)
                                        }
                                        className="bg-gray-300 px-4 py-2 rounded font-bold"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                            <div className="text-right">

                                <p className="text-2xl font-bold text-green-700">
                                    ${item.price}
                                </p>

                                {/* Added remove button */}
                                <button
                                    onClick={() =>
                                        handleRemoveItem(item.productId)
                                    }
                                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-bold"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    ))}

                    <div className="bg-white p-6 rounded-lg shadow mt-10">

                        <h2 className="text-3xl font-bold">
                            Total: ${cart.totalPrice}
                        </h2>

                    </div>

                </div>
            )}

        </div>
    );
};

export default CartPage;