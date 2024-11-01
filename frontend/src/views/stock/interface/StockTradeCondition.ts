interface StockBuyForm {
    recordId?: string;
    type: 'buy';
    code: string;
    name: string;
    currency: string;
    accountId?: string;
    date: Date;
    price: number;
    share: number;
    fee?: number;
    total?: number;
    accountRecordId?: string;
    fileId?: string;
}

interface StockSellForm {
    recordId?: string;
    type: 'sell';
    code: string;
    name: string;
    currency: string;
    accountId?: string;
    date: Date;
    price: number;
    share: number;
    fee?: number;
    tax?: number;
    total?: number;
    accountRecordId?: string;
    fileId?: string;
}

interface StockBonusForm {
    recordId?: string;
    type: 'bonus';
    code: string;
    name: string;
    currency: string;
    accountId?: string;
    date: Date;
    price?: number;
    share: number;
    fee?: number;
    total?: number;
    accountRecordId?: string;
    fileId?: string;
}

export type TradeType = 'buy' | 'sell' | 'bonus';

type StockTradeCondition = StockBuyForm | StockSellForm | StockBonusForm;

export default StockTradeCondition;
