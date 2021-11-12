import * as React from 'react';
import { Pie } from 'react-chartjs-2';

import { Account } from 'api/account';

import { blue, green, orange, purple, red, sumByKey } from 'util/AppUtil';

const colors = [blue(), green(), orange(), red(), purple()];

export interface AccountBalanceChartProps {
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
            numberData.push(x.balance);
            colorData.push(colors[i]);
        });
        return [{ data: numberData, backgroundColor: colorData }];
    };

    render(): JSX.Element {
        const { accounts } = this.props;
        const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);
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
                                        const totalBalance = this.sumBalance(sortedAccounts);
                                        const percent = Math.round((hoveredBalance / totalBalance) * 100);
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
