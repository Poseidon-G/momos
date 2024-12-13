import { MediaType } from "../shared/types";


const determineMediaType = function (url: string): MediaType {

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'flv'];

    const urlParts = url.split('.');
    const extension = urlParts[urlParts.length - 1];

    if (imageExtensions.includes(extension)) {
        return MediaType.IMAGE;
    } else if (videoExtensions.includes(extension)) {
        return MediaType.VIDEO;
    }

    return MediaType.IMAGE;
}

const generateUniqueFileName = function (url: string, type: MediaType): string {
    const hash = require('crypto').createHash('md5').update(url).digest('hex');
    const endFix =  `${Date.now()}-${hash}`;
    return type === MediaType.IMAGE ? `image-${endFix}` : `video-${endFix}`;
};

export { generateUniqueFileName, determineMediaType, MediaType };