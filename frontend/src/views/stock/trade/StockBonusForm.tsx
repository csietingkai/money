import React from 'react';
import moment from 'moment';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import AccountApi, { Account } from '../../../api/account';
import StockApi, { UserStockListResponse, UserStockVo } from '../../../api/stock';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { Option } from '../../../util/Interface';
import StockTradeCondition from '../interface/StockTradeCondition';

export interface StockBonusFormProps {
    userId: string;
    accounts: Account[];
    tradeCondition?: StockTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    notify: (message: string) => void;
}

export interface StockBonusFormState {
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
    bonusFileOptions: Option[];
}

export default class StockBonusForm extends React.Component<StockBonusFormProps, StockBonusFormState> {

    constructor(props: StockBonusFormProps) {
        super(props);
        const { tradeCondition } = props;
        this.state = this.init(tradeCondition);
    }

    private init = (tradeCondition: StockTradeCondition | undefined): StockBonusFormState => {
        const state: StockBonusFormState = {
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
            bonusFileOptions: []
        };

        if (tradeCondition?.type === 'bonus') {
            state.code = tradeCondition.code;
            state.name = tradeCondition.name;
            state.tradeDate = tradeCondition.date;
            state.currency = tradeCondition.currency;
            state.share = tradeCondition.share;
            this.getFilesByDate(new Date()).then((bonusFileOptions: Option[]) => {
                this.setState({ bonusFileOptions });
            });
        }

        return state;
    };

    private onBonusClick = async () => {
        const { tradeCondition, notify } = this.props;
        const { code, accountId, tradeDate, share, price, fee, total, fileId } = this.state;
        const { success, message } = await StockApi.bonus(accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), fileId);
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.setState(this.init(tradeCondition));
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

    render(): React.ReactNode {
        const { accounts } = this.props;
        const { code, name, currency, accountId, balance, tradeDate, share, price, fee, total, fileId, bonusFileOptions } = this.state;
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
                                        const newBalance = showAccountList.find(x => x.id === newAccountId)?.balance || 0;
                                        this.setState({ accountId: newAccountId, balance: newBalance ? AppUtil.numberComma(newBalance) : '' });
                                    }}
                                >
                                    <option value=''></option>
                                    {showAccountList.map(a => <option key={`bonus-account-${a.id}`} value={a.id}>{a.name}</option>)}
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
                                        const bonusFileOptions = await this.getFilesByDate(newTradeDate);
                                        this.setState({ tradeDate: newTradeDate, fileId: '', bonusFileOptions });
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
                                        const newPrice = AppUtil.toNumber(event.target.value);
                                        const total = newPrice * share - fee;
                                        this.setState({ price: newPrice, total: AppUtil.numberComma(total) });
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
                                    onChange={(event) => {
                                        const newShare = AppUtil.toNumber(event.target.value);
                                        const total = price * newShare - fee;
                                        this.setState({ share: newShare, total: AppUtil.numberComma(total) });
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
                                        const newTotal = price * share - newFee;
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
                                    {bonusFileOptions.map(o => <option key={`bonus-stock-file-option-${o.key}`} value={o.key}>{o.value}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className='text-end'>
                    <CButton color='success' variant='outline' onClick={this.onBonusClick}>
                        Bonus
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    }
}
