import axios from 'axios';
import { FINANCIAL_FILE_DOWNLOAD_PATH, FINANCIAL_FILE_LIST_PATH, FINANCIAL_FILE_REMOVE_PATH, FINANCIAL_FILE_UPDATE_PATH, FINANCIAL_FILE_UPLOAD_PATH } from './Constant';
import * as AppUtil from '../util/AppUtil';
import { ApiResponse, SimpleResponse } from '../util/Interface';

export interface FileUploadResponse extends ApiResponse<void> { }

export interface FinancialFile {
    id: string;
    ownerName: string;
    filename: string;
    type: string;
    date: Date;
}

export interface FinancialFileResponse extends ApiResponse<FinancialFile> { }
export interface FinancialFileListResponse extends ApiResponse<FinancialFile[]> { }

const list = async (userId: string, date?: Date, type?: string): Promise<FinancialFileListResponse> => {
    const response = await axios.get(FINANCIAL_FILE_LIST_PATH, { params: { userId, type, date: AppUtil.toDateStr(date) } });
    const data: FinancialFileListResponse = response.data;
    data.data = data.data?.map(x => {
        x.date = new Date(x.date);
        return x;
    });
    return data;
};

const upload = async (file: any, date: Date, type: string): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(FINANCIAL_FILE_UPLOAD_PATH, formData, { headers: { 'content-type': 'multipart/form-data' }, params: { type, date: AppUtil.toDateStr(date) } });
    const data: FileUploadResponse = response.data;
    return data;
};

const update = async (id: string, type: string, date: Date): Promise<FileUploadResponse> => {
    const response = await axios.post(FINANCIAL_FILE_UPDATE_PATH, null, { params: { id, type, date: AppUtil.toDateStr(date) } });
    const data: FileUploadResponse = response.data;
    return data;
};

const download = async (fileId: string) => {
    const response = await axios.get(FINANCIAL_FILE_DOWNLOAD_PATH, { params: { fileId }, responseType: 'blob' });
    if (response.headers['content-type'] === 'application/json') {
        const errorResp: ApiResponse<void> = JSON.parse(await response.data.text());
        const { message } = errorResp;
        return [message, null];
    }
    const filename = decodeURI(response.headers['content-disposition'].split(' ')[1].replace('filename=', ''));
    const data = response.data;
    return [filename, data];
};

const remove = async (id: string): Promise<SimpleResponse> => {
    const response = await axios.delete(FINANCIAL_FILE_REMOVE_PATH, { params: { id } });
    const data: SimpleResponse = response.data;
    return data;
};

export default { list, upload, update, download, remove };
