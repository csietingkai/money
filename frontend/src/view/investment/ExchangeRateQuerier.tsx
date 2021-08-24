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

import ExchangeRateApi, { ExchangeRate, ExchangeRateRecordVo } from 'api/exchangeRate';

import { toDateStr } from 'util/AppUtil';
import { InputType, StockStyle } from 'util/Enum';
import Notify from 'util/Notify';
import { Action } from 'util/Interface';

export interface ExchangeRateQuerierProps {
    stockStyle: StockStyle;
    exchangeRateList: ExchangeRate[];
    setLoading: (loading: boolean) => void;
}

export interface ExchangeRateQuerierState {
    queryCondition: { currency: string, start: Date, end: Date; };
    xAxis: string[];
    data: ExchangeRateRecordVo[];
}

class ExchangeRateQuerier extends React.Component<ExchangeRateQuerierProps, ExchangeRateQuerierState> {

    constructor(props: ExchangeRateQuerierProps) {
        super(props);
        this.state = {
            queryCondition: {
                currency: 'USD',
                start: new Date(),
                end: new Date()
            },
            xAxis: [],
            data: []
        };
    }

    private onRefreshBtnClick = async () => {
        this.props.setLoading(true);
        const { queryCondition } = this.state;
        if (!queryCondition.currency) {
            Notify.warning('Please fill all required Fields.');
            return;
        }
        const response = await ExchangeRateApi.refresh(queryCondition.currency);
        const { success, message } = response;
        if (success) {
            Notify.success(message);
        } else {
            Notify.warning(message);
        }
        this.props.setLoading(false);
    };

    private onQueryBtnClick = async () => {
        const { queryCondition } = this.state;
        if (!queryCondition.currency || !queryCondition.start || !queryCondition.end) {
            Notify.warning('Please fill all required Fields.');
            return;
        }
        const response = await ExchangeRateApi.getRecords(queryCondition.currency, queryCondition.start, queryCondition.end);
        const { success, message } = response;
        let { data: records } = response;
        if (!success) {
            Notify.warning(message);
        }
        records = records || [];
        const date: string[] = records.map(x => toDateStr(x.date));
        this.setState({ xAxis: date, data: records });
    };

    render() {
        const { stockStyle, exchangeRateList } = this.props;
        const { queryCondition, data } = this.state;
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
                                    { key: 'currency', title: 'Currency', type: InputType.select, options: exchangeRateList.map(x => ({ key: x.currency, value: x.name })), value: queryCondition?.currency, width: 3, required: true },
                                    { key: 'start', title: 'Time From', type: InputType.date, value: queryCondition?.start, width: 3 },
                                    { key: 'end', title: 'Time To', type: InputType.date, value: queryCondition?.end, width: 3 }
                                ]}
                                onChange={(formState: any) => {
                                    queryCondition.currency = formState.currency;
                                    queryCondition.start = formState.start;
                                    queryCondition.end = formState.end;
                                    this.setState({ queryCondition });
                                }}
                            />
                            <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='info'
                                    outline
                                    onClick={this.onRefreshBtnClick}
                                >
                                    <SyncAltIcon />
                                    {' Refresh'}
                                </Button>
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
