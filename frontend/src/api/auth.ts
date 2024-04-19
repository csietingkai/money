import axios from 'axios';

import { AUTH_LOGIN_PATH, AUTH_LOGOUT_PATH, AUTH_CHANGE_PWD_PATH, AUTH_UPDATE_SETTING_PATH, AUTH_VALIDATE_PATH } from './Constant';

import { ApiResponse } from '../util/Interface';
import { StockType } from '../util/Enum';

export interface AuthToken {
    id: string;
    name: string;
    role: string;
    tokenString: string;
    expiryDate: Date;
}

export interface UserSetting {
    id: string;
    userId: string;
    stockType: StockType;
    predictDays: number;
    stockFeeRate: number;
    fundFeeRate: number;
    accountRecordDeletable: boolean;
    accountRecordType: string;
}

export interface LoginRespVo {
    authToken: AuthToken;
    setting: UserSetting;
}

export interface AuthResponse extends ApiResponse<LoginRespVo> { }

const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_LOGIN_PATH, null, { params: { username, password } });
    const data: AuthResponse = response.data;
    return data;
};

const changePwd = async (userId: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_CHANGE_PWD_PATH, null, { params: { userId, password } });
    const data: AuthResponse = response.data;
    return data;
};

const validate = async (tokenString: string): Promise<AuthResponse> => {
    const response = await axios.get(AUTH_VALIDATE_PATH, { params: { tokenString } });
    const data: AuthResponse = response.data;
    return data;
};

const logout = async (userId: string, tokenString: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_LOGOUT_PATH, null, { params: { userId, tokenString } });
    const data: AuthResponse = response.data;
    return data;
};

const updateUserSetting = async (userSetting: UserSetting): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_UPDATE_SETTING_PATH, userSetting);
    const data: AuthResponse = response.data;
    return data;
};

export default { login, changePwd, validate, logout, updateUserSetting };
