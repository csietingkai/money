import axios from 'axios';

import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH, AUTH_VALIDATE_PATH } from 'api/Constant';

import { ApiResponse } from 'util/Interface';

export enum Role {
    ROOT = 'ROOT',
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export interface AuthToken {
    name: string;
    role: Role;
    tokenString: string;
    expiryDate: Date;
}

export interface AuthResponse extends ApiResponse<AuthToken> { }

const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_LOGIN_PATH, null, { params: { username, password } });
    const data: AuthResponse = response.data;
    return data;
};

const register = async (username: string, email: string, password: string, sendMail?: boolean): Promise<AuthResponse> => {
    const response = await axios.post(AUTH_REGISTER_PATH, {
        name: username,
        email,
        pwd: password,
        role: Role.USER
    }, { params: { sendMail } });
    const data: AuthResponse = response.data;
    return data;
};

const validate = async (tokenString: string): Promise<AuthResponse> => {
    const response = await axios.get(AUTH_VALIDATE_PATH, { params: { tokenString } });
    const data: AuthResponse = response.data;
    return data;
};

export default { login, register, validate };
