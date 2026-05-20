import { useEffect, useState } from "react";

import api from "../api/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const SellerDashboardPage = () => {

    const [products, setProducts] = useState([]);

    // Store available categories
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    // Action loader for create/update/delete/upload
    const [actionLoading, setActionLoading] = useState(false);

    // Track product being edited
    const [editingProductId, setEditingProductId] = useState(null);

    // Store selected image file
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({

        productName: "",
        description: "",
        imageUrl: "",
        price: "",
        quantity: "",
        categoryId: ""
    });

    // Extract XSRF token from cookies
    const getXsrfToken = () => {

        return document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
    };

    // Fetch categories for dropdown
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

            toast.error("Failed to load categories");
        }
    };

    // Fetch seller products
    const fetchProducts = async () => {

        try {

            const response = await api.get(
                "/seller/products"
            );

            setProducts(response.data.content);

        } catch (error) {

            console.log(error);

            toast.error("Failed to load seller products");

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchProducts();

        fetchCategories();

    }, []);

    // Handle text input changes
    const handleChange = (e) => {

        setFormData({

            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle image file selection
    const handleFileChange = (e) => {

        setSelectedFile(
            e.target.files[0]
        );
    };

    // Create or update product
    const handleSubmit = async (e) => {

        e.preventDefault();

        setActionLoading(true);

        try {

            let imageUrl = formData.imageUrl;

            // Upload image to Cloudinary
            if (selectedFile) {

                const uploadFormData = new FormData();

                uploadFormData.append(
                    "file",
                    selectedFile
                );

                const uploadResponse = await api.post(
                    "/upload",
                    uploadFormData,
                    {
                        headers: {
                            "X-XSRF-TOKEN": getXsrfToken()
                        }
                    }
                );

                imageUrl = uploadResponse.data;
            }

            // Final payload sent to backend
            const productData = {

                productName: formData.productName,
                description: formData.description,
                imageUrl: imageUrl,
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                categoryId: Number(formData.categoryId)
            };

            // Update existing product
            if (editingProductId) {

                await api.put(
                    `/seller/products/${editingProductId}`,
                    productData,
                    {
                        headers: {
                            "X-XSRF-TOKEN": getXsrfToken()
                        }
                    }
                );

                toast.success("Product updated successfully");

            } else {

                // Create new product
                await api.post(
                    "/seller/products",
                    productData,
                    {
                        headers: {
                            "X-XSRF-TOKEN": getXsrfToken()
                        }
                    }
                );

                toast.success("Product created successfully");
            }

            // Reset form fields
            setFormData({

                productName: "",
                description: "",
                imageUrl: "",
                price: "",
                quantity: "",
                categoryId: ""
            });

            // Clear selected image
            setSelectedFile(null);

            // Exit edit mode
            setEditingProductId(null);

            // Reload seller products
            await fetchProducts();

        } catch (error) {

            console.log(error);

            toast.error("Operation failed");

        } finally {

            setActionLoading(false);
        }
    };

    // Populate form for editing
    const handleEdit = (product) => {

        setEditingProductId(product.productId);

        setFormData({

            productName: product.productName,
            description: product.description,
            imageUrl: product.imageUrl,
            price: product.price,
            quantity: product.quantity,
            categoryId: product.categoryId || ""
        });
    };

    // Delete product
    const handleDelete = async (productId) => {

        setActionLoading(true);

        try {

            await api.delete(
                `/seller/products/${productId}`,
                {
                    headers: {
                        "X-XSRF-TOKEN": getXsrfToken()
                    }
                }
            );

            toast.success("Product deleted");

            await fetchProducts();

        } catch (error) {

            console.log(error);

            toast.error("Failed to delete product");

        } finally {

            setActionLoading(false);
        }
    };

    // Dashboard loading state
    if (loading) {

        return (

            <div className="min-h-screen flex flex-col justify-center items-center">

                <Loader />
                <p className="text-2xl font-semibold mt-4">
                    Loading dashboard...
                </p>

            </div>
        );
    }

    return (

        <div className="p-10 bg-gray-100 min-h-screen">

            <h1 className="text-5xl font-bold mb-10">
                Seller Dashboard
            </h1>

            {/* Dashboard action loader */}
            {actionLoading && (

                <div className="mb-6 flex items-center gap-4">

                    <Loader />

                    <p className="text-xl font-semibold text-blue-600">
                        Processing product changes...
                    </p>

                </div>
            )}

            {/* Product Form */}
            <div className="bg-white p-8 rounded-lg shadow mb-12">

                <h2 className="text-3xl font-bold mb-6">

                    {editingProductId
                        ? "Edit Product"
                        : "Create Product"}

                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >

                    <input
                        type="text"
                        name="productName"
                        placeholder="Product Name"
                        value={formData.productName}
                        onChange={handleChange}
                        disabled={actionLoading}
                        className="p-4 border rounded disabled:opacity-50"
                    />

                    {/* Image upload input */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={actionLoading}
                        className="p-4 border rounded disabled:opacity-50"
                    />

                    {/* Selected image preview */}
                    {selectedFile && (

                        <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded md:col-span-2"
                        />
                    )}

                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={actionLoading}
                        className="p-4 border rounded disabled:opacity-50"
                    />

                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        disabled={actionLoading}
                        className="p-4 border rounded disabled:opacity-50"
                    />

                    {/* Category dropdown */}
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        disabled={actionLoading}
                        className="p-4 border rounded disabled:opacity-50"
                    >

                        <option value="">
                            Select Category
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

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={actionLoading}
                        className="p-4 border rounded md:col-span-2 disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={actionLoading}
                        className={`text-white p-4 rounded font-bold md:col-span-2 ${
                            actionLoading
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {actionLoading
                            ? "Processing..."
                            : editingProductId
                                ? "Update Product"
                                : "Create Product"}
                    </button>

                </form>

            </div>

            {/* Seller Products */}
            <div>

                <h2 className="text-4xl font-bold mb-8">
                    My Products
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {products.map((product) => (

                        <div
                            key={product.productId}
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >

                            <img
                                src={product.imageUrl}
                                alt={product.productName}
                                className="w-full h-52 object-cover"
                            />

                            <div className="p-5">

                                <h3 className="text-2xl font-bold">
                                    {product.productName}
                                </h3>

                                <p className="text-gray-600 mt-3">
                                    {product.description}
                                </p>

                                <p className="mt-3 text-2xl font-bold text-green-700">
                                    ${product.price}
                                </p>

                                <p className="mt-2 font-semibold">
                                    Stock: {product.quantity}
                                </p>

                                {/* Edit product button */}
                                <button
                                    onClick={() =>
                                        handleEdit(product)
                                    }
                                    disabled={actionLoading}
                                    className="mt-5 w-full bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded font-bold disabled:opacity-50"
                                >
                                    Edit Product
                                </button>

                                {/* Delete product button */}
                                <button
                                    onClick={() =>
                                        handleDelete(product.productId)
                                    }
                                    disabled={actionLoading}
                                    className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded font-bold disabled:opacity-50"
                                >
                                    Delete Product
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

            </div>

        </div>
    );
};

export default SellerDashboardPage;