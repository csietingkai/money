import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CCard, CCardBody, CCardFooter, CCardHeader, CCardText, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowCircleBottom, cilArrowCircleRight, cilArrowCircleTop, cilInfo, cilLowVision, cilOptions } from '@coreui/icons';
import { ReduxState, getStockTrackings, getLang, getStockType } from '../../reducer/Selector';
import StockApi, { UserTrackingStockVo } from '../../api/stock';
import { SetNotifyDispatcher, SetStockQueryConditionDispatcher, SetTrackingStocksDispatcher } from '../../reducer/PropsMapper';
import * as AppUtil from '../../util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { StockType } from '../../util/Enum';
import { Action, Lang } from '../../util/Interface';
import StockQueryCondition from './interface/StockQueryCondition';

export interface StockTrackPageProps {
    stockType: StockType;
    lang: Lang;
    trackingStocks: UserTrackingStockVo[];
    setStockTrackings: (vos: UserTrackingStockVo[]) => void;
    setStockQueryCondition: (queryCondition: StockQueryCondition) => void;
    notify: (message: string) => void;
}

export interface StockTrackPageState {
    show: { [stockCode: string]: boolean; };
}

class StockTrackPage extends React.Component<StockTrackPageProps, StockTrackPageState> {

    constructor(props: StockTrackPageProps) {
        super(props);
        this.state = {
            show: props.trackingStocks.reduce((acc: { [stockCode: string]: boolean; }, curr: UserTrackingStockVo) => {
                acc[curr.stockCode] = false;
                return acc;
            }, {})
        };
    }

    private untrack = async (stockCode: string) => {
        const { setStockTrackings, notify } = this.props;
        const { success, message } = await StockApi.untrack(stockCode);
        if (success) {
            notify(message);
            StockApi.getTrackingList().then(({ data }) => {
                setStockTrackings(data);
            });
        }
    };

    private toQueryPage = (stockCode: string) => {
        const { setStockQueryCondition } = this.props;
        setStockQueryCondition({ code: stockCode, name: '' });
        window.location.assign('/#/stockQuery');
    };

    private getCard = (stock: UserTrackingStockVo, stockType: StockType): React.ReactNode => {
        const color: string = AppUtil.getBenifitColor(stock.amplitude, stockType);
        let icon: string[] = cilArrowCircleRight;
        if (stock.amplitude > 0) {
            icon = cilArrowCircleTop;
        } else if (stock.amplitude < 0) {
            icon = cilArrowCircleBottom;
        }
        return (
            <React.Fragment key={stock.id}>
                <CCol xs={6} sm={4} md={3} lg={2}>
                    <CCard className='border-success h-100'>
                        <CCardHeader className='h-100'>
                            <CRow>
                                <CCol xs={10}>
                                    {stock.stockCode}
                                </CCol>
                                <CCol xs={2}>
                                    <CDropdown variant='dropdown'>
                                        <CDropdownToggle caret={false} className='p-0'>
                                            <CIcon icon={cilOptions} />
                                        </CDropdownToggle>
                                        <CDropdownMenu>
                                            <CDropdownItem onClick={() => this.untrack(stock.stockCode)}>
                                                <CIcon icon={cilLowVision} className='me-2' />
                                                <FormattedMessage id='StockTrackPage.untrack' />
                                            </CDropdownItem>
                                            <CDropdownItem onClick={() => this.toQueryPage(stock.stockCode)}>
                                                <CIcon icon={cilInfo} className='me-2' />
                                                <FormattedMessage id='StockTrackPage.detail' />
                                            </CDropdownItem>
                                        </CDropdownMenu>
                                    </CDropdown>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol>
                                    <p>{stock.stockName}</p>
                                </CCol>
                            </CRow>
                        </CCardHeader>
                        <CCardBody className={`text-center text-${color}`}>
                            <CCardText as='h2'>{AppUtil.numberComma(stock.record?.closePrice)}</CCardText>
                        </CCardBody>
                        <CCardFooter>
                            <CRow>
                                <CCol xs={7} className={`text-start text-${color}`}>
                                    <small>
                                        {AppUtil.numberComma(Math.abs(stock.amplitude))}
                                        <CIcon icon={icon} className='ms-1' />
                                    </small>
                                </CCol>
                                <CCol xs={5} className={`text-end text-${color}`}>
                                    <small>
                                        {AppUtil.numberComma(AppUtil.toNumber((stock.amplitudeRate * 100).toFixed(DEFAULT_DECIMAL_PRECISION)))}%
                                    </small>
                                </CCol>
                            </CRow>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </React.Fragment>
        );
    };

    render(): React.ReactNode {
        const { stockType, trackingStocks } = this.props;
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        trackingStocks.map(f => this.getCard(f, stockType))
                    }
                </CRow>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        lang: getLang(state),
        stockType: getStockType(state),
        trackingStocks: getStockTrackings(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserTrackingStockVo[] | StockQueryCondition | string>>) => {
    return {
        setStockTrackings: SetTrackingStocksDispatcher(dispatch),
        setStockQueryCondition: SetStockQueryConditionDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockTrackPage);
