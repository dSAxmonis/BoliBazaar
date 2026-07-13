import toast from 'react-hot-toast';
import { userEndpoints } from '../apis';
import { apiConnector } from '../apiConnector';
import { setLoading, setUser } from '../../slices/profileSlice';

const { TOP_BUYERS, TOP_SELLERS, GET_USER_PROFILE, GET_USER_HISTORY, GET_USER_WINNINGS, DELETE_USER_ACCOUNT } = userEndpoints;

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