interface StockBuyForm {
    type: 'buy';
    code: string;
    name: string;
    currency: string;
    date: Date;
    price: number;
    share: number;
}

interface StockSellForm {
    type: 'sell';
    code: string;
    name: string;
    currency: string;
    date: Date;
    price: number;
    share: number;
}

interface StockBonusForm {
    type: 'bonus';
    code: string;
    name: string;
    currency: string;
    date: Date;
    price: number;
    share: number;
}

export type TradeType = 'buy' | 'sell' | 'bonus';

type StockTradeCondition = StockBuyForm | StockSellForm | StockBonusForm;

export default StockTradeCondition;
