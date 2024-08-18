import axios from 'axios';

import {
    FUND_GET_ALL_PATH, FUND_GET_RECORDS_PATH, FUND_GET_TRACKING_LIST_PATH, FUND_PREDICT_PATH, FUND_REFRESH_PATH, FUND_TRACK_PATH,
    FUND_UNTRACK_PATH, USER_FUND_BOUNS_PATH, USER_FUND_BUY_PATH, USER_FUND_DELETE_PATH, USER_FUND_GET_OWN_PATH, USER_FUND_GET_OWN_RECORDS_PATH, USER_FUND_SELL_PATH
} from './Constant';

import * as AppUtil from '../util/AppUtil';
import { ApiResponse, PredictResponse, SimpleResponse } from '../util/Interface';

export interface Fund {
    id: string;
    code: string;
    name: string;
    isinCode: string;
    offeringDate: Date;
    currency: string;
    description: string;
}

export interface FundVo extends Fund {
    updateTime: Date;
}

export interface FundRecord {
    id: string;
    code: string;
    date: Date;
    price: number;
}

export interface FundRecordVo extends FundRecord {
    ma5: number;
    ma10: number;
    ma20: number;
    ma40: number;
    ma60: number;
    bbup: number;
    bbdown: number;
}

export interface UserFund {
    id: string;
    userName: string;
    fundCode: string;
    amount: number;
}

export interface UserFundVo extends UserFund {
    fundName: string;
    price: number;
    priceDate: Date;
    cost: number;
}

export interface UserFundRecord {
    id: string;
    userFundId: string;
    accountId: string;
    type: string;
    date: Date;
    share: number;
    price: number;
    fee: number;
    total: number;
}

export interface UserTrackingFund {
    id: string;
    userName: string;
    fundCode: string;
}

export interface UserTrackingFundVo extends UserTrackingFund {
    fundName: string;
    record: FundRecord;
    amplitude: number;
}

export interface FundResponse extends ApiResponse<FundVo> { }
export interface FundListResponse extends ApiResponse<FundVo[]> { }
export interface FundRecordResponse extends ApiResponse<FundRecordVo> { }
export interface FundRecordListResponse extends ApiResponse<FundRecordVo[]> { }
export interface UserFundResponse extends ApiResponse<UserFundVo> { }
export interface UserFundListResponse extends ApiResponse<UserFundVo[]> { }
export interface UserFundRecordResponse extends ApiResponse<UserFundRecord> { }
export interface UserFundRecordListResponse extends ApiResponse<UserFundRecord[]> { }
export interface FundTrackingListResponse extends ApiResponse<UserTrackingFundVo[]> { }

const REFRESH_FUND_MAX_TIME = 30 * 60 * 1000; // 30 mins

const getAll = async (code?: string, name?: string, sort: boolean = true): Promise<FundListResponse> => {
    const response = await axios.get(FUND_GET_ALL_PATH, { params: { code, name, sort } });
    const data: FundListResponse = response.data;
    if (data.success) {
        data.data = data.data?.map(x => {
            x.offeringDate = new Date(x.offeringDate);
            x.updateTime = AppUtil.toDate(x.updateTime) || x.offeringDate;
            return x;
        });
    }
    return data;
};

const getRecords = async (code: string, start: Date, end: Date): Promise<FundRecordListResponse> => {
    const response = await axios.get(FUND_GET_RECORDS_PATH, { params: { code, start: AppUtil.toDateStr(start), end: AppUtil.toDateStr(end) } });
    const data: FundRecordListResponse = response.data;
    if (data.success) {
        data.data = data.data?.map(x => {
            x.date = new Date(x.date);
            return x;
        });
    }
    return data;
};

const refresh = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(FUND_REFRESH_PATH, null, { params: { code }, timeout: REFRESH_FUND_MAX_TIME });
    const data: SimpleResponse = response.data;
    return data;
};

const buy = async (accountId: string, fundCode: string, date: Date, share: number, price: number, rate: number, payment: number, fee: number, fileId: string): Promise<UserFundResponse> => {
    const response = await axios.put(USER_FUND_BUY_PATH, { accountId, fundCode, date: AppUtil.toDateStr(date), share, price, rate, payment, fee, fileId });
    const data: UserFundResponse = response.data;
    return data;
};

const sell = async (accountId: string, fundCode: string, date: Date, share: number, price: number, rate: number, total: number, fileId: string): Promise<UserFundResponse> => {
    const response = await axios.put(USER_FUND_SELL_PATH, { accountId, fundCode, date: AppUtil.toDateStr(date), share, price, rate, total, fileId });
    const data: UserFundResponse = response.data;
    return data;
};

const bonus = async (accountId: string, fundCode: string, date: Date, share: number, price: number, rate: number, total: number, fileId: string): Promise<UserFundResponse> => {
    const response = await axios.put(USER_FUND_BOUNS_PATH, { accountId, fundCode, date: AppUtil.toDateStr(date), share, price, rate, total, fileId });
    const data: UserFundResponse = response.data;
    return data;
};

const deleteRecord = async (recordId: string): Promise<SimpleResponse> => {
    const response = await axios.delete(USER_FUND_DELETE_PATH, { params: { recordId } });
    const data: SimpleResponse = response.data;
    return data;
};

const getOwn = async (): Promise<UserFundListResponse> => {
    const response = await axios.get(USER_FUND_GET_OWN_PATH);
    const data: UserFundListResponse = response.data;
    return data;
};

const getOwnRecords = async (userFundId: string): Promise<UserFundRecordListResponse> => {
    const response = await axios.get(USER_FUND_GET_OWN_RECORDS_PATH, { params: { userFundId } });
    const data: UserFundRecordListResponse = response.data;
    data.data = data.data?.map(x => {
        x.date = new Date(x.date);
        return x;
    });
    return data;
};

const getTrackingList = async (): Promise<FundTrackingListResponse> => {
    const response = await axios.get(FUND_GET_TRACKING_LIST_PATH);
    const data: FundTrackingListResponse = response.data;
    return data;
};

const track = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(FUND_TRACK_PATH, null, { params: { code } });
    const data: SimpleResponse = response.data;
    return data;
};

const untrack = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(FUND_UNTRACK_PATH, null, { params: { code } });
    const data: SimpleResponse = response.data;
    return data;
};

const predict = async (code: string, days?: number): Promise<PredictResponse> => {
    const response = await axios.get(FUND_PREDICT_PATH, { params: { code, days } });
    const data: PredictResponse = response.data;
    return data;
};

export default { getAll, getRecords, buy, sell, bonus, deleteRecord, getOwn, getOwnRecords, refresh, getTrackingList, track, untrack, predict };
