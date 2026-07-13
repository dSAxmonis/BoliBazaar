const BASE_URL = import.meta.env.VITE_BASE_URL;

export const authEndpoints = {
    LOGIN_API: BASE_URL + "/auth/login",
    SIGNUP_API: BASE_URL + "/auth/signup",
    LOGOUT_API: BASE_URL + "/auth/logout",
    GOOGLE_LOGIN: BASE_URL + "/auth/google-login"
};

export const auctionEndpoints = {
    CREATE_AUCTION: BASE_URL + "/auction/createAuction",
    FETCH_ALL_USER_AUCTIONS: BASE_URL + "/auction/getAuctions",
    DELETE_AUCTION: BASE_URL + "/auction/deleteAuction",
    FETCH_ALL_AUCTIONS: BASE_URL + "/auction/fetchAllAuctions",
    FETCH_SPECIFIC_AUCTION_DETAILS: BASE_URL + "/auction/fetchSpecificAuction",
    FEATURED_AUCTIONS: BASE_URL + "/auction/featured",
    EDIT_AUCTION: BASE_URL + "/auction/editAuction"
}

export const categoryEndpoints = {
    CREATE_CATEGORY: BASE_URL + "/auction/createCategory",
    FETCH_ALL_CATEGORY: BASE_URL + "/auction/getAllCategories",
    FETCH_ALL_CATEGORY_POSTS: BASE_URL + "/auction/getAllCategoryPosts"
}

export const userEndpoints = {
    TOP_BUYERS: BASE_URL + "/user/topBuyers",
    TOP_SELLERS: BASE_URL + "/user/topSellers",
    GET_USER_PROFILE: BASE_URL + "/user/profile",
    GET_USER_HISTORY: BASE_URL + "/user/history",
    GET_USER_WINNINGS: BASE_URL + "/user/winnings",
    DELETE_USER_ACCOUNT: BASE_URL + "/user/delete-account"
}

export const bidEndpoints = {
    PLACE_BID: BASE_URL + "/bid/placeBid",
    EDIT_BID: BASE_URL + "/bid/editBid",
    DELETE_BID: BASE_URL + "/bid/deleteBid"
}

export const notificationEndpoints = {
    GET_NOTIFICATIONS: BASE_URL + "/auction/notifications",
    MARK_READ_NOTIFICATIONS: BASE_URL + "/auction/notifications/mark-read",
    CLEAR_NOTIFICATIONS: BASE_URL + "/auction/notifications/clear"
}