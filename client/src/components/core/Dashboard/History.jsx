import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { formatDate } from "../../../services/formatDate";
import { getUserHistory } from '../../../services/operations/userAPI';
import { LuHistory } from "react-icons/lu";
import { HiOutlineTrophy } from "react-icons/hi2";
import { RiAuctionLine } from "react-icons/ri";
import { AiOutlineClockCircle } from "react-icons/ai";

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await getUserHistory(filter, 20);
                setHistory(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [filter]);

    const getFilteredHistory = () => {
        if (filter === "all") return history;
        return history.filter(item => item.type === filter);
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case "created":
                return <RiAuctionLine className="w-5 h-5" />;
            case "won":
                return <HiOutlineTrophy className="w-5 h-5" />;
            case "bid":
                return <AiOutlineClockCircle className="w-5 h-5" />;
            default:
                return <LuHistory className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case "created":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "won":
                return "bg-green-100 text-green-800 border-green-200";
            case "bid":
                return "bg-purple-100 text-purple-800 border-purple-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "active":
                return "bg-blue-100 text-blue-800";
            case "outbid":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
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
                    <p className="text-gray-600">Loading your history...</p>
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
            <div className="max-w-6xl mx-auto">
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Auction History
                    </h1>
                    <p className="text-gray-600">Track your auction activities and outcomes</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{history.length}</p>
                            <p className="text-sm text-blue-600">Total Activities</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {history.filter(h => h.type === "won").length}
                            </p>
                            <p className="text-sm text-green-600">Items Won</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {history.filter(h => h.type === "created").length}
                            </p>
                            <p className="text-sm text-purple-600">Auctions Created</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-orange-600">
                                {history.filter(h => h.type === "bid").length}
                            </p>
                            <p className="text-sm text-orange-600">Bids Placed</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap gap-2 mb-6"
                >
                    {["all", "created", "won", "bid"].map((filterType) => (
                        <Button
                            key={filterType}
                            variant={filter === filterType ? "default" : "outline"}
                            onClick={() => setFilter(filterType)}
                            className="capitalize"
                        >
                            {filterType === "all" ? "All Activities" : filterType}
                        </Button>
                    ))}
                </motion.div>

                <AnimatePresence>
                    {getFilteredHistory().length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-20"
                        >
                            <LuHistory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No History Yet</h3>
                            <p className="text-gray-500">Start participating in auctions to see your history here</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {getFilteredHistory().map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    layout
                                >
                                    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                
                                                <div className="flex-shrink-0">
                                                    <img 
                                                        src={item.image || `https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400`} 
                                                        alt={item.title}
                                                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                ${item.amount?.toLocaleString() || 0}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>
                                                                <div className="flex items-center gap-1">
                                                                    {getTypeIcon(item.type)}
                                                                    <span className="capitalize">{item.type}</span>
                                                                </div>
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                                        <span>{formatDate(item.date)}</span>
                                                        <span className="text-blue-600 font-medium">
                                                            {item.type === "won" ? "Won" : 
                                                             item.type === "created" ? "Created" : 
                                                             item.type === "bid" ? "Bid Placed" : "Activity"}
                                                        </span>
                                                    </div>
                                                </div>
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

export default History;
