import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form, { Input } from 'component/common/Form';
import { DollarSignIcon } from 'component/common/Icons';
import { FundQueryCondition } from 'view/investment/FundQuerier';

import { SetAccountListDispatcher, SetFundOwnListDispatcher } from 'reducer/PropsMapper';
import { getAccountList, getAuthTokenName, getFundList, getFundQueryCondition, getStockStyle, ReduxState } from 'reducer/Selector';

import AccountApi, { Account, AccountListResponse } from 'api/account';
import ExchangeRateApi from 'api/exchangeRate';
import FundApi, { FundRecordVo, FundVo, UserFundListResponse, UserFundVo } from 'api/fund';

import { isSameDate, numberComma, reverseNumberComma } from 'util/AppUtil';
import { InputType, StockStyle, DealType, Variant } from 'util/Enum';
import { Action, Record } from 'util/Interface';
import Notify from 'util/Notify';
import FundChart from 'component/common/chart/FundChart';

export interface TradeFundProps {
    stockStyle: StockStyle;
    username: string;
    accounts: Account[];
    funds: FundVo[];
    fundQueryCondition: FundQueryCondition;
    setAccountList: (accounts: Account[]) => void;
    setFundOwnList: (ownList: UserFundVo[]) => void;
}

export interface TradeFundState {
    values: FundTradeForm;
    fundRecords: FundRecordVo[];
}

export interface FundTradeForm {
    code: string;
    name: string;
    usedAccount: string;
    accountBalance: string;
    dealType: DealType;
    date: Date;
    rate: number;
    payment: number;
    price: number;
    priceFix: number;
    fee: number;
    share: number;
    shareFix: number;
    shareTxt: string;
    total: string;
    [key: string]: any;
}

class TradeFund extends React.Component<TradeFundProps, TradeFundState> {

    constructor(props: TradeFundProps) {
        super(props);
        const fund = this.getFundInfoByProps(props);
        this.state = {
            values: {
                code: fund?.code || '',
                name: fund?.name || '',
                usedAccount: props.accounts[0]?.id || '',
                accountBalance: numberComma(props.accounts[0]?.balance) || '',
                dealType: DealType.BUY,
                date: new Date(),
                rate: 1,
                payment: 0,
                price: 0,
                priceFix: 0,
                fee: 0,
                share: 0,
                shareFix: 0,
                shareTxt: '0',
                total: '0'
            },
            fundRecords: []
        };
    }

    private getFundInfoByProps = (props: TradeFundProps): FundVo => {
        const { funds, fundQueryCondition: { code, name } } = props;
        let fund: FundVo = undefined;
        if (code) {
            fund = funds.find(x => x.code === code);
        } else if (name) {
            fund = funds.find(x => x.name === name);
        }
        return fund;
    };

    private onTradeFormChange = async (formState: any, key: string) => {
        const { accounts, funds } = this.props;
        const { values } = this.state;
        const linkedValues: any = {};
        if (key === 'code') {
            const code = formState[key];
            const fund = funds.find(s => s.code === code);
            linkedValues.name = fund?.name || '';
            if (fund) {
                this.fetchRate(fund.currency, values.date);
                this.fetchFundRecords(code);
            }
        } else if (key === 'date') {
            const fund = funds.find(s => s.code === values.code);
            if (fund) {
                linkedValues.rate = await this.fetchRate(fund.currency, values.date);
            }
        } else if (key === 'usedAccount') {
            linkedValues.accountBalance = numberComma(accounts.find(a => a.id === formState[key])?.balance) || '';
        } else if (key === 'payment') {
            linkedValues.shareTxt = this.getBuyShare(values.payment, values.price, values.rate, values.shareFix);
            linkedValues.total = numberComma(values.payment + values.fee);
        } else if (key === 'price') {
            if (values.dealType === DealType.BUY) {
                linkedValues.shareTxt = this.getBuyShare(values.payment, values.price, values.rate, values.shareFix);
            } else if (values.dealType === DealType.SELL) {
                linkedValues.total = this.getSellTotal(values.price, values.share, values.priceFix);
            }
        } else if (key === 'share' || key === 'priceFix') {
            linkedValues.total = this.getSellTotal(values.price, values.share, values.priceFix);
        } else if (key === 'shareFix') {
            linkedValues.shareTxt = this.getBuyShare(values.payment, values.price, values.rate, values.shareFix);
        } else if (key === 'fee') {
            linkedValues.total = numberComma(values.payment + values.fee);
        }
        this.setState({ values: { ...this.state.values, ...linkedValues } });
    };

