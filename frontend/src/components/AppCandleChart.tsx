import React from 'react';
import { CChartBar } from '@coreui/react-chartjs';
import { StockRecordVo } from '../api/stock';
import * as AppUtil from '../util/AppUtil';
import { StockType } from '../util/Enum';

export interface AppCandleChartProps {
    stockType: string;
    stockRecords: StockRecordVo[];
}

export interface AppCandleChartState { }

class AppCandleChart extends React.Component<AppCandleChartProps, AppCandleChartState> {

    constructor(props: AppCandleChartProps) {
        super(props);
    }

    private getStickColor = (record: StockRecordVo, style = this.props.stockType) => {
        let color: string = 'black';
        if (style === StockType.TW) {
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

    render(): React.ReactNode {
        const { stockRecords } = this.props;
        const datasets: any[] = [
            {
                label: 'open and close',
                type: 'bar',
                data: stockRecords.map((x: StockRecordVo) => [x.openPrice, x.closePrice]),
                backgroundColor: stockRecords.map((x: StockRecordVo) => this.getStickColor(x)),
                minBarLength: 1
            },
            {
                label: 'high and low',
                type: 'bar',
                barPercentage: 0.1,
                data: stockRecords.map((x: StockRecordVo) => [x.highPrice, x.lowPrice]),
                backgroundColor: stockRecords.map((x: StockRecordVo) => this.getStickColor(x))
            }
        ];
        const labels = stockRecords.map((x: StockRecordVo) => AppUtil.toDateStr(x.dealDate));
        return (
            <React.Fragment>
                <CChartBar
                    data={{ labels, datasets }}
                    options={{
                        scales: {
                            x: { stacked: true },
                            y: { beginAtZero: false }
                        },
                        interaction: {
                            intersect: true,
                            mode: 'index'
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: true,
                            }
                        }
                    }}
                />
            </React.Fragment>
        );
    }
}

export const handleStockData = (records: StockRecordVo[]) => {

};

export default AppCandleChart;
