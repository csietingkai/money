import { ChartDataSets } from 'chart.js';
import * as React from 'react';
import { Scatter as Scatter } from 'react-chartjs-2';

const POINT_RADIUS: number = 2;
const POINT_RADIUS_HOVER_DIFF: number = 0;

export interface ScatterData {
    label: string;
    color: { red: number, green: number, blue: number; },
    data: ({ x: number, y: number; })[];
}

export interface ScatterChartProps {
    datasets: ScatterData[];
}

export interface ScatterChartState { }

export default class ScatterChart extends React.Component<ScatterChartProps, ScatterChartState> {

    constructor(props: ScatterChartProps) {
        super(props);
        this.state = {};
    }

    private combineData = (data: ScatterData): ChartDataSets => {
        const newData: ChartDataSets = { ...data };

        if (data.color) {
            const { red, green, blue } = data.color;
            const color = (alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newData.borderColor = color(0.4);
            newData.backgroundColor = color(1);
        }

        newData.pointRadius = POINT_RADIUS;
        newData.pointHoverRadius = POINT_RADIUS + POINT_RADIUS_HOVER_DIFF;

        return newData;
    };

    render() {
        const { datasets } = this.props;
        const data = {
            datasets: datasets.map((x: ScatterData) => this.combineData(x))
        };
        return (
            <div className='chart-wrapper'>
                <Scatter data={data} />
            </div>
        );
    }
}
