import axios from 'axios';

import { ENUM_GET_DEAL_TYPES, ENUM_GET_MARKET_TYPES, ENUM_GET_RECORD_TYPES, ENUM_GET_ROLES } from 'api/Constant';

import { ApiResponse } from 'util/Interface';

export interface EnumResponse extends ApiResponse<string[]> { }

export const SET_MARKET_TYPES: string = 'SET_MARKET_TYPES';
export const SET_DEFAULT_MARKET_TYPE: string = 'SET_DEFAULT_MARKET_TYPE';
export const SET_ROLES: string = 'SET_ROLES';
export const SET_DEFAULT_ROLE: string = 'SET_DEFAULT_ROLE';
export const SET_RECORD_TYPES: string = 'SET_RECORD_TYPES';
export const SET_DEFAULT_RECORD_TYPE: string = 'SET_DEFAULT_RECORD_TYPE';

const getDealTypes = async (): Promise<EnumResponse> => {
    const response = await axios.get(ENUM_GET_DEAL_TYPES);
    const data: EnumResponse = response.data;
    return data;
};

const getMarketTypes = async (): Promise<EnumResponse> => {
    const response = await axios.get(ENUM_GET_MARKET_TYPES);
    const data: EnumResponse = response.data;
    return data;
};

const getRoles = async (): Promise<EnumResponse> => {
    const response = await axios.get(ENUM_GET_ROLES);
    const data: EnumResponse = response.data;
    return data;
};

const getRecordTypes = async (): Promise<EnumResponse> => {
    const response = await axios.get(ENUM_GET_RECORD_TYPES);
    const data: EnumResponse = response.data;
    return data;
};

export default { getDealTypes, getMarketTypes, getRoles, getRecordTypes };
