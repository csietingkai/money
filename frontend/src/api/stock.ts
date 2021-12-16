import axios from 'axios';

import { STOCK_GET_ALL_PATH, STOCK_GET_RECORDS_PATH, STOCK_GET_TRACKING_LIST_PATH, STOCK_REFRESH_PATH, STOCK_TRACK_PATH, STOCK_UNTRACK_PATH, USER_STOCK_BUY_PATH, USER_STOCK_GET_OWN_PATH, USER_STOCK_PRECALC_PATH, USER_STOCK_SELL_PATH } from 'api/Constant';

import { toDate } from 'util/AppUtil';
import { DealType } from 'util/Enum';
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

export interface StockVo extends Stock {
    updateTime: Date;
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

export interface StockRecordVo extends StockRecord {
    ma5: number;
    ma10: number;
    ma20: number;
    ma40: number;
    ma60: number;
    bbup: number;
    bbdown: number;
}

export interface UserStock {
    id: string;
    userName: string;
    stockCode: string;
    amount: number;
}

export interface UserStockVo extends UserStock {
    stockName: string;
    price: number;
}

export interface UserStockRecord {
    id: string;
    userStockId: string;
    accountId: string;
    type: DealType;
    date: Date;
    share: number;
    price: number;
    fee: number;
    tax: number;
}

export interface UserTrackingStock {
    id: string;
    userName: string;
    stockCode: string;
}

export interface UserTrackingStockVo extends UserTrackingStock {
    stockName: string;
    record: StockRecord;
    amplitude: number;
}

export interface StockResponse extends ApiResponse<StockVo> { }
export interface StockListResponse extends ApiResponse<StockVo[]> { }
export interface StockRecordResponse extends ApiResponse<StockRecordVo> { }
export interface StockRecordListResponse extends ApiResponse<StockRecordVo[]> { }
export interface UserStockResponse extends ApiResponse<UserStockVo> { }
export interface UserStockListResponse extends ApiResponse<UserStockVo[]> { }
export interface UserStockRecordResponse extends ApiResponse<UserStockRecord> { }
export interface StockTrackingListResponse extends ApiResponse<UserTrackingStockVo[]> { }

const REFRESH_STOCK_MAX_TIME = 30 * 60 * 1000; // 30 mins

const getAll = async (code?: string, name?: string, sort: boolean = true): Promise<StockListResponse> => {
    const response = await axios.get(STOCK_GET_ALL_PATH, { params: { code, name, sort } });
    const data: StockListResponse = response.data;
    if (data.success) {
        data.data = data.data.map(x => ({ ...x, offeringDate: toDate(x.offeringDate), updateTime: toDate(x.updateTime, toDate(x.offeringDate)) }));
    }
    return data;
};

const getRecords = async (code: string, start: Date, end: Date): Promise<StockRecordListResponse> => {
    const response = await axios.get(STOCK_GET_RECORDS_PATH, { params: { code, start: start.getTime(), end: end.getTime() } });
    const data: StockRecordListResponse = response.data;
    if (data.success) {
        data.data = data.data.map(x => ({ ...x, dealDate: toDate(x.dealDate) }));
    }
    return data;
};

const refresh = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(STOCK_REFRESH_PATH, null, { params: { code }, timeout: REFRESH_STOCK_MAX_TIME });
    const data: SimpleResponse = response.data;
    return data;
};

const precalc = async (dealType: DealType, share: number, price: number): Promise<UserStockRecordResponse> => {
    const response = await axios.get(USER_STOCK_PRECALC_PATH, { params: { dealType, share, price } });
    const data: UserStockRecordResponse = response.data;
    return data;
};

const buy = async (username: string, accountId: string, stockCode: string, date: Date, share: number, price: number, fix: number, fee: number): Promise<UserStockResponse> => {
    const response = await axios.put(USER_STOCK_BUY_PATH, null, { params: { username, accountId, stockCode, date: date.getTime(), share, price, fix, fee } });
    const data: UserStockResponse = response.data;
    return data;
};

const sell = async (username: string, accountId: string, stockCode: string, date: Date, share: number, price: number, fix: number, fee: number, tax: number): Promise<UserStockResponse> => {
    const response = await axios.put(USER_STOCK_SELL_PATH, null, { params: { username, accountId, stockCode, date: date.getTime(), share, price, fix, fee, tax } });
    const data: UserStockResponse = response.data;
    return data;
};

const getOwn = async (username: string): Promise<UserStockListResponse> => {
    const response = await axios.get(USER_STOCK_GET_OWN_PATH, { params: { username } });
    const data: UserStockListResponse = response.data;
    return data;
};

const getTrackingList = async (username: string): Promise<StockTrackingListResponse> => {
    const response = await axios.get(STOCK_GET_TRACKING_LIST_PATH, { params: { username } });
    const data: StockTrackingListResponse = response.data;
    return data;
};

const track = async (username: string, code: string): Promise<SimpleResponse> => {
    const response = await axios.post(STOCK_TRACK_PATH, null, { params: { username, code } });
    const data: SimpleResponse = response.data;
    return data;
};

const untrack = async (username: string, code: string): Promise<SimpleResponse> => {
    const response = await axios.post(STOCK_UNTRACK_PATH, null, { params: { username, code } });
    const data: SimpleResponse = response.data;
    return data;
};

export default { getAll, getRecords, refresh, precalc, buy, sell, getOwn, getTrackingList, track, untrack };
