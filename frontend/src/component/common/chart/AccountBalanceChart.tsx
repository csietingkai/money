import * as React from 'react';
import { Pie } from 'react-chartjs-2';

import { Account } from 'api/account';

import { blue, green, orange, pink, purple, red, sumByKey, yellow } from 'util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from 'util/Constant';
import { ExchangeRateVo } from 'api/exchangeRate';

const colors = [blue, purple, pink, red, orange, yellow, green];
const getColor = (dataCnt: number, index: number): string => {
    const totalRound = (dataCnt - dataCnt % colors.length) / colors.length + 1;
    const currentRound = (index - index % colors.length) / colors.length;
    return colors[index % colors.length](1 - currentRound / totalRound);
};
export interface AccountBalanceChartProps {
    exchangeRateList: ExchangeRateVo[];
    accounts: Account[];
}

export interface AccountBalanceChartState { }

export default class AccountBalanceChart extends React.Component<AccountBalanceChartProps, AccountBalanceChartState> {

    constructor(props: AccountBalanceChartProps) {
        super(props);
        this.state = {};
    }

    private convertLabel = (data: Account[]): string[] => {
        return data.map(x => x.name);
    };

    private sumBalance = (data: Account[]): number => {
        return sumByKey(data, 'balance');
    };

    private convertData = (data: Account[]) => {
        const numberData: number[] = [];
        const colorData: string[] = [];
        data.forEach((x, i) => {
            let rate: number = 1;
            const currency = this.getExchangeRate(x.currency);
            if (currency) {
                rate = currency.record.spotSell;
            }
            numberData.push(x.balance * rate);
            colorData.push(getColor(data.length, i));
        });
        return [{ data: numberData, backgroundColor: colorData }];
    };

    private getExchangeRate = (currency: string): ExchangeRateVo => {
        return this.props.exchangeRateList.find(e => e.currency === currency);
    };

    render(): JSX.Element {
        const { accounts } = this.props;
        const sortedAccounts = [...accounts].sort((a, b) => {
            let rateA: number = 1;
            const currencyA = this.getExchangeRate(a.currency);
            if (currencyA) {
                rateA = currencyA.record.spotSell;
            }
            let rateB: number = 1;
            const currencyB = this.getExchangeRate(b.currency);
            if (currencyB) {
                rateB = currencyB.record.spotSell;
            }
            return b.balance * rateB - a.balance * rateA;
        });
        const totalBalance = this.sumBalance(sortedAccounts);
        const data = {
            labels: this.convertLabel(sortedAccounts),
            datasets: this.convertData(sortedAccounts)
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
                                        const percent = ((hoveredBalance / totalBalance) * 100).toFixed(DEFAULT_DECIMAL_PRECISION);
                                        return `${label}: ${formattedValue} (${percent}%)`;
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
