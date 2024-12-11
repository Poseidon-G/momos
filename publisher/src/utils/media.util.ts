import { MediaType } from "../shared/types";

const generateUniqueFileName = function (url: string, type: MediaType): string {
    const hash = require('crypto').createHash('md5').update(url).digest('hex');
    const endFix =  `${Date.now()}-${hash}`;
    return type === MediaType.IMAGE ? `image-${endFix}` : `video-${endFix}`;
};

export { generateUniqueFileName, MediaType };