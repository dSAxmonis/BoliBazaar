import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const OpenRoute = ({children}) => {

    const {user} = useSelector((state) => state.profile);

    if(user === null){
        return children;
    }
    else{
        return <Navigate to="/dashboard/my-profile" />
    }
}

export default OpenRoute;