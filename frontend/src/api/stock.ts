import axios from 'axios';

import { API_URL, STOCK_GET_PATH, STOCK_GET_RECORDS_PATH, STOCK_REFRESH_PATH } from 'api/Constant';

import { toDate } from 'util/AppUtil';
import { ApiResponse } from 'util/Interface';

export interface Stock {
    id: string;
    code: string;
    dealDate: Date;
    dealShare: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
}

export interface StockRecord {
    id: string;
    code: string;
    dealDate: Date;
    dealShare: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice: number;
}

export interface StockRecordListResponse extends ApiResponse<Stock[]> { }

const REFRESH_STOCK_MAX_TIME = 30 * 60 * 1000; // 30 mins

const get = async (code: string) => {
    const response = await axios.get(STOCK_GET_PATH, { params: { code } });
    let data: any[];
    if (response.data) {
        data = response.data.data;
        data = data.map(x => ({ ...x, dealDate: toDate(x.dealDate) }));
    }
    return data;
};

const refresh = async (code: string) => {
    const response = await axios.post(STOCK_REFRESH_PATH, null, { params: { code }, timeout: REFRESH_STOCK_MAX_TIME });
    return response.data;
};

export default { get, refresh };
