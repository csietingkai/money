import Chart from 'chart.js/auto';
import * as React from 'react';
import { Bar } from 'react-chartjs-2';

import { StockRecord } from 'api/stock';

import { toDateStr } from 'util/AppUtil';

export interface CandleStickChartProps {
    data: StockRecord[];
}

export interface CandleStickChartState { }

export default class CandleStickChart extends React.Component<CandleStickChartProps, CandleStickChartState> {

    constructor(props: CandleStickChartProps) {
        super(props);
        this.state = {};
    }

    render() {
        const { data: records } = this.props;
        const labels: string[] = records.map((x: StockRecord) => toDateStr(x.dealDate));
        const datasets: Chart.ChartData = [];
        datasets.push({
            label: 'open and close',
            data: records.map((x: StockRecord) => [x.openPrice, x.closePrice]),
            backgroundColor: records.map((x: StockRecord) => {
                let color: string = 'black';
                if (x.openPrice > x.closePrice) {
                    color = 'red';
                } else if (x.openPrice < x.closePrice) {
                    color = 'green';
                }
                return color;
            })
        });
        datasets.push({
            label: 'high and low',
            barPercentage: 0.1,
            data: records.map((x: StockRecord) => [x.highPrice, x.lowPrice]),
            backgroundColor: records.map((x: StockRecord) => {
                let color: string = 'black';
                if (x.openPrice > x.closePrice) {
                    color = 'red';
                } else if (x.openPrice < x.closePrice) {
                    color = 'green';
                }
                return color;
            })
        });
        const data = { labels, datasets };
        return (
            <div className='chart-wrapper'>
                <Bar
                    type='bar'
                    data={data}
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
