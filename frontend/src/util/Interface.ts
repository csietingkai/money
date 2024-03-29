// common
export interface Record<K, V> {
    key: K;
    value: V;
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

// component/layout
export interface SidebarItem {
    name: string;
    level: number;
    type?: 'dropdown' | 'wrapper' | 'divider';
    url?: string;
    icon?: JSX.Element;
    children?: SidebarItem[];
    component?: React.ComponentType<any>;
}
