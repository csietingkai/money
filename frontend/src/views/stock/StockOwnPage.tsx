import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownToggle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowCircleBottom, cilArrowCircleTop, cilOptions, cilPlus } from '@coreui/icons';
import { ReduxState, getAuthTokenId, getStockOwnList } from '../../reducer/Selector';
import StockApi, { UserStockRecord, UserStockVo } from '../../api/stock';
import { SetLoadingDispatcher, SetNotifyDispatcher, SetStockTradeConditionDispatcher } from '../../reducer/PropsMapper';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { DATA_COUNT_PER_PAGE, DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { StockType } from '../../util/Enum';
import { Action } from '../../util/Interface';
import StockTradeCondition, { TradeType } from './interface/StockTradeCondition';

export interface StockOwnPageProps {
    userId: string;
    stockType: StockType;
    ownStockList: UserStockVo[];
    setStockTradeCondition: (tradeCondition?: StockTradeCondition) => void;
    notify: (message: string) => void;
    setLoading: (loading: boolean) => void;
}

export interface StockOwnPageState {
    show: { [stockCode: string]: boolean; };
    currentOwnStockRecords: UserStockRecord[];
    ownStockRecordPage: number;
}

class StockOwnPage extends React.Component<StockOwnPageProps, StockOwnPageState> {

    constructor(props: StockOwnPageProps) {
        super(props);
        this.state = {
            show: props.ownStockList.reduce((acc, curr) => {
                acc[curr.stockCode] = false;
                return acc;
            }, {}),
            currentOwnStockRecords: [],
            ownStockRecordPage: 1
        };
    }

    private toggleInfo = async (ownStockInfo: UserStockVo) => {
        const { setLoading } = this.props;
        const { show } = this.state;
        const { id, stockCode } = ownStockInfo;
        for (const key in show) {
            if (key !== stockCode) {
                show[key] = false;
            }
        }
        show[stockCode] = !show[stockCode];
        if (show[stockCode]) {
            setLoading(true);
            await this.fetchUserStockRecords(id);
            setLoading(false);
        }
        this.setState({ show, ownStockRecordPage: 1 });
    };

    private fetchUserStockRecords = async (userStockId: string) => {
        const response = await StockApi.getOwnRecords(userStockId);
        const { success, data } = response;
        if (success) {
            data.sort((a, b) => b.date.getTime() - a.date.getTime());
            this.setState({ currentOwnStockRecords: data });
        }
    };

    private getCard = (ownStockInfo: UserStockVo) => {
        const { userId, stockType } = this.props;
        const { show, currentOwnStockRecords, ownStockRecordPage } = this.state;
        const currentValue: number = AppUtil.toNumber((ownStockInfo.price * ownStockInfo.amount).toFixed(DEFAULT_DECIMAL_PRECISION));
        const benefit: number = AppUtil.toNumber((currentValue - ownStockInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        const benefitColor: string = AppUtil.getBenifitColor(benefit, stockType);
        const postiveSign: string = benefit >= 0 ? '+' : '';
        const benefitRate: number = AppUtil.toNumber((benefit * 100 / ownStockInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        const showOwnStockRecords = currentOwnStockRecords.slice((ownStockRecordPage - 1) * DATA_COUNT_PER_PAGE, ownStockRecordPage * DATA_COUNT_PER_PAGE);
        return (
            // TODO bg-color by up or down
            <React.Fragment key={`${userId}-${ownStockInfo.stockCode}`}>
                <CCol sm={6} md={4}>
                    <CCard key={`own-stock-${ownStockInfo.stockCode}`} className={`bg-${benefitColor} text-white ${show[ownStockInfo.stockCode] ? `detailed-${benefitColor}` : ''}`}>
                        <CCardBody className='pb-0 mb-3 d-flex justify-content-between align-items-start'>
                            <div>
                                <div className='fs-4 fw-semibold'>
                                    {AppUtil.numberComma(currentValue)}{' '}
                                    <span className='fs-6 fw-normal'>
                                        ({postiveSign}{AppUtil.numberComma(benefit)} | {postiveSign}{AppUtil.numberComma(benefitRate)}% <CIcon icon={benefit > 0 ? cilArrowCircleTop : cilArrowCircleBottom} />)
                                    </span>
                                </div>
                                <div>
                                    {ownStockInfo.stockCode} {ownStockInfo.stockName} | {AppUtil.numberComma(ownStockInfo.amount)}股
                                </div>
                            </div>
                            <CDropdown alignment='end'>
                                <CDropdownToggle color='transparent' caret={false} className='text-white p-0' onClick={() => this.toggleInfo(ownStockInfo)}>
                                    <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                            </CDropdown>
                        </CCardBody>
                    </CCard>
                </CCol>
                {
                    show[ownStockInfo.stockCode] &&
                    <CCol sm={12}>
                        <CCard>
                            <CCardHeader>
                                <strong>{ownStockInfo.stockName}</strong> <small>trade records</small>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol xs={12} className='mb-2 d-grid gap-2 d-md-flex justify-content-md-end'>
                                        <CButtonGroup role='group'>
                                            <CButton
                                                color='danger'
                                                variant='outline'
                                                onClick={() => this.tradeStockPage(ownStockInfo, 'buy')}
                                            >
                                                Buy
                                            </CButton>
                                            <CButton
                                                color='success'
                                                variant='outline'
                                                onClick={() => this.tradeStockPage(ownStockInfo, 'sell')}
                                            >
                                                Sell
                                            </CButton>
                                            <CButton
                                                color='info'
                                                variant='outline'
                                                onClick={() => this.tradeStockPage(ownStockInfo, 'bonus')}
                                            >
                                                Bonus
                                            </CButton>
                                        </CButtonGroup>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol xs={12}>
                                        <CTable align='middle' responsive hover>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell scope='col'>Trade Type</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Date</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Price</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Share</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Fee</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Tax</CTableHeaderCell>
                                                    <CTableHeaderCell scope='col'>Total</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {
                                                    showOwnStockRecords.map(r =>
                                                        <CTableRow key={r.id}>
                                                            <CTableDataCell>{r.type}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.toDateStr(r.date)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.price)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.share)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.fee)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.tax)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.total)}</CTableDataCell>
                                                        </CTableRow>
                                                    )
                                                }
                                            </CTableBody>
                                        </CTable>
                                    </CCol>
                                </CRow>
                                <AppPagination totalDataCount={currentOwnStockRecords.length} currentPage={ownStockRecordPage} onChange={(page: number) => this.setState({ ownStockRecordPage: page })} className='justify-content-center'></AppPagination>
                            </CCardBody>
                        </CCard>
                    </CCol>
                }
            </React.Fragment>
        );
    };

    private tradeStockPage = (stockInfo?: UserStockVo, type?: TradeType) => {
        const { setStockTradeCondition } = this.props;
        if (stockInfo && type) {
            const tradeCondition: StockTradeCondition = {
                type,
                code: stockInfo.stockCode,
                name: stockInfo.stockName,
                currency: 'TWD', // TODO
                date: new Date(),
                price: stockInfo.price,
                share: stockInfo.amount
            };
            setStockTradeCondition(tradeCondition);
        }
        window.location.assign('/#/stockTrade');
    };

    render(): React.ReactNode {
        const { ownStockList } = this.props;
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        ownStockList.map(s => this.getCard(s))
                    }
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12}>
                        <div className='d-grid gap-2 col-xs-8 col-md-6 mx-auto'>
                            <CButton size='lg' color='secondary' shape='rounded-pill' variant='outline' onClick={() => this.tradeStockPage()}>
                                <CIcon icon={cilPlus} className='me-2' />
                                Trade More Stock
                            </CButton>
                        </div>
                    </CCol>
                </CRow>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        ownStockList: getStockOwnList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<StockTradeCondition | undefined | string | boolean>>) => {
    return {
        setStockTradeCondition: SetStockTradeConditionDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockOwnPage);
