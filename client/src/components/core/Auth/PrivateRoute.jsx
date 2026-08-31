import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({children}) => {

    const { user, sessionChecked } = useSelector((state) => state.profile);

    if (!sessionChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if(user !== null){
        return children;
    }
    else{
        return <Navigate to="/login" />
    }
};

export default PrivateRoute;