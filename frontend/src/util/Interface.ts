import { AuthToken } from 'api/auth';

// common
export interface Record<K, V> {
    key: K;
    value: V;
}

// redux
export interface SystemState {
    authToken: AuthToken;
}

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

// component/layout
export interface SidebarItem {
    name: string;
    type?: 'dropdown' | 'wrapper' | 'divider';
    url?: string;
    icon?: JSX.Element;
    children?: SidebarItem[];
    component?: React.ComponentType<any>;
}