    private fetchRate = async (currency: string, date: Date) => {
        const start = new Date(date), end: Date = new Date(date);
        start.setMonth(date.getMonth() - 1);
        end.setMonth(date.getMonth() + 1);
        const { success, data } = await ExchangeRateApi.getRecords(currency, start, end);
        if (success) {
            const record = data.find(x => isSameDate(date, x.date));
            if (record) {
                return record.spotSell;
            }
        }
        return 1;
    };

    private getBuyShare = (payment: number, price: number, rate: number, shareFix: number): string => {
        if (payment && price) {
            return numberComma(parseFloat((parseFloat((payment / (price * rate)).toFixed(3)) + shareFix).toFixed(3)));
        }
        return '0';
    };

    private getSellTotal = (price: number, share: number, priceFix: number = 0): string => {
        if (price && share) {
            return numberComma(price * share + priceFix);
        }
        return '0';
    };

    private fetchFundRecords = async (code: string) => {
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        const end = new Date();
        const response = await FundApi.getRecords(code, start, end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        this.setState({ fundRecords: records });
    };

    private getBtnVariant = (dealType: DealType, stockStyle: StockStyle): Variant => {
        let variant: Variant = 'info';
        if (dealType === DealType.BUY) {
            if (stockStyle === StockStyle.TW) {
                variant = 'danger';
            } else if (stockStyle === StockStyle.US) {
                variant = 'success';
            }
        } else if (dealType === DealType.SELL) {
            if (stockStyle === StockStyle.TW) {
                variant = 'success';
            } else if (stockStyle === StockStyle.US) {
                variant = 'danger';
            }
        }
        return variant;
    };

    private onTradeBtnClick = async () => {
        const { username } = this.props;
        const { values: { usedAccount, code, dealType, date, payment, price, rate, priceFix, fee, share, shareTxt } } = this.state;
        if (!code) {
            Notify.warning('Please fill correct code.');
            return;
        }
        let success, message;
        if (dealType === DealType.BUY) {
            const response = await FundApi.buy(username, usedAccount, code, date, reverseNumberComma(shareTxt), price, rate, payment, fee);
            success = response.success;
            message = response.message;
        } else if (dealType === DealType.SELL) {
            const response = await FundApi.sell(username, usedAccount, code, date, share, price, rate, priceFix);
            success = response.success;
            message = response.message;
        }
        if (success) {
            Notify.success(message);
            await this.fetchAccounts(username);
            await this.fetchFundOwnList(username);
        } else {
            Notify.warning(message);
        }
    };

    private fetchAccounts = async (username: string = this.props.username) => {
        const response: AccountListResponse = await AccountApi.getAccounts(username);
        const { success, data: accounts, message } = response;
        if (success) {
            const { setAccountList } = this.props;
            setAccountList(accounts);
        } else {
            Notify.warning(message);
        }
    };

    private fetchFundOwnList = async (username: string = this.props.username) => {
        const response: UserFundListResponse = await FundApi.getOwn(username);
        const { success, data: ownList, message } = response;
        if (success) {
            const { setFundOwnList } = this.props;
            setFundOwnList(ownList);
        } else {
            Notify.warning(message);
        }
    };

    render() {
        const { accounts, stockStyle } = this.props;
        const { values, fundRecords } = this.state;
        const { dealType } = values;
        const accountOptions: Record<string, string>[] = accounts.map(x => ({ key: x.id, value: x.name }));
        const dealTypes: Record<string, string>[] = [DealType.BUY, DealType.SELL].map(x => ({ key: x, value: x }));
        if (accounts.length && !values.usedAccount) {
            values.usedAccount = accounts[0].id;
        }
        values.accountBalance = numberComma(accounts.find(x => x.id === values.usedAccount)?.balance) || '';

        const formInputs: Input[] = [
            { key: 'code', title: 'Fund Code', type: InputType.text, value: values?.code, width: 3, required: true },
            { key: 'name', title: 'Fund Name', type: InputType.text, value: values?.name, width: 3, disabled: true },
            { key: 'usedAccount', title: 'Choose Account', type: InputType.select, value: values?.usedAccount, width: 3, required: true, options: accountOptions },
            { key: 'accountBalance', title: 'Account Balance', type: InputType.text, value: values?.accountBalance, width: 3, disabled: true },
            { key: 'dealType', title: 'Trade Type', type: InputType.radio, value: values?.dealType, width: 3, options: dealTypes },
            { key: 'date', title: 'Buy/Sell At', type: InputType.date, value: values?.date, width: 3, required: true },
            { key: 'rate', title: 'Exchange Rate', type: InputType.numeric, value: values?.rate, width: 3, required: true }
        ];
        if (dealType === DealType.BUY) {
            formInputs.push({ key: 'payment', title: 'Spend How Much', type: InputType.numeric, value: values?.payment, width: 3, required: true });
            formInputs.push({ key: 'price', title: 'Price', type: InputType.numeric, value: values?.price, width: 3, required: true });
            formInputs.push({ key: 'shareTxt', title: 'Share', type: InputType.text, value: values?.shareTxt, width: 3, disabled: true });
            formInputs.push({ key: 'shareFix', title: 'Fix Share', type: InputType.numeric, value: values?.shareFix, width: 3, required: true });
            formInputs.push({ key: 'fee', title: 'Fee', type: InputType.numeric, value: values?.fee, width: 3, required: true });
        } else if (dealType === DealType.SELL) {
            formInputs.push({ key: 'price', title: 'Price', type: InputType.numeric, value: values?.price, width: 3, required: true });
            formInputs.push({ key: 'share', title: 'Share', type: InputType.numeric, value: values?.share, width: 3, required: true });
            formInputs.push({ key: 'priceFix', title: 'Price Fix', type: InputType.numeric, value: values?.priceFix, width: 3, required: true });
        }
        formInputs.push({ key: 'total', title: 'Total', type: InputType.text, value: values?.total, width: 3, disabled: true });
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`${values?.dealType === DealType.BUY ? 'Buy' : ''}${values?.dealType === DealType.SELL ? 'Sell' : ''} Stock`}
                        >
                            {
                                values.dealType === DealType.BUY &&
                                <Form
                                    singleRow
                                    inputs={formInputs}
                                    onChange={(formState: any, key: string) => {
                                        const { values } = this.state;
                                        values[key] = formState[key];
                                        this.setState({ values: { ...values } }, () => this.onTradeFormChange(formState, key));
                                    }}
                                />}
                            {
                                values.dealType === DealType.SELL &&
                                <Form
                                    singleRow
                                    inputs={formInputs}
                                    onChange={(formState: any, key: string) => {
                                        const { values } = this.state;
                                        values.code = formState.code;
                                        values.usedAccount = formState.usedAccount;
                                        values.dealType = formState.dealType;
                                        values.date = formState.date;
                                        values.rate = formState.rate;
                                        values.price = formState.price;
                                        values.share = formState.share;
                                        values.priceFix = formState.priceFix;
                                        this.setState({ values: { ...values } }, () => this.onTradeFormChange(formState, key));
                                    }}
                                />
                            }
                            <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant={this.getBtnVariant(values.dealType, stockStyle)}
                                    outline
                                    onClick={this.onTradeBtnClick}
                                >
                                    <DollarSignIcon />
                                    {values.dealType === DealType.BUY && ' BUY'}
                                    {values.dealType === DealType.SELL && ' SELL'}
                                </Button>
                            </div>
                        </Card>
                    </Col>
                    <Col>
                        {
                            values.code && values.name &&
                            <Card
                                title='Candle Chart'
                            >
                                <FundChart
                                    stockStyle={stockStyle}
                                    data={fundRecords}
                                    showInfo={false}
                                />
                            </Card>
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        stockStyle: getStockStyle(state),
        username: getAuthTokenName(state),
        accounts: getAccountList(state),
        funds: getFundList(state),
        fundQueryCondition: getFundQueryCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | UserFundVo[]>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setFundOwnList: SetFundOwnListDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TradeFund);
