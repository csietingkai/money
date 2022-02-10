import { ToastOptions, ToastPosition } from 'react-toastify';

// localStorage
export const AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';
export const STOCK_STYLE_KEY: string = 'STOCK_STYLE';

// notify position
export const NOTIFICATION_POSTITION: ToastPosition = 'bottom-right';
export const NOTIFICATION_SHOW_POGRESS_BAR: boolean = false;
export const NOTIFICATION_PAUSE_ON_HOVER: boolean = true;
export const NOTIFICATION_CLOSE_DELAY_SECONDS: number = 2;

export const NOTIFICATION_DEFAULT_CONFIG: ToastOptions = {
    style: { fontSize: '16px' },
    position: NOTIFICATION_POSTITION,
    hideProgressBar: !NOTIFICATION_SHOW_POGRESS_BAR,
    pauseOnHover: NOTIFICATION_PAUSE_ON_HOVER,
    autoClose: NOTIFICATION_CLOSE_DELAY_SECONDS * 2000
};

// system
export const DEFAULT_DECIMAL_PRECISION: number = 2;
