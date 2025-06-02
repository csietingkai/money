import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { CCard, CCardBody, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import { ReduxState, getAuthTokenId, getExchangeRateList, getExchangeRateQueryCondition, getLang, getStockType } from '../../reducer/Selector';
import { SetLoadingDispatcher, SetNotifyDispatcher } from '../../reducer/PropsMapper';
import ExchangeRateApi, { ExchangeRateVo } from '../../api/exchangeRate';
import { FundRecordVo } from '../../api/fund';
import AppPriceChart from '../../components/AppPriceChart';
import { StockType } from '../../util/Enum';
import { Action, Lang } from '../../util/Interface';
import ExchangeRateQueryCondition from './interface/ExchangeRateQueryCondition';

export interface ExchangeRateQueryPageProps {
    userId: string;
    exchangeRates: ExchangeRateVo[];
    exchangeRateQueryCondition: ExchangeRateQueryCondition;
    lang: Lang;
    stockType: StockType;
    setLoading: (isLoading: boolean) => void;
    notify: (message: string) => void;
}

export interface ExchangeRateQueryPageState {
    exchangeRates: ExchangeRateVo[];
    exchangeRateRecords: FundRecordVo[];
    activeTab: string;
}

class CurrencyQueryPage extends React.Component<ExchangeRateQueryPageProps, ExchangeRateQueryPageState> {

    constructor(props: ExchangeRateQueryPageProps) {
        super(props);
        const exchangeRates = props.exchangeRates?.filter(x => x.currency !== 'TWD') || [];
        this.state = {
            exchangeRates,
            exchangeRateRecords: [],
            activeTab: props.exchangeRateQueryCondition.currency || exchangeRates.filter(er => er.currency !== 'TWD')[0]?.currency
        };
    }

    componentDidMount() {
        this.init(this.props.exchangeRateQueryCondition.currency || this.props.exchangeRates.filter(er => er.currency !== 'TWD')[0]?.currency);
    }

    private init = async (currency: string) => {
        const { setLoading } = this.props;
        setLoading(true);
        const recordVos = await this.fetchExchangeRateRecords(currency);
        this.setState({ exchangeRateRecords: recordVos });
        setTimeout(() => setLoading(false), 500);
    };

    private onTabChange = async (currency: string) => {
        const { setLoading } = this.props;
        const { activeTab } = this.state;
        if (activeTab === currency) {
            return;
        }
        setLoading(true);
        const recordVos = await this.fetchExchangeRateRecords(currency);
        this.setState({ activeTab: currency, exchangeRateRecords: recordVos });
        setTimeout(() => setLoading(false), 500);
    }

    private fetchExchangeRateRecords = async (currency: string): Promise<FundRecordVo[]> => {
        const resp = await ExchangeRateApi.getRecords(currency);
        const { data: records } = resp;
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
        return recordVos;
    }

    render(): React.ReactNode {
        const { lang } = this.props;
        const { exchangeRates, exchangeRateRecords, activeTab } = this.state;
        const selectedExchangeRate = exchangeRates.find(er => er.currency === activeTab);
        return (
            <React.Fragment>
                <CNav variant='pills' layout='fill' className='pb-2 border-bottom border-secondary border-bottom-2'>
                    {
                        exchangeRates.map(r => {
                            return (
                                <CNavItem key={`currency-${r.currency}-tab`}>
                                    <CNavLink
                                        active={activeTab === r.currency}
                                        onClick={() => this.onTabChange(r.currency)}
                                    >
                                        {r.name}
                                    </CNavLink>
                                </CNavItem>
                            );
                        })
                    }
                </CNav>
                <CTabContent>
                    <CTabPane visible className='mt-2 col-xs-12 mx-auto'>
                        <CCard className='mb-4'>
                            <CCardBody>
                                <AppPriceChart
                                    lang={lang}
                                    chartType='fund'
                                    info={{ name: selectedExchangeRate?.name || '' }}
                                    records={exchangeRateRecords}
                                />
                            </CCardBody>
                        </CCard>
                    </CTabPane>
                </CTabContent>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        userId: getAuthTokenId(state),
        stockType: getStockType(state),
        lang: getLang(state),
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
