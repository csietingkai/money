import { ChartDataSets } from 'chart.js';
import * as React from 'react';
import { Bar, HorizontalBar } from 'react-chartjs-2';

export interface BarData {
    label: string;
    color: { red: number, green: number, blue: number; },
    data: number[];
}

export interface BarChartProps {
    horizontal?: boolean;
    xAxisLabels: string[];
    datasets: BarData[];
}

export interface BarChartState { }

export default class BarChart extends React.Component<BarChartProps, BarChartState> {

    public static defaultProps: Partial<BarChartProps> = {
        horizontal: false
    };

    constructor(props: BarChartProps) {
        super(props);
        this.state = {};
    }

    private combineData = (data: BarData): ChartDataSets => {
        const newData: ChartDataSets = { ...data };

        if (data.color) {
            const { red, green, blue } = data.color;
            const color = (alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newData.borderColor = color(0.4);
            newData.backgroundColor = color(1);
        }

        return newData;
    };

    render() {
        const { horizontal, xAxisLabels, datasets } = this.props;
        const data = {
            labels: xAxisLabels,
            datasets: datasets.map((x: BarData) => this.combineData(x))
        };
        return (
            <div className='chart-wrapper'>
                {horizontal ? <HorizontalBar data={data} /> : <Bar data={data} />}
            </div>
        );
    }
}
