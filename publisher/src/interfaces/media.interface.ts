import { MediaType, MediaStatus } from "../shared/types";

export interface IMedia {
    id: number;
    originalUrl: string;
    filename?: string;
    newUrl?: string;
    mediaType: MediaType;
    status: MediaStatus;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
  }