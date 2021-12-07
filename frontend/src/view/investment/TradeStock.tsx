import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import StockChart from 'component/common/chart/StockChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { DollarSignIcon } from 'component/common/Icons';

import { SetAccountListDispatcher, SetStockOwnListDispatcher } from 'reducer/PropsMapper';
import { getAccountList, getAuthTokenName, getStockList, getStockQueryCondition, getStockStyle, ReduxState } from 'reducer/Selector';

import AccountApi, { Account, AccountListResponse } from 'api/account';
import StockApi, { StockRecordVo, StockVo, UserStockListResponse, UserStockVo } from 'api/stock';

import { numberComma } from 'util/AppUtil';
import { InputType, StockStyle, DealType, Variant } from 'util/Enum';
import { Action, Record } from 'util/Interface';
import Notify from 'util/Notify';
import { StockQueryCondition } from './StockQuerier';

export interface TradeStockProps {
    stockStyle: StockStyle;
    username: string;
    accounts: Account[];
    stocks: StockVo[];
    stockQueryCondition: StockQueryCondition;
    setAccountList: (accounts: Account[]) => void;
    setStockOwnList: (ownList: UserStockVo[]) => void;
}

export interface TradeStockState {
    values: StockTradeForm;
    total: number;
    stockRecords: StockRecordVo[];
}

export interface StockTradeForm {
    code: string;
    name: string;
    usedAccount: string;
    accountBalance: string;
    dealType: DealType;
    date: Date;
    price: number;
    share: number;
    fixTotal: number;
    fee: number;
    tax: number;
    total: string;
}

class TradeStock extends React.Component<TradeStockProps, TradeStockState> {

    constructor(props: TradeStockProps) {
        super(props);
        const stock = this.getStockInfoByProps(props);
        this.state = {
            values: {
                code: stock?.code || '',
                name: stock?.name || '',
                usedAccount: props.accounts[0]?.id || '',
                accountBalance: numberComma(props.accounts[0]?.balance) || '',
                dealType: DealType.BUY,
                date: new Date(),
                price: 0,
                share: 0,
                fixTotal: 0,
                fee: 0,
                tax: 0,
                total: '0'
            },
            total: 0,
            stockRecords: []
        };
    }

    private getStockInfoByProps = (props: TradeStockProps): StockVo => {
        const { stocks, stockQueryCondition: { code, name } } = props;
        let stock: StockVo = undefined;
        if (code) {
            stock = stocks.find(x => x.code === code);
        } else if (name) {
            stock = stocks.find(x => x.name === name);
        }
        return stock;
    };

    private onTradeFormChange = async (formState: any, key: string) => {
        const { accounts, stocks } = this.props;
        const { values } = this.state;
        const linkedValues: any = {};
        if (key === 'code') {
            const code = formState[key];
            linkedValues.name = stocks.find(s => s.code === code)?.name || '';
            if (linkedValues.name) {
                await this.fetchStockRecords(code);
            }
        } else if (key === 'usedAccount') {
            linkedValues.accountBalance = numberComma(accounts.find(a => a.id === formState[key])?.balance) || '';
        } else if (key === 'fixTotal') {
            let total = values.share * values.price;
            if (values.dealType === DealType.BUY) {
                total += values.fee + values.tax;
            } else if (values.dealType === DealType.SELL) {
                total -= values.fee + values.tax;
            }
            total += formState[key];
            linkedValues.total = numberComma(total);
        } else if (['dealType', 'share', 'price'].findIndex(x => x === key) >= 0) {
            const { data: { fee, tax } } = await StockApi.precalc(formState.dealType, formState.share, formState.price);
            linkedValues.fee = fee;
            linkedValues.tax = tax;
            let total = values.share * values.price;
            if (values.dealType === DealType.BUY) {
                total += fee + tax;
            } else if (values.dealType === DealType.SELL) {
                total -= fee + tax;
            }
            total += values.fixTotal;
            linkedValues.total = numberComma(total);
        }
        this.setState({ values: { ...this.state.values, ...linkedValues } });
    };

