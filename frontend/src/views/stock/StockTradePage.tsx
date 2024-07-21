import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { ReduxState, getAccountList, getAuthTokenId, getStockTradeCondition } from '../../reducer/Selector';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CNav, CNavItem, CNavLink, CRow, CTabContent, CTabPane } from '@coreui/react';
import { SetAccountListDispatcher, SetNotifyDispatcher, SetOwnStockListDispatcher } from '../../reducer/PropsMapper';
import AccountApi, { Account } from '../../api/account';
import StockApi, { UserStockListResponse, UserStockVo } from '../../api/stock';
import FinancailFileApi from '../../api/financailFile';
import * as AppUtil from '../../util/AppUtil';
import { Action, Option } from '../../util/Interface';
import StockTradeCondition, { TradeType } from './interface/StockTradeCondition';
import StockBuyForm from './trade/StockBuyForm';
import StockSellForm from './trade/StockSellForm';
import StockBonusForm from './trade/StockBonusForm';

export interface StockTradePageProps {
    userId: string;
    accounts: Account[];
    tradeCondition?: StockTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnStockList: (ownList: UserStockVo[]) => void;
    notify: (message: string) => void;
}

export interface StockTradePageState {
    activeTab: TradeType;
}

class StockTradePage extends React.Component<StockTradePageProps, StockTradePageState> {

    constructor(props: StockTradePageProps) {
        super(props);
        const { tradeCondition } = props;
        this.state = {
            activeTab: tradeCondition?.type || 'buy',
        };
    }

    render(): React.ReactNode {
        const { userId, accounts, tradeCondition, setAccountList, setOwnStockList, notify } = this.props;
        const { activeTab } = this.state;
        return (
            <React.Fragment>
                <CNav variant='pills' layout='fill' className='pb-2 border-bottom border-secondary border-bottom-2'>
                    <CNavItem>
                        <CNavLink active={activeTab === 'buy'} onClick={() => this.setState({ activeTab: 'buy' })}>BUY</CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink active={activeTab === 'sell'} onClick={() => this.setState({ activeTab: 'sell' })}>SELL</CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink active={activeTab === 'bonus'} onClick={() => this.setState({ activeTab: 'bonus' })}>BONUS</CNavLink>
                    </CNavItem>
                </CNav>
                <CTabContent>
                    <CTabPane visible={activeTab === 'buy'} className='mt-2 col-xl-6 mx-auto'>
                        <StockBuyForm
                            userId={userId}
                            accounts={accounts}
                            tradeCondition={tradeCondition}
                            setAccountList={setAccountList}
                            setOwnStockList={setOwnStockList}
                            notify={notify}
                        />
                    </CTabPane>
                    <CTabPane visible={activeTab === 'sell'} className='mt-2 col-xl-6 mx-auto'>
                        <StockSellForm
                            userId={userId}
                            accounts={accounts}
                            tradeCondition={tradeCondition}
                            setAccountList={setAccountList}
                            setOwnStockList={setOwnStockList}
                            notify={notify}
                        />
                    </CTabPane>
                    <CTabPane visible={activeTab === 'bonus'} className='mt-2 col-xl-6 mx-auto'>
                        <StockBonusForm
                            userId={userId}
                            accounts={accounts}
                            tradeCondition={tradeCondition}
                            setAccountList={setAccountList}
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
        accounts: getAccountList(state),
        tradeCondition: getStockTradeCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | string | UserStockVo[] | StockTradeCondition | undefined>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setOwnStockList: SetOwnStockListDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockTradePage);
