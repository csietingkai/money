import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CCard, CCardBody, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import { ReduxState, getAuthTokenId, getExchangeRateList, getExchangeRateQueryCondition, getStockType } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import ExchangeRateApi, { ExchangeRateRecordVo, ExchangeRateVo } from '../../api/exchangeRate';
import AppPriceChart from '../../components/AppPriceChart';
import { StockType } from '../../util/Enum';
import { Action } from '../../util/Interface';
import ExchangeRateQueryCondition from './interface/ExchangeRateQueryCondition';
import { FundRecordVo } from '../../api/fund';

export interface ExchangeRateQueryPageProps {
    userId: string;
    stockType: StockType;
    exchangeRates: ExchangeRateVo[];
    exchangeRateQueryCondition: ExchangeRateQueryCondition;
    setLoading: (isLoading: boolean) => void;
    notify: (message: string) => void;
}

export interface ExchangeRateQueryPageState {
    exchangeRates: ExchangeRateVo[];
    exchangeRateRecords: { [currency: string]: FundRecordVo[]; };
    activeTab: string;
}

class CurrencyQueryPage extends React.Component<ExchangeRateQueryPageProps, ExchangeRateQueryPageState> {

    constructor(props: ExchangeRateQueryPageProps) {
        super(props);
        const exchangeRates = props.exchangeRates?.filter(x => x.currency !== 'TWD') || [];
        this.state = {
            exchangeRates,
            exchangeRateRecords: {},
            activeTab: props.exchangeRateQueryCondition.currency || exchangeRates[0]?.currency
        };
    }

    componentDidMount() {
        this.init();
    }

    private init = async () => {
        const { exchangeRateQueryCondition: { start: startDate, end: endDate } } = this.props;
        const { exchangeRates } = this.state;
        const apis = exchangeRates.map((x) => ExchangeRateApi.getRecords(x.currency, startDate, endDate));
        const resps = await Promise.all(apis);
        const exchangeRateRecords = {};
        for (let idx = 0; idx < resps.length; idx++) {
            const resp = resps[idx];
            const records: ExchangeRateRecordVo[] = resp.data || [];
            const recordVos: FundRecordVo[] = records.map(x => {
                return {
                    id: x.id,
                    code: x.currency,
                    date: x.date,
                    price: x.spotSell,
                    ma5: x.ma5,
                    ma10: x.ma10,
                    ma20: x.ma20,
                    ma40: x.ma40,
                    ma60: x.ma60,
                    bbup: x.bbup,
                    bbdown: x.bbdown,
                };
            });
            exchangeRateRecords[exchangeRates[idx].currency] = recordVos;
        }
        this.setState({ exchangeRateRecords });
    };

    render(): React.ReactNode {
        const { stockType } = this.props;
        const { exchangeRates, exchangeRateRecords, activeTab } = this.state;
        return (
            <React.Fragment>
                <CNav variant='pills' layout='fill' className='pb-2 border-bottom border-secondary border-bottom-2'>
                    {
                        exchangeRates.map(r => {
                            return (
                                <CNavItem key={`currency-${r.currency}-tab`}>
                                    <CNavLink active={activeTab === r.currency} onClick={() => this.setState({ activeTab: r.currency })}>{r.name}</CNavLink>
                                </CNavItem>
                            );
                        })
                    }
                </CNav>
                <CTabContent>
                    {
                        exchangeRates.map(r => {
                            return (
                                <CTabPane key={`currency-${r.currency}-tabcontent`} visible={activeTab === r.currency} className='mt-2 col-xs-12 mx-auto'>
                                    <CCard className='mb-4'>
                                        <CCardBody>
                                            <AppPriceChart
                                                chartType='fund'
                                                info={{ name: r.name }}
                                                records={exchangeRateRecords[r.currency] || []}
                                            />
                                        </CCardBody>
                                    </CCard>
                                </CTabPane>
                            );
                        })
                    }
                </CTabContent>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        stockType: getStockType(state),
        exchangeRates: getExchangeRateList(state),
        exchangeRateQueryCondition: getExchangeRateQueryCondition(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<Action<boolean | string>>) => {
    return {
        setLoading: SetLoadingDispatcher(dispatch),
        notify: SetNotifyDispatcher(dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrencyQueryPage);
