import axios from 'axios';

import { ACCOUNT_CREATE_PATH, ACCOUNT_CREATE_RECORD_PATH, ACCOUNT_DELETE_PATH, ACCOUNT_GET_ALL_PATH, ACCOUNT_GET_PATH, ACCOUNT_GET_RECORDS_PATH, ACCOUNT_UPDATE_PATH } from 'api/Constant';

import { ApiResponse, SimpleResponse } from 'util/Interface';

export interface Account {
    id: string;
    ownerName: string;
    currency: string;
    name: string;
    balance: number;
}

export interface AccountRecord {
    id: string;
    transDate: Date;
    transAmount: number;
    transFrom: string;
    transTo: string;
    description: string | null;
}

export interface AccountResponse extends ApiResponse<Account> { }
export interface AccountsResponse extends ApiResponse<Account[]> { }
export interface AccountRecordsResponse extends ApiResponse<AccountRecord[]> { }

const get = async (accountId: string) => {
    const response = await axios.get(ACCOUNT_GET_PATH, { params: { accountId } });
    const data: AccountRecordsResponse = response.data;
    return data;
};

const getAccounts = async (ownerName: string) => {
    const response = await axios.get(ACCOUNT_GET_ALL_PATH, { params: { ownerName } });
    const data: AccountsResponse = response.data;
    return data;
};

const createAccount = async (entity: Account) => {
    entity.id = '';
    entity.balance = 0;
    const response = await axios.post(ACCOUNT_CREATE_PATH, entity);
    const data: SimpleResponse = response.data;
    return data;
};

const updateAccount = async (entity: Account) => {
    const response = await axios.put(ACCOUNT_UPDATE_PATH, entity);
    const data: SimpleResponse = response.data;
    return data;
};

const deleteAccount = async (id: string) => {
    const response = await axios.delete(ACCOUNT_DELETE_PATH, { params: { id } });
    const data: SimpleResponse = response.data;
    return data;
};

const getRecords = async (accountId: string) => {
    const response = await axios.get(ACCOUNT_GET_RECORDS_PATH, { params: { accountId } });
    const data: AccountRecordsResponse = response.data;
    return data;
};

const addRecord = async (entity: AccountRecord) => {
    entity.transDate = new Date();
    const response = await axios.post(ACCOUNT_CREATE_RECORD_PATH, entity);
    const data: SimpleResponse = response.data;
    return data;
};

export default { get, getAccounts, createAccount, updateAccount, deleteAccount, getRecords, addRecord };