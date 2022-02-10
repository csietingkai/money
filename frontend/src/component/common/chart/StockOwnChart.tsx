import * as React from 'react';
import { Pie } from 'react-chartjs-2';

import { UserStockVo } from 'api/stock';

import { blue, green, numberComma, orange, pink, purple, red, sum, yellow } from 'util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from 'util/Constant';

const colors = [blue, purple, pink, red, orange, yellow, green];
const getColor = (dataCnt: number, index: number): string => {
    const totalRound = (dataCnt - dataCnt % colors.length) / colors.length + 1;
    const currentRound = (index - index % colors.length) / colors.length;
    return colors[index % colors.length](1 - currentRound / totalRound);
};

export interface StockOwnChartProps {
    ownList: UserStockVo[];
}

export interface StockOwnChartState { }

export default class StockOwnChart extends React.Component<StockOwnChartProps, StockOwnChartState> {

    constructor(props: StockOwnChartProps) {
        super(props);
        this.state = {};
    }

    private getLegendStr = (vo: UserStockVo): string => {
        return `${vo.stockName}(${vo.stockCode})`;
    };

    private convertLabel = (data: UserStockVo[]): string[] => {
        return data.map(this.getLegendStr);
    };

    private sumBalance = (data: UserStockVo[]): number => {
        return sum(data.map(x => x.price * x.amount));
    };

    private convertData = (data: UserStockVo[]) => {
        const numberData: number[] = [];
        const colorData: string[] = [];
        data.forEach((x, i) => {
            numberData.push(x.amount * x.price);
            colorData.push(getColor(data.length, i));
        });
        return [{ data: numberData, backgroundColor: colorData }];
    };

    render(): JSX.Element {
        const { ownList } = this.props;
        const totalBalance = this.sumBalance(ownList);
        const data = {
            labels: this.convertLabel(ownList),
            datasets: this.convertData(ownList)
        };
        return (
            <div className='chart-wrapper'>
                <Pie
                    type='pie'
                    data={data}
                    options={{
                        plugins: {
                            legend: { labels: { font: { size: 16 } } },
                            tooltip: {
                                bodyFont: { size: 16 },
                                callbacks: {
                                    label: (tooltipItem: any) => {
                                        const { label, formattedValue, raw: hoveredBalance } = tooltipItem;
                                        const share = ownList.find(x => this.getLegendStr(x) === label)?.amount;
                                        const percent = ((hoveredBalance / totalBalance) * 100).toFixed(DEFAULT_DECIMAL_PRECISION);
                                        return `${label}: ${formattedValue} (${numberComma(share)}s ${percent}%)`;
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>
        );
    }
}
