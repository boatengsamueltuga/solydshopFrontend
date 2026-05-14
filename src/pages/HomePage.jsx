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

        <div className="p-10">

            <h1 className="text-4xl font-bold mb-8">
                Products
            </h1>

            <div className="grid grid-cols-4 gap-6">

                {products.map((product) => (

                    <div
                        key={product.productId}
                        className="border p-4 rounded shadow"
                    >

                        <h2 className="text-2xl font-bold">
                            {product.productName}
                        </h2>

                        <p className="mt-2">
                            ${product.price}
                        </p>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default HomePage;