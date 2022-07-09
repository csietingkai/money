import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetAccountListDispatcher, SetLoadingDispatcher, SetStockOwnListDispatcher, SetStockPredictResultDispatcher, SetStockQueryConditionDispatcher, SetStockTrackingListDispatcher } from 'reducer/PropsMapper';
import { getAccountList, getAuthTokenName, getPredictDays, getStockOwnList, getStockPredictResult, getStockQueryCondition, getStockStyle, getStockTrackingList, ReduxState } from 'reducer/Selector';

import StockChart from 'component/common/chart/StockChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { DollarSignIcon, MinusIcon, PlusIcon, RobotIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import AccountApi, { Account, AccountListResponse } from 'api/account';
import StockApi, { Stock, StockRecordVo, UserStockListResponse, UserStockVo, UserTrackingStockVo } from 'api/stock';

import { numberComma, toDateStr } from 'util/AppUtil';
import { DealType, InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action, PredictResultVo } from 'util/Interface';

export interface StockViewProps {
    stockStyle: StockStyle;
    predictDays: number;
    username: string;
    accounts: Account[];
    stockOwnList: UserStockVo[];
    stockTrackingList: UserTrackingStockVo[];
    stockQueryCondition: StockQueryCondition;
    stockPredictResult: PredictResultVo[];
    setAccountList: (accounts: Account[]) => void;
    setStockOwnList: (ownList: UserStockVo[]) => void;
    setStockTrackingList: (stocks: UserTrackingStockVo[]) => void;
    setStockQueryCondition: (condition: StockQueryCondition) => void;
    setStockPredictResult: (result: PredictResultVo[]) => void;
    setLoading: (loading: boolean) => void;
}

export interface StockViewState {
    stocks: Stock[];
    selectedStockCode: string;
    stockRecords: StockRecordVo[];
    stockTradeForm: StockTradeForm;
}

export interface StockQueryCondition {
    code: string;
    name: string;
    start: Date;
    end: Date;
}

export interface StockTradeForm {
    usedAccount: string;
    dealType: DealType;
    date: Date;
    price: number;
    share: number;
    fee: number;
    tax: number;
    total: number;
}

class StockView extends React.Component<StockViewProps, StockViewState> {

    constructor(props: StockViewProps) {
        super(props);
        this.state = {
            stocks: [],
            selectedStockCode: '',
            stockRecords: [],
            stockTradeForm: {
                usedAccount: props.accounts[0]?.id || '',
                dealType: DealType.BUY,
                date: new Date(),
                price: 0,
                share: 0,
                fee: 0,
                tax: 0,
                total: 0
            },
        };
    }

    private onQueryBtnClick = async () => {
        const { stockQueryCondition: { code, name, start, end }, setStockPredictResult } = this.props;
        if (!code && !name) {
            Notify.warning('Please fill code or name at least.');
            return;
        }
        if (!start || !end) {
            Notify.warning('Please fill start and end time.');
            return;
        }
        const { success, data: stocks, message } = await StockApi.getAll(code, name);
        if (success) {
            this.setState({ stocks });
        } else {
            Notify.warning(message);
            return;
        }

        if (stocks.length == 1) {
            this.setState({ selectedStockCode: stocks[0].code }, () => this.getRecords(stocks[0].code));
        } else if (stocks.length > 1) {
            this.getRecords(stocks[0].code);
        } else {
            this.setState({ stockRecords: [] });
        }
        setStockPredictResult([]);
    };

    private onStockRowClick = async (selectedRow: number) => {
        const { setStockPredictResult } = this.props;
        const { stocks, selectedStockCode } = this.state;
        if (stocks[selectedRow].code === selectedStockCode) {
            return;
        }
        this.setState({ selectedStockCode: stocks[selectedRow].code });
        await this.getRecords(stocks[selectedRow].code);
        setStockPredictResult([]);
    };

    private getRecords = async (code: string) => {
        const { stockQueryCondition: { start, end } } = this.props;
        const response = await StockApi.getRecords(code, start, end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        this.setState({ stockRecords: records });
    };

    private syncRecord = (code: string) => async () => {
        const { setLoading, setStockPredictResult } = this.props;
        setLoading(true);
        const { success: refreshSuccess, message } = await StockApi.refresh(code);
        if (refreshSuccess) {
            const { stockQueryCondition: { code: queryCode, name: queryName } } = this.props;
            const { data: stocks } = await StockApi.getAll(queryCode, queryName);
            await this.getRecords(code);
            this.setState({ stocks });
            setStockPredictResult([]);
        } else {
            Notify.error(message);
        }
        setLoading(false);
    };

    private track = (code: string) => async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();

        const { username } = this.props;
        const { success, message } = await StockApi.track(username, code);
        if (success) {
            await this.syncTrackingList();
            Notify.success(message);
        } else {
            Notify.warning(message);
        }
    };

