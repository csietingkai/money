import axios from 'axios';

import { EXCHANGE_RATE_GET_ALL_PATH, EXCHANGE_RATE_GET_RECORDS_PATH, EXCHANGE_RATE_REFRESH_PATH } from 'api/Constant';

import { toDate } from 'util/AppUtil';
import { ApiResponse, SimpleResponse } from 'util/Interface';

export interface ExchangeRate {
    currency: string;
    name: string;
}

export interface ExchangeRateRecord {
    id: string;
    currency: string;
    date: Date;
    cashBuy: number;
    cashSell: number;
    spotBuy: number;
    spotSell: number;
}

export interface ExchangeRateRecordVo extends ExchangeRateRecord {
    ma5: number;
    ma10: number;
    ma20: number;
    ma40: number;
    ma60: number;
    bbup: number;
    bbdown: number;
}

export interface ExchangeRateListResponse extends ApiResponse<ExchangeRate[]> { }
export interface ExchangeRateRecordListResponse extends ApiResponse<ExchangeRateRecordVo[]> { }

const getAll = async (): Promise<ExchangeRateListResponse> => {
    const response = await axios.get(EXCHANGE_RATE_GET_ALL_PATH);
    const data: ExchangeRateListResponse = response.data;
    return data;
};

const getRecords = async (currency: string, start: Date, end: Date): Promise<ExchangeRateRecordListResponse> => {
    const response = await axios.get(EXCHANGE_RATE_GET_RECORDS_PATH, { params: { currency, start: start.getTime(), end: end.getTime() } });
    const data: ExchangeRateRecordListResponse = response.data;
    if (data.success) {
        data.data = data.data.map(x => ({ ...x, date: toDate(x.date) }));
    }
    return data;
};

const refresh = async (currency: string): Promise<SimpleResponse> => {
    const response = await axios.post(EXCHANGE_RATE_REFRESH_PATH, null, { params: { currency } });
    const data: SimpleResponse = response.data;
    return data;
};

export default { getAll, getRecords, refresh };
