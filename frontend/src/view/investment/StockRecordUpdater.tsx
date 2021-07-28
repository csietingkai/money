import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { MinusIcon, PlusIcon, SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Table from 'component/common/Table';

import { getAuthTokenName, getStockTrackingList, ReduxState } from 'reducer/Selector';

import StockApi, { StockVo, UserTrackingStockVo } from 'api/stock';

import { toDateStr } from 'util/AppUtil';
import { InputType } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';
import { Dispatch } from 'react';
import { SetStockTrackingListDispatcher } from 'reducer/PropsMapper';

export interface StockRecordUpdaterProps {
    username: string;
    stockTrackingList: UserTrackingStockVo[];
    setStockTrackingList: (stocks: UserTrackingStockVo[]) => void;
}

export interface StockRecordUpdaterState {
    queryCondition: { code: string, name: string; };
    stocks: StockVo[];
}

class StockRecordUpdater extends React.Component<StockRecordUpdaterProps, StockRecordUpdaterState> {

    constructor(props: StockRecordUpdaterProps) {
        super(props);
        this.state = {
            queryCondition: { code: '', name: '' },
            stocks: []
        };
    }

    private onQueryBtnClick = async () => {
        const { queryCondition } = this.state;
        const { success, data: stocks, message } = await StockApi.getAll(queryCondition.code, queryCondition.name);
        if (success) {
            this.setState({ stocks });
        } else {
            Notify.warning(message);
        }
    };

    private syncRecord = (code: string) => async () => {
        const { success: refreshSuccess, message } = await StockApi.refresh(code);
        if (refreshSuccess) {
            await this.reQuery();
            Notify.success(message);
        } else {
            Notify.error(message);
        }
    };

    private track = (code: string) => async () => {
        const { username } = this.props;
        const { success, message } = await StockApi.track(username, code);
        if (success) {
            await this.reQuery();
            Notify.success(message);
        } else {
            Notify.warning(message);
        }
    };

    private untrack = (code: string) => async () => {
        const { username } = this.props;
        const { success, message } = await StockApi.untrack(username, code);
        if (success) {
            await this.reQuery();
            Notify.success(message);
        } else {
            Notify.warning(message);
        }
    };

    private reQuery = async () => {
        const { username } = this.props;
        const { queryCondition } = this.state;
        const { success, data: vos } = await StockApi.getAll(queryCondition.code, queryCondition.name);
        if (success) {
            const { data } = await StockApi.getTrackingList(username);
            this.props.setStockTrackingList(data);
            this.setState({ stocks: vos });
        }
    };

    render(): JSX.Element {
        const { stockTrackingList } = this.props;
        const { queryCondition, stocks } = this.state;
        const data = stocks.map(x => {
            return { ...x, offeringDate: toDateStr(x.offeringDate), updateTime: toDateStr(x.updateTime) };
        });
        const table = (
            <Table
                id='stock-updater-table'
                header={['code', 'name', 'isinCode', 'offeringDate', 'marketType', 'industryType', 'cfiCode', 'description', 'updateTime', 'functions']}
                data={data}
                countPerPage={10}
                columnConverter={(header: string, rowData: any) => {
                    if (header === 'functions') {
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
        );
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
                                    { key: 'name', title: 'Stock Name', type: InputType.text, value: queryCondition?.name, width: 3 }
                                ]}
                                onChange={(formState: any) => {
                                    queryCondition.code = formState.code;
                                    queryCondition.name = formState.name;
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
                </Row>
                <Row>
                    <Col>
                        <Card
                            title='Stock Updater'
                        >
                            {table}
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
        stockTrackingList: getStockTrackingList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserTrackingStockVo[]>>) => {
    return {
        setStockTrackingList: SetStockTrackingListDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockRecordUpdater);
