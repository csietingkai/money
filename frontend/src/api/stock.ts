import axios from 'axios';

import { API_URL, STOCK_GET_PATH, STOCK_GET_RECORDS_PATH, STOCK_REFRESH_PATH } from 'api/Constant';

import { toDate } from 'util/AppUtil';
import { ApiResponse, SimpleResponse } from 'util/Interface';

export enum MarketType {
    LSE = 'LSE',
    OTC = 'OTC',
    LES = 'LES'
}

export interface Stock {
    id: string;
    code: string;
    name: string;
    isinCode: string;
    offeringDate: Date;
    marketType: MarketType;
    industryType: string;
    cfiCode: string;
    description: string;
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

export interface StockResponse extends ApiResponse<Stock> { }
export interface StockListResponse extends ApiResponse<Stock[]> { }
export interface StockRecordResponse extends ApiResponse<StockRecord> { }
export interface StockRecordListResponse extends ApiResponse<StockRecord[]> { }

const REFRESH_STOCK_MAX_TIME = 30 * 60 * 1000; // 30 mins

const get = async (code: string) => {
    const response = await axios.get(STOCK_GET_PATH, { params: { code } });
    const data: StockResponse = response.data;
    return data;
};

const getRecords = async (code: string, start: Date, end: Date) => {
    const response = await axios.get(STOCK_GET_RECORDS_PATH, { params: { code, start: start.getTime(), end: end.getTime() } });
    const data: StockRecordListResponse = response.data;
    if (data.success) {
        data.data = data.data.map(x => ({ ...x, dealDate: toDate(x.dealDate) }));
    }
    return data;
};

const refresh = async (code: string) => {
    const response = await axios.post(STOCK_REFRESH_PATH, null, { params: { code }, timeout: REFRESH_STOCK_MAX_TIME });
    const data: SimpleResponse = response.data;
    return data;
};
export default { get, getRecords, refresh };
