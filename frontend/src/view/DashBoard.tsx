import * as React from 'react';
import { connect } from 'react-redux';
import { Card as RbCard, Row, Col, ProgressBar } from 'react-bootstrap';

import { getAuthToken, getStockTrackingList } from 'reducer/Selector';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import { PiggyBankIcon } from 'component/common/Icons';

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

    private accountInfoCards = (accounts: Account[]): JSX.Element => {
        return (
            <RbCard>
                <RbCard.Body>
                    <div className="h1 text-muted text-right mb-2">
                        <PiggyBankIcon />
                    </div>
                    <div className="h4 mb-0">rrr</div>
                    <small className="text-muted text-uppercase font-weight-bold">RRR</small>
                    <ProgressBar now={20} />
                </RbCard.Body>
            </RbCard>
        );
    };

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
