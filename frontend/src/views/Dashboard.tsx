import React, { Dispatch } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CNav, CNavItem, CNavLink, CProgress, CProgressBar, CRow, CTabContent, CTabPane } from '@coreui/react';
import Chart from 'react-google-charts';
import CIcon from '@coreui/icons-react';
import { cilBank } from '@coreui/icons';
import { connect } from 'react-redux';
import { SetNotifyDispatcher } from '../reducer/PropsMapper';
import { ReduxState, getAccountList, getFundOwnList, getStockOwnList } from '../reducer/Selector';
import AccountApi, { Account, MonthBalanceVo } from '../api/account';
import { UserStockVo } from '../api/stock';
import { UserFundVo } from '../api/fund';
import * as AppUtil from '../util/AppUtil';
import { Action } from '../util/Interface';
import { CHART_COLORS, DEFAULT_DECIMAL_PRECISION } from '../util/Constant';
import { stock } from '../assets/brand/stock';
import { fund } from '../assets/brand/fund';

export interface AccountBalance {
    value: string;
    desc: string;
}

export interface DashboardProps {
    accountList: Account[];
    ownStockList: UserStockVo[];
    ownFundList: UserFundVo[];
}

export interface DashboardState {
    monthBalance: MonthBalanceVo;
    activeTab: { income: string, expend: string; };
}

