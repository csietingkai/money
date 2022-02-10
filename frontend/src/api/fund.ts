import axios from 'axios';

import { FUND_GET_ALL_PATH, FUND_GET_RECORDS_PATH, FUND_GET_TRACKING_LIST_PATH, FUND_REFRESH_PATH, FUND_TRACK_PATH, FUND_UNTRACK_PATH, USER_FUND_BUY_PATH, USER_FUND_GET_OWN_PATH, USER_FUND_SELL_PATH } from 'api/Constant';

import { toDate } from 'util/AppUtil';
import { ApiResponse, SimpleResponse } from 'util/Interface';
import { DealType } from 'util/Enum';

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
    type: DealType;
    date: Date;
    share: number;
    price: number;
    fee: number;
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
export interface FundTrackingListResponse extends ApiResponse<UserTrackingFundVo[]> { }

const REFRESH_FUND_MAX_TIME = 30 * 60 * 1000; // 30 mins

const getAll = async (code?: string, name?: string, sort: boolean = true): Promise<FundListResponse> => {
    const response = await axios.get(FUND_GET_ALL_PATH, { params: { code, name, sort } });
    const data: FundListResponse = response.data;
    if (data.success) {
        data.data = data.data.map(x => ({ ...x, offeringDate: toDate(x.offeringDate), updateTime: toDate(x.updateTime, toDate(x.offeringDate)) }));
    }
    return data;
};

const getRecords = async (code: string, start: Date, end: Date): Promise<FundRecordListResponse> => {
    const response = await axios.get(FUND_GET_RECORDS_PATH, { params: { code, start: start.getTime(), end: end.getTime() } });
    const data: FundRecordListResponse = response.data;
    if (data.success) {
        data.data = data.data.map(x => ({ ...x, date: toDate(x.date) }));
    }
    return data;
};

const refresh = async (code: string): Promise<SimpleResponse> => {
    const response = await axios.post(FUND_REFRESH_PATH, null, { params: { code }, timeout: REFRESH_FUND_MAX_TIME });
    const data: SimpleResponse = response.data;
    return data;
};

const buy = async (username: string, accountId: string, fundCode: string, date: Date, share: number, price: number, rate: number, payment: number, fee: number): Promise<UserFundResponse> => {
    const response = await axios.put(USER_FUND_BUY_PATH, null, { params: { username, accountId, fundCode, date: date.getTime(), share, price, rate, payment, fee } });
    const data: UserFundResponse = response.data;
    return data;
};

const sell = async (username: string, accountId: string, fundCode: string, date: Date, share: number, price: number, rate: number, priceFix: number): Promise<UserFundResponse> => {
    const response = await axios.put(USER_FUND_SELL_PATH, null, { params: { username, accountId, fundCode, date: date.getTime(), share, price, rate, priceFix } });
    const data: UserFundResponse = response.data;
    return data;
};

const getOwn = async (username: string): Promise<UserFundListResponse> => {
    const response = await axios.get(USER_FUND_GET_OWN_PATH, { params: { username } });
    const data: UserFundListResponse = response.data;
    return data;
};

const getTrackingList = async (username: string): Promise<FundTrackingListResponse> => {
    const response = await axios.get(FUND_GET_TRACKING_LIST_PATH, { params: { username } });
    const data: FundTrackingListResponse = response.data;
    return data;
};

const track = async (username: string, code: string): Promise<SimpleResponse> => {
    const response = await axios.post(FUND_TRACK_PATH, null, { params: { username, code } });
    const data: SimpleResponse = response.data;
    return data;
};

const untrack = async (username: string, code: string): Promise<SimpleResponse> => {
    const response = await axios.post(FUND_UNTRACK_PATH, null, { params: { username, code } });
    const data: SimpleResponse = response.data;
    return data;
};

export default { getAll, getRecords, buy, sell, getOwn, refresh, getTrackingList, track, untrack };
