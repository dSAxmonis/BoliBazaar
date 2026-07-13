import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { deleteUserAccount, getUserProfile } from '../../../services/operations/userAPI';
import { formatDate } from "../../../services/formatDate";
import { FaUser, FaTrophy, FaGavel, FaEye, FaClock, FaDollarSign } from "react-icons/fa";
import { RiAuctionLine } from "react-icons/ri";
import { BiTime } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const MyProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const data = await getUserProfile();
                setProfileData(data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </motion.div>
        );
    }

    if (!profileData) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex items-center justify-center"
            >
                <div className="text-center">
                    <FaUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Profile Not Found</h3>
                    <p className="text-gray-500">Unable to load your profile data</p>
                </div>
            </motion.div>
        );
    }

    const { user, statistics, recentActivity } = profileData;

    const tabs = [
        { id: "overview", name: "Overview", icon: <FaUser className="w-4 h-4" /> },
        { id: "activity", name: "Recent Activity", icon: <FaClock className="w-4 h-4" /> },
        { id: "stats", name: "Statistics", icon: <FaTrophy className="w-4 h-4" /> }
    ];

    //delete logic
    const handleDelete = async () => {
        dispatch(deleteUserAccount(navigate));
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
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-600">Manage your account and view your activity</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                                <div className="relative">
                                    <img 
                                        src={user.image?.url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.firstName} ${user.lastName}`} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-gray-600 mb-4">{user.email}</p>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {user.role}
                                        </span>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            Member since {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <div className="relative inline-block">
                                {/* Delete button */}
                                <button
                                    onClick={() => setShowConfirm((prev) => !prev)}
                                    className="bg-red-600 cursor-pointer text-white px-4 py-4 rounded-lg hover:bg-red-700 transition"
                                >
                                    <MdDelete />
                                </button>

                                {/* Hover / popover confirmation box */}
                                {showConfirm && (
                                    <div className="absolute -left-25 md:-left-36 right-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50">
                                    <p className="text-gray-700 text-sm mb-3">
                                        Are you sure you want to delete your account? This action is{" "}
                                        <span className="text-red-500 font-semibold">permanent</span>.
                                    </p>
                                    <div className="flex justify-between">
                                        <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                        No
                                        </button>
                                        <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                        {loading ? "Deleting..." : "Yes"}
                                        </button>
                                    </div>
                                    </div>
                                )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap gap-2 mb-6"
                >
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "default" : "outline"}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2"
                        >
                            {tab.icon}
                            {tab.name}
                        </Button>
                    ))}
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                    <CardContent className="p-6 text-center">
                                        <RiAuctionLine className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-blue-600">{statistics.totalAuctions}</p>
                                        <p className="text-sm text-blue-600">Total Auctions</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                                    <CardContent className="p-6 text-center">
                                        <FaTrophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-green-600">{statistics.totalWinnings}</p>
                                        <p className="text-sm text-green-600">Items Won</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                                    <CardContent className="p-6 text-center">
                                        <FaGavel className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-purple-600">{statistics.totalBids}</p>
                                        <p className="text-sm text-purple-600">Total Bids</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                                    <CardContent className="p-6 text-center">
                                        <FaDollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-orange-600">${statistics.totalWinningsValue?.toLocaleString() || 0}</p>
                                        <p className="text-sm text-orange-600">Total Value</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FaEye className="w-5 h-5 text-blue-600" />
                                            Watchlist
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-blue-600">{statistics.watchListCount}</p>
                                        <p className="text-gray-600">Items in your watchlist</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BiTime className="w-5 h-5 text-green-600" />
                                            Active Auctions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-green-600">{statistics.activeAuctions}</p>
                                        <p className="text-gray-600">Currently live auctions</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "activity" && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FaClock className="w-5 h-5 text-purple-600" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentActivity && recentActivity.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentActivity.slice(0, 5).map((activity, index) => (
                                                <motion.div
                                                    key={activity._id || index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <FaGavel className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">
                                                            Bid placed on {activity.product?.title || "Unknown Item"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            ${activity.amount} • {formatDate(activity.createdAt)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No recent activity</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FaTrophy className="w-5 h-5 text-yellow-600" />
                                            Auction Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Auctions Created</span>
                                            <span className="font-bold text-blue-600">{statistics.totalAuctions}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Active Auctions</span>
                                            <span className="font-bold text-green-600">{statistics.activeAuctions}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Completed Auctions</span>
                                            <span className="font-bold text-purple-600">{statistics.completedAuctions}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FaDollarSign className="w-5 h-5 text-green-600" />
                                            Financial Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Winnings Value</span>
                                            <span className="font-bold text-green-600">${statistics.totalWinningsValue?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Bids Placed</span>
                                            <span className="font-bold text-blue-600">{statistics.totalBids}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Watchlist Items</span>
                                            <span className="font-bold text-orange-600">{statistics.watchListCount}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
        </div>
        </motion.div>
    );
};

export default MyProfile;