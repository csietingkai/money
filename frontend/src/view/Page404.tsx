import * as React from 'react';
import { Col, Container, InputGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteChildrenProps } from 'react-router-dom';

import Button from 'component/common/Button';

export interface Page404Props extends RouteChildrenProps<any> { }

export interface Page404State { }

class Page404 extends React.Component<Page404Props, Page404State> {

    constructor(props: Page404Props) {
        super(props);
        this.state = {};
    }

    private onHomeClick = () => {
        this.props.history.push('/');
    };

    render() {

        return (
            <div className='app flex-row align-items-center'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col md='6'>
                            <div className='clearfix'>
                                <h1 className='float-left display-3 mr-4'>404</h1>
                                <h4 className='pt-3'>Oops! You're lost.</h4>
                                <p className='text-muted float-left'>The page you are looking for was not found.</p>
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

const mapStateToProps = (state: any) => {
    return {};
};

export default connect(mapStateToProps)(Page404);
