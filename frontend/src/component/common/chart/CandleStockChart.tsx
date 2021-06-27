import * as React from 'react';
import { Bar } from 'react-chartjs-2';

import { StockRecord } from 'api/stock';

import { toDateStr } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';

export interface CandleStickChartProps {
    stockStyle: StockStyle,
    data: StockRecord[];
}

export interface CandleStickChartState { }

export default class CandleStickChart extends React.Component<CandleStickChartProps, CandleStickChartState> {

    constructor(props: CandleStickChartProps) {
        super(props);
        this.state = {};
    }

    private getStickColor = (record: StockRecord, style: StockStyle = this.props.stockStyle) => {
        let color: string = 'black';
        if (style === StockStyle.TW) {
            if (record.openPrice > record.closePrice) {
                color = 'green';
            } else if (record.openPrice < record.closePrice) {
                color = 'red';
            }
        } else {
            if (record.openPrice > record.closePrice) {
                color = 'red';
            } else if (record.openPrice < record.closePrice) {
                color = 'green';
            }
        }
        return color;
    };

    render(): JSX.Element {
        const { data: records } = this.props;
        return (
            <div className='chart-wrapper'>
                <Bar
                    type='bar'
                    data={
                        {
                            labels: records.map((x: StockRecord) => toDateStr(x.dealDate)),
                            datasets: [
                                {
                                    label: 'open and close',
                                    data: records.map((x: StockRecord) => [x.openPrice, x.closePrice]),
                                    backgroundColor: records.map((x: StockRecord) => this.getStickColor(x))
                                },
                                {
                                    label: 'high and low',
                                    barPercentage: 0.1,
                                    data: records.map((x: StockRecord) => [x.highPrice, x.lowPrice]),
                                    backgroundColor: records.map((x: StockRecord) => this.getStickColor(x))
                                }
                            ]
                        }
                    }
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                stacked: true
                            },
                            y: {
                                beginAtZero: false
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                displayColors: false,
                                intersect: false,
                                callbacks: {
                                    label: (context: any) => {
                                        const { datasetIndex, dataset: { data }, dataIndex } = context;
                                        let text1 = '';
                                        let text2 = '';
                                        if (datasetIndex === 0) {
                                            text1 += 'open price: ';
                                            text2 += 'close price: ';
                                        } else if (datasetIndex === 1) {
                                            text1 += 'high price: ';
                                            text2 += 'low price: ';
                                        }
                                        text1 += data[dataIndex][0];
                                        text2 += data[dataIndex][1];
                                        return [text1, text2];
                                    }
                                }
                            }
                        },
                        animation: {
                            duration: 0
                        }
                    }}
                />
            </div>
        );
    }
}
