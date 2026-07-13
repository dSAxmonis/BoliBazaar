import { React, useState, useEffect } from "react";
import { fetchNotifications, clearNotifications, readNotifications } from "../../../services/operations/auctionAPI";
import { toast } from 'react-toastify';
import { getSocket } from "../../../services/socketService";
import NotificationBell from "./NotificationBell";
import NotificationDropdown from "./NotificationDropdown";

const Notification = () => {

    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const getNotifications = async () => {
        const res = await fetchNotifications();
        setNotifications(res);
    };

    const markAllAsRead = async () => {
        await readNotifications();
        getNotifications();
    };

    const clearAll = async () => {
        await clearNotifications();
        setShowDropdown(false);
        getNotifications();
    };

    const unreadCount = (notifications || []).filter(n => !n.isRead).length;

    useEffect(() => {
        getNotifications();

        const socket = getSocket();
        socket.on("bidNotification", (notification) => {
            toast.info(notification.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            getNotifications();
        });

        return () => socket.off("bidNotification");
    }, []);

    return(
        <div className="relative">
            <NotificationBell unreadCount={unreadCount} onClick={() => setShowDropdown(!showDropdown)} />
                {showDropdown && (
                    <NotificationDropdown
                        notifications={notifications}
                        markAllAsRead={markAllAsRead}
                        clearAll={clearAll}
                    />
                )}
        </div>
    )
}

export default Notification;