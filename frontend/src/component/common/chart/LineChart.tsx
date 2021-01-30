import * as React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartDataSets } from 'chart.js';

const FILL_CHART: boolean = false;
const POINT_RADIUS: number = 2;
const POINT_RADIUS_HOVER_DIFF: number = 0;
const LINE_WIDTH: number = 2;
const LINE_TENSION: number = 0;

export interface LineData {
    label: string;
    fill?: boolean;
    lineTension?: number;
    color: { red: number, green: number, blue: number; },
    data: number[];
}

export interface LineChartProps {
    xAxisLabels: string[];
    datasets: LineData[];
}

export interface LineChartState { }

export default class LineChart extends React.Component<LineChartProps, LineChartState> {

    constructor(props: LineChartProps) {
        super(props);
        this.state = {};
    }

    private combineData = (data: LineData): ChartDataSets => {
        const newData: ChartDataSets = { ...data };
        if (!data.fill) { newData.fill = FILL_CHART; }
        if (!data.lineTension) { newData.lineTension = LINE_TENSION; }

        if (data.color) {
            const { red, green, blue } = data.color;
            const color = (alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newData.backgroundColor = color(0.4);
            newData.borderColor = color(1);
        }

        newData.pointRadius = POINT_RADIUS;
        newData.pointHoverRadius = POINT_RADIUS + POINT_RADIUS_HOVER_DIFF;
        newData.borderWidth = LINE_WIDTH;

        return newData;
    };

    render() {
        const { xAxisLabels, datasets } = this.props;
        const data = {
            labels: xAxisLabels,
            datasets: datasets.map((x: LineData) => this.combineData(x))
        };
        return (
            <div className='chart-wrapper'>
                <Line data={data} />
            </div>
        );
    }
}
