import { GoBell } from "react-icons/go";

const NotificationBell = ({unreadCount, onClick}) => {
    return(
        <div onClick={onClick} className="relative cursor-pointer">
            <GoBell fontSize={24} />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                    {unreadCount}
                </span>
            )}
        </div>
    )
}

export default NotificationBell;