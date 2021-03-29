import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';
import LineChart from 'component/common/chart/LineChart';
import BarChart from 'component/common/chart/BarChart';
import BubbleChart from 'component/common/chart/BubbleChart';
import PieChart from 'component/common/chart/PieChart';
import RadarChart from 'component/common/chart/RadarChart';
import ScatterChart from 'component/common/chart/ScatterChart';

import StockRecordApi, { StockRecord } from 'api/stock';
import { toDateStr } from 'util/AppUtil';

export interface SportLotteryPageProps { }

export interface SportLotteryPageState {
    // accounts: Account[];
}

class SportLotteryPage extends React.Component<SportLotteryPageProps, SportLotteryPageState> {

    constructor(props: SportLotteryPageProps) {
        super(props);
        this.state = {
        };
        this.init();
    }

    private init = async () => {

    };

    render() {
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card>

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

export default connect(mapStateToProps)(SportLotteryPage);
