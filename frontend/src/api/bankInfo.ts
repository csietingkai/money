import axios from 'axios';
import { BANK_INFO_GET_ALL_PATH } from './Constant';
import { ApiResponse } from '../util/Interface';

export interface BankInfo {
    code: string;
    name: string;
}

export interface BankInfoListResponse extends ApiResponse<BankInfo[]> { }

const getAll = async (): Promise<BankInfoListResponse> => {
    const response = await axios.get(BANK_INFO_GET_ALL_PATH);
    const data: BankInfoListResponse = response.data;
    return data;
};

export default { getAll };
