import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetLoadingDispatcher, SetFundTrackingListDispatcher } from 'reducer/PropsMapper';
import { getAuthTokenName, getFundTrackingList, getStockStyle, ReduxState } from 'reducer/Selector';

import FundChart from 'component/common/chart/FundChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { MinusIcon, PlusIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import FundApi, { Fund, FundRecordVo, UserTrackingFundVo } from 'api/fund';

import { toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';

export interface FundQuerierProps {
    stockStyle: StockStyle;
    username: string;
    fundTrackingList: UserTrackingFundVo[];
    setFundTrackingList: (Funds: UserTrackingFundVo[]) => void;
    setLoading: (loading: boolean) => void;
}

export interface FundQuerierState {
    queryCondition: { code: string, name: string, start: Date, end: Date; };
    xAxis: string[];
    funds: Fund[];
    selectedFundCode: string;
    fundRecords: FundRecordVo[];
}

class FundQuerier extends React.Component<FundQuerierProps, FundQuerierState> {

    constructor(props: FundQuerierProps) {
        super(props);
        this.state = {
            queryCondition: {
                code: '',
                name: '',
                start: new Date(),
                end: new Date()
            },
            xAxis: [],
            funds: [],
            selectedFundCode: '',
            fundRecords: []
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
        const { success, data: funds, message } = await FundApi.getAll(code, name);
        if (success) {
            this.setState({ funds });
        } else {
            Notify.warning(message);
            return;
        }

        if (funds.length >= 1) {
            this.getRecords(funds[0].code);
        } else {
            this.setState({ xAxis: [], fundRecords: [] });
        }
    };

    private onFundRowClick = async (selectedRow: number) => {
        const { funds, selectedFundCode } = this.state;
        if (funds[selectedRow].code === selectedFundCode) {
            return;
        }
        this.setState({ selectedFundCode: funds[selectedRow].code });
        await this.getRecords(funds[selectedRow].code);
    };

    private getRecords = async (code: string) => {
        const { queryCondition: { start, end } } = this.state;
        const response = await FundApi.getRecords(code, start, end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        const dates: string[] = records.map(x => toDateStr(x.date));
        this.setState({ xAxis: dates, fundRecords: records });
    };

    private syncRecord = (code: string) => async () => {
        this.props.setLoading(true);
        const { success: refreshSuccess, message } = await FundApi.refresh(code);
        if (refreshSuccess) {
            const { queryCondition } = this.state;
            const { data: funds } = await FundApi.getAll(queryCondition.code, queryCondition.name);
            this.setState({ funds });
            await this.getRecords(code);
        } else {
            Notify.error(message);
        }
        this.props.setLoading(false);
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

    render() {
        const { stockStyle, fundTrackingList } = this.props;
        const { queryCondition, funds, fundRecords } = this.state;
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
                                    { key: 'code', title: 'Fund Code', type: InputType.text, value: queryCondition?.code, width: 3 },
                                    { key: 'name', title: 'Fund Name', type: InputType.text, value: queryCondition?.name, width: 3 },
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
                            title='Line Chart'
                        >
                            <FundChart
                                stockStyle={stockStyle}
                                data={fundRecords}
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
        fundTrackingList: getFundTrackingList(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserTrackingFundVo[] | boolean>>) => {
    return {
        setFundTrackingList: SetFundTrackingListDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundQuerier);
