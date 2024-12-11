// reducers/authReducer.ts
import { Dispatch } from 'react';
import { AuthActionTypes, AuthState , LOGIN_SUCCESS, LOGIN_FAILURE, VERIFY_TOKEN_SUCCESS, LOGOUT} from '../../types';
import { loginApi, verifyCodeApi } from '../../services/authService';
import { toast } from 'react-toastify';

const initialState: AuthState = {
   token: null,
};

export function loginAction(email: string, password: string) {
    return async (dispatch: Dispatch<AuthActionTypes>) => {
        try {
            console.log("## ACTION:CALLING LOGIN API");
            const data = await loginApi(email, password);

            //Create basic auth token with email and password
            const basicAuth = `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;
            
            console.log("basicAuth", basicAuth);
            dispatch({
                type: LOGIN_SUCCESS,
                payload: {
                    token: basicAuth,
                }
            });
            console.log("## ACTION:LOGIN_SUCCESS", data);
            toast.success(data.message);
            return data;

        } catch (error) {
            dispatch({
                type: LOGIN_FAILURE,
                payload: 'Invalid email or password',
            });
        }
    };
}

export function logOutAction() {
    return async(dispatch: Dispatch<AuthActionTypes>) => {
        dispatch({
            type: LOGOUT,
            payload: {}
        })
    }
}

export function verifyTokenAction(email: string, token: string) {
    return async (dispatch: Dispatch<AuthActionTypes>) => {
        try {
            const data = await verifyCodeApi(email, token);
            if( data.status !== 200) {
                throw new Error('Invalid token');
            }

            console.log("## ACTION:VERIFY_TOKEN_SUCCESS", data);

            dispatch({
                type: VERIFY_TOKEN_SUCCESS,
                payload: {
                    token: data.data?.token,
                    refreshToken: data.data?.refreshToken,
                }
            });

            return data;
        } catch (error) {
            toast.error('Invalid token');
        }
    };
}


const authReducer = (state = initialState, action: AuthActionTypes): AuthState => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            console.log("## REDUCER:LOGIN_SUCCESS", action.payload);
            return {
                token: action.payload.token,
            }
        case LOGIN_FAILURE:
            return {
                token: null,
            }
        default:
            return state;
    }
};

export default authReducer;
