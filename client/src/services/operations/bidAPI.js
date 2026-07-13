import toast from 'react-hot-toast';
import { bidEndpoints } from '../apis';
import { apiConnector } from '../apiConnector';

const { PLACE_BID, EDIT_BID, DELETE_BID } = bidEndpoints;

export const placeBid = async (bidData) => {
    const toastId = toast.loading("Loading...");
    console.log("BID DATA", bidData);
    //console.log("FORMDATA", [...formData.entries()]);
    let result = [];

    try{
        const response = await apiConnector("POST", PLACE_BID, bidData);

        console.log("RESPONSE OF PLACE BID", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.newBid;
        toast.success("Bid Placed");
    }
    catch(error){
        console.log("ERROR PLACING BID", error);

        // Extract the error message from the backend response
        const errorMessage = error.response?.data?.message || "Cannot place Bid";

        // Display the specific error message in toast
        toast.error(errorMessage);
    }
    toast.dismiss(toastId);
    return result;
}

export const editBid = async (bidId, newAmount) => {
    const toastId = toast.loading("Loading...");
    let result = [];

    try {
        const response = await apiConnector("PUT", `${EDIT_BID}/${bidId}`, { bidAmount: newAmount });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        result = response.data.updatedBid;
        toast.success("Bid Updated Successfully");
    } catch (error) {
        console.log("ERROR UPDATING BID", error);
        const errorMessage = error.response?.data?.message || "Cannot update bid";
        toast.error(errorMessage);
    }
    toast.dismiss(toastId);
    return result;
}

export const deleteBid = async (bidId) => {
    const toastId = toast.loading("Loading...");
    //console.log("BID ID IN FRONTEND", bidId);
    let result = [];

    try {
        const response = await apiConnector("DELETE", `${DELETE_BID}/${bidId}`);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        result = response.data;
        toast.success("Bid Deleted Successfully");
    } catch (error) {
        console.log("ERROR DELETING BID", error);
        const errorMessage = error.response?.data?.message || "Cannot delete bid";
        toast.error(errorMessage);
    }
    toast.dismiss(toastId);
    return result;
}