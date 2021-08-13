import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetLoadingDispatcher, SetStockTrackingListDispatcher } from 'reducer/PropsMapper';
import { getAuthTokenName, getStockStyle, getStockTrackingList, ReduxState } from 'reducer/Selector';

import CandleStickChart from 'component/common/chart/CandleStockChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { MinusIcon, PlusIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import StockApi, { Stock, StockRecord, UserTrackingStockVo } from 'api/stock';

import { toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';

export interface StockQuerierProps {
    stockStyle: StockStyle;
    username: string;
    stockTrackingList: UserTrackingStockVo[];
    setStockTrackingList: (stocks: UserTrackingStockVo[]) => void;
    setLoading: (loading: boolean) => void;
}

export interface StockQuerierState {
    queryCondition: { code: string, name: string, start: Date, end: Date; };
    xAxis: string[];
    stocks: Stock[];
    selectedStockCode: string;
    stockRecords: StockRecord[];
}

class StockQuerier extends React.Component<StockQuerierProps, StockQuerierState> {

    constructor(props: StockQuerierProps) {
        super(props);
        this.state = {
            queryCondition: {
                code: '',
                name: '',
                start: new Date(),
                end: new Date()
            },
            xAxis: [],
            stocks: [],
            selectedStockCode: '',
            stockRecords: []
        };
    }

    private onQueryBtnClick = async () => {
        const { queryCondition } = this.state;
        const { code, name, start, end } = queryCondition;
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
            this.setState({ xAxis: [], stockRecords: [] });
        }
    };

    private onStockRowClick = async (selectedRow: number) => {
        const { stocks, selectedStockCode } = this.state;
        if (stocks[selectedRow].code === selectedStockCode) {
            return;
        }
        this.setState({ selectedStockCode: stocks[selectedRow].code });
        await this.getRecords(stocks[selectedRow].code);
    };

    private getRecords = async (code: string) => {
        const { queryCondition: { start, end } } = this.state;
        const response = await StockApi.getRecords(code, start, end);
        const { success, message } = response;
        let { data: records } = response;
        console.log(records);
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        const dealDates: string[] = records.map(x => toDateStr(x.dealDate));
        this.setState({ xAxis: dealDates, stockRecords: records });
    };

    private syncRecord = (code: string) => async () => {
        this.props.setLoading(true);
        const { success: refreshSuccess, message } = await StockApi.refresh(code);
        if (refreshSuccess) {
            const { queryCondition } = this.state;
            const { data: stocks } = await StockApi.getAll(queryCondition.code, queryCondition.name);
            this.setState({ stocks });
            await this.getRecords(code);
        } else {
            Notify.error(message);
        }
        this.props.setLoading(false);
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

    render() {
        const { stockStyle, stockTrackingList } = this.props;
        const { queryCondition, stocks, stockRecords } = this.state;
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
                                    { key: 'code', title: 'Stock Code', type: InputType.text, value: queryCondition?.code, width: 3 },
                                    { key: 'name', title: 'Stock Name', type: InputType.text, value: queryCondition?.name, width: 3 },
                                    { key: 'start', title: 'Time From', type: InputType.date, value: queryCondition?.start, width: 3 },
                                    { key: 'end', title: 'Time To', type: InputType.date, value: queryCondition?.end, width: 3 }
                                ]}
                                onChange={(formState: any) => {
                                    queryCondition.code = formState.code;
                                    queryCondition.name = formState.name;
                                    queryCondition.start = formState.start;
                                    queryCondition.end = formState.end;
                                    this.setState({ queryCondition });
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
                            <CandleStickChart
                                stockStyle={stockStyle}
                                data={stockRecords}
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
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserTrackingStockVo[] | boolean>>) => {
    return {
        setStockTrackingList: SetStockTrackingListDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockQuerier);
