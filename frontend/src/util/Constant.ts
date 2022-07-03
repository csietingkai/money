import { ToastOptions, ToastPosition } from 'react-toastify';

// localStorage
export const AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';
export const DEFAULT_FOREIGNER_CURRENCY_KEY: string = 'DEFAULT_FOREIGNER_CURRENCY';
export const STOCK_STYLE_KEY: string = 'STOCK_STYLE';
export const PREDICT_DAYS_KEY: string = 'PREDICT_DAYS';
export const ACCOUNT_RECORD_DELETABLE_KEY: string = 'ACCOUNT_RECORD_DELETABLE';
export const DEFAULT_ROLE_KEY: string = 'DEFAULT_ROLE';
export const DEFAULT_RECORD_TYPE_KEY: string = 'DEFAULT_RECORD_TYPE';

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
export const EXCHANGE_RATE_PRECISION: { [rateName: string]: number; } = { JPY: 4 };
