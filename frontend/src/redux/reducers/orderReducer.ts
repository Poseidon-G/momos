// actions/orderActions.ts
import { Dispatch } from 'redux';
import { CREATE_ORDER_REQUEST, CREATE_ORDER_SUCCESS, CREATE_ORDER_FAILURE, OrderActionTypes, OrderData, OrderBody } from '../../types';
import { createOrderApi } from '../../services/orderService';


export function createOrderAction(token: string, body: OrderBody) {
    return async (dispatch: Dispatch<OrderActionTypes>) => {
        dispatch({ type: CREATE_ORDER_REQUEST });

        try {
            const response = await createOrderApi(token, body);
            console.log("## ACTION:CREATE_ORDER", response);

            if (response.status === 200) {
                dispatch({ type: CREATE_ORDER_SUCCESS, payload: response.data.data });
                console.log("## ACTION:CREATE_ORDER_SUCCESS", response.data.data);
            } else {
                console.log("## ACTION:CREATE_ORDER_FAILURE", response.message);
                dispatch({ type: CREATE_ORDER_FAILURE, payload: response.message });
            }
            return response;
        } catch (error: any) {
            dispatch({ type: CREATE_ORDER_FAILURE, payload: error.message });
        }
    }
};



interface OrderState {
    loading: boolean;
    order: OrderData | null;
    error: string | null;
}

const initialState: OrderState = {
    loading: false,
    order: null,
    error: null,
};

const orderReducer = (state = initialState, action: OrderActionTypes): OrderState => {
    switch (action.type) {
        case CREATE_ORDER_REQUEST:
            return { ...state, loading: true, error: null };
        case CREATE_ORDER_SUCCESS:
            console.log("## REDUCER:CREATE_ORDER_SUCCESS", action.payload);
            return { ...state, loading: false, order: action.payload, error: null };
        case CREATE_ORDER_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};




export default orderReducer;