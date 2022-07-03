import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetAccountListDispatcher, SetExchangeRateListDispatcher, SetExchangeRateQueryConditionDispatcher, SetLoadingDispatcher } from 'reducer/PropsMapper';
import { getAccountList, getAuthTokenName, getExchangeRateList, getExchangeRateQueryCondition, getStockStyle, ReduxState } from 'reducer/Selector';

import ExchangeRateChart from 'component/common/chart/ExchangeRateChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { DollarSignIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';

import AccountApi, { Account, AccountListResponse } from 'api/account';
import ExchangeRateApi, { ExchangeRateRecordVo, ExchangeRateVo } from 'api/exchangeRate';

import { numberComma, toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';

export interface ExchangeRateProps {
    username: string;
    stockStyle: StockStyle;
    exchangeRateList: ExchangeRateVo[];
    exchangeRateQueryCondition: ExchangeRateQueryCondition;
    accountList: Account[];
    setAccountList: (accounts: Account[]) => void;
    setExchangeRateList: (exchangeRateList: ExchangeRateVo[]) => void;
    setExchangeRateQueryCondition: (condition: ExchangeRateQueryCondition) => void;
    setLoading: (loading: boolean) => void;
}

export interface ExchangeRateState {
    xAxis: string[];
    exchangeRateRecords: ExchangeRateRecordVo[];
    exchangeRateTradeForm: ExchangeRateTradeForm;
}

export interface ExchangeRateQueryCondition {
    currency: string;
    start: Date;
    end: Date;
}

interface ExchangeRateTradeForm {
    fromAccount: string;
    toAccount: string;
    date: Date;
    rate: number;
    srcPayment: number;
    targetPayment: number;
}

class ExchangeRate extends React.Component<ExchangeRateProps, ExchangeRateState> {

    constructor(props: ExchangeRateProps) {
        super(props);
        this.state = {
            xAxis: [],
            exchangeRateRecords: [],
            exchangeRateTradeForm: {
                fromAccount: props.accountList.filter(x => x.currency !== props.exchangeRateQueryCondition.currency)[0]?.id || '',
                toAccount: props.accountList.filter(x => x.currency === props.exchangeRateQueryCondition.currency)[0]?.id || '',
                date: new Date(),
                rate: 1,
                srcPayment: 0,
                targetPayment: 0
            }
        };
    }

    private getRecords = async () => {
        const { exchangeRateQueryCondition: { currency, start, end } } = this.props;
        const response = await ExchangeRateApi.getRecords(currency, start, end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        const date: string[] = records.map(x => toDateStr(x.date));
        this.setState({ xAxis: date, exchangeRateRecords: records });
    };

    private syncRecord = async () => {
        this.props.setLoading(true);
        const { exchangeRateQueryCondition: { currency } } = this.props;
        const { success: refreshSuccess, message } = await ExchangeRateApi.refresh(currency);
        if (refreshSuccess) {
            await this.getRecords();
        } else {
            Notify.error(message);
        }
        this.props.setLoading(false);
    };

    private onTradeFormChange = (formState: any, key: string): void => {
        const { exchangeRateTradeForm } = this.state;
        const newForm: any = {};
        if (['rate', 'srcPayment'].find(x => x === key)) {
            const { rate, srcPayment } = formState;
            newForm.targetPayment = srcPayment / rate;
        }
        this.setState({ exchangeRateTradeForm: { ...exchangeRateTradeForm, ...newForm } });
    };

    private onTradeBtnClick = async () => {
        const { exchangeRateTradeForm: { fromAccount, toAccount, date, rate, srcPayment, targetPayment } } = this.state;
        const response = await ExchangeRateApi.trade(fromAccount, toAccount, date, rate, srcPayment, targetPayment);
        const { success, message } = response;
        if (success) {
            await this.fetchAccountsBalance();
            Notify.success(message);
        } else {
            Notify.error(message);
        }
    };

    private fetchAccountsBalance = async (username: string = this.props.username) => {
        const response: AccountListResponse = await AccountApi.getAccounts(username);
        const { success, data: accounts, message } = response;
        if (success) {
            const { setAccountList } = this.props;
            setAccountList(accounts);
        } else {
            Notify.warning(message);
        }
    };

    private renderQueryCondition = (): JSX.Element => {
        const { exchangeRateList, exchangeRateQueryCondition, setExchangeRateQueryCondition } = this.props;
        return (
            <Card
                title='Query Condition'
            >
                <Form
                    singleRow
                    formKey='exchangeRateQueryConditionForm'
                    inputs={[
                        { key: 'currency', title: 'Currency', type: InputType.select, value: exchangeRateQueryCondition?.currency, width: 3, options: exchangeRateList.map(x => ({ key: x.currency, value: x.name })) },
                        { key: 'exchangeRateStart', title: 'Time From', type: InputType.date, value: exchangeRateQueryCondition?.start, width: 3 },
                        { key: 'exchangeRateEnd', title: 'Time To', type: InputType.date, value: exchangeRateQueryCondition?.end, width: 3 }
                    ]}
                    onChange={(formState: any, key: string) => {
                        const newCondition = { ...exchangeRateQueryCondition };
                        newCondition.currency = formState.currency;
                        newCondition.start = formState.exchangeRateStart;
                        newCondition.end = formState.exchangeRateEnd;
                        if (key === 'currency') {
                            this.setState({ exchangeRateTradeForm: { ...this.state.exchangeRateTradeForm, toAccount: '' } });
                        }
                        setExchangeRateQueryCondition(newCondition);
                    }}
                />
                <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                    <Button
                        className='mr-2'
                        variant='success'
                        outline
                        onClick={this.getRecords}
                    >
                        <SearchIcon />
                        {' Search'}
                    </Button>
                    <Button
                        variant='info'
                        outline
                        onClick={this.syncRecord}
                    >
                        <SyncAltIcon />
                        {' Sync'}
                    </Button>
                </div>
            </Card>
        );
    };

    private renderTrade = (): JSX.Element => {
        const { exchangeRateQueryCondition: { currency }, accountList } = this.props;
        const { exchangeRateTradeForm: form } = this.state;
        if (accountList.length) {
            if (!form.fromAccount) {
                form.fromAccount = accountList.filter(x => x.currency !== currency)[0]?.id;
            }
            if (!form.toAccount) {
                form.toAccount = accountList.filter(x => x.currency === currency)[0]?.id;
            }
        }
        const fromAccount = accountList.find(x => x.id === form.fromAccount);
        const toAccount = accountList.find(x => x.id === form.toAccount);
        return (
            <Card
                title='Trade'
            >
                <Form
                    singleRow
                    formKey='exchangeRateTradeForm'
                    inputs={[
                        {
                            key: 'fromAccount', title: 'Choose Account', type: InputType.select, value: form?.fromAccount, width: 3, required: true,
                            options: accountList.filter(x => x.currency !== currency).map(x => ({ key: x.id, value: x.name })),
                            note: fromAccount ? `${numberComma(fromAccount?.balance)}(${fromAccount?.currency})` : undefined
                        },
                        {
                            key: 'toAccount', title: 'Into Account', type: InputType.select, value: form?.toAccount, width: 3, required: true,
                            options: accountList.filter(x => x.currency === currency).map(x => ({ key: x.id, value: x.name })),
                            note: toAccount ? `${numberComma(toAccount?.balance)}(${toAccount?.currency})` : undefined
                        },
                        { key: 'date', title: 'Date', type: InputType.date, value: form?.date, width: 3, required: true },
                        { key: 'rate', title: 'Rate', type: InputType.numeric, value: form?.rate, width: 3, required: true },
                        { key: 'srcPayment', title: 'Spend How Much', type: InputType.numeric, value: form?.srcPayment, width: 3, required: true },
                        { key: 'targetPayment', title: 'Get How Much', type: InputType.numeric, value: form.targetPayment, width: 3, required: true }
                    ]}
                    onChange={(formState: any, key: string) => {
                        const { exchangeRateTradeForm: newForm } = this.state;
                        newForm.fromAccount = formState.fromAccount;
                        newForm.toAccount = formState.toAccount;
                        newForm.date = formState.date;
                        newForm.rate = formState.rate;
                        newForm.srcPayment = formState.srcPayment;
                        newForm.targetPayment = formState.targetPayment;
                        this.setState({ exchangeRateTradeForm: newForm }, () => this.onTradeFormChange(formState, key));
                    }}
                />
                <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                    <Button
                        variant='info'
                        outline
                        onClick={this.onTradeBtnClick}
                    >
                        <DollarSignIcon />
                        {' Trade'}
                    </Button>
                </div>
            </Card>
        );
    };

    render() {
        const { stockStyle, exchangeRateQueryCondition } = this.props;
        const { exchangeRateRecords: data } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col md={5} xs={12}>
                        {this.renderQueryCondition()}
                    </Col>
                    <Col>
                        {this.renderTrade()}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card
                            title={`${exchangeRateQueryCondition.currency} Chart`}
                        >
                            <ExchangeRateChart
                                currency={exchangeRateQueryCondition.currency}
                                stockStyle={stockStyle}
                                data={data}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        username: getAuthTokenName(state),
        stockStyle: getStockStyle(state),
        exchangeRateList: getExchangeRateList(state, false),
        exchangeRateQueryCondition: getExchangeRateQueryCondition(state),
        accountList: getAccountList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | ExchangeRateVo[] | ExchangeRateQueryCondition | boolean>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setExchangeRateList: SetExchangeRateListDispatcher(dispatch),
        setExchangeRateQueryCondition: SetExchangeRateQueryConditionDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeRate);
