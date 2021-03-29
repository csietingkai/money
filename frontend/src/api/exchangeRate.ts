import axios from 'axios';

import { API_URL, EXCHANGE_RATE_GET_ALL_PATH } from 'api/Constant';

import { getAuthHeader } from 'util/AppUtil';
import { ApiResponse } from 'util/Interface';

export interface ExchangeRate {
    currency: string;
    name: string;
}

export interface ExchangeRateListResponse extends ApiResponse<ExchangeRate[]> { }

const getAll = async () => {
    const response = await axios.get(EXCHANGE_RATE_GET_ALL_PATH);
    const data: ExchangeRateListResponse = response.data;
    return data;
};

export default { getAll };
