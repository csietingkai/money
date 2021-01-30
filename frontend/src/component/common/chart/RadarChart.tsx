import * as React from 'react';
import { Line, Radar } from 'react-chartjs-2';
import { ChartDataSets } from 'chart.js';

const POINT_RADIUS: number = 2;
const POINT_RADIUS_HOVER_DIFF: number = 0;
const LINE_WIDTH: number = 2;

export interface RadarData {
    label: string;
    color: { red: number, green: number, blue: number; },
    data: number[];
}

export interface RadarChartProps {
    roundLabels: string[];
    datasets: RadarData[];
}

export interface RadarChartState { }

export default class RadarChart extends React.Component<RadarChartProps, RadarChartState> {

    constructor(props: RadarChartProps) {
        super(props);
        this.state = {};
    }

    private combineData = (data: RadarData): ChartDataSets => {
        const newData: ChartDataSets = { ...data };

        if (data.color) {
            const { red, green, blue } = data.color;
            const color = (alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
            newData.backgroundColor = color(0.2);
            newData.borderColor = color(1);
        }

        return newData;
    };

    render() {
        const { roundLabels, datasets } = this.props;
        const data = {
            labels: roundLabels,
            datasets: datasets.map((x: RadarData) => this.combineData(x))
        };
        return (
            <div className='chart-wrapper'>
                <Radar data={data} />
            </div>
        );
    }
}
