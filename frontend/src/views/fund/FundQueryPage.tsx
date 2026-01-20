import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CForm, CFormInput, CFormLabel, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChevronDoubleRight, cilHighligt, cilLowVision, cilPen, cilSync } from '@coreui/icons';
import AppPagination from '../../components/AppPagination';
import AppPriceChart from '../../components/AppPriceChart';
import { ReduxState, getAuthTokenId, getFundQueryCondition, getFundTrackings, getLang, getStockType } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher, SetFundQueryConditionDispatcher, SetFundTradeConditionDispatcher, SetTrackingFundsDispatcher } from '../../reducer/PropsMapper';
import FundApi, { FundRecordVo, FundVo, UserTrackingFundVo } from '../../api/fund';
import * as cartIcon from '../../assets/cart';
import * as AppUtil from '../../util/AppUtil';
import { StockType } from '../../util/Enum';
import { Action, Lang, SupportLineType } from '../../util/Interface';
import FundQueryCondition from './interface/FundQueryCondition';
import FundTradeCondition from './interface/FundTradeCondition';
import { DATA_COUNT_PER_PAGE } from '../../util/Constant';

export interface FundQueryPageProps {
    userId: string;
    queryCondition: FundQueryCondition;
    trackingFunds: UserTrackingFundVo[];
    lang: Lang;
    stockType: StockType;
    setFundQueryCondition: (queryCondition: FundQueryCondition) => void;
    setFundTradeCondition: (tradeCondition: FundTradeCondition) => void;
    setTrackingFunds: (trackings: UserTrackingFundVo[]) => void;
    setLoading: (isLoading: boolean) => void;
    notify: (message: string) => void;
}

export interface FundQueryPageState {
    queryForm: FundQueryCondition;
    funds: FundVo[];
    selectedFund: FundVo | undefined;
    currentFundPage: number;
    fundRecords: FundRecordVo[];
    supportLineType: SupportLineType;
}

class FundQueryPage extends React.Component<FundQueryPageProps, FundQueryPageState> {

    constructor(props: FundQueryPageProps) {
        super(props);
        this.state = {
            queryForm: props.queryCondition,
            funds: [],
            selectedFund: undefined,
            currentFundPage: 1,
            fundRecords: [],
            supportLineType: ''
        };
    }

    private onQueryFormChange = (newCondition: FundQueryCondition) => {
        this.setState({ queryForm: newCondition });
        this.props.setFundQueryCondition(newCondition);
    };

    private search = async () => {
        const { queryCondition: { code, name }, setLoading, notify } = this.props;
        if (!code && !name) {
            notify('Please fill code or name at least.');
            return;
        }
        setLoading(true);
        const { success, data: funds, message } = await FundApi.getAll(code, name);
        if (success) {
            if (funds.length >= 0) {
                this.setState({ funds, selectedFund: funds[0] });
                await this.searchRecord(funds[0].code);
            } else {
                this.setState({ funds, selectedFund: undefined, fundRecords: [] });
            }
        } else {
            setLoading(false);
            this.setState({ funds: [], selectedFund: undefined, fundRecords: [] });
            notify(message);
            return;
        }
        // TODO setFundPredictResult([]);
        setTimeout(() => setLoading(false), 500);
    };

    private searchRecord = async (code: string) => {
        const { success, data: stockRecords } = await FundApi.getRecords(code);
        if (success) {
            this.setState({ fundRecords: stockRecords });
        }
        // TODO setFundPredictResult([]);
    };

    private syncRecord = async (code: string) => {
        const { setLoading } = this.props;
        setLoading(true);
        const { success } = await FundApi.refresh(code);
        if (success) {
            this.searchRecord(code);
            const { queryCondition: { code: queryCode, name: queryName } } = this.props;
            const { data: funds } = await FundApi.getAll(queryCode, queryName);
            this.setState({ funds });
            // TODO setFundPredictResult([]);
        }
        setLoading(false);
    };

