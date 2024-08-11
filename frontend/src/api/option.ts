import axios from 'axios';

import { OPTION_GET_FILE_TYPES, OPTION_GET_RECORD_TYPES, OPTION_GET_STOCK_TYPES } from './Constant';

import { ApiResponse, Option } from '../util/Interface';

export interface OptionResponse extends ApiResponse<Option[]> { }

const getFileTypes = async (): Promise<OptionResponse> => {
    const response = await axios.get(OPTION_GET_FILE_TYPES);
    const data: OptionResponse = response.data;
    return data;
};

const getStockTypes = async (): Promise<OptionResponse> => {
    const response = await axios.get(OPTION_GET_STOCK_TYPES);
    const data: OptionResponse = response.data;
    return data;
};

const getRecordTypes = async (): Promise<OptionResponse> => {
    const response = await axios.get(OPTION_GET_RECORD_TYPES);
    const data: OptionResponse = response.data;
    return data;
};

export default { getFileTypes, getStockTypes, getRecordTypes };
