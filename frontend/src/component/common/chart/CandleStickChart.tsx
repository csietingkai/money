import * as React from 'react';
import Chart from 'react-google-charts';

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
        const { data } = this.props;
        let chart = null;
        if (data.length) {
            const chartData: any[] = [
                ['date', 'low', 'open', 'close', 'high']
            ];
            data.forEach(element => {
                const row: any[] = [
                    toDateStr(element.dealDate),
                    element.lowPrice,
                    element.openPrice,
                    element.closePrice,
                    element.highPrice
                ];
                chartData.push(row);
            });
            chart = (
                <Chart
                    width={'100%'}
                    height={500}
                    chartType='CandlestickChart'
                    loader={<div>Loading Chart</div>}
                    data={chartData}
                    options={{
                        legend: 'none',
                        candlestick: {
                            fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
                            risingColor: { strokeWidth: 0, fill: '#0f9d58' }, // green
                        },
                    }}
                    rootProps={{ 'data-testid': '1' }}
                />
            );
        }
        return (
            <div className='chart-wrapper'>
                {chart}
            </div>
        );
    }
}
