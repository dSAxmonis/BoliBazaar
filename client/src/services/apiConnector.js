import axios from "axios";

export const axiosInstance = axios.create({
    withCredentials:true
});

// Auto-inject Authorization header if token exists in localStorage
axiosInstance.interceptors.request.use((config) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch (e) {
            console.error("Error parsing user from localStorage for Authorization header", e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null
    });
}
