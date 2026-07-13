import React from "react";
import { useSelector } from "react-redux";
import EmptyLoader from "../components/EmptyLoader.jsx";
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/core/Dashboard/Sidebar';

const Dashboard = () => {

    const {loading: profileLoading} = useSelector((state) => state.profile);

    if(profileLoading){
        return(
            <div>
                <EmptyLoader />
            </div>
        )
    }

    return(
        <div className="w-full pt-24">
            <div className="relative flex flex-col xl:flex-row gap-5 w-full h-full p-3">
                
                <Sidebar />
                
                <div className="w-full shadow-lg xl:flex-1 h-full rounded-2xl overflow-y-auto">
                    <div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Dashboard;