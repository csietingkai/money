import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownToggle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowCircleBottom, cilArrowCircleTop, cilOptions, cilPlus } from '@coreui/icons';
import { ReduxState, getAuthTokenId, getFundOwnList } from '../../reducer/Selector';
import FundApi, { UserFundRecord, UserFundVo } from '../../api/fund';
import { SetFundTradeConditionDispatcher, SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import AppPagination from '../../components/AppPagination';
import * as AppUtil from '../../util/AppUtil';
import { DATA_COUNT_PER_PAGE, DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { StockType } from '../../util/Enum';
import { Action } from '../../util/Interface';
import FundTradeCondition, { TradeType } from './interface/FundTradeCondition';

export interface FundOwnPageProps {
    userId: string;
    stockType: StockType;
    ownFundList: UserFundVo[];
    setFundTradeCondition: (tradeCondition?: FundTradeCondition) => void;
    notify: (message: string) => void;
    setLoading: (loading: boolean) => void;
}

export interface FundOwnPageState {
    show: { [stockCode: string]: boolean; };
    currentOwnFundRecords: UserFundRecord[];
    ownFundRecordPage: number;
}

class FundOwnPage extends React.Component<FundOwnPageProps, FundOwnPageState> {

    constructor(props: FundOwnPageProps) {
        super(props);
        this.state = {
            show: props.ownFundList.reduce((acc, curr) => {
                acc[curr.fundCode] = false;
                return acc;
            }, {}),
            currentOwnFundRecords: [],
            ownFundRecordPage: 1
        };
    }

    private toggleInfo = async (ownFundInfo: UserFundVo) => {
        const { setLoading } = this.props;
        const { show } = this.state;
        const { id, fundCode } = ownFundInfo;
        for (const key in show) {
            if (key !== fundCode) {
                show[key] = false;
            }
        }
        show[fundCode] = !show[fundCode];
        if (show[fundCode]) {
            setLoading(true);
            await this.fetchUserFundRecords(id);
            setLoading(false);
        }
        this.setState({ show });
    };

    private fetchUserFundRecords = async (userFundId: string) => {
        const response = await FundApi.getOwnRecords(userFundId);
        const { success, data } = response;
        if (success) {
            data.sort((a, b) => b.date.getTime() - a.date.getTime());
            this.setState({ currentOwnFundRecords: data });
        }
    };

    private getCard = (ownFundInfo: UserFundVo) => {
        const { userId, stockType } = this.props;
        const { show, currentOwnFundRecords, ownFundRecordPage } = this.state;
        const currentValue: number = AppUtil.toNumber((ownFundInfo.price * ownFundInfo.amount).toFixed(DEFAULT_DECIMAL_PRECISION));
        const benefit: number = AppUtil.toNumber((currentValue - ownFundInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        const benefitColor: string = AppUtil.getBenifitColor(benefit, stockType);
        const postiveSign: string = benefit >= 0 ? '+' : '';
        const benefitRate: number = AppUtil.toNumber((benefit * 100 / ownFundInfo.cost).toFixed(DEFAULT_DECIMAL_PRECISION));
        const showOwnFundRecords = currentOwnFundRecords.slice((ownFundRecordPage - 1) * DATA_COUNT_PER_PAGE, ownFundRecordPage * DATA_COUNT_PER_PAGE);
        return (
            // TODO bg-color by up or down
            <React.Fragment key={`${userId}-${ownFundInfo.fundCode}`}>
                <CCol sm={6} md={4}>
                    <CCard key={`own-stock-${ownFundInfo.fundCode}`} className={`bg-${benefitColor} text-white ${show[ownFundInfo.fundCode] ? `detailed-${benefitColor}` : ''}`}>
                        <CCardBody className='pb-0 mb-3 d-flex justify-content-between align-items-start'>
                            <div>
                                <div className='fs-4 fw-semibold'>
                                    {AppUtil.numberComma(currentValue)}{' '}
                                    <span className='fs-6 fw-normal'>
                                        ({postiveSign}{AppUtil.numberComma(benefit)} | {postiveSign}{AppUtil.numberComma(benefitRate)}% <CIcon icon={benefit > 0 ? cilArrowCircleTop : cilArrowCircleBottom} />)
                                    </span>
                                </div>
                                <div>
                                    {ownFundInfo.fundCode} {ownFundInfo.fundName} | {AppUtil.numberComma(ownFundInfo.amount)}股
                                </div>
                            </div>
                            <CDropdown alignment='end'>
                                <CDropdownToggle color='transparent' caret={false} className='text-white p-0' onClick={() => this.toggleInfo(ownFundInfo)}>
                                    <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                            </CDropdown>
                        </CCardBody>
                    </CCard>
                </CCol>
                {
                    show[ownFundInfo.fundCode] &&
                    <CCol sm={12}>
                        <CCard>
                            <CCardHeader>
                                <strong>{ownFundInfo.fundName}</strong> <small>trade records</small>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol xs={12} className='mb-2 d-grid gap-2 d-md-flex justify-content-md-end'>
                                        <CButtonGroup role='group'>
                                            <CButton
                                                color='danger'
                                                variant='outline'
                                                onClick={() => this.tradeFundPage(ownFundInfo, 'buy')}
                                            >
                                                Buy
                                            </CButton>
                                            <CButton
                                                color='success'
                                                variant='outline'
                                                onClick={() => this.tradeFundPage(ownFundInfo, 'sell')}
                                            >
                                                Sell
                                            </CButton>
                                            <CButton
                                                color='info'
                                                variant='outline'
                                                onClick={() => this.tradeFundPage(ownFundInfo, 'bonus')}
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
                                                    <CTableHeaderCell scope='col'>Total</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {
                                                    showOwnFundRecords.map(r =>
                                                        <CTableRow key={r.id}>
                                                            <CTableDataCell>{r.type}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.toDateStr(r.date)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.price)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.share)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.fee)}</CTableDataCell>
                                                            <CTableDataCell>{AppUtil.numberComma(r.total)}</CTableDataCell>
                                                        </CTableRow>
                                                    )
                                                }
                                            </CTableBody>
                                        </CTable>
                                    </CCol>
                                </CRow>
                                <AppPagination totalDataCount={currentOwnFundRecords.length} currentPage={ownFundRecordPage} onChange={(page: number) => this.setState({ ownFundRecordPage: page })} className='justify-content-center'></AppPagination>
                            </CCardBody>
                        </CCard>
                    </CCol>
                }
            </React.Fragment>
        );
    };

    private tradeFundPage = (fundInfo?: UserFundVo, type?: TradeType) => {
        const { setFundTradeCondition } = this.props;
        if (fundInfo && type) {
            const tradeCondition: FundTradeCondition = {
                type,
                code: fundInfo.fundCode,
                name: fundInfo.fundName,
                date: new Date(),
                price: fundInfo.price,
                rate: 1, // TODO exchange rate
                share: fundInfo.amount
            };
            setFundTradeCondition(tradeCondition);
        }
        window.location.assign('/#/fundTrade');
    };

    render(): React.ReactNode {
        const { ownFundList } = this.props;
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        ownFundList.map(s => this.getCard(s))
                    }
                </CRow>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    <CCol sm={12}>
                        <div className='d-grid gap-2 col-xs-8 col-md-6 mx-auto'>
                            <CButton size='lg' color='secondary' shape='rounded-pill' variant='outline' onClick={() => this.tradeFundPage()}>
                                <CIcon icon={cilPlus} className='me-2' />
                                Trade More Fund
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
        ownFundList: getFundOwnList(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<FundTradeCondition | undefined | string | boolean>>) => {
    return {
        setFundTradeCondition: SetFundTradeConditionDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch),
        setLoading: SetLoadingDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundOwnPage);