    private fetchStockRecords = async (code: string) => {
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        const end = new Date();
        const response = await StockApi.getRecords(code, start, end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        this.setState({ stockRecords: records });
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
        const { values: { usedAccount, code, dealType, date, share, price, fixTotal, fee, tax } } = this.state;
        let success, message;
        if (dealType === DealType.BUY) {
            const response = await StockApi.buy(username, usedAccount, code, date, share, price, fixTotal, fee);
            success = response.success;
            message = response.message;
        } else if (dealType === DealType.SELL) {
            const response = await StockApi.sell(username, usedAccount, code, date, share, price, fixTotal, fee, tax);
            success = response.success;
            message = response.message;
        }
        if (success) {
            Notify.success(message);
            await this.fetchAccounts(username);
            await this.fetchStockOwnList(username);
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

    private fetchStockOwnList = async (username: string = this.props.username) => {
        const response: UserStockListResponse = await StockApi.getOwn(username);
        const { success, data: ownList, message } = response;
        if (success) {
            const { setStockOwnList } = this.props;
            setStockOwnList(ownList);
        } else {
            Notify.warning(message);
        }
    };

    render() {
        const { accounts, stockStyle } = this.props;
        const { values, stockRecords } = this.state;
        const accountOptions: Record<string, string>[] = accounts.map(x => ({ key: x.id, value: x.name }));
        const dealTypes: Record<string, string>[] = [DealType.BUY, DealType.SELL].map(x => ({ key: x, value: x }));
        if (accounts.length && !values.usedAccount) {
            values.usedAccount = accounts[0].id;
        }
        values.accountBalance = numberComma(accounts.find(x => x.id === values.usedAccount)?.balance) || '';
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title={`${values?.dealType === DealType.BUY ? 'Buy' : ''}${values?.dealType === DealType.SELL ? 'Sell' : ''} Stock`}
                        >
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'code', title: 'Stock Code', type: InputType.text, value: values?.code, width: 3, required: true },
                                    { key: 'name', title: 'Stock Name', type: InputType.text, value: values?.name, width: 3, disabled: true },
                                    { key: 'usedAccount', title: 'Choose Account', type: InputType.select, value: values?.usedAccount, width: 3, required: true, options: accountOptions },
                                    { key: 'accountBalance', title: 'Account Balance', type: InputType.text, value: values?.accountBalance, width: 3, disabled: true },
                                    { key: 'dealType', title: 'Trade Type', type: InputType.radio, value: values?.dealType, width: 3, options: dealTypes },
                                    { key: 'date', title: 'Buy/Sell At', type: InputType.date, value: values?.date, width: 3, required: true },
                                    { key: 'price', title: 'Price', type: InputType.numeric, value: values?.price, width: 3, required: true },
                                    { key: 'share', title: 'Share', type: InputType.numeric, value: values?.share, width: 3, required: true },
                                    { key: 'fixTotal', title: 'Fix', type: InputType.numeric, value: values?.fixTotal, width: 3, required: true },
                                    { key: 'fee', title: 'Fee', type: InputType.numeric, value: values?.fee, width: 3, disabled: true },
                                    { key: 'tax', title: 'Tax', type: InputType.numeric, value: values?.tax, width: 3, disabled: true },
                                    { key: 'total', title: 'Total', type: InputType.text, value: values?.total, width: 3, disabled: true }
                                ]}
                                onChange={async (formState: any, key: string) => {
                                    const { values } = this.state;
                                    values.code = formState.code;
                                    values.usedAccount = formState.usedAccount;
                                    values.dealType = formState.dealType;
                                    values.date = formState.date;
                                    values.price = formState.price;
                                    values.share = formState.share;
                                    values.fixTotal = formState.fixTotal;
                                    this.setState({ values: { ...values } }, () => this.onTradeFormChange(formState, key));
                                }}
                            />
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
                                <StockChart
                                    stockStyle={stockStyle}
                                    data={stockRecords}
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
        stocks: getStockList(state),
        stockQueryCondition: getStockQueryCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | UserStockVo[]>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setStockOwnList: SetStockOwnListDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TradeStock);
