import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { ReduxState, getAccountList, getAuthTokenId, getFundTradeCondition, getUserSetting } from '../../reducer/Selector';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CNav, CNavItem, CNavLink, CRow, CTabContent, CTabPane } from '@coreui/react';
import { SetAccountListDispatcher, SetNotifyDispatcher, SetOwnFundListDispatcher, SetFundTradeConditionDispatcher } from '../../reducer/PropsMapper';
import { UserSetting } from '../../api/auth';
import AccountApi, { Account } from '../../api/account';
import FundApi, { UserFundListResponse, UserFundVo } from '../../api/fund';
import FinancailFileApi from '../../api/financailFile';
import * as AppUtil from '../../util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { Action, Option } from '../../util/Interface';
import FundTradeCondition, { TradeType } from './interface/FundTradeCondition';

export interface FundTradePageProps {
    userId: string;
    userSetting: UserSetting;
    accounts: Account[];
    tradeCondition: FundTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnFundList: (ownList: UserFundVo[]) => void;
    setFundTradeCondition: (condition: FundTradeCondition) => void;
    notify: (message: string) => void;
}

export interface FundTradePageState {
    activeTab: TradeType;
    buyForm: {
        code: string;
        name: string;
        accountId: string;
        balance: string;
        tradeDate: Date;
        total: number;
        rate: number;
        price: number;
        share: number;
        fee: number;
        fileId: string;
    },
    buyFileOptions: Option[];
    sellForm: {
        code: string;
        name: string;
        accountId: string;
        balance: string;
        tradeDate: Date;
        total: number;
        rate: number;
        price: number;
        share: number;
        fileId: string;
    },
    sellFileOptions: Option[];
    bonusForm: {

    };
}

class FundTradePage extends React.Component<FundTradePageProps, FundTradePageState> {

    constructor(props: FundTradePageProps) {
        super(props);
        const { tradeCondition } = props;
        const { buyForm, sellForm, bonusForm } = this.init(tradeCondition);
        this.state = {
            activeTab: tradeCondition?.type || 'buy',
            buyForm,
            buyFileOptions: [],
            sellForm,
            sellFileOptions: [],
            bonusForm
        };
    }

    private init = (tradeCondition: FundTradeCondition) => {
        const buyForm = {
            code: '',
            name: '',
            accountId: '',
            balance: '',
            tradeDate: new Date(),
            debitAmount: 0,
            total: 0,
            rate: 1,
            price: 0,
            share: 0,
            fee: 0,
            fileId: ''
        };
        const sellForm = {
            code: '',
            name: '',
            accountId: '',
            balance: '',
            tradeDate: new Date(),
            debitAmount: 0,
            total: 0,
            rate: 1,
            price: 0,
            share: 0,
            fileId: ''
        };
        const bonusForm = {};

        // TODO get data from props;
        if (tradeCondition.type === 'buy') {
            buyForm.code = tradeCondition.code;
            buyForm.name = tradeCondition.name;
            buyForm.tradeDate = tradeCondition.date;
        } else if (tradeCondition.type === 'sell') {
        }

        return { buyForm, sellForm, bonusForm };
    };

