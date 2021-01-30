import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';

import { getAuthToken } from 'reducer/Selector';

import { AuthToken } from 'api/auth';

import Card from 'component/common/Card';

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
        this.fetchTrackingList();
    }



    render() {
        const { authToken } = this.props;
        const { trackingList } = this.state;
        if (!authToken) {
            return (
                <Card
                    title='  '
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
        return <></>;
    }
}

const mapStateToProps = (state: any) => {
    return {
        authToken: getAuthToken(state),
        userStockTrackingList: getTrackingList(state)
    };
};

export default connect(mapStateToProps)(DashBoard);;
