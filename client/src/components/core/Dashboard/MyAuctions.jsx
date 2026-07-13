import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setEditAuctionForm } from '../../../slices/profileSlice';
import { deleteAuction, fetchUserAuctions } from '../../../services/operations/auctionAPI';
import EmptyLoader from '../../EmptyLoader';
import { formatDate } from "../../../services/formatDate";
import { AiOutlineDelete } from "react-icons/ai";
import { LiaEditSolid } from "react-icons/lia";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import toast from 'react-hot-toast';

const MyAuctions = () => {

    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                setLoading(true);
            const response = await fetchUserAuctions();
            setAuctions(response);
            } catch (error) {
                console.error("Error fetching auctions:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAuctions();
    },[]);

    const handleRemove = async (auctionId) => {
        try{
           const response = await deleteAuction(auctionId);
           if(response && response.data.success){
                toast.success("Auction Deleted Successfully");

                setAuctions((prevAuctions) => prevAuctions.filter(auction => auction._id !== auctionId));   
           }
        }
        catch(error){
            toast.error("Cannot Delete Auction");
            console.log(error);
        }
    }

    const handleEdit = (auction) => {
        dispatch(setEditAuctionForm(auction));
        navigate(`/dashboard/edit-auction/${auction._id}`);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "Live":
                return "bg-green-100 text-green-800 border-green-200";
            case "Sold":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "Expired":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    }

    const getStatusIcon = (status) => {
        switch(status) {
            case "Live":
                return "🟢";
            case "Sold":
                return "💰";
            case "Expired":
                return "⏰";
            default:
                return "⚪";
        }
    }

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your auctions...</p>
                </div>
            </motion.div>
        );
    }

    return(
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen"
        >
            <div className="max-w-7xl mx-auto">
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        My Auctions
                    </h1>
                    <p className="text-gray-600">Manage and track your auction listings</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{auctions.length}</p>
                            <p className="text-sm text-blue-600">Total Auctions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {auctions.filter(a => a.status === "Live").length}
                            </p>
                            <p className="text-sm text-green-600">Live Auctions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {auctions.filter(a => a.status === "Sold").length}
                            </p>
                            <p className="text-sm text-purple-600">Sold Items</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {auctions.filter(a => a.status === "Expired").length}
                            </p>
                            <p className="text-sm text-orange-600">Expired</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <AnimatePresence>
                    {auctions.length <= 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="text-center">
                            <EmptyLoader />
                                <h3 className="text-2xl font-semibold text-gray-700 mt-4">No Auctions Yet</h3>
                                <p className="text-gray-500 mt-2">Start by creating your first auction</p>
                        </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {auctions.map((auction, index) => (
                                <motion.div
                                    key={auction._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    layout
                                >
                                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                                                        {auction.title}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {auction.description}
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(auction.status)}`}>
                                                    <span className="mr-1">{getStatusIcon(auction.status)}</span>
                                                    {auction.status}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">

                                            <div className="relative">
                                                <img 
                                                    src={auction.images?.url} 
                                                    alt={auction.title} 
                                                    className="w-full h-48 object-cover rounded-xl shadow-md"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                    <span className="text-lg font-bold text-green-600">${auction.startingPrice}</span>
                                        </div>
                                    </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Current Bid:</span>
                                                    <span className="font-semibold text-blue-600">${auction.currentBid || auction.startingPrice}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Ends:</span>
                                                    <span className="font-medium text-gray-800">{formatDate(auction.auctionEndTime)}</span>
                                        </div>
                                    </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 flex items-center gap-2 hover:bg-blue-50"
                                                    onClick={() => handleEdit(auction)}
                                                >
                                                    <LiaEditSolid className="w-4 h-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemove(auction._id)}
                                                    className="flex items-center gap-2 hover:bg-red-50 text-red-600 border-red-200"
                                                >
                                                    <AiOutlineDelete className="w-4 h-4" />
                                                    Delete
                                                </Button>
                                </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
            </div>
                    )}
                </AnimatePresence>
        </div>
        </motion.div>
    )
};

export default MyAuctions;