import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    loading: false,
    editAuctionForm: null,
    sessionChecked: false
}

const profileSlice = createSlice({
    name:"profile",
    initialState:initialState,
    reducers:{
        setUser(state, action) {
            state.user = action.payload;
        },
        setLoading(state, action){
            state.loading = action.payload;
        },
        logout: (state) => {
            state.user = null;
        },
        setEditAuctionForm(state, action) {
            state.editAuctionForm = action.payload;
        },
        clearEditAuctionForm(state) {
            state.editAuctionForm = null;
        },
        setSessionChecked(state, action) {
            state.sessionChecked = action.payload;
        }
    }
});

export const { setUser, setLoading, logout, setEditAuctionForm, clearEditAuctionForm, setSessionChecked } = profileSlice.actions;
export default profileSlice.reducer;