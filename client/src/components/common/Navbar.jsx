import { TbHomeFilled } from "react-icons/tb";
import { RiAuctionFill } from "react-icons/ri";
import { IoMdContact } from "react-icons/io";
import { HiMiniUsers } from "react-icons/hi2";
import { Link, useLocation, matchPath, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from "../../slices/profileSlice";
import { RxDashboard } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { disconnectSocket } from "../../services/socketService";
import Notification from "../core/Notification/Notification";
import { RxHamburgerMenu } from "react-icons/rx";
import { Card } from "../ui/card";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { motion } from "motion/react";
import { FaGavel, FaUser } from "react-icons/fa"

const url = import.meta.env.VITE_BASE_URL;

const Navbar = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await fetch(`${url}/auth/logout`, {
            method:"POST",
            credentials: "include"
        });

        disconnectSocket();
        
        dispatch(setUser(null));
        localStorage.removeItem('user');
        toast.success("Logged Out");
        navigate('/');
    }

    const {user} = useSelector((state) => state.profile);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <FaGavel className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Auctioneer
                        </span>
                    </Link>
                    <div className="flex items-center space-x-8">
                        <Link to="/auctions" className="text-slate-600 hover:text-blue-600 flex items-center gap-4 transition-all duration-300">
                            <FaGavel />
                            <span className="hidden md:block">Auctions</span>
                        </Link>
                        <Link to="/about" className="text-slate-600 hover:text-blue-600 flex items-center gap-4 transition-all duration-300">
                            <FaUser />
                            <span className="hidden md:block">About</span>
                        </Link>
                    </div>

                    {
                        !user &&
                        <>
                            <div className="hidden lg:flex gap-4 items-center">
                                <Link to="/login">
                                    <div className="hover:bg-blue-50 px-4 py-2 rounded-md transition-all duration-300">
                                        Login
                                    </div>
                                </Link>
                                <Link to="/signup">
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                    hover:to-purple-700 px-4 py-2 rounded-md transition-all duration-300 text-white">
                                        Sign Up
                                    </div>
                                </Link>
                            </div>

                            <div className="flex lg:hidden">
                                <Popover>
                                    <PopoverButton className="focus:outline-none
                                    data-[focus]:outline-1 data-[focus]:outline-white text-[14px] lg:text-[20px] 2xl:text-[20px]">
                                        <RxHamburgerMenu fontSize={24}/>
                                    </PopoverButton>
                                    <Transition
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <PopoverPanel anchor="bottom" className="translate-y-[20px] -translate-x-[10px] z-50">
                                            <Card className="w-[160px] text-center border-slate-200 bg-white flex flex-col gap-2 p-2">
                                                <Link to="/login" className="border border-slate-200 rounded-md">
                                                    <div className="hover:bg-blue-50 px-4 py-2 rounded-md transition-all duration-300">
                                                        Login
                                                    </div>
                                                </Link>
                                                <Link to="/signup">
                                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                                    hover:to-purple-700 px-4 py-2 rounded-md transition-all duration-300 text-white">
                                                        Sign Up
                                                    </div>
                                                </Link>
                                            </Card>
                                        </PopoverPanel>
                                    </Transition>
                                </Popover>
                            </div>
                        </>
                    }

                    {
                        user &&
                        <>
                            <div className="hidden lg:flex gap-4 items-center">
                                <div className="text-black">
                                    <Notification />
                                </div>
                                <button onClick={handleLogout}
                                    className="flex cursor-pointer items-center place-content-center gap-3 px-3 text-red-600 p-2 rounded-lg transition-all duration-300">
                                    <FiLogOut />Log Out
                                </button>
                                {
                                    user &&
                                    <button
                                        onClick={() => navigate('/dashboard/my-profile')}
                                        className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                        title="Dashboard"
                                    >
                                        <RxDashboard className="w-5 h-5" />
                                        <span className="hidden md:inline">Dashboard</span>
                                    </button>
                                }
                            </div>
                            <div className="flex lg:hidden">
                                <Popover>
                                    <PopoverButton className="focus:outline-none
                                    data-[focus]:outline-1 data-[focus]:outline-white text-[14px] lg:text-[20px] 2xl:text-[20px]">
                                        <RxHamburgerMenu fontSize={24}/>
                                    </PopoverButton>
                                    <Transition
                                        enter="transition ease-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="opacity-100 translate-y-0"
                                        leaveTo="opacity-0 translate-y-1"
                                    >
                                        <PopoverPanel anchor="bottom" className="translate-y-[20px] -translate-x-[10px] z-50">
                                            <Card className="w-[160px] text-center justify-center items-center border-slate-200 bg-white flex flex-col gap-2 p-2">
                                                {
                                                    user &&
                                                    <button
                                                        onClick={() => navigate('/dashboard/my-profile')}
                                                        className="w-full justify-center flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                                        title="Dashboard"
                                                    >
                                                        <RxDashboard className="w-5 h-5" />
                                                        <span className="md:inline">Dashboard</span>
                                                    </button>
                                                }
                                                {/* <div className="text-black flex items-center px-2 gap-2 w-full">
                                                    <Notification />
                                                    <span>Notifications</span>
                                                </div> */}
                                                <button onClick={handleLogout}
                                                    className="flex cursor-pointer items-center place-content-center gap-3 px-3 text-red-600 p-2 rounded-lg transition-all duration-300">
                                                    <FiLogOut />Log Out
                                                </button>
                                            </Card>
                                        </PopoverPanel>
                                    </Transition>
                                </Popover>
                            </div>
                        </>
                    }
                </div>
            </div>
        </motion.nav>
    )
};


export default Navbar;

