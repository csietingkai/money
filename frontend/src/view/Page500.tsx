import * as React from 'react';
import { Col, Container, InputGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteChildrenProps } from 'react-router-dom';

import Button from 'component/common/Button';

export interface Page500Props extends RouteChildrenProps<any> { }

export interface Page500State { }

class Page500 extends React.Component<Page500Props, Page500State> {

    constructor(props: Page500Props) {
        super(props);
        this.state = {};
    }

    private onHomeClick = () => {
        this.props.history.push('/');
    };

    render(): JSX.Element {
        return (
            <div className='app flex-row align-items-center'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col md='6'>
                            <div className='clearfix'>
                                <h1 className='float-left display-3 mr-4'>500</h1>
                                <h4 className='pt-3'>Houston, we have a problem!</h4>
                                <p className='text-muted float-left'>The page you are looking for is temporarily unavailable.</p>
                            </div>
                            <InputGroup className='input-prepend'>
                                <Col className='text-center'>
                                    <Button variant='info' onClick={this.onHomeClick}>Back To Home</Button>
                                </Col>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {};
};

export default connect(mapStateToProps)(Page500);
