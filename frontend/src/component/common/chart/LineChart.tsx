import * as React from 'react';
import { Line } from 'react-chartjs-2';

import { toDateStr } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';
import { Record } from 'util/Interface';

export interface LineChartProps {
    stockStyle: StockStyle,
    data: Record<Date, number>[];
}

export interface LineChartState { }

export default class LineChart extends React.Component<LineChartProps, LineChartState> {

    constructor(props: LineChartProps) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        const { data: records } = this.props;
        return (
            <div className='chart-wrapper'>
                <Line
                    data={
                        {
                            labels: records.map((x: Record<Date, number>) => toDateStr(x.key)),
                            datasets: [
                                {
                                    label: '',
                                    data: records.map((x: Record<Date, number>) => x.value)
                                }
                            ]
                        }
                    }
                    options={{
                        responsive: true,
                        animation: {
                            duration: 0
                        }
                    }}
                />
            </div>
        );
    }
}
