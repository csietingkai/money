import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CForm, CFormInput, CFormLabel, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckAlt, cilChevronBottom, cilChevronTop, cilSync } from '@coreui/icons';
import AppPagination from '../../components/AppPagination';
import { ReduxState, getAuthTokenId, getFundQueryCondition, getStockType } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher, SetFundQueryConditionDispatcher, SetFundTradeConditionDispatcher } from '../../reducer/PropsMapper';
import FundApi, { FundRecordVo, FundVo } from '../../api/fund';
import * as AppUtil from '../../util/AppUtil';
import { StockType } from '../../util/Enum';
import { Action, Ma, SupportLineType } from '../../util/Interface';
import FundQueryCondition from './interface/FundQueryCondition';
import FundTradeCondition from './interface/FundTradeCondition';
import { CChartLine } from '@coreui/react-chartjs';

export interface FundQueryPageProps {
    userId: string;
    queryCondition: FundQueryCondition;
    stockType: StockType;
    setFundQueryCondition: (queryCondition: FundQueryCondition) => void;
    setFundTradeCondition: (tradeCondition: FundTradeCondition) => void;
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
    selectedMa: Ma[];
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
            supportLineType: '',
            selectedMa: []
        };
    }

    private onQueryFormChange = (newCondition: FundQueryCondition) => {
        this.setState({ queryForm: newCondition });
        this.props.setFundQueryCondition(newCondition);
    };

    private search = async () => {
        const { queryCondition: { code, name, start, end }, setLoading, notify } = this.props;
        if (!code && !name) {
            notify('Please fill code or name at least.');
            return;
        }
        if (!start || !end) {
            notify('Please fill start and end time.');
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
            this.setState({ funds: [], selectedFund: undefined, fundRecords: [] });
            notify(message);
            return;
        }
        // TODO setFundPredictResult([]);
        setLoading(false);
    };

    private searchRecord = async (code: string) => {
        const { queryForm: { start, end } } = this.state;
        const { success, data: stockRecords } = await FundApi.getRecords(code, start, end);
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
        const { queryForm } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm>
                        <CRow className='mb-2'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Code
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={queryForm.code}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, code: event.target.value as string })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-2'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Name
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <CFormInput
                                    type='text'
                                    value={queryForm.name}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, name: event.target.value as string })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-2'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    Start Date
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <input
                                    type='date'
                                    className='form-control'
                                    value={moment(queryForm.start).format('YYYY-MM-DD')}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, start: new Date(event.target.value) })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-2'>
                            <CCol xs={5} md={4}>
                                <CFormLabel className='col-form-label'>
                                    End Date
                                </CFormLabel>
                            </CCol>
                            <CCol xs={7} md={8}>
                                <input
                                    type='date'
                                    className='form-control'
                                    value={moment(queryForm.end).format('YYYY-MM-DD')}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, end: new Date(event.target.value) })}
                                />
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className='text-end'>
                    <CButton color='success' variant='outline' onClick={this.search}>
                        Search
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    };

    private getFundsCard = () => {
        const { funds, currentFundPage } = this.state;
        if (!funds.length) {
            return <React.Fragment></React.Fragment>;
        }
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CRow className='mb-2'>
                        <CCol>
                            <CTable align='middle' responsive hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope='col'>Code</CTableHeaderCell>
                                        <CTableHeaderCell scope='col'>Name</CTableHeaderCell>
                                        <CTableHeaderCell scope='col'>Update Date</CTableHeaderCell>
                                        <CTableHeaderCell scope='col'></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {
                                        funds.map(s =>
                                            <CTableRow key={s.id} onClick={() => this.searchRecord(s.code)}>
                                                <CTableDataCell>{s.code}</CTableDataCell>
                                                <CTableDataCell><div style={{ minWidth: '120px', overflow: 'hidden' }}>{s.name}</div></CTableDataCell>
                                                <CTableDataCell>{AppUtil.toDateStr(s.updateTime)}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CButtonGroup role='group'>
                                                        <CButton
                                                            color='info'
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => this.syncRecord(s.code)}
                                                        >
                                                            <CIcon icon={cilSync} />
                                                        </CButton>
                                                        {/* TODO track */}
                                                        <CTooltip
                                                            content={`Buy ${s.name}`}
                                                        >
                                                            <CButton
                                                                color='info'
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => this.tradeFund(s, 'buy')}
                                                            >
                                                                <CIcon icon={cilChevronTop} />
                                                            </CButton>
                                                        </CTooltip>
                                                        <CTooltip
                                                            content={`Sell ${s.name}`}
                                                        >
                                                            <CButton
                                                                color='info'
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => this.tradeFund(s, 'sell')}
                                                            >
                                                                <CIcon icon={cilChevronBottom} />
                                                            </CButton>
                                                        </CTooltip>
                                                    </CButtonGroup>
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

    private toggleMa = (ma: Ma) => {
        let { selectedMa } = this.state;
        console.log(selectedMa)
        if (selectedMa.includes(ma)) {
            selectedMa = selectedMa.filter(x => x !== ma);
        } else {
            selectedMa.push(ma);
        }
        this.setState({ supportLineType: 'ma', selectedMa });
    };

    private getFundChartCard = (): React.ReactNode => {
        const { selectedFund, fundRecords, supportLineType, selectedMa } = this.state;
        if (!fundRecords.length) {
            return <React.Fragment></React.Fragment>;
        }
        const labels = fundRecords.map(x => AppUtil.toDateStr(x.date));
        const datasets: any[] = [
            {
                label: '',
                data: fundRecords.map((x: FundRecordVo) => x.price),
                backgroundColor: 'rgba(151, 187, 205, 0.2)',
                borderColor: 'rgba(151, 187, 205, 1)',
                pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                pointBorderColor: '#fff'
            }
        ];
        if (supportLineType === 'ma') {
            if (selectedMa.includes('ma5')) {
                datasets.push({
                    label: 'ma5',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma5),
                    borderColor: 'blue',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma10')) {
                datasets.push({
                    label: 'ma10',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma10),
                    borderColor: 'green',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma20')) {
                datasets.push({
                    label: 'ma20',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma20),
                    borderColor: 'purple',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma40')) {
                datasets.push({
                    label: 'ma40',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma40),
                    borderColor: 'pink',
                    radius: 0,
                    borderWidth: 1
                });
            }
            if (selectedMa.includes('ma60')) {
                datasets.push({
                    label: 'ma60',
                    type: 'line',
                    data: fundRecords.map((x: FundRecordVo) => x.ma60),
                    borderColor: 'yellow',
                    radius: 0,
                    borderWidth: 1
                });
            }
        } else if (supportLineType === 'bb') {
            datasets.push({
                label: 'ma20',
                type: 'line',
                data: fundRecords.map((x: FundRecordVo) => x.ma20),
                borderColor: 'purple',
                radius: 0,
                borderWidth: 1
            });
            datasets.push({
                label: 'bbup',
                type: 'line',
                data: fundRecords.map((x: FundRecordVo) => x.bbup),
                borderColor: 'blue',
                radius: 0,
                borderWidth: 1
            });
            datasets.push({
                label: 'bbdown',
                type: 'line',
                data: fundRecords.map((x: FundRecordVo) => x.bbdown),
                borderColor: 'pink',
                radius: 0,
                borderWidth: 1
            });
        }
        return (
            <CCard className='mb-4'>
                <CCardHeader>
                    <strong>{selectedFund?.name}</strong> <small>details</small>
                </CCardHeader>
                <CCardBody>
                <CRow className='mb-2'>
                    <CCol>
                        <CDropdown variant='btn-group' className='me-2'>
                            <CButton color='info' variant='outline' onClick={() => this.setState({ supportLineType: 'ma' })}>Moving Average</CButton>
                            <CDropdownToggle color='info' variant='outline' split />
                            <CDropdownMenu>
                                <CDropdownItem onClick={() => this.toggleMa('ma5')}>{selectedMa.includes('ma5') && <CIcon icon={cilCheckAlt} />} MA5</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma10')}>{selectedMa.includes('ma10') && <CIcon icon={cilCheckAlt} />} MA10</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma20')}>{selectedMa.includes('ma20') && <CIcon icon={cilCheckAlt} />} MA20</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma40')}>{selectedMa.includes('ma40') && <CIcon icon={cilCheckAlt} />} MA40</CDropdownItem>
                                <CDropdownItem onClick={() => this.toggleMa('ma60')}>{selectedMa.includes('ma60') && <CIcon icon={cilCheckAlt} />} MA60</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                        <CButton color='info' variant='outline' onClick={() => this.setState({ supportLineType: 'bb' })}>Bollinger Bands</CButton>
                    </CCol>
                </CRow>
                    <CChartLine
                        data={{ labels, datasets }}
                        options={{
                            scales: {
                                y: { beginAtZero: false }
                            },
                            interaction: {
                                intersect: true,
                                mode: 'index'
                            },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    enabled: true,
                                }
                            },
                            animation: false
                        }}
                    />
                </CCardBody>
            </CCard>
        );
    };

    render(): React.ReactNode {
        return (
            <React.Fragment>
                <CRow>
                    <CCol xs={12} md={6}>
                        {this.getQueryCard()}
                    </CCol>
                    <CCol xs={12} md={6}>
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
        queryCondition: getFundQueryCondition(state),
        stockType: getStockType(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<FundQueryCondition | FundTradeCondition | undefined | boolean | string>>) => {
    return {
        setFundQueryCondition: SetFundQueryConditionDispatcher(dispatch),
        setFundTradeCondition: SetFundTradeConditionDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundQueryPage);
