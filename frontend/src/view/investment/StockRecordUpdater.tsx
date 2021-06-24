import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { getStockStyle } from 'reducer/Selector';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import CandleStickChart from 'component/common/chart/CandleStockChart';
import Form from 'component/common/Form';
import { SearchIcon, SyncAltIcon } from 'component/common/Icons';

import StockApi, { StockRecord, StockVo } from 'api/stock';

import { numberComma, toDateStr } from 'util/AppUtil';
import { InputType } from 'util/Enum';
import Notify from 'util/Notify';
import Loading from 'component/common/Loading';
import Table from 'component/common/Table';

export interface StockRecordUpdaterProps { }

export interface StockRecordUpdaterState {
    stocks: StockVo[];
    loaded: boolean;
}

class StockRecordUpdater extends React.Component<StockRecordUpdaterProps, StockRecordUpdaterState> {

    constructor(props: StockRecordUpdaterProps) {
        super(props);
        this.state = {
            stocks: [],
            loaded: false
        };
        this.init();
    }

    private init = async () => {
        const { success, data: vos, message } = await StockApi.getAll();
        if (success) {
            this.setState({ stocks: vos, loaded: true });
        } else {
            Notify.warning(message);
        }
    };

    private syncRecord = (code: string) => async () => {
        const { success: refreshSuccess, message } = await StockApi.refresh(code);
        if (refreshSuccess) {
            Notify.success(message);

            const { success: fetchSuccess, data: vos } = await StockApi.getAll();
            if (fetchSuccess) {
                this.setState({ stocks: vos });
            }
        } else {
            Notify.error(message);
        }
    };

    render() {
        const { stocks, loaded } = this.state;
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

const mapStateToProps = (state: any) => {
    return {};
};

export default connect(mapStateToProps)(StockRecordUpdater);
