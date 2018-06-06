import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import {GET_ERRORS, SET_CURRENT_USER} from './types';


//Register User
export const registeruser = (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
            .then(res => history.push('/login'))
            .catch(err => dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            }));
};

//Login - Get User Token
export const loginUser = userData => dispatch => {
    axios.post('/api/users/login', userData)
        .then(res => {
            //Save to LocaStorage
            const {token} = res.data;
            //Set token LocalStorage
            localStorage.setItem('jwtToken', token);
            //Set token to Auth header
            setAuthToken(token);
            //Decode token to get use data
            const decoded = jwt_decode(token);
            //Set current user
            dispatch(setCurrentUser(decoded))

        })
        .catch(err => dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        }));
};

//Set loggen in user
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}
//Log user out
export const logoutUser = () => dispatch => {
    //Remove toke from localStorage
    localStorage.removeItem('jwtToken');
    //Remove auth from header for future request
    setAuthToken(false);
    //Set current user to empty object which will set isAuthenticated to false
    dispatch(setCurrentUser({}))
};
