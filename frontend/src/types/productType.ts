export interface Category {
    name: string;
    img: string;
    code: string;
    categoryId: string;
}

export interface Product {
    id: string;
    name: string;
    img: string;
    category: Category;
    in_stock: number;
    sold: number;
    regular_price: number;
    sale_price: number;
    rating: number;
}

export interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
}

export const FETCH_PRODUCTS_REQUEST = 'FETCH_PRODUCTS_REQUEST';
export const FETCH_PRODUCTS_SUCCESS = 'FETCH_PRODUCTS_SUCCESS';
export const FETCH_PRODUCTS_FAILURE = 'FETCH_PRODUCTS_FAILURE';

interface FetchProductsRequestAction {
    type: typeof FETCH_PRODUCTS_REQUEST;
}

interface FetchProductsSuccessAction {
    type: typeof FETCH_PRODUCTS_SUCCESS;
    payload: Product[];
}

interface FetchProductsFailureAction {
    type: typeof FETCH_PRODUCTS_FAILURE;
    payload: string;
}

export type ProductActionTypes =
    | FetchProductsRequestAction
    | FetchProductsSuccessAction
    | FetchProductsFailureAction;
