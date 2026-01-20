import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { cilArrowCircleBottom, cilArrowCircleRight, cilArrowCircleTop, cilInfo, cilLowVision, cilOptions } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CCard, CCardBody, CCardFooter, CCardHeader, CCardText, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react';
import { getFundTrackings, getLang, getStockType, ReduxState } from '../../reducer/Selector';
import { SetFundQueryConditionDispatcher, SetNotifyDispatcher, SetTrackingFundsDispatcher } from '../../reducer/PropsMapper';
import FundApi, { UserTrackingFundVo } from '../../api/fund';
import * as AppUtil from '../../util/AppUtil';
import { DEFAULT_DECIMAL_PRECISION } from '../../util/Constant';
import { StockType } from '../../util/Enum';
import { Action, Lang } from '../../util/Interface';
import FundQueryCondition from './interface/FundQueryCondition';

export interface FundTrackPageProps {
    stockType: StockType;
    lang: Lang;
    trackingFunds: UserTrackingFundVo[];
    setFundTrackings: (vos: UserTrackingFundVo[]) => void;
    setFundQueryCondition: (queryCondition: FundQueryCondition) => void;
    notify: (message: string) => void;
}

export interface FundTrackPageState {
    show: { [fundCode: string]: boolean; };
}

class FundTrackPage extends React.Component<FundTrackPageProps, FundTrackPageState> {

    constructor(props: FundTrackPageProps) {
        super(props);
        this.state = {
            show: props.trackingFunds.reduce((acc: { [fundCode: string]: boolean; }, curr: UserTrackingFundVo) => {
                acc[curr.fundCode] = false;
                return acc;
            }, {})
        };
    }

    private untrack = async (fundCode: string) => {
        const { setFundTrackings, notify } = this.props;
        const { success, message } = await FundApi.untrack(fundCode);
        if (success) {
            notify(message);
            FundApi.getTrackingList().then(({ data }) => {
                setFundTrackings(data);
            });
        }
    };

    private toQueryPage = (fundCode: string) => {
        const { setFundQueryCondition } = this.props;
        setFundQueryCondition({ code: fundCode, name: '' });
        window.location.assign('/#/fundQuery');
    };

    private getCard = (fund: UserTrackingFundVo, stockType: StockType): React.ReactNode => {
        const color: string = AppUtil.getBenifitColor(fund.amplitude, stockType);
        let icon: string[] = cilArrowCircleRight;
        if (fund.amplitude > 0) {
            icon = cilArrowCircleTop;
        } else if (fund.amplitude < 0) {
            icon = cilArrowCircleBottom;
        }
        return (
            <React.Fragment key={fund.id}>
                <CCol xs={6} sm={4} md={3} lg={2}>
                    <CCard className='border-success h-100'>
                        <CCardHeader className='h-100'>
                            <CRow>
                                <CCol xs={10}>
                                    {fund.fundCode}
                                </CCol>
                                <CCol xs={2}>
                                    <CDropdown variant='dropdown'>
                                        <CDropdownToggle caret={false} className='p-0'>
                                            <CIcon icon={cilOptions} />
                                        </CDropdownToggle>
                                        <CDropdownMenu>
                                            <CDropdownItem onClick={() => this.untrack(fund.fundCode)}>
                                                <CIcon icon={cilLowVision} className='me-2' />
                                                <FormattedMessage id='FundTrackPage.untrack' />
                                            </CDropdownItem>
                                            <CDropdownItem onClick={() => this.toQueryPage(fund.fundCode)}>
                                                <CIcon icon={cilInfo} className='me-2' />
                                                <FormattedMessage id='FundTrackPage.detail' />
                                            </CDropdownItem>
                                        </CDropdownMenu>
                                    </CDropdown>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol>
                                    <p>{fund.fundName}</p>
                                </CCol>
                            </CRow>
                        </CCardHeader>
                        <CCardBody className={`text-center text-${color}`}>
                            <CCardText as='h2'>{AppUtil.numberComma(fund.record?.price)}</CCardText>
                        </CCardBody>
                        <CCardFooter>
                            <CRow>
                                <CCol xs={7} className={`text-start text-${color}`}>
                                    <small>
                                        {AppUtil.numberComma(Math.abs(fund.amplitude))}
                                        <CIcon icon={icon} className='ms-1' />
                                    </small>
                                </CCol>
                                <CCol xs={5} className={`text-end text-${color}`}>
                                    <small>
                                        {AppUtil.numberComma(AppUtil.toNumber((fund.amplitudeRate * 100).toFixed(DEFAULT_DECIMAL_PRECISION)))}%
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
        const { stockType, trackingFunds } = this.props;
        return (
            <React.Fragment>
                <CRow className='mb-4' xs={{ gutter: 4 }}>
                    {
                        trackingFunds.map(f => this.getCard(f, stockType))
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
        trackingFunds: getFundTrackings(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<UserTrackingFundVo[] | FundQueryCondition | string>>) => {
    return {
        setFundTrackings: SetTrackingFundsDispatcher(dispatch),
        setFundQueryCondition: SetFundQueryConditionDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FundTrackPage);
