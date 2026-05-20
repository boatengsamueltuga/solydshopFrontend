import { useEffect, useState } from "react";

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

    // Get authenticated user
    const { user } = useSelector(
        (state) => state.auth
    );

    // Search keyword
    const [keyword, setKeyword] = useState("");

    // Category filter
    const [categoryId, setCategoryId] = useState("");

    // Store categories
    const [categories, setCategories] = useState([]);

    // Fetch categories
    const fetchCategories = async () => {

        try {

            const response = await api.get(
                "/public/categories"
            );

            setCategories(
                response.data.content
            );

        } catch (error) {

            console.log(error);
        }
    };

    // Fetch products with filters
    const fetchProducts = async (
        searchKeyword = keyword,
        selectedCategoryId = categoryId
    ) => {

        dispatch(fetchProductsStart());

        try {

            let url = "/public/products?";

            // Add keyword filter
            if (searchKeyword.trim() !== "") {

                url += `keyword=${searchKeyword}&`;
            }

            // Add category filter
            if (selectedCategoryId !== "") {

                url += `categoryId=${selectedCategoryId}`;
            }

            const response = await api.get(url);

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

    // Initial load
    useEffect(() => {

        fetchProducts();

        fetchCategories();

    }, []);

    // Debounced realtime search
    useEffect(() => {

        const timeout = setTimeout(() => {

            fetchProducts();

        }, 400);

        return () => clearTimeout(timeout);

    }, [keyword, categoryId]);

    // Handle Enter key search
    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            fetchProducts();
        }
    };

    // Add product to cart
    const handleAddToCart = async (productId) => {

        try {

            const xsrfToken = document.cookie
                .split("; ")
                .find(row => row.startsWith("XSRF-TOKEN="))
                ?.split("=")[1];

            await api.post(
                `/cart/${user.userId}/items`,
                {
                    productId: productId,
                    quantity: 1
                },
                {
                    headers: {
                        "X-XSRF-TOKEN": xsrfToken
                    }
                }
            );

            alert("Product added to cart");

        } catch (error) {

            console.log(error);

            alert("Failed to add product to cart");
        }
    };

    if (error) {

        return <h1>{error}</h1>;
    }

    return (

        <div className="p-10 bg-gray-100 min-h-screen">

            <h1 className="text-5xl font-bold mb-10">
                Products
            </h1>

            {/* Search and filter section */}
            <div className="flex flex-col md:flex-row gap-5 mb-10">

                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="p-4 border rounded w-full md:w-1/2"
                />

                {/* Category filter */}
                <select
                    value={categoryId}
                    onChange={(e) =>
                        setCategoryId(e.target.value)
                    }
                    className="p-4 border rounded w-full md:w-1/4"
                >

                    <option value="">
                        All Categories
                    </option>

                    {categories.map((category) => (

                        <option
                            key={category.categoryId}
                            value={category.categoryId}
                        >
                            {category.categoryName}
                        </option>
                    ))}

                </select>

                {/* Search button */}
                <button
                    onClick={() =>
                        fetchProducts()
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded font-bold"
                >
                    Search
                </button>

            </div>

            {/* Loading indicator */}
            {loading && (

                <p className="text-xl font-semibold mb-6 text-blue-600">
                    Searching products...
                </p>
            )}

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

                            {/* Stock display */}
                            <p className="mt-2 text-lg font-semibold text-gray-700">
                                Stock: {product.quantity}
                            </p>

                            <button
                                onClick={() =>
                                    handleAddToCart(product.productId)
                                }
                                disabled={product.quantity === 0}
                                className={`mt-5 w-full p-3 rounded font-bold text-white ${
                                    product.quantity === 0
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {product.quantity === 0
                                    ? "Out Of Stock"
                                    : "Add To Cart"}
                            </button>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default HomePage;