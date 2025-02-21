import axios from 'axios';
import {
    ACCOUNT_CREATE_PATH, ACCOUNT_INCOME_RECORD_PATH, ACCOUNT_DELETE_PATH, ACCOUNT_GET_ALL_PATH, ACCOUNT_GET_RECORDS_PATH,
    ACCOUNT_UPDATE_PATH, ACCOUNT_EXPEND_RECORD_PATH, ACCOUNT_TRANSFER_RECORD_PATH, ACCOUNT_MONTH_BALANCE_PATH,
    ACCOUNT_UPDATE_RECORD_PATH, ACCOUNT_DELETE_RECORD_PATH
} from './Constant';
import { ApiResponse, SimpleResponse } from '../util/Interface';
import * as AppUtil from '../util/AppUtil';

export interface Account {
    id: string;
    ownerName: string;
    currency: string;
    name: string;
    balance: number;
    bankCode?: string;
    bankNo?: string;
    shown: boolean;
}

export interface AccountRecord {
    id: string;
    transDate: Date;
    transAmount: number;
    transFrom: string;
    transTo: string;
    recordType: string;
    description: string | null;
	fileId?: string;
}

export interface AccountRecordVo extends AccountRecord {
    transFromName: string;
    transFromCurrency: string;
    transToName: string;
    transToCurrency: string;
    transCurrentExchangeRate: number;
    editable: boolean;
    removable: boolean;
}

export interface MonthBalanceVo {
    sums: BalanceSumVo[];
    details: BalanceDetailVo[];
}

export interface BalanceSumVo {
    year: number;
    month: number;
    income: number;
    expend: number;
    surplus: number;
}

export interface BalanceDetailVo {
    year: number;
    month: number;
    income: {[recordType: string]: number};
    expend: {[recordType: string]: number};
}

export interface AccountResponse extends ApiResponse<Account> { }
export interface AccountListResponse extends ApiResponse<Account[]> { }
export interface AccountRecordListResponse extends ApiResponse<AccountRecordVo[]> { }
export interface AccountMonthBalanceResponse extends ApiResponse<MonthBalanceVo> { }

const getAccounts = async (): Promise<AccountListResponse> => {
    const response = await axios.get(ACCOUNT_GET_ALL_PATH);
    const data: AccountListResponse = response.data;
    return data;
};

const createAccount = async (name: string, currency: string, bankCode?: string, bankNo?: string, shown: boolean = true): Promise<SimpleResponse> => {
    const response = await axios.post(ACCOUNT_CREATE_PATH, { name, currency, bankCode, bankNo, shown });
    const data: SimpleResponse = response.data;
    return data;
};

const updateAccount = async (id: string, name: string, bankCode?: string, bankNo?: string, shown: boolean = true): Promise<SimpleResponse> => {
    const response = await axios.put(ACCOUNT_UPDATE_PATH, { id, name, bankCode, bankNo, shown });
    const data: SimpleResponse = response.data;
    return data;
};

const deleteAccount = async (id: string): Promise<SimpleResponse> => {
    const response = await axios.delete(ACCOUNT_DELETE_PATH, { params: { id } });
    const data: SimpleResponse = response.data;
    return data;
};

const getRecords = async (accountId: string): Promise<AccountRecordListResponse> => {
    const response = await axios.get(ACCOUNT_GET_RECORDS_PATH, { params: { accountId } });
    const data: AccountRecordListResponse = response.data;
    data.data = data.data?.map(x => {
        x.transDate = new Date(x.transDate);
        return x;
    });
    return data;
};

const getMonthBalance = async (cnt: number): Promise<AccountMonthBalanceResponse> => {
    const response = await axios.get(ACCOUNT_MONTH_BALANCE_PATH, { params: { cnt } });
    const data: AccountMonthBalanceResponse = response.data;
    return data;
};

const income = async (accountId: string, date: Date, amount: number, type: string, description: string, fileId?: string): Promise<SimpleResponse> => {
    const response = await axios.post(ACCOUNT_INCOME_RECORD_PATH, { accountId, date: AppUtil.toDateStr(date), amount, type, description, fileId });
    const data: SimpleResponse = response.data;
    return data;
};

const transfer = async (fromId: string, toId: string, date: Date, amount: number, type: string, description: string, fileId?: string): Promise<SimpleResponse> => {
    const response = await axios.post(ACCOUNT_TRANSFER_RECORD_PATH, { fromId, toId, date: AppUtil.toDateStr(date), amount, type, description, fileId });
    const data: SimpleResponse = response.data;
    return data;
};

const expend = async (accountId: string, date: Date, amount: number, type: string, description: string, fileId?: string): Promise<SimpleResponse> => {
    const response = await axios.post(ACCOUNT_EXPEND_RECORD_PATH, { accountId, date: AppUtil.toDateStr(date), amount, type, description, fileId });
    const data: SimpleResponse = response.data;
    return data;
};

const updateRecord = async (recordId: string, date: Date, amount: number, type: string, description: string, toId?: string, fileId?: string): Promise<SimpleResponse> => {
    const response = await axios.put(ACCOUNT_UPDATE_RECORD_PATH, { recordId, toId, date: AppUtil.toDateStr(date), amount, type, description, fileId });
    const data: SimpleResponse = response.data;
    return data;
};

const deleteRecord = async (recordId: string): Promise<SimpleResponse> => {
    const response = await axios.delete(ACCOUNT_DELETE_RECORD_PATH, { params: { recordId } });
    const data: SimpleResponse = response.data;
    return data;
};

export default { getAccounts, createAccount, updateAccount, deleteAccount, getRecords, getMonthBalance, income, transfer, expend, updateRecord, deleteRecord };
