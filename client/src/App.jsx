import { Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/common/Navbar';
import OpenRoute from './components/core/Auth/OpenRoute';
import PrivateRoute from './components/core/Auth/PrivateRoute';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import About from './pages/About';
import Auctions from './pages/Auctions';
import Dashboard from './pages/Dashboard';
import MyProfile from './components/core/Dashboard/MyProfile';
import MyAuctions from './components/core/Dashboard/MyAuctions'
import CreateAuction from './components/core/Dashboard/CreateAuction';
import CreateCategory from './components/core/Dashboard/CreateCategory';
import AuctionDetails from './pages/AuctionDetails';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { initializeSocket } from './services/socketService';
import Winnings from './components/core/Dashboard/Winnings';
import History from './components/core/Dashboard/History';
import EditAuction from './components/core/Dashboard/EditAuction';

const App = () => {
    const { user } = useSelector((state) => state.profile);

    useEffect(() => {
        if (user) {
            initializeSocket();
        }
    }, [user]);

    return(
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
            <Navbar />
            
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/auctions' element={<Auctions />} />
                <Route path='/auction/:auctionId' element={<AuctionDetails />}/>

                <Route path='/login' element={
                    <OpenRoute>
                        <LoginPage />
                    </OpenRoute>
                }/>

                <Route path='/signup' element={
                    <OpenRoute>
                        <SignupPage />
                    </OpenRoute>
                } />

                <Route path='/dashboard' element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }>

                    <Route path='/dashboard/my-profile' element={
                        <PrivateRoute>
                            <MyProfile />
                        </PrivateRoute>
                    } />

                    <Route path='/dashboard/my-auctions' element={
                        <PrivateRoute>
                            <MyAuctions />
                        </PrivateRoute>
                    } />

                    <Route path='/dashboard/create-auction' element={
                        <PrivateRoute>
                            <CreateAuction />
                        </PrivateRoute>
                    } />

                    <Route path='/dashboard/edit-auction/:auctionId' element={
                        <PrivateRoute>
                            <EditAuction />
                        </PrivateRoute>
                    }/>

                    <Route path='/dashboard/auctions-won' element={
                        <PrivateRoute>
                            <Winnings />
                        </PrivateRoute>
                    } />

                    <Route path='/dashboard/history' element={
                        <PrivateRoute>
                            <History />
                        </PrivateRoute>
                    } />

                    <Route path='/dashboard/create-category' element={
                        <PrivateRoute>
                            <CreateCategory />
                        </PrivateRoute>
                    } />
                
                </Route>
            </Routes>
        </div>
    )
};

export default App;
