import toast from 'react-hot-toast';
import { setLoading, setUser, setSessionChecked } from '../../slices/profileSlice';
import { apiConnector } from '../apiConnector';
import { authEndpoints } from '../apis';

// Firebase imports removed

const { LOGIN_API, SIGNUP_API, GOOGLE_LOGIN, VERIFY_OTP_API, VERIFY_USER_API, CREATE_PASSWORD_API } = authEndpoints;

// Helper to extract a human-readable error message from any error shape
function getErrorMessage(error, fallback = "Something went wrong") {
    // AxiosError from a server response (4xx/5xx)
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    // Zod validation errors from backend
    if (error.response?.data?.error && Array.isArray(error.response.data.error)) {
        return error.response.data.error.map(e => e.message).join(", ");
    }
    // Plain Error thrown manually or network failures
    if (error.message && error.message !== "Network Error" && !error.message.startsWith("Request failed")) {
        return error.message;
    }
    // Actual network error (server unreachable)
    if (error.message === "Network Error") {
        return "Unable to reach the server. Please check your connection.";
    }
    return fallback;
}

export function login(data, navigate){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", LOGIN_API, data);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            // Check if user is registered via Google and has no password set
            if (response.data.isGoogleAccountWithoutPassword) {
                sessionStorage.setItem("login_email", data.email);
                toast.success(response.data.message || "OTP sent to set your password!", { duration: 6000 });
                navigate("/create-password", { state: { email: data.email } });
                dispatch(setLoading(false));
                toast.dismiss(toastId);
                return;
            }

            // OTP sent successfully
            sessionStorage.setItem("login_email", data.email);
            toast.success(response.data.message || "OTP sent to your email!", { duration: 6000 });
            navigate("/verify-otp", { state: { email: data.email } });
        }
        catch(error){
            console.log("ERROR IN LOGGING API", error);
            toast.error(getErrorMessage(error, "Login Failed"));
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function signup(formData, navigate){
    return async (dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", SIGNUP_API, formData);
            
            if(!response.data.success){
                throw new Error(response.data.message);
            }

            if (response.data.link) {
                toast.success("Email delivery failed locally. Navigating to verification fallback link...", {
                    duration: 5000
                });
                setTimeout(() => {
                    navigate(response.data.link);
                }, 1500);
            } else {
                toast.success(response.data.message || "Registration successful! Check email for verification link.", {
                    duration: 6000
                });
                navigate("/login");
            }
        }
        catch(error){
            console.log("ERROR IN SIGNUP", error);
            toast.error(getErrorMessage(error, "Cannot Sign Up Right Now!"));
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function verifyOtp(email, otp, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Verifying OTP...");
        dispatch(setLoading(true));

        try {
            const response = await apiConnector("POST", VERIFY_OTP_API, { email, otp });

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Logged In successfully");

            // Extracting image
            const userImage = response.data.user.image?.url 
                ? response.data.user.image.url
                : `https://api.dicebear.com/8.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;

            dispatch(setUser({ ...response.data.user, image: { url: userImage, public_id: response.data.user.image?.public_id || null } }));

            // Clean up session storage
            sessionStorage.removeItem("login_email");

            navigate("/dashboard/my-profile");
        } catch (error) {
            console.log("ERROR VERIFYING OTP", error);
            toast.error(getErrorMessage(error, "Invalid OTP"));
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function verifyEmail(token, navigate, setStatus, setMessage) {
    return async () => {
        try {
            const response = await apiConnector("GET", `${VERIFY_USER_API}/${encodeURIComponent(token)}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            setStatus("success");
            setMessage(response.data.message || "Email verified successfully.");

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        } catch (error) {
            console.error("Email verification error:", error);
            setStatus("error");
            setMessage(getErrorMessage(error, "Email verification failed."));
        }
    }
}

export function googleLogin(navigate, action = "login"){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));
        
        try{
            const width = 500;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                authEndpoints.GOOGLE_LOGIN,
                "Google Login",
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
            );

            if (!popup) {
                throw new Error("Popup blocked by browser. Please enable popups for this site.");
            }

            const authPromise = new Promise((resolve, reject) => {
                const handleMessage = (event) => {
                    if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                        window.removeEventListener('message', handleMessage);
                        resolve(event.data);
                    }
                };

                window.addEventListener('message', handleMessage);

                const checkClosed = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkClosed);
                        window.removeEventListener('message', handleMessage);
                        reject(new Error("auth/popup-closed-by-user"));
                    }
                }, 1000);
            });

            const data = await authPromise;

            toast.success(action === "signup" ? "Signup Successful" : "Login Successful");
            
            const userImage = data.user.image?.url 
                ? data.user.image.url
                : `https://api.dicebear.com/8.x/initials/svg?seed=${data.user.firstName}`;

            dispatch(setUser({ ...data.user, image: { url: userImage, public_id: data.user.image?.public_id || null } }));

            navigate("/dashboard/my-profile");
        }
        catch(error){
            if (error.message === 'auth/popup-closed-by-user') {
                toast.error("Popup closed before completing login.");
            } else {
                toast.error(error.message || "An error occurred during Google login.");
            }
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function getUserSession() {
    return async (dispatch) => {
        try {
            const response = await apiConnector("GET", authEndpoints.GET_USER_DETAILS_API);
            
            if (response.data.success) {
                const userImage = response.data.user.image?.url 
                    ? response.data.user.image.url
                    : `https://api.dicebear.com/8.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
                
                dispatch(setUser({ ...response.data.user, image: { url: userImage, public_id: response.data.user.image?.public_id || null } }));
            }
        } catch (error) {
            // If token is invalid or user doesn't exist, this will fail
            // The response interceptor handles 401s, but we can also explicitly clear user here
            console.log("Session fetch failed, user needs to login");
            dispatch(setUser(null));
        } finally {
            dispatch(setSessionChecked(true));
        }
    }
}

export function createPassword(data, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Creating password...");
        dispatch(setLoading(true));

        try {
            const response = await apiConnector("POST", CREATE_PASSWORD_API, data);

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Password created successfully. You can now log in manually.");
            
            // Clean up session storage
            sessionStorage.removeItem("login_email");

            navigate("/login");
        } catch (error) {
            console.log("ERROR CREATING PASSWORD", error);
            toast.error(getErrorMessage(error, "Failed to create password"));
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}