    private track = async (code: string) => {
        const { setLoading, setTrackingFunds } = this.props;
        setLoading(true);
        const { success } = await FundApi.track(code);
        if (success) {
            FundApi.getTrackingList().then(({ data: trackFunds }) => setTrackingFunds(trackFunds));
        }
        setLoading(false);
    };

    private untrack = async (code: string) => {
        const { setLoading, setTrackingFunds } = this.props;
        setLoading(true);
        const { success } = await FundApi.untrack(code);
        if (success) {
            FundApi.getTrackingList().then(({ data: trackFunds }) => setTrackingFunds(trackFunds));
        }
        setLoading(false);
    };

    private tradeFund = (fund: FundVo, type: 'buy' | 'sell') => {
        const { code, name } = fund;
        if (type === 'buy') {
            this.props.setFundTradeCondition({ type, code, name, date: new Date(), debitAmount: 0, price: 0, rate: 1 });
        } else {
            this.props.setFundTradeCondition({ type, code, name, date: new Date(), share: 0, price: 0, rate: 1 });
        }
        window.location.assign('/#/fundTrade');
    };

    private getQueryCard = (): React.ReactNode => {
        const { lang } = this.props;
        const { queryForm } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardHeader>
                    <div className='d-flex'>
                        <CIcon size='lg' className='my-auto' icon={cilChevronDoubleRight} />
                        <strong className='ms-2'>
                            <FormattedMessage id='FundQueryPage.searchCondition.title' />
                        </strong>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.search)}>
                        <CRow className='mb-2'>
                            <CCol xs={4} md={3}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='FundQueryPage.searchCondition.code' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={8} md={9}>
                                <CFormInput
                                    type='text'
                                    value={queryForm.code}
                                    placeholder={AppUtil.getFormattedMessage(lang, 'FundQueryPage.searchCondition.codePlaceHolder')}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, code: event.target.value as string })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-2'>
                            <CCol xs={4} md={3}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='FundQueryPage.searchCondition.name' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={8} md={9}>
                                <CFormInput
                                    type='text'
                                    value={queryForm.name}
                                    placeholder={AppUtil.getFormattedMessage(lang, 'FundQueryPage.searchCondition.namePlaceHolder')}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, name: event.target.value as string })}
                                />
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className='text-end'>
                    <CButton color='success' variant='outline' onClick={this.search}>
                        <FormattedMessage id='FundQueryPage.searchCondition.searchBtn' />
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    };

    private getFundsCard = () => {
        const { stockType, trackingFunds } = this.props;
        const { funds, currentFundPage } = this.state;
        if (!funds.length) {
            return <React.Fragment></React.Fragment>;
        }
        const showFunds = funds.slice((currentFundPage - 1) * DATA_COUNT_PER_PAGE, currentFundPage * DATA_COUNT_PER_PAGE);
        const trackingCodes = trackingFunds.map(tf => tf.fundCode);
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CRow className='mb-2'>
                        <CCol>
                            <CTable align='middle' responsive hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                            <FormattedMessage id='FundQueryPage.searchResult.th.code' />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                            <FormattedMessage id='FundQueryPage.searchResult.th.name' />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                            <FormattedMessage id='FundQueryPage.searchResult.th.date' />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className='text-nowrap' scope='col'></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {
                                        showFunds.map(s =>
                                            <CTableRow key={s.id} onClick={() => this.searchRecord(s.code)}>
                                                <CTableDataCell>{s.code}</CTableDataCell>
                                                <CTableDataCell><div style={{ minWidth: '120px', overflow: 'hidden' }}>{s.name}</div></CTableDataCell>
                                                <CTableDataCell>{AppUtil.toDateStr(s.updateTime)}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CDropdown variant='btn-group' className='position-static'>
                                                        <CDropdownToggle color='secondary' variant='outline' size='sm'>
                                                            <CIcon icon={cilPen} />
                                                        </CDropdownToggle>
                                                        <CDropdownMenu>
                                                            <CDropdownItem onClick={() => this.syncRecord(s.code)}>
                                                                <CIcon icon={cilSync} className='me-2' />
                                                                <FormattedMessage id='FundQueryPage.searchResult.th.action.sync' />
                                                            </CDropdownItem>
                                                            {
                                                                trackingCodes.indexOf(s.code) < 0 &&
                                                                <CDropdownItem onClick={() => this.track(s.code)}>
                                                                    <CIcon icon={cilHighligt} className='me-2' />
                                                                    <FormattedMessage id='FundQueryPage.searchResult.th.action.track' />
                                                                </CDropdownItem>
                                                            }
                                                            {
                                                                trackingCodes.indexOf(s.code) >= 0 &&
                                                                <CDropdownItem onClick={() => this.untrack(s.code)}>
                                                                    <CIcon icon={cilLowVision} className='me-2' />
                                                                    <FormattedMessage id='FundQueryPage.searchResult.th.action.untrack' />
                                                                </CDropdownItem>
                                                            }
                                                            <CDropdownItem onClick={() => this.tradeFund(s, 'buy')}>
                                                                <CIcon icon={cartIcon.buy} className={`me-2 text-${AppUtil.getBenifitColor(1, stockType)}`} />
                                                                <FormattedMessage id='FundQueryPage.searchResult.th.action.buy' />
                                                            </CDropdownItem>
                                                            <CDropdownItem onClick={() => this.tradeFund(s, 'sell')}>
                                                                <CIcon icon={cartIcon.sell} className={`me-2 text-${AppUtil.getBenifitColor(-1, stockType)}`} />
                                                                <FormattedMessage id='FundQueryPage.searchResult.th.action.sell' /></CDropdownItem>
                                                        </CDropdownMenu>
                                                    </CDropdown>
                                                </CTableDataCell>
                                            </CTableRow>
                                        )
                                    }
                                </CTableBody>
                            </CTable>
                        </CCol>
                    </CRow>
                    <AppPagination totalDataCount={funds.length} currentPage={currentFundPage} onChange={(page: number) => this.setState({ currentFundPage: page })} className='justify-content-center'></AppPagination>
                </CCardBody>
            </CCard>
        );
    };

    private getFundChartCard = (): React.ReactNode => {
        const { lang } = this.props;
        const { selectedFund, fundRecords } = this.state;
        if (!fundRecords.length) {
            return <React.Fragment></React.Fragment>;
        }
        return (
            <CCard className='mb-4'>
                <CCardHeader>
                    <strong>{selectedFund?.name}</strong>
                    &nbsp;
                    <small>
                        <FormattedMessage id='FundQueryPage.chart.subtitle' />
                    </small>
                </CCardHeader>
                <CCardBody>
                    {
                        selectedFund &&
                        <AppPriceChart
                            lang={lang}
                            chartType='fund'
                            info={selectedFund}
                            records={fundRecords}
                        />
                    }
                </CCardBody>
            </CCard>
        );
    };

    render(): React.ReactNode {
        return (
            <React.Fragment>
                <CRow>
                    <CCol xs={12} md={5}>
                        {this.getQueryCard()}
                    </CCol>
                    <CCol xs={12} md={7}>
                        {this.getFundsCard()}
                    </CCol>
                    <CCol xs={12}>
                        {this.getFundChartCard()}
                    </CCol>
                </CRow >
            </React.Fragment >
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        lang: getLang(state),
        stockType: getStockType(state),
        queryCondition: getFundQueryCondition(state),
        trackingFunds: getFundTrackings(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<FundQueryCondition | FundTradeCondition | UserTrackingFundVo[] | undefined | boolean | string>>) => {
    return {
        setFundQueryCondition: SetFundQueryConditionDispatcher(dispatch),
        setFundTradeCondition: SetFundTradeConditionDispatcher(dispatch),
        setTrackingFunds: SetTrackingFundsDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundQueryPage);
