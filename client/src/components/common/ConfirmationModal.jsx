import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { placeBid } from "../../services/operations/bidAPI";

const ConfirmationModal = ({ auctionId, onClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [loading, setLoading] = useState(false);
    const {user} = useSelector((state) => state.profile);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
    
        if (!user) {
            navigate("/login");
        }
    
        const bidData = {
            productId: auctionId,
            bidAmount: data.bidAmount
        };
    
        try {
            const response = await placeBid(bidData);
            if (response.data.success) {
                toast.success("Bid placed successfully!");
                onClose();
            } else {
                toast.error(response.message || "Failed to place bid");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    
        setLoading(false);
    };
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 px-5 sm:px-0">
            <div className="bg-[#F8EDE3] rounded-lg shadow-lg md:mx-4 xl:max-w-[500px] w-full p-6">
                <div className="flex justify-between items-center mb-4 bg-[#D0B8A8] px-4 py-3 rounded-t-md">
                    <p className="text-lg font-semibold">Place a Bid</p>
                    <button onClick={onClose} className="bg-red-600 hover:bg-red-700 p-2 rounded-full text-white transition-all duration-300">
                        <RxCross2 fontSize={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Bid Amount</label>
                        <input
                            type="number"
                            {...register("bidAmount", { required: true, min: 1 })}
                            placeholder="Enter bid amount"
                            className="w-full rounded-md p-2 focus:outline-none bg-white text-black"
                        />
                        {errors.bidAmount && <span className="text-red-500 text-sm">Valid bid amount is required</span>}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 bg-gray-400 hover:bg-gray-500 transition-all duration-300 rounded-lg text-white">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-lg text-white">
                            {loading ? "Placing..." : "Place Bid"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfirmationModal;
