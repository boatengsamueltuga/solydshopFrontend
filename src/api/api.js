import axios from "axios";

import toast from "react-hot-toast";

const api = axios.create({

    baseURL: "http://localhost:8080/api",

    withCredentials: true,

    xsrfCookieName: "XSRF-TOKEN",

    xsrfHeaderName: "X-XSRF-TOKEN"
});



/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(

    (config) => {

    const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

    if (token) {

        config.headers["X-XSRF-TOKEN"] = token;
    }

    return config;
},

    (error) => {

        return Promise.reject(error);
    }
);



/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(

    (response) => {

        return response;
    },

    (error) => {

        /*
        ---------------------------------------------------------------
        | No Server Response
        ---------------------------------------------------------------
        */

        if (!error.response) {

            toast.error(
                "Unable to connect to server",
                {
                    id: "server-error"
                }
            );

            return Promise.reject(error);
        }

        const status = error.response.status;

        const message =
            error.response.data?.message ||
            "Something went wrong";



        /*
        ---------------------------------------------------------------
        | 401 Unauthorized
        ---------------------------------------------------------------
        */

        if (status === 401) {

            localStorage.removeItem("user");

            /*
            ---------------------------------------------------------------
            | Prevent Redirect Loop
            ---------------------------------------------------------------
            */

            if (window.location.pathname !== "/login") {

                toast.error(
                    "Session expired. Please login again.",
                    {
                        id: "unauthorized-error"
                    }
                );

                window.location.href = "/login";
            }
        }



        /*
        ---------------------------------------------------------------
        | 403 Forbidden
        ---------------------------------------------------------------
        */

        else if (status === 403) {

            toast.error(
                "Access denied",
                {
                    id: "forbidden-error"
                }
            );
        }



        /*
        ---------------------------------------------------------------
        | 404 Not Found
        ---------------------------------------------------------------
        */

        else if (status === 404) {

            toast.error(
                message,
                {
                    id: "not-found-error"
                }
            );
        }



        /*
        ---------------------------------------------------------------
        | 500 Server Error
        ---------------------------------------------------------------
        */

        else if (status >= 500) {

            toast.error(
                "Server error occurred",
                {
                    id: "server-500-error"
                }
            );
        }



        /*
        ---------------------------------------------------------------
        | Default Errors
        ---------------------------------------------------------------
        */

        else {

            toast.error(
                message,
                {
                    id: "default-error"
                }
            );
        }

        return Promise.reject(error);
    }
);

export default api;