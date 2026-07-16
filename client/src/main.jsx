import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { Provider } from 'react-redux';
import rootReducer from './reducer/index.js';
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
    reducer:rootReducer
})

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-center"
                toastOptions={{ duration: 3000 }}
                containerStyle={{ zIndex: 999999 }}
                gutter={8}
            >
                {(t) => (
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <div
                                onClick={() => t.type !== "loading" && toast.dismiss(t.id)}
                                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                            >
                                {icon}
                                {message}
                            </div>
                        )}
                    </ToastBar>
                )}
            </Toaster>
        </BrowserRouter>
    </Provider>
)
