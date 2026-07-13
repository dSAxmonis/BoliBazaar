const Notification = require('../models/Notifications');

// get notifications
exports.getNotifications = async (req, res) => {
    try{
        const notifications = await Notification.find({userId:req.user.id})
        .sort({timestamp: -1});

        return res.status(200).json({
            success:true,
            message:"Notifications fetched successfully",
            data:notifications
        });
    }

    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message: "Internal server error" 
        });
    }
}

//mark notification as read
exports.markNotificationRead = async (req, res) => {
    try{
        await Notification.updateMany({ userId: req.user.id, isRead:false }, {
            $set: {
                isRead:true
            }
        });

        return res.status(200).json({
            success:true,
            message:"Marked all as read"
        });
    }

    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message: "Internal server error" 
        });
    }
}

//clear notifications
exports.clearNotification = async (req, res) => {
    try{
        await Notification.deleteMany({ userId: req.user.id });

        return res.status(200).json({
            success:true,
            message:"All notifications cleared"
        });
    }

    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message: "Internal server error" 
        });
    }
}