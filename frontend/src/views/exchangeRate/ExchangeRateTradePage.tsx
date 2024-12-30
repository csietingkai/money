import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CCard, CCardBody, CCardFooter, CCol, CContainer, CForm, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react';
import { cilMediaSkipForward } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { ReduxState, getAccountList, getAuthTokenId, getExchangeRateList } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import AccountApi, { Account } from '../../api/account';
import ExchangeRateApi, { ExchangeRateVo } from '../../api/exchangeRate';
import * as AppUtil from '../../util/AppUtil';
import { StockType } from '../../util/Enum';
import { Action, Option } from '../../util/Interface';

export interface ExchangeRateQueryPageProps {
    userId: string;
    stockType: StockType;
    exchangeRates: ExchangeRateVo[];
    accounts: Account[];
    setLoading: (isLoading: boolean) => void;
    notify: (message: string) => void;
    setAccountList: (accounts: Account[]) => void;
}

export interface ExchangeRateQueryPageState {
    tradeForm: {
        fromCurr: string;
        toCurr: string;
        fromAccId: string;
        toAccId: string;
        fromAccBalance: number;
        toAccBalance: number;
        rate: number;
        date: Date;
        fromAmount: number;
        toAmount: number;
    };
}

class CurrencyQueryPage extends React.Component<ExchangeRateQueryPageProps, ExchangeRateQueryPageState> {

    constructor(props: ExchangeRateQueryPageProps) {
        super(props);
        this.state = this.init();
    }

    private init = (): ExchangeRateQueryPageState => {
        return {
            tradeForm: {
                fromCurr: '',
                toCurr: '',
                fromAccId: '',
                toAccId: '',
                fromAccBalance: 0,
                toAccBalance: 0,
                rate: 1,
                date: new Date(),
                fromAmount: 0,
                toAmount: 0
            }
        }
    }

