import { useSelector } from "react-redux";
import { useLocation, matchPath, NavLink } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { RiAuctionLine } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { HiOutlineTrophy } from "react-icons/hi2";
import { LuHistory } from "react-icons/lu";
import { motion } from "motion/react";

const Sidebar = () => {

    const location = useLocation();
    const {user} = useSelector((state) => state.profile);

    const sidebarLinks = [
        {
            id:1,
            name:"My Profile",
            path:"/dashboard/my-profile",
            icon: <CgProfile className="text-xl" />
        },
        {
            id:2,
            name:"My Auctions",
            path:"/dashboard/my-auctions",
            icon:<RiAuctionLine className="text-xl" />
        },
        {
            id:3,
            name:"Create Auction",
            path:"/dashboard/create-auction",
            icon:<FiPlus className="text-xl" />
        },
        {
            id:4,
            name:"Auctions Won",
            path:"/dashboard/auctions-won",
            icon:<HiOutlineTrophy className="text-xl" />
        },
        {
            id:5,
            name:"History",
            path:"/dashboard/history",
            icon:<LuHistory className="text-xl" />
        }
    ];

    const matchRoute = (route) => {
        return matchPath({path:route}, location.pathname);
    }

    return(
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-80 md:mx-auto h-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/20"
        >
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-white/30"
            >
                <div className="relative">
                    <img 
                        src={user?.image?.url} 
                        alt="user-img" 
                        className="w-16 h-16 object-cover rounded-2xl shadow-lg border-2 border-white"
                        loading="lazy"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex-1">
                    <h1 className="font-bold text-lg text-gray-800">Welcome back!</h1>
                    <p className="text-sm text-gray-600 font-medium">{user?.name || user?.firstName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
            </motion.div>

            <div className="space-y-2">
                {sidebarLinks.map((link, index) => {
                    const isActive = matchRoute(link.path);
                    return (
                        <motion.div
                            key={link.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                        >
                            <NavLink
                                to={link.path}
                                className={`relative group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                                ${isActive 
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                
                                <div className="relative z-10 flex items-center gap-4">
                                    <span className={`transition-all duration-300 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}>
                                        {link.icon}
                                    </span>
                                    <span className="relative z-10">{link.name}</span>
                                </div>
                                
                                {isActive && (
                                    <motion.div
                                        className="absolute right-2 w-2 h-2 bg-white rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                    />
                                )}
                            </NavLink>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-white/30"
            >
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white/50 rounded-xl">
                        <p className="text-lg font-bold text-blue-600">{user?.products?.length}</p>
                        <p className="text-xs text-gray-600">Active Auctions</p>
                    </div>
                    <div className="text-center p-2 bg-white/50 rounded-xl">
                        <p className="text-lg font-bold text-green-600">{user?.winnings?.length}</p>
                        <p className="text-xs text-gray-600">Won Items</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
};

export default Sidebar;