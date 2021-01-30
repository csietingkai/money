import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import Card from 'component/common/Card';
import LineChart from 'component/common/chart/LineChart';
import BarChart from 'component/common/chart/BarChart';
import BubbleChart from 'component/common/chart/BubbleChart';
import PieChart from 'component/common/chart/PieChart';
import RadarChart from 'component/common/chart/RadarChart';
import ScatterChart from 'component/common/chart/ScatterChart';

export interface ChartExampleProps { }

export interface ChartExampleState { }

class ChartExample extends React.Component<ChartExampleProps, ChartExampleState> {

    constructor(props: ChartExampleProps) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='animated fadeIn'>
                <Row>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Line Chart'
                        >
                            <LineChart
                                xAxisLabels={['January', 'February', 'March', 'April', 'May', 'June', 'July']}
                                datasets={[
                                    { label: 'Line-1', color: { red: 57, green: 197, blue: 187 }, data: [65, 59, 80, 81, 56, 55, -72] },
                                    { label: 'Line-2', color: { red: 255, green: 215, blue: 0 }, data: [34, 23, 12, 54, 77, -24, 29] }
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Bubble Chart'
                        >
                            <BubbleChart
                                datasets={[
                                    { label: 'Bubble-1', color: { red: 57, green: 197, blue: 187 }, data: [{ x: 10, y: 20, r: 5 }, { x: 11, y: 21, r: 6 }] },
                                    { label: 'Bubble-2', color: { red: 255, green: 215, blue: 0 }, data: [{ x: 12, y: 22, r: 7 }] }
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Bar Chart'
                        >
                            <BarChart
                                xAxisLabels={['January', 'February', 'March', 'April', 'May', 'June', 'July']}
                                datasets={[
                                    { label: 'Bar-1', color: { red: 57, green: 197, blue: 187 }, data: [65, 59, 80, 81, 56, 55, 40] },
                                    { label: 'Bar-2', color: { red: 255, green: 215, blue: 0 }, data: [28, 48, 40, 19, 96, 27, 100] }
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Horizontal Bar Chart'
                        >
                            <BarChart
                                horizontal
                                xAxisLabels={['January', 'February', 'March', 'April', 'May', 'June', 'July']}
                                datasets={[
                                    { label: 'Bar-1', color: { red: 57, green: 197, blue: 187 }, data: [65, 59, 80, 81, 56, 55, 40] },
                                    { label: 'Bar-2', color: { red: 255, green: 215, blue: 0 }, data: [28, 48, 40, 19, 96, 27, 100] }
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Pie Chart'
                        >
                            <PieChart
                                datasets={[
                                    { label: 'Red', color: { red: 255, green: 99, blue: 132 }, data: 300 },
                                    { label: 'Blue', color: { red: 54, green: 162, blue: 235 }, data: 50 },
                                    { label: 'Yellow', color: { red: 255, green: 206, blue: 86 }, data: 100 }
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Doughnut Chart'
                        >
                            <PieChart
                                centerFill={false}
                                datasets={[
                                    { label: 'Red', color: { red: 255, green: 99, blue: 132 }, data: 300 },
                                    { label: 'Blue', color: { red: 54, green: 162, blue: 235 }, data: 50 },
                                    { label: 'Yellow', color: { red: 255, green: 206, blue: 86 }, data: 100 }
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Radar Chart'
                        >
                            <RadarChart
                                roundLabels={['January', 'February', 'March', 'April', 'May', 'June', 'July']}
                                datasets={[
                                    { label: 'Radar-1', color: { red: 57, green: 197, blue: 187 }, data: [65, 59, 80, 81, 56, 55, -72] },
                                    { label: 'Radar-2', color: { red: 255, green: 215, blue: 0 }, data: [34, 23, 12, 54, 77, -24, 29] }
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs='12' sm='6'>
                        <Card
                            title='Scatter Chart'
                        >
                            <ScatterChart
                                datasets={[
                                    { label: 'Scatter-1', color: { red: 57, green: 197, blue: 187 }, data: [{ x: 48, y: 45 }, { x: 86, y: 45 }, { x: 28, y: 17 }, { x: 74, y: 94 }, { x: 80, y: 88 }, { x: 61, y: 26 }, { x: 88, y: 38 }, { x: 18, y: 36 }, { x: 30, y: 69 }, { x: 97, y: 48 }] },
                                    { label: 'Scatter-2', color: { red: 255, green: 215, blue: 0 }, data: [{ x: 66, y: 43 }, { x: 42, y: 20 }, { x: 57, y: 80 }, { x: 33, y: 49 }, { x: 95, y: 56 }, { x: 61, y: 61 }, { x: 86, y: 77 }, { x: 94, y: 46 }, { x: 18, y: 87 }, { x: 24, y: 47 }] },
                                    { label: 'Scatter-3', color: { red: 255, green: 99, blue: 132 }, data: [{ x: 90, y: 54 }, { x: 91, y: 28 }, { x: 23, y: 99 }, { x: 96, y: 69 }, { x: 13, y: 55 }, { x: 70, y: 97 }, { x: 14, y: 39 }, { x: 13, y: 24 }, { x: 29, y: 37 }, { x: 43, y: 17 }] },
                                    { label: 'Scatter-4', color: { red: 54, green: 162, blue: 235 }, data: [{ x: 17, y: 91 }, { x: 20, y: 7 }, { x: 65, y: 63 }, { x: 65, y: 45 }, { x: 35, y: 93 }, { x: 57, y: 93 }, { x: 86, y: 66 }, { x: 30, y: 84 }, { x: 79, y: 8 }, { x: 19, y: 31 }] },
                                    { label: 'Scatter-5', color: { red: 255, green: 206, blue: 86 }, data: [{ x: 40, y: 90 }, { x: 62, y: 20 }, { x: 24, y: 55 }, { x: 78, y: 28 }, { x: 27, y: 39 }, { x: 58, y: 11 }, { x: 8, y: 27 }, { x: 20, y: 34 }, { x: 40, y: 30 }, { x: 7, y: 10 }] }
                                ]}
                            />
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

export default connect(mapStateToProps)(ChartExample);
