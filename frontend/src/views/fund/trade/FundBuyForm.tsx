import React from 'react';
import moment from 'moment';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { UserSetting } from '../../../api/auth';
import AccountApi, { Account } from '../../../api/account';
import FundApi, { UserFundListResponse, UserFundResponse, UserFundVo } from '../../../api/fund';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from '../../../util/Constant';
import { Option } from '../../../util/Interface';
import FundTradeCondition from '../interface/FundTradeCondition';

export interface FundBuyFormProps {
    userSetting: UserSetting;
    accounts: Account[];
    tradeCondition?: FundTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnFundList: (ownList: UserFundVo[]) => void;
    notify: (message: string) => void;
}

export interface FundBuyFormState {
    code: string;
    name: string;
    accountId: string;
    balance: string;
    tradeDate: Date;
    debitAmount: number;
    rate: number;
    price: number;
    share: number;
    fee: number;
    total: string;
    fileId: string;
    buyFileOptions: Option[];
}

export default class FundBuyForm extends React.Component<FundBuyFormProps, FundBuyFormState> {

    constructor(props: FundBuyFormProps) {
        super(props);
        const { accounts, tradeCondition, userSetting: { fundFeeRate } } = props;
        this.state = this.init(accounts, fundFeeRate, tradeCondition);
    }

    private init = (accounts: Account[], fundFeeRate: number, tradeCondition?: FundTradeCondition): FundBuyFormState => {
        const state: FundBuyFormState = {
            code: '',
            name: '',
            accountId: '',
            balance: '',
            tradeDate: new Date(),
            debitAmount: 0,
            rate: 1,
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
            state.accountId = tradeCondition.accountId || '';
            if (state.accountId) {
                const balance = accounts.find(x => x.id === state.accountId)?.balance || 0;
                state.balance = AppUtil.numberComma(balance);
            }
            state.tradeDate = tradeCondition.date;
            state.debitAmount = tradeCondition.debitAmount;
            state.price = tradeCondition.price;
            state.rate = tradeCondition.rate;
            state.share = tradeCondition.share || 0;
            state.fee = tradeCondition.fee || AppUtil.toNumber((state.debitAmount * fundFeeRate).toFixed(6));
            state.total = AppUtil.numberComma(state.debitAmount + state.fee);
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
        const { accounts, tradeCondition, userSetting: { fundFeeRate }, notify } = this.props;
        const { code, accountId, tradeDate, share, price, rate, fee, total, fileId } = this.state;
        let api: Promise<UserFundResponse>;
        if (tradeCondition?.recordId && tradeCondition.accountRecordId) {
            api = FundApi.updateRecord(tradeCondition.recordId, accountId, code, tradeDate, share, price, rate, fee, AppUtil.reverseNumberComma(total), tradeCondition.accountRecordId, fileId);
        } else {
            api = FundApi.buy(accountId, code, tradeDate, share, price, rate, AppUtil.reverseNumberComma(total), fee, fileId);
        }
        const { success, message } = await api;
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchOwnFunds();
            this.setState(this.init(accounts, fundFeeRate, undefined));
        }
    };

    private onTradeFormCodeBlur = async (code: string): Promise<{ name: string, currency: string; }> => {
        if (code) {
            const { success, data } = await FundApi.getAll(code);
            if (success && data.length) {
                return { name: data[0].name, currency: data[0].currency };
            }
        }
        return { name: '', currency: '' };
    };

    private getFilesByDate = async (date: Date): Promise<Option[]> => {
        const response = await FinancailFileApi.list(date);
        const { success, data } = response;
        if (success) {
            return data.map(f => ({ key: f.id, value: f.filename }));
        }
        return [];
    };

    private fetchAccounts = async () => {
        const { setAccountList } = this.props;
        const response = await AccountApi.getAccounts();
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
        const { accounts, userSetting: { fundFeeRate } } = this.props;
        const { code, name, accountId, balance, tradeDate, debitAmount, rate, share, price, fee, total, fileId, buyFileOptions } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.onBuyClick)}>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    Fund Code
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={code}
                                    onChange={(event) => this.setState({ code: event.target.value as string })}
                                    onBlur={async () => {
                                        const { name: newName } = await this.onTradeFormCodeBlur(code);
                                        this.setState({ name: newName });
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
                                    value={name}
                                    disabled
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    Debit Account
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormSelect
                                    value={accountId}
                                    onChange={(event: any) => {
                                        const newAccountId = event.target.value as string;
                                        const balance = accounts.find(x => x.id === newAccountId)?.balance || 0;
                                        this.setState({ accountId: newAccountId, balance: newAccountId ? AppUtil.numberComma(balance) : '' });
                                    }}
                                >
                                    <option value=''></option>
                                    {accounts.map(a => <option key={`buy-account-${a.id}`} value={a.id}>{a.name}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
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
                                <CFormLabel className='col-form-label required'>
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
                                <CFormLabel className='col-form-label required'>
                                    Debit Amount
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={debitAmount}
                                    onChange={(event) => {
                                        const newDebitAmount = AppUtil.toNumber(event.target.value);
                                        const fee: number = AppUtil.toNumber((newDebitAmount * fundFeeRate).toFixed(6));
                                        this.setState({ debitAmount: newDebitAmount, total: AppUtil.numberComma(newDebitAmount + fee), fee });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    Exchange Rate
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={rate}
                                    step={0.1}
                                    onChange={(event) => {
                                        const newRate: number = AppUtil.toNumber(event.target.value);
                                        let share: number = 0;
                                        if (debitAmount && newRate && price) {
                                            share = AppUtil.toNumber((debitAmount / (price * newRate)).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ rate: newRate, share });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    Price
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={price}
                                    onChange={(event) => {
                                        const newPrice: number = AppUtil.toNumber(event.target.value);
                                        let share: number = 0;
                                        if (debitAmount && rate && newPrice) {
                                            share = AppUtil.toNumber((debitAmount / (newPrice * rate)).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ price: newPrice, share });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    Share
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={share}
                                    onChange={(event) => this.setState({ share: AppUtil.toNumber(event.target.value) })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    Fee
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={fee}
                                    onChange={(event) => {
                                        const newFee = AppUtil.toNumber(event.target.value);
                                        const newTotal = debitAmount + newFee;
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