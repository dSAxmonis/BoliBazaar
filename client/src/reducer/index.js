import { combineReducers } from 'redux';

import profileReducer from '../slices/profileSlice';

const rootReducer = combineReducers({
    profile: profileReducer
});

export default rootReducer;