import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';

import { getAuthToken, getStockTrackingList } from 'reducer/Selector';

import { AuthToken } from 'api/auth';
import ExchangeRateApi from 'api/exchangeRate';
import StockApi from 'api/stock';

import Card from 'component/common/Card';
import Button from 'component/common/Button';
import axios from 'axios';

export interface DashBoardProps {
    authToken?: AuthToken;
}

export interface DashBoardState {
    trackingList: string[];
}

class DashBoard extends React.Component<DashBoardProps, DashBoardState> {

    constructor(props: DashBoardProps) {
        super(props);
        this.state = {
            trackingList: []
        };
    }

    render() {
        const { authToken } = this.props;
        const { trackingList } = this.state;
        if (!authToken) {
            return (
                <Card
                    title='INFO'
                    textCenter
                >
                    <Row>
                        <Col>
                            <h2>{'Login For More Information'}</h2>
                        </Col>
                    </Row>
                </Card>
            );
        }
        return <><Button onClick={
            async () => {

            }}>RRR</Button></>;
    }
}

const mapStateToProps = (state: any) => {
    return {
        authToken: getAuthToken(state),
        // userStockTrackingList: getStockTrackingList(state)
    };
};

export default connect(mapStateToProps)(DashBoard);;
