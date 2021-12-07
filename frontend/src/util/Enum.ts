export enum SortType {
    ASC, DESC
}

export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'link';

export type DivWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export enum InputType {
    text = 'text',
    numeric = 'numeric',
    email = 'email',
    password = 'password',
    textarea = 'textarea',
    select = 'select',
    radio = 'radio',
    checkbox = 'checkbox',
    file = 'file',
    date = 'date',
    datetime = 'datetime'
}

export enum StockStyle {
    US = 'US',
    TW = 'TW'
}

export enum DealType {
    BUY = 'BUY',
    SELL = 'SELL'
}
