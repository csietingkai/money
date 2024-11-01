interface FundBuyForm {
    recordId?: string;
    type: 'buy';
    code: string;
    name: string;
    accountId?: string;
    date: Date;
    debitAmount: number;
    rate: number;
    price: number;
    share?: number;
    fee?: number;
    accountRecordId?: string;
    fileId?: string;
}

interface FundSellForm {
    recordId?: string;
    type: 'sell';
    code: string;
    name: string;
    accountId?: string;
    date: Date;
    price: number;
    rate: number;
    share: number;
    total?: number;
    accountRecordId?: string;
    fileId?: string;
}

interface FundBonusForm {
    recordId?: string;
    type: 'bonus';
    code: string;
    name: string;
    accountId?: string;
    date: Date;
    price: number;
    rate: number;
    share: number;
    total?: number;
    accountRecordId?: string;
    fileId?: string;
}

export type TradeType = 'buy' | 'sell' | 'bonus';

type FundTradeCondition = FundBuyForm | FundSellForm | FundBonusForm;

export default FundTradeCondition;
