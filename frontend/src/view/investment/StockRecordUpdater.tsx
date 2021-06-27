import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { SearchIcon, SyncAltIcon } from 'component/common/Icons';
import Loading from 'component/common/Loading';
import Table from 'component/common/Table';

import StockApi, { StockVo } from 'api/stock';

import { toDateStr } from 'util/AppUtil';
import { InputType } from 'util/Enum';
import Notify from 'util/Notify';

export interface StockRecordUpdaterProps { }

export interface StockRecordUpdaterState {
    queryCondition: { code: string, name: string; };
    stocks: StockVo[];
    loaded: boolean;
}

class StockRecordUpdater extends React.Component<StockRecordUpdaterProps, StockRecordUpdaterState> {

    constructor(props: StockRecordUpdaterProps) {
        super(props);
        this.state = {
            queryCondition: { code: '', name: '' },
            stocks: [],
            loaded: true
        };
    }

    private onQueryBtnClick = async () => {
        this.setState({ loaded: false });
        const { queryCondition } = this.state;
        const { success, data: stocks, message } = await StockApi.getAll(queryCondition.code, queryCondition.name);
        if (success) {
            this.setState({ stocks });
        } else {
            Notify.warning(message);
        }
        this.setState({ loaded: true });
    };

    private syncRecord = (code: string) => async () => {
        const { queryCondition } = this.state;
        const { success: refreshSuccess, message } = await StockApi.refresh(code);
        if (refreshSuccess) {
            Notify.success(message);

            const { success: fetchSuccess, data: vos } = await StockApi.getAll(queryCondition.code, queryCondition.name);
            if (fetchSuccess) {
                this.setState({ stocks: vos });
            }
        } else {
            Notify.error(message);
        }
    };

    render(): JSX.Element {
        const { queryCondition, stocks, loaded } = this.state;
        let table = <div className='text-center'><Loading /></div>;
        if (loaded) {
            const data = stocks.map(x => {
                return { ...x, offeringDate: toDateStr(x.offeringDate), updateTime: toDateStr(x.updateTime) };
            });
            table = (
                <Table
                    id='stock-updater-table'
                    header={['code', 'name', 'isinCode', 'offeringDate', 'marketType', 'industryType', 'cfiCode', 'description', 'updateTime', 'functions']}
                    data={data}
                    countPerPage={10}
                    columnConverter={(header: string, rowData: any) => {
                        if (header === 'functions') {
                            return (
                                <>
                                    <Button size='sm' variant='info' outline onClick={this.syncRecord(rowData.code)}><SyncAltIcon /></Button>
                                </>
                            );
                        }
                        return rowData[header];
                    }}
                />
            );
        }
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

const mapStateToProps = () => {
    return {};
};

export default connect(mapStateToProps)(StockRecordUpdater);
