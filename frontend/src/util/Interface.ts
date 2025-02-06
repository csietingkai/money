// common
export interface Notification {
    time: number;
    message: string;
}

export interface Option {
    key: string;
    value: string;
}

// redux
export interface Action<T> {
    type: string;
    payload: T;
}

// api
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface SimpleResponse {
    success: boolean;
    data: null;
    message: string;
}

export interface PredictResultVo {
    lower: number;
    price: number;
    upper: number;
}

export interface PredictResponse extends ApiResponse<PredictResultVo[]> { }

export type SupportLineType = '' | 'ma' | 'bb';
