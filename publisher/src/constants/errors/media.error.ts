import { CustomErrorInterface } from "../../interfaces/custom-error.interface";

const MediaNotFoundError: CustomErrorInterface = {
    errorCode: "E0401",
    statusCode: 404,
    message: "Media not found",
    locale: {
        en: 'Media not found',
        vi: 'Không tìm thấy media'
      }
};

export default {
    MediaNotFoundError
}
        