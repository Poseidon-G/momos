import axiosInstance from "../configs/axiosDefault";

export const fetchPackagesApi = async (token: string) => {
    try {
        const res = await axiosInstance.get("/api/v1/packages", {
            headers: {
                Authorization: `${token}`
            }
        });
        
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const fetchPackageDetailsApi = async (token: string, id: number) => {
    try {
        const res = await axiosInstance.get(`/api/v1/packages/${id}`, {
            headers: {
                Authorization: `${token}`
            }
        });

        return res.data;
    } catch (error) {
        throw error;
    }
}


export const fetchPackageMediasApi = async (token: string, id: number, page: number, rowsPerPage: number) => {
    try {
        const res = await axiosInstance.get(`/api/v1/packages/${id}/medias?page=${page}&size=${rowsPerPage}`, {
            headers: {
                Authorization: `${token}`
            }
        });

        return res.data;
    } catch (error) {
        throw error;
    }
}

export interface MediaResponse {
    id: number;
    originalUrl: string;
    filename: string;
    mediaType: MediaType;
    newUrl?: string;
    status: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    metadata: {
        total: number;
        currentPage: number;
        pageSize: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export enum MediaType {
    IMAGE = "image",
    VIDEO = "video"
}

export interface Media {
    url: string;
    filename: string;
    mediaType: MediaType;
}
export interface Package {
    title: string;
    description: string;
    media: Media[];
}

export const createPackageApi = async (token: string, body: Package) => {
    try {
        const res = await axiosInstance.post("/api/v1/packages", body, {
            headers: {
                "Authorization": `${token}`
            },
        });
    
        return res.data;    
    } catch (error) {
        throw error;
    }
}