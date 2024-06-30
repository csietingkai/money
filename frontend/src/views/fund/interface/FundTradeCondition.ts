interface FundBuyForm {
    type: 'buy';
    code: string;
    name: string;
    date: Date;
    rate: number;
    price: number;
}

interface FundSellForm {
    type: 'sell';
    code: string;
    name: string;
    date: Date;
    price: number;
    rate: number;
    share: number;
}

interface FundBonusForm {
    type: 'bonus';
    code: string;
    name: string;
    date: Date;
    price: number;
    rate: number;
    share: number;
}

export type TradeType = 'buy' | 'sell' | 'bonus';

type FundTradeCondition = FundBuyForm | FundSellForm | FundBonusForm;

export default FundTradeCondition;
