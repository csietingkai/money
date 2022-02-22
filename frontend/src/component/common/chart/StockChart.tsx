import * as React from 'react';
import { Col, Dropdown, ListGroup, ListGroupItem, Row, SplitButton } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

import { StockRecordVo } from 'api/stock';

import { SUPPORT_LINE_TYPE } from 'component/common/chart/Constants';
import { CheckIcon, InfoCircleIcon } from 'component/common/Icons';

import { black, blue, green, pink, purple, red, toDate, toDateStr } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';
import { DEFAULT_DECIMAL_PRECISION } from 'util/Constant';
import { PredictResultVo } from 'util/Interface';

export interface StockChartProps {
    stockStyle: StockStyle;
    data: StockRecordVo[];
    predict?: PredictResultVo[];
    showInfo: boolean;
}

export interface StockChartState {
    selectedLineType: {
        key: string,
        children: { [key: string]: string[]; };
    };
    hoveredIndex: number;
    // TODO
    // recommand: any;
}

export default class StockChart extends React.Component<StockChartProps, StockChartState> {

    constructor(props: StockChartProps) {
        super(props);
        const children: { [key: string]: string[]; } = {};
        SUPPORT_LINE_TYPE.forEach((TYPE) => {
            children[TYPE.key] = TYPE.children.filter(x => x.isDefault).map(x => x.key);
        });
        this.state = {
            selectedLineType: {
                key: '',
                children
            },
            hoveredIndex: -1
        };
    }

    private getStickColor = (record: StockRecordVo, style: StockStyle = this.props.stockStyle): string => {
        let color: string = black(1);
        if (style === StockStyle.TW) {
            if (record.openPrice > record.closePrice) {
                color = green(1);
            } else if (record.openPrice < record.closePrice) {
                color = red(1);
            }
        } else {
            if (record.openPrice > record.closePrice) {
                color = red(1);
            } else if (record.openPrice < record.closePrice) {
                color = green(1);
            }
        }
        return color;
    };

    private onLineTypeChange = (selectedLineType: string) => () => {
        if (this.state.selectedLineType.key === selectedLineType) {
            selectedLineType = '';
        }
        this.setState({ selectedLineType: { key: selectedLineType, children: this.state.selectedLineType.children } });
    };

    private onSupportLineDropdownClick = (lineType: string, dropdownKey: string) => () => {
        const { selectedLineType } = this.state;
        const { children } = selectedLineType;
        const keyIdx = children[lineType].findIndex(x => x === dropdownKey);
        if (keyIdx >= 0) {
            children[lineType] = children[lineType].filter(x => x !== dropdownKey);
        } else {
            children[lineType] = children[lineType] || [];
            children[lineType].push(dropdownKey);
        }
        selectedLineType.children = children;
        this.setState({ selectedLineType });
    };

