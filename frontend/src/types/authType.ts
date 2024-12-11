// types.ts
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const VERIFY_TOKEN_SUCCESS = 'VERIFY_TOKEN_SUCCESS';
export const LOGOUT = "LOGOUT"

export interface AuthState {
   token: string | null;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

// Auth Action Types
interface LoginSuccessAction {
    type: typeof LOGIN_SUCCESS;
    payload: { token: string}
}

interface LoginFailureAction {
    type: typeof LOGIN_FAILURE;
    payload: string;
}

interface VerifyTokenSuccessAction {
    type: typeof VERIFY_TOKEN_SUCCESS;
    payload: {
        token: string;
        refreshToken: string;
    }
}

interface LogoutAction {
    type: typeof LOGOUT;
    payload: {}
}

export interface RegisterUserBody {
    email: string;
    password: string;
}




export type AuthActionTypes = LoginSuccessAction | LoginFailureAction | VerifyTokenSuccessAction | LogoutAction;

