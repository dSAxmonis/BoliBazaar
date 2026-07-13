import toast from 'react-hot-toast';
import { setLoading, setUser } from '../../slices/profileSlice';
import { apiConnector } from '../apiConnector';
import { authEndpoints } from '../apis';

import { auth, provider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const { LOGIN_API, SIGNUP_API, GOOGLE_LOGIN } = authEndpoints;

export function login(data, navigate){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", LOGIN_API, data);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Logged In");

            //extracting image
            const userImage = response.data.user.image ? response.data.user.image
            : `https://api.dicebear.com/8.x/initials/svg?seed=${response.data.user.name}`;

            dispatch(setUser({...response.data.user, image:userImage}));

            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/dashboard/my-profile")
        }
        catch(error){
            console.log("ERROR IN LOGGING API", error);
            toast.error("Login Failed");
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
            
            //console.log("RESPONSE OF SIGNUP", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Sign Up Successful");
            navigate("/login");
        }

        catch(error){
            console.log("ERROR IN SIGNUP", error);
            toast.error("Cannot Sign Up Right Now!!");
            navigate("/signup");
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

export function googleLogin(navigate){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));
        
        try{
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const response = await apiConnector("POST", GOOGLE_LOGIN, {
                uid: user.uid,
                firstName: user.displayName.split(" ")[0],
                lastName: user.displayName.split(" ")[1],
                email: user.email,
                imageUrl:user.photoURL,
            });

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Login Successful");
            //console.log("USER", response.data.user);
            dispatch(setUser({...response.data.user}));

            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/dashboard/my-profile");
        }
        catch(error){
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error("Popup closed before completing login.");
            } else {
                toast.error("An error occurred during Google login.");
                //console.error("ERROR OCCURRED WHILE LOGIN WITH GOOGLE", error);
            }
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }

}
