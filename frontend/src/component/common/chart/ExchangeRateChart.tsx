import * as React from 'react';
import { SplitButton, Dropdown, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';

import { ExchangeRateRecordVo } from 'api/exchangeRate';

import { SUPPORT_LINE_TYPE } from 'component/common/chart/Constants';
import { CheckIcon, InfoCircleIcon } from 'component/common/Icons';

import { black, toDateStr } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';

export interface ExchangeRateChartProps {
    stockStyle: StockStyle,
    data: ExchangeRateRecordVo[];
}

export interface ExchangeRateChartState {
    selectedLineType: {
        key: string,
        children: { [key: string]: string[]; };
    };
    hoveredIndex: number;
    // TODO
    // recommand: any;
}

export default class ExchangeRateChart extends React.Component<ExchangeRateChartProps, ExchangeRateChartState> {

    constructor(props: ExchangeRateChartProps) {
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
        const { data: records } = this.props;
        const { selectedLineType, hoveredIndex } = this.state;

        // make data sets for chart
        const datasets: any[] = [
            {
                label: 'price',
                data: records.map((x: ExchangeRateRecordVo) => x.cashSell),
            }
        ];

        const LINE = SUPPORT_LINE_TYPE.find(x => x.key == selectedLineType.key);
        LINE && LINE.children.forEach(l => {
            if (selectedLineType.children[selectedLineType.key].filter(x => x === l.key).length > 0) {
                datasets.push({
                    label: l.key,
                    type: 'line',
                    data: records.map((x: ExchangeRateRecordVo) => (x as any)[l.key]),
                    borderColor: LINE.children.find(x => x.key == l.key)?.color,
                    radius: 0,
                    borderWidth: 1
                });
            }
        });
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
                            <Line
                                type='line'
                                data={
                                    { labels: records.map((x: ExchangeRateRecordVo) => toDateStr(x.date)), datasets }
                                }
                                options={{
                                    responsive: true,
                                    animation: {
                                        duration: 0
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
                                                    const hoverDate = new Date(context.tooltip.title[0]);
                                                    const mouseIndex = records.findIndex(x => x.date.getTime() === hoverDate.getTime());
                                                    if (hoveredIndex !== mouseIndex) {
                                                        this.setState({ hoveredIndex: mouseIndex });
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    borderColor: black(0.9),
                                    radius: 0,
                                    borderWidth: 1
                                }}
                            />
                        </div>
                    </Col>
                    <Col sm={2} md={2}>
                        {
                            hoveredIndex > 0 && hoveredIndex < records.length &&
                            <Row>
                                <Col>
                                    <ListGroup>
                                        <ListGroupItem action variant='info'>
                                            <InfoCircleIcon />
                                            <span className='h3'> {toDateStr(records[hoveredIndex].date)}</span>
                                        </ListGroupItem>
                                        <ListGroupItem action variant='secondary'>
                                            <h5>Current Price: {records[hoveredIndex].cashSell}</h5>
                                            <h5>MA5: {records[hoveredIndex].ma5}</h5>
                                            <h5>MA10: {records[hoveredIndex].ma10}</h5>
                                            <h5>MA20: {records[hoveredIndex].ma20}</h5>
                                            <h5>MA40: {records[hoveredIndex].ma40}</h5>
                                            <h5>MA60: {records[hoveredIndex].ma60}</h5>
                                            <h5>B.Brand Up: {records[hoveredIndex].bbup}</h5>
                                            <h5>B.Brand Down: {records[hoveredIndex].bbdown}</h5>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                            </Row>
                        }
                    </Col>
                </Row>
            </>
        );
    }
}
