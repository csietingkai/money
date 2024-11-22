import React from 'react';
import moment from 'moment';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import AccountApi, { Account } from '../../../api/account';
import StockApi, { UserStockListResponse, UserStockResponse, UserStockVo } from '../../../api/stock';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { Option } from '../../../util/Interface';
import StockTradeCondition from '../interface/StockTradeCondition';

export interface StockSellFormProps {
    userId: string;
    accounts: Account[];
    tradeCondition?: StockTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnStockList: (ownList: UserStockVo[]) => void;
    notify: (message: string) => void;
}

export interface StockSellFormState {
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
    sellFileOptions: Option[];
}

export default class StockSellForm extends React.Component<StockSellFormProps, StockSellFormState> {

    constructor(props: StockSellFormProps) {
        super(props);
        const { accounts, tradeCondition } = props;
        this.state = this.init(accounts, tradeCondition);
    }

    private init = (accounts: Account[], tradeCondition: StockTradeCondition | undefined): StockSellFormState => {
        const state: StockSellFormState = {
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
            fileId: '',
            sellFileOptions: []
        };

        if (tradeCondition?.type === 'sell') {
            state.code = tradeCondition.code;
            state.name = tradeCondition.name;
            state.tradeDate = tradeCondition.date;
            state.currency = tradeCondition.currency;
            state.accountId = tradeCondition.accountId || '';
            if (state.accountId) {
                const showAccountList = accounts.filter(x => x.currency === state.currency);
                const balance = showAccountList.find(x => x.id === state.accountId)?.balance || 0;
                state.balance = AppUtil.numberComma(balance);
            }
            state.price = tradeCondition.price;
            state.share = tradeCondition.share;
            if (tradeCondition.fee && tradeCondition.tax && tradeCondition.total) {
                state.fee = tradeCondition.fee;
                state.tax = tradeCondition.tax;
                state.total = AppUtil.numberComma(tradeCondition.total);
            } else {
                this.calcFee(state.share, state.price).then(({ fee, tax }) => {
                    const total = state.price * state.share - fee - tax;
                    this.setState({ fee, tax, total: AppUtil.numberComma(total) });
                });
            }
        }
        this.getFilesByDate(state.tradeDate).then((sellFileOptions: Option[]) => {
            let fileId: string = '';
            if (tradeCondition?.fileId && sellFileOptions.find(x => x.key === tradeCondition.fileId)) {
                fileId = tradeCondition.fileId;
            }
            this.setState({ sellFileOptions, fileId });
        });

        return state;
    };

    private onSellClick = async () => {
        const { accounts, tradeCondition, notify } = this.props;
        const { code, accountId, tradeDate, share, price, fee, tax, total, fileId } = this.state;
        let api: Promise<UserStockResponse>;
        if (tradeCondition?.recordId && tradeCondition.accountRecordId) {
            api = StockApi.updateRecord(tradeCondition.recordId, accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), tradeCondition.accountRecordId, tax, fileId);
        } else {
            api = StockApi.sell(accountId, code, tradeDate, share, price, fee, tax, AppUtil.reverseNumberComma(total), fileId);
        }
        const { success, message } = await api;
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchOwnStocks();
            this.setState(this.init(accounts, undefined));
        }
    };

    private onTradeFormCodeBlur = async (code: string): Promise<{ name: string, currency: string; }> => {
        if (code) {
            const { success, data } = await StockApi.getAll(code);
            if (success && data.length) {
                return { name: data[0].name, currency: data[0].currency };
            }
        }
        return { name: '', currency: '' };
    };

    private calcFee = async (share: number, price: number): Promise<{ fee: number, tax: number; }> => {
        const { success, data } = await StockApi.precalc('SELL', share, price);
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
        const { accounts } = this.props;
        const { code, name, currency, accountId, balance, tradeDate, share, price, fee, tax, total, fileId, sellFileOptions } = this.state;
        const showAccountList = accounts.filter(x => x.currency === currency);
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
                                    type='text'
                                    value={code}
                                    onChange={(event) => this.setState({ code: event.target.value as string })}
                                    onBlur={async () => {
                                        const { name, currency } = await this.onTradeFormCodeBlur(code);
                                        this.setState({ name, currency, accountId: '' });
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
                                    value={name}
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
                                    value={accountId}
                                    onChange={(event: any) => {
                                        const newAccountId = event.target.value as string;
                                        const balance = showAccountList.find(x => x.id === newAccountId)?.balance || 0;
                                        this.setState({ accountId: newAccountId, balance: balance ? AppUtil.numberComma(balance) : '' });
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
                                    value={balance}
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
                                    value={moment(tradeDate).format('YYYY-MM-DD')}
                                    onChange={async (event) => {
                                        const newTradeDate = new Date(event.target.value);
                                        const sellFileOptions = await this.getFilesByDate(newTradeDate);
                                        this.setState({ tradeDate: newTradeDate, fileId: '', sellFileOptions });
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
                                    value={price}
                                    onChange={async (event) => {
                                        const newPrice = AppUtil.toNumber(event.target.value);
                                        const { fee: calcedFee, tax: calcedTax } = await this.calcFee(share, newPrice);
                                        const total = newPrice * share - calcedFee - calcedTax;
                                        this.setState({ price: newPrice, fee: calcedFee, tax: calcedTax, total: AppUtil.numberComma(total) });
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
                                    value={share}
                                    onChange={async (event) => {
                                        const newShare = AppUtil.toNumber(event.target.value);
                                        const { fee: calcedFee, tax: calcedTax } = await this.calcFee(newShare, price);
                                        const total = price * newShare - calcedFee - calcedTax;
                                        this.setState({ share: newShare, fee: calcedFee, tax: calcedTax, total: AppUtil.numberComma(total) });
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
                                    value={fee}
                                    onChange={(event) => {
                                        const newFee = AppUtil.toNumber(event.target.value);
                                        const newTotal = price * share - newFee - tax;
                                        this.setState({ fee: newFee, total: AppUtil.numberComma(newTotal) });
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
                                    value={tax}
                                    onChange={(event) => {
                                        const newTax = AppUtil.toNumber(event.target.value);
                                        const newTotal = price * share - fee - newTax;
                                        this.setState({ tax: newTax, total: AppUtil.numberComma(newTotal) });
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
                                    value={total}
                                    onChange={(event) => this.setState({ total: event.target.value as string })}
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
                                    value={fileId}
                                    onChange={(event: any) => this.setState({ fileId: event.target.value as string })}
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
    }
}
