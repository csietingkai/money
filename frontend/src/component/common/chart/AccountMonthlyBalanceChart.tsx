import * as React from 'react';
import { Bar } from 'react-chartjs-2';

import { MonthBalanceVo } from 'api/account';
import { ExchangeRateVo } from 'api/exchangeRate';

import { black, green, prefixZero, red, sumMoney } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';

export interface AccountBalanceChartProps {
    exchangeRateList: ExchangeRateVo[];
    monthBalanceList: MonthBalanceVo[];
    diffMode: boolean;
    stockStyle: StockStyle;
}

export interface AccountBalanceChartState { }

export default class AccountBalanceChart extends React.Component<AccountBalanceChartProps, AccountBalanceChartState> {

    constructor(props: AccountBalanceChartProps) {
        super(props);
        this.state = {};
    }

    private convertLabel = (data: MonthBalanceVo[]): string[] => {
        return data.map(x => `${x.year}-${prefixZero(x.month, 2)}`);
    };

    private convertData = () => {
        const { monthBalanceList, exchangeRateList, diffMode } = this.props;
        let data = monthBalanceList;
        if (diffMode) {
            data = monthBalanceList.map(x => {
                const income = sumMoney(x.income.map(x => ({ num: x.amount, currency: x.currency })), exchangeRateList);
                const expend = sumMoney(x.expend.map(x => ({ num: x.amount, currency: x.currency })), exchangeRateList);
                return {
                    ...x,
                    income: [{ currency: 'TWD', amount: income + expend >= 0 ? (income + expend) : 0 }],
                    expend: [{ currency: 'TWD', amount: income + expend < 0 ? (income + expend) : 0 }]
                };
            });
        }
        const income: number[] = data.map(vo => sumMoney(vo.income.map(x => ({ num: x.amount, currency: x.currency })), exchangeRateList));
        const expend: number[] = data.map(vo => sumMoney(vo.expend.map(x => ({ num: x.amount, currency: x.currency })), exchangeRateList));
        return [{ label: 'income', data: income, backgroundColor: this.getColor(0, 1) }, { label: 'expend', data: expend, backgroundColor: this.getColor(1, 0) }];
    };

    private getColor = (cost: number, value: number, stockStyle: StockStyle = this.props.stockStyle): string => {
        let color: string = black();
        if (cost < value) {
            if (stockStyle === StockStyle.TW) {
                color = red();
            } else if (stockStyle === StockStyle.US) {
                color = green();
            }
        } else if (cost > value) {
            if (stockStyle === StockStyle.TW) {
                color = green();
            } else if (stockStyle === StockStyle.US) {
                color = red();
            }
        }
        return color;
    };

    render(): JSX.Element {
        const { monthBalanceList } = this.props;
        const data = {
            labels: this.convertLabel(monthBalanceList),
            datasets: this.convertData()
        };
        return (
            <div className='chart-wrapper'>
                <Bar
                    type='bar'
                    data={data}
                    options={{
                        scales: {
                            x: { stacked: true },
                            y: { beginAtZero: false }
                        },
                        plugins: {
                            legend: { labels: { font: { size: 16 } } },
                            tooltip: { bodyFont: { size: 16 } }
                        },
                        animation: { duration: 0 }
                    }}
                />
            </div>
        );
    }
}
