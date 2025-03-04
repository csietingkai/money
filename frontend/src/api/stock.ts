import axios from 'axios';
import {
    STOCK_GET_ALL_PATH, STOCK_GET_RECORDS_PATH, STOCK_GET_TRACKING_LIST_PATH, STOCK_PREDICT_PATH, STOCK_REFRESH_PATH, STOCK_TRACK_PATH,
    STOCK_UNTRACK_PATH, USER_STOCK_BONUS_PATH, USER_STOCK_BUY_PATH, USER_STOCK_DELETE_PATH, USER_STOCK_GET_OWN_PATH, USER_STOCK_GET_OWN_RECORDS_PATH, USER_STOCK_PRECALC_PATH, USER_STOCK_SELL_PATH,
    USER_STOCK_UPDATE_PATH
} from './Constant';
import * as AppUtil from '../util/AppUtil';
import { ApiResponse, PredictResponse, SimpleResponse } from '../util/Interface';

export interface Stock {
    id: string;
    code: string;
    name: string;
    isinCode: string;
    currency: string;
    offeringDate: Date;
    marketType: string;
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
    priceDate: Date;
    cost: number;
}

export interface UserStockRecord {
    id: string;
    userStockId: string;
    accountId: string;
    type: string;
    date: Date;
    share: number;
    price: number;
    fee: number;
    tax: number;
    total: number;
    accountRecordId: string;
}

export interface UserStockRecordVo extends UserStockRecord {
    fileId: string;
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
export interface UserStockRecordResponse extends ApiResponse<UserStockRecordVo> { }
export interface UserStockRecordListResponse extends ApiResponse<UserStockRecordVo[]> { }
export interface StockTrackingListResponse extends ApiResponse<UserTrackingStockVo[]> { }

const REFRESH_STOCK_MAX_TIME = 30 * 60 * 1000; // 30 mins

const getAll = async (code?: string, name?: string, sort: boolean = true): Promise<StockListResponse> => {
    const response = await axios.get(STOCK_GET_ALL_PATH, { params: { code, name, sort } });
    const data: StockListResponse = response.data;
    if (data.success) {
        data.data = data.data?.map(x => {
            x.offeringDate = new Date(x.offeringDate);
            x.updateTime = AppUtil.toDate(x.updateTime) || x.offeringDate;
            return x;
        });
    }
    return data;
};

const getRecords = async (code: string): Promise<StockRecordListResponse> => {
    const response = await axios.get(STOCK_GET_RECORDS_PATH, { params: { code } });
    const data: StockRecordListResponse = response.data;
    if (data.success) {
        data.data = data.data?.map(x => {
            x.dealDate = new Date(x.dealDate);
            return x;
        });
    }
    return data;
};

const refresh = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(STOCK_REFRESH_PATH, null, { params: { code }, timeout: REFRESH_STOCK_MAX_TIME });
    const data: SimpleResponse = response.data;
    return data;
};

const precalc = async (dealType: 'BUY' | 'SELL', share: number, price: number): Promise<UserStockRecordResponse> => {
    const response = await axios.get(USER_STOCK_PRECALC_PATH, { params: { dealType, share, price } });
    const data: UserStockRecordResponse = response.data;
    return data;
};

const buy = async (accountId: string, stockCode: string, date: Date, share: number, price: number, fee: number, total: number, fileId: string): Promise<UserStockResponse> => {
    const response = await axios.put(USER_STOCK_BUY_PATH, { accountId, stockCode, date: AppUtil.toDateTimeStr(date), share, price, fee, total, fileId });
    const data: UserStockResponse = response.data;
    return data;
};

const sell = async (accountId: string, stockCode: string, date: Date, share: number, price: number, fee: number, tax: number, total: number, fileId: string): Promise<UserStockResponse> => {
    const response = await axios.put(USER_STOCK_SELL_PATH, { accountId, stockCode, date: AppUtil.toDateTimeStr(date), share, price, fee, tax, total, fileId });
    const data: UserStockResponse = response.data;
    return data;
};

const bonus = async (accountId: string, stockCode: string, date: Date, share: number, price: number, fee: number, total: number, fileId: string): Promise<UserStockResponse> => {
    const response = await axios.put(USER_STOCK_BONUS_PATH, { accountId, stockCode, date: AppUtil.toDateTimeStr(date), share, price, fee, total, fileId });
    const data: UserStockResponse = response.data;
    return data;
};

const updateRecord = async (recordId: string, accountId: string, stockCode: string, date: Date, share: number, price: number, fee: number, total: number, accountRecordId: string, tax?: number, fileId?: string): Promise<UserStockResponse> => {
    const response = await axios.put(USER_STOCK_UPDATE_PATH, { recordId, accountId, stockCode, date: AppUtil.toDateTimeStr(date), share, price, fee, tax, total, fileId, accountRecordId });
    const data: UserStockResponse = response.data;
    return data;
};

const deleteRecord = async (recordId: string): Promise<SimpleResponse> => {
    const response = await axios.delete(USER_STOCK_DELETE_PATH, { params: { recordId } });
    const data: SimpleResponse = response.data;
    return data;
};

const getOwn = async (): Promise<UserStockListResponse> => {
    const response = await axios.get(USER_STOCK_GET_OWN_PATH);
    const data: UserStockListResponse = response.data;
    return data;
};

const getOwnRecords = async (userStockId: string): Promise<UserStockRecordListResponse> => {
    const response = await axios.get(USER_STOCK_GET_OWN_RECORDS_PATH, { params: { userStockId } });
    const data: UserStockRecordListResponse = response.data;
    data.data = data.data?.map(x => {
        x.date = new Date(x.date);
        return x;
    });
    return data;
};

const getTrackingList = async (): Promise<StockTrackingListResponse> => {
    const response = await axios.get(STOCK_GET_TRACKING_LIST_PATH, {});
    const data: StockTrackingListResponse = response.data;
    return data;
};

const track = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(STOCK_TRACK_PATH, null, { params: { code } });
    const data: SimpleResponse = response.data;
    return data;
};

const untrack = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(STOCK_UNTRACK_PATH, null, { params: { code } });
    const data: SimpleResponse = response.data;
    return data;
};

const predict = async (code: string, days?: number): Promise<PredictResponse> => {
    const response = await axios.get(STOCK_PREDICT_PATH, { params: { code, days } });
    const data: PredictResponse = response.data;
    return data;
};

export default { getAll, getRecords, refresh, precalc, buy, sell, bonus, updateRecord, deleteRecord, getOwn, getOwnRecords, getTrackingList, track, untrack, predict };
