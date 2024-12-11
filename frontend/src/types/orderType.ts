// types.ts
export const CREATE_ORDER_REQUEST = 'CREATE_ORDER_REQUEST';
export const CREATE_ORDER_SUCCESS = 'CREATE_ORDER_SUCCESS';
export const CREATE_ORDER_FAILURE = 'CREATE_ORDER_FAILURE';

export interface OrderBody {
    productId: string;
    quantity: number;
}


export interface PaymentOrder {
    amount: number;
    received: number;
}

export interface ProductOrder {
    name: string;
    regular_price: number;
    sale_price: number;
}

export interface OrderData {
    payment: PaymentOrder;
    product: ProductOrder;
    orderNumber: string;
    sku: string;
    status: string;
    category: string;
    customer: string;
    created: string;
    updated: string;
}

export interface OrderResponse {
    status: number;
    message: string;
    data: OrderData;
}

interface CreateOrderRequestAction {
    type: typeof CREATE_ORDER_REQUEST;
}

interface CreateOrderSuccessAction {
    type: typeof CREATE_ORDER_SUCCESS;
    payload: OrderData;
}

interface CreateOrderFailureAction {
    type: typeof CREATE_ORDER_FAILURE;
    payload: string;
}

export type OrderActionTypes =
    | CreateOrderRequestAction
    | CreateOrderSuccessAction
    | CreateOrderFailureAction;


interface Category {
    name: string;
    img: string;
    code: string;
    categoryId: string;
}

interface Payment {
    amount: number;
    received: number;
}

interface Product {
    name: string;
    regular_price: number;
    sale_price: number;
}

export interface Order {
    orderNumber: string;
    sku: string;
    status: string;
    category: Category;
    payment: Payment;
    product: Product;
    customer: string;
    created: string;
    updated: string;
}
