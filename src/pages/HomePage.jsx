import api from "../api/api";

const HomePage = () => {

    const testProtectedApi = async () => {

        try {

            const response = await api.get(
                "/cart/test"
            );

            console.log(response.data);

            alert("Protected API success");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data ||
                "Protected API failed"
            );
        }
    };

    return (

        <div className="p-10">

            <h1 className="text-4xl font-bold mb-6">
                Home Page
            </h1>

            <button
                onClick={testProtectedApi}
                className="bg-blue-600 text-white px-6 py-3 rounded"
            >
                Test Protected API
            </button>

        </div>
    );
};

export default HomePage;