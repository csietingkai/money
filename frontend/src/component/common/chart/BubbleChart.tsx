import { ChartDataSets } from 'chart.js';
import * as React from 'react';
import { Bubble } from 'react-chartjs-2';

export interface BubbleData {
    label: string;
    color: { red: number, green: number, blue: number; },
    data: ({ x: number, y: number, r: number; })[];
}

export interface BubbleChartProps {
    datasets: BubbleData[];
}

export interface BubbleChartState { }

export default class BubbleChart extends React.Component<BubbleChartProps, BubbleChartState> {

    constructor(props: BubbleChartProps) {
        super(props);
        this.state = {};
    }

    private combineData = (data: BubbleData): ChartDataSets => {
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
        const { datasets } = this.props;
        const data = {
            datasets: datasets.map((x: BubbleData) => this.combineData(x))
        };
        return (
            <div className='chart-wrapper'>
                <Bubble data={data} />
            </div>
        );
    }
}
