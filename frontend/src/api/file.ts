import axios from 'axios';

import { API_URL, FILE_DOWNLOAD_PATH, FILE_UPLOAD_PATH } from 'api/Constant';

import { getAuthHeader } from 'util/AppUtil';
import { ApiResponse } from 'util/Interface';

export interface FileUploadResponse extends ApiResponse<void> { }

const upload = async (file: any, category?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(FILE_UPLOAD_PATH, formData, { headers: { 'content-type': 'multipart/form-data' }, params: { category } });
    const data: FileUploadResponse = response.data;
    return data;
};

const download = async (filename: string) => {
    const response = await axios.get(FILE_DOWNLOAD_PATH, { params: { filename }, responseType: 'blob' });
    const data = response.data;
    return data;
};

/** for image show on page */
const image = async (filename: string) => {
    const response = await axios.get(FILE_DOWNLOAD_PATH, { params: { filename }, responseType: 'arraybuffer' });
    const base64 = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''),
    );
    return base64;
};

export default { upload, download, image };
