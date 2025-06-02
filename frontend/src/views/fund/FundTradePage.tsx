import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { ReduxState, getAccountList, getAuthTokenId, getFundTradeCondition, getUserSetting } from '../../reducer/Selector';
import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import { SetAccountListDispatcher, SetNotifyDispatcher, SetOwnFundListDispatcher } from '../../reducer/PropsMapper';
import { UserSetting } from '../../api/auth';
import { Account } from '../../api/account';
import { UserFundVo } from '../../api/fund';
import { Action } from '../../util/Interface';
import FundTradeCondition, { TradeType } from './interface/FundTradeCondition';
import FundBonusForm from './trade/FundBonusForm';
import FundBuyForm from './trade/FundBuyForm';
import FundSellForm from './trade/FundSellForm';
import { FormattedMessage } from 'react-intl';

export interface FundTradePageProps {
    userId: string;
    userSetting: UserSetting;
    accounts: Account[];
    tradeCondition?: FundTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnFundList: (ownList: UserFundVo[]) => void;
    notify: (message: string) => void;
}

export interface FundTradePageState {
    activeTab: TradeType;
}

class FundTradePage extends React.Component<FundTradePageProps, FundTradePageState> {

    constructor(props: FundTradePageProps) {
        super(props);
        const { tradeCondition } = props;
        this.state = {
            activeTab: tradeCondition?.type || 'buy',
        };
    }

    render(): React.ReactNode {
        const { userId, userSetting, accounts, tradeCondition, setAccountList, setOwnFundList, notify } = this.props;
        const { activeTab } = this.state;
        return (
            <React.Fragment>
                <CNav variant='pills' layout='fill' className='pb-2 border-bottom border-secondary border-bottom-2'>
                    <CNavItem>
                        <CNavLink active={activeTab === 'buy'} onClick={() => this.setState({ activeTab: 'buy' })}>
                            <FormattedMessage id='FundTradePage.buyTab' />
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink active={activeTab === 'sell'} onClick={() => this.setState({ activeTab: 'sell' })}>
                            <FormattedMessage id='FundTradePage.sellTab' />
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink active={activeTab === 'bonus'} onClick={() => this.setState({ activeTab: 'bonus' })}>
                            <FormattedMessage id='FundTradePage.bonusTab' />
                        </CNavLink>
                    </CNavItem>
                </CNav>
                <CTabContent>
                    <CTabPane visible={activeTab === 'buy'} className='mt-2 col-xl-6 mx-auto'>
                        <FundBuyForm
                            userSetting={userSetting}
                            accounts={accounts}
                            tradeCondition={tradeCondition}
                            setAccountList={setAccountList}
                            setOwnFundList={setOwnFundList}
                            notify={notify}
                        />
                    </CTabPane>
                    <CTabPane visible={activeTab === 'sell'} className='mt-2 col-xl-6 mx-auto'>
                        <FundSellForm
                            userSetting={userSetting}
                            accounts={accounts}
                            tradeCondition={tradeCondition}
                            setAccountList={setAccountList}
                            setOwnFundList={setOwnFundList}
                            notify={notify}
                        />
                    </CTabPane>
                    <CTabPane visible={activeTab === 'bonus'} className='mt-2 col-xl-6 mx-auto'>
                        <FundBonusForm
                            userSetting={userSetting}
                            accounts={accounts}
                            tradeCondition={tradeCondition}
                            setAccountList={setAccountList}
                            setOwnFundList={setOwnFundList}
                            notify={notify}
                        />
                    </CTabPane>
                </CTabContent>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        userSetting: getUserSetting(state),
        accounts: getAccountList(state),
        tradeCondition: getFundTradeCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | string | UserFundVo[] | FundTradeCondition | undefined>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setOwnFundList: SetOwnFundListDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundTradePage);
