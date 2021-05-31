import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';

import StockApi, { StockRecord } from 'api/stock';
import { toDateStr } from 'util/AppUtil';
import Form from 'component/common/Form';
import { InputType } from 'util/Enum';
import Button from 'component/common/Button';
import { SearchIcon } from 'component/common/Icons';
import Notify from 'util/Notify';

export interface StockQuerierProps { }

export interface StockQuerierState {
    queryCondition: { code: string, start: Date, end: Date; };
    stockName: string;
    xAxis: string[];
    data: StockRecord[];
}

class StockQuerier extends React.Component<StockQuerierProps, StockQuerierState> {

    constructor(props: StockQuerierProps) {
        super(props);
        this.state = {
            queryCondition: {
                code: '',
                start: new Date(),
                end: new Date()
            },
            stockName: '',
            xAxis: [],
            data: []
        };
    }

    private onQueryBtnClick = async () => {
        const { queryCondition } = this.state;
        if (!queryCondition.code || !queryCondition.start || !queryCondition.end) {
            Notify.warning('Please fill all required Fields.');
            return;
        }
        const { success: success1, data: stock, message: message1 } = await StockApi.get(queryCondition.code);
        if (!success1) {
            Notify.warning(message1);
        }
        const response = await StockApi.getRecords(queryCondition.code, queryCondition.start, queryCondition.end);
        const { success: success2, message: message2 } = response;
        let { data: records } = response;
        if (!success2) {
            Notify.warning(message2);
        }
        records = records || [];
        const dealDates: string[] = records.map(x => toDateStr(x.dealDate));
        this.setState({ stockName: stock.name, xAxis: dealDates, data: records });
    };

    render() {
        const { queryCondition, stockName, xAxis, data } = this.state;
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
                                    { key: 'code', title: 'Stock Code', type: InputType.text, value: queryCondition?.code, width: 3, required: true },
                                    { key: 'start', title: 'Time From', type: InputType.date, value: queryCondition?.start, width: 3 },
                                    { key: 'end', title: 'Time To', type: InputType.date, value: queryCondition?.end, width: 3 }
                                ]}
                                onChange={(formState: any) => {
                                    queryCondition.code = formState.code;
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
                </Row>
                <Row>
                    <Col>
                        <Card
                            title='Candle Chart'
                        >
                            {/* <CandleStickChart
                                data={data}
                            /> */}
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {};
};

export default connect(mapStateToProps)(StockQuerier);
