import toast from 'react-hot-toast';
import { userEndpoints } from '../apis';
import { apiConnector } from '../apiConnector';
import { setLoading, setUser } from '../../slices/profileSlice';

const { TOP_BUYERS, TOP_SELLERS, GET_USER_PROFILE, GET_USER_HISTORY, GET_USER_WINNINGS, DELETE_USER_ACCOUNT, UPDATE_PROFILE, TOGGLE_WATCHLIST, GET_WATCHLIST } = userEndpoints;

export const topBuyers = async () => {
    //const toastId = toast.loading("Loading...");

    let result = [];

    try{
        const response = await apiConnector("GET", TOP_BUYERS);

        //console.log("RESPONSE FETCH AUCTIONS", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.topBuyers;
        //toast.success("Auctions Presented");
    }
    catch(error){
        console.log("ERROR IN FETCHING TOP BUYERS", error);
        //toast.error("Cannot fetch Auctions")
    }
    //toast.dismiss(toastId);
    return result;
}

export const topSellers = async () => {
    //const toastId = toast.loading("Loading...");

    let result = [];

    try{
        const response = await apiConnector("GET", TOP_SELLERS);

        //console.log("RESPONSE FETCH AUCTIONS", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.topSellers;
        //toast.success("Auctions Presented");
    }
    catch(error){
        console.log("ERROR IN FETCHING TOP SELLERS", error);
        //toast.error("Cannot fetch Auctions")
    }
    //toast.dismiss(toastId);
    return result;
}

export const getUserProfile = async () => {
    let result = null;

    try{
        const response = await apiConnector("GET", GET_USER_PROFILE);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.data;
    }
    catch(error){
        console.log("ERROR IN FETCHING USER PROFILE", error);
        toast.error("Cannot fetch user profile");
    }
    return result;
}

export const getUserHistory = async (type = "all", limit = 20) => {
    let result = [];

    try{
        const response = await apiConnector("GET", `${GET_USER_HISTORY}?type=${type}&limit=${limit}`);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.history;
    }
    catch(error){
        console.log("ERROR IN FETCHING USER HISTORY", error);
        toast.error("Cannot fetch user history");
    }
    return result;
}

export const getUserWinnings = async () => {
    let result = null;

    try{
        const response = await apiConnector("GET", GET_USER_WINNINGS);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data;
    }
    catch(error){
        console.log("ERROR IN FETCHING USER WINNINGS", error);
        toast.error("Cannot fetch user winnings");
    }
    return result;
}

export function deleteUserAccount(navigate){
    return async(dispatch) => {
        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));
        
        try{
            const response = await apiConnector("DELETE", DELETE_USER_ACCOUNT);
    
            if(!response.data.success){
                throw new Error(response.data.message);
            }
    
            dispatch(setUser(null));
            localStorage.removeItem('user');
            toast.success("Account Removed");
            navigate("/");
        }
        catch(error){
            console.log("Error Deleting User", error);
            toast.error("Something went wrong");
        }
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

// Update firstName / lastName / profile picture.
// `updates` is a plain object: { firstName?, lastName?, image? (File) }
export function updateUserProfile(updates){
    return async(dispatch, getState) => {
        const toastId = toast.loading("Saving changes...");
        dispatch(setLoading(true));

        try{
            const formData = new FormData();
            if (updates.firstName) formData.append("firstName", updates.firstName);
            if (updates.lastName) formData.append("lastName", updates.lastName);
            if (updates.image instanceof File) formData.append("image", updates.image);

            const response = await apiConnector("PATCH", UPDATE_PROFILE, formData);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            const updatedUser = response.data.user;
            const currentUser = getState().profile.user || {};
            const mergedUser = { ...currentUser, ...updatedUser };

            dispatch(setUser(mergedUser));
            localStorage.setItem("user", JSON.stringify(mergedUser));

            toast.success("Profile updated");
            toast.dismiss(toastId);
            dispatch(setLoading(false));
            return mergedUser;
        }
        catch(error){
            console.log("Error updating profile", error);
            toast.error(error?.response?.data?.message || "Could not update profile");
            toast.dismiss(toastId);
            dispatch(setLoading(false));
            return null;
        }
    }
}

export const toggleWatchlist = async (productId) => {
    try {
        const response = await apiConnector("POST", TOGGLE_WATCHLIST, { productId });
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data;
    } catch (error) {
        console.log("Error toggling watchlist", error);
        toast.error("Could not update watchlist");
        return null;
    }
};

export const fetchWatchlist = async () => {
    try {
        const response = await apiConnector("GET", GET_WATCHLIST);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.watchlist;
    } catch (error) {
        console.log("Error fetching watchlist", error);
        toast.error("Could not fetch watchlist");
        return [];
    }
};