    render(): JSX.Element {
        const { data: records, predict, showInfo } = this.props;
        const { selectedLineType, hoveredIndex } = this.state;

        // make data sets for chart
        const datasets: any[] = [
            {
                label: 'open and close',
                type: 'bar',
                data: records.map((x: StockRecordVo) => [x.openPrice, x.closePrice]),
                backgroundColor: records.map((x: StockRecordVo) => this.getStickColor(x)),
                minBarLength: 1
            },
            {
                label: 'high and low',
                type: 'bar',
                barPercentage: 0.1,
                data: records.map((x: StockRecordVo) => [x.highPrice, x.lowPrice]),
                backgroundColor: records.map((x: StockRecordVo) => this.getStickColor(x))
            }
        ];
        const labels = records.map((x: StockRecordVo) => toDateStr(x.dealDate));

        const LINE = SUPPORT_LINE_TYPE.find(x => x.key == selectedLineType.key);
        LINE && LINE.children.forEach(l => {
            if (selectedLineType.children[selectedLineType.key].filter(x => x === l.key).length > 0) {
                datasets.push({
                    label: l.key,
                    type: 'line',
                    data: records.map((x: StockRecordVo) => (x as any)[l.key]),
                    borderColor: LINE.children.find(x => x.key == l.key)?.color,
                    radius: 0,
                    borderWidth: 1
                });
            }
        });

        if (records.length && predict && predict.length) {
            const lastDate = new Date(records[records.length - 1].dealDate);
            for (let i = 0; i < predict.length; i++) {
                lastDate.setDate(lastDate.getDate() + 1);
                labels.push(toDateStr(lastDate));
            }

            const data: PredictResultVo[] = records.map(r => ({ lower: NaN, price: NaN, upper: NaN })).concat(predict);
            datasets.push({
                label: 'lower',
                type: 'line',
                data: data.map((x: PredictResultVo) => x.lower),
                borderColor: pink(),
                radius: 0,
                borderWidth: 1,
                borderDash: [5]
            });
            datasets.push({
                label: 'price',
                type: 'line',
                data: data.map((x: PredictResultVo) => x.price),
                borderColor: purple(),
                radius: 0,
                borderWidth: 1,
                borderDash: [5]
            });
            datasets.push({
                label: 'upper',
                type: 'line',
                data: data.map((x: PredictResultVo) => x.upper),
                borderColor: blue(),
                radius: 0,
                borderWidth: 1,
                borderDash: [5]
            });
        }

        return (
            <>
                <div className='text-center'>
                    {
                        SUPPORT_LINE_TYPE.map((TYPE) =>
                            <SplitButton
                                className='ml-2'
                                id={`chart-support-dropdown-${TYPE.key}`}
                                key={`chart-support-dropdown-${TYPE.key}`}
                                variant={selectedLineType.key === TYPE.key ? 'primary' : 'secondary'}
                                onClick={this.onLineTypeChange(TYPE.key)}
                                title={TYPE.value}
                            >
                                {
                                    TYPE.children.map(C =>
                                        <Dropdown.Item
                                            key={`chart-support-dropdown-${TYPE.key}-item-${C.key}`}
                                            onClick={this.onSupportLineDropdownClick(TYPE.key, C.key)}
                                        >
                                            <span style={{ color: C.color }}>
                                                {selectedLineType.key === TYPE.key && selectedLineType.children[selectedLineType.key].findIndex(s => s === C.key) >= 0 && <CheckIcon />}
                                                {C.value}
                                            </span>
                                        </Dropdown.Item>
                                    )
                                }
                            </SplitButton>
                        )
                    }
                </div>
                <Row>
                    <Col>
                        <div className='chart-wrapper'>
                            <Bar
                                type='bar'
                                data={
                                    { labels, datasets }
                                }
                                options={{
                                    responsive: true,
                                    scales: {
                                        x: { stacked: true },
                                        y: { beginAtZero: false }
                                    },
                                    interaction: {
                                        intersect: false,
                                        mode: 'index'
                                    },
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            enabled: false,
                                            external: (context: any) => {
                                                if (records.length) {
                                                    const hoverDate = toDate(context.tooltip.title[0]);
                                                    let mouseIndex = records.findIndex(x => x.dealDate.getTime() === hoverDate.getTime());
                                                    if (mouseIndex === -1) {
                                                        mouseIndex = (hoverDate.getTime() - records[records.length - 1].dealDate.getTime()) / (24 * 60 * 60 * 1000) + records.length - 1;
                                                    }
                                                    if (hoveredIndex !== mouseIndex) {
                                                        this.setState({ hoveredIndex: mouseIndex });
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    animation: { duration: 0 }
                                }}
                            />
                        </div>
                    </Col>
                    {
                        showInfo &&
                        <Col sm={2} md={2}>
                            {
                                hoveredIndex > 0 && hoveredIndex < records.length &&
                                <Row>
                                    <Col>
                                        <ListGroup>
                                            <ListGroupItem action variant='info'>
                                                <InfoCircleIcon />
                                                <span className='h3'> {toDateStr(records[hoveredIndex].dealDate)}</span>
                                            </ListGroupItem>
                                            <ListGroupItem action variant='secondary'>
                                                <h5>Open: {records[hoveredIndex].openPrice.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>High: {records[hoveredIndex].highPrice.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>Low: {records[hoveredIndex].lowPrice.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>Close: {records[hoveredIndex].closePrice.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>MA5: {records[hoveredIndex].ma5.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>MA10: {records[hoveredIndex].ma10.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>MA20: {records[hoveredIndex].ma20.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>MA40: {records[hoveredIndex].ma40.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>MA60: {records[hoveredIndex].ma60.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>B.Brand Up: {records[hoveredIndex].bbup.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>B.Brand Down: {records[hoveredIndex].bbdown.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                            </ListGroupItem>
                                        </ListGroup>
                                    </Col>
                                </Row>
                            }
                            {
                                hoveredIndex >= records.length && hoveredIndex < records.length + predict.length &&
                                <Row>
                                    <Col>
                                        <ListGroup>
                                            <ListGroupItem action variant='info'>
                                                <InfoCircleIcon />
                                                <span className='h4'> {hoveredIndex - records.length + 1} Days Later Predict</span>
                                            </ListGroupItem>
                                            <ListGroupItem action variant='secondary'>
                                                <h5>Lower: {predict[hoveredIndex - records.length].lower.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>Price: {predict[hoveredIndex - records.length].price.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                                <h5>Upper: {predict[hoveredIndex - records.length].upper.toFixed(DEFAULT_DECIMAL_PRECISION)}</h5>
                                            </ListGroupItem>
                                        </ListGroup>
                                    </Col>
                                </Row>
                            }
                        </Col>
                    }
                </Row>
            </>
        );
    }
}
