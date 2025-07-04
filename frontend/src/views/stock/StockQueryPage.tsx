import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormInput, CFormLabel, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChevronDoubleRight, cilSync } from '@coreui/icons';
import AppPagination from '../../components/AppPagination';
import AppPriceChart from '../../components/AppPriceChart';
import { ReduxState, getAuthTokenId, getLang, getStockQueryCondition, getStockType } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher, SetStockQueryConditionDispatcher, SetStockTradeConditionDispatcher } from '../../reducer/PropsMapper';
import StockApi, { StockRecordVo, StockVo } from '../../api/stock';
import * as cartIcon from '../../assets/cart';
import * as AppUtil from '../../util/AppUtil';
import { StockType } from '../../util/Enum';
import { Action, Lang } from '../../util/Interface';
import StockQueryCondition from './interface/StockQueryCondition';
import StockTradeCondition from './interface/StockTradeCondition';
import { DATA_COUNT_PER_PAGE } from '../../util/Constant';

export interface StockQueryPageProps {
    userId: string;
    queryCondition: StockQueryCondition;
    lang: Lang;
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
        const { queryCondition: { code, name }, setLoading, notify } = this.props;
        if (!code && !name) {
            notify('Please fill code or name at least.');
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
            setLoading(false);
            this.setState({ stocks: [], selectedStock: undefined, stockRecords: [] });
            notify(message);
            return;
        }
        // TODO setStockPredictResult([]);
        setTimeout(() => setLoading(false), 500);
    };

    private searchRecord = async (code: string) => {
        const { success, data: stockRecords } = await StockApi.getRecords(code);
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
        const { lang } = this.props;
        const { queryForm } = this.state;
        return (
            <CCard className='mb-4'>
                <CCardHeader>
                    <div className='d-flex'>
                        <CIcon size='lg' className='my-auto' icon={cilChevronDoubleRight} />
                        <strong className='ms-2'>
                            <FormattedMessage id='StockQueryPage.searchCondition.title' />
                        </strong>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CForm onKeyDown={AppUtil.bindEnterKey(this.search)}>
                        <CRow className='mb-2'>
                            <CCol xs={4} md={3}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='StockQueryPage.searchCondition.code' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={8} md={9}>
                                <CFormInput
                                    type='text'
                                    value={queryForm.code}
                                    placeholder={AppUtil.getFormattedMessage(lang, 'StockQueryPage.searchCondition.codePlaceHolder')}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, code: event.target.value as string })}
                                />
                            </CCol>
                        </CRow>
                        <CRow className='mb-2'>
                            <CCol xs={4} md={3}>
                                <CFormLabel className='col-form-label'>
                                    <FormattedMessage id='StockQueryPage.searchCondition.name' />
                                </CFormLabel>
                            </CCol>
                            <CCol xs={8} md={9}>
                                <CFormInput
                                    type='text'
                                    value={queryForm.name}
                                    placeholder={AppUtil.getFormattedMessage(lang, 'StockQueryPage.searchCondition.namePlaceHolder')}
                                    onChange={(event) => this.onQueryFormChange({ ...queryForm, name: event.target.value as string })}
                                />
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className='text-end'>
                    <CButton color='success' variant='outline' onClick={this.search}>
                        <FormattedMessage id='StockQueryPage.searchCondition.searchBtn' />
                    </CButton>
                </CCardFooter>
            </CCard>
        );
    };

    private getStocksCard = () => {
        const { stockType, lang } = this.props;
        const { stocks, currentStockPage } = this.state;
        if (!stocks.length) {
            return <React.Fragment></React.Fragment>;
        }
        const showStocks = stocks.slice((currentStockPage - 1) * DATA_COUNT_PER_PAGE, currentStockPage * DATA_COUNT_PER_PAGE);
        return (
            <CCard className='mb-4'>
                <CCardBody>
                    <CRow className='mb-2'>
                        <CCol>
                            <CTable align='middle' responsive hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                            <FormattedMessage id='StockQueryPage.searchResult.th.code' />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                            <FormattedMessage id='StockQueryPage.searchResult.th.name' />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className='text-nowrap' scope='col'>
                                            <FormattedMessage id='StockQueryPage.searchResult.th.date' />
                                        </CTableHeaderCell>
                                        <CTableHeaderCell className='text-nowrap' scope='col'></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {
                                        showStocks.map(s =>
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
                                                            content={`${AppUtil.getFormattedMessage(lang, 'StockQueryPage.searchResult.buyBtn')} ${s.name}`}
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
                                                            content={`${AppUtil.getFormattedMessage(lang, 'StockQueryPage.searchResult.sellBtn')} ${s.name}`}
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
        const { lang, stockType } = this.props;
        const { selectedStock, stockRecords } = this.state;
        if (!stockRecords.length) {
            return <React.Fragment></React.Fragment>;
        }

        return (
            <CCard className='mb-4'>
                <CCardHeader>
                    <strong>{selectedStock?.name}</strong>
                    &nbsp;
                    <small><FormattedMessage id='StockQueryPage.chart.subtitle' /></small>
                </CCardHeader>
                <CCardBody>
                    {
                        selectedStock &&
                        <AppPriceChart
                            lang={lang}
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
                    <CCol xs={12} md={5}>
                        {this.getQueryCard()}
                    </CCol>
                    <CCol xs={12} md={7}>
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
        lang: getLang(state),
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
