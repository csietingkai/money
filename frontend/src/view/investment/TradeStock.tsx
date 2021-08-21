import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { getStockStyle, ReduxState } from 'reducer/Selector';

import Button from 'component/common/Button';
import Card from 'component/common/Card';
import Form from 'component/common/Form';
import { SearchIcon } from 'component/common/Icons';

import { InputType, StockStyle } from 'util/Enum';

export interface TradeStockProps {
    stockStyle: StockStyle;
}

export interface TradeStockState {
    tradeType: 'buy' | 'sell';
    values: { code: string; };
}

class TradeStock extends React.Component<TradeStockProps, TradeStockState> {

    constructor(props: TradeStockProps) {
        super(props);
        this.state = {
            tradeType: 'buy',
            values: {
                code: ''
            }
        };
    }

    private onTradeBtnlick = () => {
        console.log();
    };

    render() {
        const { values } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col>
                        <Card
                            title='Query Condition'
                        >
                            <Form
                                singleRow
                                inputs={[
                                    { key: 'code', title: 'Stock Code', type: InputType.text, value: values?.code, width: 3, required: true },

                                ]}
                                onChange={(formState: any) => {
                                    values.code = formState.code;
                                    this.setState({ values });
                                }}
                            />
                            <div className='mr-1' style={{ textAlign: 'right', marginBottom: '5px' }}>
                                <Button
                                    variant='success'
                                    outline
                                    onClick={this.onTradeBtnlick}
                                >
                                    <SearchIcon />
                                    {' Search'}
                                </Button>
                            </div>
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

export default connect(mapStateToProps)(TradeStock);