    private getBuyForm = (): React.ReactNode => {
        const { accounts, userSetting: { fundFeeRate } } = this.props;
        const { buyForm, buyFileOptions } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Fund Code
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    id='buyFundCode'
                                    type='text'
                                    value={buyForm.code}
                                    onChange={(event) => this.setState({ buyForm: { ...buyForm, code: event.target.value as string } })}
                                    onBlur={async () => {
                                        const { name } = await this.onTradeFormCodeBlur(buyForm);
                                        this.setState({ buyForm: { ...buyForm, name } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Fund Name
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={buyForm.name}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Debit Account
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormSelect
                                    value={buyForm.accountId}
                                    onChange={(event: any) => {
                                        const accountId = event.target.value as string;
                                        const balance = accounts.find(x => x.id === accountId)?.balance || 0;
                                        this.setState({ buyForm: { ...buyForm, accountId, balance: accountId ? AppUtil.numberComma(balance) : '' } });
                                    }}
                                >
                                    <option value=''></option>
                                    {accounts.map(a => <option key={`buy-account-${a.id}`} value={a.id}>{a.name}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Account Balance
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={buyForm.balance}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Trade Date
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <input
                                    type='date'
                                    className='form-control'
                                    value={moment(buyForm.tradeDate).format('YYYY-MM-DD')}
                                    onChange={async (event) => {
                                        const tradeDate = new Date(event.target.value);
                                        const buyFileOptions = await this.getFilesByDate(tradeDate);
                                        this.setState({ buyForm: { ...buyForm, tradeDate, fileId: '' }, buyFileOptions });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Debit Amount
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={buyForm.total}
                                    onChange={(event) => {
                                        const total: number = AppUtil.toNumber(event.target.value);
                                        const fee: number = AppUtil.toNumber((total * fundFeeRate).toFixed(6));
                                        this.setState({ buyForm: { ...buyForm, total, fee } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Exchange Rate
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={buyForm.rate}
                                    step={0.1}
                                    onChange={(event) => {
                                        const rate: number = AppUtil.toNumber(event.target.value);
                                        const { total, price } = buyForm;
                                        let share: number = 0;
                                        if (total && rate && price) {
                                            share = AppUtil.toNumber((total / (price * rate)).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ buyForm: { ...buyForm, rate, share } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Price
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={buyForm.price}
                                    onChange={(event) => {
                                        const price: number = AppUtil.toNumber(event.target.value);
                                        const { total, rate } = buyForm;
                                        let share: number = 0;
                                        if (total && rate && price) {
                                            share = AppUtil.toNumber((total / (price * rate)).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ buyForm: { ...buyForm, price, share } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Share
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={buyForm.share}
                                    onChange={(event) => this.setState({ buyForm: { ...buyForm, share: AppUtil.toNumber(event.target.value) } })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Fee
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={buyForm.fee}
                                    onChange={(event) => this.setState({ buyForm: { ...buyForm, fee: AppUtil.toNumber(event.target.value) } })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Total
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={AppUtil.numberComma(buyForm.total + buyForm.fee)}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Linked File
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormSelect
                                    value={buyForm.fileId}
                                    onChange={(event: any) => this.setState({ buyForm: { ...buyForm, fileId: event.target.value as string } })}
                                >
                                    <option value=''></option>
                                    {buyFileOptions.map(o => <option key={`buy-stock-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className='text-end'>
                    <CButton color='success' variant='outline' onClick={this.onBuyClick}>
                        Buy
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    };

    private onBuyClick = async () => {
        const { notify } = this.props;
        const { buyForm } = this.state;
        const { code, accountId, tradeDate, share, price, fee, total, fileId } = buyForm;
        // TODO fileId
        const { success, message, data } = await FundApi.buy(accountId, code, tradeDate, share, price, fee, total, fee, fileId);
        if (success) {
            notify(message);
            this.fetchAccounts();
            this.fetchOwnFunds();
            // TODO
            //     if (stockOwnList.find(x => x.stockCode === selectedFundCode)) {
            //         await this.fetchFundOwnList(username);
            //     }
        }
    };

    private getSellForm = (): React.ReactNode => {
        const { accounts } = this.props;
        const { sellForm, sellFileOptions } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm>
                    <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Fund Code
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    id='buyFundCode'
                                    type='text'
                                    value={sellForm.code}
                                    onChange={(event) => this.setState({ sellForm: { ...sellForm, code: event.target.value as string } })}
                                    onBlur={async () => {
                                        const { name } = await this.onTradeFormCodeBlur(sellForm);
                                        this.setState({ sellForm: { ...sellForm, name } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Fund Name
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={sellForm.name}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Debit Account
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormSelect
                                    value={sellForm.accountId}
                                    onChange={(event: any) => {
                                        const accountId = event.target.value as string;
                                        const balance = accounts.find(x => x.id === accountId)?.balance || 0;
                                        this.setState({ sellForm: { ...sellForm, accountId, balance: accountId ? AppUtil.numberComma(balance) : '' } });
                                    }}
                                >
                                    <option value=''></option>
                                    {accounts.map(a => <option key={`buy-account-${a.id}`} value={a.id}>{a.name}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Account Balance
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={sellForm.balance}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Trade Date
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <input
                                    type='date'
                                    className='form-control'
                                    value={moment(sellForm.tradeDate).format('YYYY-MM-DD')}
                                    onChange={async (event) => {
                                        const tradeDate = new Date(event.target.value);
                                        const buyFileOptions = await this.getFilesByDate(tradeDate);
                                        this.setState({ sellForm: { ...sellForm, tradeDate, fileId: '' }, buyFileOptions });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Exchange Rate
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={sellForm.rate}
                                    step={0.1}
                                    onChange={(event) => {
                                        const rate: number = AppUtil.toNumber(event.target.value);
                                        const { price, share } = sellForm;
                                        let total: number = 0;
                                        if (rate && price && share) {
                                            total = AppUtil.toNumber((rate * price * share).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ sellForm: { ...sellForm, rate, total } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Price
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={sellForm.price}
                                    onChange={(event) => {
                                        const price: number = AppUtil.toNumber(event.target.value);
                                        const { rate, share } = sellForm;
                                        let total: number = 0;
                                        if (rate && price && share) {
                                            total = AppUtil.toNumber((rate * price * share).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ sellForm: { ...sellForm, price, total } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Share
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={sellForm.share}
                                    onChange={(event) => {
                                        const share: number = AppUtil.toNumber(event.target.value);
                                        const { rate, price  } = sellForm;
                                        let total: number = 0;
                                        if (rate && price && share) {
                                            total = AppUtil.toNumber((rate * price * share).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ sellForm: { ...sellForm, share, total } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Total
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={sellForm.total}
                                    onChange={(event) => this.setState({ sellForm: { ...sellForm, total: AppUtil.toNumber(event.target.value) } })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Linked File
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormSelect
                                    value={sellForm.fileId}
                                    onChange={(event: any) => this.setState({ sellForm: { ...sellForm, fileId: event.target.value as string } })}
                                >
                                    <option value=''></option>
                                    {sellFileOptions.map(o => <option key={`buy-stock-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className='text-end'>
                    <CButton color='success' variant='outline' onClick={this.onSellClick}>
                        Sell
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    };

    private onSellClick = async () => {
        const { notify } = this.props;
        const { sellForm } = this.state;
        const { code, accountId, tradeDate, share, price, rate, total, fileId } = sellForm;
        const { success, message, data } = await FundApi.sell(accountId, code, tradeDate, share, price, rate, total, fileId)
        if (success) {
            notify(message);
            this.fetchAccounts();
            this.fetchOwnFunds();
            // TODO
            //     if (stockOwnList.find(x => x.stockCode === selectedFundCode)) {
            //         await this.fetchFundOwnList(username);
            //     }
        }
    };

    private getBonusForm = (): React.ReactNode => {
        return <></>;
    };

    private onTradeFormCodeBlur = async (form: { code: string; }): Promise<{ name: string, currency: string; }> => {
        const { code } = form;
        if (code) {
            const { success, data } = await FundApi.getAll(code);
            if (success && data.length) {
                return { name: data[0].name, currency: data[0].currency };
            }
        }
        return { name: '', currency: '' };
    };

    private getFilesByDate = async (date: Date): Promise<Option[]> => {
        const { userId } = this.props;
        const response = await FinancailFileApi.list(userId, date);
        const { success, data } = response;
        if (success) {
            return data.map(f => ({ key: f.id, value: f.filename }));
        }
        return [];
    };

    private fetchAccounts = async () => {
        const { userId, setAccountList } = this.props;
        const response = await AccountApi.getAccounts(userId);
        const { success, data } = response;
        if (success) {
            setAccountList(data);
        } else {
            setAccountList([]);
        }
    };

    private fetchOwnFunds = async () => {
        const { setOwnFundList } = this.props;
        const response: UserFundListResponse = await FundApi.getOwn();
        const { success, data: ownList } = response;
        if (success) {
            setOwnFundList(ownList);
        }
    };

    render(): React.ReactNode {
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
                        {this.getBuyForm()}
                    </CTabPane>
                    <CTabPane visible={activeTab === 'sell'} className='mt-2 col-xl-6 mx-auto'>
                        {this.getSellForm()}
                    </CTabPane>
                    <CTabPane visible={activeTab === 'bonus'} className='mt-2 col-xl-6 mx-auto'>
                        {this.getBonusForm()}
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

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | string | UserFundVo[] | FundTradeCondition>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setOwnFundList: SetOwnFundListDispatcher(dispatch),
        setFundTradeCondition: SetFundTradeConditionDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundTradePage);
