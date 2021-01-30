import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';
import { Variant } from 'util/Enum';
import { firstDigitUppercase } from 'util/AppUtil';

export interface ColorExampleProps { }

export interface ColorExampleState { }

class ColorExample extends React.Component<ColorExampleProps, ColorExampleState> {

    constructor(props: ColorExampleProps) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='animated fadeIn'>
                <Card
                    title='Theme colors'
                >
                    <Row>
                        {
                            (['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'] as Variant[]).map(variant =>
                                <Col key={`card-outline-${variant}`} xs='12' sm='6' md='4'>
                                    <div className={`p-3 mb-3 bg-${variant}`}>{firstDigitUppercase(variant)}</div>
                                </Col>
                            )
                        }
                    </Row>
                </Card>
                <Card
                    title='Grays'
                >
                    <Row className='mb-3'>
                        <Col xs='12' sm='6' md='4'>
                            {
                                [100, 200, 300, 400, 500, 600, 700, 800, 900].map(gray => (
                                    <div key={`color-gray-${gray}`} className={`p-3 bg-gray-${gray}`}>{gray}</div>
                                ))
                            }
                        </Col>
                    </Row>
                </Card>
                <Card
                    title='Additional colors'
                >
                    <Row>
                        {
                            (['blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'teal', 'cyan']).map(color =>
                                <Col key={`card-outline-${color}`} xs='12' sm='6' md='4'>
                                    <div className={`p-3 mb-3 bg-${color}`}>{firstDigitUppercase(color)}</div>
                                </Col>
                            )
                        }
                    </Row>
                </Card>
            </div>
        );
    }
}

const mapStateToProps = () => {
    return {};
};

export default connect(mapStateToProps)(ColorExample);;
