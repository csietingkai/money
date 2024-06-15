import React, { Dispatch } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBank } from '@coreui/icons';
import { connect } from 'react-redux';
import { Account } from '../api/account';
import { SetNotifyDispatcher } from '../reducer/PropsMapper';
import { ReduxState, getAccountList, getFundOwnList, getStockOwnList } from '../reducer/Selector';
import { Action } from '../util/Interface';
import * as AppUtil from '../util/AppUtil';
import { stock } from '../assets/brand/stock';
import { fund } from '../assets/brand/fund';
import { UserStockVo } from '../api/stock';
import { UserFundVo } from '../api/fund';
import { DEFAULT_DECIMAL_PRECISION } from '../util/Constant';

export interface AccountBalance {
    value: string;
    desc: string;
}

export interface DashboardProps {
    accountList: Account[];
    ownStockList: UserStockVo[];
    ownFundList: UserFundVo[];
}

export interface DashboardState { }

class Dashboard extends React.Component<DashboardProps, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);
        this.state = {};
    }

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
            balances.push({ value: AppUtil.numberComma(m[key]), desc: key });
        }
        return balances;
    };

    private getTotalStockValue = (ownStockList: UserStockVo[]): { total: number, big: { code: string, value: number; }; } => {
        const data: { total: number, big: { code: string, value: number; }; } = { total: 0, big: { code: '', value: 0 } };
        for (const s of ownStockList) {
            const total: number = s.amount * s.price;
            if (total > data.big.value) {
                data.big.code = `${s.stockCode} ${s.stockName}`;
                data.big.value = total;
            }
            data.total += total;
        }
        data.total = AppUtil.toNumber(data.total.toFixed(DEFAULT_DECIMAL_PRECISION));
        data.big.value = AppUtil.toNumber(data.big.value.toFixed(DEFAULT_DECIMAL_PRECISION));
        data.big.value = AppUtil.toNumber(data.big.value.toFixed(DEFAULT_DECIMAL_PRECISION));
        return data;
    };

    private getTotalFundValue = (ownStockList: UserFundVo[]): { total: number, big: { code: string, value: number; }; } => {
        const data: { total: number, big: { code: string, value: number; }; } = { total: 0, big: { code: '', value: 0 } };
        for (const s of ownStockList) {
            const total: number = s.amount * s.price;
            if (total > data.big.value) {
                data.big.code = `${s.fundCode} ${s.fundName}`;
                data.big.value = total;
            }
            data.total += total;
        }
        data.total = AppUtil.toNumber(data.total.toFixed(DEFAULT_DECIMAL_PRECISION));
        data.big.value = AppUtil.toNumber(data.big.value.toFixed(DEFAULT_DECIMAL_PRECISION));
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

    render(): React.ReactNode {
        const { accountList, ownStockList, ownFundList } = this.props;
        const accountBalances = this.getTotalAccountBalance(accountList);
        const { total: totalStockValue, big: { code: bigStockCode, value: bigStockValue } } = this.getTotalStockValue(ownStockList);
        const { total: totalFundValue, big: { code: bigFundCode, value: bigFundValue } } = this.getTotalFundValue(ownFundList);
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('account-card', accountBalances)}
                    </CCol>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('stock-card', [
                            { value: AppUtil.numberComma(totalStockValue), desc: 'Total TWD' },
                            { value: AppUtil.numberComma(bigStockValue), desc: bigStockCode }
                        ], stock)}
                    </CCol>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('fund-card', [
                            { value: AppUtil.numberComma(totalFundValue), desc: 'Total TWD' },
                            { value: AppUtil.numberComma(bigFundValue), desc: bigFundCode }
                        ], fund)}
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
