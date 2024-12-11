import axiosInstance from "../configs/axiosDefault";
import { OrderBody } from "../types";


export const createOrderApi = async (token: string, body: OrderBody) => {
    try {
        const res = await axiosInstance.post("/api/shop/order/create", body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return res.data;
    } catch (error) {
        throw error;
    }
}

export const getOrderHistoryApi = async(token: string) => {
    try {
        const res = await axiosInstance.get("/api/shop/orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return res.data;
    } catch (error) {
        throw error;
    }
}