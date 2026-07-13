import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { formatDate } from "../../../services/formatDate";
import { getUserWinnings } from '../../../services/operations/userAPI';
import { HiOutlineTrophy } from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import { RiAuctionLine } from "react-icons/ri";
import { AiOutlineDollar } from "react-icons/ai";
import { BiTime } from "react-icons/bi";

const Winnings = () => {
    const [winnings, setWinnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        averageSavings: 0
    });

    useEffect(() => {
        const fetchWinnings = async () => {
            try {
                setLoading(true);
                const data = await getUserWinnings();
                if (data) {
                    setWinnings(data.winnings || []);
                    setStatistics(data.statistics || {
                        totalItems: 0,
                        totalValue: 0,
                        totalSavings: 0,
                        averageSavings: 0
                    });
                }
            } catch (error) {
                console.error("Error fetching winnings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWinnings();
    }, []);

    const getSavings = (finalPrice, originalPrice) => {
        return originalPrice - finalPrice;
    };

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your winnings...</p>
                </div>
            </motion.div>
        );
    }

    return (
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
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaCrown className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            My Winnings
                        </h1>
                        <FaCrown className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-gray-600">Celebrate your successful auction victories</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{statistics.totalItems}</p>
                            <p className="text-sm text-yellow-600">Items Won</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">${statistics.totalValue?.toLocaleString() || 0}</p>
                            <p className="text-sm text-green-600">Total Value</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                ${statistics.totalSavings?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-blue-600">Total Savings</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                ${statistics.averageSavings || 0}
                            </p>
                            <p className="text-sm text-purple-600">Avg. Savings</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <AnimatePresence>
                    {winnings.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-20"
                        >
                            <HiOutlineTrophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Winnings Yet</h3>
                            <p className="text-gray-500">Start bidding on auctions to win amazing items</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {winnings.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    layout
                                >
                                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 transform translate-x-10 -translate-y-10"></div>
                                        
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <HiOutlineTrophy className="w-5 h-5 text-yellow-500" />
                                                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                            Won
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                                                        {item.title}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {item.description || "No description available"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="relative">
                                                <img 
                                                    src={item.image.url || `https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400`} 
                                                    alt={item.title}
                                                    className="w-full h-48 object-cover rounded-xl shadow-md"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                    <span className="text-lg font-bold text-green-600">${item.finalPrice?.toLocaleString() || 0}</span>
                                                </div>
                                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                    -${getSavings(item.finalPrice || 0, item.originalPrice || 0).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <AiOutlineDollar className="w-4 h-4 text-green-600" />
                                                        <div>
                                                            <span className="text-gray-600">Final Price:</span>
                                                            <p className="font-semibold text-green-600">${item.finalPrice?.toLocaleString() || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RiAuctionLine className="w-4 h-4 text-blue-600" />
                                                        <div>
                                                            <span className="text-gray-600">Original Price:</span>
                                                            <p className="font-semibold text-blue-600">${item.originalPrice?.toLocaleString() || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <BiTime className="w-4 h-4 text-purple-600" />
                                                        <div>
                                                            <span className="text-gray-600">Won Date:</span>
                                                            <p className="font-medium text-gray-800">{formatDate(item.wonDate)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 h-4 text-orange-600">🏷️</span>
                                                        <div>
                                                            <span className="text-gray-600">Category:</span>
                                                            <p className="font-medium text-gray-800">{item.category || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.seller && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-600">Seller:</span>
                                                        <span className="font-medium text-gray-800">{item.seller}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 flex items-center gap-2 hover:bg-blue-50"
                                                >
                                                    <span>📋</span>
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 hover:bg-green-50 text-green-600 border-green-200"
                                                >
                                                    <span>📞</span>
                                                    Contact Seller
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
    );
};

export default Winnings;
