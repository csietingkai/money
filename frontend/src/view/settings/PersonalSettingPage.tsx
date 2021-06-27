import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import { Col, Form, Row } from 'react-bootstrap';

import Card from 'component/common/Card';
import { TwFlag, UsFlag } from 'component/common/Icons';

import { SetStockStyleDispatcher } from 'reducer/PropsMapper';
import { getStockStyle, ReduxState } from 'reducer/Selector';

import { StockStyle } from 'util/Enum';
import { Action, Record } from 'util/Interface';

export interface PersonalSettingPageProps {
    stockStyle: StockStyle;
    setStockStyle: (style: StockStyle) => void;
}

export interface PersonalSettingPageState { }

class PersonalSettingPage extends React.Component<PersonalSettingPageProps, PersonalSettingPageState> {

    constructor(props: PersonalSettingPageProps) {
        super(props);
        this.state = {};
    }

    private getStockStyleOptions = (): Record<string, JSX.Element>[] => {
        return [
            { key: StockStyle.US, value: <>{UsFlag()} US Style</> },
            { key: StockStyle.TW, value: <>{TwFlag()} Taiwan Style</> }
        ];
    };

    private onStockStyleChange = (selection: string) => () => {
        this.props.setStockStyle(selection as StockStyle);
    };

    render(): JSX.Element {
        const { stockStyle } = this.props;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col md={4} sm={6} xs={12}>
                        <Card
                            title={'Stock Style'}
                        >
                            <Form>
                                <Row>
                                    {
                                        this.getStockStyleOptions().map(option => {
                                            return (
                                                <Col
                                                    key={`radio-stockStyle-${option.key}`}
                                                    md={6}
                                                    xs={12}
                                                >
                                                    <Form.Check
                                                        inline
                                                        label={option.value}
                                                        name='stockStyle'
                                                        type='radio'
                                                        className='md-3'
                                                        id={`radio-stockStyle-${option.key}`}
                                                    >
                                                        <Form.Check.Input
                                                            type='radio'
                                                            name='stockStyle'
                                                            checked={option.key === stockStyle}
                                                            onChange={this.onStockStyleChange(option.key)}
                                                            style={{ width: '16px', height: '16px' }}
                                                        />
                                                        <Form.Check.Label
                                                            style={{ fontSize: '16px' }}
                                                        >
                                                            {option.value}
                                                        </Form.Check.Label>
                                                    </Form.Check>
                                                </Col>
                                            );
                                        })
                                    }
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        stockStyle: getStockStyle(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<StockStyle>>) => {
    return {
        setStockStyle: SetStockStyleDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalSettingPage);
