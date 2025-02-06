import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync } from '@coreui/icons';
import AppPriceChart from '../../components/AppPriceChart';
import AppPagination from '../../components/AppPagination';
import { ReduxState, getAuthTokenId, getStockQueryCondition, getStockType } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher, SetStockQueryConditionDispatcher, SetStockTradeConditionDispatcher } from '../../reducer/PropsMapper';
import StockApi, { StockRecordVo, StockVo } from '../../api/stock';
import * as cartIcon from '../../assets/cart';
import * as AppUtil from '../../util/AppUtil';
import { StockType } from '../../util/Enum';
import { Action } from '../../util/Interface';
import StockQueryCondition from './interface/StockQueryCondition';
import StockTradeCondition from './interface/StockTradeCondition';

export interface StockQueryPageProps {
    userId: string;
    queryCondition: StockQueryCondition;
    stockType: StockType;
    setStockQueryCondition: (queryCondition: StockQueryCondition) => void;
    setStockTradeCondition: (tradeCondition?: StockTradeCondition) => void;
    setLoading: (isLoading: boolean) => void;
    notify: (message: string) => void;
}

export interface StockQueryPageState {
    queryForm: StockQueryCondition;
    stocks: StockVo[];
    selectedStock: StockVo | undefined;
    currentStockPage: number;
    stockRecords: StockRecordVo[];
}

class StockQueryPage extends React.Component<StockQueryPageProps, StockQueryPageState> {

    constructor(props: StockQueryPageProps) {
        super(props);
        this.state = {
            queryForm: props.queryCondition,
            stocks: [],
            selectedStock: undefined,
            currentStockPage: 1,
            stockRecords: []
        };
    }

    private onQueryFormChange = (newCondition: StockQueryCondition) => {
        this.setState({ queryForm: newCondition });
        this.props.setStockQueryCondition(newCondition);
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
        const { success, data: stocks, message } = await StockApi.getAll(code, name);
        if (success) {
            if (stocks.length >= 0) {
                this.setState({ stocks, selectedStock: stocks[0] });
                await this.searchRecord(stocks[0].code);
            } else {
                this.setState({ stocks, selectedStock: undefined, stockRecords: [] });
            }
        } else {
            this.setState({ stocks: [], selectedStock: undefined, stockRecords: [] });
            notify(message);
            return;
        }
        // TODO setStockPredictResult([]);
        setLoading(false);
    };

    private searchRecord = async (code: string) => {
        const { queryForm: { start, end } } = this.state;
        const { success, data: stockRecords } = await StockApi.getRecords(code, start, end);
        if (success) {
            this.setState({ stockRecords });
        }
        // TODO setStockPredictResult([]);
    };

    private syncRecord = async (code: string) => {
        const { setLoading } = this.props;
        setLoading(true);
        const { success } = await StockApi.refresh(code);
        if (success) {
            this.searchRecord(code);
            const { queryCondition: { code: queryCode, name: queryName } } = this.props;
            const { data: stocks } = await StockApi.getAll(queryCode, queryName);
            this.setState({ stocks });
            // TODO setStockPredictResult([]);
        }
        setLoading(false);
    };

    private tradeStock = (stock: StockVo, type: 'buy' | 'sell') => {
        const { code, name, currency } = stock;
        this.props.setStockTradeCondition({ type, code, name, date: new Date(), currency, price: 0, share: 0 });
        window.location.assign('/#/stockTrade');
    };

    private getQueryCard = (): React.ReactNode => {
        const { queryForm } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.search)}>
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

    private getStocksCard = () => {
        const { stockType } = this.props;
        const { stocks, currentStockPage } = this.state;
        if (!stocks.length) {
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
                                        stocks.map(s =>
                                            <CTableRow key={s.id} onClick={() => this.searchRecord(s.code)}>
                                                <CTableDataCell>{s.code}</CTableDataCell>
                                                <CTableDataCell>{s.name}</CTableDataCell>
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
                                                                color={AppUtil.getBenifitColor(1, stockType)}
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => this.tradeStock(s, 'buy')}
                                                            >
                                                                <CIcon icon={cartIcon.buy} />
                                                            </CButton>
                                                        </CTooltip>
                                                        <CTooltip
                                                            content={`Sell ${s.name}`}
                                                        >
                                                            <CButton
                                                                color={AppUtil.getBenifitColor(-1, stockType)}
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => this.tradeStock(s, 'sell')}
                                                            >
                                                                <CIcon icon={cartIcon.sell} />
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
                    <AppPagination totalDataCount={stocks.length} currentPage={currentStockPage} onChange={(page: number) => this.setState({ currentStockPage: page })} className='justify-content-center'></AppPagination>
                </CCardBody>
            </CCard>
        );
    };

    private getStockChartCard = (): React.ReactNode => {
        const { stockType } = this.props;
        const { selectedStock, stockRecords } = this.state;
        if (!stockRecords.length) {
            return <React.Fragment></React.Fragment>;
        }

        return (
            <CCard className='mb-4'>
                <CCardHeader>
                    <strong>{selectedStock?.name}</strong> <small>details</small>
                </CCardHeader>
                <CCardBody>
                    {
                        selectedStock &&
                        <AppPriceChart
                            stockType={stockType}
                            chartType='stock'
                            info={selectedStock}
                            records={stockRecords}
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
                    <CCol xs={12} md={6}>
                        {this.getQueryCard()}
                    </CCol>
                    <CCol xs={12} md={6}>
                        {this.getStocksCard()}
                    </CCol>
                    <CCol xs={12}>
                        {this.getStockChartCard()}
                    </CCol>
                </CRow >
            </React.Fragment >
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        queryCondition: getStockQueryCondition(state),
        stockType: getStockType(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<StockQueryCondition | StockTradeCondition | undefined | boolean | string>>) => {
    return {
        setStockQueryCondition: SetStockQueryConditionDispatcher(dispatch),
        setStockTradeCondition: SetStockTradeConditionDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockQueryPage);
