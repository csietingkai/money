import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import AccountApi, { Account } from '../../../api/account';
import StockApi, { UserStockResponse } from '../../../api/stock';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { Option } from '../../../util/Interface';
import StockTradeCondition from '../interface/StockTradeCondition';

export interface StockBonusFormProps {
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
        const { accounts, tradeCondition } = props;
        this.state = this.init(accounts, tradeCondition);
    }

    private init = (accounts: Account[], tradeCondition: StockTradeCondition | undefined): StockBonusFormState => {
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
            state.accountId = tradeCondition.accountId || '';
            if (state.accountId) {
                const showAccountList = accounts.filter(x => x.currency === state.currency);
                const balance = showAccountList.find(x => x.id === state.accountId)?.balance || 0;
                state.balance = AppUtil.numberComma(balance);
            }
            state.price = tradeCondition.price || 0;
            state.share = tradeCondition.share;
            if (tradeCondition.fee && tradeCondition.total) {
                state.fee = tradeCondition.fee;
                state.total = AppUtil.numberComma(tradeCondition.total);
            }
        }
        this.getFilesByDate(state.tradeDate).then((bonusFileOptions: Option[]) => {
            let fileId: string = '';
            if (tradeCondition?.fileId && bonusFileOptions.find(x => x.key === tradeCondition.fileId)) {
                fileId = tradeCondition.fileId;
            }
            this.setState({ bonusFileOptions, fileId });
        });

        return state;
    };

    private onBonusClick = async () => {
        const { accounts, tradeCondition, notify } = this.props;
        const { code, accountId, tradeDate, share, price, fee, total, fileId } = this.state;
        let api: Promise<UserStockResponse>;
        if (tradeCondition?.recordId && tradeCondition.accountRecordId) {
            api = StockApi.updateRecord(tradeCondition.recordId, accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), tradeCondition.accountRecordId);
        } else {
            api = StockApi.bonus(accountId, code, tradeDate, share, price, fee, AppUtil.reverseNumberComma(total), fileId);
        }
        const { success, message } = await api;
        notify(message);
        if (success) {
            this.fetchAccounts();
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

    render(): React.ReactNode {
        const { accounts } = this.props;
        const { code, name, currency, accountId, balance, tradeDate, share, price, fee, total, fileId, bonusFileOptions } = this.state;
        const showAccountList = accounts.filter(x => x.currency === currency);
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.onBonusClick)}>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='StockTradePage.code' />
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
                                    <FormattedMessage id='StockTradePage.name' />
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
                                    <FormattedMessage id='StockTradePage.debitAccount' />
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
                                    <FormattedMessage id='StockTradePage.accountBalance' />
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
                                    <FormattedMessage id='StockTradePage.tradeDate' />
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
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='StockTradePage.price' />
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
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='StockTradePage.share' />
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
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='StockTradePage.fee' />
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
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='StockTradePage.total' />
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
                                    <FormattedMessage id='StockTradePage.file' />
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
                        <FormattedMessage id='StockTradePage.bonusBtn' />
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    }
}
