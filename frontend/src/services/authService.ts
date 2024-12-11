import axiosInstance from "../configs/axiosDefault";
import { RegisterUserBody } from "../types";


export const loginApi = async (email: string, password: string) => {
  try {
    const res = await axiosInstance.post("/api/v1/auth/login", {
      userName: email,
      password
    });
    
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const verifyCodeApi = async (email: string, code: string) => {
  try {
    const res = await axiosInstance.post("/api/v1/auth/verify", {
      userName: email,
      code
    });
    
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const registerUserApi = async (body: RegisterUserBody) => {
  try {
      const res = await axiosInstance.post("/api/v1/auth/register", body);

      return res.data;
  } catch (error) {
      throw error;
  }
}
