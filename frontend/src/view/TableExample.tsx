import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';
import Table from 'component/common/Table';

import ItemApi, { Item } from 'api/item';

export interface TableExampleProps { }

export interface TableExampleState {
    header: string[];
    data: any[];
}

class TableExample extends React.Component<TableExampleProps, TableExampleState> {

    constructor(props: TableExampleProps) {
        super(props);
        this.state = {
            header: [],
            data: []
        };
        this.fetchData();
    }

    private fetchData = async () => {
        const items: Item[] = await ItemApi.getAll();
        const keys: Set<string> = items.reduce((accu: Set<string>, current: Item) => {
            Object.keys(current).forEach(key => accu.add(key));
            return accu;
        }, new Set<string>());

        this.setState({ header: Array.from(keys), data: items });
    };

    render() {
        const { header, data } = this.state;
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Simple Table'
                        >
                            <Table
                                id='simple'
                                header={header}
                                data={data}
                            />
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Striped Table'
                        >
                            <Table
                                id='simple'
                                striped
                                header={header}
                                data={data}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Condensed Table'
                        >
                            <Table
                                id='simple'
                                condensed
                                header={header}
                                data={data}
                            />
                        </Card>
                    </Col>
                    <Col xs='12' lg='6'>
                        <Card
                            title='Bordered Table'
                        >
                            <Table
                                id='simple'
                                bordered
                                header={header}
                                data={data}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' lg='12'>
                        <Card
                            title='Combined All Table'
                        >
                            <Table
                                id='simple'
                                striped
                                condensed
                                bordered
                                header={header}
                                data={data}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => {
    return {};
};

export default connect(mapStateToProps)(TableExample);;
