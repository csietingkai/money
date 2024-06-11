import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { ReduxState, getAccountList, getAuthTokenId, getStockTradeCondition } from '../../reducer/Selector';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CNav, CNavItem, CNavLink, CRow, CTabContent, CTabPane } from '@coreui/react';
import { SetAccountListDispatcher, SetNotifyDispatcher, SetOwnStockListDispatcher, SetStockTradeConditionDispatcher } from '../../reducer/PropsMapper';
import AccountApi, { Account } from '../../api/account';
import StockApi, { UserStockListResponse, UserStockVo } from '../../api/stock';
import FinancailFileApi from '../../api/financailFile';
import * as AppUtil from '../../util/AppUtil';
import { Action, Option } from '../../util/Interface';
import StockTradeCondition, { TradeType } from './interface/StockTradeCondition';

export interface StockTradePageProps {
    userId: string;
    accounts: Account[];
    tradeCondition: StockTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnStockList: (ownList: UserStockVo[]) => void;
    setStockTradeCondition: (condition: StockTradeCondition) => void;
    notify: (message: string) => void;
}

export interface StockTradePageState {
    activeTab: TradeType;
    buyForm: {
        code: string;
        name: string;
        currency: string;
        accountId: string;
        balance: string;
        tradeDate: Date;
        price: number;
        share: number;
        fee: number;
        total: string;
        fileId: string;
    },
    buyFileOptions: Option[];
    sellForm: {
        code: string;
        name: string;
        currency: string;
        accountId: string;
        balance: string;
        tradeDate: Date;
        price: number;
        share: number;
        fee: number;
        tax: number;
        total: string;
        fileId: string;
    },
    sellFileOptions: Option[];
    bonusForm: {

    };
}

class StockTradePage extends React.Component<StockTradePageProps, StockTradePageState> {

