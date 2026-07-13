import React from "react";
import { MdDelete } from "react-icons/md";
import { MdOutlineMarkAsUnread } from "react-icons/md";
import { TbMoodSad } from "react-icons/tb";

const NotificationDropdown = ({ notifications, markAllAsRead, clearAll }) => {

    return(
        <div className="absolute right-0 w-96 h-96 bg-white shadow-lg rounded-xl z-50 p-5">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-black">Notifications</h2>
                <div className="flex gap-2">
                    <button onClick={markAllAsRead} className="text-lg cursor-pointer text-blue-500"><MdOutlineMarkAsUnread /></button>
                    <button onClick={clearAll} className="text-lg cursor-pointer text-red-500"><MdDelete /></button>
                </div>
            </div>
            <ul className="max-h-64 overflow-y-scroll flex items-center justify-center">
                {notifications?.length === 0 ? (
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <TbMoodSad className="text-gray-400 text-[4rem] mt-24"/>
                        <p className="text-gray-500 text-sm">No notifications</p>
                    </div>
                ) : (
                    notifications?.map((n, i) => (
                        <li key={i} className={`p-3 flex gap-2 justify-center flex-col text-black rounded-xl ${n.isRead ? "bg-white" : "bg-[#f3f5f9]"}`}>
                            <p className="text-base">{n.message}</p>
                            <div className="text-xs mt-1 text-right text-gray-500">{new Date(n.timestamp).toLocaleString()}</div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
};

export default NotificationDropdown;