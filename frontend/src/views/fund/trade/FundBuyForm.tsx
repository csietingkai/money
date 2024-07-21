import React from 'react';
import moment from 'moment';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { UserSetting } from '../../../api/auth';
import AccountApi, { Account } from '../../../api/account';
import FundApi, { UserFundListResponse, UserFundVo } from '../../../api/fund';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from '../../../util/Constant';
import { Option } from '../../../util/Interface';
import FundTradeCondition from '../interface/FundTradeCondition';

export interface FundBuyFormProps {
    userId: string;
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
        const { tradeCondition } = props;
        this.state = this.init(tradeCondition);
    }

    private init = (tradeCondition?: FundTradeCondition): FundBuyFormState => {
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
            state.tradeDate = tradeCondition.date;
            state.debitAmount = tradeCondition.debitAmount;
            // TODO exchange rate
            state.price = tradeCondition.price;
            this.getFilesByDate(state.tradeDate).then((buyFileOptions: Option[]) => {
                this.setState({ fileId: '', buyFileOptions });
            });
        }
        return state;
    };

    private onBuyClick = async () => {
        const { notify } = this.props;
        const { code, accountId, tradeDate, share, price, rate, fee, total, fileId } = this.state;
        const { success, message } = await FundApi.buy(accountId, code, tradeDate, share, price, rate, AppUtil.reverseNumberComma(total), fee, fileId);
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.fetchOwnFunds();
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
        const { accounts, userSetting: { fundFeeRate } } = this.props;
        const { code, name, accountId, balance, tradeDate, debitAmount, rate, share, price, fee, total, fileId, buyFileOptions } = this.state;
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
                                <CFormLabel className='col-form-label'>
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
                                    Debit Amount
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={debitAmount}
                                    onChange={(event) => {
                                        const newDebitAmount = AppUtil.toNumber(event.target.value)
                                        const fee: number = AppUtil.toNumber((newDebitAmount * fundFeeRate).toFixed(6));
                                        this.setState({ debitAmount, total: AppUtil.numberComma(newDebitAmount + fee), fee });
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
                                <CFormLabel className='col-form-label'>
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
                                <CFormLabel className='col-form-label'>
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
                                <CFormLabel className='col-form-label'>
                                    Fee
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={fee}
                                    onChange={(event) => this.setState({ fee: AppUtil.toNumber(event.target.value) })}
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