    constructor(props: StockTradePageProps) {
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

    private init = (tradeCondition: StockTradeCondition) => {
        const buyForm = {
            code: '',
            name: '',
            currency: '',
            accountId: '',
            balance: '',
            tradeDate: new Date(),
            price: 0,
            share: 0,
            fee: 0,
            total: AppUtil.numberComma(0),
            fileId: ''
        };
        const sellForm = {
            code: '',
            name: '',
            currency: '',
            accountId: '',
            balance: '',
            tradeDate: new Date(),
            price: 0,
            share: 0,
            fee: 0,
            tax: 0,
            total: AppUtil.numberComma(0),
            fileId: ''
        };
        const bonusForm = {};

        // TODO get data from props;
        if (tradeCondition.type === 'buy') {
            buyForm.code = tradeCondition.code;
            buyForm.name = tradeCondition.name;
            buyForm.tradeDate = tradeCondition.date;
            buyForm.currency = tradeCondition.currency;
            buyForm.price = tradeCondition.price;
            buyForm.share = tradeCondition.share;
        } else if (tradeCondition.type === 'sell') {
            sellForm.code = tradeCondition.code;
            sellForm.name = tradeCondition.name;
            sellForm.tradeDate = tradeCondition.date;
            sellForm.currency = tradeCondition.currency;
            sellForm.price = tradeCondition.price;
            sellForm.share = tradeCondition.share;
        }

        return { buyForm, sellForm, bonusForm };
    };

    private getBuyForm = (): React.ReactNode => {
        const { accounts } = this.props;
        const { buyForm, buyFileOptions } = this.state;
        const showAccountList = accounts.filter(x => x.currency === buyForm.currency);
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Stock Code
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    id='buyStockCode'
                                    type='text'
                                    value={buyForm.code}
                                    onChange={(event) => this.setState({ buyForm: { ...buyForm, code: event.target.value as string } })}
                                    onBlur={async () => {
                                        const { name, currency } = await this.onTradeFormCodeBlur(buyForm);
                                        this.setState({ buyForm: { ...buyForm, name, currency, accountId: '' } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Stock Name
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
                                        const balance = showAccountList.find(x => x.id === accountId)?.balance || 0;
                                        this.setState({ buyForm: { ...buyForm, accountId, balance: balance ? AppUtil.numberComma(balance) : '' } });
                                    }}
                                >
                                    <option value=''></option>
                                    {showAccountList.map(a => <option key={`buy-account-${a.id}`} value={a.id}>{a.name}</option>)}
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
                                    Price
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={buyForm.price}
                                    onChange={async (event) => {
                                        const price = AppUtil.toNumber(event.target.value);
                                        const { fee } = await this.calcFee('BUY', buyForm.share, price);
                                        const total = price * buyForm.share + fee;
                                        this.setState({ buyForm: { ...buyForm, price, fee, total: AppUtil.numberComma(total) } });
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
                                    onChange={async (event) => {
                                        const share = AppUtil.toNumber(event.target.value);
                                        const { fee } = await this.calcFee('BUY', share, buyForm.price);
                                        const total = buyForm.price * share + fee;
                                        this.setState({ buyForm: { ...buyForm, share, fee, total: AppUtil.numberComma(total) } });
                                    }}
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
                                    onChange={(event) => {
                                        const fee = AppUtil.toNumber(event.target.value);
                                        const total = buyForm.price * buyForm.share + fee;
                                        this.setState({ buyForm: { ...buyForm, fee, total: AppUtil.numberComma(total) } });
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
                                    type='text'
                                    value={buyForm.total}
                                    onChange={(event) => this.setState({ buyForm: { ...buyForm, total: event.target.value as string } })}
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
        const { success, message } = await StockApi.buy(accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), fileId);
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchOwnStocks();
        }
    };

    private getSellForm = (): React.ReactNode => {
        const { accounts } = this.props;
        const { sellForm, sellFileOptions } = this.state;
        const showAccountList = accounts.filter(x => x.currency === sellForm.currency);
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Stock Code
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    id='buyStockCode'
                                    type='text'
                                    value={sellForm.code}
                                    onChange={(event) => this.setState({ sellForm: { ...sellForm, code: event.target.value as string } })}
                                    onBlur={async () => {
                                        const { name, currency } = await this.onTradeFormCodeBlur(sellForm);
                                        this.setState({ sellForm: { ...sellForm, name, currency, accountId: '' } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Stock Name
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
                                        const balance = showAccountList.find(x => x.id === accountId)?.balance || 0;
                                        this.setState({ sellForm: { ...sellForm, accountId, balance: balance ? AppUtil.numberComma(balance) : '' } });
                                    }}
                                >
                                    <option value=''></option>
                                    {showAccountList.map(a => <option key={`sell-account-${a.id}`} value={a.id}>{a.name}</option>)}
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
                                        const sellFileOptions = await this.getFilesByDate(tradeDate);
                                        this.setState({ sellForm: { ...sellForm, tradeDate, fileId: '' }, sellFileOptions });
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
                                    onChange={async (event) => {
                                        const price = AppUtil.toNumber(event.target.value);
                                        const { fee, tax } = await this.calcFee('SELL', sellForm.share, price);
                                        const total = price * sellForm.share - fee - tax;
                                        this.setState({ sellForm: { ...sellForm, price, fee, tax, total: AppUtil.numberComma(total) } });
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
                                    onChange={async (event) => {
                                        const share = AppUtil.toNumber(event.target.value);
                                        const { fee, tax } = await this.calcFee('SELL', share, sellForm.price);
                                        const total = sellForm.price * share - fee - tax;
                                        this.setState({ sellForm: { ...sellForm, share, fee, tax, total: AppUtil.numberComma(total) } });
                                    }}
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
                                    value={sellForm.fee}
                                    onChange={(event) => {
                                        const fee = AppUtil.toNumber(event.target.value);
                                        const total = sellForm.price * sellForm.share - fee - sellForm.tax;
                                        this.setState({ sellForm: { ...sellForm, fee, total: AppUtil.numberComma(total) } });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Tax
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={sellForm.tax}
                                    onChange={(event) => {
                                        const tax = AppUtil.toNumber(event.target.value);
                                        const total = sellForm.price * sellForm.share - sellForm.fee - tax;
                                        this.setState({ sellForm: { ...sellForm, tax, total: AppUtil.numberComma(total) } });
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
                                    type='text'
                                    value={sellForm.total}
                                    onChange={(event) => this.setState({ sellForm: { ...sellForm, total: event.target.value as string } })}
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
                                    {sellFileOptions.map(o => <option key={`sell-stock-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
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
        const { code, accountId, tradeDate, share, price, fee, tax, total, fileId } = sellForm;
        const { success, message } = await StockApi.sell(accountId, code, tradeDate, share, price, fee, tax, AppUtil.reverseNumberComma(total), fileId);
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchOwnStocks();
        }
    };

    private getBonusForm = (): React.ReactNode => {
        return <></>;
    };

    private onTradeFormCodeBlur = async (form: { code: string; }): Promise<{ name: string, currency: string; }> => {
        const { code } = form;
        if (code) {
            const { success, data } = await StockApi.getAll(code);
            if (success && data.length) {
                return { name: data[0].name, currency: data[0].currency };
            }
        }
        return { name: '', currency: '' };
    };

    private calcFee = async (tradeType: 'BUY' | 'SELL', share: number, price: number): Promise<{ fee: number, tax: number; }> => {
        const { success, data } = await StockApi.precalc(tradeType, share, price);
        if (success) {
            const { fee, tax } = data;
            return { fee, tax };
        }
        return { fee: 0, tax: 0 };
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

    private fetchOwnStocks = async () => {
        const { setOwnStockList } = this.props;
        const response: UserStockListResponse = await StockApi.getOwn();
        const { success, data: ownList } = response;
        if (success) {
            setOwnStockList(ownList);
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
        accounts: getAccountList(state),
        tradeCondition: getStockTradeCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<Account[] | string | UserStockVo[] | StockTradeCondition>>) => {
    return {
        setAccountList: SetAccountListDispatcher(dispatch),
        setOwnStockList: SetOwnStockListDispatcher(dispatch),
        setStockTradeCondition: SetStockTradeConditionDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockTradePage);
