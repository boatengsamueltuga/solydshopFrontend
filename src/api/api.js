import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",

    withCredentials: true,

    xsrfCookieName: "XSRF-TOKEN",

    xsrfHeaderName: "X-XSRF-TOKEN"
});

export default api;