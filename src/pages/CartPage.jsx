import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const CartPage = () => {

    const [cart, setCart] = useState(null);

    const [loading, setLoading] = useState(true);

    // Action loader for cart updates
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");

    // Get authenticated user
    const { user } = useSelector(
        (state) => state.auth
    );

    // Reusable XSRF token helper
    const getXsrfToken = () => {

        return document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
    };

    // Fetch cart
    const fetchCart = async () => {

        try {

            const response = await api.get(
                `/cart/${user.userId}`
            );

            setCart(response.data);

        } catch (error) {

            console.log(error);

            //toast.error("Failed to load cart");

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (user?.userId) {

            fetchCart();
        }

    }, [user]);

    // Increase quantity
    const handleIncreaseQuantity = async (productId) => {

        setActionLoading(true);

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

            await fetchCart();

        } catch (error) {

            console.log(error);

            toast.error("Failed to increase quantity");

        } finally {

            setActionLoading(false);
        }
    };

    // Decrease quantity
    const handleDecreaseQuantity = async (productId) => {

        setActionLoading(true);

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

            await fetchCart();

        } catch (error) {

            console.log(error);

            toast.error("Failed to decrease quantity");

        } finally {

            setActionLoading(false);
        }
    };

    // Remove item
    const handleRemoveItem = async (productId) => {

        setActionLoading(true);

        try {

            await api.delete(
                `/cart/${user.userId}/items/${productId}`,
                {
                    headers: {
                        "X-XSRF-TOKEN": getXsrfToken()
                    }
                }
            );

            await fetchCart();

        } catch (error) {

            console.log(error);

            toast.error("Failed to remove item");

        } finally {

            setActionLoading(false);
        }
    };

    // Checkout
    const handleCheckout = async () => {

        setActionLoading(true);

        try {

            await api.post(
                `/order/${user.userId}/checkout`,
                {},
                {
                    headers: {
                        "X-XSRF-TOKEN": getXsrfToken()
                    }
                }
            );

            toast.success("Checkout successful");

            await fetchCart();

        } catch (error) {

            console.log(error);

            toast.error("Checkout failed");

        } finally {

            setActionLoading(false);
        }
    };

    // Page loading state
    if (loading) {

        return (

            <div className="min-h-screen flex flex-col justify-center items-center">

                <Loader />

                <p className="text-2xl font-semibold mt-4">
                    Loading cart...
                </p>

            </div>
        );
    }

    // Error state
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
                My Cart
            </h1>

            {/* Cart action loader */}
            {actionLoading && (

                <div className="mb-6 flex items-center gap-4">

                    <Loader />

                    <p className="text-xl font-semibold text-blue-600">
                        Updating cart...
                    </p>

                </div>
            )}

            {cart?.items?.length === 0 ? (

                <div className="bg-white p-6 md:p-10 rounded-lg shadow text-center">

                    <h2 className="text-3xl font-bold text-gray-700">
                        Cart is empty
                    </h2>

                    <p className="text-gray-500 mt-4 text-lg">
                        Add products to your cart to continue shopping.
                    </p>

                </div>

            ) : (

                <div className="space-y-6">

                    {cart?.items?.map((item) => (

                        <div
                            key={item.productId}
                            className="bg-white p-4 md:p-6 rounded-lg shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                        >

                            <div>

                                <h2 className="text-xl md:text-2xl font-bold">
                                    {item.productName}
                                </h2>

                                <div className="flex items-center gap-4 mt-4">

                                    {/* Decrease Button */}
                                    <button
                                        onClick={() =>
                                            handleDecreaseQuantity(item.productId)
                                        }
                                        disabled={actionLoading}
                                        className="bg-gray-300 px-4 py-2 rounded font-bold disabled:opacity-50"
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
                                        disabled={actionLoading}
                                        className="bg-gray-300 px-4 py-2 rounded font-bold disabled:opacity-50"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                            <div className="sm:text-right">

                                <p className="text-xl md:text-2xl font-bold text-green-700">
                                    ${item.price}
                                </p>

                                {/* Remove button */}
                                <button
                                    onClick={() =>
                                        handleRemoveItem(item.productId)
                                    }
                                    disabled={actionLoading}
                                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-bold disabled:opacity-50"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    ))}

                    <div className="bg-white p-4 md:p-6 rounded-lg shadow mt-6 md:mt-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">

                        <h2 className="text-2xl md:text-3xl font-bold">
                            Total: ${cart?.totalPrice || 0}
                        </h2>

                        {/* Checkout button */}
                        <button
                            onClick={handleCheckout}
                            disabled={actionLoading}
                            className={`text-white px-8 py-3 rounded font-bold text-xl ${
                                actionLoading
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {actionLoading
                                ? "Processing..."
                                : "Checkout"}
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
};

export default CartPage;