    private untrack = (code: string) => async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();

        const { username } = this.props;
        const { success, message } = await StockApi.untrack(username, code);
        if (success) {
            await this.syncTrackingList();
            Notify.success(message);
        } else {
            Notify.warning(message);
        }
    };

    private syncTrackingList = async () => {
        const { username, setStockTrackingList } = this.props;
        const { data: trackingList } = await StockApi.getTrackingList(username);
        setStockTrackingList(trackingList);
    };

    private predict = (code: string) => async () => {
        const { predictDays, setLoading, setStockPredictResult } = this.props;
        setLoading(true);
        const { data } = await StockApi.predict(code, predictDays);
        setStockPredictResult(data);
        setLoading(false);
    };

    private onTradeFormChange = async (formState: any, key: string) => {
        const { stockTradeForm } = this.state;
        const { dealType, price, share } = formState;

        stockTradeForm.usedAccount = formState.usedAccount;
        stockTradeForm.dealType = formState.dealType;
        stockTradeForm.date = formState.date;
        stockTradeForm.price = formState.price;
        stockTradeForm.share = formState.share;
        stockTradeForm.fee = formState.fee;
        stockTradeForm.tax = formState.tax;
        stockTradeForm.total = formState.total;

        switch (key) {
            case 'dealType':
                if (dealType === DealType.BUY) {
                    stockTradeForm.tax = 0;
                }
            case 'price':
            case 'share':
                const { data } = await StockApi.precalc(formState.dealType, formState.share, formState.price);
                stockTradeForm.fee = data.fee;
                stockTradeForm.tax = data.tax;
            case 'fee':
            case 'tax':
                stockTradeForm.total = price * share;
                if (dealType === DealType.BUY) {
                    stockTradeForm.total += stockTradeForm.fee;
                } else if (dealType === DealType.SELL) {
                    stockTradeForm.total -= stockTradeForm.fee;
                    stockTradeForm.total -= stockTradeForm.tax;
                }
                break;
            default:
                break;
        }
        this.setState({ stockTradeForm });
    };

    private onTradeBtnClick = async () => {
        const { username, stockOwnList } = this.props;
        const { selectedStockCode, stockTradeForm: { usedAccount, dealType, date, share, price, fee, tax, total } } = this.state;
        if (!selectedStockCode) {
            Notify.warning('Please fill correct code.');
            return;
        }
        let success, message;
        if (dealType === DealType.BUY) {
            const response = await StockApi.buy(username, usedAccount, selectedStockCode, date, share, price, fee, total);
            success = response.success;
            message = response.message;
        } else if (dealType === DealType.SELL) {
            const response = await StockApi.sell(username, usedAccount, selectedStockCode, date, share, price, fee, tax, total);
            success = response.success;
            message = response.message;
        }
        if (success) {
            Notify.success(message);
            await this.fetchAccounts(username);
            if (stockOwnList.find(x => x.stockCode === selectedStockCode)) {
                await this.fetchStockOwnList(username);
            }
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

    private renderQueryCondition = (): JSX.Element => {
        const { stockQueryCondition, setStockQueryCondition } = this.props;
        return (
            <Card
                title='Query Condition'
            >
                <Form
                    singleRow
                    inputs={[
                        { key: 'stockCode', title: 'Stock Code', type: InputType.text, value: stockQueryCondition?.code, width: 3 },
                        { key: 'stockName', title: 'Stock Name', type: InputType.text, value: stockQueryCondition?.name, width: 3 },
                        { key: 'stockStart', title: 'Time From', type: InputType.date, value: stockQueryCondition?.start, width: 3 },
                        { key: 'stockEnd', title: 'Time To', type: InputType.date, value: stockQueryCondition?.end, width: 3 }
                    ]}
                    onChange={(formState: any) => {
                        const newCondition = { ...stockQueryCondition };
                        newCondition.code = formState.stockCode;
                        newCondition.name = formState.stockName;
                        newCondition.start = formState.stockStart;
                        newCondition.end = formState.stockEnd;
                        setStockQueryCondition(newCondition);
                    }}
                />
                <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                    <Button
                        variant='success'
                        outline
                        onClick={this.onQueryBtnClick}
                    >
                        <SearchIcon />
                        {' Search'}
                    </Button>
                </div>
            </Card>
        );
    };

    private renderQueryResult = (): JSX.Element => {
        const { stockTrackingList } = this.props;
        const { stocks } = this.state;
        return (
            <Card
                title='Stock Info'
            >
                <Table
                    id='stock-updater-table'
                    header={['code', 'name', 'marketType', 'industryType', 'updateTime', 'functions']}
                    data={stocks}
                    countPerPage={3}
                    onRowClick={this.onStockRowClick}
                    columnConverter={(header: string, rowData: any) => {
                        if (['offeringDate', 'updateTime'].findIndex(x => x === header) >= 0) {
                            return <>{toDateStr(rowData[header])}</>;
                        } else if (header === 'functions') {
                            const isTracking: boolean = stockTrackingList.findIndex(x => x.stockCode === rowData.code) >= 0;
                            return (
                                <>
                                    <Button size='sm' variant='info' outline onClick={this.syncRecord(rowData.code)}><SyncAltIcon /></Button>
                                    {!isTracking && <Button size='sm' variant='info' outline onClick={this.track(rowData.code)}><PlusIcon /></Button>}
                                    {isTracking && <Button size='sm' variant='info' outline onClick={this.untrack(rowData.code)}><MinusIcon /></Button>}
                                    <Button size='sm' variant='info' outline onClick={this.predict(rowData.code)}><RobotIcon /></Button>
                                </>
                            );
                        }
                        return rowData[header];
                    }}
                />
            </Card>
        );
    };

    private renderTradeView = (): JSX.Element => {
        let { accounts } = this.props;
        const { selectedStockCode, stocks, stockTradeForm } = this.state;

        if (selectedStockCode) {
            const selectedStock = stocks.find(x => x.code === selectedStockCode);
            accounts = accounts.filter(x => x.currency === selectedStock.currency);
            if (!stockTradeForm.usedAccount) {
                stockTradeForm.usedAccount = accounts[0]?.id;
            }
        } else {
            accounts = [];
        }
        const usedAccount = accounts.find(x => x.id === stockTradeForm.usedAccount);

        return (
            <Card
                title={`${stockTradeForm?.dealType === DealType.BUY ? 'Buy' : ''}${stockTradeForm?.dealType === DealType.SELL ? 'Sell' : ''} Stock`}
            >
                <Form
                    singleRow
                    inputs={[
                        {
                            key: 'usedAccount', title: 'Choose Account', type: InputType.select, value: stockTradeForm?.usedAccount, width: 3, required: true,
                            options: accounts.map(x => ({ key: x.id, value: x.name })),
                            note: usedAccount ? `${numberComma(usedAccount?.balance)}(${usedAccount?.currency})` : undefined
                        },
                        { key: 'dealType', title: 'Trade Type', type: InputType.radio, value: stockTradeForm?.dealType, width: 3, options: [DealType.BUY, DealType.SELL].map(x => ({ key: x, value: x })) },
                        { key: 'date', title: 'Buy/Sell At', type: InputType.date, value: stockTradeForm?.date, width: 3, required: true },
                        { key: 'price', title: 'Price', type: InputType.numeric, value: stockTradeForm?.price, width: 3, required: true },
                        { key: 'share', title: 'Share', type: InputType.numeric, value: stockTradeForm?.share, width: 3, required: true },
                        { key: 'fee', title: 'Fee', type: InputType.numeric, value: stockTradeForm?.fee, width: 3 },
                        { key: 'tax', title: 'Tax', type: InputType.numeric, value: stockTradeForm?.tax, width: 3, disabled: stockTradeForm?.dealType === DealType.BUY },
                        { key: 'total', title: 'Total', type: InputType.numeric, value: stockTradeForm?.total, width: 3 }
                    ]}
                    onChange={this.onTradeFormChange}
                />
                <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                    <Button
                        variant='info'
                        outline
                        onClick={this.onTradeBtnClick}
                    >
                        <DollarSignIcon />
                        {stockTradeForm.dealType === DealType.BUY && ' BUY'}
                        {stockTradeForm.dealType === DealType.SELL && ' SELL'}
                    </Button>
                </div>
            </Card>
        );
    };

    render() {
        const { stockStyle, stockPredictResult } = this.props;
        const { stockRecords } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        {this.renderQueryCondition()}
                        {this.renderQueryResult()}
                    </Col>
                    <Col>
                        {this.renderTradeView()}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card
                            title='Candle Chart'
                        >
                            <StockChart
                                stockStyle={stockStyle}
                                data={stockRecords}
                                predict={stockPredictResult}
                                showInfo={true}
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
        stockStyle: getStockStyle(state),
        predictDays: getPredictDays(state),
        username: getAuthTokenName(state),
        accounts: getAccountList(state),
        stockOwnList: getStockOwnList(state),
        stockTrackingList: getStockTrackingList(state),
        stockQueryCondition: getStockQueryCondition(state),
        stockPredictResult: getStockPredictResult(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | UserStockVo[] | UserTrackingStockVo[] | StockQueryCondition | PredictResultVo[] | boolean>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setStockOwnList: SetStockOwnListDispatcher(dispatch),
        setStockTrackingList: SetStockTrackingListDispatcher(dispatch),
        setStockQueryCondition: SetStockQueryConditionDispatcher(dispatch),
        setStockPredictResult: SetStockPredictResultDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockView);
