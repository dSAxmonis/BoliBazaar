import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    loading: false,
    editAuctionForm: null
}

const profileSlice = createSlice({
    name:"profile",
    initialState:initialState,
    reducers:{
        setUser(state, value) {
            state.user = value.payload;
            localStorage.setItem("user", JSON.stringify(value.payload));
        },
        setLoading(state, value){
            state.loading = value.payload;
        },
        logout: (state) => {
            state.user = null;
        },
        setEditAuctionForm(state, action) {
            state.editAuctionForm = action.payload;
        },
        clearEditAuctionForm(state) {
            state.editAuctionForm = null;
        }
    }
});

export const { setUser, setLoading, logout, setEditAuctionForm, clearEditAuctionForm } = profileSlice.actions;
export default profileSlice.reducer;