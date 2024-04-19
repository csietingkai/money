import React, { Dispatch } from 'react';
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBank } from '@coreui/icons';
import { connect } from 'react-redux';
import { Account } from '../api/account';
import { SetNotifyDispatcher } from '../reducer/PropsMapper';
import { ReduxState, getAccountList } from '../reducer/Selector';
import { Action } from '../util/Interface';
import * as AppUtil from '../util/AppUtil';
import { stock } from '../assets/brand/stock';
import { fund } from '../assets/brand/fund';

export interface AccountBalance {
    value: string;
    desc: string;
}

export interface DashboardProps {
    accountList: Account[];
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
                                        <div className='text-uppercase text-body-secondary small'>
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
        const { accountList } = this.props;
        const accountBalances = this.getTotalAccountBalance(accountList);
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('account-card', accountBalances)}
                    </CCol>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('stock-card', [
                            { value: '100,000', desc: 'Total TWD' },
                            { value: '10,000', desc: 'TSMC' }
                        ], stock)}
                    </CCol>
                    <CCol sm={6} xl={4}>
                        {this.balanceCard('fund-card', [
                            { value: '100,000', desc: 'MAI070' },
                            { value: '10,000', desc: 'TSMC' }
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
        accountList: getAccountList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<string>>) => {
    return {
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
