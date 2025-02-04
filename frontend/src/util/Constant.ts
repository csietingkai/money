// localStorage
export const AUTH_TOKEN_KEY: string = 'AUTH_TOKEN';
export const DEFAULT_FOREIGNER_CURRENCY_KEY: string = 'DEFAULT_FOREIGNER_CURRENCY';
export const STOCK_STYLE_KEY: string = 'STOCK_STYLE';
export const PREDICT_DAYS_KEY: string = 'PREDICT_DAYS';
export const ACCOUNT_RECORD_DELETABLE_KEY: string = 'ACCOUNT_RECORD_DELETABLE';
export const DEFAULT_ROLE_KEY: string = 'DEFAULT_ROLE';
export const DEFAULT_RECORD_TYPE_KEY: string = 'DEFAULT_RECORD_TYPE';

// notify position
export const NOTIFICATION_SHOW_POGRESS_BAR: boolean = false;
export const NOTIFICATION_PAUSE_ON_HOVER: boolean = true;
export const NOTIFICATION_CLOSE_DELAY_SECONDS: number = 2;

// system
export const DEFAULT_DECIMAL_PRECISION: number = 2;
export const EXCHANGE_RATE_PRECISION: { [rateName: string]: number; } = { JPY: 4 };
export const DATA_COUNT_PER_PAGE: number = 10;
export const CHART_COLORS: string[] = [
    '#3366cc','#dc3912','#ff9900','#109618','#990099','#0099c6','#dd4477','#66aa00',
    '#b82e2e','#316395','#994499','#22aa99','#aaaa11','#6633cc','#e67300','#8b0707',
    '#651067','#329262','#5574a6','#3b3eac','#b77322','#16d620','#b91383','#f4359e',
    '#9c5935','#a9c413','#2a778d','#668d1c','#bea413','#0c5922','#743411'
]
