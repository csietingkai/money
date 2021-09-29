import * as React from 'react';
import { Dispatch } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SetLoadingDispatcher } from 'reducer/PropsMapper';
import { getExchangeRateList, getStockStyle, ReduxState } from 'reducer/Selector';

import ExchangeRateChart from 'component/common/chart/ExchangeRateChart';
import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { SearchIcon, SyncAltIcon } from 'component/common/Icons';

import ExchangeRateApi, { ExchangeRateRecordVo, ExchangeRateVo } from 'api/exchangeRate';

import { toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';
import Table from 'component/common/Table';

export interface ExchangeRateQuerierProps {
    stockStyle: StockStyle;
    exchangeRateList: ExchangeRateVo[];
    setLoading: (loading: boolean) => void;
}

export interface ExchangeRateQuerierState {
    queryCondition: { start: Date, end: Date; };
    selectedExchangeRate: string;
    xAxis: string[];
    exchangeRateRecords: ExchangeRateRecordVo[];
}

class ExchangeRateQuerier extends React.Component<ExchangeRateQuerierProps, ExchangeRateQuerierState> {

    constructor(props: ExchangeRateQuerierProps) {
        super(props);
        this.state = {
            queryCondition: {
                start: new Date(),
                end: new Date()
            },
            selectedExchangeRate: props.exchangeRateList[0]?.currency,
            xAxis: [],
            exchangeRateRecords: []
        };
    }

    private onQueryBtnClick = async () => {
        const { selectedExchangeRate } = this.state;
        await this.getRecords(selectedExchangeRate);
    };

    private onExchangeRateRowClick = async (selectedRow: number) => {
        const { exchangeRateList } = this.props;
        const { selectedExchangeRate } = this.state;
        if (exchangeRateList[selectedRow].currency === selectedExchangeRate) {
            return;
        }
        this.setState({ selectedExchangeRate: exchangeRateList[selectedRow].currency });
        await this.getRecords(exchangeRateList[selectedRow].currency);
    };

    private getRecords = async (currency: string) => {
        const { queryCondition } = this.state;
        const response = await ExchangeRateApi.getRecords(currency, queryCondition.start, queryCondition.end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        const date: string[] = records.map(x => toDateStr(x.date));
        this.setState({ xAxis: date, exchangeRateRecords: records });
    };

    private syncRecord = (currency: string) => async () => {
        this.props.setLoading(true);
        const { success: refreshSuccess, message } = await ExchangeRateApi.refresh(currency);
        if (refreshSuccess) {
            await this.getRecords(currency);
        } else {
            Notify.error(message);
        }
        this.props.setLoading(false);
    };

    render() {
        const { stockStyle, exchangeRateList } = this.props;
        const { queryCondition, exchangeRateRecords: data } = this.state;
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
                                    { key: 'start', title: 'Time From', type: InputType.date, value: queryCondition?.start, width: 3 },
                                    { key: 'end', title: 'Time To', type: InputType.date, value: queryCondition?.end, width: 3 }
                                ]}
                                onChange={(formState: any) => {
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
                            title='Exchange Rate Info'
                        >
                            <Table
                                id='fund-updater-table'
                                header={['currency', 'name', 'updateTime', 'functions']}
                                data={exchangeRateList}
                                countPerPage={3}
                                onRowClick={this.onExchangeRateRowClick}
                                columnConverter={(header: string, rowData: any) => {
                                    if (['offeringDate', 'updateTime'].findIndex(x => x === header) >= 0) {
                                        return <>{toDateStr(rowData[header])}</>;
                                    } else if (header === 'functions') {
                                        return (
                                            <Button size='sm' variant='info' outline onClick={this.syncRecord(rowData.currency)}><SyncAltIcon /></Button>
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
                            <ExchangeRateChart
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
        stockStyle: getStockStyle(state),
        exchangeRateList: getExchangeRateList(state, false)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<boolean>>) => {
    return {
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeRateQuerier);
