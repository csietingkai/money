import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';

import { Variant } from 'util/Enum';
import { firstDigitUppercase } from 'util/AppUtil';

export interface CardExampleProps { }

export interface CardExampleState { }

class CardExample extends React.Component<CardExampleProps, CardExampleState> {

    constructor(props: CardExampleProps) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col xs='12' sm='6' md='4'>
                        <Card
                            title='Card title'
                        >
                            Put Content Here.
                        </Card>
                    </Col>
                    <Col xs='12' sm='6' md='4'>
                        <Card
                            title='Card with footer'
                            footer='Card Footer'
                        >
                            Put Content Here.
                        </Card>
                    </Col>

                    <Col xs='12' sm='6' md='4'>
                        <Card
                            title='Card with Text Center'
                            textCenter
                        >
                            Center Content Here.
                        </Card>
                    </Col>
                </Row>
                <Row>
                    {
                        (['primary', 'secondary', 'success', 'info', 'warning', 'danger'] as Variant[]).map(border =>
                            <Col key={`card-outline-${border}`} xs='12' sm='6' md='4'>
                                <Card
                                    title={`Card outline ${border}`}
                                    border={border}
                                >
                                    {`${firstDigitUppercase(border)} Content Here.`}
                                </Card>
                            </Col>
                        )
                    }
                </Row>
                <Row>
                    {
                        (['primary', 'secondary', 'success', 'info', 'warning', 'danger'] as Variant[]).map(accent =>
                            <Col key={`card-outline-${accent}`} xs='12' sm='6' md='4'>
                                <Card
                                    title={`Card with ${accent} accent`}
                                    accent={accent}
                                >
                                    {`${firstDigitUppercase(accent)} Content Here.`}
                                </Card>
                            </Col>
                        )
                    }
                </Row>
                <Row>
                    {
                        (['primary', 'secondary', 'success', 'info', 'warning', 'danger'] as Variant[]).map(background =>
                            <Col key={`card-outline-${background}`} xs='12' sm='6' md='4'>
                                <Card
                                    title={`Card with ${background} Background`}
                                    background={background}
                                >
                                    {`${firstDigitUppercase(background)} Background Content Here.`}
                                </Card>
                            </Col>
                        )
                    }
                </Row>
                <Row>
                    <Col xs='12' sm='6' md='4'>
                        <Card
                            title='Card collapsable'
                            collapsable
                        >
                            Collapsable Content Here.
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

export default connect(mapStateToProps)(CardExample);
