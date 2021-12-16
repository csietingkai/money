import * as React from 'react';
import { Pie } from 'react-chartjs-2';

import { FundVo, UserFundVo } from 'api/fund';

import { blue, green, numberComma, orange, pink, purple, red, sum, yellow } from 'util/AppUtil';
import { ExchangeRateVo } from 'api/exchangeRate';

const colors = [blue, purple, pink, red, orange, yellow, green];
const getColor = (dataCnt: number, index: number): string => {
    const totalRound = (dataCnt - dataCnt % colors.length) / colors.length + 1;
    const currentRound = (index - index % colors.length) / colors.length;
    return colors[index % colors.length](1 - currentRound / totalRound);
};

export interface FundOwnChartProps {
    exchangeRateList: ExchangeRateVo[];
    fundList: FundVo[];
    ownList: UserFundVo[];
}

export interface FundOwnChartState { }

export default class FundOwnChart extends React.Component<FundOwnChartProps, FundOwnChartState> {

    constructor(props: FundOwnChartProps) {
        super(props);
        this.state = {};
    }

    private getLegendStr = (vo: UserFundVo): string => {
        return `${vo.fundName}(${vo.fundCode})`;
    };

    private convertLabel = (data: UserFundVo[]): string[] => {
        return data.map(this.getLegendStr);
    };

    private sumBalance = (data: UserFundVo[]): number => {
        return sum(data.map(x => {
            let rate: number = 1;
            const fund = this.getFundInfo(x.fundCode);
            const currency = this.getExchangeRate(fund?.currency);
            if (currency) {
                rate = currency.record.spotSell;
            }
            return x.price * x.amount * rate;
        }));
    };

    private convertData = (data: UserFundVo[]) => {
        const numberData: number[] = [];
        const colorData: string[] = [];
        data.forEach((x, i) => {
            let rate: number = 1;
            const fund = this.getFundInfo(x.fundCode);
            const currency = this.getExchangeRate(fund?.currency);
            if (currency) {
                rate = currency.record.spotSell;
            }
            numberData.push(x.amount * x.price * rate);
            colorData.push(getColor(data.length, i));
        });
        return [{ data: numberData, backgroundColor: colorData }];
    };

    private getFundInfo = (fundCode: string): FundVo => {
        return this.props.fundList.find(x => x.code === fundCode);
    };

    private getExchangeRate = (currency: string): ExchangeRateVo => {
        return this.props.exchangeRateList.find(e => e.currency === currency);
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
                                        const percent = ((hoveredBalance / totalBalance) * 100).toFixed(1);
                                        return `${label}: ${formattedValue} (${numberComma(share)}s ${percent}%)`;
                                    }
                                }
                            }
                        },
                        animation: { duration: 0 }
                    }}
                />
            </div>
        );
    }
}