    private onTradeClick = async () => {
        const { notify } = this.props;
        const { tradeForm } = this.state;
        const { fromAccId, toAccId, rate, date, fromAmount, toAmount } = tradeForm;
        const { success, message } = await ExchangeRateApi.trade(fromAccId, toAccId, date, rate, fromAmount, toAmount);
        notify(message);
        if (success) {
            this.fetchAccounts();
            this.setState(this.init())
        }
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
        const { exchangeRates, accounts } = this.props;
        const { tradeForm } = this.state;
        const { fromCurr, toCurr, fromAccId, toAccId, fromAccBalance, toAccBalance, rate, fromAmount, toAmount } = tradeForm;
        const fromCurrOptions: Option[] = exchangeRates.filter(x => x.currency !== toCurr).map(x => ({ key: x.currency, value: x.name }));
        const toCurrOptions: Option[] = exchangeRates.filter(x => x.currency !== fromCurr).map(x => ({ key: x.currency, value: x.name }));
        const fromAccOptions: Account[] = accounts.filter(x => x.currency === fromCurr);
        const toAccOptions: Account[] = accounts.filter(x => x.currency === toCurr);
        return (
            <CContainer>
                <CRow className='justify-content-center'>
                    <CCol xs={12} md={10}>
                        <CCard className='mb-4'>
                            <CCardBody>
                                <CForm onKeyDown={AppUtil.bindEnterKey(this.onTradeClick)}>
                                    <CRow className='mb-3'>
                                        <CCol xs={3}>
                                            <CFormLabel className='col-form-label'>
                                                Currency
                                            </CFormLabel>
                                        </CCol>
                                        <CCol xs={9}>
                                            <CRow className='justify-content-around'>
                                                <CCol>
                                                    <CFormSelect
                                                        value={fromCurr}
                                                        onChange={(event: any) => this.setState({ tradeForm: { ...tradeForm, fromCurr: event.target.value as string, fromAccBalance: 0 } })}
                                                    >
                                                        <option value=''></option>
                                                        {fromCurrOptions.map(a => <option key={`from-curr-${a.key}`} value={a.key}>{a.value}</option>)}
                                                    </CFormSelect>
                                                </CCol>
                                                <CCol xs={1} className='pl-0 pr-0 align-self-center text-center'>
                                                    <CIcon icon={cilMediaSkipForward} size='lg' />
                                                </CCol>
                                                <CCol>
                                                    <CFormSelect
                                                        value={toCurr}
                                                        onChange={(event: any) => this.setState({ tradeForm: { ...tradeForm, toCurr: event.target.value as string, toAccBalance: 0 } })}
                                                    >
                                                        <option value=''></option>
                                                        {toCurrOptions.map(a => <option key={`to-curr-${a.key}`} value={a.key}>{a.value}</option>)}
                                                    </CFormSelect>
                                                </CCol>
                                            </CRow>
                                        </CCol>
                                    </CRow>
                                    <CRow className='mb-3'>
                                        <CCol xs={3}>
                                            <CFormLabel className='col-form-label'>
                                                Account
                                            </CFormLabel>
                                        </CCol>
                                        <CCol xs={9}>
                                            <CRow className='justify-content-around'>
                                                <CCol>
                                                    <CFormSelect
                                                        value={fromAccId}
                                                        onChange={(event: any) => {
                                                            const accountId = event.target.value as string;
                                                            const balance = accounts.find(x => x.id === accountId)?.balance || 0;
                                                            this.setState({ tradeForm: { ...tradeForm, fromAccId: event.target.value as string, fromAccBalance: balance } });
                                                        }}
                                                    >
                                                        <option value=''></option>
                                                        {fromAccOptions.map(a => <option key={`from-acc-${a.id}`} value={a.id}>{a.name}</option>)}
                                                    </CFormSelect>
                                                </CCol>
                                                <CCol xs={1} className='pl-0 pr-0 align-self-center text-center'>
                                                    <CIcon icon={cilMediaSkipForward} size='lg' />
                                                </CCol>
                                                <CCol>
                                                    <CFormSelect
                                                        value={toAccId}
                                                        onChange={(event: any) => {
                                                            const accountId = event.target.value as string;
                                                            const balance = accounts.find(x => x.id === accountId)?.balance || 0;
                                                            this.setState({ tradeForm: { ...tradeForm, toAccId: event.target.value as string, toAccBalance: balance } });
                                                        }}
                                                    >
                                                        <option value=''></option>
                                                        {toAccOptions.map(a => <option key={`to-acc-${a.id}`} value={a.id}>{a.name}</option>)}
                                                    </CFormSelect>
                                                </CCol>
                                            </CRow>
                                        </CCol>
                                    </CRow>
                                    <CRow className='mb-3'>
                                        <CCol xs={3}>
                                            <CFormLabel className='col-form-label'>
                                                Balance
                                            </CFormLabel>
                                        </CCol>
                                        <CCol xs={9}>
                                            <CRow className='justify-content-around'>
                                                <CCol>
                                                    <CFormInput
                                                        type='text'
                                                        value={AppUtil.numberComma(fromAccBalance)}
                                                        disabled
                                                    />
                                                </CCol>
                                                <CCol xs={1} className='pl-0 pr-0 align-self-center text-center'>
                                                    <CIcon icon={cilMediaSkipForward} size='lg' />
                                                </CCol>
                                                <CCol>
                                                    <CFormInput
                                                        type='text'
                                                        value={AppUtil.numberComma(toAccBalance)}
                                                        disabled
                                                    />
                                                </CCol>
                                            </CRow>
                                        </CCol>
                                    </CRow>
                                    <CRow className='mb-3'>
                                        <CCol xs={3}>
                                            <CFormLabel className='col-form-label'>
                                                Rate
                                            </CFormLabel>
                                        </CCol>
                                        <CCol xs={9}>
                                            <CFormInput
                                                type='number'
                                                value={rate}
                                                step={0.1}
                                                onChange={(event) => this.setState({ tradeForm: { ...tradeForm, rate: AppUtil.toNumber(event.target.value) } })}
                                            />
                                        </CCol>
                                    </CRow>
                                    <CRow className='mb-3'>
                                        <CCol xs={3}>
                                            <CFormLabel className='col-form-label'>
                                                Amount
                                            </CFormLabel>
                                        </CCol>
                                        <CCol xs={9}>
                                            <CRow className='justify-content-around'>
                                                <CCol>
                                                    <CFormInput
                                                        type='number'
                                                        value={fromAmount}
                                                        onChange={(event) => {
                                                            const newFromAmount = AppUtil.toNumber(event.target.value);
                                                            const newToAmount = AppUtil.toNumber((newFromAmount / rate).toFixed(AppUtil.precision(rate)));
                                                            this.setState({ tradeForm: { ...tradeForm, fromAmount: newFromAmount, toAmount: newToAmount } });
                                                        }}
                                                    />
                                                </CCol>
                                                <CCol xs={1} className='pl-0 pr-0 align-self-center text-center'>
                                                    <CIcon icon={cilMediaSkipForward} size='lg' />
                                                </CCol>
                                                <CCol>
                                                    <CFormInput
                                                        value={toAmount}
                                                        onChange={(event) => this.setState({ tradeForm: { ...tradeForm, toAmount: AppUtil.toNumber(event.target.value) } })}
                                                    />
                                                </CCol>
                                            </CRow>
                                        </CCol>
                                    </CRow>
                                </CForm>
                            </CCardBody>
                            <CCardFooter className='text-end'>
                                <CButton color='success' variant='outline' onClick={this.onTradeClick}>
                                    Trade
                                </CButton>
                            </CCardFooter>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        exchangeRates: getExchangeRateList(state),
        accounts: getAccountList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<boolean | string>>) => {
    return {
        setLoading: SetLoadingDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrencyQueryPage);
