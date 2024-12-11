import axios from 'axios';
import fs from 'fs';
import path from 'path';

const downloadImage = async (url: string, filepath: string) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    console.log(`Downloading image from ${url} to ${filepath}`);
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        (response.data as NodeJS.ReadableStream).pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

const downloadVideo = async (url: string, filepath: string) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    console.log(`Downloading video from ${url} to ${filepath}`);
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        (response.data as NodeJS.ReadableStream).pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

const getVideoExtension = async (url: string): Promise<string> => {
    try {
        // First try to get extension from URL
        const urlExtension = path.extname(new URL(url).pathname).toLowerCase();
        if (urlExtension && ['.mp4', '.webm', '.ogg', '.mov', '.avi'].includes(urlExtension)) {
            return urlExtension;
        }

        // If no extension in URL, check content-type
        const response = await axios.head(url);
        const contentType = response.headers['content-type'];
        const extensionMap: Record<string, string> = {
            'video/mp4': '.mp4',
            'video/webm': '.webm',
            'video/ogg': '.ogg',
            'video/quicktime': '.mov',
            'video/x-msvideo': '.avi'
        };

        return extensionMap[contentType] || '.mp4'; // Default to mp4 if unknown
    } catch (error) {
        console.warn(`Failed to detect file type for ${url}, using default .mp4`);
        return '.mp4';
    }
}

const getImageExtension = async (url: string): Promise<string> => {
    try {
      // First try to get extension from URL
      const urlExtension = path.extname(new URL(url).pathname).toLowerCase();
      if (urlExtension && ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(urlExtension)) {
        return urlExtension;
      }

      // If no extension in URL, check content-type
      const response = await axios.head(url);
      const contentType = response.headers['content-type'];
      const extensionMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp'
      };
      
      return extensionMap[contentType] || '.jpg'; // Default to jpg if unknown
    } catch (error) {
      console.warn(`Failed to detect file type for ${url}, using default .jpg`);
      return '.jpg';
    }
  };


export { downloadImage, downloadVideo,  getImageExtension, getVideoExtension };