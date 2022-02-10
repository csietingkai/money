import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetLoadingDispatcher, SetFundTrackingListDispatcher, SetFundQueryConditionDispatcher, SetFundOwnListDispatcher } from 'reducer/PropsMapper';
import { getAuthTokenName, getFundQueryCondition, getFundTrackingList, getStockStyle, ReduxState } from 'reducer/Selector';

import FundChart from 'component/common/chart/FundChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { MinusIcon, PlusIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import FundApi, { FundRecordVo, FundVo, UserFundListResponse, UserFundVo, UserTrackingFundVo } from 'api/fund';

import { toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';

export interface FundQuerierProps {
    stockStyle: StockStyle;
    username: string;
    fundTrackingList: UserTrackingFundVo[];
    fundQueryCondition: FundQueryCondition;
    setFundOwnList: (ownList: UserFundVo[]) => void;
    setFundTrackingList: (trackingList: UserTrackingFundVo[]) => void;
    setFundQueryCondition: (condition: FundQueryCondition) => void;
    setLoading: (loading: boolean) => void;
}

export interface FundQuerierState {
    xAxis: string[];
    funds: FundVo[];
    selectedFundCode: string;
    fundRecords: FundRecordVo[];
}

export interface FundQueryCondition {
    code: string;
    name: string;
    start: Date;
    end: Date;
}

class FundQuerier extends React.Component<FundQuerierProps, FundQuerierState> {

    constructor(props: FundQuerierProps) {
        super(props);
        this.state = {
            xAxis: [],
            funds: [],
            selectedFundCode: '',
            fundRecords: []
        };
    }

    private onQueryBtnClick = async () => {
        const { fundQueryCondition: { code, name, start, end } } = this.props;
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
        const { fundQueryCondition: { start, end } } = this.props;
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

    private getFundOwnList = async (username: string = this.props.username) => {
        const response: UserFundListResponse = await FundApi.getOwn(username);
        const { success, data: ownList, message } = response;
        if (success) {
            const { setFundOwnList } = this.props;
            setFundOwnList(ownList);
        } else {
            Notify.warning(message);
        }
    };

    private syncRecord = (code: string) => async () => {
        this.props.setLoading(true);
        const { success: refreshSuccess, message } = await FundApi.refresh(code);
        if (refreshSuccess) {
            const { fundQueryCondition: { code: queryCode, name: queryName } } = this.props;
            const { data: funds } = await FundApi.getAll(queryCode, queryName);
            await this.getRecords(code);
            await this.getFundOwnList();
            this.setState({ funds });
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
        const { stockStyle, fundTrackingList, fundQueryCondition, setFundQueryCondition } = this.props;
        const { funds, fundRecords } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
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
                            title='Fund Chart'
                        >
                            <FundChart
                                stockStyle={stockStyle}
                                data={fundRecords}
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
        fundTrackingList: getFundTrackingList(state),
        fundQueryCondition: getFundQueryCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserFundVo[] | UserTrackingFundVo[] | FundQueryCondition | boolean>>) => {
    return {
        setFundOwnList: SetFundOwnListDispatcher(dispatch),
        setFundTrackingList: SetFundTrackingListDispatcher(dispatch),
        setFundQueryCondition: SetFundQueryConditionDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundQuerier);
