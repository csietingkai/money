import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetLoadingDispatcher, SetStockPredictResultDispatcher, SetStockQueryConditionDispatcher, SetStockTrackingListDispatcher } from 'reducer/PropsMapper';
import { getAuthTokenName, getStockPredictResult, getStockQueryCondition, getStockStyle, getStockTrackingList, ReduxState } from 'reducer/Selector';

import StockChart from 'component/common/chart/StockChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { MinusIcon, PlusIcon, RobotIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import StockApi, { Stock, StockRecordVo, UserStockVo, UserTrackingStockVo } from 'api/stock';

import { toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action, PredictResultVo } from 'util/Interface';

export interface StockQuerierProps {
    stockStyle: StockStyle;
    username: string;
    stockTrackingList: UserTrackingStockVo[];
    stockQueryCondition: StockQueryCondition;
    stockPredictResult: PredictResultVo[];
    setStockTrackingList: (stocks: UserTrackingStockVo[]) => void;
    setStockQueryCondition: (condition: StockQueryCondition) => void;
    setStockPredictResult: (result: PredictResultVo[]) => void;
    setLoading: (loading: boolean) => void;
}

export interface StockQuerierState {
    stocks: Stock[];
    selectedStockCode: string;
    stockRecords: StockRecordVo[];
}

export interface StockQueryCondition {
    code: string;
    name: string;
    start: Date;
    end: Date;
}

class StockQuerier extends React.Component<StockQuerierProps, StockQuerierState> {

    constructor(props: StockQuerierProps) {
        super(props);
        this.state = {
            stocks: [],
            selectedStockCode: '',
            stockRecords: []
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

        if (stocks.length >= 1) {
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
        const { setLoading, setStockPredictResult } = this.props;
        setLoading(true);
        const { data } = await StockApi.predict(code);
        setStockPredictResult(data);
        setLoading(false);
    };

    render() {
        const { stockStyle, stockTrackingList, stockQueryCondition, stockPredictResult, setStockQueryCondition } = this.props;
        const { stocks, stockRecords } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
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
                    </Col>
                    <Col>
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
        username: getAuthTokenName(state),
        stockTrackingList: getStockTrackingList(state),
        stockQueryCondition: getStockQueryCondition(state),
        stockPredictResult: getStockPredictResult(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserStockVo[] | UserTrackingStockVo[] | StockQueryCondition | PredictResultVo[] | boolean>>) => {
    return {
        setStockTrackingList: SetStockTrackingListDispatcher(dispatch),
        setStockQueryCondition: SetStockQueryConditionDispatcher(dispatch),
        setStockPredictResult: SetStockPredictResultDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockQuerier);