class Dashboard extends React.Component<DashboardProps, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);
        const now = new Date();
        const ym = `${now.getFullYear()}${AppUtil.prefixZero(now.getMonth() + 1)}`;
        this.state = {
            monthBalance: { sums: [], details: [] },
            activeTab: { income: ym, expend: ym }
        };
        this.init();
    }

    private init = async () => {
        const { success, data } = await AccountApi.getMonthBalance(6);
        if (success) {
            this.setState({ monthBalance: data });
        }
    };

    private getTotalAccountBalance = (accountList: Account[]): { value: string, desc: string; }[] => {
        const balances: { value: string, desc: string; }[] = [];
        const m = {};
        for (const a of accountList) {
            if (!m[a.currency]) {
                m[a.currency] = 0;
            }
            m[a.currency] += a.balance;
        }
        for (const key in m) {
            if (m[key]) {
                balances.push({ value: AppUtil.numberComma(m[key]), desc: key });
            }
        }
        return balances;
    };

    private getTotalStockValue = (ownStockList: UserStockVo[]): { total: number, benifit: number, percentage: number; } => {
        const data: { total: number, benifit: number, percentage: number; } = { total: 0, benifit: 0, percentage: 0 };
        let cost: number = 0;
        for (const s of ownStockList) {
            const total: number = s.amount * s.price;
            data.total += total;
            cost += s.cost;
        }
        data.total = AppUtil.toNumber(data.total.toFixed(DEFAULT_DECIMAL_PRECISION));
        data.benifit = AppUtil.toNumber((data.total - cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        data.percentage = AppUtil.toNumber((data.benifit * 100 / cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        return data;
    };

    private getTotalFundValue = (ownStockList: UserFundVo[]): { total: number, benifit: number, percentage: number; } => {
        const data: { total: number, benifit: number, percentage: number; } = { total: 0, benifit: 0, percentage: 0 };
        let cost: number = 0;
        for (const s of ownStockList) {
            const total: number = s.amount * s.price;
            data.total += total;
            cost += s.cost;
        }
        data.total = AppUtil.toNumber(data.total.toFixed(DEFAULT_DECIMAL_PRECISION));
        data.benifit = AppUtil.toNumber((data.total - cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        data.percentage = AppUtil.toNumber((data.benifit * 100 / cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        return data;
    };

    private balanceCard = (key: string, values: AccountBalance[], icon: string[] = cilBank): React.ReactNode => {
        return (
            <CCard key={key}>
                <CCardHeader className='position-relative d-flex justify-content-center align-items-center bg-primary'>
                    <CIcon icon={icon} height={52} className='my-4 text-white' />
                </CCardHeader>
                <CCardBody className='row text-center'>
                    {
                        values.map((a, idx) => {
                            let vr: React.ReactNode = null;
                            if (idx !== 0) {
                                vr = (<div className='vr'></div>);
                            }
                            return (
                                <React.Fragment key={`${key}-${idx}`}>
                                    {vr}
                                    <CCol>
                                        <div className='fs-5 fw-semibold'>
                                            {a.value}
                                        </div>
                                        <div className='text-uppercase text-body-secondary small' >
                                            {a.desc}
                                        </div>
                                    </CCol>
                                </React.Fragment>
                            );
                        })
                    }
                </CCardBody>
            </CCard>
        );
    };

    private monthDetailChart = (key: 'income' | 'expend'): React.ReactNode => {
        const { monthBalance, activeTab } = this.state;
        const yms = monthBalance.details.map(x => `${x.year}${AppUtil.prefixZero(x.month)}`);
        const ymLabels = monthBalance.details.map(x => `${x.year}/${AppUtil.prefixZero(x.month)}`);
        const dataHeader = ['Record Type', `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`];
        const data = {};
        monthBalance.details.forEach(x => {
            const ym = `${x.year}${AppUtil.prefixZero(x.month)}`;
            data[ym] = [[...dataHeader]];
            for (const recordType in x[key]) {
                data[ym].push([recordType, x[key][recordType]]);
            }
        });

        for (const ym in data) {
            let sum: number = 0;
            for (let i = 1; i < data[ym].length; i++) {
                sum += data[ym][i][1];
            }
            for (let i = 1; i < data[ym].length; i++) {
                data[ym][i].percent = AppUtil.toNumber((data[ym][i][1] / sum * 100).toFixed(DEFAULT_DECIMAL_PRECISION));
            }
        }

        const options = {
            legend: {
                position: 'right',
                alignment: 'center'
            },
            colors: CHART_COLORS
        };
        return (
            <CCard>
                <CCardBody className='text-center'>
                    <CRow className='mb-2'>
                        <CCol sm={12}>
                            <h4 className='mb-0'>
                                Month {`${key.slice(0, 1).toUpperCase()}${key.slice(1)}`} Detail
                            </h4>
                        </CCol>
                    </CRow>
                    <React.Fragment>
                        <CNav variant='underline-border' layout='justified'>
                            {
                                yms.map((r, idx) => {
                                    return (
                                        <CNavItem key={`${key}-${r}-tab`}>
                                            <CNavLink active={activeTab[key] === r} onClick={() => this.setState({ activeTab: { ...activeTab, [key]: r } })}>{ymLabels[idx]}</CNavLink>
                                        </CNavItem>
                                    );
                                })
                            }
                        </CNav>
                        <CTabContent>
                            {
                                yms.map(r => {
                                    return (
                                        <CTabPane key={`${key}-${r}-tabcontent`} visible={activeTab[key] === r} className='mt-2 col-xs-12 mx-auto'>
                                            <Chart
                                                chartType='PieChart'
                                                chartVersion='51'
                                                data={data[r]}
                                                options={options}
                                                width={'100%'}
                                                height={'400px'}
                                            />
                                            {
                                                data[r].map((series, si) =>
                                                    si !== 0 && (
                                                        <div className='progress-group' key={`${key}-${r}-series-${si}`}>
                                                            <div className='progress-group-header'>
                                                                <span>{series[0]}</span>
                                                                <span className='ms-auto fw-semibold'>
                                                                    {AppUtil.numberComma(series[1])}{' '}
                                                                    <span className='text-body-secondary small'>({series.percent}%)</span>
                                                                </span>
                                                            </div>
                                                            <div className='progress-group-bars'>
                                                                <CProgress thin value={series.percent}>
                                                                    <CProgressBar style={{ width: `${series.percent}%`, background: CHART_COLORS[(si - 1) % CHART_COLORS.length] }} />
                                                                </CProgress>
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            }
                                        </CTabPane>
                                    );
                                })
                            }
                        </CTabContent>
                    </React.Fragment>
                </CCardBody>
            </CCard>
        );
    };

    private monthSumChart = (): React.ReactNode => {
        const { monthBalance } = this.state;
        const data = [
            ['', 'Income', 'Expend', 'Surplus'],
            ...monthBalance.sums.map(x => [`${x.year}${AppUtil.prefixZero(x.month)}`, x.income, x.expend, x.surplus])
        ];
        const options = {
            seriesType: 'bars',
            series: { 2: { type: 'line', curveType: 'function' } },
        };
        return (
            <CCard>
                <CCardBody className='text-center'>
                    <CRow className='mb-3'>
                        <CCol sm={12}>
                            <h4 className='mb-0'>
                                Monthly Summary
                            </h4>
                        </CCol>
                    </CRow>
                    <Chart
                        chartType='ComboChart'
                        chartVersion='51'
                        data={data}
                        options={options}
                        width={'100%'}
                        height={'400px'}
                    />
                </CCardBody>
            </CCard>
        );
    };

    render(): React.ReactNode {
        const { accountList, ownStockList, ownFundList } = this.props;
        const accountBalances = this.getTotalAccountBalance(accountList);
        const { total: totalStockValue, benifit: totalStockBenifit, percentage: totalStockPercentage } = this.getTotalStockValue(ownStockList);
        const { total: totalFundValue, benifit: totalFundBenifit, percentage: totalFundPercentage } = this.getTotalFundValue(ownFundList);
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('account-card', accountBalances)}
                    </CCol>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('stock-card', [
                            { value: AppUtil.numberComma(totalStockValue), desc: 'Current Value' },
                            { value: AppUtil.numberComma(totalStockBenifit), desc: `Benifit: ${AppUtil.numberComma(totalStockPercentage)}%` }
                        ], stock)}
                    </CCol>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('fund-card', [
                            { value: AppUtil.numberComma(totalFundValue), desc: 'Current Value' },
                            { value: AppUtil.numberComma(totalFundBenifit), desc: `Benifit: ${AppUtil.numberComma(totalFundPercentage)}%` }
                        ], fund)}
                    </CCol>
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol md={6}>
                        {this.monthDetailChart('income')}
                    </CCol>
                    <CCol md={6}>
                        {this.monthDetailChart('expend')}
                    </CCol>
                    <CCol>
                        {this.monthSumChart()}
                    </CCol>
                </CRow>
                {/* TODO 本月消費類別 */}
                {/* TODO 近六個月支出收入 */}
            </React.Fragment>
        );
    }
} const mapStateToProps = (state: ReduxState) => {
    return {
        accountList: getAccountList(state),
        ownStockList: getStockOwnList(state),
        ownFundList: getFundOwnList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<string>>) => {
    return {
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
