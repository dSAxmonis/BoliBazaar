import { apiConnector } from "../apiConnector";
import { auctionEndpoints, categoryEndpoints, notificationEndpoints } from "../apis";
import toast from "react-hot-toast";

const { CREATE_AUCTION, FETCH_ALL_USER_AUCTIONS, DELETE_AUCTION, FETCH_ALL_AUCTIONS, FETCH_SPECIFIC_AUCTION_DETAILS } = auctionEndpoints;
const { CREATE_CATEGORY, FETCH_ALL_CATEGORY, FETCH_ALL_CATEGORY_POSTS } = categoryEndpoints;
const { GET_NOTIFICATIONS, CLEAR_NOTIFICATIONS, MARK_READ_NOTIFICATIONS } = notificationEndpoints;
const { FEATURED_AUCTIONS, EDIT_AUCTION } = auctionEndpoints;

export const createAuction = async (formData, navigate) => {
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("POST", CREATE_AUCTION, formData);

        // console.log("CREATE_AUCTION_API", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Auction Created");
        navigate('/dashboard/my-auctions');
    }
    catch(error){
        console.log("ERROR IN CREATING AUCTION API", error);
        toast.error("Cannot Create Auction");
    }
    toast.dismiss(toastId);
}

export const deleteAuction = async (auctionId) => {
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("DELETE", `${DELETE_AUCTION}/${auctionId}`);

        console.log("RESPONSE", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        // toast.success("Auction Deleted");
        return response;
    }
    catch(error){
        console.log("ERROR DELETING AUCTION", error);
        toast.error("Cannot Delete Auction");
    }
    toast.dismiss(toastId);
}

export const fetchAuctions = async () => {
    const toastId = toast.loading("Loading...");

    let result = [];

    try{
        const response = await apiConnector("GET", FETCH_ALL_AUCTIONS);

        //console.log("RESPONSE FETCH AUCTIONS", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.auctions;
        //toast.success("Auctions Presented");
    }
    catch(error){
        //console.log("ERROR IN FETCH AUCTIONS", error);
        toast.error("No Auctions Currently Present")
    }
    toast.dismiss(toastId);
    return result;
}

export const fetchAuctionDetails = async (auctionId) => {
    const toastId = toast.loading("Loading...");

    let result = [];

    try{
        const response = await apiConnector("GET", `${FETCH_SPECIFIC_AUCTION_DETAILS}?auctionId=${auctionId}`);

        //console.log("RESPONSE FETCH AUCTIONS", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.auctionDetails;
        //toast.success("Auction Presented");
    }
    catch(error){
        console.log("ERROR IN FETCH AUCTION DETAILS", error);
        toast.error("Cannot fetch Auction Details")
    }
    toast.dismiss(toastId);
    return result;
}

export const fetchUserAuctions = async () => {
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("GET", FETCH_ALL_USER_AUCTIONS);

        //console.log("RESPONSE FOR FETCH USER AUCTIONS API", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        if(response.data.auctions.length < 0){
            toast.error("No Auctions Posted")
        }
        else{
            toast.success("Auctions Fetched");
            return response.data.auctions
        }
    }
    catch(error){
        console.log("ERROR IN FETCH AUCTIONS API", error);
        toast.error("Cannot fetch Auctions");
        return [];
    }
    finally{
        toast.dismiss(toastId);
    }
}

export const createCategory = async (data) => {
    try {
        const response = await apiConnector("POST", CREATE_CATEGORY, data);

        console.log("RESPONSE OF CATEGORY CREATION", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Category Created");
        return response;
    } catch (error) {
        console.log("ERROR CREATING CATEGORY", error);

        // Extract the error message from the backend response
        const errorMessage = error.response?.data?.message || "Cannot create category";

        // Display the specific error message in toast
        toast.error(errorMessage);
    }
};


export const fetchCategories = async () => {
    let result = [];
    try{
        const response = await apiConnector("GET", FETCH_ALL_CATEGORY);
        //console.log("POST CATEGORIES API RESPONSE", response);

        if(!response?.data?.success){
            throw new Error(response.data.message);
        }
        result = response?.data?.categories;
        //console.log("Result", result);
    }
    catch(error){
        //console.log("FETCH POST CATEGORIES API ERROR", error);
        toast.error("Failed to display Category")
    }
    return result;
}

export const fetchNotifications = async () => {
    let result = [];
    try{
        const response = await apiConnector("GET", GET_NOTIFICATIONS);
        //console.log("NOTIFICATIONS API RESPONSE", response);

        if(!response?.data?.success){
            throw new Error(response.data.message);
        }

        result = response?.data?.data;
    }
    catch(error){
        console.log("FETCH NOTIFICATIONS API ERROR", error);
        toast.error("Failed to display notifications");
    }
    return result;
}

export const readNotifications = async () => {
    try{
        const response = await apiConnector("PATCH", MARK_READ_NOTIFICATIONS);

        //console.log("READ NOTIFICATIONS API RESPONSE", response);

        if(!response?.data?.success){
            throw new Error(response.data.message);
        }

        return response;
    }
    catch(error){
        console.log("READ NOTIFICATIONS API ERROR", error);
        toast.error("Failed to read notifications");
    }
}

export const clearNotifications = async () => {
    try{
        const response = await apiConnector("DELETE", CLEAR_NOTIFICATIONS);

        //console.log("CLEAR NOTIFICATIONS API RESPONSE", response);

        if(!response?.data?.success){
            throw new Error(response.data.message);
        }

        return response;
    }
    catch(error){
        console.log("DELETE NOTIFICATIONS API ERROR", error);
        toast.error("Failed to delete notifications");
    }
}

export const fetchFeaturedAuctions = async () => {
    let result = [];
    try {
        const response = await apiConnector("GET", FEATURED_AUCTIONS);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.featured;
    } catch (error) {
        console.log("ERROR IN FETCHING FEATURED AUCTIONS", error);
    }
    return result;
};

export const editAuction = async (auctionId, formData) => {
    let result = null;
    try {
        const response = await apiConnector("PATCH", `${EDIT_AUCTION}/${auctionId}`, formData, {
            "Content-Type": "multipart/form-data"
        });
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data.auction;
    } catch (error) {
        console.log("ERROR IN EDITING AUCTION", error);
    }
    return result;

};
