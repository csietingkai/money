import React from 'react';
import moment from 'moment';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import AccountApi, { Account } from '../../../api/account';
import StockApi, { UserStockListResponse, UserStockResponse, UserStockVo } from '../../../api/stock';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { Option } from '../../../util/Interface';
import StockTradeCondition from '../interface/StockTradeCondition';

export interface StockBuyFormProps {
    userId: string;
    accounts: Account[];
    tradeCondition?: StockTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnStockList: (ownList: UserStockVo[]) => void;
    notify: (message: string) => void;
}

export interface StockBuyFormState {
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
    buyFileOptions: Option[];
}

export default class StockBuyForm extends React.Component<StockBuyFormProps, StockBuyFormState> {

    constructor(props: StockBuyFormProps) {
        super(props);
        const { accounts, tradeCondition } = props;
        this.state = this.init(accounts, tradeCondition);
    }

    private init = (accounts: Account[], tradeCondition: StockTradeCondition | undefined): StockBuyFormState => {
        const state: StockBuyFormState = {
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
            fileId: '',
            buyFileOptions: []
        };

        if (tradeCondition?.type === 'buy') {
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
            if (tradeCondition.fee && tradeCondition.total) {
                state.fee = tradeCondition.fee;
                state.total = AppUtil.numberComma(tradeCondition.total);
            } else {
                this.calcFee(state.share, state.price).then(({ fee }) => {
                    const total = state.price * state.share + fee;
                    this.setState({ fee, total: AppUtil.numberComma(total) });
                });
            }
        }
        this.getFilesByDate(state.tradeDate).then((buyFileOptions: Option[]) => {
            let fileId: string = '';
            if (tradeCondition?.fileId && buyFileOptions.find(x => x.key === tradeCondition.fileId)) {
                fileId = tradeCondition.fileId;
            }
            this.setState({ buyFileOptions, fileId });
        });

        return state;
    };

    private onBuyClick = async () => {
        const { accounts, tradeCondition, notify } = this.props;
        const { code, accountId, tradeDate, share, price, fee, total, fileId } = this.state;
        let api: Promise<UserStockResponse>;
        if (tradeCondition?.recordId && tradeCondition.accountRecordId) {
            api = StockApi.updateRecord(tradeCondition.recordId, accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), tradeCondition.accountRecordId, 0, fileId);
        } else {
            api = StockApi.buy(accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), fileId);
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

    private calcFee = async (share: number, price: number): Promise<{ fee: number; }> => {
        const { success, data } = await StockApi.precalc('BUY', share, price);
        if (success) {
            const { fee } = data;
            return { fee };
        }
        return { fee: 0 };
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
        const { code, name, currency, accountId, balance, tradeDate, share, price, fee, total, fileId, buyFileOptions } = this.state;
        const showAccountList = accounts.filter(x => x.currency === currency);
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.onBuyClick)}>
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
                                        const buyFileOptions = await this.getFilesByDate(newTradeDate);
                                        this.setState({ tradeDate: newTradeDate, fileId: '', buyFileOptions });
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
                                        const { fee: newFee } = await this.calcFee(share, newPrice);
                                        const total = newPrice * share + newFee;
                                        this.setState({ price: newPrice, fee: newFee, total: AppUtil.numberComma(total) });
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
                                        const { fee: calcedFee } = await this.calcFee(newShare, price);
                                        const newTotal = price * newShare + calcedFee;
                                        this.setState({ share: newShare, fee: calcedFee, total: AppUtil.numberComma(newTotal) });
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
                                        const newTotal = price * share + newFee;
                                        this.setState({ fee: newFee, total: AppUtil.numberComma(newTotal) });
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
    }
}
