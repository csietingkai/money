import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetLoadingDispatcher, SetFundTrackingListDispatcher, SetFundQueryConditionDispatcher, SetFundPredictResultDispatcher, SetAccountListDispatcher, SetFundOwnListDispatcher } from 'reducer/PropsMapper';
import { getAccountList, getAuthTokenName, getFundList, getFundOwnList, getFundPredictResult, getFundQueryCondition, getFundTrackingList, getPredictDays, getStockStyle, ReduxState } from 'reducer/Selector';

import FundChart from 'component/common/chart/FundChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form, { Input } from 'component/common/Form';
import { DollarSignIcon, MinusIcon, PlusIcon, RobotIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import AccountApi, { Account, AccountListResponse } from 'api/account';
import FundApi, { FundRecordVo, FundVo, UserFundListResponse, UserFundVo, UserTrackingFundVo } from 'api/fund';

import { numberComma, reverseNumberComma, toDateStr } from 'util/AppUtil';
import { DealType, InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action, PredictResultVo, Record } from 'util/Interface';

export interface FundQuerierProps {
    stockStyle: StockStyle;
    predictDays: number;
    username: string;
    accounts: Account[];
    funds: FundVo[];
    fundOwnList: UserFundVo[];
    fundTrackingList: UserTrackingFundVo[];
    fundQueryCondition: FundQueryCondition;
    fundPredictResult: PredictResultVo[];
    setAccountList: (accounts: Account[]) => void;
    setFundOwnList: (ownList: UserFundVo[]) => void;
    setFundTrackingList: (trackingList: UserTrackingFundVo[]) => void;
    setFundQueryCondition: (condition: FundQueryCondition) => void;
    setFundPredictResult: (result: PredictResultVo[]) => void;
    setLoading: (loading: boolean) => void;
}

export interface FundQuerierState {
    funds: FundVo[];
    selectedFundCode: string;
    fundRecords: FundRecordVo[];
    fundTradeForm: FundTradeForm;
}

export interface FundQueryCondition {
    code: string;
    name: string;
    start: Date;
    end: Date;
}

export interface FundTradeForm {
    usedAccount: string;
    dealType: DealType;
    date: Date;
    rate: number;
    payment: number;
    price: number;
    fee: number;
    share: number;
    total: string;
}

class FundQuerier extends React.Component<FundQuerierProps, FundQuerierState> {

    constructor(props: FundQuerierProps) {
        super(props);
        this.state = {
            funds: [],
            selectedFundCode: '',
            fundRecords: [],
            fundTradeForm: {
                usedAccount: props.accounts[0]?.id || '',
                dealType: DealType.BUY,
                date: new Date(),
                rate: 1,
                payment: 0,
                price: 0,
                fee: 0,
                share: 0,
                total: '0'
            }
        };
    }

    private onQueryBtnClick = async () => {
        const { fundQueryCondition: { code, name, start, end }, setFundPredictResult } = this.props;
        if (!code && !name) {
            Notify.warning('Please fill code or name at least.');
            return;
        }
        if (!start || !end) {
            Notify.warning('Please fill start and end time.');
            return;
        }
        const { success, data: funds, message } = await FundApi.getAll(code, name);
        if (success) {
            this.setState({ funds });
        } else {
            Notify.warning(message);
            return;
        }

        if (funds.length === 1) {
            this.setState({ selectedFundCode: funds[0].code }, () => this.getRecords(funds[0].code));
        } else if (funds.length > 1) {
            this.getRecords(funds[0].code);
        } else {
            this.setState({ fundRecords: [] });
        }
        setFundPredictResult([]);
    };

    private onFundRowClick = async (selectedRow: number) => {
        const { setFundPredictResult } = this.props;
        const { funds, selectedFundCode } = this.state;
        if (funds[selectedRow].code === selectedFundCode) {
            return;
        }
        this.setState({ selectedFundCode: funds[selectedRow].code });
        await this.getRecords(funds[selectedRow].code);
        setFundPredictResult([]);
    };

    private getRecords = async (code: string) => {
        const { fundQueryCondition: { start, end } } = this.props;
        const response = await FundApi.getRecords(code, start, end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        this.setState({ fundRecords: records });
    };

    private syncRecord = (code: string) => async () => {
        const { setLoading, setFundPredictResult } = this.props;
        setLoading(true);
        const { success: refreshSuccess, message } = await FundApi.refresh(code);
        if (refreshSuccess) {
            const { fundQueryCondition: { code: queryCode, name: queryName } } = this.props;
            const { data: funds } = await FundApi.getAll(queryCode, queryName);
            await this.getRecords(code);
            this.setState({ funds });
            setFundPredictResult([]);
        } else {
            Notify.error(message);
        }
        setLoading(false);
    };

    private track = (code: string) => async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();

        const { username } = this.props;
        const { success, message } = await FundApi.track(username, code);
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
        const { success, message } = await FundApi.untrack(username, code);
        if (success) {
            await this.syncTrackingList();
            Notify.success(message);
        } else {
            Notify.warning(message);
        }
    };

    private syncTrackingList = async () => {
        const { username, setFundTrackingList } = this.props;
        const { data: trackingList } = await FundApi.getTrackingList(username);
        setFundTrackingList(trackingList);
    };

    private predict = (code: string) => async () => {
        const { predictDays, setLoading, setFundPredictResult } = this.props;
        setLoading(true);
        const { data } = await FundApi.predict(code, predictDays);
        setFundPredictResult(data);
        setLoading(false);
    };

    private onBuyTradeFormChange = async (formState: any, key: string) => {
        const { fundTradeForm } = this.state;
        const { rate, payment, price, fee } = formState;

        fundTradeForm.usedAccount = formState.usedAccount;
        fundTradeForm.dealType = formState.dealType;
        fundTradeForm.date = formState.date;
        fundTradeForm.rate = formState.rate;
        fundTradeForm.payment = formState.payment;
        fundTradeForm.price = formState.price;
        fundTradeForm.share = formState.share;
        fundTradeForm.fee = formState.fee;

        switch (key) {
            case 'rate':
            case 'price':
                if (price && rate) {
                    fundTradeForm.share = parseFloat((payment / (price * rate)).toFixed(3));
                }
                break;
            case 'payment':
            case 'fee':
                fundTradeForm.total = numberComma(payment + fee);
                break;
            default:
                break;
        }
        this.setState({ fundTradeForm });
    };

    private onSellTradeFormChange = (formState: any, key: string) => {
        const { fundTradeForm } = this.state;
        const { price, share, rate } = formState;

        fundTradeForm.usedAccount = formState.usedAccount;
        fundTradeForm.dealType = formState.dealType;
        fundTradeForm.date = formState.date;
        fundTradeForm.rate = formState.rate;
        fundTradeForm.price = formState.price;
        fundTradeForm.share = formState.share;
        fundTradeForm.total = formState.total;

        switch (key) {
            case 'price':
            case 'share':
            case 'rate':
                fundTradeForm.total = numberComma(parseFloat((price * share * rate).toFixed(3)));
                break;
            default:
                break;
        }
        this.setState({ fundTradeForm });
    };

    private onTradeBtnClick = async () => {
        const { username, fundOwnList } = this.props;
        const { selectedFundCode, fundTradeForm: { usedAccount, dealType, date, payment, price, rate, fee, share, total } } = this.state;
        if (!selectedFundCode) {
            Notify.warning('Please fill correct code.');
            return;
        }
        let success, message;
        if (dealType === DealType.BUY) {
            const response = await FundApi.buy(username, usedAccount, selectedFundCode, date, share, price, rate, payment, fee);
            success = response.success;
            message = response.message;
        } else if (dealType === DealType.SELL) {
            const response = await FundApi.sell(username, usedAccount, selectedFundCode, date, share, price, rate, reverseNumberComma(total));
            success = response.success;
            message = response.message;
        }
        if (success) {
            Notify.success(message);
            await this.fetchAccounts(username);
            if (fundOwnList.find(x => x.fundCode === selectedFundCode)) {
                await this.fetchFundOwnList(username);
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

    private renderQueryCondition = (): JSX.Element => {
        const { fundQueryCondition, setFundQueryCondition } = this.props;
        const { funds, fundRecords } = this.state;
        return (
            <Card
                title='Query Condition'
            >
                <Form
                    singleRow
                    formKey='fundQueryConditionForm'
                    inputs={[
                        { key: 'fundCode', title: 'Fund Code', type: InputType.text, value: fundQueryCondition?.code, width: 3 },
                        { key: 'fundName', title: 'Fund Name', type: InputType.text, value: fundQueryCondition?.name, width: 3 },
                        { key: 'fundStart', title: 'Time From', type: InputType.date, value: fundQueryCondition?.start, width: 3 },
                        { key: 'fundEnd', title: 'Time To', type: InputType.date, value: fundQueryCondition?.end, width: 3 }
                    ]}
                    onChange={(formState: any) => {
                        const newCondition = { ...fundQueryCondition };
                        newCondition.code = formState.fundCode;
                        newCondition.name = formState.fundName;
                        newCondition.start = formState.fundStart;
                        newCondition.end = formState.fundEnd;
                        setFundQueryCondition(newCondition);
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
        const { fundTrackingList } = this.props;
        const { funds } = this.state;
        return (
            <Card
                title='Fund Info'
            >
                <Table
                    id='fund-updater-table'
                    header={['code', 'name', 'updateTime', 'functions']}
                    data={funds}
                    countPerPage={3}
                    onRowClick={this.onFundRowClick}
                    columnConverter={(header: string, rowData: any) => {
                        if (['offeringDate', 'updateTime'].findIndex(x => x === header) >= 0) {
                            return <>{toDateStr(rowData[header])}</>;
                        } else if (header === 'functions') {
                            const isTracking: boolean = fundTrackingList.findIndex(x => x.fundCode === rowData.code) >= 0;
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
        const { accounts } = this.props;
        const { fundTradeForm } = this.state;

        if (accounts.length && !fundTradeForm.usedAccount) {
            fundTradeForm.usedAccount = accounts[0]?.id;
        }
        const usedAccount = accounts.find(x => x.id === fundTradeForm.usedAccount);

        const { dealType } = fundTradeForm;
        const formInputs: Input[] = [
            {
                key: 'usedAccount', title: 'Choose Account', type: InputType.select, value: fundTradeForm.usedAccount, width: 3, required: true,
                options: accounts.map(x => ({ key: x.id, value: x.name })),
                note: usedAccount ? `${numberComma(usedAccount?.balance)}(${usedAccount?.currency})` : undefined
            },
            { key: 'dealType', title: 'Trade Type', type: InputType.radio, value: fundTradeForm.dealType, width: 3, options: [DealType.BUY, DealType.SELL].map(x => ({ key: x, value: x })) },
            { key: 'date', title: 'Buy/Sell At', type: InputType.date, value: fundTradeForm.date, width: 3, required: true },
            { key: 'rate', title: 'Exchange Rate', type: InputType.numeric, value: fundTradeForm.rate, width: 3, required: true }
        ];
        if (dealType === DealType.BUY) {
            formInputs.push({ key: 'payment', title: 'Spend How Much', type: InputType.numeric, value: fundTradeForm.payment, width: 3, required: true });
            formInputs.push({ key: 'price', title: 'Price', type: InputType.numeric, value: fundTradeForm.price, width: 3, required: true });
            formInputs.push({ key: 'share', title: 'Share', type: InputType.numeric, value: fundTradeForm.share, width: 3, required: true });
            formInputs.push({ key: 'fee', title: 'Fee', type: InputType.numeric, value: fundTradeForm.fee, width: 3, required: true });
            formInputs.push({ key: 'total', title: 'Total', type: InputType.text, value: fundTradeForm.total, width: 3, disabled: true });
        } else if (dealType === DealType.SELL) {
            formInputs.push({ key: 'price', title: 'Price', type: InputType.numeric, value: fundTradeForm.price, width: 3, required: true });
            formInputs.push({ key: 'share', title: 'Share', type: InputType.numeric, value: fundTradeForm.share, width: 3, required: true });
            formInputs.push({ key: 'total', title: 'Total', type: InputType.text, value: fundTradeForm.total, width: 3 });
        }

        return (
            <Card
                title={`${fundTradeForm?.dealType === DealType.BUY ? 'Buy' : ''}${fundTradeForm?.dealType === DealType.SELL ? 'Sell' : ''} Fund`}
            >
                {
                    fundTradeForm.dealType === DealType.BUY &&
                    <Form
                        singleRow
                        inputs={formInputs}
                        onChange={this.onBuyTradeFormChange}
                    />
                }
                {
                    fundTradeForm.dealType === DealType.SELL &&
                    <Form
                        singleRow
                        inputs={formInputs}
                        onChange={this.onSellTradeFormChange}
                    />
                }
                <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                    <Button
                        variant='info'
                        outline
                        onClick={this.onTradeBtnClick}
                    >
                        <DollarSignIcon />
                        {fundTradeForm.dealType === DealType.BUY && ' BUY'}
                        {fundTradeForm.dealType === DealType.SELL && ' SELL'}
                    </Button>
                </div>
            </Card>
        );
    };

    render() {
        const { stockStyle, fundPredictResult } = this.props;
        const { fundRecords } = this.state;
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
                            title='Fund Chart'
                        >
                            <FundChart
                                stockStyle={stockStyle}
                                data={fundRecords}
                                predict={fundPredictResult}
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
        funds: getFundList(state),
        fundOwnList: getFundOwnList(state),
        fundTrackingList: getFundTrackingList(state),
        fundQueryCondition: getFundQueryCondition(state),
        fundPredictResult: getFundPredictResult(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | UserFundVo[] | UserTrackingFundVo[] | FundQueryCondition | PredictResultVo[] | boolean>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setFundOwnList: SetFundOwnListDispatcher(dispatch),
        setFundTrackingList: SetFundTrackingListDispatcher(dispatch),
        setFundQueryCondition: SetFundQueryConditionDispatcher(dispatch),
        setFundPredictResult: SetFundPredictResultDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundQuerier);
