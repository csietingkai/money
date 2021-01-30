import * as React from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import { ChartDataSets } from 'chart.js';

export interface PieData {
    label: string;
    color: { red: number, green: number, blue: number; },
    data: number;
}

export interface PieChartProps {
    centerFill?: boolean;
    datasets: PieData[];
}

export interface PieChartState { }

export default class PieChart extends React.Component<PieChartProps, PieChartState> {

    public static defaultProps: Partial<PieChartProps> = {
        centerFill: true
    };

    constructor(props: PieChartProps) {
        super(props);
        this.state = {};
    }

    private convertLabel = (data: PieData[]): string[] => {
        return data.map(x => x.label);
    };

    private convertData = (data: PieData[]): ChartDataSets[] => {
        const numberData: number[] = [];
        const colorData: string[] = [];
        data.forEach(x => {
            numberData.push(x.data);
            if (x.color) {
                const { red, green, blue } = x.color;
                const color = (alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                colorData.push(color(1));
            }
        });
        const newData: ChartDataSets[] = [{ data: numberData, backgroundColor: colorData }];
        return newData;
    };

    render() {
        const { centerFill, datasets } = this.props;
        const data = {
            labels: this.convertLabel(datasets),
            datasets: this.convertData(datasets)
        };
        return (
            <div className='chart-wrapper'>
                {centerFill ? <Pie data={data} /> : <Doughnut data={data} />}
            </div>
        );
    }
}
