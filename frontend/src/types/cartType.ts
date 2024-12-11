import { Category } from "./productType";

export interface CartItem {
    name: string;
    img: string;
    id: string;
    price: number;
    quantity: number;
    category: Category;
}