import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import api from "../api/api";

import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure
} from "../features/product/productSlice";

const HomePage = () => {

    const dispatch = useDispatch();

    const {

        products,
        loading,
        error

    } = useSelector(
        (state) => state.product
    );

    useEffect(() => {

        const fetchProducts = async () => {

            dispatch(fetchProductsStart());

            try {

                const response = await api.get(
                    "/public/products"
                );

                dispatch(
                    fetchProductsSuccess(
                        response.data.content
                    )
                );

            } catch (error) {

                dispatch(
                    fetchProductsFailure(
                        error.message
                    )
                );
            }
        };

        fetchProducts();

    }, [dispatch]);

    if (loading) {

        return <h1>Loading products...</h1>;
    }

    if (error) {

        return <h1>{error}</h1>;
    }

    return (

        <div className="p-10 bg-gray-100 min-h-screen">

            <h1 className="text-5xl font-bold mb-10">
                Products
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                {products.map((product) => (

                    <div
                        key={product.productId}
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition duration-300"
                    >

                        <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="w-full h-52 object-cover"
                        />

                        <div className="p-5">

                            <h2 className="text-2xl font-bold">
                                {product.productName}
                            </h2>

                            <p className="text-gray-600 mt-3">
                                {product.description}
                            </p>

                            <p className="mt-4 text-3xl font-bold text-green-700">
                                ${product.price}
                            </p>

                            <button
                                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold"
                            >
                                Add To Cart
                            </button>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default HomePage;