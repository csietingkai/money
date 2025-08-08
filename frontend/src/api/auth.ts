import axios from 'axios';

import { AUTH_LOGIN_PATH, AUTH_LOGOUT_PATH, AUTH_CHANGE_PWD_PATH, AUTH_VALIDATE_PATH, USER_GET_SETTING_PATH, USER_UPDATE_SETTING_PATH } from './Constant';

import { ApiResponse, Lang, SimpleResponse } from '../util/Interface';
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
    accountRecordType: string;
    accountRecordDeletable: boolean;
    onlyShowOwnStock: boolean;
    onlyShowOwnFund: boolean;
    calcBonusInCost: boolean;
    lang: Lang;
}

export interface AuthResponse extends ApiResponse<AuthToken> { }
export interface UserResponse extends ApiResponse<UserSetting> { }

const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_LOGIN_PATH, null, { params: { username, password } });
    const data: AuthResponse = response.data;
    return data;
};

const changePwd = async (password: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_CHANGE_PWD_PATH, null, { params: { password } });
    const data: AuthResponse = response.data;
    return data;
};

const validate = async (tokenString: string): Promise<AuthResponse> => {
    const response = await axios.get(AUTH_VALIDATE_PATH, { params: { tokenString } });
    const data: AuthResponse = response.data;
    return data;
};

const logout = async (tokenString: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_LOGOUT_PATH, null, { params: { tokenString } });
    const data: AuthResponse = response.data;
    return data;
};

const getUserSetting = async (): Promise<UserResponse> => {
    const response = await axios.get(USER_GET_SETTING_PATH);
    const data: UserResponse = response.data;
    return data;
};

const updateUserSetting = async (userSetting: UserSetting): Promise<SimpleResponse> => {
    const response = await axios.post(USER_UPDATE_SETTING_PATH, userSetting);
    const data: SimpleResponse = response.data;
    return data;
};

export default { login, changePwd, validate, logout, getUserSetting, updateUserSetting };
