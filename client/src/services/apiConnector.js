import axios from "axios";

export const axiosInstance = axios.create({
    withCredentials:true
});

// Auto-handle 401 Unauthorized errors (expired session) by redirecting to login
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Authentication failed or token expired. Clearing session.");
            // If user is currently not on the login/signup/home routes, redirect to login
            const publicPaths = ["/login", "/signup", "/verify-otp", "/token"];
            const isPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path));
            if (!isPublicPath && window.location.pathname !== "/") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : {},
        params: params ? params : null
    });
}
