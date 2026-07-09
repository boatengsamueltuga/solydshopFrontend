import axios from "axios";

import toast from "react-hot-toast";

const api = axios.create({

    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api`,

    withCredentials: true,

    xsrfCookieName: "XSRF-TOKEN",

    xsrfHeaderName: "X-XSRF-TOKEN"
});



/*
|--------------------------------------------------------------------------
| CSRF Token Cache
|--------------------------------------------------------------------------
| When frontend and backend are on different registrable domains (e.g.
| Vercel + a separate API domain), JS on the frontend can never read the
| XSRF-TOKEN cookie set by the backend - cookies are strictly scoped per
| domain regardless of SameSite/Secure. So we fetch the token value once
| via a JSON endpoint and cache it here as a fallback for when the cookie
| read comes up empty (same-domain/local dev keeps working via the cookie).
*/

let cachedCsrfToken = null;
let cachedCsrfHeaderName = "X-XSRF-TOKEN";

export const primeCsrfToken = async () => {
    try {
        const { data } = await api.get("/auth/csrf", { silent: true });
        cachedCsrfToken = data.token;
        cachedCsrfHeaderName = data.headerName || "X-XSRF-TOKEN";
    } catch {
        // best-effort - state-changing requests will just fail CSRF checks
    }
};



/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(

    (config) => {

    const cookieToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

    if (cookieToken) {

        config.headers["X-XSRF-TOKEN"] = cookieToken;

    } else if (cachedCsrfToken) {

        config.headers[cachedCsrfHeaderName] = cachedCsrfToken;
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

        /* Callers can pass { silent: true } to suppress global toasts */
        if (error.config?.silent) return Promise.reject(error);

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

        const rawMessage =
            error.response.data?.message ||
            "Something went wrong";

        /*
        ---------------------------------------------------------------
        | Sanitize Technical / SQL Error Messages
        | Never expose raw stack traces or SQL to the user.
        ---------------------------------------------------------------
        */

        const TECHNICAL_PATTERNS = [
            "sql", "select", "insert", "delete from", "update set",
            "constraint", "integrity", "foreign key", "hibernate",
            "jdbc", "exception", "stacktrace", "at com.", "at org.",
            "nullpointer", "referential",
        ];

        const isTechnical =
            rawMessage.length > 120 ||
            TECHNICAL_PATTERNS.some((kw) =>
                rawMessage.toLowerCase().includes(kw)
            );

        const message = isTechnical
            ? "An unexpected error occurred. Please try again."
            : rawMessage;



        /*
        ---------------------------------------------------------------
        | 401 Unauthorized
        ---------------------------------------------------------------
        */

        if (status === 401) {

            localStorage.removeItem("user");

            /*
            ---------------------------------------------------------------
            | Prevent Redirect Loop & Skip Public Auth Pages
            ---------------------------------------------------------------
            */

            const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

            if (!publicPaths.includes(window.location.pathname)) {

                toast.error(
                    "Session expired. Please login again.",
                    {
                        id: "unauthorized-error"
                    }
                );

                // window.location.href triggers a full page reload, which tears
                // down the React tree (and the toast just scheduled) before the
                // browser ever paints it. Give it a moment to actually render.
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
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
        | 429 Too Many Requests
        ---------------------------------------------------------------
        */

        else if (status === 429) {

            toast.error(
                typeof error.response.data === "string"
                    ? error.response.data
                    : "Too many requests. Please wait before trying again.",
                {
                    id: "rate-limit-error"
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