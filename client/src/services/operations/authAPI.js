import toast from 'react-hot-toast';
import { setLoading, setUser } from '../../slices/profileSlice';
import { apiConnector } from '../apiConnector';
import { authEndpoints } from '../apis';

import { auth, provider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const { LOGIN_API, SIGNUP_API, GOOGLE_LOGIN, VERIFY_OTP_API, VERIFY_USER_API } = authEndpoints;

export function login(data, navigate){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", LOGIN_API, data);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            // OTP sent successfully
            toast.success(response.data.message || "OTP sent to your email!", { duration: 6000 });
            navigate("/verify-otp", { state: { email: data.email } });
        }
        catch(error){
            console.log("ERROR IN LOGGING API", error);
            toast.error(error.response?.data?.message || "Login Failed");
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

            toast.success(response.data.message || "Registration successful! Check email for verification link.", {
                duration: 6000
            });
            navigate("/login");
        }
        catch(error){
            console.log("ERROR IN SIGNUP", error);
            toast.error(error.response?.data?.message || "Cannot Sign Up Right Now!!");
            navigate("/signup");
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
                : `https://api.dicebear.com/8.x/initials/svg?seed=${response.data.user.name}`;

            dispatch(setUser({ ...response.data.user, image: userImage }));
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/dashboard/my-profile");
        } catch (error) {
            console.log("ERROR VERIFYING OTP", error);
            toast.error(error.response?.data?.message || "Invalid OTP");
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
            setMessage(error.response?.data?.message || "Email verification failed.");
        }
    }
}

export function googleLogin(navigate, action = "login"){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));
        
        try{
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const nameParts = user.displayName ? user.displayName.split(" ") : ["Google", "User"];
            const firstName = nameParts[0] || "Google";
            const lastName = nameParts.slice(1).join(" ") || "User";

            const response = await apiConnector("POST", GOOGLE_LOGIN, {
                uid: user.uid,
                firstName,
                lastName,
                email: user.email,
                imageUrl: user.photoURL,
                action
            });

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success(action === "signup" ? "Signup Successful" : "Login Successful");
            
            const userImage = response.data.user.image?.url 
                ? response.data.user.image.url
                : `https://api.dicebear.com/8.x/initials/svg?seed=${response.data.user.firstName}`;

            dispatch(setUser({ ...response.data.user, image: userImage }));
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/dashboard/my-profile");
        }
        catch(error){
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error("Popup closed before completing login.");
            } else {
                const errMsg = error.response?.data?.message || error.message || "An error occurred during Google login.";
                toast.error(errMsg);
                if (action === "login" && error.response?.data?.message?.includes("not registered")) {
                    navigate("/signup");
                }
            }
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}
