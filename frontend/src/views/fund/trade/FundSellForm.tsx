import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { UserSetting } from '../../../api/auth';
import AccountApi, { Account } from '../../../api/account';
import FundApi, { UserFundListResponse, UserFundResponse, UserFundVo } from '../../../api/fund';
import FinancailFileApi from '../../../api/financailFile';
import * as AppUtil from '../../../util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from '../../../util/Constant';
import { Option } from '../../../util/Interface';
import FundTradeCondition from '../interface/FundTradeCondition';

export interface FundSellFormProps {
    userSetting: UserSetting;
    accounts: Account[];
    tradeCondition?: FundTradeCondition;
    setAccountList: (accounts: Account[]) => void;
    setOwnFundList: (ownList: UserFundVo[]) => void;
    notify: (message: string) => void;
}

export interface FundSellFormState {
    code: string;
    name: string;
    accountId: string;
    balance: string;
    tradeDate: Date;
    rate: number;
    price: number;
    share: number;
    total: number;
    fileId: string;
    sellFileOptions: Option[];
}

export default class FundSellForm extends React.Component<FundSellFormProps, FundSellFormState> {

    constructor(props: FundSellFormProps) {
        super(props);
        const { accounts, tradeCondition, userSetting: { fundFeeRate } } = props;
        this.state = this.init(accounts, fundFeeRate, tradeCondition);
    }

    private init = (accounts: Account[], fundFeeRate: number, tradeCondition?: FundTradeCondition): FundSellFormState => {
        const state: FundSellFormState = {
            code: '',
            name: '',
            accountId: '',
            balance: '',
            tradeDate: new Date(),
            rate: 1,
            price: 0,
            share: 0,
            total: 0,
            fileId: '',
            sellFileOptions: []
        };

        if (tradeCondition?.type === 'sell') {
            state.code = tradeCondition.code;
            state.name = tradeCondition.name;
            state.accountId = tradeCondition.accountId || '';
            if (state.accountId) {
                const balance = accounts.find(x => x.id === state.accountId)?.balance || 0;
                state.balance = AppUtil.numberComma(balance);
            }
            state.tradeDate = tradeCondition.date;
            state.rate = tradeCondition.rate;
            state.price = tradeCondition.price;
            state.share = tradeCondition.share;
            if (tradeCondition.price && tradeCondition.share) {
                state.total = tradeCondition.total || 0;
            } else {
                state.total = AppUtil.toNumber((state.rate * state.price * state.share).toFixed(DEFAULT_DECIMAL_PRECISION));
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
        const { accounts, tradeCondition, userSetting: { fundFeeRate }, notify } = this.props;
        const { code, accountId, tradeDate, share, price, rate, total, fileId } = this.state;
        let api: Promise<UserFundResponse>;
        if (tradeCondition?.recordId && tradeCondition.accountRecordId) {
            api = FundApi.updateRecord(tradeCondition.recordId, accountId, code, tradeDate, share, price, rate, 0, total, tradeCondition.accountRecordId, fileId);
        } else {
            api = FundApi.sell(accountId, code, tradeDate, share, price, rate, total, fileId);
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
        const { accounts } = this.props;
        const { code, name, accountId, balance, tradeDate, rate, share, price, total, fileId, sellFileOptions } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.onSellClick)}>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='FundTradePage.code' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={code}
                                    onChange={(event) => this.setState({ code: event.target.value as string })}
                                    onBlur={async () => {
                                        const { name } = await this.onTradeFormCodeBlur(code);
                                        this.setState({ name });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='FundTradePage.name' />
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
                                    <FormattedMessage id='FundTradePage.debitAccount' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormSelect
                                    value={accountId}
                                    onChange={(event: any) => {
                                        const accountId = event.target.value as string;
                                        const balance = accounts.find(x => x.id === accountId)?.balance || 0;
                                        this.setState({ accountId, balance: accountId ? AppUtil.numberComma(balance) : '' });
                                    }}
                                >
                                    <option value=''></option>
                                    {accounts.map(a => <option key={`sell-account-${a.id}`} value={a.id}>{a.name}</option>)}
                                </CFormSelect>
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='FundTradePage.accountBalance' />
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
                                    <FormattedMessage id='FundTradePage.tradeDate' />
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
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='FundTradePage.exchangeRate' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={rate}
                                    step={0.1}
                                    onChange={(event) => {
                                        const newRate: number = AppUtil.toNumber(event.target.value);
                                        let total: number = 0;
                                        if (newRate && price && share) {
                                            total = AppUtil.toNumber((newRate * price * share).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ rate: newRate, total });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='FundTradePage.price' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={price}
                                    onChange={(event) => {
                                        const newPrice: number = AppUtil.toNumber(event.target.value);
                                        let total: number = 0;
                                        if (rate && newPrice && share) {
                                            total = AppUtil.toNumber((rate * newPrice * share).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ price: newPrice, total });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='FundTradePage.share' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={share}
                                    onChange={(event) => {
                                        const newShare: number = AppUtil.toNumber(event.target.value);
                                        let total: number = 0;
                                        if (rate && price && newShare) {
                                            total = AppUtil.toNumber((rate * price * newShare).toFixed(DEFAULT_DECIMAL_PRECISION));
                                        }
                                        this.setState({ share: newShare, total });
                                    }}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label required'>
                                    <FormattedMessage id='FundTradePage.total' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='number'
                                    value={total}
                                    onChange={(event) => this.setState({ total: AppUtil.toNumber(event.target.value) })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-3'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='FundTradePage.file' />
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
                        <FormattedMessage id='FundTradePage.sellBtn' />
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    }
}